'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/**
 * Reads the VERSION file from the project root.
 * Returns the trimmed content, or '0.0' if the file is missing.
 *
 * @param {string} rootDir - Absolute path to the project root
 * @returns {string} e.g. '1.0'
 */
function readVersionFile(rootDir) {
  const versionPath = path.join(rootDir, 'VERSION');
  if (!fs.existsSync(versionPath)) return '0.0';
  return fs.readFileSync(versionPath, 'utf8').trim();
}

/**
 * Finds the latest git tag matching "v{base}.*" and returns the full
 * semver (e.g. "1.0.3"). Falls back to "{base}.0" if no tags exist
 * or git is not available.
 *
 * @param {string} base - Major.minor from VERSION file, e.g. '1.0'
 * @returns {string} e.g. '1.0.3'
 */
function resolveLatestTag(base) {
  try {
    const output = execFileSync(
      'git', ['tag', '--list', `v${base}.*`, '--sort=-version:refname'],
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();
    const latest = output.split('\n')[0];
    if (latest) return latest.replace(/^v/, '');
  } catch {
    // git not available or not a repo — fall back
  }
  return `${base}.0`;
}

/**
 * Builds a local-dev version string: "1.0.3 – Lokal YYYY-MM-DD HH:MM"
 * Uses the latest git tag as the base version.
 * The date/time is in Europe/Stockholm time.
 *
 * @param {string} baseVersion - e.g. '1.0.3' (from resolveLatestTag)
 * @returns {string}
 */
function buildLocalVersion(baseVersion) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
  const timeStr = now.toLocaleTimeString('sv-SE', {
    timeZone: 'Europe/Stockholm',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${baseVersion} \u2013 Lokal ${dateStr} ${timeStr}`;
}

/**
 * Returns the version string to embed in the footer, or null if none
 * should be shown.
 *
 * Logic:
 *   - If BUILD_VERSION is set: use it directly. All deploy workflows set
 *     it — full prod/QA deploys and the post-merge event-data deploy,
 *     which computes the current production version from the latest git
 *     tag (02-§62.9).
 *   - If running in CI (GITHUB_ACTIONS is set) without BUILD_VERSION:
 *     return null. This is a defensive fallback (02-§62.21) — a CI build
 *     that forgot to pass BUILD_VERSION renders no version rather than a
 *     misleading local timestamp.
 *   - Otherwise (local dev): build a local timestamp version.
 *     Local .env may set BUILD_ENV for testing, but that should not
 *     suppress the version — only real CI runs should.
 *
 * @param {object} env - process.env or a mock
 * @param {string} rootDir - project root for reading VERSION
 * @returns {string|null}
 */
function resolveVersionString(env, rootDir) {
  if (env.BUILD_VERSION) return env.BUILD_VERSION;
  if (env.GITHUB_ACTIONS) return null;
  const base = readVersionFile(rootDir);
  return buildLocalVersion(resolveLatestTag(base));
}

module.exports = { readVersionFile, resolveLatestTag, buildLocalVersion, resolveVersionString };
