'use strict';

// Tests for the shared per-camp event loader that merges a camp's YAML file with
// its optional fragment directory (02-§109.1, §109.4, §109.13, §109.14, §109.15,
// §109.16, §109.19). Fixtures are hand-written in a temp directory — never a real
// or QA camp file (those are scratch data).

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { loadCampEvents } = require('../source/build/load-events');
const { groupAndSortEvents } = require('../source/build/render');

const CAMP_FILE = 'testcamp.yaml';

function writeCampFile(dir, events) {
  const lines = [
    'camp:',
    '  id: testcamp',
    '  name: Testlager',
    '  location: Här',
    "  start_date: '2026-06-22'",
    "  end_date: '2026-06-28'",
    'events:',
  ];
  for (const ev of events) {
    lines.push(`  - id: ${ev.id}`);
    lines.push(`    title: ${ev.title}`);
    lines.push(`    date: '${ev.date}'`);
    lines.push(`    start: '${ev.start}'`);
    lines.push(`    end: '${ev.end}'`);
    lines.push('    location: Salen');
    lines.push('    responsible: Alla');
  }
  fs.writeFileSync(path.join(dir, CAMP_FILE), lines.join('\n') + '\n', 'utf8');
}

function writeFragment(dir, fileName, event) {
  const fragDir = path.join(dir, 'testcamp');
  fs.mkdirSync(fragDir, { recursive: true });
  const e = {
    title: 'Frag', date: '2026-06-23', start: '10:00', end: '11:00',
    location: 'Salen', responsible: 'Alla', ...event,
  };
  const body = [
    'event:',
    `  id: ${e.id}`,
    `  title: ${e.title}`,
    `  date: '${e.date}'`,
    `  start: '${e.start}'`,
    `  end: '${e.end}'`,
    `  location: ${e.location}`,
    `  responsible: ${e.responsible}`,
  ].join('\n');
  fs.writeFileSync(path.join(fragDir, fileName), body + '\n', 'utf8');
}

