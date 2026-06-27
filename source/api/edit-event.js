'use strict';

// ── isEventPast ───────────────────────────────────────────────────────────────

// Returns true if the event date (YYYY-MM-DD) is strictly before today's
// local date.  Today itself is not considered past.
function isEventPast(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

// ── moved (rescheduled-activity marker) ───────────────────────────────────────

// Normalise a raw `moved` value from a loaded event into either null or a clean
// { from_date, from_start, from_end } object. A marker is only meaningful with a
// previous date and start; from_end may be null (02-§119.1).
function normaliseMoved(raw) {
  if (!raw || typeof raw !== 'object' || !raw.from_date || !raw.from_start) return null;
  return {
    from_date:  String(raw.from_date),
    from_start: String(raw.from_start),
    from_end:   raw.from_end ? String(raw.from_end) : null,
  };
}

// Decide the event's `moved` marker after an edit (02-§119.3–§119.5):
//   - if the edit changed date/start/end, record the slot it left;
//   - unless that move returns it to the slot already recorded in `moved`, in
//     which case the marker is cleared (it is back where it started);
//   - a text-only edit (no date/start/end change) keeps the existing marker.
function resolveMoved(event, newDate, newStart, newEnd) {
  const oldDate  = event.date;
  const oldStart = event.start;
  const oldEnd   = event.end ?? null;
  const prev     = normaliseMoved(event.moved);

  const timeChanged = newDate !== oldDate || newStart !== oldStart || newEnd !== oldEnd;
  if (!timeChanged) return prev;

  if (prev
      && prev.from_date === newDate
      && prev.from_start === newStart
      && (prev.from_end ?? null) === newEnd) {
    return null;
  }
  return { from_date: oldDate, from_start: oldStart, from_end: oldEnd };
}

// ── patchEventObject ─────────────────────────────────────────────────────────

// Apply `updates` to a single event object, returning a new object with the
// project's mutable-field rules. This is the only event-edit path: every event
// lives in its own fragment file, so edits rewrite that file rather than the
// camp YAML list (02-§109.9, §109.10, §109.26).
// Immutable: id, owner. Auto-updated: meta.updated_at (created_at preserved),
// moved (the rescheduled-activity marker, 02-§119).
function patchEventObject(event, updates, now) {
  const date  = 'date'  in updates ? (updates.date  || event.date)  : event.date;
  const start = 'start' in updates ? (updates.start || event.start) : event.start;
  const end   = 'end'   in updates ? (updates.end   || null)        : (event.end ?? null);

  const moved = resolveMoved(event, date, start, end);

  const patched = {
    id:          event.id,
    title:       'title'       in updates ? (updates.title       || event.title)       : event.title,
    date,
    start,
    end,
    location:    'location'    in updates ? (updates.location    || event.location)    : event.location,
    responsible: 'responsible' in updates ? (updates.responsible || event.responsible) : event.responsible,
    description: 'description' in updates ? (updates.description || null)              : (event.description ?? null),
    link:        'link'        in updates ? (updates.link        || null)              : (event.link ?? null),
    cancelled:   'cancelled'   in updates ? Boolean(updates.cancelled)                 : Boolean(event.cancelled),
    owner:       event.owner || { name: '', email: '' },
    meta: {
      created_at: event.meta ? event.meta.created_at : null,
      updated_at: now,
    },
  };
  if (moved) patched.moved = moved;
  return patched;
}

module.exports = { isEventPast, patchEventObject, normaliseMoved, resolveMoved };
