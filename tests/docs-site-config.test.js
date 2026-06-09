'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

// ── Requirement: 02-§97.5, 02-§97.6 ──────────────────────────────────────────
// GitHub Pages renders docs/ via Jekyll (02-§97.5). For internal .md links
// between docs files to resolve to rendered HTML (02-§97.6), the project
// ships a single Jekyll configuration file at docs/_config.yml that
// enables the jekyll-relative-links plugin.
//
// These tests verify that docs/_config.yml is:
//   1. present and a valid YAML document
//   2. declares jekyll-relative-links under `plugins`
//   3. enables relative_links explicitly
//
// When docs/_config.yml does not yet exist (e.g. in Phase 3, before the
// implementation lands in Phase 4), the suite skips — a missing file is
// a gap captured by 02-§97.5 / 02-§97.6 in 99-traceability/.

const DOCS_DIR = path.resolve(__dirname, '..', 'docs');
const CONFIG_PATH = path.join(DOCS_DIR, '_config.yml');
const ROBOTS_PATH = path.join(DOCS_DIR, 'robots.txt');
// GitHub Pages themes use different filenames for the head-custom include:
// Primer/Minima look for `head-custom.html` (dash); Cayman looks for
// `head_custom.html` (underscore). The project ships both so the noindex
// meta tag injects regardless of which theme GitHub Pages selects as
// default. See 02-§97.20.
const HEAD_CUSTOM_PATHS = [
  path.join(DOCS_DIR, '_includes', 'head-custom.html'),
  path.join(DOCS_DIR, '_includes', 'head_custom.html'),
];
const INDEX_PATH = path.join(DOCS_DIR, 'index.md');

describe('docs/_config.yml — GitHub Pages documentation site (02-§97.5, §97.6)', () => {
  const exists = fs.existsSync(CONFIG_PATH);

  it('DOCS-CFG-01: docs/_config.yml is present', (t) => {
    if (!exists) {
      t.skip('docs/_config.yml not yet created — see 02-§97.5');
      return;
    }
    assert.ok(fs.statSync(CONFIG_PATH).isFile(), 'docs/_config.yml must be a file');
  });

  it('DOCS-CFG-02: docs/_config.yml is valid YAML', (t) => {
    if (!exists) {
      t.skip('docs/_config.yml not yet created — see 02-§97.5');
      return;
    }
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    assert.doesNotThrow(
      () => yaml.load(raw),
      'docs/_config.yml must parse as valid YAML',
    );
  });

  it('DOCS-CFG-03: plugins list includes jekyll-relative-links', (t) => {
    if (!exists) {
      t.skip('docs/_config.yml not yet created — see 02-§97.6');
      return;
    }
    const cfg = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
    const plugins = Array.isArray(cfg.plugins) ? cfg.plugins : [];
    assert.ok(
      plugins.includes('jekyll-relative-links'),
      'plugins must include "jekyll-relative-links" so .md cross-links resolve',
    );
  });

  it('DOCS-CFG-04: relative_links.enabled is true', (t) => {
    if (!exists) {
      t.skip('docs/_config.yml not yet created — see 02-§97.6');
      return;
    }
    const cfg = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
    assert.equal(
      cfg.relative_links && cfg.relative_links.enabled,
      true,
      'relative_links.enabled must be true',
    );
  });
});

// ── Requirement: 02-§97.18, 97.19, 97.20, 97.21 ──────────────────────────────
// The published documentation site mirrors §1a's hidden policy for the camp
// site. Two artefacts must exist under docs/ to enforce that on the rendered
// Pages output: a robots.txt that disallows everything, and a Jekyll
// `head-custom.html` include that emits a noindex/nofollow meta tag in
// every rendered page.

