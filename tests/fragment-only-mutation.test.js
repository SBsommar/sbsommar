'use strict';

// Fragment-only edit and delete (02-§109.9, §109.12, §109.26).
//
// The edit/delete GitHub orchestration makes network calls and cannot run in
// Node tests, so these are source-structural checks (same approach as
// api-sync-errors.test.js): they verify the camp-YAML fallback is gone from
// both the Node and PHP mutation paths, so no add/edit/delete ever rewrites the
// camp YAML file.
//
// Manual checkpoints (verified against a running API — see the memory note that
// only rejection paths should be exercised live, since a valid mutation opens a
// real PR):
//   FRAGONLY-M01: With the active camp fully split into fragments, delete an
//     owned event in the browser → its fragment PR opens and auto-merges; the
//     camp YAML file is untouched in the PR diff.
//   FRAGONLY-M02: Edit an owned event → only its fragment file changes; the
//     camp YAML file is untouched.
//   FRAGONLY-M03 (PHP, production): a delete/edit for an id with no fragment →
//     the synchronous PHP API returns { success: false } with a Swedish error
//     and writes nothing; the fire-and-forget Node server logs the failure.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const NODE_SRC = fs.readFileSync(path.join(__dirname, '..', 'source', 'api', 'github.js'), 'utf8');
const EDIT_SRC = fs.readFileSync(path.join(__dirname, '..', 'source', 'api', 'edit-event.js'), 'utf8');
const PHP_SRC  = fs.readFileSync(path.join(__dirname, '..', 'api', 'src', 'GitHub.php'), 'utf8');

// Return the source between `start` (inclusive) and the first occurrence of any
// of `ends` after it (exclusive). Asserts both markers are present so a renamed
// function fails loudly rather than silently passing on an empty slice.
function sliceBody(src, start, ends) {
  const i = src.indexOf(start);
  assert.ok(i >= 0, `marker not found: ${start}`);
  let j = -1;
  for (const end of ends) {
    const k = src.indexOf(end, i + start.length);
    if (k >= 0 && (j === -1 || k < j)) j = k;
  }
  assert.ok(j >= 0, `no end marker (${ends.join(', ')}) found after ${start}`);
  return src.slice(i, j);
}

describe('Node API: fragment-only edit/delete (02-§109.9, §109.12, §109.26)', () => {
  const updateBody = sliceBody(NODE_SRC, 'async function updateEventInActiveCamp', ['async function removeEventFromActiveCamp']);
  const removeBody = sliceBody(NODE_SRC, 'async function removeEventFromActiveCamp', ['module.exports']);

  it('FRAGONLY-01: updateEventInActiveCamp never touches the camp YAML file', () => {
    assert.ok(!updateBody.includes('campFilePath'), 'edit must not read/write the camp YAML file');
    assert.ok(!updateBody.includes('patchEventInYaml'), 'edit must not use the removed monolith patcher');
  });

  it('FRAGONLY-02: updateEventInActiveCamp targets the fragment and raises on a missing one', () => {
    assert.ok(updateBody.includes('fragmentPath'), 'edit must resolve the fragment path');
    assert.ok(/throw new Error/.test(updateBody), 'edit must raise when no fragment exists');
  });

  it('FRAGONLY-03: removeEventFromActiveCamp never touches the camp YAML file', () => {
    assert.ok(!removeBody.includes('campFilePath'), 'delete must not read/write the camp YAML file');
    assert.ok(!removeBody.includes('removeEventFromYaml'), 'delete must not use the removed monolith remover');
    assert.ok(!removeBody.includes('putFile'), 'delete only deletes a file — it must not write any file');
  });

  it('FRAGONLY-04: removeEventFromActiveCamp deletes the fragment and raises on a missing one', () => {
    assert.ok(removeBody.includes('deleteFile'), 'delete must remove the fragment file');
    assert.ok(/throw new Error/.test(removeBody), 'delete must raise when no fragment exists');
  });

  it('FRAGONLY-05: the monolith patch/remove helpers are gone from the API layer', () => {
    assert.ok(!NODE_SRC.includes('patchEventInYaml'), 'github.js must not reference patchEventInYaml');
    assert.ok(!NODE_SRC.includes('removeEventFromYaml'), 'github.js must not reference removeEventFromYaml');
    assert.ok(!EDIT_SRC.includes('function patchEventInYaml'), 'edit-event.js must not define patchEventInYaml');
    assert.ok(!EDIT_SRC.includes('function removeEventFromYaml'), 'edit-event.js must not define removeEventFromYaml');
  });
});

describe('PHP API: fragment-only edit/delete (02-§109.9, §109.12, §109.26)', () => {
  const updateBody = sliceBody(PHP_SRC, 'public function updateEventInActiveCamp', ['public function removeEventFromActiveCamp']);
  const removeBody = sliceBody(PHP_SRC, 'public function removeEventFromActiveCamp', ['private function resolveActiveCamp']);

  it('FRAGONLY-10: updateEventInActiveCamp never touches the camp YAML file', () => {
    assert.ok(!updateBody.includes('campFilePath'), 'edit must not read/write the camp YAML file');
    assert.ok(!updateBody.includes('patchEventInYaml'), 'edit must not use the removed monolith patcher');
    assert.ok(/throw new \\RuntimeException/.test(updateBody), 'edit must raise when no fragment exists');
  });

  it('FRAGONLY-11: removeEventFromActiveCamp never touches the camp YAML file', () => {
    assert.ok(!removeBody.includes('campFilePath'), 'delete must not read/write the camp YAML file');
    assert.ok(!removeBody.includes('removeEventFromYaml'), 'delete must not use the removed monolith remover');
    assert.ok(!removeBody.includes('putFile'), 'delete only deletes a file — it must not write any file');
    assert.ok(removeBody.includes('deleteFile'), 'delete must remove the fragment file');
    assert.ok(/throw new \\RuntimeException/.test(removeBody), 'delete must raise when no fragment exists');
  });

  it('FRAGONLY-12: the monolith patch/remove helpers are gone from the PHP layer', () => {
    assert.ok(!PHP_SRC.includes('function removeEventFromYaml'), 'GitHub.php must not define removeEventFromYaml');
    assert.ok(!PHP_SRC.includes('function patchEventInYaml'), 'GitHub.php must not define patchEventInYaml');
  });
});
