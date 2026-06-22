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
  edqhubUrl: null,
  countdownTarget: null,
  sections: [{ id: 'start', navLabel: 'Start', html: '<p>Intro</p>' }],
};

const GC_CODE = 'sbsommar';

// ── Helper: call a render function with goatcounterCode ─────────────────────

// Each render function accepts goatcounterCode as the last parameter.
// These helpers produce HTML with and without the code.

function scheduleWith(code) {
  return renderSchedulePage(CAMP, EVENTS, '', [], '', '', code);
}
function scheduleWithout() {
  return renderSchedulePage(CAMP, EVENTS);
}
function addWith(code) {
  return renderAddPage(CAMP, LOCATIONS, '/add-event', '', [], code);
}
function addWithout() {
  return renderAddPage(CAMP, LOCATIONS, '/add-event');
}
function editWith(code) {
  return renderEditPage(CAMP, LOCATIONS, '/edit-event', '', [], '', code);
}
function editWithout() {
  return renderEditPage(CAMP, LOCATIONS, '/edit-event');
}
function idagWith(code) {
  return renderIdagPage(CAMP, EVENTS, '', [], '', code);
}
function idagWithout() {
  return renderIdagPage(CAMP, EVENTS);
}
function todayWith(code) {
  return renderTodayPage(CAMP, EVENTS, QR_SVG, '', '', code);
}
function todayWithout() {
  return renderTodayPage(CAMP, EVENTS, QR_SVG);
}
function indexWith(code) {
  return renderIndexPage(INDEX_PAGE, '', [], code);
}
function indexWithout() {
  return renderIndexPage(INDEX_PAGE);
}
function arkivWith(code) {
  return renderArkivPage([], '', [], {}, code);
}
function arkivWithout() {
  return renderArkivPage([]);
}
function kalenderWith(code) {
  return renderKalenderPage(CAMP, 'https://example.com', '', [], code);
}
function kalenderWithout() {
  return renderKalenderPage(CAMP, 'https://example.com');
}

// ── 02-§63.7 — Script on all shared-layout pages ───────────────────────────

describe('02-§63.7 — GoatCounter script on all shared-layout pages', () => {
  const sharedLayoutPages = [
    ['schedule', () => scheduleWith(GC_CODE)],
    ['add-activity', () => addWith(GC_CODE)],
    ['edit-activity', () => editWith(GC_CODE)],
    ['idag', () => idagWith(GC_CODE)],
    ['index', () => indexWith(GC_CODE)],
    ['arkiv', () => arkivWith(GC_CODE)],
    ['kalender', () => kalenderWith(GC_CODE)],
  ];

  for (const [name, fn] of sharedLayoutPages) {
    it(`ANA-SH-${name}: ${name} page includes GoatCounter script`, () => {
      const html = fn();
      assert.ok(html.includes('goatcounter.com/count'), `${name} has GoatCounter endpoint`);
      assert.ok(html.includes('count.js'), `${name} loads count.js`);
    });
  }
});

// ── 02-§63.8 — Script on display view ──────────────────────────────────────

describe('02-§63.8 — GoatCounter script on display view', () => {
  it('ANA-DIS-01: display view includes GoatCounter script', () => {
    const html = todayWith(GC_CODE);
    assert.ok(html.includes('goatcounter.com/count'), 'display view has GoatCounter endpoint');
    assert.ok(html.includes('count.js'), 'display view loads count.js');
  });
});

// ── 02-§63.9 — Script loads async, non-blocking ────────────────────────────

describe('02-§63.9 — GoatCounter script is async', () => {
  it('ANA-ASYNC-01: script tag has async attribute', () => {
    const html = scheduleWith(GC_CODE);
    const match = html.match(/<script[^>]*goatcounter[^>]*>/);
    assert.ok(match, 'GoatCounter script tag found');
    assert.ok(match[0].includes('async'), 'script tag is async');
  });
});

// ── 02-§63.10 — GOATCOUNTER_SITE_CODE env var ──────────────────────────────

describe('02-§63.10 — GoatCounter endpoint uses site code', () => {
  it('ANA-CODE-01: endpoint URL contains the provided site code', () => {
    const html = scheduleWith('my-site');
    assert.ok(html.includes('my-site.goatcounter.com/count'), 'site code in endpoint URL');
  });
});

// ── 02-§63.11 — No script when env var absent ──────────────────────────────

describe('02-§63.11 — No GoatCounter script when code is absent', () => {
  const pagesWithout = [
    ['schedule', scheduleWithout],
    ['add-activity', addWithout],
    ['edit-activity', editWithout],
    ['idag', idagWithout],
    ['display', todayWithout],
    ['index', indexWithout],
    ['arkiv', arkivWithout],
    ['kalender', kalenderWithout],
  ];

  for (const [name, fn] of pagesWithout) {
    it(`ANA-NO-${name}: ${name} page has no GoatCounter when code absent`, () => {
      const html = fn();
      assert.ok(!html.includes('goatcounter.com/count'), `${name} has no GoatCounter`);
    });
  }
});

