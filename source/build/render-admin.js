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
