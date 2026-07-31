'use strict';

// Tests for 02-§122 — Double-submit protection on the edit form.
//
// The edit form's three mutating controls each trigger an edit-event API write
// that opens and auto-merges a pull request: "Spara ändringar" (submit, inside
// the <fieldset>), the "Ställ in aktiviteten" / "Återställ aktiviteten" toggle
// (#btn-cancel), and "Radera aktivitet" (#btn-delete). The toggle and delete
// buttons sit outside the <fieldset>, so disabling the fieldset alone leaves
// them clickable — a second activation before the first request resolves makes
// the API open a duplicate pull request (the stuck-PR failure mode). lock()
// therefore disables all four controls, a `submitting` flag guards re-entry,
// and unlock() restores everything on the error-retry paths.
//
// All behaviour is browser-only DOM manipulation that cannot run in Node.js,
// so these are source-code structural checks (same convention as
// tests/submit-progress.test.js). The live disabled appearance and click
// behaviour are manual checkpoints in the traceability matrix:
//   EDS-M01 (02-§122.1): open redigera.html, press "Ställ in aktiviteten", and
//     confirm the button, delete button, submit button, and fields are all
//     disabled while the modal is open.
//   EDS-M02 (02-§122.4): disconnect the API, submit, press "Försök igen", and
//     confirm every control is usable again.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const EDIT_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'redigera.js'),
  'utf8',
);

// Extract a named function's body (from its opening brace to the matching
// close), so a guard/disable assertion is scoped to the right function rather
// than matching anywhere in the file.
function funcBody(src, name) {
  const start = src.indexOf('function ' + name);
  if (start === -1) return '';
  const open = src.indexOf('{', start);
  if (open === -1) return '';
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') {
      depth -= 1;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  return '';
}

describe('02-§122.1 — lock() disables every mutating control (EDS-01)', () => {
  const lock = funcBody(EDIT_SRC, 'lock');

  it('EDS-01: lock() disables submit, cancel toggle, and delete buttons', () => {
    assert.ok(lock, 'lock() function found');
    assert.match(lock, /fieldset\.disabled\s*=\s*true/, 'fieldset disabled');
    assert.match(lock, /submitBtn\.disabled\s*=\s*true/, 'submit button disabled');
    assert.match(lock, /cancelBtn\.disabled\s*=\s*true/, 'cancel toggle disabled');
    assert.match(lock, /deleteBtn\.disabled\s*=\s*true/, 'delete button disabled');
  });
});

describe('02-§122.2 — unlock() re-enables every mutating control (EDS-02)', () => {
  const unlock = funcBody(EDIT_SRC, 'unlock');

  it('EDS-02: unlock() re-enables submit, cancel toggle, and delete buttons', () => {
    assert.ok(unlock, 'unlock() function found');
    assert.match(unlock, /fieldset\.disabled\s*=\s*false/, 'fieldset enabled');
    assert.match(unlock, /submitBtn\.disabled\s*=\s*false/, 'submit button enabled');
    assert.match(unlock, /cancelBtn\.disabled\s*=\s*false/, 'cancel toggle enabled');
    assert.match(unlock, /deleteBtn\.disabled\s*=\s*false/, 'delete button enabled');
  });
});

describe('02-§122.3 — re-entry guard blocks concurrent writes (EDS-03..06)', () => {
  it('EDS-03: a `submitting` flag is declared', () => {
    assert.match(EDIT_SRC, /var\s+submitting\s*=\s*false/, '`submitting` declared and seeded false');
  });

  it('EDS-04: submitCancelToggle() returns early while a write is in progress', () => {
    const body = funcBody(EDIT_SRC, 'submitCancelToggle');
    assert.ok(body, 'submitCancelToggle() found');
    assert.match(body, /if\s*\(submitting\)\s*return;/, 'guard present in cancel toggle');
  });

  it('EDS-05: the submit handler returns early while a write is in progress', () => {
    // Anonymous submit handler: anchor on its registration and require the
    // guard as the first statement.
    assert.match(
      EDIT_SRC,
      /addEventListener\('submit',\s*function\s*\(e\)\s*\{\s*if\s*\(submitting\)\s*return;/,
      'guard is the first statement of the submit handler',
    );
  });

  it('EDS-06: performDelete() returns early while a write is in progress', () => {
    const body = funcBody(EDIT_SRC, 'performDelete');
    assert.ok(body, 'performDelete() found');
    assert.match(body, /if\s*\(submitting\)\s*return;/, 'guard present in delete flow');
  });
});

describe('02-§122.4 — the flag tracks the in-flight state (EDS-07)', () => {
  it('EDS-07: lock() sets submitting=true and unlock() clears it', () => {
    assert.match(funcBody(EDIT_SRC, 'lock'), /submitting\s*=\s*true/, 'lock sets the flag');
    assert.match(funcBody(EDIT_SRC, 'unlock'), /submitting\s*=\s*false/, 'unlock clears the flag');
  });
});

describe('02-§122.5 — delete flow parity (EDS-08)', () => {
  it('EDS-08: performDelete() locks the form for the duration of the request', () => {
    const body = funcBody(EDIT_SRC, 'performDelete');
    assert.match(body, /\block\(\);/, 'performDelete calls lock()');
  });

  it('EDS-09: the delete error-retry path unlocks the form', () => {
    const body = funcBody(EDIT_SRC, 'setDeleteModalError');
    assert.ok(body, 'setDeleteModalError() found');
    assert.match(body, /\bunlock\(\);/, 'delete retry calls unlock()');
  });
});
