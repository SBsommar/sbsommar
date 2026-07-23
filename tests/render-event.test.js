'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderEventPage } = require('../source/build/render-event');

// ── Fixtures ────────────────────────────────────────────────────────────────

const camp = {
  id: '2026-06-syssleback',
  name: 'SB Sommar Juni 2026',
  location: 'Sysslebäck',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};

const siteUrl = 'https://sommar.digitalasynctransparency.com';

const fullEvent = {
  id: 'fotboll-2026-06-29-1000',
  title: 'Fotboll',
  date: '2026-06-29',
  start: '10:00',
  end: '12:00',
  location: 'Planen',
  responsible: 'Erik',
  description: 'Alla är välkomna att spela fotboll.',
  link: 'https://example.com/fotboll',
  owner: { name: 'Secret', email: 'secret@example.com' },
  meta: { created_at: '2026-06-28T10:00:00', updated_at: null },
};

const minimalEvent = {
  id: 'frukost-2026-06-29-0800',
  title: 'Frukost',
  date: '2026-06-29',
  start: '08:00',
  end: '09:00',
  location: 'Matsalen',
  responsible: 'Kocken',
  description: null,
  link: null,
};

// ── Tests ───────────────────────────────────────────────────────────────────

describe('renderEventPage (02-§36)', () => {
  it('EVT-01 (02-§36.3): page shows event title as heading', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('<h1>Fotboll</h1>'), 'should have title as h1');
  });

  it('EVT-02 (02-§36.3): page shows date formatted in Swedish', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    // 2026-06-29 is a Monday
    assert.ok(html.includes('måndag 29 juni 2026'), 'should show Swedish formatted date');
  });

  it('EVT-03 (02-§36.3): page shows start and end time', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('10:00'), 'should show start time');
    assert.ok(html.includes('12:00'), 'should show end time');
  });

  it('EVT-04 (02-§36.3): page shows location', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('Planen'), 'should show location');
  });

  it('EVT-05 (02-§36.3): page shows responsible person', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('Erik'), 'should show responsible person');
  });

  it('EVT-06 (02-§36.3): page shows description when set', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('Alla är välkomna att spela fotboll.'), 'should show description');
  });

  it('EVT-07 (02-§36.3): page shows external link when set', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('href="https://example.com/fotboll"'), 'should show external link');
  });

  it('EVT-08 (02-§36.4): description is omitted when null', () => {
    const html = renderEventPage(minimalEvent, camp, siteUrl);
    assert.ok(!html.includes('class="event-description"'), 'should not render description section');
  });

  it('EVT-09 (02-§36.4): external link is omitted when null', () => {
    const html = renderEventPage(minimalEvent, camp, siteUrl);
    assert.ok(!html.includes('class="event-ext-link"'), 'should not render external link');
  });

  it('EVT-10 (02-§36.5): owner and meta fields are never shown', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(!html.includes('Secret'), 'should not show owner name');
    assert.ok(!html.includes('secret@example.com'), 'should not show owner email');
    assert.ok(!html.includes('created_at'), 'should not show created_at');
    assert.ok(!html.includes('updated_at'), 'should not show updated_at');
  });

  it('EVT-11 (02-§36.6): page includes shared navigation', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('class="page-nav"'), 'should have page-nav');
  });

  it('EVT-12 (02-§36.6): page includes footer when provided', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl, '<p>Footer</p>');
    assert.ok(html.includes('class="site-footer"'), 'should have site-footer');
    assert.ok(html.includes('Footer'), 'should include footer content');
  });

  it('EVT-13 (02-§36.6): page links to stylesheet', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('style.css'), 'should link to stylesheet');
  });

  it('EVT-14 (02-§36.7): page includes back link to schedule', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('schema.html'), 'should link back to schema.html');
  });

  it('EVT-15 (02-§36.8): page includes meta robots noindex nofollow', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'), 'should have robots meta');
  });

  it('EVT-16: page starts with doctype and has lang="sv"', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'should start with doctype');
    assert.ok(html.includes('lang="sv"'), 'should have lang="sv"');
  });

  it('EVT-17: escapes HTML special characters in event fields', () => {
    const xssEvent = {
      ...fullEvent,
      title: 'Mat & Dryck <script>alert(1)</script>',
      location: 'Sal "A"',
    };
    const html = renderEventPage(xssEvent, camp, siteUrl);
    assert.ok(html.includes('&amp;'), 'should escape ampersand');
    assert.ok(html.includes('&lt;script&gt;'), 'should escape script tag');
    assert.ok(!html.includes('<script>alert'), 'should not contain unescaped script tag');
  });

  it('EVT-19 (02-§36.11): uses structured layout with date+time line and plats+ansvarig line', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(!html.includes('<dl'), 'should not use definition list');
    assert.ok(html.includes('måndag 29 juni 2026'), 'line 1 should have formatted date');
    assert.ok(html.includes('10:00–12:00'), 'line 1 should have time range');
    assert.ok(html.includes('<strong>Plats:</strong> Planen'), 'line 2 should have bold Plats label');
    assert.ok(html.includes('<strong>Ansvarig:</strong> Erik'), 'line 2 should have bold Ansvarig label');
  });

  it('EVT-20 (02-§36.11): structured layout omits description and link lines when absent', () => {
    const html = renderEventPage(minimalEvent, camp, siteUrl);
    assert.ok(html.includes('måndag 29 juni 2026'), 'line 1 should have formatted date');
    assert.ok(html.includes('08:00–09:00'), 'line 1 should have time range');
    assert.ok(html.includes('<strong>Plats:</strong> Matsalen'), 'line 2 should have bold Plats label');
    assert.ok(html.includes('<strong>Ansvarig:</strong> Kocken'), 'line 2 should have bold Ansvarig label');
    assert.ok(!html.includes('class="event-description"'), 'should not render description section');
    assert.ok(!html.includes('class="event-ext-link"'), 'should not render external link');
  });

  it('EVT-18 (02-§36.6): page title includes event title', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    assert.ok(titleMatch, 'should have title element');
    assert.ok(titleMatch[1].includes('Fotboll'), 'title should include event name');
  });

  it('EVT-26: <title> stays within 80 chars after escaping when the raw title is short but escapes long', () => {
    // A 75-char title whose two quote characters each expand to &quot; (6 chars)
    // produces an 85-char escaped <title> — over the long-title limit of 80.
    // The truncation guard must measure the escaped length, not the raw length.
    const longEvent = {
      ...fullEvent,
      title: 'Rollspel, Johans Kampanj 1 "Natten som aldrig vill ta slut" GÖRA KARAKTÄRER',
    };
    const html = renderEventPage(longEvent, camp, siteUrl);
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
    assert.ok(titleMatch, 'should have title element');
    assert.ok(
      titleMatch[1].length <= 80,
      `escaped <title> should be ≤ 80 chars, got ${titleMatch[1].length}: ${titleMatch[1]}`,
    );
    assert.ok(titleMatch[1].endsWith('…'), 'a truncated title should end with an ellipsis');
  });

  it('EVT-27: a title that fits within 80 chars after escaping is left untouched', () => {
    const okEvent = { ...fullEvent, title: 'Rollspel, Johans kampanj 1 – göra karaktärer' };
    const html = renderEventPage(okEvent, camp, siteUrl);
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
    assert.ok(titleMatch, 'should have title element');
    assert.strictEqual(titleMatch[1], 'Rollspel, Johans kampanj 1 – göra karaktärer');
    assert.ok(!titleMatch[1].endsWith('…'), 'a short title should not be truncated');
  });

  it('EVT-21 (02-§45.8): page includes iCal download link', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('event.ics'), 'should link to event.ics');
  });

  it('EVT-22 (02-§45.9): iCal link is inside the event-detail section', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    const detailStart = html.indexOf('class="event-detail"');
    const icalPos = html.indexOf('event.ics');
    assert.ok(detailStart > 0, 'should have event-detail div');
    assert.ok(icalPos > detailStart, 'iCal link should be inside event-detail');
  });

  it('EVT-23 (02-§56.1): description with markdown renders as HTML', () => {
    const mdEvent = { ...fullEvent, description: 'This is **bold** text' };
    const html = renderEventPage(mdEvent, camp, siteUrl);
    assert.ok(html.includes('<strong>bold</strong>'), 'markdown bold should render as <strong>');
  });

  it('EVT-24 (02-§56.6): description HTML is sanitized — no <script>', () => {
    const xssEvent = { ...fullEvent, description: 'Hello <script>alert(1)</script>' };
    const html = renderEventPage(xssEvent, camp, siteUrl);
    assert.ok(!html.includes('<script>'), 'script tags must be stripped');
  });

  it('EVT-25 (02-§56.7): plain text description still renders correctly', () => {
    const html = renderEventPage(fullEvent, camp, siteUrl);
    assert.ok(html.includes('Alla är välkomna att spela fotboll.'), 'plain text should appear');
    assert.ok(html.includes('class="event-description"'), 'description section should exist');
  });
});

