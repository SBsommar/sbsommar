'use strict';

// Tests for form time-gating (02-§26.1–26.13).
//
// Testable requirements:
//   - 02-§26.13: build embeds data-opens and data-closes on the form element
//   - 02-§26.10/26.11: isOutsideEditingPeriod rejects outside the window
//   - 05-§1.6: opens_for_editing field documented and used
//
// Browser-only requirements (greyed-out form, disabled button, Swedish
// messages) must be verified manually:
//   1. Open lagg-till.html before opens_for_editing — confirm form is greyed
//      out, submit disabled, message shows opening date.
//   2. Open lagg-till.html after end_date — confirm form is greyed out,
//      submit disabled, message says "Lägret är avslutat. Det går inte
//      längre att lägga till aktiviteter." and the day grid is empty.
//   3. Repeat for redigera.html, where the lock applies after end_date + 1.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const {
  isOutsideEditingPeriod,
  isBeforeEditingPeriod,
  isAfterEditingPeriod,
} = require('../source/api/time-gate');

// ── Test data ────────────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB Test 2026',
  start_date: '2026-06-21',
  end_date: '2026-06-27',
  opens_for_editing: '2026-06-14',
};
const LOCATIONS = ['Servicehus', 'Badet', 'Annat'];
const API_URL = 'https://api.example.com/add-event';

// ── renderAddPage – data attributes (02-§26.13) ─────────────────────────────

describe('renderAddPage – time-gating data attributes (02-§26.13)', () => {
  function render() {
    return renderAddPage(CAMP, LOCATIONS, API_URL);
  }

  it('GATE-01: form has data-opens attribute matching opens_for_editing', () => {
    const html = render();
    assert.ok(
      html.includes('data-opens="2026-06-14"'),
      'Form is missing data-opens="2026-06-14"',
    );
  });

  it('GATE-02: add form has data-closes attribute set to end_date itself (02-§26.6)', () => {
    const html = render();
    // The add form locks once the last camp day passes — there is no day left
    // in the day grid to add to — so data-closes is end_date, not end_date + 1.
    assert.ok(
      html.includes('data-closes="2026-06-27"'),
      'Add form is missing data-closes="2026-06-27" (end_date)',
    );
    assert.ok(
      !html.includes('data-closes="2026-06-28"'),
      'Add form must not extend to end_date + 1 (the server grace day)',
    );
  });
});

// ── renderEditPage – data attributes (02-§26.13) ────────────────────────────

describe('renderEditPage – time-gating data attributes (02-§26.13)', () => {
  function render() {
    return renderEditPage(CAMP, LOCATIONS, API_URL);
  }

  it('GATE-03: form has data-opens attribute matching opens_for_editing', () => {
    const html = render();
    assert.ok(
      html.includes('data-opens="2026-06-14"'),
      'Form is missing data-opens="2026-06-14"',
    );
  });

  it('GATE-04: form has data-closes attribute set to end_date + 1 day', () => {
    const html = render();
    assert.ok(
      html.includes('data-closes="2026-06-28"'),
      'Form is missing data-closes="2026-06-28" (end_date + 1)',
    );
  });
});

// ── isOutsideEditingPeriod (02-§26.10, 02-§26.11) ──────────────────────────

describe('isOutsideEditingPeriod (02-§26.10, 02-§26.11)', () => {
  const opens = '2026-06-14';
  const endDate = '2026-06-27';

  it('GATE-05: returns true when today is before opens_for_editing', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-13', opens, endDate), true);
  });

  it('GATE-06: returns false on the opens_for_editing date itself', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-14', opens, endDate), false);
  });

  it('GATE-07: returns false during the camp (between opens and end_date)', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-21', opens, endDate), false);
  });

  it('GATE-08: returns false on end_date itself', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-27', opens, endDate), false);
  });

  it('GATE-09: returns false on end_date + 1 day (last allowed day)', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-28', opens, endDate), false);
  });

  it('GATE-10: returns true on end_date + 2 days (first disallowed day)', () => {
    assert.strictEqual(isOutsideEditingPeriod('2026-06-29', opens, endDate), true);
  });
});

// ── isBeforeEditingPeriod / isAfterEditingPeriod (02-§26.17, 02-§26.18) ────

describe('isBeforeEditingPeriod (02-§26.17)', () => {
  const opens = '2026-06-14';

  it('GATE-11: returns true when today is strictly before opens_for_editing', () => {
    assert.strictEqual(isBeforeEditingPeriod('2026-06-13', opens), true);
  });

  it('GATE-12: returns false on the opens_for_editing date itself', () => {
    assert.strictEqual(isBeforeEditingPeriod('2026-06-14', opens), false);
  });

  it('GATE-13: returns false well after opens_for_editing', () => {
    assert.strictEqual(isBeforeEditingPeriod('2027-01-01', opens), false);
  });
});

describe('isAfterEditingPeriod (02-§26.18)', () => {
  const endDate = '2026-06-27';

  it('GATE-14: returns false on end_date + 1 day (last allowed day)', () => {
    assert.strictEqual(isAfterEditingPeriod('2026-06-28', endDate), false);
  });

  it('GATE-15: returns true on end_date + 2 days (first disallowed day)', () => {
    assert.strictEqual(isAfterEditingPeriod('2026-06-29', endDate), true);
  });

  it('GATE-16: returns false before the camp (today earlier than end_date)', () => {
    assert.strictEqual(isAfterEditingPeriod('2026-06-01', endDate), false);
  });
});
