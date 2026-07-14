'use strict';

// Recovers event-submission pull requests that have stranded in the merge-queue
// handoff (02-§112). Runs in event-data-deploy-post-merge.yml after each event
// merge, on check_suite completion, and on a 120-minute backstop schedule in
// merge-queue-recovery.yml.
//
// All pull requests to main merge through a merge queue. The form API enables
// auto-merge (squash) on each event PR; GitHub places it in the queue once its
// required checks pass. When event submissions arrive in a burst and one merges,
// main advances — and a sibling whose auto-merge was enabled against the previous
// tip can be left stranded: auto-merge enabled, checks green (mergeStateStatus
// CLEAN), mergeable, but with no mergeQueueEntry, so it never merges. Re-enabling
// auto-merge is a no-op — GitHub only enqueues a PR at the moment its checks pass,
// and that moment has already gone by. This script detects that exact signature and
// places the PR back in the queue with the imperative enqueuePullRequest mutation
// (the same one the form API uses at submission, 02-§113), then confirms a
// mergeQueueEntry resulted. Enqueuing does not wait for main to advance, so a single
// sweep durably re-queues a stranded PR.

const { execFileSync } = require('node:child_process');

// Event PRs opened by the form API use these head-branch prefixes (add / edit /
// delete). Anything else is out of scope.
const EVENT_PREFIXES = ['event/', 'event-edit/', 'event-delete/'];

function isEventBranch(branch) {
  return typeof branch === 'string' && EVENT_PREFIXES.some((p) => branch.startsWith(p));
}

/**
 * Decide what to do with an event pull request from its observable merge state.
 * Pure and side-effect free so it can be unit-tested.
 *
 *   branch            – head ref name
 *   autoMergeEnabled  – true when auto-merge is enabled on the PR
 *   mergeStateStatus  – GitHub mergeStateStatus enum (CLEAN, BLOCKED, BEHIND,
 *                       UNSTABLE, DIRTY, DRAFT, HAS_HOOKS, UNKNOWN)
 *   inMergeQueue      – true when the PR has a mergeQueueEntry
 *   checksPassed      – true when the head commit's status-check rollup is SUCCESS
 *
 * Recovery keys off the check rollup, not mergeStateStatus, because GitHub takes
 * minutes to recompute mergeStateStatus to CLEAN after checks finish and fires no
 * further check-suite event in that window (02-§112.18). So a checks-passed PR that
 * is not queued is treated as stranded even while mergeStateStatus still reads
 * BLOCKED/UNKNOWN. A real conflict (DIRTY) is left alone — re-queuing cannot
 * resolve it.
 *
 * Returns:
 *   'ignore'  – not an event-submission PR
 *   'recover' – stranded: auto-merge on, not in the queue, and mergeable (CLEAN) or
 *               checks-passed while the mergeable state is still catching up
 *   'skip'    – event PR that is not stranded (queued, checks pending/failing,
 *               conflicting, or auto-merge off)
 */
function classifyStrandedPr({ branch, autoMergeEnabled, mergeStateStatus, inMergeQueue, checksPassed } = {}) {
  if (!isEventBranch(branch)) return 'ignore';
  if (!autoMergeEnabled) return 'skip';      // nothing to recover
  if (inMergeQueue) return 'skip';           // already progressing through the queue
  if (mergeStateStatus === 'CLEAN') return 'recover'; // GitHub already considers it mergeable
  // Checks are green but the mergeable state has not converged yet (02-§112.18).
  if (checksPassed && (mergeStateStatus === 'BLOCKED' || mergeStateStatus === 'UNKNOWN')) return 'recover';
  return 'skip'; // checks pending/failing, conflicting, or otherwise not eligible
}

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' });
}

// Synchronous sleep without extra dependencies (CI runs are single-threaded here).
function sleepSync(ms) {
  if (ms > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Run `fn`, retrying on throw with exponential backoff. Pure with respect to
 * `fn`, so it is unit-tested with a synchronous stub and baseMs 0.
 * Returns `fn`'s value, or re-throws the last error once attempts are exhausted.
 */
function withRetry(fn, { attempts = 3, baseMs = 1000 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) sleepSync(baseMs * 2 ** i);
    }
  }
  throw lastErr;
}

// Read the merge state of one PR via GraphQL. Separated from main() so the network
// shell stays thin; classifyStrandedPr does the deciding.
function fetchPrState(owner, repo, number) {
  const query = `
    query($owner:String!,$repo:String!,$num:Int!){
      repository(owner:$owner,name:$repo){
        pullRequest(number:$num){
          id
          autoMergeRequest { enabledAt }
          mergeStateStatus
          mergeQueueEntry { id }
          commits(last:1){ nodes { commit { statusCheckRollup { state } } } }
        }
      }
    }`;
  const out = gh([
    'api', 'graphql',
    '-f', `query=${query}`,
    '-f', `owner=${owner}`,
    '-f', `repo=${repo}`,
    '-F', `num=${number}`,
  ]);
  const pr = JSON.parse(out).data.repository.pullRequest;
  const rollup = pr.commits?.nodes?.[0]?.commit?.statusCheckRollup?.state;
  return {
    nodeId: pr.id,
    autoMergeEnabled: pr.autoMergeRequest != null,
    mergeStateStatus: pr.mergeStateStatus,
    inMergeQueue: pr.mergeQueueEntry != null,
    checksPassed: rollup === 'SUCCESS',
  };
}

