'use strict';

// Tests for the early access role (tidig åtkomst) — 02-§105.
//
// Testable in Node.js:
//   - verifyPreCampBypassToken role gating (EARLY-01..06)
//   - time-gate admission with early tokens (EARLY-07..12)
//   - ownership OR-condition excludes early (EARLY-13..15)
//   - CLI mints early with 90 days validity (EARLY-16)
//   - structural role wiring in app.js / api/index.php / client files
//     (EARLY-17..22); PHP behavioural parity lives in
//     api/tests/AdminTokenTest.php against the same fixed vector
//
// Browser-only (manual checkpoints documented in traceability):
//   - 02-§105.7: a stored early token injects no all-event edit links
//   - 02-§105.8: bypass button label "(tidig åtkomst)" for early
//   - 02-§105.9: edit page ownership shortcut not applied for early

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

const {
  signToken,
  verifyAdminToken,
  verifyPreCampBypassToken,
} = require('../source/api/admin');
const {
  isBeforeEditingPeriod,
  isAfterEditingPeriod,
} = require('../source/api/time-gate');
const { createOwnershipEntry, parseVerifiedSessionIds } = require('../source/api/session');

const SECRET = 'early-access-test-secret-value!!';
const future = () => Math.floor(Date.now() / 1000) + 86400;
const past = () => Math.floor(Date.now() / 1000) - 86400;

const EARLY_TOKEN = signToken('anna', 'early', future(), SECRET);
const ADMIN_TOKEN = signToken('erik', 'admin', future(), SECRET);
const SUPER_TOKEN = signToken('sigge', 'superadmin', future(), SECRET);

// ── verifyPreCampBypassToken (02-§105.1, §105.5) ─────────────────────────────

describe('verifyPreCampBypassToken (02-§105.1, §105.5)', () => {
  it('EARLY-01: true for early', () => {
    assert.strictEqual(verifyPreCampBypassToken(EARLY_TOKEN, SECRET), true);
  });

  it('EARLY-02: true for admin and superadmin', () => {
    assert.strictEqual(verifyPreCampBypassToken(ADMIN_TOKEN, SECRET), true);
    assert.strictEqual(verifyPreCampBypassToken(SUPER_TOKEN, SECRET), true);
  });

  it('EARLY-03: false for an unknown role even with a valid signature', () => {
    assert.strictEqual(
      verifyPreCampBypassToken(signToken('x', 'root', future(), SECRET), SECRET),
      false,
    );
  });

  it('EARLY-04: false for a tampered or wrong-secret token', () => {
    assert.strictEqual(verifyPreCampBypassToken(EARLY_TOKEN.replace('_early_', '_admin_'), SECRET), false);
    assert.strictEqual(verifyPreCampBypassToken(signToken('anna', 'early', future(), 'other-secret'), SECRET), false);
  });

  it('EARLY-05: false for an expired token or empty secret', () => {
    assert.strictEqual(verifyPreCampBypassToken(signToken('anna', 'early', past(), SECRET), SECRET), false);
    assert.strictEqual(verifyPreCampBypassToken(EARLY_TOKEN, ''), false);
  });

  it('EARLY-06: verifyAdminToken remains false for early (02-§105.5)', () => {
    assert.strictEqual(verifyAdminToken(EARLY_TOKEN, SECRET), false);
    assert.strictEqual(verifyPreCampBypassToken(EARLY_TOKEN, SECRET), true);
  });
});

// ── Time-gate admission (02-§105.1, §105.3) ──────────────────────────────────

const OPENS = '2026-06-14';
const END_DATE = '2026-06-27';
// end_date + 1 = 2026-06-28 = last allowed day

// Mirrors the time-gate admission logic the endpoints use.
function isTimeGateAccepted(today, opens, endDate, token, secret) {
  if (isAfterEditingPeriod(today, endDate)) return false;
  if (!isBeforeEditingPeriod(today, opens)) return true;
  return verifyPreCampBypassToken(token, secret);
}

describe('early bypasses the pre-camp lock (02-§105.1)', () => {
  it('EARLY-07: early accepted before opens_for_editing', () => {
    assert.strictEqual(isTimeGateAccepted('2026-06-13', OPENS, END_DATE, EARLY_TOKEN, SECRET), true);
  });

  it('EARLY-08: early accepted well before opens_for_editing', () => {
    assert.strictEqual(isTimeGateAccepted('2026-01-01', OPENS, END_DATE, EARLY_TOKEN, SECRET), true);
  });

  it('EARLY-09: no token still rejected before opens_for_editing', () => {
    assert.strictEqual(isTimeGateAccepted('2026-06-13', OPENS, END_DATE, undefined, SECRET), false);
  });

  it('EARLY-10: expired early token rejected before opens_for_editing', () => {
    const expired = signToken('anna', 'early', past(), SECRET);
    assert.strictEqual(isTimeGateAccepted('2026-06-13', OPENS, END_DATE, expired, SECRET), false);
  });
});

describe('early does NOT bypass the post-camp lock (02-§105.3)', () => {
  it('EARLY-11: early rejected after end_date + 1', () => {
    assert.strictEqual(isTimeGateAccepted('2026-06-29', OPENS, END_DATE, EARLY_TOKEN, SECRET), false);
    assert.strictEqual(isTimeGateAccepted('2027-01-01', OPENS, END_DATE, EARLY_TOKEN, SECRET), false);
  });

  it('EARLY-12: early accepted inside the open window and on end_date + 1', () => {
    assert.strictEqual(isTimeGateAccepted('2026-06-21', OPENS, END_DATE, EARLY_TOKEN, SECRET), true);
    assert.strictEqual(isTimeGateAccepted('2026-06-28', OPENS, END_DATE, EARLY_TOKEN, SECRET), true);
  });
});

