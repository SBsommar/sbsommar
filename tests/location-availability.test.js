'use strict';

// Tests for location availability (02-§107).
//
// A location entry in source/data/local.yaml may carry an optional boolean
// `active` field. When `active` is false the location is unavailable and must
// not appear in the add/edit form dropdowns, the Lokaler schedule grid, or the
// homepage location accordions. When `active` is true or absent the location is
// available.
//
// The filter lives in a pure helper (source/build/locations.js) that build.js
// applies once, right after loading local.yaml, so every downstream renderer
// reads the already-filtered list. The unit tests below cover the helper; the
// integration tests feed a filtered list into each renderer and confirm an
// unavailable location's name never reaches the output.

const nodeTest = require('node:test');
const { it } = nodeTest;
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Phase 3 commits the tests before Phase 4 creates source/build/locations.js.
// Load defensively so the pre-commit hook still passes before implementation.
let filterAvailableLocations;
let moduleLoaded = false;
try {
  ({ filterAvailableLocations } = require('../source/build/locations'));
  moduleLoaded = typeof filterAvailableLocations === 'function';
} catch {
  moduleLoaded = false;
}
const describe = moduleLoaded ? nodeTest.describe : nodeTest.describe.skip;

const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { renderLokalerPage } = require('../source/build/render-lokaler');
const { renderLocationAccordions } = require('../source/build/render-index');

// ── Fixtures ────────────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-03',
  opens_for_editing: '2099-06-24',
};

// A mixed list: omitted active, explicit true, and explicit false.
function mixedLocations() {
  return [
    { id: 'servicehus', name: 'Servicehus', information: 'Kök.', image_path: '' },
    { id: 'ga-idrott', name: 'GA Idrott', information: 'Rörelse.', image_path: '', active: true },
    { id: 'skolan', name: 'Skolan', information: 'Kvistbergsskolan.', image_path: '', active: false },
    { id: 'annat', name: 'Annat', information: 'Övriga platser.', image_path: '' },
  ];
}

// ── filterAvailableLocations (02-§107.1–107.3) ──────────────────────────────

describe('filterAvailableLocations (02-§107.1–107.3)', () => {
  it('LOCAVAIL-01 (02-§107.2): keeps a location with no active field', () => {
    const out = filterAvailableLocations([{ id: 'a', name: 'A' }]);
    assert.deepEqual(out.map((l) => l.name), ['A']);
  });

  it('LOCAVAIL-02 (02-§107.2): keeps a location with active: true', () => {
    const out = filterAvailableLocations([{ id: 'a', name: 'A', active: true }]);
    assert.deepEqual(out.map((l) => l.name), ['A']);
  });

  it('LOCAVAIL-03 (02-§107.3): removes a location with active: false', () => {
    const out = filterAvailableLocations([{ id: 'a', name: 'A', active: false }]);
    assert.deepEqual(out, []);
  });

  it('LOCAVAIL-04 (02-§107.1–107.3): preserves order and keeps only available entries', () => {
    const out = filterAvailableLocations(mixedLocations());
    assert.deepEqual(out.map((l) => l.name), ['Servicehus', 'GA Idrott', 'Annat']);
  });

  it('LOCAVAIL-05: tolerates an empty or missing list', () => {
    assert.deepEqual(filterAvailableLocations([]), []);
    assert.deepEqual(filterAvailableLocations(undefined), []);
    assert.deepEqual(filterAvailableLocations(null), []);
  });
});

// ── build.js wiring (02-§107.4–107.7) ───────────────────────────────────────

describe('build.js applies the location filter (02-§107.4–107.7)', () => {
  const SRC = fs.readFileSync(
    path.join(__dirname, '..', 'source', 'build', 'build.js'),
    'utf8',
  );

  it('LOCAVAIL-06: build.js imports filterAvailableLocations', () => {
    assert.match(SRC, /require\(['"]\.\/locations['"]\)/);
    assert.match(SRC, /filterAvailableLocations/);
  });

  it('LOCAVAIL-07: the loaded location list is passed through filterAvailableLocations', () => {
    // The single filtered list feeds every downstream renderer (forms, lokaler,
    // index), so applying the filter once at load time is what excludes an
    // unavailable location everywhere.
    assert.match(SRC, /filterAvailableLocations\(\s*localData\.locations[\s\S]*?\)/);
  });
});

// ── Renderers surface only the available list ───────────────────────────────

describe('renderers exclude an unavailable location', () => {
  it('LOCAVAIL-08 (02-§107.4): add form dropdown omits the unavailable location', () => {
    const names = filterAvailableLocations(mixedLocations()).map((l) => l.name);
    const html = renderAddPage(CAMP, names, 'https://api.example.test/add-event');
    assert.ok(html.includes('<option value="Servicehus">'), 'available location present');
    assert.ok(html.includes('<option value="GA Idrott">'), 'available location present');
    assert.ok(!html.includes('<option value="Skolan">'), 'unavailable location must be absent');
  });

  it('LOCAVAIL-09 (02-§107.8): add form always offers the "Annat" fallback', () => {
    // Even when every named location is unavailable, "Annat" remains.
    const html = renderAddPage(CAMP, [], 'https://api.example.test/add-event');
    assert.ok(html.includes('<option value="Annat">'), '"Annat" fallback must always be present');
  });

  it('LOCAVAIL-10 (02-§107.5): edit form dropdown omits the unavailable location', () => {
    const names = filterAvailableLocations(mixedLocations()).map((l) => l.name);
    const html = renderEditPage(CAMP, names, 'https://api.example.test/edit-event');
    assert.ok(html.includes('<option value="Servicehus">'), 'available location present');
    assert.ok(!html.includes('<option value="Skolan">'), 'unavailable location must be absent');
    assert.ok(html.includes('<option value="Annat">'), '"Annat" fallback present');
  });

  it('LOCAVAIL-11 (02-§107.6): Lokaler grid has no row for the unavailable location', () => {
    const locations = filterAvailableLocations(mixedLocations());
    const html = renderLokalerPage(CAMP, locations, []);
    assert.ok(html.includes('Servicehus'), 'available location present');
    assert.ok(html.includes('GA Idrott'), 'available location present');
    assert.ok(!html.includes('Skolan'), 'unavailable location must be absent');
  });

  it('LOCAVAIL-12 (02-§107.7): homepage accordions omit the unavailable location', () => {
    const locations = filterAvailableLocations(mixedLocations());
    const html = renderLocationAccordions(locations);
    assert.ok(html.includes('<summary>Servicehus</summary>'), 'available location present');
    assert.ok(html.includes('<summary>GA Idrott</summary>'), 'available location present');
    assert.ok(!html.includes('<summary>Skolan</summary>'), 'unavailable location must be absent');
  });
});
