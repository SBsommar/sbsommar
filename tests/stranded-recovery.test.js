'use strict';

// Unit tests for the stranded-auto-merge recovery decision (02-§112.1–112.10) and
// the enqueue-and-verify recovery action (02-§112.2, 112.11). classifyStrandedPr and
// enqueueAndVerify are pure with respect to injected deps, so they are tested here;
// the live GitHub GraphQL wiring in main() (read fields, enqueue, re-read) is a
// manual/integration checkpoint (STRAND-M01).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  classifyStrandedPr,
  withRetry,
  processPr,
  runSweep,
  enqueueAndVerify,
  recoverPr,
  ENQUEUE_MUTATION,
} = require('../source/scripts/recover-stranded-event-prs');

// A silent logger so the test output stays clean.
const quiet = () => {};

// A pull request that GitHub considers fully mergeable but that never reached the
// queue: auto-merge on, checks green (CLEAN), and no queue entry.
const STRANDED = { autoMergeEnabled: true, mergeStateStatus: 'CLEAN', inMergeQueue: false };

describe('classifyStrandedPr — stranded auto-merge recovery (02-§112.1–112.10)', () => {
  it('STRAND-01: add (event/) PR, auto-merge on, CLEAN, no queue entry → recover', () => {
    assert.equal(classifyStrandedPr({ branch: 'event/2026-06-22-x-1', ...STRANDED }), 'recover');
  });

  it('STRAND-02: edit (event-edit/) PR stranded → recover (the #486 case)', () => {
    assert.equal(classifyStrandedPr({ branch: 'event-edit/x-2026-06-22-1115-1', ...STRANDED }), 'recover');
  });

  it('STRAND-03: delete (event-delete/) PR stranded → recover', () => {
    assert.equal(classifyStrandedPr({ branch: 'event-delete/x-1', ...STRANDED }), 'recover');
  });

  it('STRAND-04: already in the merge queue → skip (progressing, 02-§112.4)', () => {
    assert.equal(
      classifyStrandedPr({ branch: 'event/2026-06-22-x-1', autoMergeEnabled: true, mergeStateStatus: 'CLEAN', inMergeQueue: true }),
      'skip',
    );
  });

  it('STRAND-05: mergeStateStatus not CLEAN (BLOCKED/BEHIND/UNSTABLE) → skip (02-§112.5)', () => {
    for (const status of ['BLOCKED', 'BEHIND', 'UNSTABLE', 'DIRTY']) {
      assert.equal(
        classifyStrandedPr({ branch: 'event/2026-06-22-x-1', autoMergeEnabled: true, mergeStateStatus: status, inMergeQueue: false }),
        'skip',
        `status ${status} should skip`,
      );
    }
  });

  it('STRAND-06: required checks still pending (UNKNOWN) → skip (02-§112.5)', () => {
    assert.equal(
      classifyStrandedPr({ branch: 'event/2026-06-22-x-1', autoMergeEnabled: true, mergeStateStatus: 'UNKNOWN', inMergeQueue: false }),
      'skip',
    );
  });

  it('STRAND-07: auto-merge not enabled → skip (nothing to recover)', () => {
    assert.equal(
      classifyStrandedPr({ branch: 'event/2026-06-22-x-1', autoMergeEnabled: false, mergeStateStatus: 'CLEAN', inMergeQueue: false }),
      'skip',
    );
  });

  it('STRAND-08: non-event branch → ignore', () => {
    assert.equal(classifyStrandedPr({ branch: 'fix/something', ...STRANDED }), 'ignore');
    assert.equal(classifyStrandedPr({ branch: 'main', ...STRANDED }), 'ignore');
  });

  it('STRAND-09: missing/garbage input → ignore (no branch)', () => {
    assert.equal(classifyStrandedPr({}), 'ignore');
    assert.equal(classifyStrandedPr(), 'ignore');
    assert.equal(classifyStrandedPr({ branch: null }), 'ignore');
  });

  it('STRAND-10: idempotent — a non-stranded event PR always classifies as skip (02-§112.10)', () => {
    // Re-running recovery on a PR that is already queued or already merging must
    // never re-recover it.
    assert.equal(
      classifyStrandedPr({ branch: 'event/2026-06-22-x-1', autoMergeEnabled: true, mergeStateStatus: 'CLEAN', inMergeQueue: true }),
      'skip',
    );
  });
});

