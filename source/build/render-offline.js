'use strict';

const { pageNav, pageFooter } = require('./layout');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');

/**
 * Renders the offline fallback page at /offline.html.
 *
 * Shown by the service worker when a navigation request fails and
 * the requested page is not in the cache.
 *
 * @param {string} [footerHtml=''] - Pre-rendered footer HTML
 * @param {Array}  [navSections=[]] - Navigation sections
 * @param {string} [goatcounterCode=''] - GoatCounter site code
 * @returns {string} Full HTML page
 */
function renderOfflinePage(footerHtml = '', navSections = [], goatcounterCode = '') {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Offline – SB Sommar</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="site.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
</head>
<body>
${pageNav('', navSections)}
<main>
  <h1>Du är offline</h1>
  <p>Det går inte att nå sidan just nu — du verkar sakna nätverksanslutning.</p>
  <p>Följande sidor kan vara tillgängliga från cachen:</p>
  <ul>
    <li><a href="index.html">Hem</a></li>
    <li><a href="schema.html">Schema</a></li>
    <li><a href="idag.html">Dagens aktiviteter</a></li>
    <li><a href="arkiv.html">Arkiv</a></li>
  </ul>
  <p>Prova igen när du har internetåtkomst.</p>
</main>
${pageFooter(footerHtml)}
${goatcounterScript(goatcounterCode)}
<script src="nav.js" defer></script>
<script src="sw-register.js" defer></script>
  <script src="pwa-install.js" defer></script>
  <script src="admin.js" defer></script>
</body>
</html>`;
}

module.exports = { renderOfflinePage };
