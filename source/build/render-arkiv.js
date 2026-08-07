'use strict';

const { pageNav, pageFooter } = require('./layout');
const { escapeHtml, toDateString, formatDate, safeLinkHref } = require('./utils');
const { renderDescriptionHtml } = require('./markdown');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');
const { EDQHUB_ICON } = require('./render-index');

const MONTHS_SV = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

// Formats a compact header date range: "D–D månadsnamn YYYY"
// When months differ: "D månadsnamn – D månadsnamn YYYY"
function formatHeaderDateRange(startStr, endStr) {
  const s = new Date(toDateString(startStr) + 'T12:00:00');
  const e = new Date(toDateString(endStr) + 'T12:00:00');
  const year = e.getFullYear();
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${e.getDate()} ${MONTHS_SV[e.getMonth()]} ${year}`;
  }
  return `${s.getDate()} ${MONTHS_SV[s.getMonth()]} – ${e.getDate()} ${MONTHS_SV[e.getMonth()]} ${year}`;
}

// Groups events by date and sorts by start time within each day
function groupAndSortEvents(events) {
  const byDate = {};
  for (const ev of events) {
    const d = toDateString(ev.date);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(ev);
  }
  const dates = Object.keys(byDate).sort();
  for (const d of dates) {
    byDate[d].sort((a, b) => String(a.start).localeCompare(String(b.start)));
  }
  return { dates, byDate };
}

// Renders the expandable detail content for events with description/link
function eventExtraHtml(ev) {
  const parts = [];
  if (ev.description) {
    parts.push(`<div class="event-desc">${renderDescriptionHtml(ev.description)}</div>`);
  }
  const safeLink = safeLinkHref(ev.link);
  if (safeLink) {
    parts.push(
      `<a class="event-ext-link" href="${escapeHtml(safeLink)}" target="_blank" rel="noopener">Extern länk →</a>`,
    );
  }
  return `<div class="event-extra">${parts.join('')}</div>`;
}

// Renders an event row — expandable <details> when description/link present,
// otherwise a flat <div>
function renderArchiveEventRow(ev) {
  const timeStr = ev.end
    ? `${escapeHtml(String(ev.start))}–${escapeHtml(String(ev.end))}`
    : escapeHtml(String(ev.start));
  const metaParts = [ev.location, ev.responsible].filter(Boolean).map(escapeHtml);
  const metaEl = metaParts.length ? `<span class="ev-meta"> · ${metaParts.join(' · ')}</span>` : '';
  const hasExtra = ev.description || safeLinkHref(ev.link);

  if (hasExtra) {
    return `        <details class="event-row">
          <summary>
            <span class="ev-time">${timeStr}</span>
            <span class="ev-title">${escapeHtml(ev.title)}</span>${metaEl ? `\n            ${metaEl}` : ''}
          </summary>
          ${eventExtraHtml(ev)}
        </details>`;
  }

  return `        <div class="event-row plain">
          <span class="ev-time">${timeStr}</span>
          <span class="ev-title">${escapeHtml(ev.title)}</span>${metaEl ? `\n          ${metaEl}` : ''}
        </div>`;
}

// Renders the event list section for a camp's events
function renderEventsSection(events) {
  if (!events || events.length === 0) return '';

  const { dates, byDate } = groupAndSortEvents(events);
  const daySections = dates.map((d) => {
    const heading = formatDate(toDateString(d));
    const rows = byDate[d].map(renderArchiveEventRow).join('\n');
    return `      <div class="archive-day">
        <h3 class="archive-day-heading">${escapeHtml(heading)}</h3>
${rows}
      </div>`;
  });

  return `\n      <div class="archive-events">
${daySections.join('\n')}
      </div>`;
}

function renderArkivPage(allCamps, footerHtml = '', navSections = [], campEventsMap = {}, goatcounterCode = '') {
  const camps = [...allCamps]
    .filter((c) => c.archived === true)
    .sort((a, b) => toDateString(b.start_date).localeCompare(toDateString(a.start_date)));

  const items = camps.map((camp) => {
    const id = escapeHtml(camp.id || '');
    const panelId = `panel-${id}`;
    const name = escapeHtml(camp.name || '');
    const headerDateRange = escapeHtml(formatHeaderDateRange(camp.start_date, camp.end_date));
    const location = escapeHtml(camp.location || '');
    const info = (camp.information || '').trim();
    const link = (camp.link || '').trim();
    const edqhub = safeLinkHref(camp.edqhub);

    const infoHtml = info
      ? `\n        <p class="camp-information">${escapeHtml(info)}</p>`
      : '';

    const linkHtml = link
      ? `\n        <a class="camp-fb-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer"><img src="images/facebook-ikon.webp" alt="Facebookgrupp" class="camp-fb-logo" width="24" height="24"></a>`
      : '';

    // A camp that carries an `edqhub` join URL shows an EDQ Hub link beside the
    // Facebook link (02-§121.16), gated on the sanitised URL so camps without
    // the field show none. The migration statement itself lives in the camp's
    // `information` text (02-§121.17), not in a separate element.
    const hubLinkHtml = edqhub
      ? `\n        <a class="camp-hub-link" href="${escapeHtml(edqhub)}" target="_blank" rel="noopener noreferrer" aria-label="EDQ Hub">${EDQHUB_ICON}</a>`
      : '';

    const campEvents = campEventsMap[camp.id] || [];
    const eventsHtml = renderEventsSection(campEvents);

    return `  <li class="timeline-item">
    <div class="timeline-dot" aria-hidden="true"></div>
    <div class="timeline-card">
      <button type="button" class="timeline-header" aria-expanded="false" aria-controls="${panelId}">
        <span class="timeline-name">${name}</span>
        <span class="timeline-meta">${headerDateRange} · ${location}</span>
        <span class="timeline-chevron" aria-hidden="true"></span>
      </button>
      <div class="timeline-panel" id="${panelId}" hidden>${linkHtml}${hubLinkHtml}${infoHtml}${eventsHtml}
      </div>
    </div>
  </li>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Arkiv – SB Sommar</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="site.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
</head>
<body>
${pageNav('arkiv.html', navSections)}
<main>
  <div class="page-content">
    <h1>Lägerarkiv</h1>
    <p class="intro">Alla tidigare läger. Klicka på ett läger för att se mer information.</p>

    <ol class="timeline">
${items}
    </ol>
  </div>
</main>
  <script src="arkiv.js"></script>
  <script src="nav.js" defer></script>
  <script src="feedback.js" defer></script>
  <script src="sw-register.js" defer></script>
  <script src="pwa-install.js" defer></script>
  <script src="admin.js" defer></script>${goatcounterScript(goatcounterCode)}
${pageFooter(footerHtml)}
</body>
</html>`;
}

module.exports = { renderArkivPage };
