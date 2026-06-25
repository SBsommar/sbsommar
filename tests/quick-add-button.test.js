'use strict';

// Tests for the quick-add activity button in the sticky navigation – 02-§114.
//
// The button's mobile-only visibility and exact on-screen placement
// (CSS media queries, fixed positioning) cannot be fully verified in
// Node.js. The string-level CSS checks below confirm the rules exist;
// the visual result is a manual checkpoint:
//   Manual checkpoint (02-§114.1, §114.5, §114.6): open any page other than
//   lagg-till.html on a ≤767 px viewport and confirm the "+" button appears
//   in the top bar, between the centred up-arrow and the feedback button,
//   and tapping it opens the add-activity page. On a ≥768 px viewport the
//   "+" button is absent.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { pageNav } = require('../source/build/layout');
const { renderSchedulePage } = require('../source/build/render');
const { renderAddPage } = require('../source/build/render-add');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderIndexPage } = require('../source/build/render-index');
const { renderArkivPage } = require('../source/build/render-arkiv');

const CSS = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'),
  'utf8',
);

const CAMP = { name: 'SB Sommar 2026', start_date: '2026-06-28', end_date: '2026-07-05' };
const EVENTS = [];
const LOCATIONS = ['Servicehus', 'Annat'];
const API_URL = 'https://api.example.com/add-event';
const SECTIONS = [{ id: 'start', navLabel: 'Om lägret' }];

// Extract the quick-add button element from pageNav output for focused checks.
function quickAddEl(html) {
  return html.match(/<a class="quick-add-btn"[\s\S]*?<\/a>/)?.[0] || '';
}

// ── pageNav – structure (02-§114.3, §114.8) ───────────────────────────────────

describe('quick-add button – structure (02-§114.3, §114.8)', () => {
  it('QADD-01: renders an <a class="quick-add-btn"> element', () => {
    const html = pageNav('schema.html', SECTIONS);
    assert.ok(html.includes('<a class="quick-add-btn"'), `Got: ${html}`);
  });

  it('QADD-02: the button links to lagg-till.html', () => {
    const el = quickAddEl(pageNav('schema.html', SECTIONS));
    assert.ok(el.includes('href="lagg-till.html"'), `Got: ${el}`);
  });

  it('QADD-03: the button has aria-label="Lägg till aktivitet"', () => {
    const el = quickAddEl(pageNav('schema.html', SECTIONS));
    assert.ok(el.includes('aria-label="Lägg till aktivitet"'), `Got: ${el}`);
  });

  it('QADD-04: the button contains an inline SVG plus icon', () => {
    const el = quickAddEl(pageNav('schema.html', SECTIONS));
    assert.ok(el.includes('<svg'), `Expected an inline SVG. Got: ${el}`);
  });
});

// ── pageNav – omitted on the add page (02-§114.4) ─────────────────────────────

describe('quick-add button – omitted on add page (02-§114.4)', () => {
  it('QADD-05: present on non-add pages', () => {
    for (const href of ['index.html', 'schema.html', 'idag.html', 'arkiv.html']) {
      assert.ok(
        pageNav(href, SECTIONS).includes('quick-add-btn'),
        `Expected quick-add button on ${href}`,
      );
    }
  });

  it('QADD-06: absent on lagg-till.html', () => {
    assert.ok(
      !pageNav('lagg-till.html', SECTIONS).includes('quick-add-btn'),
      'Quick-add button must be omitted on the add-activity page',
    );
  });
});

// ── reachable without the hamburger menu (02-§114.2) ──────────────────────────

describe('quick-add button – outside the hamburger menu (02-§114.2)', () => {
  it('QADD-07: the button is not nested inside the nav-menu container', () => {
    const html = pageNav('schema.html', SECTIONS);
    const menuStart = html.indexOf('<div class="nav-menu"');
    const btnStart = html.indexOf('quick-add-btn');
    assert.ok(btnStart !== -1 && menuStart !== -1, 'Both button and nav-menu must exist');
    assert.ok(
      btnStart < menuStart,
      'Quick-add button must be rendered before (outside) the nav-menu so it is reachable without opening the hamburger',
    );
  });
});

// ── rendered pages carry the button except the add page (02-§114.1, §114.4) ───

describe('quick-add button – across rendered pages (02-§114.1, §114.4)', () => {
  it('QADD-08: schema, idag, index and arkiv pages include the button', () => {
    assert.ok(renderSchedulePage(CAMP, EVENTS, '', SECTIONS).includes('quick-add-btn'));
    assert.ok(renderIdagPage(CAMP, EVENTS, '', SECTIONS).includes('quick-add-btn'));
    assert.ok(
      renderIndexPage({ heroSrc: null, heroAlt: null, sections: [] }, '', SECTIONS)
        .includes('quick-add-btn'),
    );
    assert.ok(renderArkivPage([], '', SECTIONS).includes('quick-add-btn'));
  });

  it('QADD-09: the add-activity page itself omits the button', () => {
    assert.ok(
      !renderAddPage(CAMP, LOCATIONS, API_URL, '', SECTIONS).includes('quick-add-btn'),
    );
  });
});

// ── CSS – mobile-only visibility and styling (02-§114.5, §114.7) ──────────────

describe('quick-add button – CSS rules (02-§114.5, §114.6, §114.7, §114.9)', () => {
  it('QADD-10: hidden by default (display: none)', () => {
    assert.match(
      CSS,
      /\.quick-add-btn\s*\{[^}]*display:\s*none/,
      'Expected a default `.quick-add-btn { display: none }` rule',
    );
  });

  it('QADD-11: shown as a 42×42 terracotta button inside the ≤767 px media query', () => {
    // The mobile rule carries the terracotta background and 42 px sizing.
    const mobileRule = CSS.match(/\.quick-add-btn\s*\{[^}]*var\(--color-terracotta\)[^}]*\}/);
    assert.ok(mobileRule, 'Expected a `.quick-add-btn` rule using --color-terracotta');
    assert.ok(/display:\s*flex/.test(mobileRule[0]), 'Mobile rule should display: flex');
    assert.ok(/42px/.test(mobileRule[0]), 'Mobile rule should size the button at 42px');
    assert.ok(
      /border-radius:\s*var\(--radius-md\)/.test(mobileRule[0]),
      'Mobile rule should use --radius-md border-radius',
    );
  });

  it('QADD-12: positioned between the up-arrow and the feedback button', () => {
    assert.ok(
      CSS.includes('right: calc(var(--space-sm) + 42px + var(--space-xs))'),
      'Quick-add button should occupy the slot left of the feedback button',
    );
  });

  it('QADD-13: PWA-install button shifts one slot left so they never overlap', () => {
    assert.ok(
      CSS.includes('right: calc(var(--space-sm) + 2 * (42px + var(--space-xs)))'),
      'PWA-install button should move one slot further left',
    );
  });
});
