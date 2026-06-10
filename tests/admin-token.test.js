'use strict';

// Tests for admin token infrastructure — 02-§91.1–91.32.
//
// Testable in Node.js:
//   - admin module: signToken/verifyToken/verifyAdminToken, role gating,
//     tamper/expiry rejection, embedded-expiry helpers (TOK-01..TOK-20)
//   - cross-runtime parity: a fixed (secret, claims) → one known token string
//     that both Node and PHP must reproduce (TOK-01); PHP behaviour is covered
//     by api/tests/AdminTokenTest.php, which asserts the SAME vector
//   - render-admin.js: page structure, layout, form elements (ADM-11..17)
//
// Browser-only (manual checkpoints documented in traceability):
//   - 02-§91.11: Calls POST /verify-admin on submit
//   - 02-§91.12: Valid → store token in localStorage, show success
//   - 02-§91.13: Invalid → show error, store nothing
//   - 02-§91.19..22: Footer admin-icon states

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

const {
  signToken,
  verifyToken,
  verifyAdminToken,
  isTokenExpired,
  extractTokenExpiry,
} = require('../source/api/admin');

// ── Deterministic cross-runtime vector ───────────────────────────────────────
// Fixed secret + claims → one known token. api/tests/AdminTokenTest.php asserts
// the identical strings, proving Node and PHP sign byte-for-byte the same.
const VEC_SECRET = '0123456789abcdef0123456789abcdef';
const VEC_EPOCH = 2000000000;
const VEC = {
  admin: 'erik_admin_2000000000_BxCLVBJtH61eKTpsn8zsTvYzhL83yf-nF-2HwbBIBVI',
  early: 'anna_early_2000000000_0jz-8E6aG-x-z2jjKaEY2YgV6Me9qFAJyG5s4mLl61w',
  superadmin: 'sigge_superadmin_2000000000_4oTZ8CsILnVAvDRIqO8ZZj1tuVF52KAxRDKjPs7xyAQ',
};

const SECRET = 'unit-test-secret-32-bytes-long!!';
const future = () => Math.floor(Date.now() / 1000) + 86400;
const past = () => Math.floor(Date.now() / 1000) - 86400;

// ── Signing ──────────────────────────────────────────────────────────────────

describe('signToken (02-§91.2)', () => {
  it('TOK-01: produces namn_roll_epoch_sig and matches the fixed vector', () => {
    assert.strictEqual(signToken('erik', 'admin', VEC_EPOCH, VEC_SECRET), VEC.admin);
    assert.strictEqual(signToken('anna', 'early', VEC_EPOCH, VEC_SECRET), VEC.early);
    assert.strictEqual(signToken('sigge', 'superadmin', VEC_EPOCH, VEC_SECRET), VEC.superadmin);
  });

  it('TOK-02: a different secret yields a different signature', () => {
    assert.notStrictEqual(signToken('erik', 'admin', VEC_EPOCH, 'a-different-secret'), VEC.admin);
  });
});

// ── Verification ─────────────────────────────────────────────────────────────

describe('verifyToken (02-§91.2, §91.29)', () => {
  it('TOK-03: accepts a freshly signed token and returns its claims', () => {
    const epoch = future();
    assert.deepStrictEqual(verifyToken(signToken('erik', 'admin', epoch, SECRET), SECRET),
      { name: 'erik', role: 'admin', epoch });
  });

  it('TOK-04: validates the fixed vector', () => {
    assert.strictEqual(verifyToken(VEC.admin, VEC_SECRET).role, 'admin');
    assert.strictEqual(verifyToken(VEC.early, VEC_SECRET).role, 'early');
  });

  it('TOK-05: rejects a token signed with a different secret', () => {
    assert.strictEqual(verifyToken(signToken('erik', 'admin', future(), 'a-secret'), SECRET), null);
  });

  it('TOK-06: rejects a tampered role (signature no longer matches)', () => {
    const tok = signToken('erik', 'early', future(), SECRET);
    assert.strictEqual(verifyToken(tok.replace('_early_', '_admin_'), SECRET), null);
  });

  it('TOK-07: rejects a tampered epoch', () => {
    const epoch = future();
    const tok = signToken('erik', 'admin', epoch, SECRET);
    assert.strictEqual(verifyToken(tok.replace(`_${epoch}_`, `_${epoch + 1}_`), SECRET), null);
  });

  it('TOK-08: rejects an unknown role even with a valid signature', () => {
    // signToken will happily sign any role; verifyToken must reject unknown ones.
    assert.strictEqual(verifyToken(signToken('erik', 'root', future(), SECRET), SECRET), null);
  });

  it('TOK-09: rejects an expired token', () => {
    assert.strictEqual(verifyToken(signToken('erik', 'admin', past(), SECRET), SECRET), null);
  });

  it('TOK-10: returns null when the secret is empty (admin disabled)', () => {
    assert.strictEqual(verifyToken(VEC.admin, ''), null);
  });

  it('TOK-11: returns null for malformed tokens', () => {
    for (const bad of ['', null, undefined, 'noseparators', 'a_b_c', 'a_b_notnum_sig']) {
      assert.strictEqual(verifyToken(bad, SECRET), null);
    }
  });

  it('TOK-12: round-trips names whose signatures contain "_" and "-" (base64url)', () => {
    for (let i = 0; i < 50; i++) {
      const epoch = future();
      assert.deepStrictEqual(verifyToken(signToken(`user${i}`, 'admin', epoch, SECRET), SECRET),
        { name: `user${i}`, role: 'admin', epoch });
    }
  });
});

