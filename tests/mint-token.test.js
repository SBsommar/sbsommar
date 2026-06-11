'use strict';

// Tests for web token minting (superadmin) — 02-§106.
//
// Testable in Node.js:
//   - sanitizeTokenName (MINT-01)
//   - mintRequest: happy path, defaults, caps, whitelist, signing
//     (MINT-02..08); PHP behavioural parity lives in
//     api/tests/MintTokenTest.php with the same fixed inputs
//   - superadmin gate predicate (MINT-09..10)
//   - structural route/UI wiring (MINT-11..15)
//
// Browser-only (manual checkpoints documented in traceability):
//   - 02-§106.9: mint section visible only with a superadmin token
//   - 02-§106.12: copy button; share button only when navigator.share exists
//   - 02-§106.14..15: hash redemption activates and clears the fragment

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

const {
  signToken,
  verifyToken,
  mintRequest,
  sanitizeTokenName,
} = require('../source/api/admin');

// Pure client-side mint-form validation (admin.js exports it under Node).
const { validateMintFields } = require('../source/assets/js/client/admin');

const SECRET = 'mint-token-test-secret-32-bytes!';
const NOW = 2000000000; // fixed, mirrored in api/tests/MintTokenTest.php
const DAY = 86400;

// ── Name sanitisation (02-§106.4) ────────────────────────────────────────────

describe('sanitizeTokenName (02-§106.4)', () => {
  it('MINT-01: lowercases, hyphenates whitespace, strips invalid chars incl. underscore', () => {
    assert.strictEqual(sanitizeTokenName('Anna Söder'), 'anna-söder');
    assert.strictEqual(sanitizeTokenName('  Erik  Ek  '), 'erik-ek');
    assert.strictEqual(sanitizeTokenName('a_b!c?d'), 'abcd');
    assert.strictEqual(sanitizeTokenName('ÅSA'), 'åsa');
    assert.strictEqual(sanitizeTokenName('___'), '');
    assert.strictEqual(sanitizeTokenName(''), '');
    assert.strictEqual(sanitizeTokenName(null), '');
  });
});

// ── mintRequest (02-§106.3–106.6) ────────────────────────────────────────────

describe('mintRequest (02-§106.3–106.6)', () => {
  it('MINT-02: mints admin with the 60-day default and a verifiable token', () => {
    const r = mintRequest({ name: 'Anna Söder', role: 'admin' }, SECRET, NOW);
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(verifyToken(r.token, SECRET),
      { name: 'anna-söder', role: 'admin', epoch: NOW + 60 * DAY });
  });

  it('MINT-03: mints early with the 90-day default', () => {
    const r = mintRequest({ name: 'erik', role: 'early' }, SECRET, NOW);
    assert.strictEqual(r.ok, true);
    assert.deepStrictEqual(verifyToken(r.token, SECRET),
      { name: 'erik', role: 'early', epoch: NOW + 90 * DAY });
  });

  it('MINT-04: honours an explicit days value within range', () => {
    const r = mintRequest({ name: 'erik', role: 'admin', days: 7 }, SECRET, NOW);
    assert.strictEqual(verifyToken(r.token, SECRET).epoch, NOW + 7 * DAY);
  });

  it('MINT-05: rejects days outside 1..cap (60 admin / 90 early) or non-integer', () => {
    for (const [role, days] of [['admin', 0], ['admin', 61], ['early', 91], ['admin', -5], ['admin', 2.5], ['admin', 'nan']]) {
      const r = mintRequest({ name: 'erik', role, days }, SECRET, NOW);
      assert.strictEqual(r.ok, false, `${role}/${days} should be rejected`);
      assert.ok(r.error, 'expected an error message');
    }
  });

  it('MINT-06: whitelist — superadmin and unknown roles are rejected (02-§106.3)', () => {
    assert.strictEqual(mintRequest({ name: 'x', role: 'superadmin' }, SECRET, NOW).ok, false);
    assert.strictEqual(mintRequest({ name: 'x', role: 'root' }, SECRET, NOW).ok, false);
    assert.strictEqual(mintRequest({ name: 'x', role: '' }, SECRET, NOW).ok, false);
  });

  it('MINT-07: rejects a name that is empty after sanitisation', () => {
    assert.strictEqual(mintRequest({ name: '!!!', role: 'admin' }, SECRET, NOW).ok, false);
    assert.strictEqual(mintRequest({ role: 'admin' }, SECRET, NOW).ok, false);
  });

  it('MINT-08: minted token is byte-identical to signToken over the sanitised claims (cross-runtime vector)', () => {
    const r = mintRequest({ name: 'Anna Söder', role: 'admin' }, SECRET, NOW);
    assert.strictEqual(r.token, signToken('anna-söder', 'admin', NOW + 60 * DAY, SECRET));
  });
});

// ── Superadmin gate (02-§106.2, §106.8) ──────────────────────────────────────

// Mirrors the gate predicate the /mint-token routes use.
function isMintAuthorised(candidate, secret) {
  const requester = verifyToken(candidate, secret);
  return !!requester && requester.role === 'superadmin';
}

