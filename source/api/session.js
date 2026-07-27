'use strict';

const crypto = require('node:crypto');

const COOKIE_NAME    = 'sb_session';
// Ownership horizon: how long a signed ownership entry stays fresh, and the
// cookie's Max-Age. Set well beyond a single camp so a participant who submits
// an activity weeks before it happens can still edit it during the camp
// (02-§18.3). Renewed on every activity (add/edit) and self-healed when an
// authentic signature has passed its horizon (02-§18.51, §101.8).
const MAX_AGE_SECONDS = 180 * 24 * 60 * 60; // 180 days

// ── ownership entries ─────────────────────────────────────────────────────────

function expiresAt(now = Date.now()) {
  return Math.floor(now / 1000) + MAX_AGE_SECONDS;
}

function signatureForEntry(id, exp, secret) {
  return crypto
    .createHmac('sha256', String(secret))
    .update(`${id}.${exp}`)
    .digest('hex');
}

function createOwnershipEntry(id, secret, now = Date.now()) {
  if (!id || typeof id !== 'string') {
    throw new TypeError('id must be a non-empty string');
  }
  if (!secret || typeof secret !== 'string') {
    throw new TypeError('secret must be a non-empty string');
  }
  const exp = expiresAt(now);
  return { id, exp, sig: signatureForEntry(id, exp, secret) };
}

function isOwnershipEntry(entry) {
  return Boolean(
    entry &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    entry.id.length > 0 &&
    Number.isInteger(entry.exp) &&
    entry.exp > 0 &&
    typeof entry.sig === 'string' &&
    entry.sig.length > 0
  );
}

// True when the entry is server-signed and authentic, regardless of its expiry
// horizon. Authenticity alone proves the server once granted ownership; the
// horizon only governs renewal, not trust. Used for self-healing: an authentic
// but expired entry is re-signed on the next activity rather than rejected
// (02-§18.51, §101.8).
function verifyOwnershipSignature(entry, secret) {
  if (!secret || typeof secret !== 'string' || !isOwnershipEntry(entry)) {
    return false;
  }
  const expected = signatureForEntry(entry.id, entry.exp, secret);
  const actual = entry.sig;
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual, 'utf8'), Buffer.from(expected, 'utf8'));
}

function verifyOwnershipEntry(entry, secret, now = Date.now()) {
  if (!verifyOwnershipSignature(entry, secret)) return false;
  return entry.exp >= Math.floor(now / 1000);
}

function parseSessionPayload(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== 'string') return [];

  const pair = cookieHeader
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE_NAME}=`));

  if (!pair) return [];

  const raw = pair.slice(COOKIE_NAME.length + 1);

  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── parseSessionIds ───────────────────────────────────────────────────────────

// Parse the sb_session cookie from a raw Cookie header string.
// Returns a (possibly empty) array of event ID strings for display/cleanup.
// Legacy raw string entries are included here but are not authorization.
function parseSessionIds(cookieHeader) {
  return parseSessionPayload(cookieHeader)
    .map((entry) => {
      if (typeof entry === 'string' && entry.length > 0) return entry;
      if (isOwnershipEntry(entry)) return entry.id;
      return null;
    })
    .filter(Boolean);
}

function parseVerifiedSessionIds(cookieHeader, secret, now = Date.now()) {
  return parseSessionPayload(cookieHeader)
    .filter((entry) => verifyOwnershipEntry(entry, secret, now))
    .map((entry) => entry.id);
}

// Like parseVerifiedSessionIds but accepts authentic entries whose horizon has
// passed. Used for edit/delete authorization and for reissuing the cookie, so a
// participant whose signature expired can still act on a future event and have
// their ownership re-signed (self-healing). Editing a past event is still
// blocked by the handlers' own date check, which bounds this grace to events
// that have not happened yet (02-§18.51, §101.8).
function parseHealableSessionIds(cookieHeader, secret) {
  return parseSessionPayload(cookieHeader)
    .filter((entry) => verifyOwnershipSignature(entry, secret))
    .map((entry) => entry.id);
}

// ── buildSetCookieHeader ──────────────────────────────────────────────────────

// Build the Set-Cookie response header value for the session cookie.
// Pass `domain` (e.g. 'sommar.example.com') when the API and static site
// are on different subdomains; omit it for single-origin deployments.
function buildSetCookieHeader(ids, domain) {
  const value = encodeURIComponent(JSON.stringify(ids));
  const domainPart = domain ? `; Domain=${domain}` : '';
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${MAX_AGE_SECONDS}; Secure; SameSite=Strict${domainPart}`;
}

// ── mergeOwnershipEntries ─────────────────────────────────────────────────────

// Return a new array with newEntry appended to existing, deduplicating by id.
function mergeOwnershipEntries(existing, newEntry) {
  if (!Array.isArray(existing)) existing = [];
  if (!isOwnershipEntry(newEntry)) return existing.filter(isOwnershipEntry);

  const entries = existing.filter(isOwnershipEntry);
  if (entries.some((entry) => entry.id === newEntry.id)) return entries;
  return [...entries, newEntry];
}

module.exports = {
  COOKIE_NAME,
  MAX_AGE_SECONDS,
  createOwnershipEntry,
  parseSessionIds,
  parseVerifiedSessionIds,
  parseHealableSessionIds,
  verifyOwnershipSignature,
  buildSetCookieHeader,
  mergeOwnershipEntries,
};
