'use strict';

// Tests for the admin token status message: role-aware rights text (02-§91.33).
//
// Testable in Node.js:
//   - tokenRole(): reads the role from the token string (TOK-23)
//   - roleDescription(): maps each role to its Swedish rights sentence (TOK-24)
//
// Browser-only (manual checkpoint in traceability):
//   - 02-§91.33: the on-page status names the recipient and renders the
//     rights sentence — open /token.html with each role and confirm.
//
// admin.js is a browser IIFE that skips its DOM wiring when `document` is
// undefined (Node) and exports its pure helpers, so they can be required here.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { roleDescription, tokenRole } = require('../source/assets/js/client/admin.js');

describe('token status rights text (02-§91.33)', () => {
  it('TOK-23: tokenRole reads the role from namn_roll_epoch_sig', () => {
    assert.strictEqual(tokenRole('anna_admin_1750000000_abc'), 'admin');
    assert.strictEqual(tokenRole('bo_early_1750000000_xyz'), 'early');
    assert.strictEqual(tokenRole('cli_superadmin_1750000000_sig'), 'superadmin');
    assert.strictEqual(tokenRole(''), null);
    assert.strictEqual(tokenRole(null), null);
  });

  it('TOK-24: roleDescription maps each role to its Swedish rights sentence', () => {
    const su = roleDescription('superadmin');
    assert.match(su, /alla aktiviteter/i);
    assert.match(su, /innan lägret öppnar/i);
    assert.match(su, /token-länk/i);

    const ad = roleDescription('admin');
    assert.match(ad, /alla aktiviteter/i);
    assert.match(ad, /innan det öppnar/i);
    assert.doesNotMatch(ad, /token-länk/i);

    const ea = roleDescription('early');
    assert.match(ea, /egna aktiviteter/i);
    assert.match(ea, /innan formuläret öppnar/i);
    assert.doesNotMatch(ea, /alla aktiviteter/i);

    // An unrecognised or missing role yields no rights text — the status
    // still works, it simply omits the sentence.
    assert.strictEqual(roleDescription('whatever'), '');
    assert.strictEqual(roleDescription(null), '');
  });
});
