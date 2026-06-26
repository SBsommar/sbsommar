'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderIdagPage } = require('../source/build/render-idag');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = { name: 'SB sommar 2099 juli', location: 'Sysslebäck', start_date: '2099-07-01', end_date: '2099-07-07' };

const EVENTS = [
  { id: 'e1', title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Servicehus', responsible: 'Anna', description: null, link: null },
  { id: null, title: 'Simning', date: '2099-07-02', start: '14:00', end: '15:00', location: 'Strand', responsible: 'Erik', description: 'Badklubben', link: null },
];

const SECTIONS = [
  { id: 'start', navLabel: 'Om lägret' },
  { id: 'faq', navLabel: 'FAQ' },
];

// ── 02-§2.4  Today view at /idag.html ───────────────────────────────────────

describe('02-§2.4 — Idag page rendered in standard layout', () => {
  it('IDAG-05: produces a <!DOCTYPE html> page', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'starts with DOCTYPE');
  });

  it('IDAG-06: page has lang="sv"', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('<html lang="sv">'), 'Swedish lang');
  });

  it('IDAG-07: title includes "Dagens aktiviteter" and camp name', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('<title>Dagens aktiviteter'), 'Dagens aktiviteter title');
    assert.ok(html.includes('SB sommar 2099 juli'), 'camp name in title');
  });

  it('IDAG-08: has standard site navigation', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('class="page-nav"'), 'has page-nav');
    assert.ok(html.includes('Idag'), 'has Idag link');
  });
});

// ── 02-§4.5  Idag shows only today's activities ────────────────────────────
// Client-side filtering; we can verify all events are embedded for the client.

describe('02-§4.5 — All events embedded for client-side day filtering', () => {
  it('IDAG-09: events embedded as window.__EVENTS__', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    const match = html.match(/window\.__EVENTS__\s*=\s*(\[.*?\]);/s);
    assert.ok(match, 'events JSON found');
    const events = JSON.parse(match[1]);
    assert.strictEqual(events.length, 2, 'all events embedded');
  });

  it('IDAG-10: heading prefix set to "Dagens aktiviteter"', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes("window.__HEADING_PREFIX__ = 'Dagens aktiviteter'"), 'heading prefix');
  });

  it('IDAG-11: footer not shown (different from display mode)', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('window.__SHOW_FOOTER__ = false'), 'show footer is false');
  });
});

// ── 02-§4.13  Today view has no day navigation ─────────────────────────────

describe('02-§4.13 — No day navigation in Idag view', () => {
  it('IDAG-12: heading is fixed "Dagens aktiviteter"', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('<h1 id="today-heading">Dagens aktiviteter</h1>'), 'fixed heading');
  });

  it('IDAG-13: no day-switcher controls', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(!html.includes('prev-day'), 'no prev-day');
    assert.ok(!html.includes('next-day'), 'no next-day');
  });

  it('IDAG-14: has intro text linking to full schedule', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('class="intro"'), 'has intro');
    assert.ok(html.includes('href="schema.html"'), 'links to schedule');
  });
});

// ── 02-§14.1  All text in Swedish ───────────────────────────────────────────

describe('02-§14.1 — Idag page uses Swedish text', () => {
  it('IDAG-15: intro paragraph is in Swedish', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('Aktiviteterna nedan'), 'Swedish intro text');
    assert.ok(html.includes('hela schemat'), 'Swedish schedule reference');
  });
});

// ── Script tags ─────────────────────────────────────────────────────────────

describe('Idag page — scripts', () => {
  it('IDAG-16: loads events-today.js', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('src="events-today.js"'), 'events-today.js loaded');
  });

  it('IDAG-17: loads nav.js with defer', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('src="nav.js" defer'), 'nav.js deferred');
  });
});

// ── Section links passed through ────────────────────────────────────────────

describe('Idag page — navSections', () => {
  it('IDAG-18: section links rendered when navSections provided', () => {
    const html = renderIdagPage(CAMP, EVENTS, '', SECTIONS);
    assert.ok(html.includes('Om lägret'), 'section label present');
    assert.ok(html.includes('FAQ'), 'FAQ label present');
  });
});

// ── 02-§56.3  Pre-rendered description HTML in JSON ──────────────────────────

describe('02-§56.3 — Idag page pre-renders description HTML', () => {
  it('IDAG-19 (02-§56.3): embedded JSON includes descriptionHtml for events with description', () => {
    const mdEvents = [
      { id: 'e1', title: 'Test', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Sal', responsible: 'A', description: 'This is **bold**', link: null },
    ];
    const html = renderIdagPage(CAMP, mdEvents);
    const match = html.match(/window\.__EVENTS__\s*=\s*(\[.*?\]);/s);
    assert.ok(match, 'events JSON found');
    const events = JSON.parse(match[1]);
    assert.ok(events[0].descriptionHtml, 'descriptionHtml field present');
    assert.ok(events[0].descriptionHtml.includes('<strong>bold</strong>'), 'description rendered as HTML');
  });
});

// ── 02-§116.5  Today view marks ended / in-progress activities ───────────────

describe('02-§116.5 — Idag time-status marking', () => {
  const fs = require('fs');
  const path = require('path');
  const JS = fs.readFileSync(
    path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'events-today.js'),
    'utf8',
  );

  it('IDAG-20 (02-§116.5): classifies today rows outside the display view', () => {
    // The marking must run on idag.html (no __BUILD_TIME__), not only live.html.
    assert.ok(/if\s*\(\s*!\s*window\.__BUILD_TIME__\s*\)/.test(JS), 'guarded to non-display view');
    assert.ok(JS.includes("getElementById('today-list')"), 'targets today list');
  });

  it('IDAG-21 (02-§116.5): adds is-past and is-now classes', () => {
    assert.ok(JS.includes("classList.add('is-past')"), 'adds is-past');
    assert.ok(JS.includes("classList.add('is-now')"), 'adds is-now');
  });
});
