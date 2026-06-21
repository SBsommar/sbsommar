(function () {
  'use strict';

  var form         = document.getElementById('event-form');
  var fieldset     = form.querySelector('fieldset');
  var submitBtn    = form.querySelector('button[type="submit"]');
  var modal        = document.getElementById('submit-modal');
  var modalHeading = document.getElementById('modal-heading');
  var modalContent = document.getElementById('modal-content');

  // ── Auto-fill responsible from localStorage (02-§48.2) ────────────────────

  var responsibleInput = form.querySelector('#f-responsible');
  if (responsibleInput && !responsibleInput.value) {
    try {
      var savedResponsible = localStorage.getItem('sb_responsible');
      if (savedResponsible) responsibleInput.value = savedResponsible;
    } catch { /* localStorage may be unavailable */ }
  }

  // ── Form draft cache — restore from sessionStorage (02-§85.1, 02-§85.8) ──

  var DRAFT_KEY = 'sb_form_draft';

  function saveDraft() {
    try {
      var draft = {
        title:       (form.querySelector('#f-title') || {}).value || '',
        start:       (form.querySelector('#f-start') || {}).value || '',
        end:         (form.querySelector('#f-end') || {}).value || '',
        location:    (form.querySelector('#f-location') || {}).value || '',
        responsible: (form.querySelector('#f-responsible') || {}).value || '',
        description: (form.querySelector('#f-description') || {}).value || '',
        link:        (form.querySelector('#f-link') || {}).value || '',
        dates:       [],
      };
      var selected = form.querySelectorAll('.day-btn.selected');
      for (var i = 0; i < selected.length; i++) {
        draft.dates.push(selected[i].dataset.date);
      }
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch { /* sessionStorage may be unavailable */ }
  }

  function restoreDraft() {
    try {
      var raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      var draft = JSON.parse(raw);

      var fields = ['title', 'start', 'end', 'responsible', 'description', 'link'];
      for (var i = 0; i < fields.length; i++) {
        var el = form.querySelector('#f-' + fields[i]);
        if (el && draft[fields[i]]) el.value = draft[fields[i]];
      }

      // Restore location select
      var loc = form.querySelector('#f-location');
      if (loc && draft.location) {
        for (var j = 0; j < loc.options.length; j++) {
          if (loc.options[j].value === draft.location) {
            loc.value = draft.location;
            break;
          }
        }
      }

      // Restore day-grid selections (02-§85.9)
      if (draft.dates && draft.dates.length && dayGrid) {
        var btns = dayGrid.querySelectorAll('.day-btn');
        for (var k = 0; k < btns.length; k++) {
          if (draft.dates.indexOf(btns[k].dataset.date) !== -1) {
            btns[k].classList.add('selected');
          }
        }
        updateHiddenDate();
      }
    } catch { /* sessionStorage may be unavailable or data corrupt */ }
  }

  function clearDraft() {
    try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }

  // ── Dynamic cookie paragraph swap (02-§48.5–48.7) ─────────────────────────

  var cookieInfoEl = document.getElementById('cookie-info');
  if (cookieInfoEl) {
    try {
      if (localStorage.getItem('sb_cookie_consent') === 'accepted') {
        cookieInfoEl.innerHTML = 'Har du redan lagt till aktiviteter? Du kan <a href="redigera.html">redigera dina aktiviteter här</a>.';
      }
    } catch { /* localStorage may be unavailable */ }
  }

  // ── Day grid (02-§80.1–80.11) ─────────────────────────────────────────────

  var dayGrid = form.querySelector('.day-grid');
  var dateInput = form.querySelector('#f-date');
  var PAGE_SIZE = parseInt((dayGrid && dayGrid.dataset.pageSize) || '8', 10);
  var visibleBtns = []; // buttons not filtered by past-day rule
  var currentPage = 0;

  // Filter out past days when today is during camp (02-§80.4).
  // Build visibleBtns array for pagination.
  if (dayGrid) {
    var today = new Date().toISOString().slice(0, 10);
    var gridStart = dayGrid.dataset.start;
    var gridEnd = dayGrid.dataset.end;
    var allDayBtns = dayGrid.querySelectorAll('.day-btn');
    for (var i = 0; i < allDayBtns.length; i++) {
      if (today >= gridStart && today <= gridEnd && allDayBtns[i].dataset.date < today) {
        allDayBtns[i].style.display = 'none';
      } else {
        visibleBtns.push(allDayBtns[i]);
      }
    }
  }

  // ── Pagination nav ──────────────────────────────────────────────────────────

  var navEl = null;
  var prevBtn = null;
  var nextBtn = null;
  var navLabel = null;

  function totalPages() {
    return Math.max(1, Math.ceil(visibleBtns.length / PAGE_SIZE));
  }

  function showPage(page) {
    currentPage = page;
    var start = page * PAGE_SIZE;
    var end = start + PAGE_SIZE;
    for (var i = 0; i < visibleBtns.length; i++) {
      visibleBtns[i].style.display = (i >= start && i < end) ? '' : 'none';
    }
    if (navEl) {
      prevBtn.disabled = page === 0;
      nextBtn.disabled = page >= totalPages() - 1;
      navLabel.textContent = (page + 1) + ' / ' + totalPages();
      navEl.style.display = totalPages() > 1 ? '' : 'none';
    }
  }

  if (dayGrid && visibleBtns.length > PAGE_SIZE) {
    navEl = document.createElement('div');
    navEl.className = 'day-grid-nav';
    prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.textContent = '←';
    prevBtn.setAttribute('aria-label', 'Föregående dagar');
    nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = '→';
    nextBtn.setAttribute('aria-label', 'Nästa dagar');
    navLabel = document.createElement('span');
    navLabel.className = 'day-grid-label';
    navEl.appendChild(prevBtn);
    navEl.appendChild(navLabel);
    navEl.appendChild(nextBtn);
    dayGrid.parentNode.insertBefore(navEl, dayGrid.nextSibling);

    prevBtn.addEventListener('click', function () {
      if (currentPage > 0) showPage(currentPage - 1);
    });
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages() - 1) showPage(currentPage + 1);
    });
  }

  // Show first page (hides excess buttons).
  if (dayGrid) showPage(0);

  // ── Day grid helpers ────────────────────────────────────────────────────────

  function getSelectedDates() {
    var selected = dayGrid.querySelectorAll('.day-btn.selected');
    var dates = [];
    for (var i = 0; i < selected.length; i++) {
      dates.push(selected[i].dataset.date);
    }
    return dates;
  }

  function updateHiddenDate() {
    if (!dateInput) return;
    var dates = getSelectedDates();
    dateInput.value = dates.length === 1 ? dates[0] : '';
  }

  var dateInteracted = false;

  // Multi-day info text — shown when 2+ days are selected.
  var multiDayInfo = null;
  if (dayGrid) {
    multiDayInfo = document.createElement('span');
    multiDayInfo.className = 'field-info';
    multiDayInfo.textContent = 'Varje dag skapas som en egen aktivitet som kan redigeras separat.';
    multiDayInfo.hidden = true;
    dayGrid.parentNode.insertBefore(multiDayInfo, dayGrid.nextSibling);
  }

  function validateDateSelection() {
    if (!dateInteracted) return;
    var count = getSelectedDates().length;
    if (count === 0) {
      setFieldError('date', 'Välj minst en dag.');
      if (multiDayInfo) multiDayInfo.hidden = true;
    } else {
      setFieldError('date', null);
      if (multiDayInfo) {
        if (count >= 2) {
          multiDayInfo.textContent = 'Du har valt ' + count + ' dagar. Det skapas en aktivitet per dag som kan redigeras separat.';
          multiDayInfo.hidden = false;
        } else {
          multiDayInfo.hidden = true;
        }
      }
    }
  }

  // Day button click handler — always multi-select.
  if (dayGrid) {
    dayGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('.day-btn');
      if (!btn) return;
      dateInteracted = true;
      btn.classList.toggle('selected');
      updateHiddenDate();
      validateDateSelection();
    });
  }

  // ── Form draft cache — restore and save listeners (02-§85.5–85.9) ─────────

  restoreDraft();

  // Save on text/time input (02-§85.5)
  ['#f-title', '#f-start', '#f-end', '#f-responsible', '#f-description', '#f-link'].forEach(function (sel) {
    var el = form.querySelector(sel);
    if (el) el.addEventListener('input', saveDraft);
  });

  // Save on location change (02-§85.6)
  var locSelect = form.querySelector('#f-location');
  if (locSelect) locSelect.addEventListener('change', saveDraft);

  // Save on day-grid click (02-§85.7) — runs after toggle in existing handler
  if (dayGrid) {
    dayGrid.addEventListener('click', function (e) {
      if (e.target.closest('.day-btn')) saveDraft();
    });
  }

  // ── Conflict warning (02-§99.4–99.9) ─────────────────────────────────────

  var CONFLICT = (typeof window !== 'undefined' && window.SBConflictCheck) || null;
  var eventsCache = null;
  var eventsPromise = null;
  var conflictBanner = null;
  var conflictDebounceTimer = null;
  var WEEKDAYS_LONG_SV = ['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'];

  function whenEvents() {
    if (eventsCache) return Promise.resolve(eventsCache);
    if (eventsPromise) return eventsPromise;
    eventsPromise = fetch('/events.json')
      .then(function (r) { return r.json(); })
      .then(function (list) {
        eventsCache = Array.isArray(list) ? list : [];
        return eventsCache;
      })
      .catch(function () {
        eventsCache = [];
        return eventsCache;
      });
    return eventsPromise;
  }

  function ensureConflictBanner() {
    if (conflictBanner) return conflictBanner;
    conflictBanner = document.createElement('div');
    conflictBanner.className = 'conflict-warning';
    conflictBanner.setAttribute('role', 'status');
    conflictBanner.setAttribute('aria-live', 'polite');
    conflictBanner.hidden = true;
    if (submitBtn && submitBtn.parentNode) {
      submitBtn.parentNode.insertBefore(conflictBanner, submitBtn);
    }
    return conflictBanner;
  }

  function escapeConflictText(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatSwedishDate(iso) {
    // iso = "2026-05-04"
    var parts = iso.split('-');
    if (parts.length !== 3) return iso;
    var d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    var weekday = WEEKDAYS_LONG_SV[d.getUTCDay()];
    return weekday.charAt(0).toUpperCase() + weekday.slice(1)
      + ' ' + (+parts[2]) + '/' + (+parts[1]);
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

  function renderConflicts(mapByDate) {
    var banner = ensureConflictBanner();
    if (!mapByDate || mapByDate.size === 0) {
      banner.hidden = true;
      banner.innerHTML = '';
      return;
    }
    var footer = '<p class="conflict-warning__footer"><a href="lokaler.html">Se lokalöversikt →</a></p>';
    var dates = [];
    mapByDate.forEach(function (_, k) { dates.push(k); });
    dates.sort();

    var html;
    if (dates.length === 1) {
      var single = mapByDate.get(dates[0]);
      var lead = single.length === 1
        ? 'Den här tiden och platsen krockar med en annan aktivitet:'
        : 'Den här tiden och platsen krockar med flera aktiviteter:';
      html = '<p class="conflict-warning__lead">' + lead + '</p>'
        + '<ul class="conflict-warning__list">' + renderConflictList(single) + '</ul>'
        + footer;
    } else {
      html = '<p class="conflict-warning__lead">Den här tiden och platsen krockar på flera dagar:</p>';
      for (var i = 0; i < dates.length; i++) {
        var d = dates[i];
        var list = mapByDate.get(d);
        html += '<section class="conflict-warning__date-group">'
          + '<h3 class="conflict-warning__date">' + escapeConflictText(formatSwedishDate(d)) + '</h3>'
          + '<ul class="conflict-warning__list">' + renderConflictList(list) + '</ul>'
          + '</section>';
      }
      html += footer;
    }

    banner.innerHTML = html;
    banner.hidden = false;
  }

  function maybeCheckConflicts() {
    if (!CONFLICT) return; // shared module not loaded — silently skip
    var dates = dayGrid ? getSelectedDates() : [];
    if (!dates.length) { renderConflicts(null); return; }
    var start = (form.querySelector('#f-start') || {}).value || '';
    var end = (form.querySelector('#f-end') || {}).value || '';
    var location = (form.querySelector('#f-location') || {}).value || '';
    if (!start || !end || !location) { renderConflicts(null); return; }
    if (end <= start) { renderConflicts(null); return; }
    whenEvents().then(function (events) {
      var map = CONFLICT.findConflictsMulti(
        { dates: dates, start: start, end: end, location: location },
        events,
      );
      renderConflicts(map);
    });
  }

  function scheduleConflictCheck() {
    if (conflictDebounceTimer) clearTimeout(conflictDebounceTimer);
    conflictDebounceTimer = setTimeout(maybeCheckConflicts, 150);
  }

  // Prime the cache early so the first keystroke has data ready.
  whenEvents();

  // Wire listeners onto the same fields that trigger conflict relevance.
  ['#f-start', '#f-end', '#f-location'].forEach(function (sel) {
    var el = form.querySelector(sel);
    if (el) el.addEventListener('change', scheduleConflictCheck);
  });
  if (dayGrid) {
    dayGrid.addEventListener('click', function (e) {
      if (e.target.closest('.day-btn')) scheduleConflictCheck();
    });
  }

  // Restore may have populated fields before any listener fires; run once.
  scheduleConflictCheck();

  // ── Admin token helper (02-§26.17, §26.19) ────────────────────────────────

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

  var adminToken = getAdminToken();
  var adminBypassActive = false;

  // The role is the second segment of the token (namn_roll_epoch_sig). Any
  // valid role may open the form before opens_for_editing (02-§105.8); the
  // server re-verifies the role on submit.
  function tokenRole(token) {
    if (!token) return null;
    return token.split('_')[1] || null;
  }

  // ── Time-gating (02-§26.3–26.8, §26.14–§26.19) ────────────────────────────

  var opensDate = form.dataset.opens;
  var closesDate = form.dataset.closes;

  if (opensDate && closesDate) {
    var todayGate = new Date().toISOString().slice(0, 10);
    if (todayGate < opensDate) {
      // Before opening
      var parts = opensDate.split('-');
      var months = ['januari','februari','mars','april','maj','juni',
                    'juli','augusti','september','oktober','november','december'];
      var formatted = parseInt(parts[2], 10) + ' ' + months[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
      var msg = document.createElement('div');
      msg.className = 'form-gate-msg';
      msg.textContent = 'Formuläret öppnar den ' + formatted + '.';
      form.parentNode.insertBefore(msg, form);
      fieldset.disabled = true;
      submitBtn.disabled = true;
      form.classList.add('form-gated');

      if (adminToken) {
        var bypassBtn = document.createElement('button');
        bypassBtn.type = 'button';
        bypassBtn.className = 'form-gate-bypass';
        bypassBtn.textContent = tokenRole(adminToken) === 'early'
          ? 'Öppna ändå (tidig åtkomst)'
          : 'Öppna ändå (admin)';
        bypassBtn.addEventListener('click', function () {
          adminBypassActive = true;
          fieldset.disabled = false;
          submitBtn.disabled = false;
          form.classList.remove('form-gated');
          msg.hidden = true;
          bypassBtn.hidden = true;
        });
        // Insert after the banner on its own row, not inside it (02-§26.20).
        msg.parentNode.insertBefore(bypassBtn, msg.nextSibling);
      }
    } else if (todayGate > closesDate) {
      // After closing — no admin bypass (02-§26.16, §26.18)
      var msg2 = document.createElement('div');
      msg2.className = 'form-gate-msg';
      msg2.textContent = 'Lägret är avslutat.';
      form.parentNode.insertBefore(msg2, form);
      fieldset.disabled = true;
      submitBtn.disabled = true;
      form.classList.add('form-gated');
    }
  }

  // ── Modal helpers ────────────────────────────────────────────────────────────

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
    // Focus first interactive element, or the heading so screen readers
    // announce the modal state even in the loading phase.
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

  // ── Progress steps (02-§53.6–53.10) ─────────────────────────────────────────

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

  // ── Modal states ─────────────────────────────────────────────────────────────

  function setModalLoading() {
    modalHeading.textContent = 'Skickar\u2026';
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

    // Open only if not already open (consent modal may have opened it).
    if (modal.hidden) { openModal(); } else { modalHeading.focus(); }
  }

  function resetDayGrid() {
    if (!dayGrid) return;
    var allBtns = dayGrid.querySelectorAll('.day-btn');
    for (var i = 0; i < allBtns.length; i++) {
      allBtns[i].classList.remove('selected');
    }
    if (dateInput) dateInput.value = '';
    if (multiDayInfo) multiDayInfo.hidden = true;
    dateInteracted = false;
    showPage(0);
    // Hide any lingering conflict warning from the previous submission.
    if (conflictBanner) {
      conflictBanner.hidden = true;
      conflictBanner.innerHTML = '';
    }
  }

  function setModalSuccess(title, consentGiven) {
    clearProgressTimers();
    completeAllSteps();
    modalHeading.textContent = 'Aktiviteten är tillagd!';
    var noEditNote = consentGiven ? '' :
      '<p class="result-note">Du valde att inte tillåta cookie, så aktiviteten kan inte' +
      ' redigeras från den här webbläsaren. Vill du ändra dig? Lägg till' +
      ' en ny aktivitet och välj <em>Ja, det är okej</em> när vi frågar.</p>';
    modalContent.innerHTML =
      '<p class="intro"><strong>' + escHtml(title) + '</strong>' +
      ' syns i schemat inom någon minut, men ibland kan det ta upp till 15 minuter.</p>' +
      '<p class="result-note">Dyker den inte upp? Ladda om sidan –' +
      ' webbläsaren kan visa en sparad version.</p>' +
      noEditNote +
      '<div class="success-actions">' +
        '<a href="schema.html" class="btn-primary">Gå till schemat →</a>' +
        '<button id="modal-new-btn" class="btn-secondary">Lägg till en till</button>' +
      '</div>';
    focusFirstInModal();
    document.getElementById('modal-new-btn').addEventListener('click', function () {
      closeModal();
      form.reset();
      resetDayGrid();
      clearAllErrors();
      unlock();
      window.scrollTo(0, 0);
    });
  }

  function setModalBatchSuccess(title, count, consentGiven) {
    clearProgressTimers();
    completeAllSteps();
    modalHeading.textContent = count + ' aktiviteter tillagda!';
    var noEditNote = consentGiven ? '' :
      '<p class="result-note">Du valde att inte tillåta cookie, så aktiviteterna kan inte' +
      ' redigeras från den här webbläsaren.</p>';
    modalContent.innerHTML =
      '<p class="intro"><strong>' + escHtml(title) + '</strong>' +
      ' på ' + count + ' dagar – syns i schemat inom någon minut,' +
      ' men ibland kan det ta upp till 15 minuter.</p>' +
      '<p class="result-note">Dyker de inte upp? Ladda om sidan –' +
      ' webbläsaren kan visa en sparad version.</p>' +
      noEditNote +
      '<div class="success-actions">' +
        '<a href="schema.html" class="btn-primary">Gå till schemat →</a>' +
        '<button id="modal-new-btn" class="btn-secondary">Lägg till en till</button>' +
      '</div>';
    focusFirstInModal();
    document.getElementById('modal-new-btn').addEventListener('click', function () {
      closeModal();
      form.reset();
      resetDayGrid();
      clearAllErrors();
      unlock();
      window.scrollTo(0, 0);
    });
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

  // ── Form lock / unlock ───────────────────────────────────────────────────────

  function lock() {
    fieldset.disabled = true;
    submitBtn.disabled = true;
  }

  function unlock() {
    fieldset.disabled = false;
    submitBtn.disabled = false;
  }

  // ── Utility ──────────────────────────────────────────────────────────────────

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Per-field inline errors (02-§6.5) ────────────────────────────────────────

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

  function setFieldInfo(name, message) {
    var input = form.querySelector('#f-' + name);
    var span  = document.getElementById('err-' + name);
    if (message) {
      input.removeAttribute('aria-invalid');
      span.className = 'field-info';
      span.textContent = message;
      span.hidden = false;
    } else {
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
    // end < start → midnight crossing; check duration ≤ 17 h (1020 min)
    var dur = (1440 - timeToMinutes(startVal)) + timeToMinutes(endVal);
    if (dur <= 1020) return { state: 'info', message: 'Tolkas som att aktiviteten slutar nästa dag.' };
    return { state: 'error', message: 'Aktiviteten verkar vara för lång. Kontrollera start- och sluttid.' };
  }

  function clearAllErrors() {
    var fields = ['title', 'date', 'start', 'end', 'location', 'responsible', 'link'];
    for (var i = 0; i < fields.length; i++) { setFieldError(fields[i], null); }
  }

  // ── Live validation (02-§6.9–6.12) ──────────────────────────────────────────

  var REQUIRED_FIELDS = ['title', 'date', 'start', 'end', 'location', 'responsible'];

  // Clear error as soon as the user starts editing a field again.
  REQUIRED_FIELDS.forEach(function (name) {
    var input = form.querySelector('#f-' + name);
    if (!input) return;
    var clearEvent = (input.tagName === 'SELECT' || input.type === 'date' || input.type === 'time')
      ? 'change' : 'input';
    input.addEventListener(clearEvent, function () {
      setFieldError(name, null);
    });
  });

  // Show error when the user leaves a required field empty (02-§6.11).
  REQUIRED_FIELDS.forEach(function (name) {
    var input = form.querySelector('#f-' + name);
    if (!input) return;
    input.addEventListener('blur', function () {
      if (!input.value) {
        var labels = {
          title:       'Rubrik är obligatoriskt.',
          date:        'Datum är obligatoriskt.',
          start:       'Starttid är obligatorisk.',
          end:         'Sluttid är obligatorisk.',
          location:    'Plats är obligatoriskt.',
          responsible: 'Ansvarig är obligatoriskt.',
        };
        setFieldError(name, labels[name]);
      }
    });
  });

  // Date validation is handled by the day grid — past days are hidden.
  // The hidden dateInput is set programmatically by day grid clicks.

  // Validate end time immediately on change (02-§6.10, 02-§54.1–54.9).
  var endInput = form.querySelector('#f-end');
  if (endInput) {
    endInput.addEventListener('change', function () {
      if (!endInput.value) return; // blur handles the empty case
      var startVal = (form.elements.start || {}).value;
      if (!startVal) return;
      var result = checkEndTime(startVal, endInput.value);
      if (result.state === 'error') {
        setFieldError('end', result.message);
      } else if (result.state === 'info') {
        setFieldInfo('end', result.message);
      } else {
        setFieldError('end', null);
      }
    });
  }

  // Returns true if date = today and time is more than 120 minutes in the past.
  function isPastTimeToday(timeVal) {
    if (!dateInput || !dateInput.value || !timeVal) return false;
    var today = new Date().toISOString().slice(0, 10);
    if (dateInput.value !== today) return false;
    var now = new Date();
    var cutoffMinutes = now.getHours() * 60 + now.getMinutes() - 120;
    var parts = timeVal.split(':');
    var timeMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    return timeMinutes < cutoffMinutes;
  }

  // Re-evaluate end-time cross-check and past-time check when start changes
  // (02-§6.13, 02-§6.14).
  var startInput = form.querySelector('#f-start');
  if (startInput) {
    startInput.addEventListener('change', function () {
      // Re-evaluate end time cross-check (02-§6.13, 02-§54.1–54.9).
      if (endInput && endInput.value && startInput.value) {
        var result = checkEndTime(startInput.value, endInput.value);
        if (result.state === 'error') {
          setFieldError('end', result.message);
        } else if (result.state === 'info') {
          setFieldInfo('end', result.message);
        } else {
          setFieldError('end', null);
        }
      } else if (endInput && endInput.value) {
        setFieldError('end', null);
      }
      // Check for start time too far in the past on today's date.
      if (isPastTimeToday(startInput.value)) {
        setFieldError('start', 'Starttiden har redan passerat – menade du imorgon?');
      }
    });
  }

  // Past-time re-check on date change is handled by the day grid.
  // When a day button is clicked, updateHiddenDate() sets dateInput.value,
  // and isPastTimeToday() reads it when start time changes.

  // ── Link field blur validation (02-§81.1–81.10) ──────────────────────────

  var linkInput = form.querySelector('#f-link');
  if (linkInput) {
    linkInput.addEventListener('blur', function () {
      var val = linkInput.value.trim();
      if (!val) { setFieldError('link', null); return; }
      if (!/^https?:\/\//i.test(val)) {
        setFieldError('link', 'Länken måste börja med https:// eller http://');
        return;
      }
      var afterProtocol = val.replace(/^https?:\/\//i, '');
      if (afterProtocol.indexOf('.') === -1) {
        setFieldError('link', 'Länken ser inte ut som en giltig webbadress');
        return;
      }
      setFieldError('link', null);
    });
    linkInput.addEventListener('input', function () {
      setFieldError('link', null);
    });
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
    update(); // in case of auto-fill
  }

  COUNTER_FIELDS.forEach(initCounter);

  // ── Submit handler ───────────────────────────────────────────────────────────

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors();

    var els         = form.elements;
    var title       = els.title.value.trim();
    var selectedDates = getSelectedDates();
    var isBatch     = selectedDates.length > 1;
    var start       = els.start.value;
    var end         = els.end.value;
    var location    = els.location.value;
    var responsible = els.responsible.value.trim();

    var hasError = false;
    var firstInvalid = null;

    function fail(name, msg) {
      setFieldError(name, msg);
      hasError = true;
      if (!firstInvalid) firstInvalid = form.querySelector('#f-' + name);
    }

    if (!title)            fail('title', 'Rubrik är obligatoriskt.');
    if (selectedDates.length === 0) fail('date', 'Välj minst en dag.');
    if (!start)            fail('start', 'Starttid är obligatorisk.');
    if (!end)              fail('end', 'Sluttid är obligatorisk.');
    else if (start) {
      var endResult = checkEndTime(start, end);
      if (endResult.state === 'error') fail('end', endResult.message);
    }
    if (!location)         fail('location', 'Plats är obligatoriskt.');
    if (!responsible)      fail('responsible', 'Ansvarig är obligatoriskt.');

    // Link field validation (02-§81.8) — optional but must be valid if filled.
    var linkSubmitVal = els.link.value.trim();
    if (linkSubmitVal) {
      if (!/^https?:\/\//i.test(linkSubmitVal)) {
        fail('link', 'Länken måste börja med https:// eller http://');
      } else if (linkSubmitVal.replace(/^https?:\/\//i, '').indexOf('.') === -1) {
        fail('link', 'Länken ser inte ut som en giltig webbadress');
      }
    }

    if (hasError) {
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // ── Confirmation modal ──────────────────────────────────────────────────
    openModal();
    modalHeading.textContent = 'Bekräfta';
    var dateList = selectedDates.map(function (d) {
      var dt = new Date(d + 'T12:00:00');
      var weekdays = ['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'];
      return weekdays[dt.getDay()] + ' ' + dt.getDate() + '/' + (dt.getMonth() + 1);
    }).join(', ');

    var desc = els.description.value.trim();
    // Truncate long descriptions in the summary.
    var shortDesc = desc.length > 120 ? desc.slice(0, 120) + '…' : desc;
    var descRow = shortDesc
      ? '<tr class="desc-row"><td>📝</td><td>' + escHtml(shortDesc) + '</td></tr>'
      : '';
    var linkVal = els.link.value.trim();
    var linkRow = linkVal
      ? '<tr><td>🔗</td><td>' + escHtml(linkVal) + '</td></tr>'
      : '';

    var summary =
      (isBatch ? '<p class="field-info">Varje dag blir en egen aktivitet som kan redigeras separat.</p>' : '') +
      '<table class="confirm-summary">' +
        '<tr><td>📌</td><td><strong>' + escHtml(title) + '</strong></td></tr>' +
        (isBatch
          ? '<tr><td>📅</td><td><strong>' + selectedDates.length + ' dagar:</strong> ' + escHtml(dateList) + '</td></tr>'
          : '<tr><td>📅</td><td>' + escHtml(dateList) + '</td></tr>') +
        '<tr><td>🕐</td><td>' + escHtml(start) + '–' + escHtml(end) + '</td></tr>' +
        '<tr><td>📍</td><td>' + escHtml(location) + '</td></tr>' +
        '<tr><td>👤</td><td>' + escHtml(responsible) + '</td></tr>' +
        descRow +
        linkRow +
      '</table>';

    modalContent.innerHTML = summary +
      '<div class="modal-actions">' +
        '<button type="button" class="btn-primary" id="confirm-submit">Skicka</button>' +
        '<button type="button" class="btn-secondary" id="cancel-submit">Avbryt</button>' +
      '</div>';
    focusFirstInModal();

    document.getElementById('cancel-submit').addEventListener('click', function () {
      closeModal();
    });
    document.getElementById('confirm-submit').addEventListener('click', function () {
      doSubmit(title, selectedDates, start, end, location, responsible, els);
    });
  });

  function doSubmit(title, selectedDates, start, end, location, responsible, els) {
    var isBatch = selectedDates.length > 1;
    lock();

    // Ask for cookie consent before sending (shown once per browser).
    // If window.SBConsentReady is unavailable (cookie-consent.js not loaded),
    // proceed without consent.
    var consentFn = window.SBConsentReady || function (cb) { cb(false); };
    var modalApi = {
      open: openModal,
      setHeading: function (t) { modalHeading.textContent = t; },
      setContent: function (h) { modalContent.innerHTML = h; focusFirstInModal(); },
    };

    consentFn(function (consentGiven) {
      setModalLoading();

      // Build request body — single or batch (02-§80.20).
      var apiUrl = form.dataset.apiUrl || '/add-event';
      var bodyObj;
      if (isBatch) {
        // Batch: POST /add-events with dates array.
        apiUrl = apiUrl.replace(/\/add-event$/, '/add-events');
        bodyObj = {
          title:         title,
          dates:         selectedDates,
          start:         start,
          end:           end,
          location:      location,
          responsible:   responsible,
          description:   els.description.value,
          link:          els.link.value.trim(),
          cookieConsent: consentGiven,
        };
      } else {
        bodyObj = {
          title:         title,
          date:          selectedDates[0],
          start:         start,
          end:           end,
          location:      location,
          responsible:   responsible,
          description:   els.description.value,
          link:          els.link.value.trim(),
          cookieConsent: consentGiven,
        };
      }

      // Admin bypass (02-§26.19): forward token when admin opened the form
      // before opens_for_editing.
      if (adminBypassActive && adminToken) {
        bodyObj.adminToken = adminToken;
      }

      fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
      })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (!json.success) {
            setModalError(json.error || 'Något gick fel.');
            return;
          }
          // Save responsible name for auto-fill on next visit (02-§48.1, 02-§48.3)
          try { localStorage.setItem('sb_responsible', responsible); } catch { /* ignore */ }
          // Clear draft after successful submission (02-§85.10)
          clearDraft();
          if (isBatch) {
            setModalBatchSuccess(title, selectedDates.length, consentGiven);
          } else {
            setModalSuccess(title, consentGiven);
          }
        })
        .catch(function () {
          setModalError('Något gick fel. Kontrollera din internetanslutning och försök igen.');
        });
    }, modalApi);
  }

})();
