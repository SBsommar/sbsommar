'use strict';

// ── isEventPast ───────────────────────────────────────────────────────────────

// Returns true if the event date (YYYY-MM-DD) is strictly before today's
// local date.  Today itself is not considered past.
function isEventPast(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

// ── patchEventObject ─────────────────────────────────────────────────────────

// Apply `updates` to a single event object, returning a new object with the
// project's mutable-field rules. This is the only event-edit path: every event
// lives in its own fragment file, so edits rewrite that file rather than the
// camp YAML list (02-§109.9, §109.10, §109.26).
// Immutable: id, owner. Auto-updated: meta.updated_at (created_at preserved).
function patchEventObject(event, updates, now) {
  return {
    id:          event.id,
    title:       'title'       in updates ? (updates.title       || event.title)       : event.title,
    date:        'date'        in updates ? (updates.date        || event.date)        : event.date,
    start:       'start'       in updates ? (updates.start       || event.start)       : event.start,
    end:         'end'         in updates ? (updates.end   || null)                    : event.end,
    location:    'location'    in updates ? (updates.location    || event.location)    : event.location,
    responsible: 'responsible' in updates ? (updates.responsible || event.responsible) : event.responsible,
    description: 'description' in updates ? (updates.description || null)              : (event.description ?? null),
    link:        'link'        in updates ? (updates.link        || null)              : (event.link ?? null),
    owner:       event.owner || { name: '', email: '' },
    meta: {
      created_at: event.meta ? event.meta.created_at : null,
      updated_at: now,
    },
  };
}

module.exports = { isEventPast, patchEventObject };
