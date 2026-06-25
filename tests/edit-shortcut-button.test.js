'use strict';

// Tests for the edit-shortcut button in the sticky navigation – 02-§115.
//
// The button's mobile-only visibility, exact on-screen placement, and the
// client-side reveal (cookie read + events.json fetch) cannot be fully
// verified in Node.js. The string-level checks below confirm the markup, the
// CSS rules, and the nav.js reveal logic exist; the visual/behavioural result
// is a manual checkpoint:
//   Manual checkpoint (02-§115.1, §115.6, §115.8): on a ≤767 px viewport with
//   an sb_session cookie owning at least one upcoming activity, open any page
//   other than redigera.html and confirm a pencil button appears beside the
//   hamburger menu button and opens redigera.html. With no such cookie, or on
//   a ≥768 px viewport, the button is absent. An admin token alone does NOT
//   reveal it.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { pageNav } = require('../source/build/layout');
const { renderSchedulePage } = require('../source/build/render');
const { renderEditPage } = require('../source/build/render-edit');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderIndexPage } = require('../source/build/render-index');
const { renderArkivPage } = require('../source/build/render-arkiv');

const CSS = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'),
  'utf8',
);
const NAVJS = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'nav.js'),
  'utf8',
);

const CAMP = { name: 'SB Sommar 2026', start_date: '2026-06-28', end_date: '2026-07-05' };
const EVENTS = [];
const LOCATIONS = ['Servicehus', 'Annat'];
const API_URL = 'https://api.example.com/edit-event';
const SECTIONS = [{ id: 'start', navLabel: 'Om lägret' }];

// Extract the edit-shortcut element from pageNav output for focused checks.
function editEl(html) {
  return html.match(/<a class="edit-shortcut-btn"[\s\S]*?<\/a>/)?.[0] || '';
}

// ── pageNav – structure (02-§115.4, §115.6, §115.11) ─────────────────────────

describe('edit-shortcut button – structure (02-§115.4, §115.6, §115.11)', () => {
  it('ESHORT-01: renders an <a class="edit-shortcut-btn"> element', () => {
    const html = pageNav('schema.html', SECTIONS);
    assert.ok(html.includes('<a class="edit-shortcut-btn"'), `Got: ${html}`);
  });

  it('ESHORT-02: the button links to redigera.html', () => {
    const el = editEl(pageNav('schema.html', SECTIONS));
    assert.ok(el.includes('href="redigera.html"'), `Got: ${el}`);
  });

  it('ESHORT-03: the button has aria-label="Redigera mina aktiviteter"', () => {
    const el = editEl(pageNav('schema.html', SECTIONS));
    assert.ok(el.includes('aria-label="Redigera mina aktiviteter"'), `Got: ${el}`);
  });

  it('ESHORT-04: the button is hidden by default (hidden attribute)', () => {
    const el = editEl(pageNav('schema.html', SECTIONS));
    assert.ok(el.includes('hidden'), `Expected the hidden attribute. Got: ${el}`);
  });

  it('ESHORT-05: the button contains an inline SVG pencil icon', () => {
    const el = editEl(pageNav('schema.html', SECTIONS));
    assert.ok(el.includes('<svg'), `Expected an inline SVG. Got: ${el}`);
  });
});

// ── pageNav – omitted on the edit page (02-§115.5) ───────────────────────────

describe('edit-shortcut button – omitted on edit page (02-§115.5)', () => {
  it('ESHORT-06: present on non-edit pages', () => {
    for (const href of ['index.html', 'schema.html', 'idag.html', 'arkiv.html', 'lagg-till.html']) {
      assert.ok(
        pageNav(href, SECTIONS).includes('edit-shortcut-btn'),
        `Expected edit-shortcut button on ${href}`,
      );
    }
  });

  it('ESHORT-07: absent on redigera.html', () => {
    assert.ok(
      !pageNav('redigera.html', SECTIONS).includes('edit-shortcut-btn'),
      'Edit-shortcut button must be omitted on the edit page',
    );
  });
});

// ── reachable without the hamburger menu, beside the toggle (02-§115.9) ───────

describe('edit-shortcut button – beside the menu button (02-§115.9)', () => {
  it('ESHORT-08: rendered after the nav-toggle but before the nav-menu', () => {
    const html = pageNav('schema.html', SECTIONS);
    const togglePos = html.indexOf('class="nav-toggle"');
    const btnPos = html.indexOf('edit-shortcut-btn');
    const menuPos = html.indexOf('<div class="nav-menu"');
    assert.ok(togglePos !== -1 && btnPos !== -1 && menuPos !== -1, 'toggle, button and menu must all exist');
    assert.ok(togglePos < btnPos, 'Edit-shortcut button must come after the hamburger toggle so it sits beside it');
    assert.ok(
      btnPos < menuPos,
      'Edit-shortcut button must be outside the nav-menu so it is reachable without opening the hamburger',
    );
  });
});

