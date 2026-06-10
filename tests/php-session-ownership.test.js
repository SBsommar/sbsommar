'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

describe('PHP signed session ownership parity (02-§44.15, §44.17, §101)', () => {
  it('PSES-01: Session.php exposes signed ownership helpers', () => {
    const src = read('api/src/Session.php');
    assert.match(src, /function\s+createOwnershipEntry\b/);
    assert.match(src, /function\s+parseVerifiedSessionIds\b/);
    assert.match(src, /hash_hmac\s*\(\s*['"]sha256['"]/);
    assert.match(src, /hash_equals\s*\(/);
    assert.match(src, /'exp'\s*=>/);
    assert.match(src, /time\s*\(\s*\)\s*\+\s*self::MAX_AGE_SECONDS/);
  });

  it('PSES-02: edit/delete handlers use verified ownership, not display IDs', () => {
    const src = read('api/index.php');
    assert.match(src, /Session::parseVerifiedSessionIds/);
    assert.doesNotMatch(src, /ownedIds\s*=\s*Session::parseSessionIds/);
  });

  it('PSES-03: add handlers require SESSION_SECRET before setting ownership cookies', () => {
    const src = read('api/index.php');
    assert.match(src, /\$_ENV\['SESSION_SECRET'\]/);
    assert.match(src, /Session::createOwnershipEntry/);
    assert.match(src, /handleAddEvent\(\$activeCamp,\s*\$adminTokenSecret,\s*\$sessionSecret\)/);
    assert.match(src, /function\s+handleAddEvent\([^)]*string\s+\$sessionSecret/);
  });
});
