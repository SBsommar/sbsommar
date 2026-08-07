'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderArkivPage } = require('../source/build/render-arkiv');

const EDQHUB_URL = 'https://edqhub.com/join/sb-sommarlager-2026';

function makeCamp(overrides = {}) {
  return {
    id: '2026-07-syssleback',
    name: 'SB sommar 2026 juli',
    start_date: '2026-07-26',
    end_date: '2026-08-02',
    location: 'Sysslebäck',
    link: 'https://www.facebook.com/groups/syssleback2026',
    archived: true,
    ...overrides,
  };
}

// Isolates the archive panel anchor for the EDQ Hub link.
function hubAnchor(html) {
  return html.match(/<a[^>]*class="camp-hub-link"[^>]*>/);
}

describe('renderArkivPage – EDQ Hub link in the archive (02-§121.15, §121.16, §121.18)', () => {
  it('ARCHUB-01: a camp with an edqhub field renders a .camp-hub-link anchor', () => {
    const html = renderArkivPage([makeCamp({ edqhub: EDQHUB_URL })]);
    assert.ok(hubAnchor(html), 'Expected a .camp-hub-link anchor for a camp with edqhub');
  });

  it('ARCHUB-02: the hub link href is the edqhub URL, opening in a new tab safely (02-§121.16)', () => {
    const html = renderArkivPage([makeCamp({ edqhub: EDQHUB_URL })]);
    const a = hubAnchor(html);
    assert.ok(a, 'Expected the hub link anchor');
    assert.ok(a[0].includes(`href="${EDQHUB_URL}"`), `Expected href="${EDQHUB_URL}", got: ${a[0]}`);
    assert.ok(a[0].includes('target="_blank"'), `Expected target="_blank", got: ${a[0]}`);
    assert.ok(a[0].includes('rel="noopener noreferrer"'), `Expected rel="noopener noreferrer", got: ${a[0]}`);
    assert.ok(a[0].includes('aria-label="EDQ Hub"'), `Expected aria-label="EDQ Hub", got: ${a[0]}`);
  });

  it('ARCHUB-03: the hub link carries the shared EDQ Hub icon SVG (02-§121.16)', () => {
    const html = renderArkivPage([makeCamp({ edqhub: EDQHUB_URL })]);
    assert.ok(/<a[^>]*class="camp-hub-link"[^>]*>\s*<svg/.test(html), 'Expected the SVG badge inside the hub link');
  });

  it('ARCHUB-04: a camp without an edqhub field shows no hub link; the Facebook link remains (02-§121.18)', () => {
    const html = renderArkivPage([makeCamp()]);
    assert.ok(!hubAnchor(html), 'Expected no hub link when edqhub is absent');
    assert.ok(html.includes('class="camp-fb-link"'), 'Expected the Facebook link to remain');
  });

  it('ARCHUB-05: an unsafe edqhub URL is rejected — no hub link (02-§121.18)', () => {
    const html = renderArkivPage([makeCamp({ edqhub: 'javascript:alert(1)' })]);
    assert.ok(!hubAnchor(html), 'Expected an unsafe edqhub URL to produce no hub link');
  });
});
