'use strict';

const { escapeHtml, toDateString } = require('./render');
const { pageNav, pageFooter } = require('./layout');
const { renderDescriptionHtml } = require('./markdown');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');

/**
 * Renders the "Idag" page – today's schedule in the standard site layout.
 * All events are embedded as JSON; client-side JS filters to the current day.
 */
function renderIdagPage(camp, events, footerHtml = '', navSections = [], cookieDomain = '', goatcounterCode = '') {
  const campName = escapeHtml(camp.name);

  const eventsJson = JSON.stringify(
    events.map((e) => ({
      id: e.id || null,
      title: e.title,
      date: toDateString(e.date),
      start: String(e.start),
      end: e.end ? String(e.end) : null,
      location: e.location || null,
      responsible: e.responsible || null,
      description: e.description || null,
      descriptionHtml: e.description ? renderDescriptionHtml(e.description) : null,
      link: e.link || null,
      cancelled: e.cancelled === true,
      moved: e.moved && e.moved.from_date ? e.moved : null,
      relocated: e.relocated && e.relocated.from_location ? e.relocated : null,
      clash: e._clash === true,
    })),
  );

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Dagens aktiviteter – ${campName}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
</head>
<body${cookieDomain ? ` data-cookie-domain="${escapeHtml(cookieDomain)}"` : ''}>
${pageNav('idag.html', navSections)}
<main>
  <h1 id="today-heading">Dagens aktiviteter</h1>
  <p class="intro">Aktiviteterna nedan är schemalagda för idag. Kolla gärna <a href="schema.html">hela schemat</a> för övriga dagar.</p>

  <div id="today-events"></div>
</main>
  <script>window.__EVENTS__ = ${eventsJson}; window.__HEADING_PREFIX__ = 'Dagens aktiviteter'; window.__EMPTY_CLASS__ = 'intro'; window.__SHOW_FOOTER__ = false; window.__SHOW_ICAL__ = true;</script>
  <script src="ghost-config.js"></script>
  <script src="events-today.js"></script>
  <script src="session.js"></script>
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

module.exports = { renderIdagPage };
