'use strict';

// ── 02-§69.6 — style.css is split into a live bundle and a site bundle ───────
// The display board (live.html) loads only the schedule/display CSS; every page
// with site chrome loads that plus the rest. See source/build/split-css.js.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { splitCss, LIVE_SECTION_TITLES } = require('../source/build/split-css');
const { renderTodayPage } = require('../source/build/render-today');
const { renderIdagPage } = require('../source/build/render-idag');

const SOURCE_CSS = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'),
  'utf8',
);

describe('02-§69.6 — CSS split into live + site bundles', () => {
  const { live, site, titles } = splitCss(SOURCE_CSS);

  it('CSSPLIT-01: every source line lands in exactly one bundle (no loss, no duplication)', () => {
    const srcLines = SOURCE_CSS.split('\n').length;
    const outLines = live.split('\n').length + site.split('\n').length;
    assert.equal(outLines, srcLines, 'live + site line count must equal the source');
  });

  it('CSSPLIT-02: the live bundle is a strict subset — smaller than the source', () => {
    assert.ok(live.length < SOURCE_CSS.length, 'live bundle smaller than source');
    assert.ok(site.length > 0, 'site bundle is non-empty');
    assert.ok(
      live.length + site.length + 1 >= SOURCE_CSS.length,
      'the two bundles together account for the whole source',
    );
  });

  it('CSSPLIT-03: base tokens (:root custom properties) are in the live bundle', () => {
    // The display board loads only the live bundle, so it must carry the tokens
    // every rule references.
    assert.ok(live.includes(':root'), ':root token block present in live bundle');
    assert.ok(live.includes('--color-sage'), 'design tokens present in live bundle');
  });

  it('CSSPLIT-04: schedule/display sections are in the live bundle', () => {
    assert.ok(live.includes('body.display-mode'), 'display-mode styling in live bundle');
    assert.ok(live.includes('.dagens-layout'), 'dagens layout in live bundle');
    assert.ok(live.includes('.status-clock'), 'live clock styling in live bundle');
    assert.ok(live.includes('.event-row'), 'event rows in live bundle');
  });

  it('CSSPLIT-05: site-chrome sections are in the site bundle, not the live bundle', () => {
    // A few representative chrome selectors the display board never uses.
    for (const sel of ['.site-footer', '.md-toolbar', '.lokaler-grid-wrapper']) {
      assert.ok(site.includes(sel), `${sel} present in site bundle`);
      assert.ok(!live.includes(sel), `${sel} absent from live bundle`);
    }
  });

  it('CSSPLIT-06: every LIVE_SECTION_TITLES entry matches a real section header', () => {
    for (const t of LIVE_SECTION_TITLES) {
      assert.ok(titles.includes(t), `section "${t}" exists in style.css`);
    }
  });
});

describe('02-§69.6 — page <link> tags reflect the split', () => {
  const CAMP = { name: 'SB sommar 2099', location: 'Sysslebäck', start_date: '2099-07-01', end_date: '2099-07-07' };
  const EVENTS = [];
  const QR = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

  it('CSSPLIT-07: live.html links only the live bundle (style.css), not site.css', () => {
    const html = renderTodayPage(CAMP, EVENTS, QR);
    assert.ok(html.includes('href="style.css"'), 'live bundle linked');
    assert.ok(!html.includes('site.css'), 'site bundle NOT linked on the display board');
  });

  it('CSSPLIT-08: a chrome page (idag.html) links both bundles', () => {
    const html = renderIdagPage(CAMP, EVENTS);
    assert.ok(html.includes('href="style.css"'), 'live bundle linked');
    assert.ok(html.includes('href="site.css"'), 'site bundle also linked');
  });
});
