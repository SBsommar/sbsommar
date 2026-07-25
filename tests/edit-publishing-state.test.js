'use strict';

// Tests for the edit-page "publishing window" UX — 02-§48.7 (§48.19–§48.26),
// plus the add/batch success-modal note 02-§19.18 and 02-§80.31.
//
// A freshly submitted activity is not in events.json until the post-merge build
// and deploy finish (~15 min), but its signed ownership entry is in the cookie
// immediately. The edit page therefore distinguishes "owned but still
// publishing" (calm pending panel + automatic re-check) from "unowned and truly
// missing" (the existing not-found error).
//
// What is verifiable in Node.js: the rendered #edit-pending markup and the
// presence of the client-side logic in redigera.js / lagg-till.js source.
// The live behaviour (polling cadence, auto-populate on appear, aria-live
// announcements) is a manual checkpoint:
//   Manual checkpoint (02-§48.21–48.24): open /redigera.html?id=<owned id not
//   yet in events.json>; confirm the calm publishing panel appears (not the red
//   error), that events.json is re-fetched every ~20 s (cache-busted) in the
//   Network panel, that "Uppdatera nu" forces an immediate re-check, and that
//   the form populates automatically once the activity appears.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { renderEditPage } = require('../source/build/render-edit');

const CAMP = { name: 'SB Sommar 2026', start_date: '2026-06-21', end_date: '2026-06-27' };
const LOCATIONS = ['Servicehus', 'Annat'];
const API_URL = 'https://api.example.com/edit-event';

const REDIGERA_JS = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'redigera.js'),
  'utf8',
);
const LAGGTILL_JS = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'lagg-till.js'),
  'utf8',
);

function render() {
  return renderEditPage(CAMP, LOCATIONS, API_URL);
}

// ── 02-§48.19 / §48.20 / §48.23 — publishing panel markup ──────────────────

describe('02-§48.7 — publishing panel markup', () => {
  it('REDT-PUB-01: edit page renders a #edit-pending panel', () => {
    const html = render();
    assert.ok(html.includes('id="edit-pending"'), 'Expected a #edit-pending element');
  });

  it('REDT-PUB-01: publishing panel is hidden by default', () => {
    const html = render();
    const block = html.match(/<[^>]*id="edit-pending"[^>]*>/);
    assert.ok(block, 'Expected the #edit-pending opening tag');
    assert.ok(/\bhidden\b/.test(block[0]), 'Expected #edit-pending to be hidden by default');
  });

  it('REDT-PUB-01 (02-§48.20): panel explains the activity is publishing (Swedish)', () => {
    const html = render();
    assert.match(html, /publiceras/i, 'Expected Swedish "publiceras" wording in the panel');
  });

  it('REDT-PUB-01 (02-§48.23): panel has an "Uppdatera nu" control and an aria-live status', () => {
    const html = render();
    assert.ok(html.includes('id="edit-pending-retry"'), 'Expected #edit-pending-retry button');
    assert.match(html, /Uppdatera nu/i, 'Expected "Uppdatera nu" label');
    const status = html.match(/<[^>]*id="edit-pending-status"[^>]*>/);
    assert.ok(status, 'Expected #edit-pending-status element');
    assert.match(status[0], /aria-live="polite"/, 'Expected aria-live="polite" on the status line');
  });
});

// ── 02-§48.26 — cache-busted events.json fetch ─────────────────────────────

describe('02-§48.26 — cache-busted events.json fetch', () => {
  it('REDT-PUB-04: redigera.js has a fetchEvents helper that cache-busts events.json', () => {
    assert.match(REDIGERA_JS, /function fetchEvents\s*\(/, 'Expected a fetchEvents() helper');
    // The helper must append a cache-busting query and disable HTTP caching.
    assert.match(REDIGERA_JS, /events\.json\?t='\s*\+\s*Date\.now\(\)/,
      'Expected events.json to be fetched with a ?t= cache-buster');
    assert.match(REDIGERA_JS, /cache:\s*'no-store'/, "Expected { cache: 'no-store' }");
  });

  it('REDT-PUB-04: redigera.js no longer fetches a bare /events.json', () => {
    assert.ok(
      !/fetch\('\/events\.json'\)/.test(REDIGERA_JS),
      'Expected all events.json fetches to go through the cache-busting helper',
    );
  });
});

// ── 02-§48.19 / §48.25 — pending-vs-error decision ─────────────────────────

describe('02-§48.7 — pending-vs-error decision', () => {
  it('REDT-PUB-01/03: redigera.js shows the pending panel only for an owned id', () => {
    // The owned-but-missing branch shows the pending panel; the unowned branch
    // keeps the existing not-found error.
    assert.match(REDIGERA_JS, /function showPending\s*\(/, 'Expected a showPending() helper');
    assert.ok(
      REDIGERA_JS.includes('ownedIds.indexOf(eventId)'),
      'Expected the not-found branch to test cookie ownership before deciding pending vs error',
    );
    assert.ok(
      REDIGERA_JS.includes("showError('Aktiviteten hittades inte i det aktuella schemat.')"),
      'Expected the unowned not-found error to be preserved',
    );
  });

  it('REDT-PUB-02: a shared showEditForm path populates the form (first load and re-check)', () => {
    assert.match(REDIGERA_JS, /function showEditForm\s*\(/,
      'Expected a shared showEditForm() used by both the first load and the re-check');
  });
});

// ── 02-§48.21 / §48.24 — re-check cadence and ceiling ──────────────────────

describe('02-§48.7 — automatic re-check cadence and ceiling', () => {
  it('REDT-PUB-01: redigera.js polls every 20 s up to a 15-minute ceiling', () => {
    assert.match(REDIGERA_JS, /20\s*\*\s*1000|20000/, 'Expected a 20-second re-check interval');
    assert.match(REDIGERA_JS, /15\s*\*\s*60\s*\*\s*1000|900000/, 'Expected a 15-minute ceiling');
  });
});

// ── 02-§19.18 / §80.31 — add/batch success note ────────────────────────────

describe('02-§19.18 / §80.31 — success modal editing note', () => {
  it('lagg-till.js success modals note the activity is editable once published', () => {
    // Single and batch success states both mention that editing follows publish.
    const matches = LAGGTILL_JS.match(/publicerat|publicerats|publicerad/gi) || [];
    assert.ok(
      matches.length >= 2,
      'Expected both single and batch success states to mention editing after publish',
    );
  });
});
