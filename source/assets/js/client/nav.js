'use strict';

(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('is-open', !expanded);
  });

  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    }
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      toggle.focus();
    }
  });
}());

/* Scroll-to-top button – show after scrolling down */
(function () {
  var btn = document.querySelector('.scroll-top');
  if (!btn) return;

  var wasHidden = true;
  window.addEventListener('scroll', function () {
    var shouldHide = window.scrollY < 300;
    if (shouldHide !== wasHidden) {
      btn.hidden = shouldHide;
      wasHidden = shouldHide;
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}());

/* Edit-shortcut button – reveal for participants who own an upcoming activity.
   Visibility depends only on the visitor's own sb_session ownership; the admin
   token is deliberately ignored (02-§115.6, 02-§115.7). */
(function () {
  var btn = document.querySelector('.edit-shortcut-btn');
  if (!btn) return;

  var COOKIE_NAME = 'sb_session';

  // Read sb_session and keep only valid, non-expired signed ownership IDs.
  function readSignedIds() {
    var pairs = document.cookie.split(';');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].trim();
      if (pair.indexOf(COOKIE_NAME + '=') !== 0) continue;
      try {
        var parsed = JSON.parse(decodeURIComponent(pair.slice(COOKIE_NAME.length + 1)));
        if (!Array.isArray(parsed)) return [];
        var now = Math.floor(Date.now() / 1000);
        return parsed
          .filter(function (e) {
            return e && typeof e === 'object' &&
              typeof e.id === 'string' && e.id.length > 0 &&
              typeof e.exp === 'number' && isFinite(e.exp) && e.exp >= now &&
              typeof e.sig === 'string' && e.sig.length > 0;
          })
          .map(function (e) { return e.id; });
      } catch {
        return [];
      }
    }
    return [];
  }

  var ids = readSignedIds();
  if (!ids.length) return; // no ownership → no shortcut (no fetch for non-owners)

  fetch('/events.json')
    .then(function (r) { return r.json(); })
    .then(function (events) {
      if (!Array.isArray(events)) return;
      var today = new Date().toISOString().slice(0, 10);
      var owned = {};
      for (var i = 0; i < ids.length; i++) owned[ids[i]] = true;
      for (var j = 0; j < events.length; j++) {
        var ev = events[j];
        if (ev && owned[ev.id] && ev.date >= today) {
          btn.hidden = false;
          return;
        }
      }
    })
    .catch(function () { /* leave the button hidden on error */ });
}());
