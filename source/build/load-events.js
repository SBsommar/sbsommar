'use strict';

// Loads a camp's events by merging its YAML file's `events:` list with every
// `event:` mapping in its optional per-camp fragment directory
// `source/data/<stem>/` (02-§109.1, §109.13). Used by build.js for the active
// camp and by the archive loop for archived camps, so every view is built from
// the same merged set (02-§109.16).
//
// Integrity rules:
//   - a fragment's `event.id` must equal its filename stem (02-§109.19);
//   - if an id appears in both the camp file and a fragment, the fragment wins
//     and a warning is logged (02-§109.15).

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function loadCampEvents(dataDir, campFile) {
  const campData = yaml.load(fs.readFileSync(path.join(dataDir, campFile), 'utf8')) || {};
  const events = Array.isArray(campData.events) ? [...campData.events] : [];

  const stem = campFile.replace(/\.ya?ml$/, '');
  const fragDir = path.join(dataDir, stem);

  let fragFiles = [];
  try {
    if (fs.statSync(fragDir).isDirectory()) {
      fragFiles = fs.readdirSync(fragDir).filter((f) => /\.ya?ml$/.test(f)).sort();
    }
  } catch {
    // No fragment directory — file-only camp (02-§109.4).
    return events;
  }

  for (const file of fragFiles) {
    const rel = path.join(stem, file);
    const doc = yaml.load(fs.readFileSync(path.join(fragDir, file), 'utf8')) || {};
    const event = doc.event;
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      throw new Error(`Fragment ${rel} has no top-level "event:" mapping`);
    }

    const expectedId = file.replace(/\.ya?ml$/, '');
    if (event.id !== expectedId) {
      throw new Error(`Fragment ${rel}: event id "${event.id}" must equal filename stem "${expectedId}"`);
    }

    const idx = events.findIndex((e) => e && e.id === event.id);
    if (idx !== -1) {
      console.warn(`WARNING: event id "${event.id}" appears in both ${campFile} and a fragment; using the fragment`);
      events[idx] = event;
    } else {
      events.push(event);
    }
  }

  return events;
}

module.exports = { loadCampEvents };
