'use strict';

const { pageNav, pageFooter } = require('./layout');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');

function renderAdminPage(camp, footerHtml = '', navSections = [], goatcounterCode = '') {
  const nav = pageNav('', navSections);
  const footer = pageFooter(footerHtml);
  const pwa = pwaHeadTags();
  const analytics = goatcounterScript(goatcounterCode);

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Bakom kulisserna – ${camp.name || 'SB Sommar'}</title>
  <link rel="stylesheet" href="style.css">
${pwa}
</head>
<body>
${nav}
  <main>
    <h1>Bakom kulisserna</h1>
    <p class="admin-intro">Här aktiverar du din token. Vilka aktiviteter du kan ändra beror på vilken token du har.</p>
    <div id="admin-form" class="admin-form">
      <p id="admin-message" class="admin-message" aria-live="polite" hidden></p>
      <form id="admin-activate">
        <label for="admin-token">Ange din token</label>
        <input type="text" id="admin-token" name="token" required autocomplete="off" placeholder="namn_roll_epoch_signatur">
        <button type="submit" class="btn btn--primary">Aktivera</button>
      </form>
      <button type="button" id="admin-remove" class="btn btn--secondary admin-remove" hidden>Ta bort min token</button>
    </div>
    <div id="mint-section" class="admin-form" hidden>
      <h2>Skapa token-länk</h2>
      <p class="admin-intro">Skapa en aktiveringslänk för en ny token och dela den med mottagaren. Superadmin kan inte skapas här.</p>
      <p id="mint-message" class="admin-message" aria-live="polite" hidden></p>
      <form id="mint-form">
        <label for="mint-name">Namn på mottagaren</label>
        <input type="text" id="mint-name" name="name" required autocomplete="off">
        <label for="mint-role">Roll</label>
        <select id="mint-role" name="role">
          <option value="admin" data-days="60">Admin (max 60 dagar)</option>
          <option value="early" data-days="90">Tidig åtkomst (max 90 dagar)</option>
        </select>
        <label for="mint-days">Giltighetstid (dagar)</label>
        <input type="number" id="mint-days" name="days" min="1" max="60" value="60" required>
        <button type="submit" class="btn btn--primary">Skapa länk</button>
      </form>
      <div id="mint-result" class="mint-result" hidden>
        <label for="mint-link">Aktiveringslänk – dela privat med mottagaren</label>
        <input type="text" id="mint-link" readonly>
        <div class="mint-actions">
          <button type="button" id="mint-copy" class="btn btn--secondary">Kopiera länken</button>
          <button type="button" id="mint-share" class="btn btn--secondary" hidden>Dela …</button>
        </div>
      </div>
    </div>
  </main>
${footer}
  <script src="admin.js"></script>
  <script src="nav.js"></script>
  <script src="feedback.js"></script>
  <script src="sw-register.js"></script>
${analytics}
</body>
</html>`;
}

module.exports = { renderAdminPage };
