'use strict';

const crypto = require('node:crypto');

const COOKIE_NAME    = 'sb_session';
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

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

function verifyOwnershipEntry(entry, secret, now = Date.now()) {
  if (!secret || typeof secret !== 'string' || !isOwnershipEntry(entry)) {
    return false;
  }
  if (entry.exp < Math.floor(now / 1000)) {
    return false;
  }
  const expected = signatureForEntry(entry.id, entry.exp, secret);
  const actual = entry.sig;
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual, 'utf8'), Buffer.from(expected, 'utf8'));
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
  buildSetCookieHeader,
  mergeOwnershipEntries,
};
