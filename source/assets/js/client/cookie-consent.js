(function () {
  'use strict';

  var LS_KEY = 'sb_cookie_consent';

  // Returns 'accepted' or null. Declining is not persisted — the user will
  // be asked again next time, which allows them to change their mind.
  function getConsent() {
    try { return localStorage.getItem(LS_KEY); } catch { return null; }
  }

  function saveConsent() {
    try { localStorage.setItem(LS_KEY, 'accepted'); } catch { /* ignore */ }
  }

  // Show the consent prompt as a modal dialog using the existing
  // #submit-modal element. Calls callback(true) on accept, callback(false)
  // on decline.
  function showConsentModal(callback, modalApi) {
    modalApi.setHeading('Sessionscookie');
    modalApi.setContent(
      '<p>För att du ska kunna redigera din aktivitet senare behöver vi spara ett <strong>sessionscookie</strong> i din webbläsare. Det innehåller bara ett ID för din aktivitet och försvinner automatiskt efter ett halvår.</p>' +
      '<div class="cookie-consent-actions">' +
        '<button class="btn-primary" id="consent-accept">Ja, det är okej</button>' +
        '<button class="btn-secondary" id="consent-decline">Nej tack</button>' +
      '</div>',
    );
    modalApi.open();

    document.getElementById('consent-accept').addEventListener('click', function () {
      saveConsent();
      callback(true);
    });

    document.getElementById('consent-decline').addEventListener('click', function () {
      callback(false);
    });
  }

  // Public API used by lagg-till.js before submitting the form.
  // If the user has previously accepted, calls callback immediately.
  // Otherwise, shows the consent modal.
  //
  // modalApi must provide: { open(), setHeading(text), setContent(html) }
  window.SBConsentReady = function (callback, modalApi) {
    if (getConsent() === 'accepted') { callback(true); return; }
    showConsentModal(callback, modalApi);
  };
})();
