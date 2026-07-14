'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderIndexPage } = require('../source/build/render-index');

const EDQHUB_URL = 'https://edqhub.com/join/sb-sommarlager-2026';

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildPage(overrides = {}) {
  return {
    heroSrc: 'images/klaralven.webp',
    heroAlt: 'Klarälven',
    sections: [
      { id: 'start', navLabel: 'Om lägret', html: '<p>Intro</p>' },
      { id: 'anmalan', navLabel: 'Anmälan', html: '<h2>Hur anmäler jag oss?</h2>\n<p>Läs reglerna.</p>' },
    ],
    discordUrl: 'https://discord.com/t',
    facebookUrl: 'https://fb.com/t',
    edqhubUrl: EDQHUB_URL,
    countdownTarget: '2026-06-21',
    registrationCamps: [],
    ...overrides,
  };
}

function makeRegCamp(overrides = {}) {
  return {
    id: '2026-06-syssleback',
    name: 'SB sommar 2026 juni',
    registrationOpens: '2026-04-15',
    registrationCloses: '2026-06-14',
    lastRegistrationLabel: '14 juni',
    ...overrides,
  };
}

// ── HUBB: EDQ Hub community banner (02-§121.1–121.13) ────────────────────────

describe('renderIndexPage – EDQ Hub community banner (02-§121)', () => {
  it('HUBB-01: no banner when edqhubUrl is absent', () => {
    const html = renderIndexPage(buildPage({ edqhubUrl: undefined }));
    assert.ok(
      !html.includes('class="hero-hub-banner"'),
      'Expected no hub banner when edqhubUrl is missing',
    );
  });

  it('HUBB-02: renders a .hero-hub-banner anchor when edqhubUrl is present', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('class="hero-hub-banner"'),
      'Expected .hero-hub-banner anchor',
    );
  });

  it('HUBB-03: banner href equals the EDQ Hub join URL (02-§121.2)', () => {
    const html = renderIndexPage(buildPage());
    const anchor = html.match(/<a[^>]*class="hero-hub-banner"[^>]*>/);
    assert.ok(anchor, 'Expected hub banner anchor');
    assert.ok(
      anchor[0].includes(`href="${EDQHUB_URL}"`),
      `Expected href="${EDQHUB_URL}", got: ${anchor[0]}`,
    );
  });

  it('HUBB-04: banner opens in a new tab with rel="noopener noreferrer" (02-§121.2)', () => {
    const html = renderIndexPage(buildPage());
    const anchor = html.match(/<a[^>]*class="hero-hub-banner"[^>]*>/);
    assert.ok(anchor, 'Expected hub banner anchor');
    assert.ok(anchor[0].includes('target="_blank"'), `Expected target="_blank", got: ${anchor[0]}`);
    assert.ok(
      anchor[0].includes('rel="noopener noreferrer"'),
      `Expected rel="noopener noreferrer", got: ${anchor[0]}`,
    );
  });

  it('HUBB-05: banner carries data-goatcounter-click="click-hub-banner" (02-§121.11)', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('data-goatcounter-click="click-hub-banner"'),
      'Expected the hub-banner goatcounter click attribute',
    );
  });

  it('HUBB-06: banner click event is distinct from the hero social icon (02-§121.11)', () => {
    const html = renderIndexPage(buildPage());
    // The hero social EDQ Hub icon keeps its own separate click event.
    assert.ok(html.includes('data-goatcounter-click="click-edqhub"'), 'Expected social-icon click event');
    assert.ok(html.includes('data-goatcounter-click="click-hub-banner"'), 'Expected banner click event');
  });

  it('HUBB-07: banner title leads with the benefit (02-§121.5)', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('All info om lägret – på ett ställe'),
      'Expected the benefit-led Swedish banner title',
    );
  });

  it('HUBB-08: banner sub line states the move from Facebook (02-§121.6)', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('Vi flyttar från Facebook till EDQ Hub. Här finns schema, nyheter och kontakt före och under lägret.'),
      'Expected the Swedish banner sub line naming the Facebook move',
    );
  });

  it('HUBB-09: banner is not date-gated — no hidden attribute, no data-opens (02-§121.4)', () => {
    const html = renderIndexPage(buildPage());
    const anchor = html.match(/<a[^>]*class="hero-hub-banner"[^>]*>/);
    assert.ok(anchor, 'Expected hub banner anchor');
    assert.ok(!/\bhidden\b/.test(anchor[0]), `Hub banner must not be hidden, got: ${anchor[0]}`);
    assert.ok(!anchor[0].includes('data-opens'), `Hub banner must not carry data-opens, got: ${anchor[0]}`);
  });

  it('HUBB-10: banner is rendered inside the hero area (before the content div)', () => {
    const html = renderIndexPage(buildPage());
    const bannerStart = html.indexOf('hero-hub-banner');
    const contentStart = html.indexOf('<div class="content">');
    assert.ok(bannerStart !== -1, 'Expected hub banner in output');
    assert.ok(contentStart !== -1, 'Expected content div in output');
    assert.ok(bannerStart < contentStart, 'Hub banner must appear before the main content section');
  });

  it('HUBB-11: banner sits above the registration banners (02-§121.3)', () => {
    const html = renderIndexPage(buildPage({ registrationCamps: [makeRegCamp()] }));
    const hubStart = html.indexOf('hero-hub-banner');
    const regStart = html.indexOf('hero-registration-banners');
    assert.ok(hubStart !== -1, 'Expected hub banner in output');
    assert.ok(regStart !== -1, 'Expected registration banners in output');
    assert.ok(hubStart < regStart, 'Hub banner must appear above the registration banners');
  });

  it('HUBB-12: banner adds no inline visibility script of its own (02-§121.12)', () => {
    const html = renderIndexPage(buildPage({ registrationCamps: [] }));
    assert.ok(
      !html.includes('.hero-hub-banner[data-opens]'),
      'Hub banner must not emit any date-gating script',
    );
  });

  it('HUBB-13: banner carries the EDQ Hub icon (02-§121.9)', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(html.includes('class="hero-hub-banner-icon"'), 'Expected the banner icon span');
    // The icon is the shared inline EDQ Hub badge SVG.
    assert.ok(/<span class="hero-hub-banner-icon">\s*<svg/.test(html), 'Expected the SVG badge inside the icon span');
  });

  it('HUBB-14: banner shows a "Till EDQ Hub" call-to-action pill (02-§121.9, §121.14)', () => {
    const html = renderIndexPage(buildPage());
    const btn = html.match(/<span class="hero-hub-banner-btn"[^>]*>([\s\S]*?)<\/span>/);
    assert.ok(btn, 'Expected a .hero-hub-banner-btn element');
    assert.ok(/Till EDQ Hub/.test(btn[1]), `Expected the "Till EDQ Hub" label, got: ${btn[1]}`);
  });

  it('HUBB-15: the call-to-action is a span, not a nested link/button (02-§121.14)', () => {
    const html = renderIndexPage(buildPage());
    // Isolate the banner anchor and confirm it contains no nested <a> or <button>,
    // which would be invalid inside an <a> and break the single-target link.
    const banner = html.match(/<a[^>]*class="hero-hub-banner"[\s\S]*?<\/a>/);
    assert.ok(banner, 'Expected the hub banner anchor');
    assert.ok(!/<button/.test(banner[0]), 'Banner must not nest a <button>');
    // Exactly one <a> (the card itself), no inner anchors.
    const anchorOpens = banner[0].match(/<a\b/g) || [];
    assert.equal(anchorOpens.length, 1, 'Banner must be a single anchor with no nested links');
  });
});
