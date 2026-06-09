'use strict';

// Tests for admin-token OR condition in edit/delete authorisation.
// 02-§7.3, 02-§18.31, 02-§18.32, 02-§89.13, 02-§89.14, 02-§18.50
//
// Testable in Node.js:
//   - verifyAdminToken correctly gates access (reuses admin module)
//   - parseVerifiedSessionIds + verifyAdminToken OR condition
//
// Browser-only (manual checkpoints documented in traceability):
//   - 02-§18.16: Edit links injected for all events when admin is active
//   - 02-§18.22: Edit page skips ownership check when admin is active
//   - 02-§18.42: Idag view injects edit links for all events when admin
//   - 02-§18.50: Client sends adminToken in edit/delete request body

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { verifyAdminToken } = require('../source/api/admin');
const { createOwnershipEntry, parseVerifiedSessionIds } = require('../source/api/session');

// Future epoch so tokens are not rejected by expiry check
const futureEpoch = Math.floor(Date.now() / 1000) + 86400;
const VALID_TOKEN = `admin_test-uuid_${futureEpoch}`;
const ADMIN_TOKENS = [VALID_TOKEN];
const SESSION_SECRET = 'test-session-secret';

// Simulates the OR condition that app.js will use:
// authorised if event ID has valid signed ownership OR admin token is valid.
function isAuthorised(cookieHeader, eventId, adminToken, validTokens, sessionSecret = SESSION_SECRET) {
  const ownedIds = parseVerifiedSessionIds(cookieHeader, sessionSecret);
  if (ownedIds.includes(eventId)) return true;
  if (adminToken && verifyAdminToken(adminToken, validTokens)) return true;
  return false;
}

// ── OR condition: ownership OR admin token (02-§7.3) ────────────────────────

describe('edit/delete authorisation OR condition (02-§7.3, §18.31, §89.13)', () => {
  const eventId = 'test-event-2099-06-01-1000';
  const cookieWithOwnership = `sb_session=${encodeURIComponent(JSON.stringify([createOwnershipEntry(eventId, SESSION_SECRET)]))}`;
  const cookieWithLegacyId = `sb_session=${encodeURIComponent(JSON.stringify([eventId]))}`;
  const cookieWithoutId = `sb_session=${encodeURIComponent(JSON.stringify([createOwnershipEntry('other-event', SESSION_SECRET)]))}`;
  const noCookie = '';

  it('ADED-01: authorised when event has signed ownership in session cookie (no admin token)', () => {
    assert.strictEqual(isAuthorised(cookieWithOwnership, eventId, undefined, []), true);
  });

  it('ADED-01b: rejected when cookie only contains a legacy raw event ID', () => {
    assert.strictEqual(isAuthorised(cookieWithLegacyId, eventId, undefined, []), false);
  });

  it('ADED-02: authorised when admin token is valid (event ID not in cookie)', () => {
    assert.strictEqual(isAuthorised(cookieWithoutId, eventId, VALID_TOKEN, ADMIN_TOKENS), true);
  });

  it('ADED-03: authorised when both cookie ownership and admin token are present', () => {
    assert.strictEqual(isAuthorised(cookieWithOwnership, eventId, VALID_TOKEN, ADMIN_TOKENS), true);
  });

  it('ADED-04: rejected when neither cookie ownership nor admin token', () => {
    assert.strictEqual(isAuthorised(cookieWithoutId, eventId, undefined, []), false);
  });

  it('ADED-05: rejected when admin token is invalid', () => {
    const badToken = `wrong_token_${futureEpoch}`;
    assert.strictEqual(isAuthorised(noCookie, eventId, badToken, ADMIN_TOKENS), false);
  });

  it('ADED-06: rejected when admin token is expired', () => {
    const pastEpoch = Math.floor(Date.now() / 1000) - 86400;
    const expired = `admin_test-uuid_${pastEpoch}`;
    assert.strictEqual(isAuthorised(noCookie, eventId, expired, [expired]), false);
  });

  it('ADED-07: rejected when ADMIN_TOKENS is empty (§91.3)', () => {
    assert.strictEqual(isAuthorised(noCookie, eventId, VALID_TOKEN, []), false);
  });

  it('ADED-08: authorised via admin even with no cookie at all', () => {
    assert.strictEqual(isAuthorised(noCookie, eventId, VALID_TOKEN, ADMIN_TOKENS), true);
  });
});