describe('loadCampEvents — fragment merge (FRAG-01..09)', () => {
  let dir;
  beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'frag-')); });
  afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  it('FRAG-01: returns camp-file events unchanged when no fragment directory exists (02-§109.4)', () => {
    writeCampFile(dir, [{ id: 'a-2026-06-22-0800', title: 'A', date: '2026-06-22', start: '08:00', end: '09:00' }]);
    const events = loadCampEvents(dir, CAMP_FILE);
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].id, 'a-2026-06-22-0800');
  });

  it('FRAG-02: merges camp-file events with fragment events (02-§109.13)', () => {
    writeCampFile(dir, [{ id: 'a-2026-06-22-0800', title: 'A', date: '2026-06-22', start: '08:00', end: '09:00' }]);
    writeFragment(dir, 'b-2026-06-23-1000.yaml', { id: 'b-2026-06-23-1000', title: 'B' });
    writeFragment(dir, 'c-2026-06-24-1200.yaml', { id: 'c-2026-06-24-1200', title: 'C', date: '2026-06-24', start: '12:00', end: '13:00' });
    const ids = loadCampEvents(dir, CAMP_FILE).map((e) => e.id).sort();
    assert.deepStrictEqual(ids, ['a-2026-06-22-0800', 'b-2026-06-23-1000', 'c-2026-06-24-1200']);
  });

  it('FRAG-03: fragment events carry their full field set (02-§109.16)', () => {
    writeCampFile(dir, []);
    writeFragment(dir, 'b-2026-06-23-1000.yaml', { id: 'b-2026-06-23-1000', title: 'Bad', location: 'Stranden' });
    const ev = loadCampEvents(dir, CAMP_FILE).find((e) => e.id === 'b-2026-06-23-1000');
    assert.ok(ev);
    assert.strictEqual(ev.title, 'Bad');
    assert.strictEqual(ev.location, 'Stranden');
    assert.strictEqual(ev.start, '10:00');
  });

  it('FRAG-04: throws when a fragment id does not match its filename stem (02-§109.19)', () => {
    writeCampFile(dir, []);
    writeFragment(dir, 'b-2026-06-23-1000.yaml', { id: 'WRONG-ID', title: 'B' });
    assert.throws(() => loadCampEvents(dir, CAMP_FILE), /b-2026-06-23-1000/);
  });

  it('FRAG-05: fragment wins and a warning is logged when an id appears in both file and fragment (02-§109.15)', () => {
    writeCampFile(dir, [{ id: 'dup-2026-06-22-0800', title: 'Gammal', date: '2026-06-22', start: '08:00', end: '09:00' }]);
    writeFragment(dir, 'dup-2026-06-22-0800.yaml', { id: 'dup-2026-06-22-0800', title: 'Ny', date: '2026-06-22', start: '08:00', end: '09:00' });
    const warnings = [];
    const orig = console.warn;
    console.warn = (msg) => warnings.push(String(msg));
    let events;
    try { events = loadCampEvents(dir, CAMP_FILE); } finally { console.warn = orig; }
    const dup = events.filter((e) => e.id === 'dup-2026-06-22-0800');
    assert.strictEqual(dup.length, 1, 'exactly one event survives for the duplicate id');
    assert.strictEqual(dup[0].title, 'Ny', 'the fragment version wins');
    assert.ok(warnings.some((w) => w.includes('dup-2026-06-22-0800')), 'a warning naming the id is logged');
  });

  it('FRAG-06: an empty fragment directory yields the camp-file events only (02-§109.4)', () => {
    writeCampFile(dir, [{ id: 'a-2026-06-22-0800', title: 'A', date: '2026-06-22', start: '08:00', end: '09:00' }]);
    fs.mkdirSync(path.join(dir, 'testcamp'), { recursive: true });
    const events = loadCampEvents(dir, CAMP_FILE);
    assert.strictEqual(events.length, 1);
  });

  it('FRAG-07: ignores non-YAML files in the fragment directory', () => {
    writeCampFile(dir, []);
    writeFragment(dir, 'b-2026-06-23-1000.yaml', { id: 'b-2026-06-23-1000', title: 'B' });
    fs.writeFileSync(path.join(dir, 'testcamp', 'README.md'), '# not an event\n', 'utf8');
    const events = loadCampEvents(dir, CAMP_FILE);
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].id, 'b-2026-06-23-1000');
  });

  it('FRAG-08: every fragment is loaded regardless of directory read order (02-§109.13)', () => {
    writeCampFile(dir, []);
    writeFragment(dir, 'z-2026-06-24-1200.yaml', { id: 'z-2026-06-24-1200', title: 'Z', date: '2026-06-24', start: '12:00', end: '13:00' });
    writeFragment(dir, 'a-2026-06-23-1000.yaml', { id: 'a-2026-06-23-1000', title: 'A' });
    const ids = loadCampEvents(dir, CAMP_FILE).map((e) => e.id).sort();
    assert.deepStrictEqual(ids, ['a-2026-06-23-1000', 'z-2026-06-24-1200']);
  });

  it('FRAG-09: a merged fragment event sorts into its chronological position (02-§109.14)', () => {
    // Camp file has a morning and afternoon event; fragment is midday.
    writeCampFile(dir, [
      { id: 'morgon-2026-06-23-0800', title: 'Morgon', date: '2026-06-23', start: '08:00', end: '09:00' },
      { id: 'kvall-2026-06-23-2000', title: 'Kväll', date: '2026-06-23', start: '20:00', end: '21:00' },
    ]);
    writeFragment(dir, 'lunch-2026-06-23-1200.yaml', { id: 'lunch-2026-06-23-1200', title: 'Lunch', date: '2026-06-23', start: '12:00', end: '13:00' });
    const events = loadCampEvents(dir, CAMP_FILE);
    const { byDate } = groupAndSortEvents(events);
    const order = byDate['2026-06-23'].map((e) => e.id);
    assert.deepStrictEqual(order, ['morgon-2026-06-23-0800', 'lunch-2026-06-23-1200', 'kvall-2026-06-23-2000']);
  });
});
