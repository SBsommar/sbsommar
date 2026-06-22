'use strict';

// Tests for renderIdagPage() — structural requirements for edit-link support.
//
// 02-§18.43 (id in JSON) and the session.js script tag (part of 02-§18.42) are
// tested here because they are structural properties of the HTML string returned
// by renderIdagPage() and can be verified in Node.js without a browser.
//
// 02-§18.44 (data-event-id / data-event-date on dynamically rendered rows) cannot
// be tested in Node.js because it requires events-today.js to run in a real DOM.
// Manual verification checkpoint for 02-§18.44:
//   1. Build the site and open idag.html in a browser on a day with events.
//   2. Open DevTools → Console.
//   3. Run: document.querySelectorAll('[data-event-id]')
//   4. Confirm each rendered event row has a non-empty data-event-id attribute.
//   5. Run: document.querySelectorAll('[data-event-date]')
//   6. Confirm each row has a data-event-date in YYYY-MM-DD format.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderIdagPage } = require('../source/build/render-idag');
const { renderTodayPage } = require('../source/build/render-today');

const CAMP = { name: 'Test Camp' };
const EVENTS = [
  {
    id: 'morgonyoga-2026-06-01-0800',
    title: 'Morgonyoga',
    date: '2026-06-01',
    start: '08:00',
    end: '09:00',
    location: 'Stranden',
    responsible: 'Lisa',
    description: null,
    link: null,
  },
  {
    id: 'lunch-2026-06-01-1200',
    title: 'Lunch',
    date: '2026-06-01',
    start: '12:00',
    end: '13:00',
    location: null,
    responsible: null,
    description: 'Vegetarisk option finns.',
    link: null,
  },
];

// Extract the embedded __EVENTS__ JSON from the rendered HTML.
function parseEmbeddedEvents(html) {
  const match = html.match(/window\.__EVENTS__\s*=\s*(\[.*?\]);/s);
  assert.ok(match, 'Expected window.__EVENTS__ assignment in rendered HTML');
  return JSON.parse(match[1]);
}

// ── 02-§18.43: embedded events JSON includes id ──────────────────────────────

describe('renderIdagPage – embedded events JSON (02-§18.43)', () => {
  it('IDAG-01: each event in the embedded JSON includes the id field', () => { // IDAG-01
    const html = renderIdagPage(CAMP, EVENTS);
    const embedded = parseEmbeddedEvents(html);
    assert.strictEqual(embedded.length, 2);
    assert.strictEqual(embedded[0].id, 'morgonyoga-2026-06-01-0800');
    assert.strictEqual(embedded[1].id, 'lunch-2026-06-01-1200');
  });

  it('IDAG-02: id is null in JSON when the event has no id', () => { // IDAG-02
    const html = renderIdagPage(CAMP, [{ title: 'No ID', date: '2026-06-01', start: '10:00', end: '11:00' }]);
    const embedded = parseEmbeddedEvents(html);
    assert.strictEqual(embedded[0].id, null);
  });
});

// ── 02-§18.42: session.js is loaded on idag.html ─────────────────────────────

describe('renderIdagPage – session.js script tag (02-§18.42)', () => {
  it('IDAG-03: rendered HTML includes a <script src="session.js"> tag', () => { // IDAG-03
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(
      html.includes('<script src="session.js"></script>'),
      'Expected <script src="session.js"></script> in rendered idag.html',
    );
  });

  it('IDAG-04: session.js script tag appears after events-today.js', () => { // IDAG-04
    const html = renderIdagPage(CAMP, EVENTS);
    const posToday = html.indexOf('<script src="events-today.js">');
    const posSession = html.indexOf('<script src="session.js">');
    assert.ok(posToday >= 0, 'events-today.js script tag not found');
    assert.ok(posSession >= 0, 'session.js script tag not found');
    assert.ok(
      posSession > posToday,
      'session.js must come after events-today.js so rows exist when links are injected',
    );
  });
});

// ── 02-§46.16 / 02-§46.17: per-event iCal link in today view ─────────────────
//
// The iCal link itself is injected client-side by events-today.js, which only
// runs in a real DOM. Here we verify the structural trigger: idag.html opts in
// via window.__SHOW_ICAL__, and the display view (live.html) does not.
//
// Manual verification checkpoint for 02-§46.16:
//   1. Build the site and open idag.html in a browser on a day with events.
//   2. Confirm each event row ends with a small "iCal" link.
//   3. Click it and confirm the per-event .ics file downloads.

describe('renderIdagPage – per-event iCal opt-in (02-§46.16)', () => {
  it('IDAG-20: rendered HTML sets window.__SHOW_ICAL__ = true', () => { // IDAG-20
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(
      /window\.__SHOW_ICAL__\s*=\s*true/.test(html),
      'Expected window.__SHOW_ICAL__ = true in rendered idag.html',
    );
  });
});

describe('renderTodayPage – display view has no iCal opt-in (02-§46.17)', () => {
  it('IDAG-21: rendered display HTML does not set window.__SHOW_ICAL__', () => { // IDAG-21
    const html = renderTodayPage(CAMP, EVENTS, '<svg></svg>');
    assert.ok(
      !/__SHOW_ICAL__/.test(html),
      'Display view (live.html) must not opt in to per-event iCal links',
    );
  });
});
