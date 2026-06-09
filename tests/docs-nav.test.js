'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

// ── Requirements: 02-§97.25, 02-§97.28, 02-§97.29 ────────────────────────────
// The documentation site's within-family navigation is driven by a single
// data file, docs/_data/docs-nav.yml, that lists each documentation family
// and the files belonging to it (02-§97.28, 02-§97.29). Every Markdown file
// under docs/ carries YAML front-matter with a title (02-§97.25).
//
// These tests read the repository tree directly. The data file is checked
// against the actual files on disk, so it cannot silently rot when a family
// member is added or removed — the test fails until the single source is
// brought back in sync.

const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');
const NAV_DATA_PATH = path.join(DOCS_DIR, '_data', 'docs-nav.yml');

// The four documentation families that have a subfolder of their own.
const FAMILY_DIRS = [
  '02-requirements',
  '03-architecture',
  '07-design',
  '99-traceability',
];

/** Markdown files actually present directly inside docs/<dir>/. */
function actualMarkdownFiles(dir) {
  return fs
    .readdirSync(path.join(DOCS_DIR, dir))
    .filter((name) => name.endsWith('.md'))
    .sort();
}

/** Every .md file under docs/, recursively, as repo-relative paths. */
function allMarkdownFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...allMarkdownFiles(full));
    } else if (entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

/** Parse the leading YAML front-matter block of a Markdown file, or null. */
function frontMatter(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!match) return null;
  return yaml.load(match[1]) || {};
}

describe('docs-nav.yml — single source for within-family navigation (02-§97.28, 02-§97.29)', () => {
  it('DOCS-NAV-01: the data file exists and parses as a families list', () => {
    assert.ok(fs.existsSync(NAV_DATA_PATH), 'docs/_data/docs-nav.yml must exist');
    const data = yaml.load(fs.readFileSync(NAV_DATA_PATH, 'utf8'));
    assert.ok(data && Array.isArray(data.families), 'must have a `families` array');
  });

  it('DOCS-NAV-02: every family has a dir, a human-readable name, and a files list', () => {
    const data = yaml.load(fs.readFileSync(NAV_DATA_PATH, 'utf8'));
    for (const family of data.families) {
      assert.ok(typeof family.dir === 'string' && family.dir, 'family needs a dir');
      assert.ok(typeof family.name === 'string' && family.name, `family ${family.dir} needs a name`);
      assert.ok(Array.isArray(family.files) && family.files.length > 0, `family ${family.dir} needs files`);
    }
  });

  it('DOCS-NAV-03: the data file covers exactly the four family folders', () => {
    const data = yaml.load(fs.readFileSync(NAV_DATA_PATH, 'utf8'));
    const dirs = data.families.map((f) => f.dir).sort();
    assert.deepEqual(dirs, [...FAMILY_DIRS].sort());
  });

  for (const dir of FAMILY_DIRS) {
    it(`DOCS-NAV-04 (${dir}): listed files match the .md files actually on disk`, () => {
      const data = yaml.load(fs.readFileSync(NAV_DATA_PATH, 'utf8'));
      const family = data.families.find((f) => f.dir === dir);
      assert.ok(family, `docs-nav.yml must list family ${dir}`);
      const listed = [...family.files].sort();
      assert.deepEqual(listed, actualMarkdownFiles(dir),
        `docs-nav.yml listing for ${dir} is out of sync with the folder`);
    });
  }
});

describe('docs front-matter — every page carries a title (02-§97.25)', () => {
  for (const file of allMarkdownFiles(DOCS_DIR)) {
    const rel = path.relative(REPO_ROOT, file);
    it(`DOCS-NAV-05: ${rel} has front-matter with a non-empty title`, () => {
      const fm = frontMatter(file);
      assert.ok(fm, `${rel} is missing YAML front-matter`);
      assert.ok(typeof fm.title === 'string' && fm.title.trim().length > 0,
        `${rel} front-matter needs a non-empty title`);
    });
  }
});
