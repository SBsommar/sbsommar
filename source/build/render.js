'use strict';

const { pageNav, pageFooter } = require('./layout');
const { toDateString, escapeHtml, formatDate, safeLinkHref } = require('./utils');
const { isMoved, movedTimeHtml, buildGhosts, locationHtml } = require('./moved');
const { renderDescriptionHtml } = require('./markdown');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');

/**
 * Groups events by date and sorts each day's events by start time.
 * Returns { dates: string[], byDate: Record<string, Event[]> }
 */
function groupAndSortEvents(events) {
  const byDate = {};
  for (const event of events) {
    const d = toDateString(event.date);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(event);
  }
  const dates = Object.keys(byDate).sort();
  for (const d of dates) {
    byDate[d].sort((a, b) => String(a.start).localeCompare(String(b.start)));
  }
  return { dates, byDate };
}

function eventExtraHtml(e) {
  const parts = [];
  if (e.description) {
    parts.push(`<div class="event-desc">${renderDescriptionHtml(e.description)}</div>`);
  }
  const safeLink = safeLinkHref(e.link);
  if (safeLink) {
    parts.push(
      `<a class="event-ext-link" href="${escapeHtml(safeLink)}" target="_blank" rel="noopener">Extern länk →</a>`,
    );
  }
  return `<div class="event-extra">${parts.join('')}</div>`;
}

function icalDownloadLink(e) {
  if (!e.id) return '';
  return `<a href="schema/${escapeHtml(String(e.id))}/event.ics" class="ev-ical" download title="Ladda ner iCal" data-goatcounter-click="download-ical">iCal</a>`;
}

// A cancelled activity (02-§118) stays in the schedule but is marked with the
// is-cancelled class (struck-through terracotta styling in style.css) and an
// "INSTÄLLD" prefix on its title. The prefix is real text, so it is announced
// by screen readers — the cancelled state never relies on colour alone.
const CANCELLED_LABEL = '<span class="ev-cancelled-label">INSTÄLLD</span> ';

// A previous-slot ghost marker for a moved activity (02-§119.8): the title and a
// "Flyttad till …" pointer only — no meta, detail, or iCal link. It carries its
// old date/start/end so schema-status.js can grey it once that slot is in the
// past (02-§119.17); the is-ghost class tells the classifier never to mark it
// is-now (a ghost is only ever upcoming or past).
function renderGhostRow(e) {
  const timeStr = e.end
    ? `${escapeHtml(String(e.start))}–${escapeHtml(String(e.end))}`
    : escapeHtml(String(e.start));
  const dateAttr = e.date ? ` data-event-date="${escapeHtml(String(e.date))}"` : '';
  const startAttr = e.start ? ` data-event-start="${escapeHtml(String(e.start))}"` : '';
  const endAttr = e.end ? ` data-event-end="${escapeHtml(String(e.end))}"` : '';
  return [
    `    <div class="event-row plain is-ghost"${dateAttr}${startAttr}${endAttr}>`,
    `      <span class="ev-time">${timeStr}</span>`,
    `      <span class="ev-title">${escapeHtml(e.title)}</span>`,
    `      <span class="ev-moved-to">${escapeHtml(e.movedToText)}</span>`,
    '    </div>',
  ].join('\n');
}

function renderEventRow(e) {
  if (e._ghost) return renderGhostRow(e);

  const timeStr = e.end
    ? `${escapeHtml(String(e.start))}–${escapeHtml(String(e.end))}`
    : escapeHtml(String(e.start));
  // A moved activity shows its previous time struck through next to the
  // highlighted new time (02-§119.6); otherwise the plain time string.
  const moved = isMoved(e);
  const timeCellHtml = moved ? movedTimeHtml(e, timeStr) : timeStr;
  const movedClass = moved ? ' is-moved' : '';
  // A relocated activity shows its new location as usual, preceded by the
  // previous location struck through in small text (02-§119.16).
  const metaParts = [locationHtml(e), e.responsible ? escapeHtml(e.responsible) : ''].filter(Boolean);
  const metaEl = metaParts.length ? `<span class="ev-meta"> · ${metaParts.join(' · ')}</span>` : '';
  const icalEl = icalDownloadLink(e);
  const hasExtra = e.description || safeLinkHref(e.link);

  const cancelled = e.cancelled === true;
  const cancelledClass = cancelled ? ' is-cancelled' : '';
  const titleHtml = `${cancelled ? CANCELLED_LABEL : ''}${escapeHtml(e.title)}`;

  const idAttr = e.id ? ` data-event-id="${escapeHtml(String(e.id))}"` : '';
  const dateAttr = e.date ? ` data-event-date="${escapeHtml(String(e.date))}"` : '';
  // Start/end times exposed so schema-status.js can mark each row as ended
  // (.is-past) or in progress (.is-now) against the current time.
  const startAttr = e.start ? ` data-event-start="${escapeHtml(String(e.start))}"` : '';
  const endAttr = e.end ? ` data-event-end="${escapeHtml(String(e.end))}"` : '';
  const timeAttrs = `${dateAttr}${startAttr}${endAttr}`;

  if (hasExtra) {
    return [
      `    <details class="event-row${cancelledClass}${movedClass}"${idAttr}${timeAttrs}>`,
      '      <summary>',
      `        <span class="ev-time">${timeCellHtml}</span>`,
      `        <span class="ev-title">${titleHtml}</span>`,
      metaEl ? `        ${metaEl}` : '',
      icalEl ? `        ${icalEl}` : '',
      '      </summary>',
      `      ${eventExtraHtml(e)}`,
      '    </details>',
    ]
      .filter(Boolean)
      .join('\n');
  } else {
    return [
      `    <div class="event-row plain${cancelledClass}${movedClass}"${idAttr}${timeAttrs}>`,
      `      <span class="ev-time">${timeCellHtml}</span>`,
      `      <span class="ev-title">${titleHtml}</span>`,
      metaEl ? `      ${metaEl}` : '',
      icalEl ? `      ${icalEl}` : '',
      '    </div>',
    ]
      .filter(Boolean)
      .join('\n');
  }
}

