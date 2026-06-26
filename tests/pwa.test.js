'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { renderSchedulePage } = require('../source/build/render');
const { renderAddPage } = require('../source/build/render-add');
const { renderEditPage } = require('../source/build/render-edit');
const { renderIdagPage } = require('../source/build/render-idag');
const { renderTodayPage } = require('../source/build/render-today');
const { renderIndexPage } = require('../source/build/render-index');
const { renderArkivPage } = require('../source/build/render-arkiv');
const { renderKalenderPage } = require('../source/build/render-kalender');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-15',
};

const EVENTS = [
  { id: 'e1', title: 'Frukost', date: '2099-07-01', start: '08:00', end: '09:00', location: 'Servicehus', responsible: 'Anna' },
];

const LOCATIONS = ['Servicehus', 'Annat'];
const QR_SVG = '<svg><rect/></svg>';

const INDEX_PAGE = {
  heroSrc: 'images/hero.jpg',
  heroAlt: 'Camp view',
  discordUrl: null,
  facebookUrl: null,
  countdownTarget: null,
  sections: [{ id: 'start', navLabel: 'Start', html: '<p>Intro</p>' }],
};

// ── Helper: render all pages ────────────────────────────────────────────────

const ALL_PAGES = [
  ['schedule', () => renderSchedulePage(CAMP, EVENTS)],
  ['add-activity', () => renderAddPage(CAMP, LOCATIONS, '/add-event')],
  ['edit-activity', () => renderEditPage(CAMP, LOCATIONS, '/edit-event')],
  ['idag', () => renderIdagPage(CAMP, EVENTS)],
  ['display', () => renderTodayPage(CAMP, EVENTS, QR_SVG)],
  ['index', () => renderIndexPage(INDEX_PAGE)],
  ['arkiv', () => renderArkivPage([])],
  ['kalender', () => renderKalenderPage(CAMP, 'https://example.com')],
];

// ── 02-§83.8 — Every page includes <link rel="manifest"> ───────────────────

describe('02-§83.8 — Every page includes manifest link', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-01-${name}: ${name} page includes <link rel="manifest">`, () => {
      const html = fn();
      assert.ok(
        html.includes('rel="manifest"') && html.includes('app.webmanifest'),
        `${name} must link to app.webmanifest`,
      );
    });
  }
});

// ── 02-§83.9 — Every page includes <meta name="theme-color"> ───────────────

describe('02-§83.9 — Every page includes theme-color meta', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-02-${name}: ${name} page includes <meta name="theme-color">`, () => {
      const html = fn();
      assert.ok(
        html.includes('name="theme-color"'),
        `${name} must have theme-color meta tag`,
      );
    });
  }
});

// ── 02-§83.10 — Every page includes mobile-web-app-capable ──────────────────

describe('02-§83.10 — Every page includes mobile-web-app-capable', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-03-${name}: ${name} page includes mobile-web-app-capable`, () => {
      const html = fn();
      assert.ok(
        html.includes('name="mobile-web-app-capable"'),
        `${name} must have mobile-web-app-capable`,
      );
    });
  }
});

// ── 02-§83.11 — Every page includes apple-mobile-web-app-status-bar-style ──

describe('02-§83.11 — Every page includes apple-mobile-web-app-status-bar-style', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-04-${name}: ${name} page includes apple-mobile-web-app-status-bar-style`, () => {
      const html = fn();
      assert.ok(
        html.includes('name="apple-mobile-web-app-status-bar-style"'),
        `${name} must have apple-mobile-web-app-status-bar-style`,
      );
    });
  }
});

// ── 02-§83.12 — Every page includes apple-touch-icon ────────────────────────

describe('02-§83.12 — Every page includes apple-touch-icon', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-05-${name}: ${name} page includes apple-touch-icon`, () => {
      const html = fn();
      assert.ok(
        html.includes('rel="apple-touch-icon"') && html.includes('sbsommar-icon-192.png'),
        `${name} must have apple-touch-icon linking to sbsommar-icon-192.png`,
      );
    });
  }
});

// ── 02-§83.14 — Every page includes sw-register.js ─────────────────────────

describe('02-§83.14 — Every page includes service worker registration script', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-06-${name}: ${name} page includes sw-register.js`, () => {
      const html = fn();
      assert.ok(
        html.includes('sw-register.js'),
        `${name} must include sw-register.js`,
      );
    });
  }
});

// ── 02-§83.1 — app.webmanifest exists in source/static ─────────────────────

