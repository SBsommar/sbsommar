'use strict';

// Recovers event-submission pull requests that have stranded in the merge-queue
// handoff (02-§112). Runs in event-data-deploy-post-merge.yml after each event
// merge, and on a 15-minute schedule in merge-queue-recovery.yml.
//
// All pull requests to main merge through a merge queue. The form API enables
// auto-merge (squash) on each event PR; GitHub places it in the queue once its
// required checks pass. When event submissions arrive in a burst and one merges,
// main advances — and a sibling whose auto-merge was enabled against the previous
// tip can be left stranded: auto-merge enabled, checks green (mergeStateStatus
// CLEAN), mergeable, but with no mergeQueueEntry, so it never merges. Re-enabling
// auto-merge is a no-op; only disabling and re-enabling it registers a fresh queue
// entry against the current main. This script detects that exact signature and
// toggles auto-merge off then on to recover the PR.

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
 *
 * Returns:
 *   'ignore'  – not an event-submission PR
 *   'recover' – stranded: auto-merge on, CLEAN, and not in the queue
 *   'skip'    – event PR that is not stranded (queued, not CLEAN, or auto-merge off)
 */
function classifyStrandedPr({ branch, autoMergeEnabled, mergeStateStatus, inMergeQueue } = {}) {
  if (!isEventBranch(branch)) return 'ignore';
  if (!autoMergeEnabled) return 'skip';      // nothing to recover
  if (inMergeQueue) return 'skip';           // already progressing through the queue
  if (mergeStateStatus !== 'CLEAN') return 'skip'; // checks pending/failing or not mergeable
  return 'recover';
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
  return {
    nodeId: pr.id,
    autoMergeEnabled: pr.autoMergeRequest != null,
    mergeStateStatus: pr.mergeStateStatus,
    inMergeQueue: pr.mergeQueueEntry != null,
  };
}

// Disable then re-enable auto-merge (squash) to register a fresh queue entry.
// Disable runs once: if it fails the PR is left untouched (auto-merge still on)
// and the next sweep retries the whole recovery. Enable is retried, because once
// disable has succeeded a transient enable failure would otherwise leave the PR
// with auto-merge off — worse than stranded (02-§112.11).
function recoverPr(nodeId) {
  gh([
    'api', 'graphql',
    '-f', 'query=mutation($id:ID!){disablePullRequestAutoMerge(input:{pullRequestId:$id}){pullRequest{number}}}',
    '-f', `id=${nodeId}`,
  ]);
  withRetry(() => gh([
    'api', 'graphql',
    '-f', 'query=mutation($id:ID!){enablePullRequestAutoMerge(input:{pullRequestId:$id,mergeMethod:SQUASH}){pullRequest{number}}}',
    '-f', `id=${nodeId}`,
  ]));
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

  for (const pr of eventPrs) {
    // Isolate per-PR failures so one bad fetch/mutation does not abort the sweep
    // (02-§112.6).
    try {
      const state = fetchPrState(owner, repo, pr.number);
      const verdict = classifyStrandedPr({ branch: pr.headRefName, ...state });

      if (verdict === 'recover') {
        console.log(`Recovering stranded PR #${pr.number} (${pr.headRefName}) — auto-merge on, CLEAN, no queue entry; toggling auto-merge`);
        recoverPr(state.nodeId);
      } else {
        console.log(`Skipping PR #${pr.number} (${pr.headRefName}) — ${verdict} (mergeStateStatus=${state.mergeStateStatus}, inQueue=${state.inMergeQueue}, autoMerge=${state.autoMergeEnabled})`);
      }
    } catch (err) {
      console.log(`::warning::Could not process event PR #${pr.number} (${pr.headRefName}): ${err.message}`);
    }
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

module.exports = { classifyStrandedPr, withRetry };