function renderDaySection(date, dayEvents) {
  const rows = dayEvents.map(renderEventRow).join('\n');
  return [
    `  <details class="day" id="${date}" open>`,
    `    <summary>${formatDate(date)}</summary>`,
    '    <div class="event-list">',
    rows,
    '    </div>',
    '  </details>',
  ].join('\n');
}

function renderSchedulePage(camp, events, footerHtml = '', navSections = [], siteUrl = '', cookieDomain = '', goatcounterCode = '') {
  // A moved activity also leaves a minimal ghost marker at its previous slot
  // (02-§119.8); ghosts group and sort into their old day like any other row.
  const { dates, byDate } = groupAndSortEvents(events.concat(buildGhosts(events)));
  const daySections = dates.map((date) => renderDaySection(date, byDate[date])).join('\n\n');
  const campName = escapeHtml(camp.name);

  let icalIconHtml = '';
  let webcalHtml = '';
  if (siteUrl) {
    const webcalUrl = escapeHtml(siteUrl.replace(/^https?:\/\//, 'webcal://') + '/schema.ics');
    webcalHtml = webcalUrl;
    icalIconHtml = `\n    <a href="kalender.html" class="ical-link" title="Prenumerera i kalender"><svg class="ical-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="17" x2="9" y2="17.01"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg><span class="sr-only">Kalender</span></a>`;
  }

  const guideHtml = siteUrl
    ? `\n  <p class="intro"><a href="kalender.html">Guide: Synka schemat till din kalender</a> · <a href="${webcalHtml}">Prenumerera direkt (webcal)</a></p>`
    : '';

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Lägrets schema – ${campName}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
</head>
<body${cookieDomain ? ` data-cookie-domain="${escapeHtml(cookieDomain)}"` : ''}>
${pageNav('schema.html', navSections)}
<main>
  <div class="schedule-header">
    <h1>Lägrets schema – ${campName}</h1>
    <a href="schema.rss" class="rss-link" title="RSS-feed" data-goatcounter-click="click-rss"><img src="images/rss-logo.webp" alt="RSS" class="rss-icon" width="38" height="38"></a>${icalIconHtml}
  </div>
  <p class="intro">Om du klickar på en aktivitets rubrik så finns det ofta lite mer detaljerad information. När plats säger [annat], då ska platsen stå i den detaljerade informationen. <a href="lokaler.html">Se lokalöversikt →</a></p>
  <p class="intro">Lägret blir vad vi gör det till tillsammans, alla aktiviteter är deltagararrangerade. Känner man att det är någon aktivitet som man vill arrangera och behöver material till den, det kan vara allt ifrån bakingredienser till microbitar att programmera, kort sagt vad behöver ni som aktivitetsarrangör för att kunna hålla eran aktivitet? Kolla under <a href="lagg-till.html">Lägg till aktivitet</a>.</p>${guideHtml}

${daySections}
</main>
  <script src="wp-cleanup.js"></script>
  <script src="session.js"></script>
  <script src="nav.js" defer></script>
  <script src="feedback.js" defer></script>
  <script src="sw-register.js" defer></script>
  <script src="pwa-install.js" defer></script>
  <script src="admin.js" defer></script>
  <script src="schema-status.js" defer></script>
  <script>
  (function(){var t=new Date();t.setHours(0,0,0,0);document.querySelectorAll('details.day').forEach(function(d){var p=d.id.split('-');var dd=new Date(+p[0],+p[1]-1,+p[2]);if(dd<t)d.removeAttribute('open');});})();
  </script>${goatcounterScript(goatcounterCode)}
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = {
  toDateString,
  escapeHtml,
  formatDate,
  groupAndSortEvents,
  eventExtraHtml,
  renderEventRow,
  renderDaySection,
  renderSchedulePage,
};
