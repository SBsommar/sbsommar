'use strict';

// Tests for 02-§122 — Edit Duplicate Hardening.
//
// Two mechanisms keep repeated or concurrent edits of one activity from leaving
// a stuck or redundant pull request:
//   1. No-op guard: an edit that changes nothing but meta.updated_at opens no PR.
//   2. One open edit PR per activity: the branch is deterministic
//      (event-edit/<id>), so a further edit reuses the open PR and accumulates
//      onto its content instead of opening a rival from a stale base.
//
// The no-op comparison (fragmentEqualsIgnoringUpdatedAt) is a pure function and
// is unit-tested directly. The orchestration lives in the network-touching edit
// flow (github.js / GitHub.php), which cannot run in Node tests, so — as with
// dedup-submission.test.js — those are source-code structural checks that pin
// the branch naming and call ordering. Live behaviour is a manual checkpoint:
//   DEDUPE-M01 (02-§122.2): edit an activity, then immediately re-apply the same
//     edit → the API answers success and no second PR appears.
//   DEDUPE-M02 (02-§122.5): make two different quick edits before the first
//     merges → one PR carries both changes; there is never a second open edit PR.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { fragmentEqualsIgnoringUpdatedAt } = require('../source/api/github');

const root = (...p) => path.join(__dirname, '..', ...p);
const read = (...p) => fs.readFileSync(root(...p), 'utf8');
const GH_JS = read('source', 'api', 'github.js');
const GH_PHP = read('api', 'src', 'GitHub.php');

// Slice out one function/method body so ordering checks are scoped to it.
function slice(src, startNeedle, endNeedle) {
  const start = src.indexOf(startNeedle);
  assert.ok(start >= 0, `expected to find "${startNeedle}"`);
  const end = endNeedle ? src.indexOf(endNeedle, start + startNeedle.length) : src.length;
  return src.slice(start, end > start ? end : src.length);
}

function frag(overrides = {}) {
  const e = Object.assign({
    title: 'Foo', cancelled: false, updated: '2026-08-01 09:00',
  }, overrides);
  return `event:
  id: foo-2026-08-01-1300
  title: ${e.title}
  cancelled: ${e.cancelled}
  meta:
    created_at: 2026-08-01 09:00
    updated_at: ${e.updated}
`;
}

// ── Pure no-op comparison (02-§122.1, §122.2) ────────────────────────────────

describe('02-§122.1 — fragmentEqualsIgnoringUpdatedAt (DEDUPE-01..03)', () => {
  it('DEDUPE-01: two fragments differing only in updated_at are equal', () => {
    assert.equal(
      fragmentEqualsIgnoringUpdatedAt(frag({ updated: '2026-08-01 09:00' }), frag({ updated: '2026-08-01 12:34' })),
      true,
    );
  });

  it('DEDUPE-02: fragments differing in a real field are not equal', () => {
    assert.equal(
      fragmentEqualsIgnoringUpdatedAt(frag({ title: 'Foo' }), frag({ title: 'Bar', updated: '2026-08-01 12:00' })),
      false,
    );
  });

  it('DEDUPE-03: a flipped cancelled flag is not a no-op', () => {
    assert.equal(
      fragmentEqualsIgnoringUpdatedAt(frag({ cancelled: false }), frag({ cancelled: true, updated: '2026-08-01 12:00' })),
      false,
    );
  });
});

// ── github.js orchestration (02-§122.2, §122.4–§122.7) ───────────────────────

describe('02-§122 — github.js updateEventInActiveCamp (DEDUPE-04..09)', () => {
  const body = slice(GH_JS, 'async function updateEventInActiveCamp', 'async function removeEventFromActiveCamp');

  it('DEDUPE-04: the edit branch is deterministic per event (no Date.now suffix)', () => {
    assert.ok(body.includes('`event-edit/${eventId}`'), 'stable branch name event-edit/<id>');
    assert.ok(!/event-edit\/\$\{eventId\}-/.test(body), 'no timestamped edit branch');
    assert.ok(!body.includes('Date.now()'), 'no Date.now() in the edit flow');
  });

  it('DEDUPE-05: it looks for an already-open edit PR before creating one', () => {
    const findIdx = body.indexOf('findOpenPrForBranch');
    const createIdx = body.indexOf('createPullRequest');
    assert.ok(findIdx > 0, 'must call findOpenPrForBranch');
    assert.ok(createIdx > 0, 'must call createPullRequest');
    assert.ok(findIdx < createIdx, 'open-PR lookup runs before creating a PR');
  });

  it('DEDUPE-06: a no-op edit returns before creating a branch or PR', () => {
    const noopIdx = body.indexOf('fragmentEqualsIgnoringUpdatedAt');
    const branchIdx = body.indexOf('createBranch');
    const createIdx = body.indexOf('createPullRequest');
    assert.ok(noopIdx > 0, 'must use the no-op comparison');
    assert.ok(noopIdx < branchIdx && noopIdx < createIdx, 'no-op check precedes branch/PR creation');
  });

  it('DEDUPE-07: the accumulate path reads the fragment from the open PR branch', () => {
    assert.ok(body.includes('getFileMaybe(fragPath, branchName)'), 'reads branch content to accumulate');
  });

  it('DEDUPE-08: a stale merged branch is reset onto main, not treated as open', () => {
    assert.ok(body.includes('getRefMaybe'), 'checks for a lingering branch');
    assert.ok(body.includes('updateRef'), 'resets the lingering branch onto main');
  });
});

// ── PHP parity (02-§122.8) ───────────────────────────────────────────────────

describe('02-§122.8 — GitHub.php parity (DEDUPE-10..13)', () => {
  const body = slice(GH_PHP, 'function updateEventInActiveCamp', 'function removeEventFromActiveCamp');

  it('DEDUPE-10: PHP edit branch is deterministic per event', () => {
    assert.ok(body.includes('"event-edit/{$eventId}"'), 'stable branch name');
    assert.ok(!/event-edit\/\{\$eventId\}-/.test(body), 'no timestamped edit branch');
    assert.ok(!body.includes('time()'), 'no time() suffix in the edit flow');
  });

  it('DEDUPE-11: PHP looks for an open edit PR before creating one', () => {
    const findIdx = body.indexOf('findOpenPrForBranch');
    const createIdx = body.indexOf('createPullRequest');
    assert.ok(findIdx > 0 && findIdx < createIdx, 'open-PR lookup before createPullRequest');
  });

  it('DEDUPE-12: PHP no-op check precedes branch/PR creation', () => {
    const noopIdx = body.indexOf('fragmentEqualsIgnoringUpdatedAt');
    const branchIdx = body.indexOf('createBranch');
    assert.ok(noopIdx > 0 && noopIdx < branchIdx, 'no-op check precedes createBranch');
  });

  it('DEDUPE-13: PHP resets a stale edit branch onto main', () => {
    assert.ok(body.includes('getRefMaybe'), 'checks for a lingering branch');
    assert.ok(body.includes('updateRef'), 'resets the lingering branch');
  });
});
