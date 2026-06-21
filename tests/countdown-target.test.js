'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { resolveCountdownTarget } = require('../source/build/utils');

// ── Homepage countdown target resolution (02-§30.14, 30.17, 30.26) ──────────
//
// The countdown counts down to the nearest upcoming camp, but is hidden
// (target === null) while any camp is ongoing so it never counts toward a
// later camp mid-camp (#521), and when no upcoming camp exists.

describe('resolveCountdownTarget (02-§30.14, 30.17, 30.26)', () => {
  const camps = [
    { id: 'june', start_date: '2026-06-21', end_date: '2026-06-28' },
    { id: 'july', start_date: '2026-07-26', end_date: '2026-08-02' },
  ];

  it('CDOWN-01: returns the nearest upcoming camp start when none is ongoing', () => {
    assert.equal(resolveCountdownTarget(camps, '2026-06-15'), '2026-06-21');
  });

  it('CDOWN-02: picks the closest of several upcoming camps', () => {
    assert.equal(resolveCountdownTarget(camps, '2026-07-01'), '2026-07-26');
  });

  it('CDOWN-03: returns null on the first day of an ongoing camp (02-§30.26)', () => {
    assert.equal(resolveCountdownTarget(camps, '2026-06-21'), null);
  });

  it('CDOWN-04: returns null in the middle of an ongoing camp (02-§30.26)', () => {
    assert.equal(resolveCountdownTarget(camps, '2026-06-25'), null);
  });

  it('CDOWN-05: returns null on the last day of an ongoing camp (02-§30.26)', () => {
    assert.equal(resolveCountdownTarget(camps, '2026-06-28'), null);
  });

  it('CDOWN-06: stays hidden while a camp is ongoing even if a later camp exists', () => {
    // June camp is ongoing; the July camp must not be counted toward.
    assert.equal(resolveCountdownTarget(camps, '2026-06-24'), null);
  });

  it('CDOWN-07: resumes counting toward the next camp once the ongoing one ends', () => {
    assert.equal(resolveCountdownTarget(camps, '2026-06-29'), '2026-07-26');
  });

  it('CDOWN-08: returns null when no upcoming camp exists (02-§30.17)', () => {
    assert.equal(resolveCountdownTarget(camps, '2026-09-01'), null);
  });

  it('CDOWN-09: normalises Date objects, not just strings', () => {
    const dateCamps = [
      { id: 'june', start_date: new Date('2026-06-21'), end_date: new Date('2026-06-28') },
    ];
    assert.equal(resolveCountdownTarget(dateCamps, '2026-06-15'), '2026-06-21');
    assert.equal(resolveCountdownTarget(dateCamps, '2026-06-23'), null);
  });
});
