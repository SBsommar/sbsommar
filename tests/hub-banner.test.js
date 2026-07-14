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

  it('HUBB-07: banner title is "Gå med i vår EDQ Hub" (02-§121.5)', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('Gå med i vår EDQ Hub'),
      'Expected the Swedish banner title',
    );
  });

  it('HUBB-08: banner sub line invites participants to stay in touch (02-§121.6)', () => {
    const html = renderIndexPage(buildPage());
    assert.ok(
      html.includes('Här delar vi nyheter och håller kontakten före och under lägret. Välkommen in!'),
      'Expected the Swedish banner sub line',
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
});
