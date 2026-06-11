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

  // The role is the second segment of the token (namn_roll_epoch_sig).
  function tokenRole(token) {
    if (!token || typeof token !== 'string') return null;
    return token.split('_')[1] || null;
  }

  // Swedish description of what each role allows, shown in the active-token
  // status (02-§91.33). An unrecognised or missing role yields '' — the status
  // still renders, it simply omits the rights sentence. The server, not this
  // text, enforces every privilege.
  function roleDescription(role) {
    switch (role) {
      case 'superadmin':
        return 'Du kan ändra alla aktiviteter, öppna formuläret innan lägret öppnar och skapa nya token-länkar.';
      case 'admin':
        return 'Du kan ändra alla aktiviteter och öppna formuläret innan det öppnar för alla.';
      case 'early':
        return 'Du kan lägga till och ändra dina egna aktiviteter innan formuläret öppnar för alla.';
      default:
        return '';
    }
  }

  // Validate the mint form's fields (02-§106.19). Pure — returns Swedish
  // messages keyed by field, or null when valid. The recipient name is
  // required; the day count must be an integer within 1..max for the role.
  // Mirrors the add-activity form's per-field model (02-§6.5).
  function validateMintFields(fields) {
    var f = fields || {};
    var errors = { name: null, days: null };
    var name = (f.name == null ? '' : String(f.name)).trim();
    if (!name) errors.name = 'Namn är obligatoriskt.';
    var max = Number(f.max);
    var rawDays = f.days;
    var days = Number(rawDays);
    if (rawDays === '' || rawDays == null || !isFinite(days)) {
      errors.days = 'Giltighetstid är obligatorisk.';
    } else if (days % 1 !== 0 || days < 1 || (isFinite(max) && days > max)) {
      errors.days = 'Giltighetstiden måste vara 1–' + (isFinite(max) ? max : '') + ' dagar.';
    }
    return errors;
  }

  // Derive the API base URL from the page's API configuration.
  function apiBase() {
    var feedbackBtn = document.querySelector('.feedback-btn[data-api-url]');
    return feedbackBtn ? feedbackBtn.dataset.apiUrl.replace(/\/feedback$/, '') : '';
  }

  // ── Node export (tests) ─────────────────────────────────────────────────────
  // In Node there is no DOM: export the pure helpers and stop before any DOM
  // wiring runs. In the browser `document` exists, so this branch is skipped and
  // the page wiring below executes as normal. Mirrors markdown-toolbar.js.
  if (typeof document === 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = {
        roleDescription: roleDescription,
        tokenRole: tokenRole,
        extractExpiry: extractExpiry,
        isExpired: isExpired,
        validateMintFields: validateMintFields,
      };
    }
    return;
  }

  // ── Activation form (only on /token.html) ──────────────────────────────────

  var wrapper = document.getElementById('admin-form');
  var form = document.getElementById('admin-activate');
  if (wrapper && form) {
    var input = document.getElementById('admin-token');
    var message = document.getElementById('admin-message');
    var removeBtn = document.getElementById('admin-remove');

    // Pre-fill status if already activated
    var existing = getAdminData();

    // Render the active-token status into the message element: a bold
    // "Roll: <label>" title on top, then the body text below (02-§91.33).
    // The label and rights come from the token's role (namn_roll_epoch_sig);
    // an unrecognised role omits both the title and the rights sentence.
    // Used on load and after a successful activation so both lead with the
    // role. Built with DOM nodes, not innerHTML — no string is interpolated
    // into markup on this token-bearing page.
    var ROLE_LABELS = { superadmin: 'Superadmin', admin: 'Admin', early: 'Tidig åtkomst' };
    var setStatusWithRole = function (token, body) {
      var label = ROLE_LABELS[tokenRole(token)] || '';
      message.textContent = '';
      if (label) {
        var title = document.createElement('strong');
        title.className = 'admin-message-title';
        title.textContent = 'Roll: ' + label;
        message.appendChild(title);
      }
      message.appendChild(document.createTextNode(body));
    };

    if (existing && !isExpired(existing)) {
      var expiry = extractExpiry(existing.token);
      var expiryDate = expiry ? new Date(expiry * 1000).toLocaleDateString('sv-SE') : '';
      var activatedAt = existing.activated ? new Date(existing.activated).toLocaleString('sv-SE') : '';
      var rights = roleDescription(tokenRole(existing.token));
      setStatusWithRole(existing.token, 'Din token är aktiv'
        + (expiryDate ? ' till ' + expiryDate : '')
        + (activatedAt ? ' (aktiverad ' + activatedAt + ')' : '')
        + '.' + (rights ? ' ' + rights : '')
        + ' Du kan byta genom att ange en ny token nedan.');
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

    // ── Remove-token confirmation (02-§91.35) ─────────────────────────────────
    // "Ta bort min token" is destructive, so it opens a confirmation dialog
    // (the site's .submit-modal alertdialog, like delete-activity) instead of
    // removing the token on the first click. Focus moves to Avbryt on open and
    // is trapped; Escape or Avbryt keeps the token, "Ja, ta bort" removes it.
    var removeConfirm = document.getElementById('token-remove-confirm');
    var removeYes = document.getElementById('token-remove-yes');
    var removeNo = document.getElementById('token-remove-no');
    var preRemoveFocus = null;

    var closeRemoveConfirm = function () {
      if (!removeConfirm) return;
      removeConfirm.hidden = true;
      document.body.classList.remove('modal-open');
      removeConfirm.removeEventListener('keydown', trapRemoveFocus);
      if (preRemoveFocus) preRemoveFocus.focus();
    };

    var trapRemoveFocus = function (e) {
      if (e.key === 'Escape') { closeRemoveConfirm(); return; }
      if (e.key !== 'Tab' || !removeConfirm) return;
      var focusable = Array.prototype.slice.call(
        removeConfirm.querySelectorAll('button:not([disabled])'));
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    var openRemoveConfirm = function () {
      if (!removeConfirm) return;
      preRemoveFocus = document.activeElement;
      removeConfirm.hidden = false;
      document.body.classList.add('modal-open');
      removeConfirm.addEventListener('keydown', trapRemoveFocus);
      if (removeNo) removeNo.focus();
    };

    var performRemove = function () {
      localStorage.removeItem(STORAGE_KEY);
      closeRemoveConfirm();
      message.textContent = 'Token borttagen.';
      message.className = 'admin-message admin-message--success';
      message.hidden = false;
      removeBtn.hidden = true;
      renderFooterIcon();
      // The remove button is now hidden, so closeRemoveConfirm()'s focus
      // restore would land on a hidden element — move focus to the token
      // input instead, the natural next step (enter a new token).
      if (input) input.focus();
    };

    if (removeBtn) {
      removeBtn.addEventListener('click', openRemoveConfirm);
    }
    if (removeYes) removeYes.addEventListener('click', performRemove);
    if (removeNo) removeNo.addEventListener('click', closeRemoveConfirm);

    // Verify a token against the server and store it on success. Used by the
    // manual form and by activation links (02-§91.11–91.13, 02-§106.14).
    var activateToken = function (token) {
      message.hidden = true;
      message.classList.remove('admin-message--success', 'admin-message--error');

      var base = apiBase();
      var verifyUrl = base ? base + '/verify-admin' : '/verify-admin';

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
            var actRights = roleDescription(tokenRole(token));
            setStatusWithRole(token, 'Token aktiverad ' + new Date().toLocaleString('sv-SE') + '.'
              + (actRights ? ' ' + actRights : ''));
            message.classList.add('admin-message--success');
            message.hidden = false;
            if (removeBtn) removeBtn.hidden = false;
            renderFooterIcon();
            initMintSection();
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
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var token = (input.value || '').trim();
      if (!token) return;
      activateToken(token);
    });

    // ── Activation links (02-§106.14–106.16) ────────────────────────────────
    // The token arrives in the #fragment — never a ?query — so it is not
    // sent to the server or leaked via Referer. The fragment is cleared from
    // the address bar whether or not activation succeeds.
    var hashMatch = location.hash.match(/[#&]token=([^&]+)/);
    if (hashMatch) {
      var incoming = decodeURIComponent(hashMatch[1]);
      history.replaceState(null, '', location.pathname + location.search);
      input.value = incoming;
      activateToken(incoming);
    }
  }

  // ── Mint UI (only on /token.html, superadmin only — 02-§106.9–106.13) ──────
  // The role check decides visibility only; the server authorises every mint.
  // Runs at load and again after a successful activation, so a superadmin who
  // just activated sees the section without reloading.

  function initMintSection() {
    var mintSection = document.getElementById('mint-section');
    if (!mintSection || !mintSection.hidden) return;
    var mintData = getAdminData();
    if (!mintData || isExpired(mintData) || tokenRole(mintData.token) !== 'superadmin') return;
    mintSection.hidden = false;

    var mintForm = document.getElementById('mint-form');
    var mintMessage = document.getElementById('mint-message');
    var mintName = document.getElementById('mint-name');
    var mintRoleSel = document.getElementById('mint-role');
    var mintDays = document.getElementById('mint-days');
    var mintResult = document.getElementById('mint-result');
    var mintLink = document.getElementById('mint-link');
    var mintCopy = document.getElementById('mint-copy');

    var showMintMessage = function (text, ok) {
      mintMessage.textContent = text;
      mintMessage.className = 'admin-message ' + (ok ? 'admin-message--success' : 'admin-message--error');
      mintMessage.hidden = false;
    };

    // Per-field inline errors for the mint form, mirroring lagg-till.js's
    // model (02-§106.19, §6.5): field name → its input + #mint-err-<field>
    // span. The error clears as soon as the user edits the field.
    var MINT_FIELDS = { name: mintName, days: mintDays };
    var setMintFieldError = function (field, msg) {
      var el = MINT_FIELDS[field];
      var span = document.getElementById('mint-err-' + field);
      if (!el || !span) return;
      if (msg) {
        el.setAttribute('aria-invalid', 'true');
        span.textContent = msg;
        span.hidden = false;
      } else {
        el.removeAttribute('aria-invalid');
        span.textContent = '';
        span.hidden = true;
      }
    };
    Object.keys(MINT_FIELDS).forEach(function (field) {
      if (!MINT_FIELDS[field]) return;
      MINT_FIELDS[field].addEventListener('input', function () { setMintFieldError(field, null); });
    });

    // Role change updates the day field's default and maximum (02-§106.10).
    // Setting the value programmatically does not fire `input`, so clear any
    // stale days error here — the reset value is always valid for the role.
    mintRoleSel.addEventListener('change', function () {
      var opt = mintRoleSel.options[mintRoleSel.selectedIndex];
      var days = (opt && opt.dataset.days) || '60';
      mintDays.max = days;
      mintDays.value = days;
      setMintFieldError('days', null);
    });

    mintForm.addEventListener('submit', function (e) {
      e.preventDefault();
      mintMessage.hidden = true;
      mintResult.hidden = true;

      // Client-side validation with Swedish inline errors (02-§106.19) —
      // `novalidate` on the form suppresses the browser's native bubbles.
      var errors = validateMintFields({
        name: mintName.value,
        days: mintDays.value,
        max: Number(mintDays.max),
      });
      setMintFieldError('name', errors.name);
      setMintFieldError('days', errors.days);
      if (errors.name || errors.days) {
        (errors.name ? mintName : mintDays).focus();
        return;
      }

      // Read the stored token fresh on every mint, in case it was replaced
      // since the section was revealed. The server is the real gate.
      var stored = getAdminData() || {};

      var base = apiBase();
      fetch(base ? base + '/mint-token' : '/mint-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: stored.token,
          name: document.getElementById('mint-name').value,
          role: mintRoleSel.value,
          days: parseInt(mintDays.value, 10),
        }),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!data.success || !data.token) {
            showMintMessage(data.error || 'Kunde inte skapa token. Försök igen.', false);
            return;
          }
          // Activation link with the token in the fragment (02-§106.11, §106.16).
          mintLink.value = location.origin + '/token.html#token=' + encodeURIComponent(data.token);
          mintResult.hidden = false;
          showMintMessage('Länk skapad. Kopiera och dela den privat med mottagaren.', true);
        })
        .catch(function () {
          showMintMessage('Kunde inte skapa token. Kontrollera din anslutning.', false);
        });
    });

    mintCopy.addEventListener('click', function () {
      var fallbackCopy = function () {
        mintLink.select();
        try { document.execCommand('copy'); showMintMessage('Länken är kopierad.', true); } catch { /* ignore */ }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mintLink.value).then(function () {
          showMintMessage('Länken är kopierad.', true);
        }, fallbackCopy);
      } else {
        fallbackCopy();
      }
    });
  }

  initMintSection();

  // Run footer icon on page load
  renderFooterIcon();
})();