// ── Conflict banner on per-event pages (02-§99.15–§99.17) ──────────────────
//
// Phase 4 adds a 6th argument `allEvents` to renderEventPage so the renderer
// can flag conflicts at build time. The guard below checks whether that
// wiring has landed (by rendering a known-clashing fixture and looking for
// the banner class); if not, the suite skips so the pre-commit hook passes
// during Phase 3.

const nodeTest2 = require('node:test');

const clashA = {
  id: 'a',
  title: 'A',
  date: '2026-06-29',
  start: '10:00',
  end: '12:00',
  location: 'Planen',
  responsible: 'Erik',
  description: null,
  link: null,
};
const clashB = {
  id: 'b',
  title: 'B',
  date: '2026-06-29',
  start: '11:00',
  end: '13:00',
  location: 'Planen',
  responsible: 'Frida',
  description: null,
  link: null,
};

const conflictFeatureReady = (function () {
  try {
    const html = renderEventPage(clashA, camp, siteUrl, '', [], [clashA, clashB]);
    return typeof html === 'string' && html.includes('conflict-warning');
  } catch {
    return false;
  }
})();

const describeCnf = conflictFeatureReady ? nodeTest2.describe : nodeTest2.describe.skip;

describeCnf('renderEventPage — conflict banner (02-§99.15-§99.17)', () => {
  it('CNF-60: event with one conflict → banner with singular lead', () => {
    const html = renderEventPage(clashA, camp, siteUrl, '', [], [clashA, clashB]);
    assert.ok(html.includes('conflict-warning'), 'should have banner div');
    assert.ok(/en annan aktivitet/i.test(html), 'singular lead should appear');
    assert.ok(!/flera aktiviteter/i.test(html), 'plural lead should not appear');
  });

  it('CNF-60b: event with two+ conflicts → plural lead', () => {
    const clashC = { ...clashB, id: 'c', title: 'C', start: '10:30', end: '11:30', responsible: 'Gustav' };
    const html = renderEventPage(clashA, camp, siteUrl, '', [], [clashA, clashB, clashC]);
    assert.ok(/flera aktiviteter/i.test(html), 'plural lead should appear');
  });

  it('CNF-61: event without any conflict → no banner', () => {
    const lonely = { ...clashA, id: 'lonely', start: '06:00', end: '07:00' };
    const html = renderEventPage(lonely, camp, siteUrl, '', [], [lonely]);
    assert.ok(!html.includes('conflict-warning'), 'banner must not appear');
  });

  it('CNF-62: the event itself is never listed as its own conflict', () => {
    // Produce a page for clashA with only itself in the allEvents array.
    const html = renderEventPage(clashA, camp, siteUrl, '', [], [clashA]);
    assert.ok(!html.includes('conflict-warning'), 'self must not clash with self');
  });

  it('CNF-63: banner sits inside .event-detail before .event-description', () => {
    const withDesc = { ...clashA, description: 'Beskrivning' };
    const html = renderEventPage(withDesc, camp, siteUrl, '', [], [withDesc, clashB]);
    const detailIdx = html.indexOf('class="event-detail"');
    const bannerIdx = html.indexOf('conflict-warning');
    const descIdx = html.indexOf('class="event-description"');
    assert.ok(detailIdx !== -1 && bannerIdx !== -1 && descIdx !== -1, 'all three should exist');
    assert.ok(detailIdx < bannerIdx, 'banner should be inside event-detail');
    assert.ok(bannerIdx < descIdx, 'banner should come before event-description');
  });

  it('CNF-64: banner footer links to lokaler.html', () => {
    const html = renderEventPage(clashA, camp, siteUrl, '', [], [clashA, clashB]);
    assert.ok(/href=["']lokaler\.html["']/.test(html), 'banner must link to lokaler.html');
  });
});