// ── rendered pages carry the button except the edit page (02-§115.1, §115.5) ──

describe('edit-shortcut button – across rendered pages (02-§115.1, §115.5)', () => {
  it('ESHORT-09: schema, idag, index and arkiv pages include the button', () => {
    assert.ok(renderSchedulePage(CAMP, EVENTS, '', SECTIONS).includes('edit-shortcut-btn'));
    assert.ok(renderIdagPage(CAMP, EVENTS, '', SECTIONS).includes('edit-shortcut-btn'));
    assert.ok(
      renderIndexPage({ heroSrc: null, heroAlt: null, sections: [] }, '', SECTIONS)
        .includes('edit-shortcut-btn'),
    );
    assert.ok(renderArkivPage([], '', SECTIONS).includes('edit-shortcut-btn'));
  });

  it('ESHORT-10: the edit page itself omits the button', () => {
    assert.ok(
      !renderEditPage(CAMP, LOCATIONS, API_URL, '', SECTIONS).includes('edit-shortcut-btn'),
    );
  });
});

// ── CSS – mobile-only visibility and styling (02-§115.8, §115.10) ────────────

describe('edit-shortcut button – CSS rules (02-§115.8, §115.9, §115.10)', () => {
  it('ESHORT-11: hidden by default (display: none)', () => {
    assert.match(
      CSS,
      /\.edit-shortcut-btn\s*\{[^}]*display:\s*none/,
      'Expected a default `.edit-shortcut-btn { display: none }` rule',
    );
  });

  it('ESHORT-12: shown as a 42×42 terracotta button inside the ≤767 px media query', () => {
    const mobileRule = CSS.match(/\.edit-shortcut-btn\s*\{[^}]*var\(--color-terracotta\)[^}]*\}/);
    assert.ok(mobileRule, 'Expected a `.edit-shortcut-btn` rule using --color-terracotta');
    assert.ok(/display:\s*flex/.test(mobileRule[0]), 'Mobile rule should display: flex');
    assert.ok(/42px/.test(mobileRule[0]), 'Mobile rule should size the button at 42px');
    assert.ok(
      /border-radius:\s*var\(--radius-md\)/.test(mobileRule[0]),
      'Mobile rule should use --radius-md border-radius',
    );
  });

  it('ESHORT-13: the hidden attribute keeps it hidden on mobile until JS clears it', () => {
    assert.match(
      CSS,
      /\.edit-shortcut-btn\[hidden\]\s*\{[^}]*display:\s*none/,
      'Expected `.edit-shortcut-btn[hidden] { display: none }` so the hidden attribute wins on mobile',
    );
  });

  it('ESHORT-14: positioned beside the hamburger menu button', () => {
    assert.ok(
      CSS.includes('left: calc(var(--space-sm) + 42px + var(--space-xs))'),
      'Edit-shortcut button should sit one slot right of the left-anchored hamburger',
    );
  });
});

// ── nav.js – owner-only reveal, admin token ignored (02-§115.6, §115.7) ──────

describe('edit-shortcut button – nav.js reveal logic (02-§115.6, §115.7)', () => {
  it('ESHORT-15: nav.js targets the edit-shortcut button', () => {
    assert.ok(NAVJS.includes('edit-shortcut-btn'), 'nav.js should select .edit-shortcut-btn');
  });

  it('ESHORT-16: nav.js reads the sb_session cookie and fetches events.json', () => {
    assert.ok(NAVJS.includes('sb_session'), 'nav.js should read the sb_session cookie');
    assert.ok(NAVJS.includes('events.json'), 'nav.js should fetch events.json to check dates');
  });

  it('ESHORT-17: nav.js reveals the button by clearing the hidden attribute', () => {
    assert.match(
      NAVJS,
      /\.hidden\s*=\s*false/,
      'nav.js should reveal the button via btn.hidden = false',
    );
  });

  it('ESHORT-18: nav.js never consults the admin token (02-§115.7)', () => {
    assert.ok(
      !NAVJS.includes('sb_admin'),
      'The reveal must depend only on own-activity ownership, never on the admin token',
    );
  });
});
