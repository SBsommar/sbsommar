'use strict';

/* Weekly schedule (schema.html) only. Marks each activity row according to the
   current time so the schedule shows, at a glance, what has already happened
   and what is on right now:
     - .is-past  the activity's end time has passed (shown with a muted
                 light-grey background)
     - .is-now   the activity is in progress (highlighted)
   Upcoming activities get no class and keep the default appearance. The status
   is evaluated once when the page loads; the weekly schedule does not refresh
   on its own, so reloading the page is what re-evaluates every row against the
   current time. All visual styling lives in style.css. */
(function () {
  var rows = document.querySelectorAll('.event-row[data-event-date][data-event-start]');
  if (!rows.length) return;

  var DAY_MS = 24 * 60 * 60 * 1000;

  // Build a local Date from "YYYY-MM-DD" + "HH:MM". Returns null on bad input.
  function parseDateTime(dateStr, timeStr) {
    var dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || '');
    var tm = /^(\d{1,2}):(\d{2})/.exec(timeStr || '');
    if (!dm || !tm) return null;
    return new Date(+dm[1], +dm[2] - 1, +dm[3], +tm[1], +tm[2], 0, 0);
  }

  function classify() {
    var now = new Date();
    for (var i = 0; i < rows.length; i++) {
      var el = rows[i];
      var date = el.getAttribute('data-event-date');
      var start = parseDateTime(date, el.getAttribute('data-event-start'));
      el.classList.remove('is-past', 'is-now');
      if (!start) continue;

      var endAttr = el.getAttribute('data-event-end');
      var end = endAttr ? parseDateTime(date, endAttr) : null;
      // An end at or before the start means the activity runs past midnight.
      if (end && end <= start) end = new Date(end.getTime() + DAY_MS);
      // With no end time the true duration is unknown: treat the activity as in
      // progress from its start until midnight of its day, then ended.
      if (!end) {
        end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 0, 0, 0, 0);
      }

      if (now >= end) {
        el.classList.add('is-past');
      } else if (now >= start && !el.classList.contains('is-ghost')) {
        // A ghost marker (02-§119.8) is only ever upcoming or past, never "now".
        el.classList.add('is-now');
      }
    }
  }

  // Evaluated once, on page load. The weekly schedule is a static page and
  // intentionally does not auto-refresh; a manual reload re-runs this.
  classify();
})();
