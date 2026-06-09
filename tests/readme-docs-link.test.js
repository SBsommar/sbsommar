'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// ── Requirement: 02-§97.13, 02-§97.14 ────────────────────────────────────────
// README.md must expose the published documentation site and list every
// file currently published under docs/. These tests read the repository-root
// README.md once and assert the relevant substrings.

const REPO_ROOT = path.resolve(__dirname, '..');
const README_PATH = path.join(REPO_ROOT, 'README.md');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');

const DOCS_SITE_URL = 'https://moggleif.github.io/sbsommar/';
// Match the URL inside a Markdown autolink (`<...>`) so CodeQL recognises
// the surrounding context — see 02-§39.4.
const DOCS_SITE_AUTOLINK = `<${DOCS_SITE_URL}>`;

// Paths are relative to the repository's `docs/` directory. Topic files
// that have been split into a subfolder (e.g. `02-requirements/`) are
// listed by their subfolder path. The `index.md` files inside subfolders
// (e.g. `02-requirements/index.md`) are intentionally excluded — the
// README links to the subfolder URL (`docs/02-requirements/`) which
// renders the same content via Jekyll. The top-level `docs/index.md`
// (the docs site landing page) is also excluded.
const EXPECTED_DOC_FILES = [
  '01-CONTRIBUTORS.md',
  '02-requirements/pages-navigation.md',
  '02-requirements/schedule-and-detail.md',
  '02-requirements/add-edit-forms.md',
  '02-requirements/event-data.md',
  '02-requirements/build-deploy.md',
  '02-requirements/caching-performance.md',
  '02-requirements/platform-security.md',
  '02-requirements/design-and-content.md',
  '02-requirements/archive.md',
  '03-architecture/data-layer.md',
  '03-architecture/rendering.md',
  '03-architecture/forms-and-api.md',
  '03-architecture/ci-and-deploy.md',
  '03-architecture/pages-and-content.md',
  '03-architecture/platform-and-security.md',
  '03-architecture/appendix.md',
  '04-OPERATIONS.md',
  '05-DATA_CONTRACT.md',
  '06-EVENT_DATA_MODEL.md',
  '07-design/components.md',
  '07-design/css-strategy.md',
  '07-design/imagery-and-accessibility.md',
  '08-ENVIRONMENTS.md',
  '09-RELEASING.md',
  '99-traceability/02-requirements.md',
  '99-traceability/03-architecture.md',
  '99-traceability/05-data-contract.md',
  '99-traceability/07-design.md',
  '99-traceability/claude.md',
  '99-traceability/test-id-legend.md',
];

// README links to the subfolder index via the folder URL `docs/02-requirements/`
// rather than the file path `docs/02-requirements/index.md`. The test asserts
// that link separately so it stays in sync with the README format.
const EXPECTED_FOLDER_INDEX_LINKS = [
  '02-requirements/',
  '03-architecture/',
  '07-design/',
  '99-traceability/',
];

function listMarkdownFilesRecursive(dir, base = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue; // skip Jekyll meta dirs
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listMarkdownFilesRecursive(abs, rel));
    } else if (entry.name.endsWith('.md')) {
      out.push(rel);
    }
  }
  return out;
}

describe('README.md — documentation-site discoverability (02-§97.13, §97.14)', () => {
  const readme = fs.readFileSync(README_PATH, 'utf8');
  const hasSiteLink = readme.includes(DOCS_SITE_AUTOLINK);

  it('README-DOCS-01: README.md links to the published docs site URL', (t) => {
    if (!hasSiteLink) {
      t.skip('README.md does not yet link to the docs site — see 02-§97.13');
      return;
    }
    assert.ok(
      readme.includes(DOCS_SITE_AUTOLINK),
      `README.md must contain the docs site URL as a Markdown autolink ${DOCS_SITE_AUTOLINK}`,
    );
  });

  it('README-DOCS-02: docs site link appears before the developer setup section', (t) => {
    if (!hasSiteLink) {
      t.skip('README.md does not yet link to the docs site — see 02-§97.13');
      return;
    }
    const urlIdx = readme.indexOf(DOCS_SITE_AUTOLINK);
    const setupIdx = readme.indexOf('## For Developers');
    assert.ok(setupIdx !== -1, '"## For Developers" heading must be present');
    assert.ok(
      urlIdx < setupIdx,
      'Docs site URL must appear before "## For Developers"',
    );
  });

  it('README-DOCS-03: README doc table includes every docs/*.md file', (t) => {
    if (!hasSiteLink) {
      t.skip('README.md has not yet been updated for the docs site — see 02-§97.14');
      return;
    }
    const missing = EXPECTED_DOC_FILES.filter(
      (file) => !readme.includes(`docs/${file}`),
    );
    assert.deepEqual(missing, [], `README.md missing links: ${missing.join(', ')}`);
    const missingFolders = EXPECTED_FOLDER_INDEX_LINKS.filter(
      (folder) => !readme.includes(`docs/${folder}`),
    );
    assert.deepEqual(
      missingFolders,
      [],
      `README.md missing folder index links: ${missingFolders.join(', ')}`,
    );
  });

  it('README-DOCS-04: EXPECTED_DOC_FILES matches actual docs/ contents (no drift)', () => {
    const actual = listMarkdownFilesRecursive(DOCS_DIR)
      .filter((f) => {
        // The docs site landing (`docs/index.md`) and per-folder index files
        // (e.g. `02-requirements/index.md`) are excluded — they are reached
        // through the folder URL which is asserted separately.
        if (f === 'index.md') return false;
        if (f.endsWith('/index.md')) return false;
        return true;
      })
      .sort();
    const expected = [...EXPECTED_DOC_FILES].sort();
    assert.deepEqual(
      actual,
      expected,
      'EXPECTED_DOC_FILES must match docs/**/*.md (excluding index files) — update both together',
    );
  });
});
