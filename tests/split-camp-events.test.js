'use strict';

// Tests for the split-at-open maintenance step that moves a camp's seeded events
// (the camp YAML file's `events:` list) into one fragment file per event under
// source/data/<stem>/, then empties the camp file's `events:` list
// (02-§110.1..§110.8). Fixtures are hand-written in a temp directory — never a
// real or QA camp file.

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');

const {
  splitCampEvents,
  resolveCampFile,
  emptyEventsList,
} = require('../source/scripts/split-camp-events');
const { loadCampEvents } = require('../source/build/load-events');
const { validateFragment } = require('../source/scripts/lint-yaml');
const { scanYaml } = require('../source/scripts/check-yaml-security');

const CAMP_FILE = 'testcamp.yaml';
const STEM = 'testcamp';

function ev(over = {}) {
  return {
    id: 'fika-2026-06-23-1000',
    title: 'Fika',
    date: '2026-06-23',
    start: '10:00',
    end: '11:00',
    location: 'Salen',
    responsible: 'Alla',
    description: null,
    link: null,
    owner: { name: '', email: '' },
    meta: { created_at: '2026-02-27 09:16', updated_at: '2026-02-27 09:16' },
    ...over,
  };
}

function writeCampFile(dir, events) {
  const lines = [
    'camp:',
    '  id: testcamp',
    '  name: Testlager',
    '  location: Sysslebäck',
    "  start_date: '2026-06-22'",
    "  end_date: '2026-06-28'",
    'events:',
  ];
  for (const e of events) {
    lines.push(`  - id: ${e.id}`);
    lines.push(`    title: ${e.title}`);
    lines.push(`    date: '${e.date}'`);
    lines.push(`    start: '${e.start}'`);
    lines.push(`    end: '${e.end}'`);
    lines.push(`    location: ${e.location}`);
    lines.push(`    responsible: ${e.responsible}`);
    lines.push('    description: null');
    lines.push('    link: null');
    lines.push('    owner:');
    lines.push("      name: ''");
    lines.push("      email: ''");
    lines.push('    meta:');
    lines.push(`      created_at: '${e.meta.created_at}'`);
    lines.push(`      updated_at: '${e.meta.updated_at}'`);
  }
  fs.writeFileSync(path.join(dir, CAMP_FILE), lines.join('\n') + '\n', 'utf8');
}

function readCamp(dir) {
  return yaml.load(fs.readFileSync(path.join(dir, CAMP_FILE), 'utf8'));
}

function fragFiles(dir) {
  const fragDir = path.join(dir, STEM);
  if (!fs.existsSync(fragDir)) return [];
  return fs.readdirSync(fragDir).filter((f) => /\.ya?ml$/.test(f)).sort();
}