describe('classifyStrandedPr — recover on checks-passed despite laggy mergeable state (02-§112.18)', () => {
  // GitHub takes minutes to recompute mergeStateStatus to CLEAN after checks finish,
  // so recovery keys off the check rollup, not the laggy mergeable state.
  const base = { branch: 'event/2026-06-26-x-1', autoMergeEnabled: true, inMergeQueue: false };

  it('STRAND-20: checks passed, mergeStateStatus still BLOCKED, not queued → recover (the #585 case)', () => {
    assert.equal(
      classifyStrandedPr({ ...base, mergeStateStatus: 'BLOCKED', checksPassed: true }),
      'recover',
    );
  });

  it('STRAND-21: checks passed, mergeStateStatus still UNKNOWN → recover', () => {
    assert.equal(
      classifyStrandedPr({ ...base, mergeStateStatus: 'UNKNOWN', checksPassed: true }),
      'recover',
    );
  });

  it('STRAND-22: checks NOT passed and BLOCKED → skip (genuinely pending/failing, 02-§112.5)', () => {
    assert.equal(
      classifyStrandedPr({ ...base, mergeStateStatus: 'BLOCKED', checksPassed: false }),
      'skip',
    );
  });

  it('STRAND-23: real conflict (DIRTY) is never recovered even with checks passed', () => {
    assert.equal(
      classifyStrandedPr({ ...base, mergeStateStatus: 'DIRTY', checksPassed: true }),
      'skip',
    );
  });

  it('STRAND-24: checks passed but already in the queue → skip (progressing)', () => {
    assert.equal(
      classifyStrandedPr({ ...base, inMergeQueue: true, mergeStateStatus: 'BLOCKED', checksPassed: true }),
      'skip',
    );
  });

  it('STRAND-25: CLEAN still recovers without an explicit rollup (backward compatible)', () => {
    assert.equal(
      classifyStrandedPr({ ...base, mergeStateStatus: 'CLEAN' }),
      'recover',
    );
  });
});

describe('withRetry — enable-step resilience (02-§112.11)', () => {
  it('STRAND-11: returns the result on first success without retrying', () => {
    let calls = 0;
    const result = withRetry(() => { calls += 1; return 'ok'; }, { baseMs: 0 });
    assert.equal(result, 'ok');
    assert.equal(calls, 1);
  });

  it('STRAND-12: retries on throw and succeeds before attempts are exhausted', () => {
    let calls = 0;
    const result = withRetry(() => {
      calls += 1;
      if (calls < 3) throw new Error('transient');
      return 'recovered';
    }, { attempts: 3, baseMs: 0 });
    assert.equal(result, 'recovered');
    assert.equal(calls, 3);
  });

  it('STRAND-13: re-throws the last error once all attempts are exhausted', () => {
    let calls = 0;
    assert.throws(
      () => withRetry(() => { calls += 1; throw new Error(`fail-${calls}`); }, { attempts: 3, baseMs: 0 }),
      /fail-3/,
    );
    assert.equal(calls, 3);
  });
});

describe('enqueueAndVerify — imperative re-queue with confirmation (02-§112.2, 112.11)', () => {
  it('STRAND-26: enqueues once and returns when the merge-queue entry appears', () => {
    const enqueued = [];
    let queued = false;
    enqueueAndVerify('PR_1', {
      enqueueFn: (id) => { enqueued.push(id); queued = true; },
      isQueued: () => queued,
      retryOpts: { baseMs: 0 },
    });
    assert.deepEqual(enqueued, ['PR_1']);
  });

  it('STRAND-27: retries when the queue entry lags, then succeeds', () => {
    let calls = 0;
    let queued = false;
    // GitHub only reflects the merge-queue entry on the second enqueue attempt.
    const enqueueFn = () => { calls += 1; if (calls >= 2) queued = true; };
    enqueueAndVerify('PR_1', { enqueueFn, isQueued: () => queued, retryOpts: { attempts: 3, baseMs: 0 } });
    assert.equal(calls, 2);
  });

  it('STRAND-28: throws after exhausting attempts when no queue entry ever appears (fail-loud)', () => {
    let calls = 0;
    assert.throws(
      () => enqueueAndVerify('PR_1', {
        enqueueFn: () => { calls += 1; },
        isQueued: () => false,
        retryOpts: { attempts: 3, baseMs: 0 },
      }),
      /did not register a merge-queue entry/,
    );
    assert.equal(calls, 3);
  });

  it('STRAND-29: ENQUEUE_MUTATION enqueues and selects mergeQueueEntry, not the auto-merge toggle', () => {
    assert.match(ENQUEUE_MUTATION, /enqueuePullRequest/);
    assert.match(ENQUEUE_MUTATION, /mergeQueueEntry/);
    assert.doesNotMatch(ENQUEUE_MUTATION, /enablePullRequestAutoMerge/);
    assert.doesNotMatch(ENQUEUE_MUTATION, /disablePullRequestAutoMerge/);
  });
});

