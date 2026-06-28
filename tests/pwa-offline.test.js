'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-15',
};

const LOCATIONS = ['Servicehus', 'Annat'];

// ── §92.3 — sw.js contains placeholder token for build injection ────────────

describe('02-§92.3 — sw.js uses build-injected pre-cache list', () => {
  const swPath = path.join(__dirname, '..', 'source', 'static', 'sw.js');

  it('OFF-01: sw.js contains the __PRE_CACHE_URLS__ placeholder', () => {
    const src = fs.readFileSync(swPath, 'utf8');
    assert.ok(
      src.includes('/* __PRE_CACHE_URLS__ */'),
      'sw.js must contain /* __PRE_CACHE_URLS__ */ placeholder for build injection',
    );
  });
});

// ── §96.1 — Cache name is sb-sommar-v8 ──────────────────────────────────────

describe('02-§96.1 — Cache name is sb-sommar-v8', () => {
  it('OFF-02: sw.js uses sb-sommar-v8 cache name', () => {
    const swPath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(swPath, 'utf8');
    assert.ok(
      src.includes("'sb-sommar-v8'"),
      'CACHE_NAME must be sb-sommar-v8',
    );
  });
});

// ── §92.9 — NO_CACHE_PATTERNS contains only API endpoints ──────────────────

describe('02-§92.9 — NO_CACHE_PATTERNS contains only API endpoints', () => {
  const swPath = path.join(__dirname, '..', 'source', 'static', 'sw.js');

  it('OFF-03: NO_CACHE_PATTERNS includes /add-event', () => {
    const src = fs.readFileSync(swPath, 'utf8');
    assert.ok(src.includes("'/add-event'"), 'must include /add-event');
  });

  it('OFF-04: NO_CACHE_PATTERNS includes /edit-event', () => {
    const src = fs.readFileSync(swPath, 'utf8');
    assert.ok(src.includes("'/edit-event'"), 'must include /edit-event');
  });

  it('OFF-05: NO_CACHE_PATTERNS includes /delete-event', () => {
    const src = fs.readFileSync(swPath, 'utf8');
    assert.ok(src.includes("'/delete-event'"), 'must include /delete-event');
  });

  it('OFF-06: NO_CACHE_PATTERNS includes /verify-admin', () => {
    const src = fs.readFileSync(swPath, 'utf8');
    assert.ok(src.includes("'/verify-admin'"), 'must include /verify-admin');
  });

  it('OFF-07: NO_CACHE_PATTERNS includes /api/', () => {
    const src = fs.readFileSync(swPath, 'utf8');
    assert.ok(src.includes("'/api/'"), 'must include /api/');
  });

  it('OFF-08: NO_CACHE_PATTERNS does not include any .html pages', () => {
    const src = fs.readFileSync(swPath, 'utf8');
    const noCacheSection = src.substring(
      src.indexOf('NO_CACHE_PATTERNS'),
      src.indexOf('];', src.indexOf('NO_CACHE_PATTERNS')),
    );
    assert.ok(
      !noCacheSection.includes('.html'),
      'NO_CACHE_PATTERNS must not include any .html pages',
    );
  });
});

// ── §96.5, §96.6 — ignoreSearch scoped to network-first strategies ────────

describe('02-§96.5/§96.6 — Cache-match scope for ignoreSearch', () => {
  const swPath = path.join(__dirname, '..', 'source', 'static', 'sw.js');

  it('OFF-09: sw.js still uses ignoreSearch in at least one cache match', () => {
    const src = fs.readFileSync(swPath, 'utf8');
    assert.ok(
      src.includes('ignoreSearch'),
      'sw.js must use ignoreSearch for network-first fallback',
    );
  });
});

// ── §92.12 — offline-guard.js exists ────────────────────────────────────────

describe('02-§92.12 — offline-guard.js exists', () => {
  it('OFF-10: source/assets/js/client/offline-guard.js exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'offline-guard.js');
    assert.ok(fs.existsSync(filePath), 'offline-guard.js must exist');
  });

  it('OFF-11: offline-guard.js references navigator.onLine', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'offline-guard.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('navigator.onLine'),
      'offline-guard.js must use navigator.onLine',
    );
  });

  it('OFF-12: offline-guard.js contains Swedish offline message', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'offline-guard.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('Du är offline'),
      'offline-guard.js must contain Swedish offline message',
    );
  });
});

// ── §92.17 — offline-guard.js included on form pages ────────────────────────

describe('02-§92.17 — offline-guard.js included on form pages', () => {
  it('OFF-13: add-activity page includes offline-guard.js', () => {
    const html = renderAddPage(CAMP, LOCATIONS, '/add-event');
    assert.ok(
      html.includes('offline-guard.js'),
      'lagg-till.html must include offline-guard.js',
    );
  });

  it('OFF-14: edit-activity page includes offline-guard.js', () => {
    const html = renderEditPage(CAMP, LOCATIONS, '/edit-event');
    assert.ok(
      html.includes('offline-guard.js'),
      'redigera.html must include offline-guard.js',
    );
  });
});

// ── §92.18 — feedback.js has offline detection ──────────────────────────────

describe('02-§92.18 — feedback.js has offline detection', () => {
  it('OFF-15: feedback.js references navigator.onLine', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'feedback.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('navigator.onLine'),
      'feedback.js must use navigator.onLine for offline detection',
    );
  });

  it('OFF-16: feedback.js contains Swedish offline message', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'feedback.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('offline'),
      'feedback.js must contain offline messaging',
    );
  });
});

// ── §92.6 — PRE_CACHE_URLS populated by build, no hand-maintained list ──────

describe('02-§92.6 — PRE_CACHE_URLS from build injection', () => {
  it('OFF-17: sw.js source does not contain a hand-maintained URL list', () => {
    const swPath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(swPath, 'utf8');
    // The source sw.js should have the placeholder, not hardcoded page URLs
    assert.ok(
      !src.includes("'/index.html'"),
      'sw.js source must not contain hardcoded /index.html — list is build-injected',
    );
  });
});