describe('docs/ — search-engine and crawler policy (02-§97.18–97.21)', () => {
  const robotsExists = fs.existsSync(ROBOTS_PATH);
  const presentHeadIncludes = HEAD_CUSTOM_PATHS.filter((p) => fs.existsSync(p));
  const headCustomExists = presentHeadIncludes.length > 0;

  it('DOCS-CFG-05: docs/robots.txt is present and disallows every user agent', (t) => {
    if (!robotsExists) {
      t.skip('docs/robots.txt not yet created — see 02-§97.19');
      return;
    }
    const raw = fs.readFileSync(ROBOTS_PATH, 'utf8');
    assert.match(raw, /User-agent:\s*\*/, 'robots.txt must address every user agent');
    assert.match(raw, /Disallow:\s*\//, 'robots.txt must disallow every path');
  });

  it('DOCS-CFG-06: every head-custom include emits noindex/nofollow meta', (t) => {
    if (!headCustomExists) {
      t.skip(
        'No head-custom include present yet — see 02-§97.20 '
          + '(expects head-custom.html and/or head_custom.html under docs/_includes/)',
      );
      return;
    }
    // At least one head-custom include must exist; every present include
    // must emit the robots meta so that whichever convention the active
    // GitHub Pages theme follows, the noindex tag still lands in <head>.
    assert.ok(
      presentHeadIncludes.length >= 1,
      'At least one head-custom include must exist',
    );
    const robotsMeta = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex[^"']*nofollow[^"']*["']/i;
    for (const p of presentHeadIncludes) {
      const raw = fs.readFileSync(p, 'utf8');
      assert.match(
        raw,
        robotsMeta,
        `${path.relative(DOCS_DIR, p)} must include a robots meta with noindex and nofollow`,
      );
    }
  });

  it('DOCS-CFG-07: no sitemap or open-graph artefacts under docs/', () => {
    const artefacts = ['sitemap.xml', 'sitemap.txt'];
    for (const a of artefacts) {
      assert.ok(
        !fs.existsSync(path.join(DOCS_DIR, a)),
        `docs/${a} must not exist (02-§97.21)`,
      );
    }
    if (fs.existsSync(CONFIG_PATH)) {
      const cfg = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
      const plugins = Array.isArray(cfg.plugins) ? cfg.plugins : [];
      const forbidden = ['jekyll-sitemap', 'jekyll-seo-tag', 'jekyll-feed'];
      for (const p of forbidden) {
        assert.ok(
          !plugins.includes(p),
          `_config.yml must not enable ${p} (02-§97.21)`,
        );
      }
    }
  });
});

// ── Requirement: 02-§97.15, 97.16, 97.17 ─────────────────────────────────────
// docs/index.md (the landing page) must carry a banner with absolute
// github.com links back to the source repo, README, and issues; must not
// link to https://sbsommar.se; and its main copy must be projekt-teknisk
// rather than camp-marketing copy.

describe('docs/index.md — landing-page contract (02-§97.15–97.17)', () => {
  const indexExists = fs.existsSync(INDEX_PATH);
  const raw = indexExists ? fs.readFileSync(INDEX_PATH, 'utf8') : '';

  // URLs are matched inside their surrounding Markdown link syntax
  // (`[text](url)` or `<url>`) so CodeQL sees a complete URL context and
  // does not flag the assertions as incomplete URL substring sanitisation.
  // See 02-§39.4 for the same remediation pattern.
  const REPO_URL_LINK = '](https://github.com/moggleif/sbsommar)';
  const README_URL_LINKS = [
    '](https://github.com/moggleif/sbsommar#readme)',
    '](https://github.com/moggleif/sbsommar/blob/main/README.md)',
  ];
  const ISSUES_URL_LINK = '](https://github.com/moggleif/sbsommar/issues)';
  const CAMP_SITE_PATTERNS = [
    '](https://sbsommar.se',
    '<https://sbsommar.se',
    '"https://sbsommar.se',
  ];

  // The reverse-discoverability banner introduced by 02-§97.15 always
  // includes the issue tracker URL — use it as a sentinel so the suite
  // skips cleanly while the banner is still missing (Phase 3 commit) and
  // activates once Phase 4 lands.
  const bannerActive = raw.includes(ISSUES_URL_LINK);
  const skipMsg = 'reverse-discoverability banner not yet in docs/index.md — see 02-§97.15';

  it('DOCS-IDX-01: links back to the source repository on github.com', (t) => {
    if (!indexExists || !bannerActive) {
      t.skip(skipMsg);
      return;
    }
    assert.ok(
      raw.includes(REPO_URL_LINK),
      'docs/index.md must link to the source repo via [text](https://github.com/moggleif/sbsommar)',
    );
  });

  it('DOCS-IDX-02: links to the rendered README on github.com', (t) => {
    if (!indexExists || !bannerActive) {
      t.skip(skipMsg);
      return;
    }
    const matchedReadme = README_URL_LINKS.some((link) => raw.includes(link));
    assert.ok(
      matchedReadme,
      'docs/index.md must link to the README on github.com via Markdown link syntax',
    );
  });

  it('DOCS-IDX-03: links to the issue tracker', (t) => {
    if (!indexExists || !bannerActive) {
      t.skip(skipMsg);
      return;
    }
    assert.ok(
      raw.includes(ISSUES_URL_LINK),
      'docs/index.md must link to the issue tracker via [text](https://github.com/moggleif/sbsommar/issues)',
    );
  });

  it('DOCS-IDX-04: does not link to https://sbsommar.se', (t) => {
    if (!indexExists || !bannerActive) {
      t.skip(skipMsg);
      return;
    }
    const matchedCampSite = CAMP_SITE_PATTERNS.filter((p) => raw.includes(p));
    assert.deepEqual(
      matchedCampSite,
      [],
      `docs/index.md must not link to the camp site (02-§97.16): ${matchedCampSite.join(', ')}`,
    );
  });

  it('DOCS-IDX-05: main copy is projekt-teknisk (no camp marketing)', (t) => {
    if (!indexExists || !bannerActive) {
      t.skip(skipMsg);
      return;
    }
    const forbiddenPhrases = [
      'family camp',
      'gifted children',
      'Sysslebäck',
    ];
    const found = forbiddenPhrases.filter((p) => raw.includes(p));
    assert.deepEqual(
      found,
      [],
      `docs/index.md must not contain camp-marketing phrases (02-§97.17): ${found.join(', ')}`,
    );
  });
});
