(function () {
  'use strict';

  var COOKIE_NAME = 'sb_session';

  var loadingEl    = document.getElementById('edit-loading');
  var errorEl      = document.getElementById('edit-error');
  var errorMsg     = document.getElementById('edit-error-msg');
  var sectionEl    = document.getElementById('edit-section');
  var noSessionEl  = document.getElementById('edit-no-session');
  var myEventsEl   = document.getElementById('edit-my-events');
  var myEventsList = document.getElementById('my-events-list');
  var myEventsEmpty = document.getElementById('my-events-empty');
  var myEventsNote  = document.getElementById('my-events-note');
  var form         = document.getElementById('edit-form');
  var fieldset     = form ? form.querySelector('fieldset') : null;
  var submitBtn    = form ? form.querySelector('button[type="submit"]') : null;
  var deleteBtn    = document.getElementById('btn-delete');
  var deleteDialog = document.getElementById('delete-confirm');
  var deleteTitle  = document.getElementById('delete-confirm-title');
  var deleteYes    = document.getElementById('delete-confirm-yes');
  var deleteNo     = document.getElementById('delete-confirm-no');
  var modal        = document.getElementById('submit-modal');
  var modalHeading = document.getElementById('modal-heading');
  var modalContent = document.getElementById('modal-content');
  var debugContent = document.getElementById('cookie-debug-content');

  // Read the cookie domain from <body> to match session.js write-back (02-§90.12).
  var cookieDomain = (document.body.dataset.cookieDomain || '').trim();
  var domainPart = cookieDomain ? '; Domain=' + cookieDomain : '';

  // ── Utility ──────────────────────────────────────────────────────────────────

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────────

  var preFocusEl = null;

  function getFocusable() {
    return Array.from(
      modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    );
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusable = getFocusable();
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  function openModal() {
    preFocusEl = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.addEventListener('keydown', trapFocus);
    var focusable = getFocusable();
    if (focusable.length) { focusable[0].focus(); } else { modalHeading.focus(); }
  }

  function focusFirstInModal() {
    var focusable = getFocusable();
    if (focusable.length) focusable[0].focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    modal.removeEventListener('keydown', trapFocus);
    if (preFocusEl) preFocusEl.focus();
  }

  // ── Progress steps (02-§53.6–53.11) ─────────────────────────────────────────

  var PROGRESS_STEPS = [
    { text: 'Skickar till servern\u2026', delay: 0 },
    { text: 'Kontrollerar aktiviteten\u2026', delay: 500 },
    { text: 'Sparar aktiviteten\u2026', delay: 2000 },
  ];

  var progressTimers = [];

  function buildProgressHtml() {
    var html = '<ul class="submit-progress" role="status" aria-live="polite">';
    for (var i = 0; i < PROGRESS_STEPS.length; i++) {
      html += '<li class="progress-step" id="progress-step-' + i + '">' +
        '<span class="step-icon" aria-hidden="true">\u25CB</span> ' +
        '<span class="step-text">' + PROGRESS_STEPS[i].text + '</span></li>';
    }
    html += '</ul>';
    return html;
  }

  function activateStep(index) {
    var el = document.getElementById('progress-step-' + index);
    if (!el) return;
    el.classList.add('step-active');
    el.querySelector('.step-icon').textContent = '\u25C9';
  }

  function completeStep(index) {
    var el = document.getElementById('progress-step-' + index);
    if (!el) return;
    el.classList.remove('step-active');
    el.classList.add('step-done');
    el.querySelector('.step-icon').textContent = '\u2713';
  }

  function completeAllSteps() {
    for (var i = 0; i < PROGRESS_STEPS.length; i++) {
      completeStep(i);
    }
  }

  function clearProgressTimers() {
    for (var i = 0; i < progressTimers.length; i++) {
      clearTimeout(progressTimers[i]);
    }
    progressTimers = [];
  }

  // ── Modal states ──────────────────────────────────────────────────────────────

  function setModalLoading() {
    modalHeading.textContent = 'Sparar\u2026';
    modalContent.innerHTML = buildProgressHtml();
    activateStep(0);

    for (var i = 1; i < PROGRESS_STEPS.length; i++) {
      (function (prev, curr, delay) {
        progressTimers.push(setTimeout(function () {
          completeStep(prev);
          activateStep(curr);
        }, delay));
      })(i - 1, i, PROGRESS_STEPS[i].delay);
    }

    openModal();
  }

  function setModalSuccess(title) {
    clearProgressTimers();
    completeAllSteps();
    modalHeading.textContent = 'Aktiviteten är uppdaterad!';
    modalContent.innerHTML =
      '<p class="intro"><strong>' + escHtml(title) + '</strong>' +
      ' syns i schemat om ungefär en minut.</p>' +
      '<div class="success-actions">' +
        '<a href="schema.html" class="btn-primary">Gå till schemat →</a>' +
      '</div>';
    focusFirstInModal();
  }

  function setModalError(message) {
    clearProgressTimers();
    modalHeading.textContent = 'Något gick fel';
    modalContent.innerHTML =
      '<p class="form-error-msg">' + escHtml(message) + '</p>' +
      '<button id="modal-retry-btn" class="btn-primary">Försök igen</button>';
    focusFirstInModal();
    document.getElementById('modal-retry-btn').addEventListener('click', function () {
      closeModal();
      unlock();
      submitBtn.focus();
    });
  }

  // ── Form lock / unlock ────────────────────────────────────────────────────────

  function lock() {
    fieldset.disabled = true;
    submitBtn.disabled = true;
  }

  function unlock() {
    fieldset.disabled = false;
    submitBtn.disabled = false;
  }

  // ── Cookie helper ────────────────────────────────────────────────────────────

  function entryId(entry) {
    if (typeof entry === 'string' && entry.length > 0) return entry;
    if (entry && typeof entry === 'object' && typeof entry.id === 'string' && entry.id.length > 0) {
      return entry.id;
    }
    return null;
  }

  function normalizeEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.filter(function (entry) { return entryId(entry); });
  }

  function entryIds(entries) {
    return normalizeEntries(entries).map(entryId);
  }

  function isSignedEntry(entry) {
    return Boolean(
      entry &&
      typeof entry === 'object' &&
      typeof entry.id === 'string' &&
      entry.id.length > 0 &&
      typeof entry.exp === 'number' &&
      isFinite(entry.exp) &&
      entry.exp >= Math.floor(Date.now() / 1000) &&
      typeof entry.sig === 'string' &&
      entry.sig.length > 0,
    );
  }

  function signedEntryIds(entries) {
    return normalizeEntries(entries)
      .filter(isSignedEntry)
      .map(entryId);
  }

  function readSessionEntries() {
    var pairs = document.cookie.split(';');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].trim();
      if (pair.indexOf(COOKIE_NAME + '=') === 0) {
        try {
          var raw = pair.slice(COOKIE_NAME.length + 1);
          var parsed = JSON.parse(decodeURIComponent(raw));
          if (Array.isArray(parsed)) return normalizeEntries(parsed);
        } catch { /* ignore */ }
        return [];
      }
    }
    return [];
  }

  function readSessionIds() {
    return signedEntryIds(readSessionEntries());
  }

  // ── Admin token helper (02-§7.3) ─────────────────────────────────────────────

  function getAdminToken() {
    try {
      var raw = localStorage.getItem('sb_admin');
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.token || typeof data.token !== 'string') return null;
      // Token format: namn_roll_epoch_sig — the epoch is the third segment
      // (the base64url signature may contain underscores, so read by position).
      var parts = data.token.split('_');
      if (parts.length < 4) return null;
      var epoch = Number(parts[2]);
      if (!isFinite(epoch) || epoch <= 0) return null;
      return Math.floor(Date.now() / 1000) <= epoch ? data.token : null;
    } catch {
      return null;
    }
  }

  // The role is the second segment of the token (namn_roll_epoch_sig).
  function tokenRole(token) {
    if (!token) return null;
    return token.split('_')[1] || null;
  }

  var adminToken = getAdminToken();
  // Only admin-equivalent roles skip the ownership check; an early-access
  // token bypasses the pre-camp gate but never ownership (02-§105.9). The
  // server re-verifies the role either way.
  var hasAdminRole = tokenRole(adminToken) === 'admin' || tokenRole(adminToken) === 'superadmin';

  // ── Error display ────────────────────────────────────────────────────────────

  function showError(msg) {
    loadingEl.hidden = true;
    errorMsg.textContent = msg || 'Aktiviteten kunde inte laddas.';
    errorEl.hidden = false;
  }

  // ── URL param helper ─────────────────────────────────────────────────────────

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // ── Pre-populate form ────────────────────────────────────────────────────────

  function populate(event) {
    var els = form.elements;
    els.id.value = event.id || '';
    els.title.value = event.title || '';
    els.date.value = event.date || '';
    els.start.value = event.start || '';
    els.end.value = event.end || '';
    els.location.value = event.location || '';
    els.responsible.value = event.responsible || '';
    els.description.value = event.description || '';
    els.link.value = event.link || '';

    // Trigger preview update after populating description (02-§58.1)
    els.description.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ── Time-gating (02-§26.9, §26.14–§26.19) ──────────────────────────────────

  var gateBlocked = false;

  if (form) {
    var opensDate = form.dataset.opens;
    var closesDate = form.dataset.closes;

    if (opensDate && closesDate) {
      var todayGate = new Date().toISOString().slice(0, 10);
      if (todayGate < opensDate || todayGate > closesDate) {
        var isBeforeOpens = todayGate < opensDate;
        var gateMsg = document.createElement('div');
        gateMsg.className = 'form-gate-msg';
        if (isBeforeOpens) {
          var parts = opensDate.split('-');
          var months = ['januari','februari','mars','april','maj','juni',
                        'juli','augusti','september','oktober','november','december'];
          var formatted = parseInt(parts[2], 10) + ' ' + months[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
          gateMsg.textContent = 'Formuläret öppnar den ' + formatted + '.';
        } else {
          gateMsg.textContent = 'Lägret är avslutat.';
        }
        loadingEl.hidden = true;
        // Dedicated gate banner — do not reuse errorEl since it also carries
        // the "Tillbaka till schemat" link used by other error flows.
        sectionEl.parentNode.insertBefore(gateMsg, sectionEl);
        gateBlocked = true;

        // Pre-camp bypass button — only before opens, for any valid token
        // role (02-§26.16, 02-§105.8)
        if (isBeforeOpens && adminToken) {
          var bypassBtn = document.createElement('button');
          bypassBtn.type = 'button';
          bypassBtn.className = 'form-gate-bypass';
          bypassBtn.textContent = tokenRole(adminToken) === 'early'
            ? 'Öppna ändå (tidig åtkomst)'
            : 'Öppna ändå (admin)';
          bypassBtn.addEventListener('click', function () {
            gateMsg.hidden = true;
            bypassBtn.hidden = true;
            loadingEl.hidden = false;
            runInit();
          });
          // Insert on its own row directly below the banner (02-§26.20).
          gateMsg.parentNode.insertBefore(bypassBtn, gateMsg.nextSibling);
        }

        // Still render cookie debug panel even while gated.
        fetch('/events.json')
          .then(function (r) { return r.json(); })
          .then(function (events) { renderDebugPanel(events); })
          .catch(function () { renderDebugPanel(null); });
      }
    }
  }

  // ── Event list helper (02-§48.13–48.18) ─────────────────────────────────────

  function renderMyEvents(events, ownedIds, today) {
    var editable = [];
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      if (ownedIds.indexOf(ev.id) !== -1 && ev.date >= today) {
        editable.push(ev);
      }
    }
    if (editable.length === 0) {
      if (myEventsEmpty) myEventsEmpty.hidden = false;
      if (myEventsList) myEventsList.hidden = true;
      return editable;
    }
    if (myEventsEmpty) myEventsEmpty.hidden = true;
    if (myEventsList) {
      myEventsList.innerHTML = '';
      for (var j = 0; j < editable.length; j++) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = 'redigera.html?id=' + encodeURIComponent(editable[j].id);
        a.textContent = editable[j].title;
        li.appendChild(a);
        myEventsList.appendChild(li);
      }
      myEventsList.hidden = false;
    }
    if (myEventsNote) myEventsNote.hidden = false;
    return editable;
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function runInit() {
    var eventId = getParam('id');
    var today = new Date().toISOString().slice(0, 10);
    var ownedIds = readSessionIds();

    if (!eventId) {
      // No specific event selected — show browse mode
      loadingEl.hidden = true;

      if (ownedIds.length === 0) {
        // No cookie — show explanation (02-§48.8)
        if (noSessionEl) noSessionEl.hidden = false;
        // Still render debug panel (shows "no cookie" state).
        fetch('/events.json')
          .then(function (r) { return r.json(); })
          .then(function (events) { renderDebugPanel(events); })
          .catch(function () { renderDebugPanel(null); });
        return;
      }

      // Has cookie — fetch events and show list (02-§48.13)
      if (myEventsEl) myEventsEl.hidden = false;
      fetch('/events.json')
        .then(function (r) { return r.json(); })
        .then(function (events) {
          renderMyEvents(events, ownedIds, today);
          renderDebugPanel(events);
        })
        .catch(function () {
          if (myEventsEmpty) myEventsEmpty.textContent = 'Kunde inte hämta schemadata.';
          renderDebugPanel(null);
        });
      return;
    }

    // Specific event selected — existing edit behaviour (02-§48.17)
    // Authorised if event ID is in session cookie OR the stored token has an
    // admin-equivalent role — early gives no ownership bypass (02-§7.3,
    // 02-§105.9).
    if (ownedIds.indexOf(eventId) === -1 && !hasAdminRole) {
      showError('Du har inte rättighet att redigera denna aktivitet.');
      fetch('/events.json')
        .then(function (r) { return r.json(); })
        .then(function (events) { renderDebugPanel(events); })
        .catch(function () { renderDebugPanel(null); });
      return;
    }

    // Fetch events.json to verify the event exists and hasn't passed.
    fetch('/events.json')
      .then(function (r) { return r.json(); })
      .then(function (events) {
        var event = null;
        for (var i = 0; i < events.length; i++) {
          if (events[i].id === eventId) { event = events[i]; break; }
        }

        if (!event) {
          showError('Aktiviteten hittades inte i det aktuella schemat.');
          renderDebugPanel(events);
          return;
        }

        if (event.date < today) {
          showError('Aktiviteten har redan ägt rum och kan inte redigeras.');
          renderDebugPanel(events);
          return;
        }

        // Show event list above form if user has other events (02-§48.18)
        if (myEventsEl) {
          var editable = renderMyEvents(events, ownedIds, today);
          if (editable.length > 0) myEventsEl.hidden = false;
        }

        populate(event);
        loadingEl.hidden = true;
        sectionEl.hidden = false;
        renderDebugPanel(events);
        eventsCache = events;
        scheduleConflictCheck();
      })
      .catch(function () {
        showError('Kunde inte hämta schemadata. Kontrollera din internetanslutning.');
        renderDebugPanel(null);
      });
  }

  if (!gateBlocked) runInit();

  // ── Per-field inline errors (02-§6.5) ──────────────────────────────────────

  function setFieldError(name, message) {
    var input = form.querySelector('#f-' + name);
    var span  = document.getElementById('err-' + name);
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      span.className = 'field-error';
      span.textContent = message;
      span.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      span.className = 'field-error';
      span.textContent = '';
      span.hidden = true;
    }
  }

  function timeToMinutes(hhmm) {
    var parts = hhmm.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  // Returns { state: 'ok'|'info'|'error', message: string|null }
  function checkEndTime(startVal, endVal) {
    if (endVal === startVal) return { state: 'error', message: 'Sluttid måste vara efter starttid.' };
    if (endVal > startVal) return { state: 'ok', message: null };
    var dur = (1440 - timeToMinutes(startVal)) + timeToMinutes(endVal);
    if (dur <= 1020) return { state: 'info', message: 'Tolkas som att aktiviteten slutar nästa dag.' };
    return { state: 'error', message: 'Aktiviteten verkar vara för lång. Kontrollera start- och sluttid.' };
  }

  function clearAllErrors() {
    var fields = ['title', 'date', 'start', 'end', 'location', 'responsible'];
    for (var i = 0; i < fields.length; i++) { setFieldError(fields[i], null); }
  }

  // ── Character counters (02-§82) ──────────────────────────────────────────────

  var COUNTER_FIELDS = ['title', 'responsible', 'description', 'link'];

  function initCounter(name) {
    var input = form.querySelector('#f-' + name);
    if (!input) return;
    var max = parseInt(input.getAttribute('maxlength'), 10);
    if (!max) return;

    var counter = document.createElement('span');
    counter.className = 'char-counter';
    counter.hidden = true;
    input.parentNode.insertBefore(counter, input.nextSibling);

    function update() {
      var len = input.value.length;
      var ratio = len / max;
      if (ratio < 0.7) {
        counter.hidden = true;
        return;
      }
      counter.hidden = false;
      counter.textContent = len + ' / ' + max;
      if (ratio >= 0.9) {
        counter.classList.add('warn');
      } else {
        counter.classList.remove('warn');
      }
    }

    input.addEventListener('input', update);
    update(); // in case of pre-populated values
  }

  if (form) COUNTER_FIELDS.forEach(initCounter);

  // ── Form submission ──────────────────────────────────────────────────────────

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors();

      var els         = form.elements;
      var title       = els.title.value.trim();
      var date        = els.date.value;
      var start       = els.start.value;
      var end         = els.end.value;
      var location    = els.location.value;
      var responsible = els.responsible.value.trim();

      var submitToday = new Date().toISOString().slice(0, 10);
      var hasError = false;
      var firstInvalid = null;

      function fail(name, msg) {
        setFieldError(name, msg);
        hasError = true;
        if (!firstInvalid) firstInvalid = form.querySelector('#f-' + name);
      }

      if (!title)              fail('title', 'Rubrik är obligatoriskt.');
      if (!date)               fail('date', 'Datum är obligatoriskt.');
      else if (date < submitToday) fail('date', 'Datum kan inte vara i det förflutna.');
      if (!start)              fail('start', 'Starttid är obligatorisk.');
      if (!end)                fail('end', 'Sluttid är obligatorisk.');
      else if (start) {
        var endResult = checkEndTime(start, end);
        if (endResult.state === 'error') fail('end', endResult.message);
      }
      if (!location)    fail('location', 'Plats är obligatoriskt.');
      if (!responsible) fail('responsible', 'Ansvarig är obligatoriskt.');

      if (hasError) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      lock();
      setModalLoading();

      var editBody = {
          id:          els.id.value,
          title:       title,
          date:        date,
          start:       start,
          end:         end,
          location:    location,
          responsible: responsible,
          description: els.description.value,
          link:        els.link.value.trim(),
        };
      if (adminToken) editBody.adminToken = adminToken;

      fetch(form.dataset.apiUrl || '/edit-event', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editBody),
      })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (!json.success) {
            setModalError(json.error || 'Något gick fel.');
            return;
          }
          setModalSuccess(title);
        })
        .catch(function () {
          setModalError('Något gick fel. Kontrollera din internetanslutning och försök igen.');
        });
    });
  }

  // ── Delete flow (02-§89) ──────────────────────────────────────────────────

  var DELETE_PROGRESS_STEPS = [
    { text: 'Skickar till servern\u2026', delay: 0 },
    { text: 'Kontrollerar aktiviteten\u2026', delay: 500 },
    { text: 'Raderar aktiviteten\u2026', delay: 2000 },
  ];

  function buildDeleteProgressHtml() {
    var html = '<ul class="submit-progress" role="status" aria-live="polite">';
    for (var i = 0; i < DELETE_PROGRESS_STEPS.length; i++) {
      html += '<li class="progress-step" id="del-progress-step-' + i + '">' +
        '<span class="step-icon" aria-hidden="true">\u25CB</span> ' +
        '<span class="step-text">' + DELETE_PROGRESS_STEPS[i].text + '</span></li>';
    }
    html += '</ul>';
    return html;
  }

  function activateDelStep(index) {
    var el = document.getElementById('del-progress-step-' + index);
    if (!el) return;
    el.classList.add('step-active');
    el.querySelector('.step-icon').textContent = '\u25C9';
  }

  function completeDelStep(index) {
    var el = document.getElementById('del-progress-step-' + index);
    if (!el) return;
    el.classList.remove('step-active');
    el.classList.add('step-done');
    el.querySelector('.step-icon').textContent = '\u2713';
  }

  function completeAllDelSteps() {
    for (var i = 0; i < DELETE_PROGRESS_STEPS.length; i++) {
      completeDelStep(i);
    }
  }

  function openDeleteConfirm() {
    if (!form) return;
    var title = form.elements.title.value || '';
    if (deleteTitle) deleteTitle.textContent = title;
    preFocusEl = document.activeElement;
    deleteDialog.hidden = false;
    document.body.classList.add('modal-open');
    deleteDialog.addEventListener('keydown', trapDeleteFocus);
    if (deleteNo) deleteNo.focus();
  }

  function closeDeleteConfirm() {
    deleteDialog.hidden = true;
    document.body.classList.remove('modal-open');
    deleteDialog.removeEventListener('keydown', trapDeleteFocus);
    if (preFocusEl) preFocusEl.focus();
  }

  function trapDeleteFocus(e) {
    if (e.key === 'Escape') { closeDeleteConfirm(); return; }
    if (e.key !== 'Tab') return;
    var focusable = Array.from(
      deleteDialog.querySelectorAll('button:not([disabled])'),
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  function setDeleteModalLoading() {
    closeDeleteConfirm();
    modalHeading.textContent = 'Raderar\u2026';
    modalContent.innerHTML = buildDeleteProgressHtml();
    activateDelStep(0);

    for (var i = 1; i < DELETE_PROGRESS_STEPS.length; i++) {
      (function (prev, curr, delay) {
        progressTimers.push(setTimeout(function () {
          completeDelStep(prev);
          activateDelStep(curr);
        }, delay));
      })(i - 1, i, DELETE_PROGRESS_STEPS[i].delay);
    }

    openModal();
  }

  function setDeleteModalSuccess(title) {
    clearProgressTimers();
    completeAllDelSteps();
    modalHeading.textContent = 'Aktiviteten är raderad!';
    modalContent.innerHTML =
      '<p class="intro"><strong>' + escHtml(title) + '</strong>' +
      ' har tagits bort från schemat.</p>' +
      '<div class="success-actions">' +
        '<a href="schema.html" class="btn-primary">Gå till schemat →</a>' +
      '</div>';
    focusFirstInModal();
  }

  function setDeleteModalError(message) {
    clearProgressTimers();
    modalHeading.textContent = 'Något gick fel';
    modalContent.innerHTML =
      '<p class="form-error-msg">' + escHtml(message) + '</p>' +
      '<button id="modal-retry-delete-btn" class="btn-primary">Försök igen</button>';
    focusFirstInModal();
    document.getElementById('modal-retry-delete-btn').addEventListener('click', function () {
      closeModal();
      if (deleteBtn) deleteBtn.focus();
    });
  }

  function removeIdFromCookie(idToRemove) {
    var entries = readSessionEntries().filter(function (entry) { return entryId(entry) !== idToRemove; });
    // Delete both cookie variants (with and without Domain) to avoid
    // orphaned duplicates — same pattern as repairDuplicateCookies (02-§90.9).
    document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; Secure; SameSite=Strict';
    if (domainPart) {
      document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; Secure; SameSite=Strict' + domainPart;
    }
    // Write back the cleaned list.
    if (entries.length) {
      var encoded = encodeURIComponent(JSON.stringify(entries));
      document.cookie = COOKIE_NAME + '=' + encoded +
        '; Path=/; Max-Age=604800; Secure; SameSite=Strict' + domainPart;
    }
  }

  function performDelete() {
    if (!form) return;
    var els = form.elements;
    var id = els.id.value;
    var title = els.title.value || '';
    var date = els.date.value || '';

    setDeleteModalLoading();

    var deleteBody = { id: id, date: date };
    if (adminToken) deleteBody.adminToken = adminToken;

    fetch(form.dataset.deleteUrl || '/delete-event', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deleteBody),
    })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (!json.success) {
          setDeleteModalError(json.error || 'Något gick fel.');
          return;
        }
        removeIdFromCookie(id);
        setDeleteModalSuccess(title);
      })
      .catch(function () {
        setDeleteModalError('Något gick fel. Kontrollera din internetanslutning och försök igen.');
      });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', openDeleteConfirm);
  }
  if (deleteYes) {
    deleteYes.addEventListener('click', performDelete);
  }
  if (deleteNo) {
    deleteNo.addEventListener('click', closeDeleteConfirm);
  }

  // ── Cookie debug panel (02-§90.1–90.6) ────────────────────────────────────

  function renderDebugPanel(eventsArray) {
    if (!debugContent) return;

    var isSecure = location.protocol === 'https:';
    var domain = cookieDomain || 'ej satt';
    var entries = readSessionEntries();
    var ids = entryIds(entries);
    var eventMap = {};
    if (Array.isArray(eventsArray)) {
      for (var i = 0; i < eventsArray.length; i++) {
        if (eventsArray[i] && eventsArray[i].id) {
          eventMap[eventsArray[i].id] = eventsArray[i];
        }
      }
    }

    var html = '';

    // Protocol warning
    if (!isSecure) {
      html += '<p class="cookie-debug-warn"><strong>Varning:</strong> Sidan laddas via HTTP. ' +
        'Cookien har <code>Secure</code>-flaggan och kan inte sparas utan HTTPS.</p>';
    }

    html += '<dl class="cookie-debug-list">';
    html += '<dt>Protokoll</dt><dd>' + (isSecure ? 'HTTPS' : 'HTTP') + '</dd>';
    html += '<dt>Cookie-domän</dt><dd>' + escHtml(domain) + '</dd>';
    html += '<dt>Antal lagrade aktiviteter</dt><dd>' + ids.length + '</dd>';
    html += '</dl>';

    if (ids.length > 0) {
      html += '<p class="cookie-debug-note">Aktiviteter vars datum har passerat rensas automatiskt ' +
        'från cookien och visas inte i listan nedan.</p>';
      html += '<table class="cookie-debug-table"><thead><tr>' +
        '<th>Aktivitets-ID</th><th>Status</th></tr></thead><tbody>';

      var debugToday = new Date().toISOString().slice(0, 10);
      for (var j = 0; j < ids.length; j++) {
        var id = ids[j];
        var isLegacy = typeof entries[j] === 'string';
        var isExpiredOwnership = !isLegacy && entries[j] && typeof entries[j].exp === 'number' &&
          entries[j].exp < Math.floor(Date.now() / 1000);
        var ev = eventMap[id];
        var status;
        if (isLegacy) {
          status = '<span class="cookie-status-unknown">gammal cookie – behöver läggas till igen för redigering</span>';
        } else if (isExpiredOwnership) {
          status = '<span class="cookie-status-expired">signaturen har gått ut</span>';
        } else if (!ev) {
          status = '<span class="cookie-status-unknown">hittades inte i schemat (kan vara under publicering)</span>';
        } else if (ev.date < debugToday) {
          status = '<span class="cookie-status-expired">passerat</span>';
        } else {
          status = '<span class="cookie-status-ok">finns i schemat</span>';
        }
        html += '<tr><td><code>' + escHtml(id) + '</code></td><td>' + status + '</td></tr>';
      }
      html += '</tbody></table>';
    } else {
      html += '<p>Ingen cookie hittades. Du behöver <a href="lagg-till.html">lägga till ' +
        'en aktivitet</a> och godkänna cookien för att kunna redigera.</p>';
    }

    debugContent.innerHTML = html;
  }

  // ── Conflict warning (02-§99.10–99.12) ───────────────────────────────────

  var CONFLICT = (typeof window !== 'undefined' && window.SBConflictCheck) || null;
  var eventsCache = null;
  var conflictBanner = null;
  var conflictDebounceTimer = null;

  function ensureConflictBanner() {
    if (conflictBanner) return conflictBanner;
    if (!form) return null;
    conflictBanner = document.createElement('div');
    conflictBanner.className = 'conflict-warning';
    conflictBanner.setAttribute('role', 'status');
    conflictBanner.setAttribute('aria-live', 'polite');
    conflictBanner.hidden = true;
    // Insert at the top of the form, before the first fieldset, so a clash
    // is visible between the "Redigera aktivitet" heading and the form
    // fields without the user needing to scroll to the submit button.
    var firstFieldset = form.querySelector('fieldset');
    if (firstFieldset && firstFieldset.parentNode) {
      firstFieldset.parentNode.insertBefore(conflictBanner, firstFieldset);
    } else if (submitBtn && submitBtn.parentNode) {
      submitBtn.parentNode.insertBefore(conflictBanner, submitBtn);
    }
    return conflictBanner;
  }

  function escapeConflictText(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderConflictList(conflicts) {
    var items = '';
    for (var i = 0; i < conflicts.length; i++) {
      var c = conflicts[i];
      items += '<li>'
        + '<span class="conflict-warning__time">' + escapeConflictText(c.start) + '–' + escapeConflictText(c.end) + '</span> '
        + '<span class="conflict-warning__title">' + escapeConflictText(c.title) + '</span> '
        + '<span class="conflict-warning__resp">(' + escapeConflictText(c.responsible) + ')</span>'
        + '</li>';
    }
    return items;
  }

  function renderConflicts(conflicts) {
    var banner = ensureConflictBanner();
    if (!banner) return;
    if (!conflicts || conflicts.length === 0) {
      banner.hidden = true;
      banner.innerHTML = '';
      return;
    }
    var lead = conflicts.length === 1
      ? 'Den här tiden och platsen krockar med en annan aktivitet:'
      : 'Den här tiden och platsen krockar med flera aktiviteter:';
    banner.innerHTML = '<p class="conflict-warning__lead">' + lead + '</p>'
      + '<ul class="conflict-warning__list">' + renderConflictList(conflicts) + '</ul>'
      + '<p class="conflict-warning__footer"><a href="lokaler.html">Se lokalöversikt →</a></p>';
    banner.hidden = false;
  }

  function maybeCheckConflicts() {
    if (!CONFLICT || !form || !eventsCache) return;
    var els = form.elements;
    var date = (els.date && els.date.value) || '';
    var start = (els.start && els.start.value) || '';
    var end = (els.end && els.end.value) || '';
    var location = (els.location && els.location.value) || '';
    var excludeId = (els.id && els.id.value) || undefined;
    if (!date || !start || !end || !location) { renderConflicts(null); return; }
    if (end <= start) { renderConflicts(null); return; }
    var conflicts = CONFLICT.findConflicts(
      { date: date, start: start, end: end, location: location },
      eventsCache,
      { excludeId: excludeId },
    );
    renderConflicts(conflicts);
  }

  function scheduleConflictCheck() {
    if (conflictDebounceTimer) clearTimeout(conflictDebounceTimer);
    conflictDebounceTimer = setTimeout(maybeCheckConflicts, 150);
  }

  if (form) {
    ['#f-date', '#f-start', '#f-end', '#f-location'].forEach(function (sel) {
      var el = form.querySelector(sel);
      if (el) el.addEventListener('change', scheduleConflictCheck);
    });
  }
})();
