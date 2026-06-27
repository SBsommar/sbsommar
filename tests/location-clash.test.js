'use strict';

// Tests for the location-clash marking (02-§120): when two activities are booked
// into the same real room at overlapping times, the one created later is flagged
// (`_clash`) so the schedule can mark it in the reserved conflict red. The
// catch-all "Annat" / "[annat]" location never clashes.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { markLocationClashes, isRealLocation, isIgnoredActivity } = require('../source/build/clashes');
const { renderEventRow } = require('../source/build/render');

function ev(id, location, start, end, created, extra) {
  return Object.assign({
    id, title: id, date: '2026-06-27', start, end, location,
    responsible: 'R', meta: { created_at: created },
  }, extra || {});
}

describe('markLocationClashes (02-§120)', () => {
  it('CLASH-01: marks the later-created event, not the earlier one', () => {
    const evs = [ev('A', 'Sal', '14:00', '16:00', '2026-06-01 10:00'), ev('B', 'Sal', '15:00', '17:00', '2026-06-02 10:00')];
    markLocationClashes(evs);
    assert.equal(evs[0]._clash, undefined);
    assert.equal(evs[1]._clash, true);
  });

  it('CLASH-02: order in the array does not matter — the later booking is marked', () => {
    const evs = [ev('B', 'Sal', '15:00', '17:00', '2026-06-02 10:00'), ev('A', 'Sal', '14:00', '16:00', '2026-06-01 10:00')];
    markLocationClashes(evs);
    assert.equal(evs[0]._clash, true);   // B, created later
    assert.equal(evs[1]._clash, undefined);
  });

  it('CLASH-03: "Annat" and "[annat]" never clash', () => {
    const evs = [
      ev('C', '[annat]', '14:00', '16:00', '2026-06-01 10:00'),
      ev('D', '[annat]', '15:00', '17:00', '2026-06-02 10:00'),
      ev('E', 'Annat', '15:00', '17:00', '2026-06-03 10:00'),
    ];
    markLocationClashes(evs);
    assert.ok(!evs.some((e) => e._clash));
  });

  it('CLASH-04: different rooms do not clash', () => {
    const evs = [ev('F', 'Sal', '14:00', '16:00', '2026-06-01 10:00'), ev('G', 'Tält', '15:00', '17:00', '2026-06-02 10:00')];
    markLocationClashes(evs);
    assert.ok(!evs.some((e) => e._clash));
  });

  it('CLASH-05: different dates do not clash', () => {
    const evs = [ev('H', 'Sal', '14:00', '16:00', '2026-06-01 10:00'), Object.assign(ev('I', 'Sal', '15:00', '17:00', '2026-06-02 10:00'), { date: '2026-06-28' })];
    markLocationClashes(evs);
    assert.ok(!evs.some((e) => e._clash));
  });

  it('CLASH-06: a cancelled event neither clashes nor is marked', () => {
    const evs = [ev('J', 'Sal', '14:00', '16:00', '2026-06-01 10:00', { cancelled: true }), ev('K', 'Sal', '15:00', '17:00', '2026-06-02 10:00')];
    markLocationClashes(evs);
    assert.equal(evs[1]._clash, undefined);
  });

  it('CLASH-07: back-to-back bookings are not a clash', () => {
    const evs = [ev('L', 'Sal', '14:00', '16:00', '2026-06-01 10:00'), ev('M', 'Sal', '16:00', '18:00', '2026-06-02 10:00')];
    markLocationClashes(evs);
    assert.ok(!evs.some((e) => e._clash));
  });

  it('CLASH-08: with three overlapping bookings, the two later ones are marked', () => {
    const evs = [
      ev('A', 'Sal', '14:00', '17:00', '2026-06-01 10:00'),
      ev('B', 'Sal', '15:00', '16:00', '2026-06-02 10:00'),
      ev('C', 'Sal', '15:30', '16:30', '2026-06-03 10:00'),
    ];
    markLocationClashes(evs);
    assert.equal(evs[0]._clash, undefined);
    assert.equal(evs[1]._clash, true);
    assert.equal(evs[2]._clash, true);
  });

  it('CLASH-12: a Date-object created_at orders correctly against a string one', () => {
    // Mirrors real data: a seed event whose created_at YAML-parsed into a Date
    // object, overlapping a later event whose created_at stayed a string. They
    // must be compared by time, not as raw text ("Fri Feb 27 …" vs "2026-06-…").
    const seed = ev('Pyssel', 'Servicehus', '17:00', '18:00', new Date('2026-02-27T09:12:59Z'));
    const late = ev('Möte', 'Servicehus', '17:00', '18:00', '2026-06-27 00:40');
    markLocationClashes([seed, late]);
    assert.equal(seed._clash, undefined); // created first (Feb) — not flagged
    assert.equal(late._clash, true);      // created later (Jun) — flagged
  });

  it('CLASH-13: Lunch and Middag are never flagged, even when booked later', () => {
    const seed = ev('Workshop', 'Servicehus', '17:00', '18:00', '2026-06-01 10:00');
    const meal = ev('Middag', 'Servicehus', '17:00', '18:00', '2026-06-27 00:40');
    markLocationClashes([seed, meal]);
    assert.equal(meal._clash, undefined);
  });

  it('CLASH-14: a meal never causes another activity to be flagged', () => {
    const meal = ev('Lunch', 'Servicehus', '12:00', '13:00', '2026-02-27 09:00');
    const later = ev('Möte', 'Servicehus', '12:00', '13:00', '2026-06-27 09:00');
    markLocationClashes([meal, later]);
    assert.equal(later._clash, undefined); // only the (ignored) meal overlaps it
  });

  it('CLASH-15: meal titles are matched case-insensitively', () => {
    assert.equal(isIgnoredActivity({ title: '  MIDDAG ' }), true);
    assert.equal(isIgnoredActivity({ title: 'lunch' }), true);
    assert.equal(isIgnoredActivity({ title: 'Middag & dans' }), false);
    assert.equal(isIgnoredActivity({ title: 'Workshop' }), false);
  });

  it('CLASH-09: isRealLocation rejects annat variants and empty, accepts real rooms', () => {
    assert.equal(isRealLocation('Annat'), false);
    assert.equal(isRealLocation('[annat]'), false);
    assert.equal(isRealLocation('  annat '), false);
    assert.equal(isRealLocation(''), false);
    assert.equal(isRealLocation('Samlingssalen'), true);
  });
});

describe('renderEventRow – clash markup (02-§120)', () => {
  it('CLASH-10: a flagged event gets the is-clash class', () => {
    const html = renderEventRow(ev('B', 'Sal', '15:00', '17:00', '2026-06-02 10:00', { _clash: true }));
    assert.ok(html.includes('is-clash'));
  });

  it('CLASH-11: an unflagged event has no is-clash class', () => {
    const html = renderEventRow(ev('A', 'Sal', '14:00', '16:00', '2026-06-01 10:00'));
    assert.ok(!html.includes('is-clash'));
  });
});
