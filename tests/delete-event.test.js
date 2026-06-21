'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderEditPage } = require('../source/build/render-edit');

// ── Helpers ───────────────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB Sommar 2026',
  start_date: '2026-06-21',
  end_date: '2026-06-27',
};
const LOCATIONS = ['Servicehus', 'Badet', 'Annat'];
const API_URL = 'https://api.example.com/edit-event';

function render() {
  return renderEditPage(CAMP, LOCATIONS, API_URL);
}

// Deletion removes the event's fragment file (02-§109.11); there is no
// camp-YAML string helper to unit-test. The fragment-only delete path is
// covered by the structural checks in fragment-only-mutation.test.js and the
// manual checkpoints there.

// ── Delete button on edit page (02-§89.1, 02-§89.2) ─────────────────────────

describe('renderEditPage – delete button', () => {
  it('DEL-08 (02-§89.1): renders a delete button', () => {
    const html = render();
    assert.ok(
      html.includes('id="btn-delete"'),
      'No id="btn-delete" found — delete button must be present on edit page',
    );
  });

  it('DEL-09 (02-§89.2): delete button has Swedish label', () => {
    const html = render();
    assert.ok(
      html.includes('Radera aktivitet'),
      'Delete button must have label "Radera aktivitet"',
    );
  });

  it('DEL-10 (02-§89.2): delete button has destructive styling class', () => {
    const html = render();
    assert.ok(
      html.includes('btn-destructive'),
      'Delete button must have class btn-destructive',
    );
  });
});

// ── Confirmation dialog (02-§89.3, 02-§89.5) ────────────────────────────────

describe('renderEditPage – delete confirmation dialog', () => {
  it('DEL-11 (02-§89.3): renders a delete confirmation dialog', () => {
    const html = render();
    assert.ok(
      html.includes('id="delete-confirm"'),
      'No id="delete-confirm" found — confirmation dialog must be present',
    );
  });

  it('DEL-12 (02-§89.5): dialog has confirm button with Swedish text', () => {
    const html = render();
    assert.ok(
      html.includes('Ja, radera'),
      'Confirmation dialog must have "Ja, radera" button',
    );
  });

  it('DEL-13 (02-§89.5): dialog has cancel button with Swedish text', () => {
    const html = render();
    assert.ok(
      html.includes('Avbryt'),
      'Confirmation dialog must have "Avbryt" button',
    );
  });

  it('DEL-14 (02-§89.3): dialog has role="alertdialog"', () => {
    const html = render();
    assert.ok(
      html.includes('role="alertdialog"'),
      'Delete confirmation dialog must have role="alertdialog"',
    );
  });
});

// ── deleteApiUrl (02-§89.12) ─────────────────────────────────────────────────

describe('deleteApiUrl', () => {
  // Import after implementation adds the function
  const { deleteApiUrl } = require('../source/build/render-edit');

  it('DEL-15: replaces /add-event with /delete-event', () => {
    assert.strictEqual(
      deleteApiUrl('https://api.example.com/add-event'),
      'https://api.example.com/delete-event',
    );
  });

  it('DEL-16: falls back to /delete-event when no URL is given', () => {
    assert.strictEqual(deleteApiUrl(undefined), '/delete-event');
    assert.strictEqual(deleteApiUrl(''), '/delete-event');
  });

  it('DEL-17: does not mangle a URL that already ends with /delete-event', () => {
    assert.strictEqual(
      deleteApiUrl('https://api.example.com/delete-event'),
      'https://api.example.com/delete-event',
    );
  });

  it('DEL-18: replaces /edit-event with /delete-event', () => {
    assert.strictEqual(
      deleteApiUrl('https://api.example.com/edit-event'),
      'https://api.example.com/delete-event',
    );
  });
});