describe('split-camp-events (02-§110)', () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'split-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('SPLIT-01: writes one fragment per seeded event and empties the camp list (02-§110.1, §110.2, §110.3)', () => {
    const events = [
      ev({ id: 'fika-2026-06-23-1000' }),
      ev({ id: 'lunch-2026-06-23-1200', title: 'Lunch', start: '12:00', end: '13:00' }),
      ev({ id: 'middag-2026-06-23-1700', title: 'Middag', start: '17:00', end: '18:00' }),
    ];
    writeCampFile(dir, events);

    const result = splitCampEvents({ dataDir: dir, campFile: CAMP_FILE });

    assert.equal(result.skipped, false);
    assert.deepEqual(result.written.sort(), events.map((e) => e.id).sort());
    assert.deepEqual(fragFiles(dir), [
      'fika-2026-06-23-1000.yaml',
      'lunch-2026-06-23-1200.yaml',
      'middag-2026-06-23-1700.yaml',
    ]);

    const camp = readCamp(dir);
    assert.ok(camp.camp, 'camp: header is preserved');
    assert.equal(camp.camp.id, 'testcamp');
    assert.deepEqual(camp.events, [], 'events: list is emptied');
  });

  it('SPLIT-02: each fragment is a single event: mapping whose stem equals event.id (02-§110.2)', () => {
    writeCampFile(dir, [ev({ id: 'fika-2026-06-23-1000' })]);
    splitCampEvents({ dataDir: dir, campFile: CAMP_FILE });

    const file = path.join(dir, STEM, 'fika-2026-06-23-1000.yaml');
    const doc = yaml.load(fs.readFileSync(file, 'utf8'));
    assert.ok(doc.event && typeof doc.event === 'object');
    assert.equal(doc.event.id, 'fika-2026-06-23-1000');
    assert.equal(path.basename(file, '.yaml'), doc.event.id);
  });

  it('SPLIT-03: round-trips through loadCampEvents with no doubling (02-§110.4)', () => {
    const events = [
      ev({ id: 'fika-2026-06-23-1000' }),
      ev({ id: 'lunch-2026-06-24-1200', title: 'Lunch', date: '2026-06-24', start: '12:00', end: '13:00' }),
    ];
    writeCampFile(dir, events);

    const before = loadCampEvents(dir, CAMP_FILE).map((e) => e.id).sort();
    splitCampEvents({ dataDir: dir, campFile: CAMP_FILE });
    const after = loadCampEvents(dir, CAMP_FILE).map((e) => e.id).sort();

    assert.deepEqual(after, before, 'same event ids before and after, none doubled');
    assert.equal(after.length, 2);
  });

  it('SPLIT-04: produced fragments pass validateFragment and scanYaml (02-§110.5)', () => {
    writeCampFile(dir, [ev({ id: 'fika-2026-06-23-1000', description: 'Häng & fika i salen' })]);
    splitCampEvents({ dataDir: dir, campFile: CAMP_FILE });

    const content = fs.readFileSync(path.join(dir, STEM, 'fika-2026-06-23-1000.yaml'), 'utf8');
    assert.equal(validateFragment(content).ok, true);
    assert.equal(scanYaml(content).ok, true);
  });

  it('SPLIT-05: idempotent no-op when the camp list is already empty (02-§110.6)', () => {
    writeCampFile(dir, []);

    const first = splitCampEvents({ dataDir: dir, campFile: CAMP_FILE });
    assert.equal(first.skipped, true);
    assert.deepEqual(first.written, []);
    assert.deepEqual(fragFiles(dir), [], 'no fragment directory is created');

    // Running on a populated camp and then again is also a no-op the second time.
    writeCampFile(dir, [ev()]);
    splitCampEvents({ dataDir: dir, campFile: CAMP_FILE });
    const second = splitCampEvents({ dataDir: dir, campFile: CAMP_FILE });
    assert.equal(second.skipped, true);
    assert.deepEqual(second.written, []);
  });

  it('SPLIT-06: aborts without changes when a fragment for a seeded id already exists (02-§110.7)', () => {
    const events = [
      ev({ id: 'fika-2026-06-23-1000' }),
      ev({ id: 'lunch-2026-06-23-1200', title: 'Lunch', start: '12:00', end: '13:00' }),
    ];
    writeCampFile(dir, events);

    // A participant already has a fragment for one of the seeded ids.
    const fragDir = path.join(dir, STEM);
    fs.mkdirSync(fragDir, { recursive: true });
    const existing = 'event:\n  id: lunch-2026-06-23-1200\n  title: Annan lunch\n';
    fs.writeFileSync(path.join(fragDir, 'lunch-2026-06-23-1200.yaml'), existing, 'utf8');

    assert.throws(
      () => splitCampEvents({ dataDir: dir, campFile: CAMP_FILE }),
      /already exists/i,
    );

    // Nothing was written: the camp list still holds both events, no new fragment.
    const camp = readCamp(dir);
    assert.equal(camp.events.length, 2, 'camp events: list untouched');
    assert.deepEqual(fragFiles(dir), ['lunch-2026-06-23-1200.yaml'], 'only the pre-existing fragment exists');
    assert.equal(
      fs.readFileSync(path.join(fragDir, 'lunch-2026-06-23-1200.yaml'), 'utf8'),
      existing,
      'pre-existing fragment is not overwritten',
    );
  });

  it('SPLIT-07: synthesises default meta when a seeded event lacks it (02-§110.2, §110.5)', () => {
    writeCampFile(dir, [ev({ id: 'fika-2026-06-23-1000' })]);
    // Rewrite the camp file by hand without a meta block.
    fs.writeFileSync(
      path.join(dir, CAMP_FILE),
      [
        'camp:',
        '  id: testcamp',
        '  name: Testlager',
        '  location: Sysslebäck',
        "  start_date: '2026-06-22'",
        "  end_date: '2026-06-28'",
        'events:',
        '  - id: fika-2026-06-23-1000',
        '    title: Fika',
        "    date: '2026-06-23'",
        "    start: '10:00'",
        "    end: '11:00'",
        '    location: Salen',
        '    responsible: Alla',
      ].join('\n') + '\n',
      'utf8',
    );

    splitCampEvents({ dataDir: dir, campFile: CAMP_FILE });
    const content = fs.readFileSync(path.join(dir, STEM, 'fika-2026-06-23-1000.yaml'), 'utf8');
    assert.equal(validateFragment(content).ok, true);
    const doc = yaml.load(content);
    assert.match(String(doc.event.meta.created_at), /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('SPLIT-11: produced fragments carry no line-trailing whitespace (02-§110.5)', () => {
    // A multi-paragraph description: the blank line would otherwise become a line
    // of pure indentation, and the first line ends in a stray space.
    writeCampFile(dir, [ev({ id: 'fika-2026-06-23-1000', description: 'Rad ett. \n\nRad två.' })]);
    splitCampEvents({ dataDir: dir, campFile: CAMP_FILE });

    const content = fs.readFileSync(path.join(dir, STEM, 'fika-2026-06-23-1000.yaml'), 'utf8');
    assert.ok(!/[ \t]+$/m.test(content), `Expected no line-trailing whitespace, got: ${JSON.stringify(content)}`);
    assert.equal(validateFragment(content).ok, true);
  });

  describe('resolveCampFile', () => {
    beforeEach(() => {
      fs.writeFileSync(
        path.join(dir, 'camps.yaml'),
        [
          'camps:',
          '  - id: testcamp',
          '    name: Testlager',
          '    file: testcamp.yaml',
          "    start_date: '2026-06-22'",
          "    end_date: '2026-06-28'",
        ].join('\n') + '\n',
        'utf8',
      );
    });

    it('SPLIT-08: resolves a camp by id and by file name (02-§110.1)', () => {
      assert.equal(resolveCampFile(dir, 'testcamp'), 'testcamp.yaml');
      assert.equal(resolveCampFile(dir, 'testcamp.yaml'), 'testcamp.yaml');
    });

    it('SPLIT-09: throws for an unknown camp argument (02-§110.1)', () => {
      assert.throws(() => resolveCampFile(dir, 'nope'), /matches/i);
    });
  });

  it('SPLIT-10: emptyEventsList preserves the camp header verbatim (02-§110.3)', () => {
    writeCampFile(dir, [ev()]);
    const original = fs.readFileSync(path.join(dir, CAMP_FILE), 'utf8');
    const emptied = emptyEventsList(original);
    assert.match(emptied, /^camp:\n {2}id: testcamp\n/);
    assert.match(emptied, /\nevents: \[\]\n$/);
    assert.deepEqual(yaml.load(emptied).camp, yaml.load(original).camp);
  });
});
