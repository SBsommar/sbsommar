(function () {
  'use strict';

  var COOKIE_NAME = 'sb_session';
  var MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

  // Read the cookie domain injected at build time (02-§18.47).
  // Must match the Domain the server uses when setting the cookie.
  var cookieDomain = (document.body.dataset.cookieDomain || '').trim();
  var domainPart = cookieDomain ? '; Domain=' + cookieDomain : '';

  // ── Cookie helpers ──────────────────────────────────────────────────────────

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
          if (Array.isArray(parsed)) {
            return normalizeEntries(parsed);
          }
        } catch { /* malformed — ignore */ }
        return [];
      }
    }
    return [];
  }

  function writeSessionEntries(entries) {
    entries = normalizeEntries(entries);
    if (!entries.length) {
      // Delete the cookie by setting Max-Age=0
      document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; Secure; SameSite=Strict' + domainPart;
      return;
    }
    var value = encodeURIComponent(JSON.stringify(entries));
    document.cookie = COOKIE_NAME + '=' + value +
      '; Path=/; Max-Age=' + MAX_AGE_SECONDS + '; Secure; SameSite=Strict' + domainPart;
  }

  // ── Expiry cleanup ──────────────────────────────────────────────────────────

  // Remove entries for events whose date is strictly before today.
  // IDs not found in events.json are kept — a newly-submitted event may not
  // yet appear because the event-data deploy is still in progress (02-§18.49).
  function removeExpiredEntries(entries, events) {
    var today = new Date().toISOString().slice(0, 10);
    return normalizeEntries(entries).filter(function (entry) {
      if (typeof entry !== 'string' && !isSignedEntry(entry)) return false;
      var id = entryId(entry);
      var ev = events[id];
      if (!ev) return true; // unknown — keep (deploy may be in progress)
      return ev.date >= today;
    });
  }

  // Build a lookup map from event ID → event object.
  function buildEventMap(eventsArray) {
    var map = {};
    if (!Array.isArray(eventsArray)) return map;
    eventsArray.forEach(function (e) {
      if (e && e.id) map[e.id] = e;
    });
    return map;
  }

  // ── Admin token helper ──────────────────────────────────────────────────────

  // Check if a valid (non-expired) admin token exists in localStorage (02-§7.3).
  function hasValidAdminToken() {
    try {
      var raw = localStorage.getItem('sb_admin');
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !data.token || typeof data.token !== 'string') return false;
      // Token format: namn_roll_epoch_sig — the epoch is the third segment
      // (the base64url signature may contain underscores, so read by position).
      var parts = data.token.split('_');
      if (parts.length < 4) return false;
      var epoch = Number(parts[2]);
      if (!isFinite(epoch) || epoch <= 0) return false;
      return Math.floor(Date.now() / 1000) <= epoch;
    } catch {
      return false;
    }
  }

  // ── Edit link injection ─────────────────────────────────────────────────────

  function injectEditLinks(ownedIds, isAdmin) {
    var today = new Date().toISOString().slice(0, 10);

    if (isAdmin) {
      // Admin: inject edit link on ALL future event rows (02-§18.16).
      var allRows = document.querySelectorAll('[data-event-id]');
      allRows.forEach(function (row) {
        var date = row.getAttribute('data-event-date');
        if (date && date < today) return;

        var id = row.getAttribute('data-event-id');
        var link = document.createElement('a');
        link.href = 'redigera.html?id=' + encodeURIComponent(id);
        link.textContent = 'Redigera';
        link.className = 'edit-link';

        var target = (row.tagName === 'DETAILS')
          ? row.querySelector('summary')
          : row;
        (target || row).appendChild(link);
      });
      return;
    }

    if (!ownedIds.length) return;

    ownedIds.forEach(function (id) {
      var rows = document.querySelectorAll('[data-event-id="' + CSS.escape(id) + '"]');
      rows.forEach(function (row) {
        var date = row.getAttribute('data-event-date');
        if (date && date < today) return;

        var link = document.createElement('a');
        link.href = 'redigera.html?id=' + encodeURIComponent(id);
        link.textContent = 'Redigera';
        link.className = 'edit-link';

        var target = (row.tagName === 'DETAILS')
          ? row.querySelector('summary')
          : row;
        (target || row).appendChild(link);
      });
    });
  }

  // ── Duplicate cookie repair (02-§90.7–90.11) ──────────────────────────────

  // Detect and merge duplicate sb_session cookies. This can happen when
  // one cookie was set with Domain= and another without (historical bug
  // in removeIdFromCookie). The browser sends both, separated by "; ".
  function repairDuplicateCookies() {
    var pairs = document.cookie.split(';');
    var found = [];
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].trim();
      if (pair.indexOf(COOKIE_NAME + '=') === 0) {
        var raw = pair.slice(COOKIE_NAME.length + 1);
        try {
          var parsed = JSON.parse(decodeURIComponent(raw));
          if (Array.isArray(parsed)) {
            found.push(normalizeEntries(parsed));
          }
        } catch { /* skip malformed */ }
      }
    }
    if (found.length <= 1) return { repaired: false, entries: found[0] || [] };

    // Merge all ownership arrays, deduplicate by event ID. Prefer signed
    // objects over legacy strings when both exist for the same ID.
    var seen = {};
    var merged = [];
    for (var j = 0; j < found.length; j++) {
      for (var k = 0; k < found[j].length; k++) {
        var entry = found[j][k];
        var id = entryId(entry);
        if (!seen[id]) {
          seen[id] = true;
          merged.push(entry);
        } else if (isSignedEntry(entry)) {
          for (var m = 0; m < merged.length; m++) {
            if (entryId(merged[m]) === id && !isSignedEntry(merged[m])) {
              merged[m] = entry;
              break;
            }
          }
        }
      }
    }

    // Delete both cookie variants (with and without Domain).
    document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; Secure; SameSite=Strict';
    if (domainPart) {
      document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; Secure; SameSite=Strict' + domainPart;
    }

    // Write back a single correct cookie.
    writeSessionEntries(merged);
    return { repaired: true, entries: merged };
  }

  // ── Main ────────────────────────────────────────────────────────────────────

  // Repair duplicates first (before expiry cleanup).
  var repair = repairDuplicateCookies();
  var entries = repair.repaired ? repair.entries : readSessionEntries();
  var ids = signedEntryIds(entries);
  var isAdmin = hasValidAdminToken();

  // If no cookie IDs and not admin, nothing to do.
  if (!ids.length && !isAdmin) return;

  // Fetch events.json to validate dates and clean up expired IDs.
  fetch('/events.json')
    .then(function (r) { return r.json(); })
    .then(function (eventsArray) {
      var eventMap = buildEventMap(eventsArray);
      var active = removeExpiredEntries(entries, eventMap);

      // Persist the cleaned list back.
      writeSessionEntries(active);

      injectEditLinks(signedEntryIds(active), isAdmin);
    })
    .catch(function () {
      // If events.json is unavailable, still inject links for what we have.
      injectEditLinks(ids, isAdmin);
    });
})();
