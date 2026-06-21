'use strict';

// Unit tests for the stranded-auto-merge recovery decision (02-§112.1–112.10).
// classifyStrandedPr is pure, so its full decision table is tested here; the
// GitHub GraphQL wiring in the script's main() (read fields, disable→enable
// auto-merge) is a manual/integration checkpoint (STRAND-M01).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  classifyStrandedPr,
  withRetry,
  processPr,
  runSweep,
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
    // never re-toggle it.
    assert.equal(
      classifyStrandedPr({ branch: 'event/2026-06-22-x-1', autoMergeEnabled: true, mergeStateStatus: 'CLEAN', inMergeQueue: true }),
      'skip',
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

  it('STRAND-15: non-stranded event PR is skipped without toggling auto-merge', () => {
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
