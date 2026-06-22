'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderTodayPage, renderRedirectPage } = require('../source/build/render-today');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = { name: 'SB sommar 2099 juli', location: 'Sysslebäck', start_date: '2099-07-01', end_date: '2099-07-07' };

const EVENTS = [
  { title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Servicehus', responsible: 'Anna', description: null, link: null },
  { title: 'Simning', date: '2099-07-02', start: '14:00', end: '15:00', location: 'Strand', responsible: 'Erik', description: 'Badklubben', link: 'https://example.com' },
];

const QR_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

// ── 02-§2.4a  Display view at /live.html ─────────────────────────────────────

describe('02-§2.4a — Display view rendered as display mode', () => {
  it('DIS-01: produces a <!DOCTYPE html> page', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'starts with DOCTYPE');
  });

  it('DIS-02: page has lang="sv"', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('<html lang="sv">'), 'Swedish lang');
  });

  it('DIS-03: title includes camp name', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('<title>Dagens schema'), 'Dagens schema title');
    assert.ok(html.includes('SB sommar 2099 juli'), 'camp name in title');
  });
});

// ── 02-§2.10 / 02-§4.7  Display view has no header or navigation ───────────

describe('02-§2.10 — Display view has no navigation', () => {
  it('DIS-04: no page-nav element in output', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('class="page-nav"'), 'no page-nav');
  });

  it('DIS-05: no hamburger button', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('nav-toggle'), 'no hamburger');
  });

  it('DIS-06: no nav links (Hem, Schema, etc.)', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('nav-link'), 'no nav-link elements');
  });
});

// ── 02-§4.6  Display view has dark background ───────────────────────────────

describe('02-§4.6 — Display mode styling', () => {
  it('DIS-07: body has class="display-mode"', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('<body class="display-mode">'), 'display-mode class on body');
  });
});

// ── 02-§4.7  Display view requires no interaction ───────────────────────────

describe('02-§4.7 — Display view is non-interactive', () => {
  it('DIS-08: no day navigation controls rendered', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('prev-day'), 'no prev-day');
    assert.ok(!html.includes('next-day'), 'no next-day');
    assert.ok(!html.includes('<select'), 'no day selector');
  });

  it('DIS-09: no form elements in display mode', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('<form'), 'no form');
    assert.ok(!html.includes('<input'), 'no inputs');
  });
});

// ── 02-§4.13  Today view has no day navigation ─────────────────────────────

describe('02-§4.13 — No day navigation in display view', () => {
  it('DIS-10: heading element with id "today-heading" is present', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('id="today-heading"'), 'today-heading element present');
  });
});

// ── Events embedded as JSON ─────────────────────────────────────────────────

describe('Display view — event data embedding', () => {
  it('DIS-11: events are embedded as window.__EVENTS__', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('window.__EVENTS__'), 'events embedded');
  });

  it('DIS-12: embedded events contain required fields', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    const match = html.match(/window\.__EVENTS__\s*=\s*(\[.*?\]);/s);
    assert.ok(match, 'events JSON found');
    const events = JSON.parse(match[1]);
    assert.strictEqual(events.length, 2, 'both events embedded');
    assert.ok(events[0].title, 'title present');
    assert.ok(events[0].date, 'date present');
    assert.ok(events[0].start, 'start present');
  });

  it('DIS-13: heading prefix is empty (date shown without page-title prefix)', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes("window.__HEADING_PREFIX__ = ''"), 'empty heading prefix');
  });

  it('DIS-14: activity-count footer flag is set in display mode', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('window.__SHOW_FOOTER__ = true'), 'show footer is true');
  });
});

// ── 02-§4.14  No site footer in display view ────────────────────────────────

describe('02-§4.14 — Display view has no site footer', () => {
  it('DIS-19: site-footer element is absent from display mode HTML', () => {
    // Pass a non-empty siteUrl so any footer-rendering path would have content to work with.
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG, 'https://sommar.example.com');
    assert.ok(!html.includes('class="site-footer"'), 'no site-footer in display mode');
  });
});

// ── 02-§4.16  Build time embedded ───────────────────────────────────────────

describe('02-§4.16 — Build time embedded at build', () => {
  it('DIS-20: window.__BUILD_TIME__ is present in the page', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('window.__BUILD_TIME__'), '__BUILD_TIME__ embedded');
  });

  it('DIS-21: window.__VERSION__ is present in the page', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('window.__VERSION__'), '__VERSION__ embedded');
  });
});

// ── 02-§4.15  Live clock element ────────────────────────────────────────────

