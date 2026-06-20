'use strict';

// Tests for the helper that maps a changed file path to the camp file it belongs
// to, so the post-merge deploy workflow can apply QA gating to fragment files
// nested under a per-camp directory (02-§109.22).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { campFileForPath } = require('../source/scripts/changed-camp-file');

describe('campFileForPath — fragment/camp attribution (FRAG-50..58)', () => {
  it('FRAG-50: maps a nested fragment path to its camp file (02-§109.22)', () => {
    assert.strictEqual(
      campFileForPath('source/data/2026-06-syssleback/frukost-2026-06-22-0800.yaml'),
      '2026-06-syssleback.yaml',
    );
  });

  it('FRAG-51: maps a top-level camp file path to itself (02-§109.22)', () => {
    assert.strictEqual(
      campFileForPath('source/data/2026-06-syssleback.yaml'),
      '2026-06-syssleback.yaml',
    );
  });

  it('FRAG-52: maps a QA-camp fragment to the QA camp file', () => {
    assert.strictEqual(
      campFileForPath('source/data/qa-testcamp/lek-2026-06-22-1000.yaml'),
      'qa-testcamp.yaml',
    );
  });

  it('FRAG-53: returns null for camps.yaml (not an event-data file)', () => {
    assert.strictEqual(campFileForPath('source/data/camps.yaml'), null);
  });

  it('FRAG-54: returns null for local.yaml (not an event-data file)', () => {
    assert.strictEqual(campFileForPath('source/data/local.yaml'), null);
  });

  it('FRAG-55: returns null for a path outside source/data/', () => {
    assert.strictEqual(campFileForPath('app.js'), null);
    assert.strictEqual(campFileForPath('source/build/build.js'), null);
  });

  it('FRAG-56: returns null for a non-YAML file under source/data/', () => {
    assert.strictEqual(campFileForPath('source/data/qr-codes.txt'), null);
  });

  it('FRAG-57: attributes a deeply nested path to its first directory segment', () => {
    assert.strictEqual(
      campFileForPath('source/data/2026-06-syssleback/sub/x.yaml'),
      '2026-06-syssleback.yaml',
    );
  });

  it('FRAG-58: tolerates a leading ./ on the path', () => {
    assert.strictEqual(
      campFileForPath('./source/data/2026-06-syssleback/x.yaml'),
      '2026-06-syssleback.yaml',
    );
  });
});
