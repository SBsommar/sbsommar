'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const SW_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'static', 'sw.js'),
  'utf8',
);

// Return the source text of the function whose definition starts on the
// line containing `header`. Matches balanced braces from the first `{`
// after the header.
function extractFunctionBody(src, header) {
  const headerIdx = src.indexOf(header);
  assert.ok(headerIdx !== -1, `source must contain header: ${header}`);
  const openIdx = src.indexOf('{', headerIdx);
  assert.ok(openIdx !== -1, `function body must start with { after: ${header}`);
  let depth = 0;
  for (let i = openIdx; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return src.substring(openIdx, i + 1);
    }
  }
  throw new Error(`unterminated function body for header: ${header}`);
}

// ── §96.2 — install calls self.skipWaiting() ────────────────────────────────

describe('02-§96.2 — install handler calls self.skipWaiting()', () => {
  it('SWH-01: sw.js install handler contains self.skipWaiting()', () => {
    const body = extractFunctionBody(SW_SRC, "addEventListener('install'");
    assert.ok(
      body.includes('self.skipWaiting()'),
      'install handler must call self.skipWaiting()',
    );
  });
});

// ── §96.3 — install uses cache: 'reload' to bypass HTTP cache ───────────────

describe("02-§96.3 — install uses cache: 'reload' for pre-cache fetches", () => {
  it("SWH-02: sw.js wraps pre-cache URLs as new Request(u, { cache: 'reload' })", () => {
    const body = extractFunctionBody(SW_SRC, "addEventListener('install'");
    assert.ok(
      /new Request\([^,]+,\s*\{\s*cache:\s*['"]reload['"]/.test(body),
      "install handler must wrap URLs as new Request(u, { cache: 'reload' })",
    );
  });
});

// ── §96.4 — activate claims clients and deletes old caches ──────────────────

describe('02-§96.4 — activate handler deletes old caches and claims clients', () => {
  it('SWH-03: activate handler calls self.clients.claim()', () => {
    const body = extractFunctionBody(SW_SRC, "addEventListener('activate'");
    assert.ok(
      body.includes('self.clients.claim()'),
      'activate handler must call self.clients.claim()',
    );
  });

  it('SWH-04: activate handler deletes caches whose key is not CACHE_NAME', () => {
    const body = extractFunctionBody(SW_SRC, "addEventListener('activate'");
    assert.ok(
      body.includes('caches.delete') && body.includes('!== CACHE_NAME'),
      'activate handler must delete caches !== CACHE_NAME',
    );
  });
});

// ── §96.5 — cacheFirst primary lookup is exact; fallback may ignoreSearch ──

describe('02-§96.5 — cacheFirstThenNetwork primary lookup is exact', () => {
  it('SWH-05: primary caches.match before fetch does not pass ignoreSearch', () => {
    const body = extractFunctionBody(SW_SRC, 'function cacheFirstThenNetwork');
    const fetchIdx = body.indexOf('fetch(request)');
    assert.ok(fetchIdx !== -1, 'body must contain fetch(request)');
    const primary = body.substring(0, fetchIdx);
    assert.ok(
      primary.includes('caches.match(request)') || primary.includes('caches.match(request,'),
      'primary section must call caches.match(request, ...)',
    );
    assert.ok(
      !/caches\.match\([^)]*ignoreSearch/.test(primary),
      'primary caches.match must not use ignoreSearch',
    );
  });
});

// ── §96.6 — network-first strategies KEEP ignoreSearch ──────────────────────

describe('02-§96.6 — network-first strategies keep ignoreSearch', () => {
  it('SWH-06: networkFirstThenCache uses ignoreSearch on cache fallback', () => {
    const body = extractFunctionBody(SW_SRC, 'function networkFirstThenCache');
    assert.ok(
      body.includes('ignoreSearch'),
      'networkFirstThenCache must use ignoreSearch on its cache fallback',
    );
  });

  it('SWH-07: networkFirstWithOfflineFallback uses ignoreSearch on cache fallback', () => {
    const body = extractFunctionBody(
      SW_SRC,
      'function networkFirstWithOfflineFallback',
    );
    assert.ok(
      body.includes('ignoreSearch'),
      'networkFirstWithOfflineFallback must use ignoreSearch on its cache fallback',
    );
  });
});

// ── §96.16 — version.json is never cached ───────────────────────────────────

describe('02-§96.16 — fetch handler bypasses version.json', () => {
  it('SWH-12: fetch handler returns early for version.json before any cache strategy', () => {
    const body = extractFunctionBody(SW_SRC, "addEventListener('fetch'");
    const guardIdx = body.search(/version\.json['"]\s*\)\s*\)\s*return/);
    assert.ok(
      guardIdx !== -1,
      "fetch handler must early-return for a path ending in version.json",
    );
    // The bypass must come before the events.json / navigation routing so it
    // wins over any caching strategy.
    const eventsIdx = body.indexOf("endsWith('events.json')");
    assert.ok(eventsIdx !== -1, 'fetch handler must route events.json');
    assert.ok(
      guardIdx < eventsIdx,
      'version.json bypass must precede the events.json cache route',
    );
  });
});

// ── §96.13 — vanilla JavaScript, no imports ─────────────────────────────────

describe('02-§96.13 — sw.js is vanilla JavaScript with no imports', () => {
  it('SWH-08: sw.js has no import/require statements', () => {
    // Strip block + line comments before scanning so comment text doesn't trigger.
    const stripped = SW_SRC
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    assert.ok(
      !/^\s*import\s/m.test(stripped),
      'sw.js must not contain ES module import statements',
    );
    assert.ok(
      !/\brequire\s*\(/.test(stripped),
      'sw.js must not use CommonJS require',
    );
    assert.ok(
      !/\bimportScripts\s*\(/.test(stripped),
      'sw.js must not use importScripts (self-contained)',
    );
  });
});
