'use strict';

// Tests for 02-§118 — Cancelled Activities.
// A cancelled activity (`cancelled: true`) stays in every view, shown with an
// "INSTÄLLD" prefix and struck-through terracotta text, and is marked in the
// RSS and iCal feeds. The optional boolean is validated and round-trips through
// the event data. Browser-only behaviour (the edit-form button label toggle,
// the live DOM appearance) is covered by manual checkpoints in the traceability
// matrix.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { renderEventRow } = require('../source/build/render');
const { renderEventPage } = require('../source/build/render-event');
const { renderRssFeed } = require('../source/build/render-rss');
const { renderEventIcal, renderIcalFeed } = require('../source/build/render-ical');
const { renderIdagPage } = require('../source/build/render-idag');
const { validateEventObject } = require('../source/scripts/lint-yaml');

const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

const camp = {
  id: '2026-06-syssleback',
  name: 'SB Sommar Juni 2026',
  location: 'Sysslebäck',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};
const siteUrl = 'https://sommar.digitalasynctransparency.com';

function baseEvent(overrides = {}) {
  return Object.assign({
    id: 'schack-2026-06-29-1400',
    title: 'Schack',
    date: '2026-06-29',
    start: '14:00',
    end: '16:00',
    location: 'Samlingssalen',
    responsible: 'Anna',
    description: null,
    link: null,
  }, overrides);
}

// ── Weekly schedule rows (render.js) ─────────────────────────────────────────

describe('02-§118.6/.7/.10 — renderEventRow cancelled state', () => {
  it('RND-CANCEL-01: a cancelled plain row is still rendered (kept in schedule)', () => {
    const html = renderEventRow(baseEvent({ cancelled: true }));
    assert.match(html, /event-row/, 'row still emitted');
    assert.match(html, /Schack/, 'title still present');
  });

  it('RND-CANCEL-02: a cancelled row carries the is-cancelled class and an INSTÄLLD label', () => {
    const html = renderEventRow(baseEvent({ cancelled: true }));
    assert.match(html, /class="event-row[^"]*\bis-cancelled\b/, 'is-cancelled class on row');
    assert.match(html, /<span class="ev-cancelled-label">INSTÄLLD<\/span>/, 'INSTÄLLD label in title');
  });

  it('RND-CANCEL-03: a cancelled details row (with extra) also marked', () => {
    const html = renderEventRow(baseEvent({ cancelled: true, description: 'Öppet parti.' }));
    assert.match(html, /<details class="event-row[^"]*\bis-cancelled\b/, 'is-cancelled on details row');
    assert.match(html, /INSTÄLLD/, 'INSTÄLLD label present');
  });

  it('RND-CANCEL-04: an active event has no cancelled markers', () => {
    const html = renderEventRow(baseEvent());
    assert.ok(!/is-cancelled/.test(html), 'no is-cancelled class');
    assert.ok(!/INSTÄLLD/.test(html), 'no INSTÄLLD label');
  });

  it('RND-CANCEL-05: cancelled:false behaves like an active event', () => {
    const html = renderEventRow(baseEvent({ cancelled: false }));
    assert.ok(!/is-cancelled/.test(html), 'no is-cancelled class for cancelled:false');
  });
});

// ── Per-event page (render-event.js) ─────────────────────────────────────────

describe('02-§118.6/.7 — renderEventPage cancelled state', () => {
  it('REV-CANCEL-01: cancelled per-event page keeps the activity and marks it', () => {
    const html = renderEventPage(baseEvent({ cancelled: true }), camp, siteUrl);
    assert.match(html, /INSTÄLLD/, 'INSTÄLLD shown on page');
    assert.match(html, /is-cancelled/, 'is-cancelled marker present');
    assert.match(html, /Schack/, 'title still present');
  });

  it('REV-CANCEL-02: active per-event page has no cancelled markers', () => {
    const html = renderEventPage(baseEvent(), camp, siteUrl);
    assert.ok(!/INSTÄLLD/.test(html), 'no INSTÄLLD');
    assert.ok(!/is-cancelled/.test(html), 'no is-cancelled');
  });
});

// ── Today view embedding (render-idag.js + events-today.js source) ──────────

