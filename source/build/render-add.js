'use strict';

const { escapeHtml, toDateString, campDayButtons } = require('./utils');
const { pageNav, pageFooter } = require('./layout');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');

const DEFAULT_LOCATIONS = ['Servicehus', 'Annat'];

function renderAddPage(camp, locations, apiUrl, footerHtml = '', navSections = [], goatcounterCode = '') {
  const campName = escapeHtml(camp.name);
  const startDate = toDateString(camp.start_date);
  const endDate = toDateString(camp.end_date);
  const opensDate = toDateString(camp.opens_for_editing || startDate);
  // The add form locks once the last camp day passes: with no future camp day
  // left, the day grid is empty and there is nothing to add. So data-closes is
  // end_date itself, not the end_date + 1 server grace day used by the edit
  // form and the API (02-§26.6–26.8, §26.13).
  const closesDate = endDate;

  // "Annat" always last; deduplicate
  const locList = [
    ...(locations || DEFAULT_LOCATIONS).filter((l) => l !== 'Annat'),
    'Annat',
  ];

  const locationOptions = locList
    .map((l) => `            <option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`)
    .join('\n');

  const days = campDayButtons(startDate, endDate);
  const dayBtns = days
    .map((d) => `          <button type="button" class="day-btn" data-date="${d.isoDate}">${d.label}</button>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Lägg till aktivitet – ${campName}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
</head>
<body>
${pageNav('lagg-till.html', navSections)}
<main>
  <h1>Lägg till aktivitet</h1>
  <p class="intro">Kolla <a href="lokaler.html">lokalöversikten</a> för lediga tider (eller <a href="schema.html">hela schemat</a> för detaljer) innan du lägger till din aktivitet.</p>
  <p class="intro">Behöver du material eller ingredienser till din aktivitet? Kontakta Andreas i förväg så ordnar han det.</p>
  <p class="intro" id="cookie-info">När du skickat in kan du redigera din aktivitet efteråt – vi frågar om lov att spara ett tillfälligt ID i webbläsaren så att vi vet att aktiviteten är din. ID:t försvinner automatiskt efter 7 dagar.</p>

  <form id="event-form" class="event-form" novalidate data-api-url="${escapeHtml(apiUrl || '/add-event')}" data-opens="${opensDate}" data-closes="${closesDate}">

    <fieldset>

      <div class="field">
        <label for="f-title">Rubrik <span class="req">*</span></label>
        <input type="text" id="f-title" name="title" autocomplete="off" required maxlength="80" aria-describedby="err-title">
        <span class="field-error" id="err-title" hidden></span>
      </div>

      <div class="field">
        <label>Datum <span class="req">*</span></label>
        <span class="field-info">För återkommande aktivitet — välj flera dagar.</span>
        <div class="day-grid" data-start="${startDate}" data-end="${endDate}" data-page-size="8">
${dayBtns}
        </div>
        <input type="hidden" id="f-date" name="date" aria-describedby="err-date">
        <span class="field-error" id="err-date" hidden></span>
      </div>

      <div class="field-row">
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
        <textarea id="f-description" name="description" rows="4" maxlength="2000" placeholder="Beskriv aktiviteten, vad behövs, vad händer..."></textarea>
        <section class="md-preview" aria-live="polite" aria-label="Förhandsgranskning av beskrivning" hidden>
          <div class="md-preview-header"><span class="md-preview-label">Förhandsgranskning</span><span class="md-help">Ser det inte ut som du tänkt dig? Kolla <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">Markdown-guiden ↗</a></span></div>
          <div class="md-preview-content"></div>
        </section>
      </div>

      <div class="field">
        <label for="f-link">Länk <span class="opt">(valfritt)</span></label>
        <input type="url" id="f-link" name="link" maxlength="500" placeholder="https://..." aria-describedby="err-link">
        <span class="field-error" id="err-link" hidden></span>
      </div>

    </fieldset>

    <button type="submit" class="btn-primary">Skicka →</button>

  </form>

  <div id="submit-modal" class="submit-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" hidden>
    <div class="modal-backdrop"></div>
    <div class="modal-box">
      <h2 id="modal-heading" class="modal-heading" tabindex="-1"></h2>
      <div id="modal-content" class="modal-content"></div>
    </div>
  </div>
</main>
  <script src="wp-cleanup.js"></script>
  <script src="cookie-consent.js"></script>
  <script src="markdown-toolbar.js"></script>
  <script defer src="marked.umd.js"></script>
  <script defer src="markdown-renderers.js"></script>
  <script defer src="markdown-preview.js"></script>
  <script src="offline-guard.js"></script>
  <script src="conflict-check.js"></script>
  <script src="lagg-till.js"></script>
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

module.exports = { renderAddPage };
