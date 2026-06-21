'use strict';

// Split-at-open maintenance step (02-§110).
//
// A camp is seeded as a monolith: organizers handwrite the activities directly in
// the camp file's `events:` list. But add/edit/delete act only on fragment files
// and never write the camp file (02-§109.26), so once the camp opens a seeded
// event left in the camp file cannot be edited or deleted ("event hittas inte",
// 02-§109.12). This script moves a camp's seeded events into one fragment file
// per event under source/data/<stem>/ and empties the camp file's `events:` list,
// so every event lives where the live submission flow can reach it. It is the
// inverse of compaction; the two bracket the camp's fragment window:
//   split at open → fragments while live → compaction at archive.
//
// Usage: node source/scripts/split-camp-events.js <camp-file-or-id>
//
// See docs/03-architecture/data-layer.md §1.2 and docs/04-OPERATIONS.md.

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { buildFragmentYaml, assertFragmentYamlValid } = require('../api/github');
const { validateFragment } = require('./lint-yaml');
const { scanYaml } = require('./check-yaml-security');

const DEFAULT_DATA_DIR = 'source/data';
const CAMPS_FILE = 'camps.yaml';

// 'YYYY-MM-DD HH:MM', matching the timestamp the add/edit API writes into
// `meta` (source/api/github.js).
function nowStamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

// Resolve a CLI argument — a camp's `file` value or its `id` — to the camp's file
// name, looked up in camps.yaml (02-§110.1).
function resolveCampFile(dataDir, arg) {
  const campsPath = path.join(dataDir, CAMPS_FILE);
  const doc = yaml.load(fs.readFileSync(campsPath, 'utf8'));
  const camps = (doc && doc.camps) || [];
  const stem = String(arg).replace(/\.ya?ml$/, '');
  const match = camps.find(
    (c) => c && (c.id === stem || c.file === arg || String(c.file || '').replace(/\.ya?ml$/, '') === stem),
  );
  if (!match || !match.file) {
    throw new Error(`No camp in ${campsPath} matches "${arg}" (by id or file)`);
  }
  return match.file;
}

// Replace a camp file's `events:` list with an empty list while preserving the
// `camp:` header verbatim — no re-serialisation, so the header keeps its exact
// formatting (02-§110.3). The camp file is a `camp:` header followed by the
// `events:` list, so everything from the `events:` line onward is the list.
function emptyEventsList(content) {
  const lines = content.split('\n');
  const idx = lines.findIndex((l) => /^events:/.test(l));
  if (idx === -1) {
    throw new Error('camp file has no top-level "events:" key');
  }
  return lines.slice(0, idx).concat('events: []').join('\n') + '\n';
}

// Ensure an event has the `meta` block buildFragmentYaml requires. Seeded events
// usually carry it, but the data contract makes it optional in a camp file, so a
// hand-seeded event may omit it; synthesise timestamps in that case so the
// produced fragment is still valid (02-§110.2, §110.5).
function withMeta(event) {
  if (event.meta && event.meta.created_at && event.meta.updated_at) return event;
  const now = nowStamp();
  return { ...event, meta: { created_at: now, updated_at: now } };
}

// Split a single camp's seeded events into fragment files and empty its `events:`
// list (02-§110). Idempotent: a camp whose list is already empty is a no-op. On a
// fragment-id collision or any validation failure, nothing is written.
function splitCampEvents({ dataDir = DEFAULT_DATA_DIR, campFile }) {
  const campPath = path.join(dataDir, campFile);
  const content = fs.readFileSync(campPath, 'utf8');
  const doc = yaml.load(content);
  const events = (doc && Array.isArray(doc.events)) ? doc.events : [];

  // Idempotent no-op when there is nothing seeded to split (02-§110.6).
  if (events.length === 0) {
    return { campFile, written: [], skipped: true };
  }

  const stem = campFile.replace(/\.ya?ml$/, '');
  const fragDir = path.join(dataDir, stem);

  // Plan and validate every fragment before writing anything, so a collision or
  // a bad event aborts the whole run without leaving a half-split camp
  // (02-§110.4, §110.7).
  const seen = new Set();
  const planned = events.map((raw) => {
    const event = withMeta(raw);
    const id = event.id;
    if (seen.has(id)) {
      throw new Error(`Duplicate event id "${id}" in ${campFile}; aborting without changes`);
    }
    seen.add(id);

    const fragPath = path.join(fragDir, `${id}.yaml`);
    if (fs.existsSync(fragPath)) {
      throw new Error(`Fragment already exists for "${id}" (${fragPath}); aborting without changes`);
    }

    // buildFragmentYaml indents every description line, so a blank line in a
    // multi-paragraph description becomes a line of pure indentation, and a
    // seeded line may end in a stray space. Strip line-trailing whitespace so
    // the fragment file carries none (cleaner than the live API serialiser).
    const fragContent = buildFragmentYaml(event).replace(/[ \t]+$/gm, '') + '\n';
    assertFragmentYamlValid(fragContent, id);
    const lint = validateFragment(fragContent);
    if (!lint.ok) {
      throw new Error(`Fragment for "${id}" failed validation: ${lint.errors.join('; ')}`);
    }
    const sec = scanYaml(fragContent);
    if (!sec.ok) {
      throw new Error(`Fragment for "${id}" failed security scan: ${sec.findings.join('; ')}`);
    }
    return { id, fragPath, fragContent };
  });

  // All fragments are valid and none collide — write them, then empty the list.
  fs.mkdirSync(fragDir, { recursive: true });
  for (const p of planned) {
    fs.writeFileSync(p.fragPath, p.fragContent, 'utf8');
  }
  fs.writeFileSync(campPath, emptyEventsList(content), 'utf8');

  return { campFile, written: planned.map((p) => p.id), skipped: false };
}

module.exports = { splitCampEvents, resolveCampFile, emptyEventsList };

if (require.main === module) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node source/scripts/split-camp-events.js <camp-file-or-id>');
    process.exit(2);
  }
  try {
    const campFile = resolveCampFile(DEFAULT_DATA_DIR, arg);
    const result = splitCampEvents({ campFile });
    const stem = campFile.replace(/\.ya?ml$/, '');
    if (result.skipped) {
      console.log(`No seeded events in ${campFile}; nothing to split (no-op).`);
    } else {
      console.log(`Split ${result.written.length} event(s) from ${campFile} into source/data/${stem}/:`);
      result.written.forEach((id) => console.log(`  - ${id}.yaml`));
      console.log(`Emptied the ${campFile} events: list. Review the diff and commit the change.`);
    }
  } catch (e) {
    console.error(`split-camp-events: ${e.message}`);
    process.exit(1);
  }
}