describe('02-§118.6 — today view cancelled support', () => {
  it('IDAG-CANCEL-01: render-idag embeds the cancelled flag in the event JSON', () => {
    const html = renderIdagPage(camp, [baseEvent({ cancelled: true })]);
    assert.match(html, /"cancelled":true/, 'cancelled:true in embedded JSON');
  });

  it('IDAG-CANCEL-02: events-today.js renders the INSTÄLLD label and is-cancelled class', () => {
    const src = read('source/assets/js/client/events-today.js');
    assert.match(src, /cancelled/, 'reads cancelled flag');
    assert.match(src, /is-cancelled/, 'adds is-cancelled class');
    assert.match(src, /INSTÄLLD/, 'emits INSTÄLLD label');
  });
});

// ── RSS feed (render-rss.js) ─────────────────────────────────────────────────

describe('02-§118.11 — RSS cancelled title prefix', () => {
  it('RSS-CANCEL-01: a cancelled item title is prefixed with [INSTÄLLD]', () => {
    const xml = renderRssFeed(camp, [baseEvent({ cancelled: true })], siteUrl);
    assert.match(xml, /<title>\[INSTÄLLD\] Schack<\/title>/, 'cancelled item title prefixed');
  });

  it('RSS-CANCEL-02: an active item title is not prefixed', () => {
    const xml = renderRssFeed(camp, [baseEvent()], siteUrl);
    assert.match(xml, /<title>Schack<\/title>/, 'active item title unchanged');
    assert.ok(!/\[INSTÄLLD\]/.test(xml), 'no prefix for active items');
  });
});

// ── iCal feed (render-ical.js) ───────────────────────────────────────────────

describe('02-§118.12 — iCal STATUS:CANCELLED', () => {
  it('ICAL-CANCEL-01: a cancelled event VEVENT carries STATUS:CANCELLED (full feed)', () => {
    const ics = renderIcalFeed(camp, [baseEvent({ cancelled: true })], siteUrl);
    assert.match(ics, /STATUS:CANCELLED/, 'STATUS:CANCELLED in full feed');
  });

  it('ICAL-CANCEL-02: per-event ics carries STATUS:CANCELLED when cancelled', () => {
    const ics = renderEventIcal(baseEvent({ cancelled: true }), camp, siteUrl);
    assert.match(ics, /STATUS:CANCELLED/, 'STATUS:CANCELLED in per-event ics');
  });

  it('ICAL-CANCEL-03: an active event has no STATUS:CANCELLED', () => {
    const ics = renderEventIcal(baseEvent(), camp, siteUrl);
    assert.ok(!/STATUS:CANCELLED/.test(ics), 'no STATUS for active event');
  });
});

// ── events.json field (build.js) ─────────────────────────────────────────────

describe('02-§118.2 — cancelled exposed in events.json', () => {
  it('BUILD-CANCEL-01: PUBLIC_EVENT_FIELDS includes cancelled', () => {
    const src = read('source/build/build.js');
    const m = src.match(/PUBLIC_EVENT_FIELDS\s*=\s*\[([^\]]+)\]/);
    assert.ok(m, 'PUBLIC_EVENT_FIELDS array found');
    assert.match(m[1], /'cancelled'/, 'cancelled listed in PUBLIC_EVENT_FIELDS');
  });
});

// ── Validation (lint-yaml.js) ────────────────────────────────────────────────

describe('02-§118.1 — cancelled boolean validation', () => {
  const evt = (cancelled) => baseEvent(cancelled === undefined ? {} : { cancelled });

  it('LINTY-CANCEL-01: cancelled true/false/absent are accepted', () => {
    assert.deepEqual(validateEventObject(evt(true), 'ref', {}), []);
    assert.deepEqual(validateEventObject(evt(false), 'ref', {}), []);
    assert.deepEqual(validateEventObject(evt(undefined), 'ref', {}), []);
    assert.deepEqual(validateEventObject(evt(null), 'ref', {}), []);
  });

  it('LINTY-CANCEL-02: a non-boolean cancelled is rejected', () => {
    const errors = validateEventObject(evt('true'), 'ref', {});
    assert.ok(errors.some((e) => /cancelled/.test(e)), `expected a cancelled error, got: ${errors.join('; ')}`);
  });
});
