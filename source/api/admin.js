'use strict';

const crypto = require('crypto');

// Tokens are self-validating: each carries its claims and an HMAC signature
// keyed by ADMIN_TOKEN_SECRET, so the server validates a token by recomputing
// its signature — there is no stored list of issued tokens (02-§91.1, §91.2).
//
// Format: namn_roll_epoch_sig
//   namn  — lowercase identifier, never contains an underscore
//   roll  — one of admin | early | superadmin
//   epoch — Unix expiry (seconds)
//   sig   — base64url HMAC-SHA256 of "namn_roll_epoch" keyed by the secret

const VALID_ROLES = new Set(['admin', 'early', 'superadmin']);
const ADMIN_ROLES = new Set(['admin', 'superadmin']);
const PRE_CAMP_BYPASS_ROLES = new Set(['admin', 'early', 'superadmin']);

// ── Constant-time comparison helper (retained from #386) ─────────────────────

// Per-process random key used only to equalise lengths before comparison.
// Hashing both sides to a fixed-width digest lets us run timingSafeEqual on any
// pair without a length pre-check, so the comparison leaks neither validity nor
// value length via timing (02-§91.8).
const COMPARE_KEY = crypto.randomBytes(32);

function tokenDigest(value) {
  return crypto.createHmac('sha256', COMPARE_KEY).update(String(value)).digest();
}

// ── Signing ──────────────────────────────────────────────────────────────────

// Compute the base64url HMAC-SHA256 signature of the claim string.
function signClaims(message, secret) {
  return crypto.createHmac('sha256', secret).update(message).digest('base64url');
}

// Produce a signed token for the given claims (02-§91.2).
function signToken(name, role, epoch, secret) {
  const message = `${name}_${role}_${epoch}`;
  return `${message}_${signClaims(message, secret)}`;
}

// ── Parsing ──────────────────────────────────────────────────────────────────

// Split on the first three underscores: namn/roll/epoch are underscore-free,
// while the base64url signature may itself contain '_' or '-'.
function parseToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('_');
  if (parts.length < 4) return null;
  const [name, role, epochStr] = parts;
  const sig = parts.slice(3).join('_');
  if (!name || !role || !sig) return null;
  if (!/^\d+$/.test(epochStr)) return null;
  const epoch = Number(epochStr);
  if (!Number.isInteger(epoch) || epoch <= 0) return null;
  return { name, role, epoch, sig, message: `${name}_${role}_${epoch}` };
}

// ── Embedded expiry ──────────────────────────────────────────────────────────

// Extract the embedded expiry epoch (seconds) from a token, or 0 if malformed.
function extractTokenExpiry(token) {
  const parsed = parseToken(token);
  return parsed ? parsed.epoch : 0;
}

// Check if a token's embedded expiry has passed. A malformed token (expiry 0)
// is treated as expired (fail-closed).
function isTokenExpired(token) {
  const expiry = extractTokenExpiry(token);
  if (expiry === 0) return true;
  return Math.floor(Date.now() / 1000) > expiry;
}

// ── Verification ─────────────────────────────────────────────────────────────

// Validate a token against the signing secret. Returns { name, role, epoch }
// when the recomputed signature matches (constant-time), the role is recognised,
// and the epoch is in the future; otherwise null (02-§91.2, §91.29).
function verifyToken(candidate, secret) {
  if (!secret || typeof secret !== 'string') return null;
  const parsed = parseToken(candidate);
  if (!parsed) return null;
  if (!VALID_ROLES.has(parsed.role)) return null;
  if (Math.floor(Date.now() / 1000) > parsed.epoch) return null;

  const expected = signClaims(parsed.message, secret);
  if (!crypto.timingSafeEqual(tokenDigest(expected), tokenDigest(parsed.sig))) return null;

  return { name: parsed.name, role: parsed.role, epoch: parsed.epoch };
}

// True only for administrator-equivalent roles (admin, superadmin). Preserves
// the boolean contract used by the add/edit/delete handlers (02-§91.31).
function verifyAdminToken(candidate, secret) {
  const token = verifyToken(candidate, secret);
  return !!token && ADMIN_ROLES.has(token.role);
}

// True for roles allowed to bypass the pre-camp time gate: administrators
// plus early-access contributors (02-§105.1). Unlike verifyAdminToken,
// passing this check grants no ownership bypass — an early holder still only
// edits and deletes their own cookie-owned events (02-§105.2, §105.5).
function verifyPreCampBypassToken(candidate, secret) {
  const token = verifyToken(candidate, secret);
  return !!token && PRE_CAMP_BYPASS_ROLES.has(token.role);
}

// ── Minting (02-§106) ────────────────────────────────────────────────────────

// Roles a superadmin may mint from the web, with their maximum (and default)
// validity in days (02-§106.3, §106.5). superadmin is CLI-only (02-§91.30).
const MINTABLE_ROLE_DAYS = { admin: 60, early: 90 };

// Hyphen-separated identifier: lowercase a–ö, digits, hyphens. Never an
// underscore — that is the token field delimiter (02-§106.4). Shared by the
// CLI and the /mint-token endpoint so both produce identical names.
function sanitizeTokenName(raw) {
  return String(raw == null ? '' : raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-zåäö0-9-]/g, '');
}

// Validate a mint request and sign the token (02-§106.3–106.6). The caller
// is responsible for the superadmin gate (02-§106.2); this function only
// shapes the minted token. Returns { ok: true, token } or
// { ok: false, error } with a Swedish message.
function mintRequest(body, secret, nowSeconds) {
  const name = sanitizeTokenName(body && body.name);
  if (!name) {
    return { ok: false, error: 'Namn krävs (a–ö, siffror, bindestreck).' };
  }
  const role = String((body && body.role) || '');
  if (!Object.prototype.hasOwnProperty.call(MINTABLE_ROLE_DAYS, role)) {
    return { ok: false, error: 'Ogiltig roll. Välj admin eller early.' };
  }
  const cap = MINTABLE_ROLE_DAYS[role];
  const rawDays = body.days;
  const days = (rawDays === undefined || rawDays === null || rawDays === '')
    ? cap
    : Number(rawDays);
  if (!Number.isInteger(days) || days < 1 || days > cap) {
    return { ok: false, error: `Giltighetstiden måste vara 1–${cap} dagar.` };
  }
  const epoch = nowSeconds + days * 86400;
  return { ok: true, token: signToken(name, role, epoch, secret) };
}

module.exports = {
  signToken,
  verifyToken,
  verifyAdminToken,
  verifyPreCampBypassToken,
  mintRequest,
  sanitizeTokenName,
  isTokenExpired,
  extractTokenExpiry,
  VALID_ROLES,
};
