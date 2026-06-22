'use strict';

// Tests for source/build/version.js — 02-§62.8, 02-§62.15, 02-§62.16, 02-§62.17, 02-§62.21.
//
// These verify:
//   - readVersionFile reads the VERSION file or falls back to '0.0' (VER-01..02)
//   - resolveLatestTag finds latest tag or falls back to base.0 (VER-10..11)
//   - buildLocalVersion produces the correct format (VER-03..04)
//   - resolveVersionString picks the right source per environment (VER-05..09)

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { readVersionFile, resolveLatestTag, buildLocalVersion, resolveVersionString } = require('../source/build/version');

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ver-test-'));
}

// ── readVersionFile ─────────────────────────────────────────────────────────

describe('readVersionFile (02-§62.1, 02-§62.17)', () => {
  it('VER-01: returns content of VERSION file', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'VERSION'), '1.0\n', 'utf8');
    assert.strictEqual(readVersionFile(dir), '1.0');
    fs.rmSync(dir, { recursive: true });
  });

  it('VER-02: returns "0.0" when VERSION file is missing', () => {
    const dir = makeTmpDir();
    assert.strictEqual(readVersionFile(dir), '0.0');
    fs.rmSync(dir, { recursive: true });
  });
});

// ── resolveLatestTag ─────────────────────────────────────────────────────────

describe('resolveLatestTag (02-§62.8)', () => {
  it('VER-10: returns full semver from existing tag in this repo', () => {
    // This repo has v1.0.0 tagged — resolveLatestTag('1.0') should find it.
    const result = resolveLatestTag('1.0');
    assert.match(result, /^1\.0\.\d+$/, 'Expected 1.0.N format');
  });

  it('VER-11: falls back to base.0 for non-existent base', () => {
    const result = resolveLatestTag('99.99');
    assert.strictEqual(result, '99.99.0');
  });
});

// ── buildLocalVersion ───────────────────────────────────────────────────────

describe('buildLocalVersion (02-§62.8)', () => {
  it('VER-03: includes the base version and "Lokal"', () => {
    const result = buildLocalVersion('1.0');
    assert.ok(result.startsWith('1.0'), 'Expected version to start with base version');
    assert.ok(result.includes('Lokal'), 'Expected "Lokal" in local version string');
  });

  it('VER-04: includes a date in YYYY-MM-DD format', () => {
    const result = buildLocalVersion('2.5');
    assert.match(result, /\d{4}-\d{2}-\d{2}/, 'Expected date in YYYY-MM-DD format');
  });
});

// ── resolveVersionString ────────────────────────────────────────────────────

describe('resolveVersionString (02-§62.15, 02-§62.16, 02-§62.21)', () => {
  it('VER-05: returns BUILD_VERSION directly when set', () => {
    const dir = makeTmpDir();
    const env = { BUILD_VERSION: '1.0.4' };
    assert.strictEqual(resolveVersionString(env, dir), '1.0.4');
    fs.rmSync(dir, { recursive: true });
  });

  it('VER-06: returns null in CI without BUILD_VERSION (defensive fallback)', () => {
    const dir = makeTmpDir();
    const env = { GITHUB_ACTIONS: 'true', BUILD_ENV: 'production' };
    assert.strictEqual(resolveVersionString(env, dir), null);
    fs.rmSync(dir, { recursive: true });
  });

  it('VER-07: returns local timestamp string with full semver when no env vars set', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'VERSION'), '1.0\n', 'utf8');
    const env = {};
    const result = resolveVersionString(env, dir);
    // resolveLatestTag('1.0') finds v1.0.0 in this repo, so version starts with '1.0.0'
    assert.match(result, /^1\.0\.\d+/, 'Expected full semver (e.g. 1.0.0)');
    assert.ok(result.includes('Lokal'), 'Expected "Lokal" for local dev');
    fs.rmSync(dir, { recursive: true });
  });

  it('VER-08: returns local version even when BUILD_ENV is set locally', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, 'VERSION'), '1.0\n', 'utf8');
    const env = { BUILD_ENV: 'production' };
    const result = resolveVersionString(env, dir);
    assert.ok(result.includes('Lokal'), 'Expected local version when not in CI');
    fs.rmSync(dir, { recursive: true });
  });

  it('VER-09: returns null for QA CI without BUILD_VERSION', () => {
    const dir = makeTmpDir();
    const env = { GITHUB_ACTIONS: 'true', BUILD_ENV: 'qa' };
    assert.strictEqual(resolveVersionString(env, dir), null);
    fs.rmSync(dir, { recursive: true });
  });
});
