'use strict';

// Flags the later-booked event in each same-location time clash so the schedule
// can mark it (02-§120). A "lokalkrock" is two non-cancelled events on the same
// date, in the same real room, whose times overlap; the one created later (by
// meta.created_at) is the offender and gets `_clash = true`. The earlier booking
// keeps the room and is left unmarked.
//
// The catch-all "Annat" / "[annat]" location is never a real room, so it can
// never be in conflict.

const { overlaps } = require('../assets/js/client/conflict-check.js');

// True when `loc` names a real, bookable room. The catch-all "Annat" (and the
// "[annat]" form shown in the schedule) is excluded — it never clashes.
function isRealLocation(loc) {
  if (!loc) return false;
  const norm = String(loc).trim().toLowerCase().replace(/[[\]]/g, '').trim();
  return norm !== 'annat';
}

// Communal meals everyone shares. They are ignored by the clash logic entirely:
// a meal is never flagged and never causes another activity to be flagged
// (02-§120.7).
const IGNORED_TITLES = new Set(['lunch', 'middag']);
function isIgnoredActivity(e) {
  return !!(e && e.title && IGNORED_TITLES.has(String(e.title).trim().toLowerCase()));
}

// Comparable creation time in epoch milliseconds. YAML parses an ISO timestamp
// (`2026-02-27T09:12:59Z`) into a Date object but leaves a space-separated one
// (`2026-06-27 00:40`) as a string, so the two must not be compared as raw text
// — `new Date(...)` normalises both. A missing or unparseable created_at sorts
// earliest, so it counts as the original booking and is never the one flagged.
function createdMs(e) {
  const v = e && e.meta ? e.meta.created_at : null;
  if (!v) return -Infinity;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? -Infinity : t;
}

// Sets `_clash = true` on every event that overlaps an EARLIER-created event in
// the same real room on the same date. Cancelled events have freed the room, so
// they neither clash nor cause a clash. Mutates and returns `events`.
function markLocationClashes(events) {
  for (const e of events) {
    if (e.cancelled || isIgnoredActivity(e) || !isRealLocation(e.location)) continue;
    const ems = createdMs(e);
    for (const f of events) {
      if (f === e || f.cancelled || isIgnoredActivity(f)) continue;
      if (f.date !== e.date || f.location !== e.location) continue;
      if (!overlaps(e, f)) continue;
      // `e` came after `f` (created later) and they share the room — mark `e`.
      if (createdMs(f) < ems) {
        e._clash = true;
        break;
      }
    }
  }
  return events;
}

module.exports = { markLocationClashes, isRealLocation, isIgnoredActivity };