describe('02-§83.1 — app.webmanifest exists', () => {
  it('PWA-07: source/static/app.webmanifest exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    assert.ok(fs.existsSync(filePath), 'app.webmanifest must exist in source/static/');
  });
});

// ── 02-§83.2 — Manifest name and short_name ────────────────────────────────

describe('02-§83.2 — Manifest name and short_name', () => {
  it('PWA-08: manifest sets name to "SB Sommar"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(manifest.name, 'SB Sommar');
  });

  it('PWA-09: manifest sets short_name to "SB Sommar"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(manifest.short_name, 'SB Sommar');
  });
});

// ── 02-§83.3 — Manifest display standalone ──────────────────────────────────

describe('02-§83.3 — Manifest display standalone', () => {
  it('PWA-10: manifest sets display to "standalone"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(manifest.display, 'standalone');
  });
});

// ── 02-§83.4 — Manifest start_url ──────────────────────────────────────────

describe('02-§83.4 — Manifest start_url', () => {
  it('PWA-11: manifest sets start_url to "/"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(manifest.start_url, '/');
  });
});

// ── 02-§83.5 — Manifest theme_color and background_color ───────────────────

describe('02-§83.5 — Manifest theme_color and background_color', () => {
  it('PWA-12: manifest sets theme_color', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.ok(manifest.theme_color, 'theme_color must be set');
  });

  it('PWA-13: manifest sets background_color', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.ok(manifest.background_color, 'background_color must be set');
  });
});

// ── 02-§83.6 — Manifest icons 192 and 512 ──────────────────────────────────

describe('02-§83.6 — Manifest declares 192×192 and 512×512 icons', () => {
  it('PWA-14: manifest has 192×192 icon', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const icon192 = manifest.icons.find((i) => i.sizes === '192x192');
    assert.ok(icon192, 'manifest must have a 192×192 icon');
    assert.equal(icon192.type, 'image/png');
  });

  it('PWA-15: manifest has 512×512 icon', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const icon512 = manifest.icons.find((i) => i.sizes === '512x512');
    assert.ok(icon512, 'manifest must have a 512×512 icon');
    assert.equal(icon512.type, 'image/png');
  });
});

// ── 02-§83.7 — Manifest icons include purpose "any" ────────────────────────

describe('02-§83.7 — Manifest icons include purpose "any"', () => {
  it('PWA-16: at least one icon has purpose "any"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const hasAny = manifest.icons.some((i) => i.purpose === 'any');
    assert.ok(hasAny, 'at least one icon must have purpose "any"');
  });
});

// ── 02-§83.13 — sw.js exists in source/static ──────────────────────────────

describe('02-§83.13 — sw.js exists', () => {
  it('PWA-17: source/static/sw.js exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    assert.ok(fs.existsSync(filePath), 'sw.js must exist in source/static/');
  });
});

// ── 02-§83.15 — Service worker uses versioned cache name ────────────────────

describe('02-§83.15 — Service worker uses versioned cache name', () => {
  it('PWA-18: sw.js contains a versioned CACHE_NAME', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(src.includes('CACHE_NAME'), 'sw.js must define CACHE_NAME');
    assert.match(src, /sb-sommar-v\d+/, 'CACHE_NAME must follow sb-sommar-vN pattern');
  });
});

// ── 02-§83.16 — Install pre-caches core pages ──────────────────────────────

describe('02-§83.16 — Install pre-caches all site assets via build injection', () => {
  it('PWA-19: sw.js source has PRE_CACHE_URLS with build placeholder', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('PRE_CACHE_URLS'),
      'sw.js must define PRE_CACHE_URLS',
    );
    assert.ok(
      src.includes('/* __PRE_CACHE_URLS__ */'),
      'PRE_CACHE_URLS must contain the build-injection placeholder',
    );
  });
});

// ── 02-§83.18 — Activate deletes old caches ────────────────────────────────

describe('02-§83.18 — Activate deletes old caches', () => {
  it('PWA-20: sw.js has activate event that deletes old caches', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(src.includes('activate'), 'sw.js must handle activate event');
    assert.ok(src.includes('caches.delete') || src.includes('cache.delete'), 'sw.js must delete old caches');
  });
});

// ── 02-§83.19 — Service worker does not cache API paths ─────────────────────

