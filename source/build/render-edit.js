'use strict';

const { escapeHtml, toDateString } = require('./render');
const { pageNav, pageFooter } = require('./layout');
const { addOneDay } = require('../api/time-gate');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');

const DEFAULT_LOCATIONS = ['Servicehus', 'Annat'];

// Derive the edit-event API URL from the add-event API URL.
// Replaces a trailing /add-event segment with /edit-event.
// Falls back to '/edit-event' when no URL is supplied.
function editApiUrl(addUrl) {
  if (!addUrl) return '/edit-event';
  return addUrl.replace(/\/add-event$/, '/edit-event');
}

// Derive the delete-event API URL from any event API URL.
// Handles both /add-event and /edit-event as input.
function deleteApiUrl(url) {
  if (!url) return '/delete-event';
  return url.replace(/\/(add|edit)-event$/, '/delete-event');
}

function renderEditPage(camp, locations, apiUrl, footerHtml = '', navSections = [], cookieDomain = '', goatcounterCode = '') {
  const campName = escapeHtml(camp.name);
  const startDate = toDateString(camp.start_date);
  const endDate = toDateString(camp.end_date);
  const opensDate = toDateString(camp.opens_for_editing || startDate);
  const closesDate = addOneDay(endDate);

  // "Annat" always last; deduplicate
  const locList = [
    ...(locations || DEFAULT_LOCATIONS).filter((l) => l !== 'Annat'),
    'Annat',
  ];

  const locationOptions = locList
    .map((l) => `          <option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Redigera aktivitet – ${campName}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
</head>
<body${cookieDomain ? ` data-cookie-domain="${escapeHtml(cookieDomain)}"` : ''}>
${pageNav('redigera.html', navSections)}
<main>
  <div id="edit-loading" role="status">
    <p>Laddar aktivitet…</p>
  </div>

  <div id="edit-no-session" hidden>
    <h1>Redigera aktivitet</h1>
    <p class="intro">Den här sidan är till för att redigera aktiviteter du har lagt till. För att det ska fungera behöver du tillåta cookie när du <a href="lagg-till.html">lägger till en aktivitet</a>.</p>
  </div>

  <div id="edit-my-events" hidden>
    <h1>Mina aktiviteter</h1>
    <p class="intro" id="my-events-empty">Här dyker dina redigerbara aktiviteter upp.</p>
    <ul id="my-events-list"></ul>
    <p class="cookie-debug-note" id="my-events-note" hidden>Aktiviteter vars datum har passerat rensas automatiskt från cookien och visas inte i listan ovan.</p>
  </div>

  <div id="edit-error" hidden>
    <p class="form-error-msg" id="edit-error-msg">Aktiviteten kunde inte laddas.</p>
    <a href="schema.html">Tillbaka till schemat</a>
  </div>

  <section id="edit-section" hidden>
    <div class="edit-header">
      <h1>Redigera aktivitet</h1>
      <!-- Cancel/restore toggle (02-§118) sits beside the delete button. It
           saves in one click — its label flips to "Återställ aktiviteten" once
           the activity is cancelled. -->
      <div class="edit-header-actions">
        <button type="button" id="btn-cancel" class="btn-cancel-activity">Ställ in aktiviteten</button>
        <button type="button" id="btn-delete" class="btn-delete-pill">Radera aktivitet</button>
      </div>
    </div>

    <form id="edit-form" class="event-form" novalidate
          data-api-url="${escapeHtml(apiUrl || '/edit-event')}"
          data-delete-url="${escapeHtml(deleteApiUrl(apiUrl) || '/delete-event')}"
          data-camp-start="${startDate}"
          data-camp-end="${endDate}"
          data-opens="${opensDate}"
          data-closes="${closesDate}">

      <input type="hidden" id="f-id" name="id">

      <fieldset>

        <div class="field">
          <label for="f-title">Rubrik <span class="req">*</span></label>
          <input type="text" id="f-title" name="title" autocomplete="off" required maxlength="80" aria-describedby="err-title">
          <span class="field-error" id="err-title" hidden></span>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="f-date">Datum <span class="req">*</span></label>
            <input type="date" id="f-date" name="date" min="${startDate}" max="${endDate}" required aria-describedby="err-date">
            <span class="field-error" id="err-date" hidden></span>
          </div>
          <div class="field">
            <label for="f-start">Starttid <span class="req">*</span></label>
            <input type="time" id="f-start" name="start" required aria-describedby="err-start">
            <span class="field-error" id="err-start" hidden></span>
          </div>
          <div class="field">
            <label for="f-end">Sluttid <span class="req">*</span></label>
            <input type="time" id="f-end" name="end" required aria-describedby="err-end">
            <span class="field-error" id="err-end" hidden></span>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="f-location">Plats <span class="req">*</span></label>
            <select id="f-location" name="location" required aria-describedby="err-location">
              <option value="">Välj plats...</option>
${locationOptions}
            </select>
            <span class="field-error" id="err-location" hidden></span>
          </div>
          <div class="field">
            <label for="f-responsible">Ansvarig <span class="req">*</span></label>
            <input type="text" id="f-responsible" name="responsible" autocomplete="off" required maxlength="60" aria-describedby="err-responsible">
            <span class="field-error" id="err-responsible" hidden></span>
          </div>
        </div>

        <div class="field">
          <label for="f-description">Beskrivning <span class="opt">(valfritt)</span></label>
          <div class="md-toolbar" role="toolbar" aria-label="Markdown-formatering"></div>
          <textarea id="f-description" name="description" rows="4" maxlength="2000"></textarea>
          <section class="md-preview" aria-live="polite" aria-label="Förhandsgranskning av beskrivning" hidden>
            <div class="md-preview-header"><span class="md-preview-label">Förhandsgranskning</span><span class="md-help">Ser det inte ut som du tänkt dig? Kolla <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">Markdown-guiden ↗</a></span></div>
            <div class="md-preview-content"></div>
          </section>
        </div>

        <div class="field">
          <label for="f-link">Länk <span class="opt">(valfritt)</span></label>
          <input type="url" id="f-link" name="link" maxlength="500" placeholder="https://...">
        </div>

      </fieldset>

      <div class="form-actions">
        <button type="submit" class="btn-primary">Spara ändringar →</button>
        <a href="schema.html" class="btn-secondary">Avbryt</a>
      </div>

    </form>

  </section>

  <div id="delete-confirm" class="submit-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-heading" hidden>
    <div class="modal-backdrop"></div>
    <div class="modal-box">
      <h2 id="delete-confirm-heading" class="modal-heading" tabindex="-1">Radera aktivitet</h2>
      <div class="modal-content">
        <p>Är du säker på att du vill radera <strong id="delete-confirm-title"></strong>?</p>
        <p>Aktiviteten tas bort helt från schemat. Det går inte att ångra.</p>
        <div class="delete-actions">
          <button type="button" id="delete-confirm-yes" class="btn-destructive">Ja, radera</button>
          <button type="button" id="delete-confirm-no" class="btn-secondary">Avbryt</button>
        </div>
      </div>
    </div>
  </div>

  <div id="submit-modal" class="submit-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" hidden>
    <div class="modal-backdrop"></div>
    <div class="modal-box">
      <h2 id="modal-heading" class="modal-heading" tabindex="-1"></h2>
      <div id="modal-content" class="modal-content"></div>
    </div>
  </div>

  <details id="cookie-debug" class="cookie-debug">
    <summary>Om din cookie</summary>
    <div id="cookie-debug-content">
      <p class="cookie-debug-loading">Laddar cookie-information…</p>
    </div>
  </details>
</main>
  <script src="markdown-toolbar.js"></script>
  <script defer src="marked.umd.js"></script>
  <script defer src="markdown-renderers.js"></script>
  <script defer src="markdown-preview.js"></script>
  <script src="offline-guard.js"></script>
  <script src="conflict-check.js"></script>
  <script src="redigera.js"></script>
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

module.exports = { renderEditPage, editApiUrl, deleteApiUrl };
