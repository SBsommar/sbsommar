'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  renderEventRow,
  renderSchedulePage,
  eventExtraHtml,
  groupAndSortEvents,
  renderDaySection,
} = require('../source/build/render');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = { name: 'SB sommar 2099', location: 'Sysslebäck', start_date: '2099-07-01', end_date: '2099-07-07' };

function event(overrides = {}) {
  return {
    id: 'e1', title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00',
    location: 'Servicehus', responsible: 'Anna', description: null, link: null,
    ...overrides,
  };
}

// ── 02-§5.3  owner and meta fields never shown ─────────────────────────────

describe('02-§5.3 — owner and meta fields excluded from public view', () => {
  it('RDC-01: renderEventRow does not include owner in output', () => {
    const e = event({ owner: { name: 'Admin', email: 'admin@test.se' } });
    const html = renderEventRow(e);
    assert.ok(!html.includes('Admin'), 'owner name not in output');
    assert.ok(!html.includes('admin@test.se'), 'owner email not in output');
  });

  it('RDC-02: renderEventRow does not include meta in output', () => {
    const e = event({ meta: { created_at: '2099-01-01T00:00:00Z', updated_at: '2099-01-01T00:00:00Z' } });
    const html = renderEventRow(e);
    assert.ok(!html.includes('created_at'), 'created_at not in output');
    assert.ok(!html.includes('updated_at'), 'updated_at not in output');
  });

  it('RDC-03: eventExtraHtml does not include owner', () => {
    const e = event({ description: 'Fun activity', owner: { name: 'Secret' } });
    const html = eventExtraHtml(e);
    assert.ok(!html.includes('Secret'), 'owner not in extras');
  });

  it('RDC-04: schedule page does not leak owner or meta fields', () => {
    const events = [event({ owner: { name: 'HiddenOwner' }, meta: { created_at: '2099-01-01' } })];
    const html = renderSchedulePage(CAMP, events);
    assert.ok(!html.includes('HiddenOwner'), 'owner not in full page');
    assert.ok(!html.includes('created_at'), 'meta not in full page');
  });
});

// ── 02-§4.8  Overlapping activities allowed ─────────────────────────────────

describe('02-§4.8 — Overlapping activities allowed', () => {
  it('RDC-05: two overlapping events both rendered', () => {
    const events = [
      event({ id: 'e1', title: 'Workshop', start: '10:00', end: '12:00' }),
      event({ id: 'e2', title: 'Simning', start: '11:00', end: '13:00' }),
    ];
    const html = renderSchedulePage(CAMP, events);
    assert.ok(html.includes('Workshop'), 'first event rendered');
    assert.ok(html.includes('Simning'), 'second event rendered');
  });

  it('RDC-06: overlapping events are sorted by start time, not rejected', () => {
    const events = [
      event({ id: 'e1', title: 'Later', start: '11:00', end: '13:00' }),
      event({ id: 'e2', title: 'Earlier', start: '10:00', end: '12:00' }),
    ];
    const { byDate } = groupAndSortEvents(events);
    const day = byDate['2099-07-01'];
    assert.strictEqual(day[0].title, 'Earlier', 'earlier start first');
    assert.strictEqual(day[1].title, 'Later', 'later start second');
  });
});

// ── Schedule page structure ─────────────────────────────────────────────────

describe('Schedule page — structural checks', () => {
  it('RDC-07: has nav with Schema active', () => {
    const html = renderSchedulePage(CAMP, [event()]);
    assert.ok(html.includes('class="nav-link active" href="schema.html"'), 'Schema active');
  });

  it('RDC-08: has noindex meta', () => {
    const html = renderSchedulePage(CAMP, [event()]);
    assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'), 'noindex');
  });

  it('RDC-09: loads session.js for edit link injection', () => {
    const html = renderSchedulePage(CAMP, [event()]);
    assert.ok(html.includes('src="session.js"'), 'session.js loaded');
  });

  it('RDC-10: intro text in Swedish', () => {
    const html = renderSchedulePage(CAMP, [event()]);
    assert.ok(html.includes('klickar på en aktivitets rubrik'), 'Swedish intro');
  });

  it('RDC-22: loads schema-status.js for time-status marking (02-§116.4)', () => {
    const html = renderSchedulePage(CAMP, [event()]);
    assert.ok(html.includes('src="schema-status.js"'), 'schema-status.js loaded');
  });
});

// ── renderDaySection ────────────────────────────────────────────────────────

describe('renderDaySection — day rendering', () => {
  it('RDC-11: day section is a <details class="day"> with open attribute', () => {
    const html = renderDaySection('2099-07-01', [event()]);
    assert.ok(html.includes('<details class="day"'), 'day details');
    assert.ok(html.includes('open>'), 'open by default');
  });

  it('RDC-12: day section uses date as id', () => {
    const html = renderDaySection('2099-07-01', [event()]);
    assert.ok(html.includes('id="2099-07-01"'), 'date as id');
  });

  it('RDC-13: summary contains formatted Swedish date', () => {
    const html = renderDaySection('2099-07-01', [event()]);
    assert.ok(html.includes('<summary>'), 'has summary');
    assert.ok(html.includes('juli'), 'Swedish month name');
  });
});

// ── event data-event-date attribute ─────────────────────────────────────────

describe('renderEventRow — data attributes', () => {
  it('RDC-14: event row has data-event-date attribute', () => {
    const html = renderEventRow(event());
    assert.ok(html.includes('data-event-date="2099-07-01"'), 'date attribute present');
  });

  it('RDC-15: event row without id has no data-event-id', () => {
    const html = renderEventRow(event({ id: null }));
    assert.ok(!html.includes('data-event-id'), 'no id attribute when null');
  });
});

// ── Empty event list handling ───────────────────────────────────────────────

describe('Schedule page — empty events', () => {
  it('RDC-16: renders without error when no events', () => {
    const html = renderSchedulePage(CAMP, []);
    assert.ok(html.includes('<!DOCTYPE html>'), 'valid HTML');
    assert.ok(html.includes('Schema'), 'Schema in title');
  });
});
