'use strict';

// Unit tests for the stranded-auto-merge recovery decision (02-§112.1–112.10).
// classifyStrandedPr is pure, so its full decision table is tested here; the
// GitHub GraphQL wiring in the script's main() (read fields, disable→enable
// auto-merge) is a manual/integration checkpoint (STRAND-M01).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { classifyStrandedPr } = require('../source/scripts/recover-stranded-event-prs');

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