describe('recoverPr — defense-in-depth: enqueue primary, re-arm fallback (02-§112.2, 112.18)', () => {
  it('STRAND-30: enqueue confirms a queue entry — recovers without the fallback', () => {
    let reArmCalled = false;
    let queued = false;
    recoverPr('PR_1', {
      enqueueFn: () => { queued = true; },
      isQueued: () => queued,
      reArmFn: () => { reArmCalled = true; },
      retryOpts: { baseMs: 0 },
      log: quiet,
    });
    assert.equal(reArmCalled, false);
  });

  it('STRAND-31: enqueue cannot confirm (laggy state) — falls back to re-arming auto-merge', () => {
    let reArmed = null;
    recoverPr('PR_1', {
      enqueueFn: () => {},    // no-op enqueue: a queue entry never appears
      isQueued: () => false,
      reArmFn: (id) => { reArmed = id; },
      retryOpts: { attempts: 2, baseMs: 0 },
      log: quiet,
    });
    assert.equal(reArmed, 'PR_1');
  });

  it('STRAND-32: both enqueue and the fallback re-arm fail — recovery throws (fail-loud)', () => {
    assert.throws(
      () => recoverPr('PR_1', {
        enqueueFn: () => {},
        isQueued: () => false,
        reArmFn: () => { throw new Error('Resource not accessible by integration'); },
        retryOpts: { attempts: 2, baseMs: 0 },
        log: quiet,
      }),
      /Resource not accessible/,
    );
  });
});

describe('processPr — per-PR outcome (02-§112.2, 112.6, 112.13)', () => {
  const strandedState = { nodeId: 'PR_1', ...STRANDED };

  it('STRAND-14: stranded PR is recovered and reported as recovered', () => {
    let recovered = null;
    const outcome = processPr(
      { number: 1, headRefName: 'event-edit/x-2026-06-22-1115-1' },
      { fetchState: () => strandedState, recover: (id) => { recovered = id; }, log: quiet },
    );
    assert.equal(outcome, 'recovered');
    assert.equal(recovered, 'PR_1');
  });

  it('STRAND-15: non-stranded event PR is skipped without re-queuing', () => {
    let recoverCalled = false;
    const outcome = processPr(
      { number: 2, headRefName: 'event/2026-06-22-x-1' },
      {
        fetchState: () => ({ nodeId: 'PR_2', autoMergeEnabled: true, mergeStateStatus: 'CLEAN', inMergeQueue: true }),
        recover: () => { recoverCalled = true; },
        log: quiet,
      },
    );
    assert.equal(outcome, 'skipped');
    assert.equal(recoverCalled, false);
  });

  it('STRAND-16: a fetch failure is caught and reported as failed (02-§112.6)', () => {
    const outcome = processPr(
      { number: 3, headRefName: 'event/2026-06-22-x-1' },
      { fetchState: () => { throw new Error('boom'); }, recover: () => {}, log: quiet },
    );
    assert.equal(outcome, 'failed');
  });

  it('STRAND-17: a recover failure is caught and reported as failed (02-§112.13)', () => {
    const outcome = processPr(
      { number: 4, headRefName: 'event/2026-06-22-x-1' },
      { fetchState: () => strandedState, recover: () => { throw new Error('Resource not accessible by integration'); }, log: quiet },
    );
    assert.equal(outcome, 'failed');
  });
});

describe('runSweep — fail-loud aggregation with isolation (02-§112.6, 112.13)', () => {
  it('STRAND-18: returns 0 when every PR recovers or skips, recovering only the stranded one', () => {
    const recovered = [];
    const deps = {
      fetchState: (n) => (n === 1
        ? { nodeId: 'PR_1', ...STRANDED }
        : { nodeId: `PR_${n}`, autoMergeEnabled: true, mergeStateStatus: 'CLEAN', inMergeQueue: true }),
      recover: (id) => recovered.push(id),
      log: quiet,
    };
    const failures = runSweep(
      [
        { number: 1, headRefName: 'event/a-1' },
        { number: 2, headRefName: 'event/b-1' },
      ],
      deps,
    );
    assert.equal(failures, 0);
    assert.deepEqual(recovered, ['PR_1']);
  });

  it('STRAND-19: a failing PR is counted but does not abort the others (02-§112.6)', () => {
    const recovered = [];
    const deps = {
      fetchState: () => ({ nodeId: 'PR_x', ...STRANDED }),
      // First recover throws, the rest succeed — the sweep must keep going.
      recover: (() => {
        let n = 0;
        return (id) => { n += 1; if (n === 1) throw new Error('denied'); recovered.push(id); };
      })(),
      log: quiet,
    };
    const failures = runSweep(
      [
        { number: 1, headRefName: 'event/a-1' },
        { number: 2, headRefName: 'event/b-1' },
        { number: 3, headRefName: 'event/c-1' },
      ],
      deps,
    );
    assert.equal(failures, 1);
    // The two PRs after the failure were still attempted and recovered.
    assert.equal(recovered.length, 2);
  });
});
