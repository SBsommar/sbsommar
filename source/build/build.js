'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');
const QRCode = require('qrcode');
const { renderSchedulePage, toDateString } = require('./render');
const { renderAddPage } = require('./render-add');
const { renderEditPage, editApiUrl } = require('./render-edit');
const { renderTodayPage, renderRedirectPage, renderDisplayAlias } = require('./render-today');
const { renderIdagPage } = require('./render-idag');
const { renderLokalerPage } = require('./render-lokaler');
const { renderIndexPage, convertMarkdown, extractHeroImage, extractH1, renderUpcomingCampsHtml, renderLocationAccordions, formatLongSvDate } = require('./render-index');
const { renderArkivPage } = require('./render-arkiv');
const { renderRssFeed } = require('./render-rss');
const { renderEventPage } = require('./render-event');
const { renderEventIcal, renderIcalFeed } = require('./render-ical');
const { renderKalenderPage } = require('./render-kalender');
const { renderAdminPage } = require('./render-admin');
const { renderOfflinePage } = require('./render-offline');
const { resolveActiveCamp } = require('../scripts/resolve-active-camp');
const { loadCampEvents } = require('./load-events');
const { addOneDay } = require('../api/time-gate');
const { setFeedbackUrl } = require('./layout');
const { resolveVersionString } = require('./version');
const { escapeHtml, injectHtaccessCsp, resolveCountdownTarget } = require('./utils');
const { getImageDimensions } = require('./image-dimensions');
const { filterAvailableLocations } = require('./locations');

// ── Load .env if present (local dev) ─────────────────────────────────────────
const envPath = path.join(__dirname, '../..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const OUTPUT_DIR = path.join(__dirname, '../..', 'public');

// ── Site base URL (required for RSS feed and per-event page links) ──────────
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');
if (!SITE_URL) {
  console.error('ERROR: SITE_URL environment variable is not set. RSS feed and event pages require an absolute base URL.');
  process.exit(1);
}


// ── GoatCounter analytics (02-§63.10) ────────────────────────────────────────
const GOATCOUNTER_CODE = process.env.GOATCOUNTER_SITE_CODE || '';

// ── Load camps registry ──────────────────────────────────────────────────────

const campsFile = path.join(DATA_DIR, 'camps.yaml');
if (!fs.existsSync(campsFile)) {
  console.error('ERROR: data/camps.yaml not found');
  process.exit(1);
}

const campsData = yaml.load(fs.readFileSync(campsFile, 'utf8'));

const BUILD_ENV = process.env.BUILD_ENV || undefined;

// In production, filter out QA camps from all downstream rendering (02-§42.30).
// resolveActiveCamp already handles this internally, but the camps array is also
// passed directly to renderUpcomingCampsHtml, renderArkivPage, and the countdown
// logic — those must never see QA camps in production.
const camps = BUILD_ENV === 'production'
  ? campsData.camps.filter((c) => !c.qa)
  : campsData.camps;

const activeCamp = resolveActiveCamp(camps, undefined, BUILD_ENV);
console.log(`Active camp: ${activeCamp.name} (${activeCamp.start_date} – ${activeCamp.end_date})`);

// ── Load camp file ───────────────────────────────────────────────────────────

const campFilePath = path.join(DATA_DIR, activeCamp.file);
if (!fs.existsSync(campFilePath)) {
  console.error(`ERROR: camp file not found: ${activeCamp.file}`);
  process.exit(1);
}

const campData = yaml.load(fs.readFileSync(campFilePath, 'utf8'));
const camp = campData.camp;
// Merge opens_for_editing from the registry (camps.yaml) into the camp object.
// The per-camp YAML file does not include this field.
camp.opens_for_editing = activeCamp.opens_for_editing;
// Events come from the camp file merged with any fragment files (02-§109.13).
const events = loadCampEvents(DATA_DIR, activeCamp.file);

// ── Load locations from local.yaml ───────────────────────────────────────────

const localFilePath = path.join(DATA_DIR, 'local.yaml');
if (!fs.existsSync(localFilePath)) {
  console.error('ERROR: data/local.yaml not found');
  process.exit(1);
}
const localData = yaml.load(fs.readFileSync(localFilePath, 'utf8'));
// Drop locations marked unavailable (active: false) so they disappear from the
// forms, the Lokaler grid, and the homepage accordions at once (02-§107).
const allLocations = filterAvailableLocations(localData.locations);
const locations = allLocations.map((l) => l.name);

// ── Helpers ───────────────────────────────────────────────────────────────────

// Removes all contents of dir except .gitkeep, to prevent stale build artefacts.
function cleanOutputDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    if (entry === '.gitkeep') continue;
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
}

