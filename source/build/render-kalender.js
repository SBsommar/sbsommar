'use strict';

const { escapeHtml } = require('./utils');
const { pageNav, pageFooter } = require('./layout');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');

/**
 * Renders the calendar tips page at /kalender.html.
 *
 * @param {object} camp - Camp object (for page title)
 * @param {string} siteUrl - Base URL (used for webcal link)
 * @param {string} [footerHtml=''] - Pre-rendered footer HTML
 * @param {Array}  [navSections=[]] - Navigation sections
 * @returns {string} Full HTML page
 */
function renderKalenderPage(camp, siteUrl, footerHtml = '', navSections = [], goatcounterCode = '') {
  const campName = escapeHtml(camp.name);
  const webcalUrl = siteUrl.replace(/^https?:\/\//, 'webcal://') + '/schema.ics';
  const icsUrl = escapeHtml(siteUrl + '/schema.ics');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Kalendersynk – ${campName}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="site.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
</head>
<body>
${pageNav('kalender.html', navSections)}
<main>
  <h1>Synka schemat till din kalender</h1>

  <div class="kalender-card">
    <p>Du kan prenumerera på hela lägerschemat så att alla aktiviteter dyker upp
    i din kalenderapp — och uppdateras automatiskt om schemat ändras.</p>
    <p>Du kan också ladda ner enskilda aktiviteter som engångsimport från varje
    aktivitets detaljsida i <a href="schema.html">schemat</a>.</p>
  </div>

  <div class="kalender-card">
    <h2>Prenumerera på hela schemat</h2>
    <p>Kopiera den här länken och lägg till den som en kalenderprenumeration:</p>
    <div class="ical-url-block"><pre>${escapeHtml(webcalUrl)}</pre></div>
    <p><a href="${escapeHtml(webcalUrl)}">Öppna direkt i kalenderappen →</a></p>
    <p>Alternativt kan du ladda ner hela schemat som en fil:
    <a href="schema.ics">Ladda ner schema.ics</a></p>
  </div>

  <div class="kalender-card">
    <h2>iPhone / iPad (iOS Kalender)</h2>
    <ol>
      <li>Tryck på länken ovan — "Öppna direkt i kalenderappen".</li>
      <li>iOS frågar om du vill prenumerera. Tryck <strong>Prenumerera</strong>.</li>
      <li>Klart! Schemat dyker upp som en egen kalender och uppdateras automatiskt.</li>
    </ol>
  </div>

  <div class="kalender-card">
    <h2>Android (Google Kalender)</h2>
    <ol>
      <li>Öppna <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">Google Kalender</a> i en webbläsare (inte appen).</li>
      <li>Klicka på <strong>+</strong> bredvid "Andra kalendrar" i vänstermenyn.</li>
      <li>Välj <strong>Från webbadress</strong>.</li>
      <li>Klistra in: <code>${icsUrl}</code></li>
      <li>Klicka <strong>Lägg till kalender</strong>. Det kan ta några minuter innan den synkas till appen.</li>
    </ol>
  </div>

  <div class="kalender-card">
    <h2>Gmail (webbversion)</h2>
    <ol>
      <li>Samma steg som Android ovan — Google Kalender på webben hanterar prenumerationer.</li>
    </ol>
  </div>

  <div class="kalender-card">
    <h2>Outlook</h2>
    <ol>
      <li>Öppna Outlook (app eller <a href="https://outlook.live.com/calendar" target="_blank" rel="noopener noreferrer">webben</a>).</li>
      <li>Gå till Kalender-vyn.</li>
      <li>Klicka <strong>Lägg till kalender</strong> → <strong>Prenumerera från webben</strong>.</li>
      <li>Klistra in: <code>${icsUrl}</code></li>
      <li>Ge kalendern ett namn och klicka <strong>Importera</strong>.</li>
    </ol>
  </div>

  <div class="kalender-card">
    <h2>Prenumeration vs. engångsimport</h2>
    <p><strong>Prenumeration</strong> (webcal) — din kalenderapp hämtar schemat automatiskt
    med jämna mellanrum. Om en aktivitet läggs till eller ändras ser du det utan att
    göra något. Det här är det rekommenderade sättet.</p>
    <p><strong>Engångsimport</strong> (.ics-fil) — du laddar ner en aktivitet och lägger till
    den i kalendern en gång. Ändringar i schemat syns inte automatiskt. Bra om du bara
    vill ha en enstaka aktivitet.</p>
  </div>

  <p class="back-link"><a href="schema.html">← Tillbaka till schemat</a></p>
</main>
  <script src="nav.js" defer></script>
  <script src="feedback.js" defer></script>
  <script src="sw-register.js" defer></script>
  <script src="pwa-install.js" defer></script>
  <script src="admin.js" defer></script>${goatcounterScript(goatcounterCode)}
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = { renderKalenderPage };
