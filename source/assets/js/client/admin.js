(function () {
  'use strict';

  var STORAGE_KEY = 'sb_admin';

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getAdminData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // Extract epoch (seconds) from a token. Format: namn_roll_epoch_sig — the
  // epoch is the third underscore-segment (the base64url sig may contain
  // underscores, so we read by position rather than from the end).
  function extractExpiry(token) {
    if (!token || typeof token !== 'string') return 0;
    var parts = token.split('_');
    if (parts.length < 4) return 0;
    var n = Number(parts[2]);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function isExpired(data) {
    if (!data || !data.token) return true;
    var expiry = extractExpiry(data.token);
    if (expiry === 0) return true;
    return Math.floor(Date.now() / 1000) > expiry;
  }

  // ── Footer status icon ─────────────────────────────────────────────────────
  // Runs on every page that includes this script (via the footer).

  function renderFooterIcon() {
    var container = document.getElementById('admin-status');
    if (!container) return;

    var data = getAdminData();
    if (!data) {
      // No token → show nothing (02-§91.20)
      container.innerHTML = '';
      return;
    }

    if (isExpired(data)) {
      // Expired → open lock, link to /admin.html (02-§91.22)
      container.innerHTML = '<a href="token.html" class="admin-icon admin-icon--expired" title="Token utgången — efterfråga ny">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>' +
        '<path d="M7 11V7a5 5 0 0 1 9.9-1"/>' +
        '</svg></a>';
    } else {
      // Valid → filled lock, link to admin page (02-§91.21)
      container.innerHTML = '<a href="token.html" class="admin-icon admin-icon--active" title="Token aktiv">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>' +
        '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
        '</svg></a>';
    }
  }

  // ── Activation form (only on /admin.html) ──────────────────────────────────

  var wrapper = document.getElementById('admin-form');
  var form = document.getElementById('admin-activate');
  if (wrapper && form) {
    var input = document.getElementById('admin-token');
    var message = document.getElementById('admin-message');
    var removeBtn = document.getElementById('admin-remove');

    // Pre-fill status if already activated
    var existing = getAdminData();

    if (existing && !isExpired(existing)) {
      var expiry = extractExpiry(existing.token);
      var expiryDate = expiry ? new Date(expiry * 1000).toLocaleDateString('sv-SE') : '';
      var activatedAt = existing.activated ? new Date(existing.activated).toLocaleString('sv-SE') : '';
      message.textContent = 'Din token är aktiv' + (expiryDate ? ' till ' + expiryDate : '')
        + (activatedAt ? ' (aktiverad ' + activatedAt + ')' : '')
        + '. Du kan byta genom att ange en ny token nedan.';
      message.hidden = false;
      message.classList.add('admin-message--success');
    } else if (existing && isExpired(existing)) {
      message.textContent = 'Din token har gått ut. Efterfråga en ny token och aktivera den här.';
      message.hidden = false;
      message.classList.add('admin-message--error');
    }

    // Show remove button when a token exists (active or expired)
    if (existing && removeBtn) {
      removeBtn.hidden = false;
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        localStorage.removeItem(STORAGE_KEY);
        message.textContent = 'Token borttagen.';
        message.className = 'admin-message admin-message--success';
        message.hidden = false;
        removeBtn.hidden = true;
        renderFooterIcon();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var token = (input.value || '').trim();
      if (!token) return;

      message.hidden = true;
      message.classList.remove('admin-message--success', 'admin-message--error');

      // Derive API URL from the page's API configuration
      var apiBase = '';
      var feedbackBtn = document.querySelector('.feedback-btn[data-api-url]');
      if (feedbackBtn) {
        apiBase = feedbackBtn.dataset.apiUrl.replace(/\/feedback$/, '');
      }
      var verifyUrl = apiBase ? apiBase + '/verify-admin' : '/verify-admin';

      fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token }),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.valid) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              token: token,
              activated: Date.now(),
            }));
            message.textContent = 'Token aktiverad ' + new Date().toLocaleString('sv-SE') + '.';
            message.classList.add('admin-message--success');
            message.hidden = false;
            if (removeBtn) removeBtn.hidden = false;
            renderFooterIcon();
          } else {
            message.textContent = data.error || 'Ogiltig token. Försök igen.';
            message.classList.add('admin-message--error');
            message.hidden = false;
          }
        })
        .catch(function () {
          message.textContent = 'Kunde inte verifiera token. Kontrollera din anslutning.';
          message.classList.add('admin-message--error');
          message.hidden = false;
        });
    });
  }

  // Run footer icon on page load
  renderFooterIcon();
})();