// Recursively copies all files from srcDir into destDir, flattening subdirectories.
function copyFlattened(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      copyFlattened(srcPath, destDir);
    } else {
      fs.copyFileSync(srcPath, path.join(destDir, entry.name));
    }
  }
}

// Returns all .html files under dir (recursive).
function findHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findHtmlFiles(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

// ── Render and write ─────────────────────────────────────────────────────────

async function main() {
  cleanOutputDir(OUTPUT_DIR);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // ── Build timestamp — embedded in live.html and version.json ────────────────
  // Used by the display page to show last-updated time and detect new deploys.
  const buildTime = new Date().toISOString();

  // ── Load footer from content/footer.md ────────────────────────────────────
  // Falls back to empty string if the file is missing — pages render without a footer.
  const footerMdPath = path.join(CONTENT_DIR, 'footer.md');
  const footerHtml = fs.existsSync(footerMdPath)
    ? convertMarkdown(fs.readFileSync(footerMdPath, 'utf8'))
    : '';

  // ── Compute version string for footer (02-§62.3, 02-§62.15) ──────────────
  const versionString = resolveVersionString(process.env, path.join(__dirname, '../..'));
  const adminStatus = '<span id="admin-status" class="admin-status"></span>';
  const footerWithVersion = versionString
    ? footerHtml + `\n<p class="site-footer__version">v${escapeHtml(versionString)} ${adminStatus}</p>`
    : footerHtml + `\n<p class="site-footer__version">${adminStatus}</p>`;

  // ── Load nav sections from content/sections.yaml ──────────────────────────
  // Resolved early so navSections can be passed to every render function.
  // Only sections with a nav: label are included.
  const sectionsConfigPath = path.join(CONTENT_DIR, 'sections.yaml');
  if (!fs.existsSync(sectionsConfigPath)) {
    console.error('ERROR: content/sections.yaml not found');
    process.exit(1);
  }
  const sectionsConfig = yaml.load(fs.readFileSync(sectionsConfigPath, 'utf8'));
  const navSections = (sectionsConfig.sections || [])
    .filter((def) => def.id && def.nav)
    .map((def) => ({ id: def.id, navLabel: def.nav }));

  const cookieDomain = process.env.COOKIE_DOMAIN || '';

  // Derive feedback API URL from the event API URL.
  const apiUrl = process.env.API_URL || '';
  if (apiUrl) {
    setFeedbackUrl(apiUrl.replace(/\/add-event$/, '/feedback'));
  }

  const scheduleHtml = renderSchedulePage(camp, events, footerWithVersion, navSections, SITE_URL, cookieDomain, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'schema.html'), scheduleHtml, 'utf8');
  console.log(`Built: public/schema.html  (${events.length} events)`);

  // ── QR code for display view — includes ?ref= for analytics tracking ────────
  const qrCodesFile = path.join(DATA_DIR, 'qr-codes.yaml');
  let displayQrRef = '';
  if (fs.existsSync(qrCodesFile)) {
    const qrData = yaml.load(fs.readFileSync(qrCodesFile, 'utf8'));
    const firstCode = (qrData.codes || [])[0];
    if (firstCode && firstCode.id) displayQrRef = firstCode.id;
  }
  const qrUrl = displayQrRef ? `${SITE_URL}?ref=${displayQrRef}` : SITE_URL;
  const qrSvg = (await QRCode.toString(qrUrl, { type: 'svg', margin: 2 }))
    .replace(/<\?xml[^?]*\?>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '');

  const todayHtml = renderTodayPage(camp, events, qrSvg, SITE_URL, buildTime, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'live.html'), todayHtml, 'utf8');
  console.log(`Built: public/live.html  (${events.length} events)`);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'dagens-schema.html'), renderRedirectPage(), 'utf8');
  console.log('Built: public/dagens-schema.html  (redirect → live.html)');

  // Directory-style alias /dagens-schema/ serves the live display page directly,
  // so kiosk screens that reload that URL on a timer never flash through a
  // redirect. Asset/version.json paths resolve from root via the injected
  // <base href="/">. (02-§76.2)
  const dagensSchemaDir = path.join(OUTPUT_DIR, 'dagens-schema');
  fs.mkdirSync(dagensSchemaDir, { recursive: true });
  fs.writeFileSync(path.join(dagensSchemaDir, 'index.html'), renderDisplayAlias(todayHtml), 'utf8');
  console.log('Built: public/dagens-schema/index.html  (display-page alias)');

  // ── Write version.json — polled by live.html for live reload ─────────────────
  fs.writeFileSync(path.join(OUTPUT_DIR, 'version.json'), JSON.stringify({ version: buildTime }), 'utf8');
  console.log('Built: public/version.json');

  const idagHtml = renderIdagPage(camp, events, footerWithVersion, navSections, cookieDomain, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'idag.html'), idagHtml, 'utf8');
  console.log(`Built: public/idag.html  (${events.length} events)`);

  const addHtml = renderAddPage(camp, locations, process.env.API_URL, footerWithVersion, navSections, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'lagg-till.html'), addHtml, 'utf8');
  console.log(`Built: public/lagg-till.html  (${locations.length} locations)`);

  const lokalerHtml = renderLokalerPage(camp, allLocations, events, footerWithVersion, navSections, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'lokaler.html'), lokalerHtml, 'utf8');
  console.log(`Built: public/lokaler.html  (${events.length} events, ${allLocations.length} locations)`);

  const editHtml = renderEditPage(camp, locations, editApiUrl(process.env.API_URL), footerWithVersion, navSections, cookieDomain, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'redigera.html'), editHtml, 'utf8');
  console.log(`Built: public/redigera.html`);

  // Load events for all archived camps
  const campEventsMap = {};
  for (const c of camps.filter((x) => x.archived === true)) {
    const evFile = path.join(DATA_DIR, c.file);
    if (fs.existsSync(evFile)) {
      // Merge the camp file with any fragment files (02-§109.13).
      campEventsMap[c.id] = loadCampEvents(DATA_DIR, c.file);
    }
  }

  const arkivHtml = renderArkivPage(camps, footerWithVersion, navSections, campEventsMap, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'arkiv.html'), arkivHtml, 'utf8');
  const archivedCount = camps.filter((c) => c.archived === true).length;
  console.log(`Built: public/arkiv.html  (${archivedCount} archived camps)`);

  // ── Build events.json — public event data for the edit form ──────────────
  // Contains only fields the edit form needs; owner and meta are excluded.
  const PUBLIC_EVENT_FIELDS = ['id', 'title', 'date', 'start', 'end', 'location', 'responsible', 'description', 'link'];
  const eventsJson = JSON.stringify(
    events.map((e) => {
      const pub = {};
      for (const f of PUBLIC_EVENT_FIELDS) pub[f] = e[f] !== undefined ? e[f] : null;
      return pub;
    }),
    null,
    2,
  );
  fs.writeFileSync(path.join(OUTPUT_DIR, 'events.json'), eventsJson, 'utf8');
  console.log(`Built: public/events.json  (${events.length} events)`);

  // ── Render RSS feed ─────────────────────────────────────────────────────
  const rssXml = renderRssFeed(camp, events, SITE_URL);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'schema.rss'), rssXml, 'utf8');
  console.log(`Built: public/schema.rss  (${events.length} events)`);

  // ── Render iCal feed ────────────────────────────────────────────────────
  const icalFeed = renderIcalFeed(camp, events, SITE_URL);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'schema.ics'), icalFeed, 'utf8');
  console.log(`Built: public/schema.ics  (${events.length} events)`);

  // ── Render per-event detail pages and iCal files ──────────────────────
  const schemaDir = path.join(OUTPUT_DIR, 'schema');
  for (const e of events) {
    const eventDir = path.join(schemaDir, String(e.id));
    fs.mkdirSync(eventDir, { recursive: true });
    const eventHtml = renderEventPage(e, camp, SITE_URL, footerWithVersion, navSections, events);
    fs.writeFileSync(path.join(eventDir, 'index.html'), eventHtml, 'utf8');
    const eventIcs = renderEventIcal(e, camp, SITE_URL);
    fs.writeFileSync(path.join(eventDir, 'event.ics'), eventIcs, 'utf8');
  }
  console.log(`Built: public/schema/*/index.html  (${events.length} event pages)`);
  console.log(`Built: public/schema/*/event.ics  (${events.length} event iCal files)`);

  // ── Render calendar tips page ─────────────────────────────────────────
  const kalenderHtml = renderKalenderPage(camp, SITE_URL, footerWithVersion, navSections, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'kalender.html'), kalenderHtml, 'utf8');
  console.log('Built: public/kalender.html');

  // ── Render token activation page ─────────────────────────────────────────
  const adminHtml = renderAdminPage(camp, footerWithVersion, navSections, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'token.html'), adminHtml, 'utf8');
  console.log('Built: public/token.html');

  // ── Render offline fallback page ────────────────────────────────────────
  const offlineHtml = renderOfflinePage(footerWithVersion, navSections, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'offline.html'), offlineHtml, 'utf8');
  console.log('Built: public/offline.html');

  // ── Render index.html from content/sections.yaml ─────────────────────────
  // sectionsConfig already loaded above for navSections.
  // Section order, IDs, and optional nav labels are defined in sections.yaml.
  // The first image in the first file is hoisted as the hero banner.

  let heroSrc = null;
  let heroAlt = null;

  // Pre-render the camp listing HTML to inject into the first section.
  const currentYear = new Date().getFullYear();
  const campListingHtml = renderUpcomingCampsHtml(camps, currentYear);

  const sections = sectionsConfig.sections
    .map((def, i) => {
      const filePath = path.join(CONTENT_DIR, def.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`WARNING: content file not found: ${def.file}`);
        return null;
      }
      let md = fs.readFileSync(filePath, 'utf8');

      if (i === 0) {
        const extracted = extractHeroImage(md);
        heroSrc = extracted.heroSrc;
        heroAlt = extracted.heroAlt;
        md = extracted.md;
        // Strip the first H1 — the hero title now renders it.
        md = md.replace(/^# .+\n*/m, '').trimStart();
      }

      const navLabel = def.nav || extractH1(md) || def.file;
      let html = convertMarkdown(md, i === 0 ? 0 : 1, def.collapsible || false, CONTENT_DIR);

      // Inject camp listings into the first section, right after the first <h4>.
      if (i === 0 && campListingHtml) {
        html = html.replace(/(<\/h4>)/, '$1\n' + campListingHtml);
      }

      // Inject location accordions into the lokaler section.
      if (def.id === 'lokaler') {
        const locationHtml = renderLocationAccordions(allLocations, CONTENT_DIR);
        if (locationHtml) {
          html += '\n' + locationHtml;
        }
      }

      return { id: def.id, navLabel, html };
    })
    .filter(Boolean);

  // ── Compute hero social links and countdown target ────────────────────────
  const discordUrl = 'https://discord.com/channels/992817044527534181/1390691617052037232';

  // Countdown: count down to the nearest upcoming camp, but stay hidden while a
  // camp is ongoing so it never counts toward a later camp mid-camp (#521).
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
  const futureCamps = camps
    .filter((c) => toDateString(c.start_date) > todayStr)
    .sort((a, b) => toDateString(a.start_date).localeCompare(toDateString(b.start_date)));
  const countdownTarget = resolveCountdownTarget(camps, todayStr);

  // Facebook link: prefer active camp, fall back to nearest future camp
  const facebookUrl = (activeCamp.link || '').trim()
    || (futureCamps.length > 0 && (futureCamps[0].link || '').trim())
    || null;

  // ── Editing period for hero action buttons (02-§71.4, 02-§71.5) ──────────
  const opensForEditing = activeCamp.opens_for_editing
    ? toDateString(activeCamp.opens_for_editing)
    : null;
  const editingCloses = activeCamp.end_date
    ? addOneDay(toDateString(activeCamp.end_date))
    : null;

  // ── Registration banners (02-§94.1–94.14) ────────────────────────────────
  // One banner per non-archived camp that has both registration window fields.
  // build-time ordering is ascending by start_date (closest camp on top).
  const registrationCamps = camps
    .filter((c) => c.archived !== true && c.registration_opens && c.registration_closes)
    .sort((a, b) => toDateString(a.start_date).localeCompare(toDateString(b.start_date)))
    .map((c) => ({
      id: c.id,
      name: c.name,
      registrationOpens: toDateString(c.registration_opens),
      registrationCloses: toDateString(c.registration_closes),
      lastRegistrationLabel: formatLongSvDate(c.registration_closes),
    }));

  const heroDims = heroSrc ? getImageDimensions(path.join(CONTENT_DIR, heroSrc)) : null;
  const indexHtml = renderIndexPage({ heroSrc, heroAlt, heroDims, sections, discordUrl, facebookUrl, countdownTarget, opensForEditing, editingCloses, registrationCamps }, footerWithVersion, navSections, GOATCOUNTER_CODE);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf8');
  console.log(`Built: public/index.html  (${sections.length} sections)`);

  // ── Generate robots.txt (02-§1a.1) ─────────────────────────────────────────

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'robots.txt'),
    'User-agent: *\nDisallow: /\n',
    'utf8',
  );
  console.log('Built: public/robots.txt');

  // ── Copy content/images → public/images ──────────────────────────────────

  const srcImages = path.join(CONTENT_DIR, 'images');
  const destImages = path.join(OUTPUT_DIR, 'images');
  if (fs.existsSync(srcImages)) {
    fs.mkdirSync(destImages, { recursive: true });
    let copied = 0;
    for (const file of fs.readdirSync(srcImages)) {
      fs.copyFileSync(path.join(srcImages, file), path.join(destImages, file));
      copied++;
    }
    console.log(`Copied: content/images → public/images  (${copied} files)`);
  }

  // ── Copy assets → public ──────────────────────────────────

  const srcAssets = path.join(ASSETS_DIR);
  const destAssets = path.join(OUTPUT_DIR);

  if (fs.existsSync(srcAssets)) {
    fs.mkdirSync(destAssets, { recursive: true });
    copyFlattened(srcAssets, destAssets);
    console.log('Copied: assets → public (flattened)');
  }

  // ── Copy marked.umd.js → public (for client-side markdown preview) ────
  const markedSrc = path.join(__dirname, '..', '..', 'node_modules', 'marked', 'lib', 'marked.umd.js');
  if (fs.existsSync(markedSrc)) {
    fs.copyFileSync(markedSrc, path.join(OUTPUT_DIR, 'marked.umd.js'));
    console.log('Copied: marked.umd.js → public');
  }

  // ── Copy source/static/.htaccess → public/.htaccess (02-§67.5) ────────
  const STATIC_DIR = path.join(__dirname, '..', 'static');
  const htaccessSrc = path.join(STATIC_DIR, '.htaccess');
  if (fs.existsSync(htaccessSrc)) {
    // Inject the API origin into the CSP connect-src (#384) so cross-origin
    // API fetch() calls are allowed in production.
    const htaccess = injectHtaccessCsp(fs.readFileSync(htaccessSrc, 'utf8'), process.env.API_URL);
    fs.writeFileSync(path.join(OUTPUT_DIR, '.htaccess'), htaccess);
    console.log('Built: source/static/.htaccess → public/.htaccess (CSP connect-src injected)');
  }

  // ── Copy PWA files: manifest and service worker (02-§83.1, 02-§83.13) ──
  const manifestSrc = path.join(STATIC_DIR, 'app.webmanifest');
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, path.join(OUTPUT_DIR, 'app.webmanifest'));
    console.log('Copied: source/static/app.webmanifest → public/app.webmanifest');
  }
  const swSrc = path.join(STATIC_DIR, 'sw.js');
  if (fs.existsSync(swSrc)) {
    fs.copyFileSync(swSrc, path.join(OUTPUT_DIR, 'sw.js'));
    console.log('Copied: source/static/sw.js → public/sw.js');

    // Cache-bust sw.js registration so browsers fetch the latest version.
    const swHash = crypto.createHash('md5')
      .update(fs.readFileSync(path.join(OUTPUT_DIR, 'sw.js')))
      .digest('hex')
      .slice(0, 8);
    const swRegPath = path.join(OUTPUT_DIR, 'sw-register.js');
    if (fs.existsSync(swRegPath)) {
      const swReg = fs.readFileSync(swRegPath, 'utf8');
      const updated = swReg.replace(
        "register('/sw.js')",
        `register('/sw.js?v=${swHash}')`,
      );
      if (updated !== swReg) {
        fs.writeFileSync(swRegPath, updated, 'utf8');
        console.log(`Cache-bust: sw.js?v=${swHash}`);
      }
    }
  }

  // ── Post-process: CSS cache-busting (02-§69.1–69.3) ───────────────────
  const cssOut = path.join(OUTPUT_DIR, 'style.css');
  if (fs.existsSync(cssOut)) {
    const cssHash = crypto.createHash('md5')
      .update(fs.readFileSync(cssOut))
      .digest('hex')
      .slice(0, 8);
    const htmlFiles = findHtmlFiles(OUTPUT_DIR);
    for (const file of htmlFiles) {
      const html = fs.readFileSync(file, 'utf8');
      const updated = html.replace(
        /href="style\.css"/g,
        `href="style.css?v=${cssHash}"`,
      );
      if (updated !== html) fs.writeFileSync(file, updated, 'utf8');
    }
    console.log(`Cache-bust: style.css?v=${cssHash}  (${htmlFiles.length} pages)`);
  }

  // ── Post-process: JS cache-busting (02-§77.1–77.3) ────────────────────
  const htmlFiles2 = findHtmlFiles(OUTPUT_DIR);
  const jsHashCache = new Map();
  let jsReplacements = 0;
  for (const file of htmlFiles2) {
    let html = fs.readFileSync(file, 'utf8');
    const updated = html.replace(/src="([^"]+\.js)"/g, (_match, jsFile) => {
      const jsPath = path.join(OUTPUT_DIR, jsFile);
      if (!fs.existsSync(jsPath)) return _match;
      if (!jsHashCache.has(jsFile)) {
        const hash = crypto.createHash('md5')
          .update(fs.readFileSync(jsPath))
          .digest('hex')
          .slice(0, 8);
        jsHashCache.set(jsFile, hash);
      }
      return `src="${jsFile}?v=${jsHashCache.get(jsFile)}"`;
    });
    if (updated !== html) {
      fs.writeFileSync(file, updated, 'utf8');
      jsReplacements++;
    }
  }
  console.log(`Cache-bust: ${jsHashCache.size} JS files  (${jsReplacements} pages)`);

  // ── Post-process: Image cache-busting (02-§78.1–78.3) ─────────────────
  const htmlFiles3 = findHtmlFiles(OUTPUT_DIR);
  const imgHashCache = new Map();
  let imgReplacements = 0;
  for (const file of htmlFiles3) {
    let html = fs.readFileSync(file, 'utf8');
    const updated = html.replace(
      /src="([^"]+\.(webp|png|jpg|jpeg|ico))"/g,
      (_match, imgFile) => {
        const imgPath = path.join(OUTPUT_DIR, imgFile);
        if (!fs.existsSync(imgPath)) return _match;
        if (!imgHashCache.has(imgFile)) {
          const hash = crypto.createHash('md5')
            .update(fs.readFileSync(imgPath))
            .digest('hex')
            .slice(0, 8);
          imgHashCache.set(imgFile, hash);
        }
        return `src="${imgFile}?v=${imgHashCache.get(imgFile)}"`;
      },
    );
    if (updated !== html) {
      fs.writeFileSync(file, updated, 'utf8');
      imgReplacements++;
    }
  }
  console.log(`Cache-bust: ${imgHashCache.size} image files  (${imgReplacements} pages)`);

  // ── Post-process: Image href cache-busting (02-§86.1) ──────────────────
  const htmlFiles4 = findHtmlFiles(OUTPUT_DIR);
  let hrefReplacements = 0;
  for (const file of htmlFiles4) {
    let html = fs.readFileSync(file, 'utf8');
    const updated = html.replace(
      /href="([^"]+\.(webp|png|jpg|jpeg|ico))"/g,
      (_match, imgFile) => {
        const imgPath = path.join(OUTPUT_DIR, imgFile);
        if (!fs.existsSync(imgPath)) return _match;
        if (!imgHashCache.has(imgFile)) {
          const hash = crypto.createHash('md5')
            .update(fs.readFileSync(imgPath))
            .digest('hex')
            .slice(0, 8);
          imgHashCache.set(imgFile, hash);
        }
        return `href="${imgFile}?v=${imgHashCache.get(imgFile)}"`;
      },
    );
    if (updated !== html) {
      fs.writeFileSync(file, updated, 'utf8');
      hrefReplacements++;
    }
  }
  console.log(`Cache-bust: image href  (${hrefReplacements} pages)`);

  // ── Post-process: Manifest icon cache-busting (02-§86.2) ───────────────
  const manifestPath = path.join(OUTPUT_DIR, 'app.webmanifest');
  if (fs.existsSync(manifestPath)) {
    let manifest = fs.readFileSync(manifestPath, 'utf8');
    const updated = manifest.replace(
      /"src"\s*:\s*"([^"]+\.(webp|png|jpg|jpeg|ico))"/g,
      (_match, imgFile) => {
        const imgPath = path.join(OUTPUT_DIR, imgFile);
        if (!fs.existsSync(imgPath)) return _match;
        if (!imgHashCache.has(imgFile)) {
          const hash = crypto.createHash('md5')
            .update(fs.readFileSync(imgPath))
            .digest('hex')
            .slice(0, 8);
          imgHashCache.set(imgFile, hash);
        }
        return `"src": "${imgFile}?v=${imgHashCache.get(imgFile)}"`;
      },
    );
    if (updated !== manifest) {
      fs.writeFileSync(manifestPath, updated, 'utf8');
      console.log('Cache-bust: app.webmanifest icons');
    }
  }

  // ── Post-process: Inject pre-cache URL list into sw.js (02-§92.1–92.5) ──
  const swOutPath = path.join(OUTPUT_DIR, 'sw.js');
  if (fs.existsSync(swOutPath)) {
    const EXCLUDE_PATTERNS = [
      /^\.gitkeep$/,
      /^\.htaccess$/,
      /^robots\.txt$/,
      /^sw\.js$/,
      /^version\.json$/,
      /^app\.webmanifest$/,
      /\.ics$/,
      /\.rss$/,
      /^schema\/.*\/index\.html$/,
    ];

    function collectFiles(dir, prefix) {
      const urls = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const rel = prefix ? prefix + '/' + entry.name : entry.name;
        if (entry.isDirectory()) {
          urls.push(...collectFiles(path.join(dir, entry.name), rel));
        } else {
          if (!EXCLUDE_PATTERNS.some((re) => re.test(rel))) {
            urls.push('/' + rel.replace(/\\/g, '/'));
          }
        }
      }
      return urls;
    }

    const preCacheUrls = collectFiles(OUTPUT_DIR, '').sort();
    // Add '/' as an alias for /index.html.
    if (!preCacheUrls.includes('/')) preCacheUrls.unshift('/');

    const urlList = preCacheUrls.map((u) => `  '${u}'`).join(',\n');
    let swContent = fs.readFileSync(swOutPath, 'utf8');
    swContent = swContent.replace('/* __PRE_CACHE_URLS__ */', urlList);
    fs.writeFileSync(swOutPath, swContent, 'utf8');
    console.log(`Pre-cache: injected ${preCacheUrls.length} URLs into sw.js`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
