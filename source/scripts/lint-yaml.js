'use strict';

// Validates a per-camp event YAML file against the data contract.
//
// Usage (CLI):  node source/scripts/lint-yaml.js <path-to-yaml>
// Usage (API):  const { validateYaml } = require('./lint-yaml')
//               const { ok, errors } = validateYaml(yamlString)
//
// Exits 0 on success, 1 on any validation failure (CLI mode only).

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const CAMP_REQUIRED = ['id', 'name', 'location', 'start_date', 'end_date'];
const EVENT_REQUIRED = ['id', 'title', 'date', 'start', 'end', 'location', 'responsible'];

// ── Per-event validation ────────────────────────────────────────────────────
// Validates a single event object against the data contract and returns an array
// of error strings (empty when valid). Shared by validateYaml (camp file) and
// validateFragment (fragment file, 02-§109.18). The camp date range and the
// duplicate-tracking sets are optional: a standalone fragment has neither.
function validateEventObject(event, ref, opts = {}) {
  const { campStart, campEnd, seenIds, seenCombos } = opts;
  const errors = [];

  // Required fields
  for (const field of EVENT_REQUIRED) {
    const val = event[field];
    if (val === undefined || val === null || val === '') {
      errors.push(`${ref}: required field "${field}" is missing or empty`);
    }
  }

  // Duplicate IDs (only when tracking across a set of events)
  if (seenIds && event.id) {
    if (seenIds.has(event.id)) errors.push(`${ref}: duplicate id "${event.id}"`);
    seenIds.add(event.id);
  }

  // Unique (title + date + start) combo (05-§5.1)
  if (seenCombos && event.title && event.date && event.start) {
    const combo = `${String(event.title).trim()}|${String(event.date)}|${String(event.start)}`;
    if (seenCombos.has(combo)) {
      errors.push(`${ref}: duplicate (title+date+start) kombination "${event.title}" / ${event.date} / ${event.start}`);
    }
    seenCombos.add(combo);
  }

  // Date format and calendar validity
  if (event.date) {
    const d = String(event.date);
    if (!DATE_RE.test(d)) {
      errors.push(`${ref}: date must be YYYY-MM-DD, got "${d}"`);
    } else if (isNaN(new Date(d).getTime())) {
      errors.push(`${ref}: date "${d}" is not a valid calendar date`);
    } else if (campStart && campEnd) {
      if (d < campStart || d > campEnd) {
        errors.push(`${ref}: date "${d}" is outside camp range ${campStart}–${campEnd}`);
      }
    }
  }

  // Time format
  if (event.start !== undefined && event.start !== null) {
    const s = String(event.start);
    if (!TIME_RE.test(s)) errors.push(`${ref}: start must be HH:MM, got "${s}"`);
  }
  if (event.end !== undefined && event.end !== null) {
    const e = String(event.end);
    if (!TIME_RE.test(e)) errors.push(`${ref}: end must be HH:MM, got "${e}"`);
  }

  // End after start (midnight crossing allowed if duration ≤ 17 h / 1020 min)
  if (event.start && event.end) {
    const s = String(event.start);
    const e = String(event.end);
    if (TIME_RE.test(s) && TIME_RE.test(e)) {
      if (e === s) {
        errors.push(`${ref}: end "${e}" must be strictly after start "${s}"`);
      } else if (e < s) {
        const sMins = parseInt(s.slice(0, 2), 10) * 60 + parseInt(s.slice(3), 10);
        const eMins = parseInt(e.slice(0, 2), 10) * 60 + parseInt(e.slice(3), 10);
        const dur = (1440 - sMins) + eMins;
        if (dur > 1020) errors.push(`${ref}: end "${e}" must be strictly after start "${s}"`);
      }
    }
  }

  // Optional field type checks
  if (event.description !== undefined && event.description !== null && typeof event.description !== 'string') {
    errors.push(`${ref}: description must be a string or null`);
  }
  if (event.link !== undefined && event.link !== null && typeof event.link !== 'string') {
    errors.push(`${ref}: link must be a string or null`);
  }

  return errors;
}

// ── Core validation ───────────────────────────────────────────────────────────