// ── 02-§63.37 — data-goatcounter-click attributes ──────────────────────────

describe('02-§63.37 — Custom events use data-goatcounter-click', () => {
  it('ANA-EVT-01: Discord link has data-goatcounter-click', () => {
    const page = renderIndexPage(
      { ...INDEX_PAGE, discordUrl: 'https://discord.gg/test' },
      '', [], GC_CODE,
    );
    assert.ok(page.includes('data-goatcounter-click="click-discord"'), 'Discord link tracked');
  });

  it('ANA-EVT-02: Facebook link has data-goatcounter-click', () => {
    const page = renderIndexPage(
      { ...INDEX_PAGE, facebookUrl: 'https://facebook.com/test' },
      '', [], GC_CODE,
    );
    assert.ok(page.includes('data-goatcounter-click="click-facebook"'), 'Facebook link tracked');
  });

  it('ANA-EVT-07: EDQ Hub link has data-goatcounter-click', () => {
    const page = renderIndexPage(
      { ...INDEX_PAGE, edqhubUrl: 'https://edqhub.com/join/test' },
      '', [], GC_CODE,
    );
    assert.ok(page.includes('data-goatcounter-click="click-edqhub"'), 'EDQ Hub link tracked');
  });
});

// ── 02-§63.24/63.25 — Social links tracked even without analytics code ─────

describe('02-§63.24/63.25 — Social link tracking attributes present', () => {
  it('ANA-EVT-03: Discord link has tracking attr regardless of analytics code', () => {
    const page = renderIndexPage(
      { ...INDEX_PAGE, discordUrl: 'https://discord.gg/test' },
    );
    assert.ok(page.includes('data-goatcounter-click="click-discord"'), 'Discord attr present');
  });

  it('ANA-EVT-04: Facebook link has tracking attr regardless of analytics code', () => {
    const page = renderIndexPage(
      { ...INDEX_PAGE, facebookUrl: 'https://facebook.com/test' },
    );
    assert.ok(page.includes('data-goatcounter-click="click-facebook"'), 'Facebook attr present');
  });
});

// ── 02-§63.26 — iCal download tracking ─────────────────────────────────────

describe('02-§63.26 — iCal links have tracking attribute', () => {
  it('ANA-EVT-05: schedule page iCal link has data-goatcounter-click', () => {
    const html = scheduleWith(GC_CODE);
    assert.ok(html.includes('data-goatcounter-click="download-ical"'), 'iCal link tracked');
  });
});

// ── 02-§63.27 — RSS link tracking ──────────────────────────────────────────

describe('02-§63.27 — RSS link has tracking attribute', () => {
  it('ANA-EVT-06: schedule page RSS link has data-goatcounter-click', () => {
    const html = scheduleWith(GC_CODE);
    assert.ok(html.includes('data-goatcounter-click="click-rss"'), 'RSS link tracked');
  });
});

// ── 02-§63.29/63.31 — QR codes data file ───────────────────────────────────

describe('02-§63.29 — QR codes data file exists', () => {
  it('ANA-QR-01: source/data/qr-codes.yaml exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'data', 'qr-codes.yaml');
    assert.ok(fs.existsSync(filePath), 'qr-codes.yaml exists');
  });
});

describe('02-§63.31 — QR code entries have id and description', () => {
  it('ANA-QR-02: each entry has id and description fields', () => {
    const yaml = require('js-yaml');
    const filePath = path.join(__dirname, '..', 'source', 'data', 'qr-codes.yaml');
    const data = yaml.load(fs.readFileSync(filePath, 'utf8'));
    assert.ok(Array.isArray(data.codes), 'codes is an array');
    assert.ok(data.codes.length > 0, 'at least one QR code entry');
    for (const entry of data.codes) {
      assert.ok(typeof entry.id === 'string' && entry.id.length > 0, `entry has id: ${entry.id}`);
      assert.ok(typeof entry.description === 'string' && entry.description.length > 0, `entry has description: ${entry.description}`);
    }
  });
});

// ── 02-§63.33 — Display view QR uses tracked ref ───────────────────────────

describe('02-§63.33 — Display view QR code uses ref parameter from qr-codes.yaml', () => {
  it('ANA-QR-03: build.js reads qr-codes.yaml and appends ?ref= to QR URL', () => {
    // The ?ref= parameter is embedded in the QR code SVG at build time.
    // We verify that build.js contains the logic to read qr-codes.yaml
    // and append the ref parameter to the QR code URL.
    const buildSrc = fs.readFileSync(
      path.join(__dirname, '..', 'source', 'build', 'build.js'), 'utf8',
    );
    assert.ok(buildSrc.includes('qr-codes.yaml'), 'build.js references qr-codes.yaml');
    assert.ok(buildSrc.includes('?ref='), 'build.js appends ?ref= to QR URL');
  });
});
