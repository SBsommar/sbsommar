'use strict';

const yaml = require('js-yaml');

// ── isEventPast ───────────────────────────────────────────────────────────────

// Returns true if the event date (YYYY-MM-DD) is strictly before today's
// local date.  Today itself is not considered past.
function isEventPast(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

// ── patchEventInYaml ─────────────────────────────────────────────────────────

// Find the event with eventId inside a full camp YAML string, replace its
// mutable fields with `updates`, and return the new YAML string.
// Returns null if no event with that ID is found.
//
// Mutable fields: title, date, start, end, location, responsible,
//                 description, link.
// Immutable:      id, owner.
// Auto-updated:   meta.updated_at.
function patchEventInYaml(yamlContent, eventId, updates) {
  const data = yaml.load(yamlContent);
  if (!data || !Array.isArray(data.events)) return null;

  const idx = data.events.findIndex((e) => e.id === eventId);
  if (idx === -1) return null;

  const event = data.events[idx];
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  data.events[idx] = {
    id:          event.id,
    title:       'title'       in updates ? (updates.title       || event.title)       : event.title,
    date:        'date'        in updates ? (updates.date        || event.date)        : event.date,
    start:       'start'       in updates ? (updates.start       || event.start)       : event.start,
    end:         'end'         in updates ? (updates.end   || null)                    : event.end,
    location:    'location'    in updates ? (updates.location    || event.location)    : event.location,
    responsible: 'responsible' in updates ? (updates.responsible || event.responsible) : event.responsible,
    description: 'description' in updates ? (updates.description || null)              : event.description,
    link:        'link'        in updates ? (updates.link        || null)              : event.link,
    owner:       event.owner,
    meta: {
      created_at: event.meta ? event.meta.created_at : null,
      updated_at: now,
    },
  };

  return yaml.dump(data, { lineWidth: -1, noRefs: true });
}

// ── patchEventObject ─────────────────────────────────────────────────────────

// Apply `updates` to a single event object, returning a new object with the same
// mutable-field rules as patchEventInYaml. Used for fragment edits (02-§109.10),
// where the event lives in its own file rather than the camp file's events list.
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

// ── removeEventFromYaml ──────────────────────────────────────────────────────

// Find the event with eventId inside a full camp YAML string and remove it
// entirely from the events array.  Returns the new YAML string, or null if no
// event with that ID is found.
function removeEventFromYaml(yamlContent, eventId) {
  let data;
  try { data = yaml.load(yamlContent); } catch { return null; }
  if (!data || !Array.isArray(data.events)) return null;

  const idx = data.events.findIndex((e) => e.id === eventId);
  if (idx === -1) return null;

  data.events.splice(idx, 1);
  return yaml.dump(data, { lineWidth: -1, noRefs: true });
}

module.exports = { isEventPast, patchEventInYaml, patchEventObject, removeEventFromYaml };