// Validates a YAML string representing a per-camp event file.
// Returns { ok: true } or { ok: false, errors: string[] }.
function validateYaml(content) {
  const errors = [];

  // Parse
  let data;
  try {
    data = yaml.load(content);
  } catch (e) {
    return { ok: false, errors: [`YAML parse error: ${e.message}`] };
  }

  if (!data || typeof data !== 'object') {
    return { ok: false, errors: ['File does not contain a YAML object'] };
  }

  // ── Camp metadata ──────────────────────────────────────────────────────────

  const camp = data.camp;
  if (!camp) {
    errors.push('Missing top-level "camp" key');
    return { ok: false, errors };
  }

  for (const field of CAMP_REQUIRED) {
    if (!camp[field]) {
      errors.push(`camp.${field} is required`);
    }
  }

  const campStart = camp.start_date ? String(camp.start_date) : '';
  const campEnd   = camp.end_date   ? String(camp.end_date)   : '';

  if (campStart && !DATE_RE.test(campStart)) {
    errors.push(`camp.start_date must be YYYY-MM-DD, got: ${campStart}`);
  }
  if (campEnd && !DATE_RE.test(campEnd)) {
    errors.push(`camp.end_date must be YYYY-MM-DD, got: ${campEnd}`);
  }
  if (campStart && campEnd && DATE_RE.test(campStart) && DATE_RE.test(campEnd) && campEnd < campStart) {
    errors.push(`camp.end_date must be on or after camp.start_date`);
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  if (!Array.isArray(data.events)) {
    errors.push('Missing or invalid "events" array');
    return { ok: false, errors };
  }

  const seenIds = new Set();
  const seenCombos = new Set();

  data.events.forEach((event, idx) => {
    const ref = `events[${idx}] (id: ${event.id || 'MISSING'})`;
    errors.push(...validateEventObject(event, ref, { campStart, campEnd, seenIds, seenCombos }));
  });

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

// Validates a fragment file: a document with a single top-level `event:` mapping
// (02-§109.17, §109.18). Field, date, and time rules match a camp-file event;
// the camp date range is not checked here (a fragment carries no camp context).
function validateFragment(content) {
  let data;
  try {
    data = yaml.load(content);
  } catch (e) {
    return { ok: false, errors: [`YAML parse error: ${e.message}`] };
  }
  if (!data || typeof data !== 'object') {
    return { ok: false, errors: ['File does not contain a YAML object'] };
  }
  const event = data.event;
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    return { ok: false, errors: ['Missing top-level "event" mapping'] };
  }

  const ref = `event (id: ${event.id || 'MISSING'})`;
  const errors = validateEventObject(event, ref, {});
  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

module.exports = { validateYaml, validateFragment, validateEventObject };

// ── CLI entry point ───────────────────────────────────────────────────────────

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node source/scripts/lint-yaml.js <path-to-yaml>');
    process.exit(1);
  }

  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(1);
  }

  let content;
  try {
    content = fs.readFileSync(abs, 'utf8');
  } catch (e) {
    console.error(`Cannot read file: ${e.message}`);
    process.exit(1);
  }

  // A document with a top-level `event:` mapping is a fragment file (02-§109.17);
  // anything else is validated as a full per-camp file.
  let parsed = null;
  try { parsed = yaml.load(content); } catch { /* validators report parse errors */ }
  const isFragment = parsed && typeof parsed === 'object' && parsed.event && !parsed.events;

  if (isFragment) {
    const { ok, errors } = validateFragment(content);
    // The fragment's id must equal its filename stem (02-§109.19).
    const stem = path.basename(abs).replace(/\.ya?ml$/, '');
    const fragErrors = ok ? [] : [...errors];
    if (parsed.event && parsed.event.id !== undefined && parsed.event.id !== stem) {
      fragErrors.push(`event id "${parsed.event.id}" must equal the filename stem "${stem}"`);
    }
    if (fragErrors.length > 0) {
      for (const err of fragErrors) console.error(`LINT ERROR: ${err}`);
      process.exit(1);
    }
    console.log(`OK: fragment ${stem} validated in ${filePath}`);
  } else {
    const { ok, errors } = validateYaml(content);
    if (!ok) {
      for (const err of errors) console.error(`LINT ERROR: ${err}`);
      process.exit(1);
    }
    const count = Array.isArray(parsed && parsed.events) ? parsed.events.length : 0;
    console.log(`OK: ${count} events validated in ${filePath}`);
  }
}