describe('02-§83.19 — Service worker excludes API paths from caching', () => {
  it('PWA-21: sw.js excludes API and form-submission endpoints', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    const noCacheSection = src.substring(
      src.indexOf('NO_CACHE_PATTERNS'),
      src.indexOf('];', src.indexOf('NO_CACHE_PATTERNS')),
    );
    assert.ok(noCacheSection.includes('/api/'), 'NO_CACHE_PATTERNS must include /api/');
    assert.ok(noCacheSection.includes('/add-event'), 'NO_CACHE_PATTERNS must include /add-event');
    assert.ok(noCacheSection.includes('/edit-event'), 'NO_CACHE_PATTERNS must include /edit-event');
    assert.ok(noCacheSection.includes('/delete-event'), 'NO_CACHE_PATTERNS must include /delete-event');
    assert.ok(noCacheSection.includes('/verify-admin'), 'NO_CACHE_PATTERNS must include /verify-admin');
    assert.ok(!noCacheSection.includes('.html'), 'NO_CACHE_PATTERNS must not include any .html pages');
  });
});

// ── 02-§83.22 — sw-register.js exists ───────────────────────────────────────

describe('02-§83.22 — sw-register.js exists', () => {
  it('PWA-22: source/assets/js/client/sw-register.js exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'assets', 'js', 'client', 'sw-register.js');
    assert.ok(fs.existsSync(filePath), 'sw-register.js must exist');
  });
});

// ── 02-§83.25 — Every page uses PWA icon as favicon ─────────────────────────

describe('02-§83.25 — Every page uses PWA icon as favicon', () => {
  for (const [name, fn] of ALL_PAGES) {
    it(`PWA-23-${name}: ${name} page uses sbsommar-icon-192.png as favicon`, () => {
      const html = fn();
      assert.ok(
        html.includes('rel="icon"') && html.includes('sbsommar-icon-192.png'),
        `${name} must use sbsommar-icon-192.png as favicon`,
      );
    });
  }
});

// ── 02-§83.26 — Manifest icons include purpose "maskable" ──────────────────

describe('02-§83.26 — Manifest icons include purpose "maskable"', () => {
  it('PWA-24: at least one icon has purpose "maskable"', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const hasMaskable = manifest.icons.some((i) =>
      i.purpose && i.purpose.includes('maskable'),
    );
    assert.ok(hasMaskable, 'at least one icon must have purpose "maskable"');
  });
});

// ── 02-§83.27 — Service worker ignores non-http(s) schemes ─────────────────

describe('02-§83.27 — Service worker ignores non-http(s) schemes', () => {
  it('PWA-25: sw.js checks URL protocol before caching', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes("url.protocol !== 'http:'") || src.includes('url.protocol'),
      'sw.js must check url.protocol to filter non-http schemes',
    );
  });
});

// ── 02-§83.28 — Service worker caches events.json with network-first ────────

describe('02-§83.28 — Service worker caches events.json', () => {
  it('PWA-26: sw.js references events.json for network-first caching', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('events.json'),
      'sw.js must handle events.json (network-first caching)',
    );
  });
});

// ── 02-§83.29 — Service worker serves offline.html fallback ─────────────────

describe('02-§83.29 — Service worker serves offline fallback', () => {
  it('PWA-27: sw.js references offline.html', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('offline.html'),
      'sw.js must reference offline.html as fallback',
    );
  });
});

// ── 02-§83.30 — offline.html renderer exists ────────────────────────────────

describe('02-§83.30 — offline.html renderer exists', () => {
  it('PWA-28: source/build/render-offline.js exists', () => {
    const filePath = path.join(__dirname, '..', 'source', 'build', 'render-offline.js');
    assert.ok(fs.existsSync(filePath), 'render-offline.js must exist');
  });
});

// ── 02-§83.32 — Offline page has Swedish offline message ────────────────────

describe('02-§83.32 — Offline page has Swedish offline message', () => {
  it('PWA-29: offline page contains Swedish offline text', () => {
    // Require the renderer only if it exists (test will fail at PWA-28 first).
    const rendererPath = path.join(__dirname, '..', 'source', 'build', 'render-offline.js');
    if (!fs.existsSync(rendererPath)) {
      assert.fail('render-offline.js does not exist yet');
    }
    const { renderOfflinePage } = require(rendererPath);
    const html = renderOfflinePage();
    assert.ok(
      html.includes('offline') || html.includes('Offline') || html.includes('nätverks'),
      'offline page must contain Swedish offline message',
    );
  });
});

// ── 02-§83.35 — Offline page only links to pages functional offline ─────────