// ── Ownership OR-condition excludes early (02-§105.2) ────────────────────────

const SESSION_SECRET = 'early-session-secret';

// Simulates the OR condition app.js uses for edit/delete: authorised if the
// event ID has valid signed ownership OR the request carries a token whose
// role is admin-equivalent (verifyAdminToken — NOT the pre-camp check).
function isAuthorised(cookieHeader, eventId, token, secret) {
  const ownedIds = parseVerifiedSessionIds(cookieHeader, SESSION_SECRET);
  if (ownedIds.includes(eventId)) return true;
  if (token && verifyAdminToken(token, secret)) return true;
  return false;
}

describe('ownership is not bypassed by early (02-§105.2)', () => {
  const eventId = 'bada-2099-06-01-1000';
  const ownCookie = `sb_session=${encodeURIComponent(JSON.stringify([createOwnershipEntry(eventId, SESSION_SECRET)]))}`;
  const otherCookie = `sb_session=${encodeURIComponent(JSON.stringify([createOwnershipEntry('annans-event', SESSION_SECRET)]))}`;

  it('EARLY-13: early token alone does NOT authorise editing someone else\'s event', () => {
    assert.strictEqual(isAuthorised(otherCookie, eventId, EARLY_TOKEN, SECRET), false);
    assert.strictEqual(isAuthorised('', eventId, EARLY_TOKEN, SECRET), false);
  });

  it('EARLY-14: early token holder IS authorised for their own (cookie-owned) event', () => {
    assert.strictEqual(isAuthorised(ownCookie, eventId, EARLY_TOKEN, SECRET), true);
  });

  it('EARLY-15: admin token still authorises without ownership (unchanged)', () => {
    assert.strictEqual(isAuthorised(otherCookie, eventId, ADMIN_TOKEN, SECRET), true);
  });
});

// ── CLI validity (02-§105.6) ─────────────────────────────────────────────────

describe('admin:create mints early with 90 days validity (02-§105.6)', () => {
  const cli = read('source/scripts/create-admin-token.js');

  it('EARLY-16: ROLE_DAYS maps early to 90 and the prompt offers early', () => {
    assert.match(cli, /early:\s*90/);
    assert.match(cli, /admin\/early\/superadmin/);
  });
});

// ── Structural wiring: server (02-§105.1, §105.2, §105.4, §105.5) ────────────

describe('server role wiring (02-§105.1, §105.2, §105.4, §105.5)', () => {
  const node = read('app.js');
  const php = read('api/index.php');
  const phpAdmin = read('api/src/Admin.php');

  it('EARLY-17: /verify-admin accepts any recognised role in both runtimes', () => {
    // Node route uses verifyToken (any recognised role), not verifyAdminToken.
    const nodeRoute = node.slice(node.indexOf("app.post('/verify-admin'"));
    assert.match(nodeRoute.slice(0, 500), /(?<!Admin)verifyToken\(token/);
    // PHP handler likewise.
    const phpRoute = php.slice(php.indexOf('function handleVerifyAdmin'));
    assert.match(phpRoute.slice(0, 600), /Admin::verifyToken\(/);
  });

  it('EARLY-18: pre-camp time gates use the pre-camp-bypass check in both runtimes', () => {
    assert.match(node, /isBeforeEditingPeriod\([\s\S]{0,120}verifyPreCampBypassToken|verifyPreCampBypassToken[\s\S]{0,200}isBeforeEditingPeriod/);
    assert.match(php, /Admin::verifyPreCampBypassToken\(/);
  });

  it('EARLY-19: ownership OR-condition still uses verifyAdminToken in both runtimes', () => {
    // The isAdmin flag consumed by the ownership checks must come from
    // verifyAdminToken (admin/superadmin only).
    assert.match(node, /const isAdmin = verifyAdminToken\(/);
    assert.match(php, /\$isAdmin\s*=\s*Admin::verifyAdminToken\(/);
  });

  it('EARLY-20: Admin.php exposes verifyPreCampBypassToken (PHP parity)', () => {
    assert.match(phpAdmin, /function\s+verifyPreCampBypassToken\b/);
    assert.match(phpAdmin, /PRE_CAMP_BYPASS_ROLES/);
  });
});

// ── Structural wiring: client (02-§105.7, §105.8, §105.9) ────────────────────

describe('client role wiring (02-§105.7, §105.8, §105.9)', () => {
  it('EARLY-21: session.js injects all-event edit links only for admin roles', () => {
    const src = read('source/assets/js/client/session.js');
    // The role (second segment) must be checked, not just token presence.
    assert.match(src, /parts\[1\]/);
    assert.match(src, /'admin'/);
    assert.match(src, /'superadmin'/);
  });

  it('EARLY-22: redigera.js gates the ownership shortcut on an admin role and labels the bypass per role', () => {
    const src = read('source/assets/js/client/redigera.js');
    assert.match(src, /parts\[1\]/);
    assert.match(src, /hasAdminRole/);
    assert.match(src, /Öppna ändå \(tidig åtkomst\)/);
  });

  it('EARLY-23: lagg-till.js labels the bypass button per role', () => {
    const src = read('source/assets/js/client/lagg-till.js');
    assert.match(src, /Öppna ändå \(tidig åtkomst\)/);
    assert.match(src, /Öppna ändå \(admin\)/);
  });
});