// ── Admin role gating ────────────────────────────────────────────────────────

describe('verifyAdminToken (02-§91.31)', () => {
  it('TOK-13: true for admin and superadmin', () => {
    assert.strictEqual(verifyAdminToken(signToken('a', 'admin', future(), SECRET), SECRET), true);
    assert.strictEqual(verifyAdminToken(signToken('s', 'superadmin', future(), SECRET), SECRET), true);
  });

  it('TOK-14: false for early (recognised role, but not admin-equivalent)', () => {
    assert.strictEqual(verifyAdminToken(signToken('e', 'early', future(), SECRET), SECRET), false);
  });

  it('TOK-15: false for wrong secret / empty token', () => {
    assert.strictEqual(verifyAdminToken(VEC.admin, 'wrong-secret'), false);
    assert.strictEqual(verifyAdminToken('', SECRET), false);
  });
});

// ── Embedded-expiry helpers ──────────────────────────────────────────────────

describe('embedded expiry helpers (02-§91.29)', () => {
  it('TOK-16: extractTokenExpiry reads the epoch segment of the new format', () => {
    assert.strictEqual(extractTokenExpiry(VEC.admin), VEC_EPOCH);
  });

  it('TOK-17: extractTokenExpiry returns 0 for malformed tokens', () => {
    assert.strictEqual(extractTokenExpiry('a_b_c'), 0);
    assert.strictEqual(extractTokenExpiry(''), 0);
  });

  it('TOK-18: isTokenExpired true for past epoch, false for future', () => {
    assert.strictEqual(isTokenExpired(signToken('e', 'admin', past(), SECRET)), true);
    assert.strictEqual(isTokenExpired(signToken('e', 'admin', future(), SECRET)), false);
  });

  it('TOK-19: isTokenExpired true (fail-closed) for malformed tokens', () => {
    assert.strictEqual(isTokenExpired('a_b_c'), true);
    assert.strictEqual(isTokenExpired(''), true);
  });
});

// ── PHP parity (structural; behavioural vector parity in AdminTokenTest.php) ──

describe('PHP token parity (structural) (02-§91.8)', () => {
  const php = read('api/src/Admin.php');

  it('TOK-20: Admin.php exposes the same helpers and primitives', () => {
    assert.match(php, /function\s+signToken\b/);
    assert.match(php, /function\s+verifyToken\b/);
    assert.match(php, /function\s+verifyAdminToken\b/);
    assert.match(php, /hash_hmac\('sha256'/);
    assert.match(php, /strtr\(base64_encode/);
    assert.match(php, /hash_equals\(self::tokenDigest/);
  });
});

// ── render-admin page ───────────────────────────────────────────────────────

const { renderAdminPage } = require('../source/build/render-admin');

const CAMP = {
  name: 'SB Sommar 2026',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};
const FOOTER_HTML = '<p>Test footer</p>';

describe('renderAdminPage (02-§91.9, §91.10, §91.14, §91.15)', () => {
  it('ADM-11: renders a valid HTML document', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('<!DOCTYPE html>'), 'Expected doctype');
    assert.ok(html.includes('</html>'), 'Expected closing html tag');
  });

  it('ADM-12: contains a text input for the token', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('type="text"') || html.includes("type='text'"),
      'Expected text input');
  });

  it('ADM-13: contains a submit button', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('type="submit"') || html.includes("type='submit'"),
      'Expected submit button');
  });

  it('ADM-14: includes shared layout (nav and footer)', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('class="page-nav"'), 'Expected page-nav');
    assert.ok(html.includes('class="site-footer"'), 'Expected site-footer');
    assert.ok(html.includes('Test footer'), 'Expected footer content');
  });

  it('ADM-15: page is not listed in navigation links', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    const navMatch = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/);
    assert.ok(navMatch, 'Expected nav element');
    assert.ok(!navMatch[0].includes('admin.html'), 'admin.html must not be in nav');
  });

  it('ADM-16: user-facing text is in Swedish (§91.25)', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('lang="sv"'), 'Expected lang="sv"');
  });

  it('ADM-17: includes admin.js script', () => {
    const html = renderAdminPage(CAMP, FOOTER_HTML);
    assert.ok(html.includes('admin'), 'Expected reference to admin script');
  });
});

// ── Footer admin-icon container ─────────────────────────────────────────────
// ADM-18: admin-status is injected by build.js inside the version paragraph,
// not by pageFooter. Verified by snapshot tests.
