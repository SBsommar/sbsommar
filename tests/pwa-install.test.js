'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { renderSchedulePage } = require('../source/build/render');
const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderTodayPage } = require('../source/build/render-today');
const { renderIndexPage } = require('../source/build/render-index');
const { renderArkivPage } = require('../source/build/render-arkiv');
const { renderKalenderPage } = require('../source/build/render-kalender');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-15',
};

const EVENTS = [
  { id: 'e1', title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Servicehus', responsible: 'Anna' },
];

const LOCATIONS = ['Servicehus', 'Annat'];
const QR_SVG = '<svg><rect/></svg>';

const INDEX_PAGE = {
  heroSrc: 'images/hero.jpg',
  heroAlt: 'Camp view',
  discordUrl: null,
  facebookUrl: null,
  countdownTarget: null,
  sections: [{ id: 'start', navLabel: 'Start', html: '<p>Intro</p>' }],
};

const ALL_PAGES = [
  ['schedule', () => renderSchedulePage(CAMP, EVENTS)],
  ['add-activity', () => renderAddPage(CAMP, LOCATIONS, '/add-event')],
  ['edit-activity', () => renderEditPage(CAMP, LOCATIONS, '/edit-event')],
  ['idag', () => renderIdagPage(CAMP, EVENTS)],
  ['display', () => renderTodayPage(CAMP, EVENTS, QR_SVG)],
  ['index', () => renderIndexPage(INDEX_PAGE)],
  ['arkiv', () => renderArkivPage([])],
  ['kalender', () => renderKalenderPage(CAMP, 'https://example.com')],
];

// ── 02-§88.12 — pwa-install.js exists ────────────────────────────────────────

describe('02-§88.12 — pwa-install.js exists', () => {
  it('INST-01: source/assets/js/client/pwa-install.js exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'pwa-install.js');
    assert.ok(fs.existsSync(filePath), 'pwa-install.js must exist');
  });
});

// ── 02-§88.4 — Every header page includes pwa-install.js ─────────────────────
// The install button lives in the shared header (02-§88.4). The display view
// (`live.html`) has no header, so it neither shows the button nor loads the
// script (02-§4.28); it is the documented exception, verified below.

const SCRIPT_PAGES = ALL_PAGES.filter(([name]) => name !== 'display');

describe('02-§88.4 — Every header page includes pwa-install.js', () => {
  for (const [name, fn] of SCRIPT_PAGES) {
    it(`INST-02-${name}: ${name} page includes pwa-install.js`, () => {
      const html = fn();
      assert.ok(
        html.includes('pwa-install.js'),
        `${name} must include pwa-install.js`,
      );
    });
  }

  it('INST-02-display: display view does NOT load pwa-install.js (02-§4.28)', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR_SVG);
    assert.ok(
      !html.includes('pwa-install.js'),
      'display view must not load pwa-install.js (no header install button)',
    );
  });
});

// ── 02-§88.1 — Install button placeholder in nav ────────────────────────────

// Display view (render-today.js) has no navigation — install button not applicable.
const NAV_PAGES = ALL_PAGES.filter(([name]) => name !== 'display');

describe('02-§88.1 — Nav includes install button placeholder', () => {
  for (const [name, fn] of NAV_PAGES) {
    it(`INST-03-${name}: ${name} page has pwa-install-btn element`, () => {
      const html = fn();
      assert.ok(
        html.includes('pwa-install-btn'),
        `${name} must include pwa-install-btn element in nav`,
      );
    });
  }
});

// ── 02-§88.16 — pwa-install.js uses Swedish text ────────────────────────────

describe('02-§88.16 — pwa-install.js uses Swedish text', () => {
  it('INST-04: pwa-install.js contains Swedish install label', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'pwa-install.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('Installera'),
      'pwa-install.js must contain Swedish text "Installera"',
    );
  });

  it('INST-05: pwa-install.js contains Swedish iOS instruction', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'pwa-install.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('Lägg till på hemskärmen'),
      'pwa-install.js must contain iOS instruction in Swedish',
    );
  });
});

// ── 02-§88.2 — Install button has icon ───────────────────────────────────────

describe('02-§88.2 — Install button has icon', () => {
  it('INST-06: nav contains install button with SVG icon', () => {
    const html = ALL_PAGES[0][1]();
    assert.ok(
      html.includes('pwa-install-btn') && html.includes('svg'),
      'install button must include an SVG icon',
    );
  });
});

// ── 02-§88.5 — pwa-install.js handles beforeinstallprompt ────────────────────

describe('02-§88.5 — pwa-install.js handles beforeinstallprompt', () => {
  it('INST-07: pwa-install.js listens for beforeinstallprompt', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'pwa-install.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('beforeinstallprompt'),
      'pwa-install.js must listen for beforeinstallprompt event',
    );
  });
});

// ── 02-§88.6 — pwa-install.js handles appinstalled ──────────────────────────

describe('02-§88.6 — pwa-install.js handles appinstalled', () => {
  it('INST-08: pwa-install.js listens for appinstalled', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'pwa-install.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('appinstalled'),
      'pwa-install.js must listen for appinstalled event',
    );
  });
});

// ── 02-§88.9 — pwa-install.js checks standalone mode ────────────────────────

describe('02-§88.9 — pwa-install.js checks standalone mode', () => {
  it('INST-09: pwa-install.js checks display-mode: standalone', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'pwa-install.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('standalone'),
      'pwa-install.js must check for standalone display mode',
    );
  });
});
