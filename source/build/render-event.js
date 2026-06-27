'use strict';

const { escapeHtml, formatDate, toDateString, safeLinkHref } = require('./utils');
const { isMoved, movedTimeHtml } = require('./moved');
const { pageNav, pageFooter } = require('./layout');
const { renderDescriptionHtml } = require('./markdown');
const { pwaHeadTags } = require('./pwa');
const { findConflicts } = require('../assets/js/client/conflict-check.js');

/**
 * Renders a static HTML detail page for a single event.
 *
 * @param {object} event - Event object
 * @param {object} camp - Camp object (for page title)
 * @param {string} siteUrl - Base URL (unused in HTML but kept for consistency)
 * @param {string} [footerHtml=''] - Pre-rendered footer HTML
 * @param {Array}  [navSections=[]] - Navigation sections
 * @param {Array}  [allEvents=[]] - All events in the active camp, used to
 *                                  flag date/location overlaps at build time
 *                                  (02-§99.15).
 * @returns {string} Full HTML page
 */
// The HTML <title> tag has a project-wide 80-char limit (see .htmlvalidate.json
// "long-title"). Event titles are capped at 80 chars at input, but the archive
// contains legacy data with longer titles — render-time truncation means we
// never emit an over-long <title> regardless of how a title ended up in YAML.
function truncateForTitleTag(text, maxLen = 80) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + '…';
}

// Build the conflict-warning banner HTML for a per-event page. Returns ''
// when there are no conflicts. The markup mirrors the client-rendered
// banner in lagg-till.js / redigera.js so one CSS rule styles both.
function renderConflictBanner(event, allEvents) {
  const conflicts = findConflicts(event, allEvents, { excludeId: event.id });
  if (conflicts.length === 0) return '';
  const lead = conflicts.length === 1
    ? 'Den här tiden och platsen krockar med en annan aktivitet:'
    : 'Den här tiden och platsen krockar med flera aktiviteter:';
  const items = conflicts.map(function (c) {
    return `      <li><span class="conflict-warning__time">${escapeHtml(String(c.start))}–${escapeHtml(String(c.end))}</span> <span class="conflict-warning__title">${escapeHtml(String(c.title || ''))}</span> <span class="conflict-warning__resp">(${escapeHtml(String(c.responsible || ''))})</span></li>`;
  }).join('\n');
  return `    <div class="conflict-warning" role="status">\n      <p class="conflict-warning__lead">${lead}</p>\n      <ul class="conflict-warning__list">\n${items}\n      </ul>\n      <p class="conflict-warning__footer"><a href="lokaler.html">Se lokalöversikt →</a></p>\n    </div>\n`;
}

function renderEventPage(event, camp, siteUrl, footerHtml = '', navSections = [], allEvents = []) {
  const title = escapeHtml(event.title);
  const titleForTag = escapeHtml(truncateForTitleTag(event.title));
  // A cancelled activity (02-§118) keeps its page but the heading is struck
  // through (CSS h1.is-cancelled) and prefixed with the "INSTÄLLD" label.
  const cancelled = event.cancelled === true;
  const h1Class = cancelled ? ' class="is-cancelled"' : '';
  const h1Inner = `${cancelled ? '<span class="ev-cancelled-label">INSTÄLLD</span> ' : ''}${title}`;
  const date = formatDate(toDateString(event.date));
  const timeStr = event.end
    ? `${escapeHtml(String(event.start))}–${escapeHtml(String(event.end))}`
    : escapeHtml(String(event.start));
  // A moved activity shows its previous time struck through beside the
  // highlighted new time (02-§119.6). The per-event page carries no ghost
  // marker — it describes one activity and has no schedule slot (02-§119.10).
  const timeDisplay = isMoved(event) ? movedTimeHtml(event, timeStr) : timeStr;

  let descriptionHtml = '';
  if (event.description) {
    const rendered = renderDescriptionHtml(event.description);
    descriptionHtml = `    <div class="event-description">\n      <p class="event-section-label">Beskrivning</p>\n      ${rendered}\n    </div>\n`;
  }

  let linkHtml = '';
  const safeLink = safeLinkHref(event.link);
  if (safeLink) {
    linkHtml = `    <p class="event-link-row"><a class="event-ext-link" href="${escapeHtml(safeLink)}" target="_blank" rel="noopener noreferrer">Extern länk (för diskussion etc) →</a></p>\n`;
  }

  const conflictHtml = renderConflictBanner(event, allEvents);

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <base href="../../">
  <title>${titleForTag}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
</head>
<body>
${pageNav('schema.html', navSections)}
<main>
  <p class="back-link"><a href="schema.html">← Tillbaka till schemat</a></p>
  <h1${h1Class}>${h1Inner}</h1>
  <div class="event-detail">
    <p>📅 ${date} 🕐 ${timeDisplay}</p>
    <p>📍 <strong>Plats:</strong> ${escapeHtml(event.location)} · 👤 <strong>Ansvarig:</strong> ${escapeHtml(event.responsible)}</p>
    <p>📆 <a href="schema/${escapeHtml(String(event.id))}/event.ics" download>Lägg till i kalender (.ics)</a></p>
${conflictHtml}${descriptionHtml}${linkHtml}  </div>
</main>
  <script src="nav.js" defer></script>
  <script src="feedback.js" defer></script>
  <script src="sw-register.js" defer></script>
  <script src="pwa-install.js" defer></script>
  <script src="admin.js" defer></script>
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = { renderEventPage };