// The imperative enqueue mutation: it places a pull request directly in the merge
// queue, unlike auto-merge, which only enqueues at the checks-pass edge. Mirrors
// buildEnqueueMutation() in source/api/github.js so submission and recovery use the
// same call (02-§112.2, §113.1); STRAND-29 pins the shape.
const ENQUEUE_MUTATION =
  'mutation($id:ID!){enqueuePullRequest(input:{pullRequestId:$id}){mergeQueueEntry{id}}}';

function enqueue(nodeId) {
  gh(['api', 'graphql', '-f', `query=${ENQUEUE_MUTATION}`, '-f', `id=${nodeId}`]);
}

// Recover a stranded PR by placing it back in the merge queue and confirming a
// queue entry resulted. Auto-merge is left enabled throughout (never disabled), so a
// failed enqueue never leaves the PR worse off than stranded (02-§112.3, §112.11).
//
// The enqueue-and-verify is wrapped in withRetry: after enqueuing, it re-reads the
// PR and, if no mergeQueueEntry appeared yet (GitHub can lag), throws so the step is
// retried with backoff. Each attempt checks the queue first, so a prior attempt that
// took effect after a lag is recognised instead of enqueuing an already-queued PR.
// enqueueFn/isQueued/retryOpts are injectable so the outcome logic is unit-testable.
function enqueueAndVerify(nodeId, { enqueueFn = enqueue, isQueued, retryOpts } = {}) {
  withRetry(() => {
    if (isQueued()) return; // already in the queue (e.g. a prior attempt took effect)
    enqueueFn(nodeId);
    if (!isQueued()) {
      throw new Error(`enqueue did not register a merge-queue entry for ${nodeId}`);
    }
  }, retryOpts);
}

/**
 * Process one event pull request: read its state, classify it, and recover it if
 * stranded. Side effects (network reads, auto-merge toggles) are injected via
 * `fetchState`/`recover` so the outcome logic is unit-testable.
 *
 *   pr.number, pr.headRefName – the open pull request to consider
 *   fetchState(number)        – returns { nodeId, autoMergeEnabled, mergeStateStatus, inMergeQueue }
 *   recover(nodeId, number)   – places the PR back in the queue and verifies it
 *
 * Per-PR errors are caught here so one bad fetch or mutation does not abort the
 * sweep (02-§112.6). Returns one of: 'recovered', 'skipped', 'ignored', 'failed'.
 */
function processPr(pr, { fetchState, recover, log = console.log }) {
  try {
    const state = fetchState(pr.number);
    const verdict = classifyStrandedPr({ branch: pr.headRefName, ...state });

    if (verdict === 'recover') {
      log(`Recovering stranded PR #${pr.number} (${pr.headRefName}) — auto-merge on, CLEAN, no queue entry; re-queuing`);
      recover(state.nodeId, pr.number);
      return 'recovered';
    }
    log(`Skipping PR #${pr.number} (${pr.headRefName}) — ${verdict} (mergeStateStatus=${state.mergeStateStatus}, inQueue=${state.inMergeQueue}, autoMerge=${state.autoMergeEnabled})`);
    return verdict === 'ignore' ? 'ignored' : 'skipped';
  } catch (err) {
    log(`::warning::Could not process event PR #${pr.number} (${pr.headRefName}): ${err.message}`);
    return 'failed';
  }
}

/**
 * Run `processPr` over every event pull request and return how many failed. Pure
 * with respect to the injected deps, so the fail-loud count is unit-testable. The
 * loop never short-circuits: a failure is counted and the remaining pull requests
 * are still attempted (02-§112.6).
 */
function runSweep(eventPrs, deps) {
  let failures = 0;
  for (const pr of eventPrs) {
    if (processPr(pr, deps) === 'failed') failures += 1;
  }
  return failures;
}

function main() {
  const repoSlug = process.env.GH_REPO || process.env.GITHUB_REPOSITORY || '';
  const [owner, repo] = repoSlug.split('/');
  if (!owner || !repo) {
    throw new Error('GH_REPO/GITHUB_REPOSITORY must be set to "owner/repo"');
  }
  const repoArgs = ['--repo', repoSlug];

  const prs = JSON.parse(
    gh(['pr', 'list', ...repoArgs, '--state', 'open', '--limit', '100', '--json', 'number,headRefName']),
  );

  // Cheap exit when there are no open event PRs (02-§112.9).
  const eventPrs = prs.filter((pr) => isEventBranch(pr.headRefName));
  if (eventPrs.length === 0) {
    console.log('No open event pull requests — nothing to recover');
    return;
  }

  const failures = runSweep(eventPrs, {
    fetchState: (number) => fetchPrState(owner, repo, number),
    // Enqueue the PR, then re-read it to confirm a merge-queue entry resulted.
    recover: (nodeId, number) => enqueueAndVerify(nodeId, {
      isQueued: () => fetchPrState(owner, repo, number).inMergeQueue,
    }),
  });

  // Fail the job loudly when any stranded PR could not be recovered, rather than
  // passing as a green run with only a warning (02-§112.13).
  if (failures > 0) {
    throw new Error(`${failures} event pull request(s) could not be recovered`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('recover-stranded-event-prs failed:', err.message);
    process.exit(1);
  }
}

module.exports = {
  classifyStrandedPr, withRetry, processPr, runSweep, enqueueAndVerify, ENQUEUE_MUTATION,
};