describe('02-§83.35 — Offline page only links to offline-functional pages', () => {
  it('PWA-32: offline page main content does not link to lagg-till.html', () => {
    const rendererPath = path.join(__dirname, '..', 'source', 'build', 'render-offline.js');
    if (!fs.existsSync(rendererPath)) {
      assert.fail('render-offline.js does not exist yet');
    }
    const { renderOfflinePage } = require(rendererPath);
    const html = renderOfflinePage();
    const mainContent = html.substring(
      html.indexOf('<main'),
      html.indexOf('</main>'),
    );
    assert.ok(
      !mainContent.includes('lagg-till.html'),
      'offline page <main> must NOT link to lagg-till.html (requires network)',
    );
  });

  it('PWA-33: offline page main content does not link to redigera.html', () => {
    const rendererPath = path.join(__dirname, '..', 'source', 'build', 'render-offline.js');
    if (!fs.existsSync(rendererPath)) {
      assert.fail('render-offline.js does not exist yet');
    }
    const { renderOfflinePage } = require(rendererPath);
    const html = renderOfflinePage();
    const mainContent = html.substring(
      html.indexOf('<main'),
      html.indexOf('</main>'),
    );
    assert.ok(
      !mainContent.includes('redigera.html'),
      'offline page <main> must NOT link to redigera.html (requires network)',
    );
  });
});

// ── 02-§83.33 — Service worker pre-caches offline.html ─────────────────────

describe('02-§83.33 — Service worker pre-caches offline.html', () => {
  it('PWA-30: offline.html is included via build-injected pre-cache list', () => {
    // The source sw.js uses a placeholder; offline.html is injected at build time.
    // This test verifies the placeholder exists (build will inject offline.html).
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes('PRE_CACHE_URLS') && src.includes('/* __PRE_CACHE_URLS__ */'),
      'PRE_CACHE_URLS must use build injection (offline.html is included at build time)',
    );
  });
});

// ── 02-§83.34 — Cache version incremented ───────────────────────────────────

describe('02-§83.34 — Cache version incremented', () => {
  it('PWA-31: sw.js uses current cache name (sb-sommar-v7 per §96.1)', () => {
    const filePath = path.join(__dirname, '..', 'source', 'static', 'sw.js');
    const src = fs.readFileSync(filePath, 'utf8');
    assert.ok(
      src.includes("'sb-sommar-v7'"),
      'CACHE_NAME must be sb-sommar-v7',
    );
  });
});

// ── 02-§87 — Manifest metadata for richer install UI ────────────────────────

describe('02-§87 — Manifest metadata for richer install UI', () => {
  const manifestPath = path.join(__dirname, '..', 'source', 'static', 'app.webmanifest');
  let manifest;

  before(() => {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  });

  it('PWA-32: manifest sets id to "/" (02-§87.1)', () => {
    assert.equal(manifest.id, '/');
  });

  it('PWA-33: manifest sets description (02-§87.2)', () => {
    assert.equal(manifest.description, 'Information och aktiviteter för SB Sommar-lägret');
  });

  it('PWA-34: manifest has screenshots array with at least 2 entries (02-§87.3)', () => {
    assert.ok(Array.isArray(manifest.screenshots), 'screenshots must be an array');
    assert.ok(manifest.screenshots.length >= 2, 'screenshots must have at least 2 entries');
  });

  it('PWA-35: one screenshot has form_factor "wide" and size 1280x720 (02-§87.4)', () => {
    const wide = manifest.screenshots.find((s) => s.form_factor === 'wide');
    assert.ok(wide, 'must have a screenshot with form_factor "wide"');
    assert.equal(wide.sizes, '1280x720');
    assert.equal(wide.type, 'image/png');
  });

  it('PWA-36: one screenshot has form_factor "narrow" and size 750x1334 (02-§87.5)', () => {
    const narrow = manifest.screenshots.find((s) => s.form_factor === 'narrow');
    assert.ok(narrow, 'must have a screenshot with form_factor "narrow"');
    assert.equal(narrow.sizes, '750x1334');
    assert.equal(narrow.type, 'image/png');
  });

  it('PWA-37: screenshot src paths point to images/ directory (02-§87.6)', () => {
    for (const s of manifest.screenshots) {
      assert.ok(s.src.startsWith('images/'), `screenshot src "${s.src}" must start with "images/"`);
    }
  });

  it('PWA-38: screenshot image files exist in source/content/images/ (02-§87.6)', () => {
    for (const s of manifest.screenshots) {
      const imgPath = path.join(__dirname, '..', 'source', 'content', s.src);
      assert.ok(fs.existsSync(imgPath), `screenshot file "${s.src}" must exist`);
    }
  });
});
