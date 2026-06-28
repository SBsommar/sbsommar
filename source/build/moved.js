'use strict';

// Server-side helpers for the moved-activity marking (02-§119). A moved event
// carries a `moved` mapping ({ from_date, from_start, from_end }) recording the
// slot it occupied before its most recent reschedule. The activity itself shows
// its previous time struck through next to its highlighted new time, and a
// minimal "ghost" marker is left at the slot it used to occupy.

const { escapeHtml, formatDateShort } = require('./utils');
const { GHOST_MAX_ACTIVITIES_BETWEEN } = require('../assets/js/client/ghost-config.js');

// True when the event carries a usable previous-slot marker.
function isMoved(e) {
  return !!(e && e.moved && e.moved.from_date && e.moved.from_start);
}

// True when a moved activity's previous-slot ghost should be suppressed
// (02-§119.19). A ghost is dropped only for a SAME-DAY move whose old and new
// slots are close together: at most GHOST_MAX_ACTIVITIES_BETWEEN activities
// start strictly between the old and new start time on that day. A cross-day
// move always keeps its ghost. `events` is the full event set; the moved
// activity itself is never counted.
function suppressGhost(e, events) {
  if (e.moved.from_date !== e.date) return false; // cross-day move always shows
  const lo = e.moved.from_start < e.start ? e.moved.from_start : e.start;
  const hi = e.moved.from_start < e.start ? e.start : e.moved.from_start;
  let between = 0;
  for (const other of events) {
    if (other === e) continue;
    if (other.date !== e.date) continue;
    if (other.start > lo && other.start < hi) between += 1;
  }
  return between <= GHOST_MAX_ACTIVITIES_BETWEEN;
}

// Format an "HH:MM" or "HH:MM–HH:MM" time range.
function timeRange(start, end) {
  return end ? `${start}–${end}` : String(start);
}

// "Flyttad till" target text for a moved activity (02-§119.9): the new day and
// time, or just the new time when the move stayed within the same day.
function movedToText(e) {
  const time = timeRange(e.start, e.end);
  return e.moved.from_date === e.date
    ? `Flyttad till ${time}`
    : `Flyttad till ${formatDateShort(e.date)} ${time}`;
}

// Previous-slot text shown struck through on the activity itself
// (02-§119.6, §119.7): the old day and time, or just the old time for a
// same-day move.
function movedFromText(e) {
  const time = timeRange(e.moved.from_start, e.moved.from_end);
  return e.moved.from_date === e.date ? time : `${formatDateShort(e.moved.from_date)} ${time}`;
}

// Inner HTML for the .ev-time cell of a moved activity: the new time highlighted
// in amber on top, the previous time struck through in smaller text directly
// below (02-§119.6). `newTimeStr` is the already-escaped current-time string.
function movedTimeHtml(e, newTimeStr) {
  return `<span class="ev-time-new">${newTimeStr}</span>`
    + `<span class="ev-time-old">${escapeHtml(movedFromText(e))}</span>`;
}

// True when the event carries a usable previous-location marker (02-§119.14).
function isRelocated(e) {
  return !!(e && e.relocated && e.relocated.from_location);
}

// Location cell HTML for an activity (02-§119.16): the new location as usual,
// preceded by the previous location struck through in small text when the
// activity has been relocated. Returns '' when the activity has no location.
function locationHtml(e) {
  if (!e.location) return isRelocated(e) ? `<span class="ev-loc-old">${escapeHtml(e.relocated.from_location)}</span>` : '';
  const current = escapeHtml(e.location);
  return isRelocated(e)
    ? `<span class="ev-loc-old">${escapeHtml(e.relocated.from_location)}</span> ${current}`
    : current;
}

// Build a previous-slot ghost marker for each moved activity (02-§119.8): a
// minimal pseudo-event positioned at the old date/start. Marked `_ghost` so the
// row renderer emits the stripped-down marker (title + "Flyttad till" only).
function buildGhosts(events) {
  return events.filter(isMoved).filter((e) => !suppressGhost(e, events)).map((e) => ({
    _ghost: true,
    title: e.title,
    date: e.moved.from_date,
    start: e.moved.from_start,
    end: e.moved.from_end || null,
    movedToText: movedToText(e),
  }));
}

module.exports = { isMoved, movedToText, movedFromText, movedTimeHtml, buildGhosts, isRelocated, locationHtml };