describe('02-§4.15 — Status bar with live clock is present', () => {
  it('DIS-22: status-bar container is present in the sidebar', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('class="status-bar"'), 'status-bar element present');
  });

  it('DIS-23: live-clock element with id "live-clock" is present', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('id="live-clock"'), 'live-clock element present');
  });
});

// ── 02-§4.19/4.20  Heading in sidebar, date-only ────────────────────────────

describe('02-§4.19/4.20 — Heading is in sidebar with no prefix', () => {
  it('DIS-24: today-heading element is inside the sidebar', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    const sidebarStart = html.indexOf('class="dagens-sidebar"');
    const headingPos = html.indexOf('id="today-heading"');
    assert.ok(sidebarStart !== -1, 'sidebar element present');
    assert.ok(headingPos > sidebarStart, 'heading is inside or after sidebar start');
  });

  it('DIS-25: today-heading is not present above the layout (before dagens-layout)', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    const layoutStart = html.indexOf('class="dagens-layout"');
    const headingPos = html.indexOf('id="today-heading"');
    assert.ok(layoutStart !== -1, 'layout element present');
    assert.ok(headingPos > layoutStart, 'heading is inside the layout, not before it');
  });
});

// ── QR code embedding ───────────────────────────────────────────────────────

describe('Display view — QR code', () => {
  it('DIS-15: QR SVG is embedded in the page', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('<svg'), 'SVG embedded');
    assert.ok(html.includes('class="qr-wrap"'), 'QR wrapper present');
  });

  it('DIS-16: sidebar with descriptive text is present', () => {
    const siteUrl = 'https://sommar.example.com';
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG, siteUrl);
    assert.ok(html.includes('class="dagens-sidebar"'), 'sidebar present');
    assert.ok(html.includes('class="sidebar-text"'), 'sidebar text present');
    // Verify the rendered sidebar contains the hostname extracted from SITE_URL
    const expectedHost = new URL(siteUrl).hostname;
    assert.match(html, new RegExp(expectedHost), 'site URL hostname mentioned in description');
  });
});

// ── 02-§17.3  Readable on shared display screens ───────────────────────────

describe('02-§17.3 — Display view tailored for shared screens', () => {
  it('DIS-17: uses events-today.js for client-side rendering', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(html.includes('src="events-today.js"'), 'events-today.js loaded');
  });

  it('DIS-18: no session.js loaded (display-only, no editing)', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(!html.includes('session.js'), 'no session.js in display mode');
  });
});

// ── 02-§56.3  Pre-rendered description HTML in JSON ──────────────────────────

describe('02-§56.3 — Today view pre-renders description HTML', () => {
  it('DIS-26 (02-§56.3): embedded JSON includes descriptionHtml for events with markdown description', () => {
    const mdEvents = [
      { title: 'Test', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Sal', responsible: 'A', description: 'This is **bold**', link: null },
    ];
    const html = renderTodayPage(CAMP, mdEvents, QR_SVG);
    const match = html.match(/window\.__EVENTS__\s*=\s*(\[.*?\]);/s);
    assert.ok(match, 'events JSON found');
    const events = JSON.parse(match[1]);
    assert.ok(events[0].descriptionHtml, 'descriptionHtml field present');
    assert.ok(events[0].descriptionHtml.includes('<strong>bold</strong>'), 'description rendered as HTML');
  });

  it('DIS-27 (02-§56.3): descriptionHtml is null when description is null', () => {
    const noDescEvents = [
      { title: 'Test', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Sal', responsible: 'A', description: null, link: null },
    ];
    const html = renderTodayPage(CAMP, noDescEvents, QR_SVG);
    const match = html.match(/window\.__EVENTS__\s*=\s*(\[.*?\]);/s);
    const events = JSON.parse(match[1]);
    assert.strictEqual(events[0].descriptionHtml, null, 'descriptionHtml should be null');
  });
});

// ── 02-§76.1  Redirect from old dagens-schema.html URL ──────────────────────

describe('02-§76.1 — Redirect page from dagens-schema.html to live.html', () => {
  const html = renderRedirectPage();

  it('RDR-01: produces a <!DOCTYPE html> page', () => {
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'starts with DOCTYPE');
  });

  it('RDR-02: has meta refresh pointing to live.html', () => {
    assert.ok(html.includes('http-equiv="refresh"'), 'meta refresh present');
    assert.ok(html.includes('url=live.html'), 'refresh target is live.html');
  });

  it('RDR-03: has JavaScript fallback redirect', () => {
    assert.ok(html.includes("location.replace('live.html')"), 'JS redirect present');
  });

  it('RDR-04: has a visible link to live.html', () => {
    assert.ok(html.includes('href="live.html"'), 'link to live.html present');
  });
});
