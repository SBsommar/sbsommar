/**
 * Shared client-side script for "Idag" and "Dagens schema" pages.
 *
 * Expects globals set by an inline <script> before this file loads:
 *   window.__EVENTS__         – array of event objects (JSON from build)
 *   window.__HEADING_PREFIX__ – string to prepend to the date in the h1
 *   window.__EMPTY_CLASS__    – CSS class for the "no events" paragraph
 *   window.__SHOW_FOOTER__    – boolean; if true, renders an activity count footer
 *
 * Display-mode only (set only in live.html):
 *   window.__BUILD_TIME__     – ISO timestamp of the last build (for display)
 *   window.__VERSION__        – same timestamp, used for version-change detection
 */
(function () {
  var events = window.__EVENTS__ || [];
  var headingPrefix = window.__HEADING_PREFIX__ || '';
  var emptyClass = window.__EMPTY_CLASS__ || 'intro';
  var showFooter = window.__SHOW_FOOTER__ || false;
  // idag.html opts in; the passive display view (live.html) leaves this unset.
  var showIcal = window.__SHOW_ICAL__ || false;
  // Display view (live.html) also shows the next day; idag.html leaves this unset.
  var showNextDay = window.__SHOW_NEXT_DAY__ || false;
  var campEnd = window.__CAMP_END__ || '';

  function pad(n) { return String(n).padStart(2, '0'); }

  // Parse "HH:MM" into minutes-since-midnight; returns null on bad input.
  // Shared by the "Idag" status marking and the live display-view logic.
  function toMinutes(hhmm) {
    var m = /^(\d{1,2}):(\d{2})/.exec(hhmm || '');
    return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
  }

  var now = new Date();
  var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

  var weekdays = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
  var months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
  var label = weekdays[now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();

  var heading = document.getElementById('today-heading');
  if (heading) heading.textContent = headingPrefix ? headingPrefix + ' – ' + label : label;

  var todayEvents = events.filter(function (e) { return e.date === today; });
  todayEvents.sort(function (a, b) { return a.start.localeCompare(b.start); });

  var container = document.getElementById('today-events');
  if (!container) return;

  // idag.html shows today only: with no events there is nothing more to render.
  // live.html (showNextDay) continues so it can still show the next day below.
  if (todayEvents.length === 0 && !showNextDay) {
    container.innerHTML = '<p class="' + emptyClass + '">Inga aktiviteter schemalagda för idag.</p>';
    return;
  }

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Only emit http(s) links into an href (defence-in-depth, issue #385):
  // a javascript:/data: URI in e.link must never become a clickable href,
  // even if it reached events.json without API/CI validation.
  function safeHttp(u) {
    if (u == null) return '';
    var s = String(u).trim();
    return /^https?:\/\//i.test(s) ? s : '';
  }

  // Per-event iCal download link, matching icalDownloadLink() in render.js.
  // Only emitted on idag.html (showIcal) and only when the event has an id.
  function icalLink(e) {
    if (!showIcal || !e.id) return '';
    return '<a href="schema/' + esc(e.id) + '/event.ics" class="ev-ical" download ' +
      'title="Ladda ner iCal" data-goatcounter-click="download-ical">iCal</a>';
  }

  // Builds the HTML for one event row (collapsible when it has extra detail).
  function buildRowHtml(e) {
    var timeStr = e.end ? esc(e.start) + '–' + esc(e.end) : esc(e.start);
    var metaParts = [e.location, e.responsible].filter(Boolean).map(esc);
    var metaEl = metaParts.length ? '<span class="ev-meta"> · ' + metaParts.join(' · ') + '</span>' : '';
    var icalEl = icalLink(e);
    var safeLink = safeHttp(e.link);
    var hasExtra = e.description || e.descriptionHtml || safeLink;
    var idAttr = e.id ? ' data-event-id="' + esc(e.id) + '"' : '';
    var dateAttr = e.date ? ' data-event-date="' + esc(e.date) + '"' : '';

    if (hasExtra) {
      var extraParts = [];
      if (e.descriptionHtml) {
        extraParts.push('<div class="event-desc">' + e.descriptionHtml + '</div>');
      } else if (e.description) {
        extraParts.push('<div class="event-desc"><p>' + esc(e.description) + '</p></div>');
      }
      if (safeLink) {
        extraParts.push('<a class="event-ext-link" href="' + esc(safeLink) + '" target="_blank" rel="noopener">Extern länk →</a>');
      }
      return '<details class="event-row"' + idAttr + dateAttr + '><summary>' +
        '<span class="ev-time">' + timeStr + '</span>' +
        '<span class="ev-title">' + esc(e.title) + '</span>' +
        metaEl + icalEl + '</summary>' +
        '<div class="event-extra">' + extraParts.join('') + '</div>' +
        '</details>';
    }
    return '<div class="event-row plain"' + idAttr + dateAttr + '>' +
      '<span class="ev-time">' + timeStr + '</span>' +
      '<span class="ev-title">' + esc(e.title) + '</span>' +
      metaEl + icalEl + '</div>';
  }

  // Wraps a list of events in a card. The optional id lets the live "now" logic
  // target today's rows only, leaving the next day's rows untouched.
  function renderCard(list, listId) {
    var idAttr = listId ? ' id="' + listId + '"' : '';
    return '<div class="today-card"><div class="event-list"' + idAttr + '>' +
      list.map(buildRowHtml).join('') + '</div></div>';
  }

  // Next day (display view only): the camp must have another day (tomorrow on or
  // before the camp end date) and that day must have at least one activity.
  var tomorrowEvents = [];
  if (showNextDay) {
    var tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    var tomorrowStr = tmr.getFullYear() + '-' + pad(tmr.getMonth() + 1) + '-' + pad(tmr.getDate());
    if (!campEnd || tomorrowStr <= campEnd) {
      tomorrowEvents = events.filter(function (e) { return e.date === tomorrowStr; });
      tomorrowEvents.sort(function (a, b) { return a.start.localeCompare(b.start); });
    }
  }

  var output;
  if (todayEvents.length) {
    output = renderCard(todayEvents, 'today-list');
    if (showFooter) {
      output += '<p class="display-footer">' + todayEvents.length + ' aktiviteter schemalagda idag.</p>';
    }
  } else {
    output = '<p class="' + emptyClass + '">Inga aktiviteter schemalagda för idag.</p>';
  }
  if (tomorrowEvents.length) {
    output += '<div class="day-divider"><span>Imorgon</span></div>';
    output += renderCard(tomorrowEvents, null);
  }
  container.innerHTML = output;

  // ── Time status on the standard "Idag" view (02-§116.5) ───────────────────
  // Mark today's rows by their current-time status so the today view matches
  // the weekly schedule: an activity that has ended gets .is-past (light grey),
  // and the one in progress gets .is-now (highlighted). Evaluated once on load;
  // a manual reload re-evaluates. The dark display view (window.__BUILD_TIME__)
  // is handled separately below, on a live per-minute timer, so it is skipped
  // here to avoid double-classifying.
  if (!window.__BUILD_TIME__) {
    var idagListEl = document.getElementById('today-list');
    if (idagListEl) {
      var nowMinIdag = now.getHours() * 60 + now.getMinutes();
      var idagRows = idagListEl.querySelectorAll('.event-row');
      for (var r = 0; r < idagRows.length; r++) {
        var iev = todayEvents[r];
        var iel = idagRows[r];
        if (!iev || !iel) continue;
        var iStart = toMinutes(iev.start);
        if (iStart == null) continue;
        var iEnd = iev.end ? toMinutes(iev.end) : null;
        // End at or before start crosses midnight; no end runs until midnight.
        if (iEnd != null && iEnd <= iStart) iEnd += 24 * 60;
        if (iEnd == null) iEnd = 24 * 60;
        if (nowMinIdag >= iEnd) iel.classList.add('is-past');
        else if (nowMinIdag >= iStart) iel.classList.add('is-now');
      }
    }
  }

  // ── Status bar and auto-reload (display mode only) ────────────────────────
  // Only active when __BUILD_TIME__ is defined, which only happens in
  // live.html. On idag.html these features are intentionally absent.

  if (window.__BUILD_TIME__) {

    // Live clock — advances exactly once per wall-clock second.
    var clockEl = document.getElementById('live-clock');
    function updateClock() {
      if (!clockEl) return;
      var t = new Date();
      clockEl.textContent = pad(t.getHours()) + ':' + pad(t.getMinutes()) + ':' + pad(t.getSeconds());
    }
    // Self-correcting tick: a fixed setInterval(…, 1000) drifts a few ms per
    // tick, slips out of phase with the wall clock, and roughly once a minute
    // skips a displayed second ("racing"). Re-aligning to the next whole second
    // after every update keeps the seconds incrementing smoothly.
    function tickClock() {
      updateClock();
      setTimeout(tickClock, 1000 - (Date.now() % 1000));
    }
    tickClock();

    // Schedule-content timestamp — when the site was last rebuilt. This says
    // nothing about whether the screen is still alive; that is what the
    // connection warning below is for.
    var buildInfoEl = document.getElementById('build-info');
    if (buildInfoEl) {
      var shortMonths = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
      var bt = new Date(window.__BUILD_TIME__);
      var dateStr = bt.getDate() + ' ' + shortMonths[bt.getMonth()] + ' ' + bt.getFullYear();
      var btTime = pad(bt.getHours()) + ':' + pad(bt.getMinutes());
      var infoText = 'Schema uppdaterat ' + dateStr + ' ' + btTime;
      // App version, matching the footer on every other page (which live.html lacks).
      if (window.__APP_VERSION__) infoText += ' · v' + window.__APP_VERSION__;
      buildInfoEl.textContent = infoText;
    }

    // Live "now" view — re-evaluated every minute so the board tracks the
    // current time without a reload: activities that have ended are removed from
    // the list (.is-past, hidden via CSS) and the activity in progress is
    // highlighted (.is-now). An event with no end time counts as in progress
    // from its start onward (its end is unknown), so it is never removed on its
    // own. When every activity has ended, a closing message is shown.
    // (toMinutes is defined once at the top of this file.)
    // Scope to today's list only: the next day's rows must never be removed or
    // highlighted by this logic.
    var todayListEl = document.getElementById('today-list');
    var rowEls = todayListEl ? todayListEl.querySelectorAll('.event-row') : [];
    // Reuse the same empty-state styling as the build-time "no events" message,
    // placed right after today's card so it stays above any next-day divider.
    var doneMsg = document.createElement('p');
    doneMsg.className = emptyClass;
    doneMsg.textContent = 'Inga fler aktiviteter idag.';
    doneMsg.hidden = true;
    if (todayListEl) {
      var todayCard = todayListEl.parentNode;
      todayCard.parentNode.insertBefore(doneMsg, todayCard.nextSibling);
    }
    function classifyRows() {
      var d = new Date();
      var nowMin = d.getHours() * 60 + d.getMinutes();
      var visible = 0;
      for (var i = 0; i < rowEls.length; i++) {
        var ev = todayEvents[i];
        var el = rowEls[i];
        if (!ev || !el) continue;
        var startMin = toMinutes(ev.start);
        var endMin = ev.end ? toMinutes(ev.end) : null;
        el.classList.remove('is-past', 'is-now');
        if (startMin == null) { visible += 1; continue; }
        // End at or before start means the activity crosses midnight.
        if (endMin != null && endMin <= startMin) endMin += 24 * 60;
        if (endMin != null && nowMin >= endMin) {
          el.classList.add('is-past'); // hidden via CSS
        } else {
          if (nowMin >= startMin) el.classList.add('is-now');
          visible += 1;
        }
      }
      doneMsg.hidden = visible > 0;
    }
    // Self-correcting tick aligned to the minute boundary.
    function tickClassify() {
      classifyRows();
      var d = new Date();
      setTimeout(tickClassify, (60 - d.getSeconds()) * 1000 - d.getMilliseconds());
    }
    tickClassify();

    // Version polling — reload when a newer build is deployed. Runs immediately
    // and then every 60 s. A failed check is logged and retried on the next
    // interval rather than silently stopping the loop.
    //
    // Connection warning — surfaced only when checks have been failing. The page
    // loads fresh from the server, so contact starts out healthy; each
    // successful check refreshes the timestamp. When more than STALE_MS passes
    // without a successful check (i.e. several missed polls, or a hung fetch
    // that never resolves), a red banner appears showing when contact was last
    // confirmed. It clears automatically on the next success. This separates a
    // stalled screen from one that is merely showing an unchanged schedule.
    var loadedVersion = window.__VERSION__;
    // Reload-loop guard. The page reloads when version.json reports a newer
    // build than the one embedded here. If a stale cache keeps serving an old
    // page whose embedded version never catches up, an unguarded reload would
    // fire on every poll and thrash the screen. So reload at most once per
    // target version: remember in sessionStorage which version we last reloaded
    // for, and if the page comes back still reporting the old version, stop
    // reloading and leave the (stale) page up rather than flickering. A genuine
    // new deploy always has a target we have not seen yet, so it still triggers
    // exactly one reload.
    var RELOAD_GUARD_KEY = 'sb-reload-target';
    function shouldReloadFor(targetVersion) {
      try {
        if (sessionStorage.getItem(RELOAD_GUARD_KEY) === targetVersion) return false;
        sessionStorage.setItem(RELOAD_GUARD_KEY, targetVersion);
        return true;
      } catch {
        // sessionStorage unavailable (e.g. locked-down kiosk) — fall back to
        // the original behaviour rather than failing.
        return true;
      }
    }
    var warnEl = document.getElementById('connection-warning');
    var lastOkCheck = Date.now();
    var STALE_MS = 3 * 60 * 1000;
    function refreshConnectionWarning() {
      if (!warnEl) return;
      if (Date.now() - lastOkCheck > STALE_MS) {
        var t = new Date(lastOkCheck);
        warnEl.textContent = '⚠ Ingen kontakt med servern sedan ' + pad(t.getHours()) + ':' + pad(t.getMinutes());
        warnEl.hidden = false;
      } else {
        warnEl.hidden = true;
      }
    }
    function pollVersion() {
      fetch('version.json?t=' + Date.now(), { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          lastOkCheck = Date.now();
          refreshConnectionWarning();
          if (loadedVersion && data.version && data.version !== loadedVersion &&
              shouldReloadFor(data.version)) {
            location.reload();
          }
        })
        .catch(function (err) {
          if (window.console && console.warn) {
            console.warn('Versionskontroll misslyckades:', err);
          }
          refreshConnectionWarning();
        });
    }
    pollVersion();
    setInterval(pollVersion, 60 * 1000);
    // Re-evaluate staleness independently of the fetch so a hung request that
    // never resolves still trips the banner.
    setInterval(refreshConnectionWarning, 30 * 1000);

    // Midnight reload — automatically switch to next day's events
    function scheduleMidnightReload() {
      var n = new Date();
      var midnight = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 30);
      setTimeout(function () { location.reload(); }, midnight.getTime() - n.getTime());
    }
    scheduleMidnightReload();
  }
}());
