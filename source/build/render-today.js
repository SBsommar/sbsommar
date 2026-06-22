'use strict';

const { escapeHtml, toDateString } = require('./render');
const { renderDescriptionHtml } = require('./markdown');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');

/**
 * Renders the "Dagens schema" page.
 * All events are embedded as JSON; client-side JS filters to the current day.
 * Uses display-mode (dark) styling for screen/projector use.
 * No navigation or site footer – clean display layout with QR code sidebar.
 * Optimised for portrait-orientation screens: heading lives in the sidebar so
 * events use the full height; event rows are compact for maximum row count.
 * Sidebar shows a live clock and last-updated time; page auto-reloads at
 * midnight and on new version detection via version.json polling.
 */
function renderTodayPage(camp, events, qrSvg, siteUrl = '', buildTime = '', goatcounterCode = '') {
  const campName = escapeHtml(camp.name);
  const siteHost = siteUrl ? escapeHtml(siteUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '')) : '';
  const safeBuildTime = escapeHtml(buildTime);

  const eventsJson = JSON.stringify(
    events.map((e) => ({
      title: e.title,
      date: toDateString(e.date),
      start: String(e.start),
      end: e.end ? String(e.end) : null,
      location: e.location || null,
      responsible: e.responsible || null,
      description: e.description || null,
      descriptionHtml: e.description ? renderDescriptionHtml(e.description) : null,
      link: e.link || null,
    })),
  );

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Dagens schema – ${campName}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
</head>
<body class="display-mode">

<main>
  <div class="dagens-layout">

    <div class="dagens-events">
      <div id="today-events"></div>
    </div>

    <aside class="dagens-sidebar">
      <h1 id="today-heading" class="sidebar-heading"></h1>
      <div class="status-bar">
        <span class="status-clock" id="live-clock"></span>
        <span class="status-updated" id="build-info"></span>
      </div>
      <p class="sidebar-text">Detta är schemat för aktiviteter som sker idag. För kartor, information och schema andra dagar – besök ${siteHost} eller skanna QR-koden.</p>
      <div class="qr-wrap">${qrSvg}</div>
    </aside>

  </div>
</main>
  <script>window.__EVENTS__ = ${eventsJson}; window.__HEADING_PREFIX__ = ''; window.__EMPTY_CLASS__ = 'sidebar-text'; window.__SHOW_FOOTER__ = true; window.__BUILD_TIME__ = '${safeBuildTime}'; window.__VERSION__ = '${safeBuildTime}';</script>
  <script src="events-today.js"></script>
  <script src="sw-register.js" defer></script>
  <script src="pwa-install.js" defer></script>${goatcounterScript(goatcounterCode)}
</body>
</html>
`;
}

/**
 * Renders a lightweight redirect page from the old dagens-schema.html URL
 * to the new live.html URL.
 */
function renderRedirectPage() {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=live.html">
  <title>Omdirigerar\u2026</title>
</head>
<body>
  <p>Sidan har flyttat till <a href="live.html">live.html</a>.</p>
  <script>location.replace('live.html');</script>
</body>
</html>
`;
}

module.exports = { renderTodayPage, renderRedirectPage };
