'use strict';

// Tests for admin bypass of the pre-camp schedule lock.
// 02-§26.14–26.19
//
// Testable in Node.js:
//   - The OR condition used by /add-event, /edit-event, /delete-event:
//     a request is time-gate-accepted when EITHER today is inside the
//     [opens, closes] window OR today is before opens AND the request
//     carries a valid admin token. After closes the request is always
//     rejected regardless of admin token.
//
// Browser-only (manual checkpoints in traceability):
//   - 02-§26.14: "Öppna ändå (admin)" button rendered next to locked message
//   - 02-§26.15: bypass click removes disabled state
//   - 02-§26.16: bypass button absent after end_date + 1 day
//   - 02-§26.19: admin token included in /add-event request body

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  isBeforeEditingPeriod,
  isAfterEditingPeriod,
} = require('../source/api/time-gate');
const { verifyAdminToken, signToken } = require('../source/api/admin');

const futureEpoch = Math.floor(Date.now() / 1000) + 86400;
const SECRET = 'time-gate-test-secret-value-!!!!';
const VALID_TOKEN = signToken('admin', 'admin', futureEpoch, SECRET);

const OPENS = '2026-06-14';
const END_DATE = '2026-06-27';
// end_date + 1 = 2026-06-28 = last allowed day

// Mirrors the time-gate admission logic the endpoints use.
function isTimeGateAccepted(today, opens, endDate, adminToken, secret) {
  if (isAfterEditingPeriod(today, endDate)) return false;
  if (!isBeforeEditingPeriod(today, opens)) return true;
  return !!adminToken && verifyAdminToken(adminToken, secret);
}

// ── Admin bypasses pre-period lock (02-§26.17) ─────────────────────────────

describe('admin bypass — before opens_for_editing (02-§26.17)', () => {
  it('ABYP-01: non-admin rejected before opens_for_editing', () => {
    assert.strictEqual(
      isTimeGateAccepted('2026-06-13', OPENS, END_DATE, undefined, SECRET),
      false,
    );
  });

  it('ABYP-02: admin accepted before opens_for_editing', () => {
    assert.strictEqual(
      isTimeGateAccepted('2026-06-13', OPENS, END_DATE, VALID_TOKEN, SECRET),
      true,
    );
  });

  it('ABYP-03: admin accepted well before opens_for_editing', () => {
    assert.strictEqual(
      isTimeGateAccepted('2026-01-01', OPENS, END_DATE, VALID_TOKEN, SECRET),
      true,
    );
  });

  it('ABYP-04: invalid admin token rejected before opens', () => {
    const bad = signToken('admin', 'admin', futureEpoch, 'a-different-secret');
    assert.strictEqual(
      isTimeGateAccepted('2026-06-13', OPENS, END_DATE, bad, SECRET),
      false,
    );
  });

  it('ABYP-05: expired admin token rejected before opens', () => {
    const pastEpoch = Math.floor(Date.now() / 1000) - 86400;
    const expired = signToken('admin', 'admin', pastEpoch, SECRET);
    assert.strictEqual(
      isTimeGateAccepted('2026-06-13', OPENS, END_DATE, expired, SECRET),
      false,
    );
  });

  it('ABYP-06: admin accepted on day before opens', () => {
    assert.strictEqual(
      isTimeGateAccepted('2026-06-13', OPENS, END_DATE, VALID_TOKEN, SECRET),
      true,
    );
  });
});

// ── Admin does not bypass post-period lock (02-§26.18) ─────────────────────

describe('admin does NOT bypass post-period lock (02-§26.18)', () => {
  it('ABYP-07: admin rejected on end_date + 2 days', () => {
    assert.strictEqual(
      isTimeGateAccepted('2026-06-29', OPENS, END_DATE, VALID_TOKEN, SECRET),
      false,
    );
  });

  it('ABYP-08: admin rejected long after camp end', () => {
    assert.strictEqual(
      isTimeGateAccepted('2027-01-01', OPENS, END_DATE, VALID_TOKEN, SECRET),
      false,
    );
  });

  it('ABYP-09: non-admin also rejected after period', () => {
    assert.strictEqual(
      isTimeGateAccepted('2026-06-29', OPENS, END_DATE, undefined, SECRET),
      false,
    );
  });

  it('ABYP-10: admin accepted on end_date + 1 (last allowed day)', () => {
    assert.strictEqual(
      isTimeGateAccepted('2026-06-28', OPENS, END_DATE, VALID_TOKEN, SECRET),
      true,
    );
  });
});

// ── Inside the open window — no bypass needed (02-§26.2) ───────────────────

describe('admin bypass has no effect inside the open window', () => {
  it('ABYP-11: non-admin accepted inside the window', () => {
    assert.strictEqual(
      isTimeGateAccepted('2026-06-21', OPENS, END_DATE, undefined, SECRET),
      true,
    );
  });

  it('ABYP-12: admin accepted inside the window', () => {
    assert.strictEqual(
      isTimeGateAccepted('2026-06-21', OPENS, END_DATE, VALID_TOKEN, SECRET),
      true,
    );
  });

  it('ABYP-13: non-admin accepted on opens_for_editing date', () => {
    assert.strictEqual(
      isTimeGateAccepted('2026-06-14', OPENS, END_DATE, undefined, SECRET),
      true,
    );
  });
});