describe('mint gate requires superadmin (02-§106.2, §106.8)', () => {
  const future = Math.floor(Date.now() / 1000) + DAY;

  it('MINT-09: superadmin authorised; admin/early/garbage are not', () => {
    assert.strictEqual(isMintAuthorised(signToken('s', 'superadmin', future, SECRET), SECRET), true);
    assert.strictEqual(isMintAuthorised(signToken('a', 'admin', future, SECRET), SECRET), false);
    assert.strictEqual(isMintAuthorised(signToken('e', 'early', future, SECRET), SECRET), false);
    assert.strictEqual(isMintAuthorised('garbage', SECRET), false);
    assert.strictEqual(isMintAuthorised(undefined, SECRET), false);
  });

  it('MINT-10: unset secret fails closed', () => {
    assert.strictEqual(isMintAuthorised(signToken('s', 'superadmin', future, SECRET), ''), false);
  });
});

// ── Structural wiring ────────────────────────────────────────────────────────

describe('mint route wiring (02-§106.1, §106.2, §106.7)', () => {
  it('MINT-11: app.js exposes a rate-limited /mint-token requiring superadmin', () => {
    const node = read('app.js');
    assert.match(node, /app\.post\('\/mint-token', mintTokenLimiter/);
    const route = node.slice(node.indexOf("app.post('/mint-token'"));
    assert.match(route.slice(0, 700), /'superadmin'/);
    assert.match(route.slice(0, 700), /mintRequest\(/);
  });

  it('MINT-12: api/index.php exposes a rate-limited /mint-token requiring superadmin', () => {
    const php = read('api/index.php');
    assert.match(php, /\$route === '\/mint-token'/);
    const handler = php.slice(php.indexOf('function handleMintToken'));
    assert.match(handler.slice(0, 900), /RateLimit::isLimited\(clientIp\(\), 'mint-token'/);
    assert.match(handler.slice(0, 1200), /'superadmin'/);
    assert.match(handler.slice(0, 1500), /Admin::mintRequest\(/);
  });

  it('MINT-13: Admin.php exposes mintRequest and the CLI reuses the shared sanitiser', () => {
    assert.match(read('api/src/Admin.php'), /function\s+mintRequest\b/);
    assert.match(read('source/scripts/create-admin-token.js'), /sanitizeTokenName/);
  });
});

describe('mint UI and redemption wiring (02-§106.9–106.16)', () => {
  it('MINT-14: token page markup contains the hidden mint section and result row', () => {
    const { renderAdminPage } = require('../source/build/render-admin');
    const html = renderAdminPage({ name: 'SB Sommar 2026' }, '<p>f</p>');
    assert.match(html, /id="mint-section"[^>]*hidden/);
    assert.match(html, /id="mint-name"/);
    assert.match(html, /id="mint-role"/);
    assert.match(html, /id="mint-days"/);
    assert.match(html, /id="mint-link"/);
    assert.match(html, /id="mint-copy"/);
    assert.match(html, /id="mint-share"[^>]*hidden/);
    assert.match(html, /Tidig åtkomst/);
  });

  it('MINT-15: admin.js gates the mint UI on the superadmin role and redeems hash tokens', () => {
    const src = read('source/assets/js/client/admin.js');
    assert.match(src, /'superadmin'/);
    assert.match(src, /location\.hash/);
    assert.match(src, /history\.replaceState/);
    assert.match(src, /#token=/);
    assert.match(src, /navigator\.share/);
    assert.doesNotMatch(src, /\?token=/, 'redemption must use the fragment, not a query parameter');
  });

  it('MINT-16: style.css keeps [hidden] authoritative for .admin-form (02-§106.9)', () => {
    // The mint section is `<div id="mint-section" class="admin-form" hidden>`.
    // `.admin-form { display: flex }` would defeat the `hidden` attribute
    // (an author display rule beats the UA `[hidden] { display: none }`),
    // so an explicit override is required for the role gate to hide the
    // section from non-superadmins. Without it the form renders for everyone.
    const css = read('source/assets/cs/style.css');
    assert.match(css, /\.admin-form\[hidden\]\s*\{\s*display:\s*none/);
  });

  it('MINT-17: token page uses site button styles and a read-only link field (02-§91.34, §106.20)', () => {
    const { renderAdminPage } = require('../source/build/render-admin');
    const html = renderAdminPage({ name: 'SB Sommar 2026' }, '<p>f</p>');
    // Buttons use the site classes, not the orphaned (unstyled) BEM .btn--* ones.
    assert.doesNotMatch(html, /btn--(primary|secondary)/);
    assert.match(html, /class="btn-primary"/);
    assert.match(html, /class="btn-secondary/);
    // The generated link field is de-emphasised so it reads as output.
    const css = read('source/assets/cs/style.css');
    assert.match(css, /#mint-link\s*\{[^}]*cursor:\s*default/);
    assert.match(css, /#mint-link\s*\{[^}]*background/);
  });

  it('MINT-18: validateMintFields enforces required name and in-range integer days (02-§106.19)', () => {
    assert.deepStrictEqual(validateMintFields({ name: 'anna', days: 60, max: 60 }), { name: null, days: null });
    assert.match(validateMintFields({ name: '', days: 60, max: 60 }).name, /obligatorisk/i);
    assert.match(validateMintFields({ name: '   ', days: 60, max: 60 }).name, /obligatorisk/i);
    assert.match(validateMintFields({ name: 'a', days: '', max: 60 }).days, /obligatorisk/i);
    assert.match(validateMintFields({ name: 'a', days: 90, max: 60 }).days, /1–60 dagar/);
    assert.match(validateMintFields({ name: 'a', days: 0, max: 60 }).days, /1–60/);
    assert.match(validateMintFields({ name: 'a', days: 1.5, max: 60 }).days, /1–60/);
    assert.strictEqual(validateMintFields({ name: 'a', days: 90, max: 90 }).days, null);
  });
});
