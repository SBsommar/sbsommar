'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { slugify, yamlScalar, buildEventYaml, detectEventIndent, assertEventYamlValid } = require('../source/api/github');

// ── slugify ───────────────────────────────────────────────────────────────────

describe('slugify', () => {
  it('lowercases ASCII text', () => {
    assert.strictEqual(slugify('Hello World'), 'hello-world');
  });

  it('replaces å and ä with a', () => {
    assert.strictEqual(slugify('åäng'), 'aang');
  });

  it('replaces ö with o', () => {
    assert.strictEqual(slugify('öppen'), 'oppen');
  });

  it('handles a typical Swedish event title', () => {
    assert.strictEqual(slugify('Välkommen till lägret'), 'valkommen-till-lagret');
  });

  it('collapses multiple non-alphanumeric chars into a single hyphen', () => {
    assert.strictEqual(slugify('a  --  b'), 'a-b');
  });

  it('removes leading and trailing hyphens', () => {
    assert.strictEqual(slugify('  hello  '), 'hello');
  });

  it('removes all special characters', () => {
    assert.strictEqual(slugify('C# & D!'), 'c-d');
  });

  it('caps output at 48 characters', () => {
    const long = 'a'.repeat(100);
    assert.strictEqual(slugify(long).length, 48);
  });

  it('does not exceed 48 chars with Swedish chars that expand', () => {
    // å → a (no length change), so this just verifies the cap
    const result = slugify('å'.repeat(60));
    assert.ok(result.length <= 48, `Length ${result.length} exceeds 48`);
  });

  it('returns empty string for all-special input', () => {
    assert.strictEqual(slugify('!!! ???'), '');
  });

  it('handles numbers', () => {
    assert.strictEqual(slugify('Event 2026'), 'event-2026');
  });
});

// ── yamlScalar ────────────────────────────────────────────────────────────────

describe('yamlScalar', () => {
  it('returns null for null input', () => {
    assert.strictEqual(yamlScalar(null), 'null');
  });

  it('returns null for undefined input', () => {
    assert.strictEqual(yamlScalar(undefined), 'null');
  });

  it("returns '' for empty string", () => {
    assert.strictEqual(yamlScalar(''), "''");
  });

  it('returns plain text unchanged for safe strings', () => {
    assert.strictEqual(yamlScalar('Hello world'), 'Hello world');
  });

  it('quotes strings containing a colon', () => {
    const r = yamlScalar('key: value');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
    assert.ok(r.endsWith("'"), `Expected quoted, got: ${r}`);
    assert.ok(r.includes('key: value'), `Expected content preserved, got: ${r}`);
  });

  it('quotes strings containing a hash', () => {
    const r = yamlScalar('value # comment');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
  });

  it('quotes strings starting with a digit', () => {
    const r = yamlScalar('1 Laget');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
  });

  it('quotes strings with leading whitespace', () => {
    const r = yamlScalar(' leading');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
  });

  it('quotes strings with trailing whitespace', () => {
    const r = yamlScalar('trailing ');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
  });

  it("escapes embedded single quotes by doubling them (when string requires quoting)", () => {
    // Strings that contain ':' get quoted; any ' inside must be doubled.
    const r = yamlScalar("key: it's value");
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
    assert.ok(r.includes("''"), `Expected doubled single quote, got: ${r}`);
  });

  it("quotes and escapes a string that starts with a single quote", () => {
    // Starts with ' → matches /^[\s"'0-9]/ → gets quoted, inner ' doubled
    const r = yamlScalar("'hello'");
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
    assert.ok(r.includes("''hello''"), `Expected doubled quotes around content, got: ${r}`);
  });

  it('quotes strings starting with double-quote character', () => {
    const r = yamlScalar('"quoted"');
    assert.ok(r.startsWith("'"), `Expected quoted, got: ${r}`);
  });
});

// ── buildEventYaml ────────────────────────────────────────────────────────────

describe('buildEventYaml', () => {
  function baseEvent(overrides = {}) {
    return {
      id: 'frukost-2025-06-22-0800',
      title: 'Frukost',
      date: '2025-06-22',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
      description: null,
      link: null,
      owner: { name: 'Anna Andersson', email: '' },
      meta: { created_at: '2025-06-22 07:00', updated_at: '2025-06-22 07:00' },
      ...overrides,
    };
  }

  it('starts with the event id as the YAML list item', () => {
    const yaml = buildEventYaml(baseEvent());
    assert.ok(yaml.startsWith('- id: frukost-2025-06-22-0800'), `Got: ${yaml}`);
  });

  it('includes title field', () => {
    const yaml = buildEventYaml(baseEvent({ title: 'Frukost' }));
    assert.ok(yaml.includes('title: Frukost'), `Got: ${yaml}`);
  });

  it('includes date, start, end as quoted strings', () => {
    const yaml = buildEventYaml(baseEvent());
    assert.ok(yaml.includes("date: '2025-06-22'"), `Got: ${yaml}`);
    assert.ok(yaml.includes("start: '08:00'"), `Got: ${yaml}`);
    assert.ok(yaml.includes("end: '09:00'"), `Got: ${yaml}`);
  });

  it('includes location and responsible', () => {
    const yaml = buildEventYaml(baseEvent());
    assert.ok(yaml.includes('location: Matsalen'), `Got: ${yaml}`);
    assert.ok(yaml.includes('responsible: Alla'), `Got: ${yaml}`);
  });

  it('writes description: null when description is null', () => {
    const yaml = buildEventYaml(baseEvent({ description: null }));
    assert.ok(yaml.includes('description: null'), `Got: ${yaml}`);
  });

  it('writes description as a literal block scalar (|) when present', () => {
    const yaml = buildEventYaml(baseEvent({ description: 'Kom hungrig.' }));
    assert.ok(yaml.includes('description: |'), `Got: ${yaml}`);
    assert.ok(yaml.includes('Kom hungrig.'), `Got: ${yaml}`);
  });

  it('indents each description line by 4 spaces', () => {
    const yaml = buildEventYaml(baseEvent({ description: 'Line one.\nLine two.' }));
    assert.ok(yaml.includes('    Line one.'), `Got: ${yaml}`);
    assert.ok(yaml.includes('    Line two.'), `Got: ${yaml}`);
  });

  it('writes link: null when link is null', () => {
    const yaml = buildEventYaml(baseEvent({ link: null }));
    assert.ok(yaml.includes('link: null'), `Got: ${yaml}`);
  });

  it('writes link value when link is present', () => {
    const yaml = buildEventYaml(baseEvent({ link: 'https://example.com' }));
    assert.ok(yaml.includes("link: 'https://example.com'"), `Got: ${yaml}`);
  });

  it('includes owner name', () => {
    const yaml = buildEventYaml(baseEvent());
    assert.ok(yaml.includes('name:'), `Got: ${yaml}`);
    assert.ok(yaml.includes('Anna Andersson'), `Got: ${yaml}`);
  });

  it("escapes single quotes in owner name", () => {
    const yaml = buildEventYaml(baseEvent({ owner: { name: "O'Brien", email: '' } }));
    assert.ok(yaml.includes("O''Brien"), `Expected escaped single quote, got: ${yaml}`);
  });

  it('includes meta created_at and updated_at', () => {
    const yaml = buildEventYaml(baseEvent());
    assert.ok(yaml.includes('created_at: 2025-06-22 07:00'), `Got: ${yaml}`);
    assert.ok(yaml.includes('updated_at: 2025-06-22 07:00'), `Got: ${yaml}`);
  });

  it('applies yamlScalar to title with special chars', () => {
    const yaml = buildEventYaml(baseEvent({ title: 'Lunch: pasta & sallad' }));
    // colon in title should cause it to be quoted
    assert.ok(yaml.includes("'Lunch: pasta & sallad'"), `Got: ${yaml}`);
  });

  it('produces output parseable as valid YAML structure', () => {
    const yaml = require('js-yaml');
    const block = buildEventYaml(baseEvent({ description: 'Multi\nline.' }));
    // buildEventYaml emits a YAML list item (starts with "- "), so yaml.load
    // returns an array; the event is at index 0.
    const parsed = yaml.load(block);
    assert.ok(Array.isArray(parsed), `Expected array, got: ${typeof parsed}`);
    const event = parsed[0];
    assert.strictEqual(event.id, 'frukost-2025-06-22-0800');
    assert.strictEqual(event.title, 'Frukost');
    assert.ok(event.description.includes('Multi'), `Got: ${JSON.stringify(event.description)}`);
  });

  it('GH-39 (02-§10.6): accepts an indent parameter and indents the list marker', () => {
    const block = buildEventYaml(baseEvent(), 2);
    const firstLine = block.split('\n')[0];
    assert.ok(firstLine.startsWith('  - id:'), `Expected 2-space indent on "- id:", got: "${firstLine}"`);
  });

  it('GH-40 (02-§10.6): indents all field lines by indent + 2 when indent is provided', () => {
    const block = buildEventYaml(baseEvent(), 2);
    const lines = block.split('\n');
    // Second line should be "    title:" (4 spaces = 2 indent + 2 field)
    const titleLine = lines.find((l) => l.includes('title:'));
    assert.ok(titleLine.startsWith('    '), `Expected 4-space indent on title line, got: "${titleLine}"`);
  });

  it('GH-41 (02-§10.6): indented output appended to a camp file produces valid YAML', () => {
    const yaml = require('js-yaml');
    const campFile = [
      'camp:',
      '  id: test-camp',
      '  name: Test',
      '  location: Here',
      "  start_date: '2025-06-22'",
      "  end_date: '2025-06-28'",
      'events:',
      '  - id: existing-event',
      "    title: 'Existing'",
      "    date: '2025-06-22'",
      "    start: '10:00'",
      "    end: '11:00'",
      '    location: There',
      '    responsible: Someone',
      '    description: null',
      '    link: null',
      '    owner:',
      "      name: ''",
      "      email: ''",
      '    meta:',
      '      created_at: 2025-06-22 07:00',
      '      updated_at: 2025-06-22 07:00',
    ].join('\n');

    const newEvent = buildEventYaml(baseEvent(), 2);
    const combined = campFile.trimEnd() + '\n' + newEvent + '\n';
    const parsed = yaml.load(combined);

    assert.ok(parsed.events, 'Parsed YAML must have events key');
    assert.strictEqual(parsed.events.length, 2, `Expected 2 events, got ${parsed.events.length}`);
    assert.strictEqual(parsed.events[1].id, 'frukost-2025-06-22-0800');
  });

  it('GH-42 (02-§10.6): description block scalar lines are indented correctly with indent', () => {
    const block = buildEventYaml(baseEvent({ description: 'Line one.\nLine two.' }), 2);
    // description lines should be at indent + 4 (2 + 4 = 6 spaces)
    assert.ok(block.includes('      Line one.'), `Expected 6-space indent on description, got:\n${block}`);
    assert.ok(block.includes('      Line two.'), `Expected 6-space indent on description, got:\n${block}`);
  });

  it('GH-43 (02-§10.6): owner sub-fields are indented correctly with indent', () => {
    const block = buildEventYaml(baseEvent(), 2);
    // "owner:" at indent+2 = 4, "name:" at indent+4 = 6
    const ownerLine = block.split('\n').find((l) => l.trimStart().startsWith('owner:'));
    assert.ok(ownerLine.startsWith('    owner:'), `Expected 4-space indent on owner, got: "${ownerLine}"`);
    const nameLine = block.split('\n').find((l) => l.trimStart().startsWith('name:'));
    assert.ok(nameLine.startsWith('      name:'), `Expected 6-space indent on name, got: "${nameLine}"`);
  });

  it('YSEC-15 (02-§102.4): normalises CRLF in description to LF', () => {
    const block = buildEventYaml(baseEvent({ description: 'Rad ett.\r\nRad två.' }));
    assert.ok(!block.includes('\r'), `Expected no carriage returns, got: ${JSON.stringify(block)}`);
    assert.ok(block.includes('    Rad ett.'), `Got: ${block}`);
    assert.ok(block.includes('    Rad två.'), `Got: ${block}`);
  });

  it('YSEC-16 (02-§102.4): normalises a lone CR in description to LF', () => {
    const block = buildEventYaml(baseEvent({ description: 'Rad ett.\rRad två.' }));
    assert.ok(!block.includes('\r'), `Expected no carriage returns, got: ${JSON.stringify(block)}`);
    assert.ok(block.includes('    Rad ett.'), `Got: ${block}`);
    assert.ok(block.includes('    Rad två.'), `Got: ${block}`);
  });
});

// ── detectEventIndent (02-§10.6, 02-§102.8) ──────────────────────────────────
// The appended event block must match the indentation of the existing events
// list so the combined document stays valid YAML.

describe('detectEventIndent', () => {
  it('YSEC-17: returns 0 for an events list whose items sit at column 0', () => {
    const yaml = [
      'camp:',
      '  id: c',
      'events:',
      '- id: lunch-2026-06-22-1200',
      '  title: Lunch',
    ].join('\n') + '\n';
    assert.strictEqual(detectEventIndent(yaml), 0);
  });

  it('YSEC-18: returns 2 for an events list whose items are indented two spaces', () => {
    const yaml = [
      'camp:',
      '  id: c',
      'events:',
      '  - id: lunch-2026-06-22-1200',
      '    title: Lunch',
    ].join('\n') + '\n';
    assert.strictEqual(detectEventIndent(yaml), 2);
  });

  it('YSEC-19: falls back to 2 when the events list is empty', () => {
    const yaml = [
      'camp:',
      '  id: c',
      'events: []',
    ].join('\n') + '\n';
    assert.strictEqual(detectEventIndent(yaml), 2);
  });
});

// ── assertEventYamlValid (02-§102.5) ─────────────────────────────────────────
// Defence-in-depth backstop: the complete proposed document must parse and
// contain every newly created event id before any branch/PR is created.

describe('assertEventYamlValid', () => {
  function campFile(eventBlocks = []) {
    const header = [
      'camp:',
      '  id: test-camp',
      '  name: Test',
      '  location: Here',
      "  start_date: '2026-06-22'",
      "  end_date: '2026-06-28'",
      'events:',
    ];
    return header.concat(eventBlocks).join('\n') + '\n';
  }

  function baseEvent(overrides = {}) {
    return {
      id: 'frukost-2026-06-22-0800',
      title: 'Frukost', date: '2026-06-22', start: '08:00', end: '09:00',
      location: 'Matsalen', responsible: 'Alla', description: null, link: null,
      owner: { name: 'Anna', email: '' },
      meta: { created_at: '2026-06-22 07:00', updated_at: '2026-06-22 07:00' },
      ...overrides,
    };
  }

  it('YSEC-20: does not throw for a document containing the expected id', () => {
    const ev = baseEvent();
    const content = campFile([buildEventYaml(ev)]);
    assert.doesNotThrow(() => assertEventYamlValid(content, [ev.id]));
  });

  it('YSEC-21: throws when the document does not parse as YAML', () => {
    const broken = 'camp:\n  id: t\nevents: [unclosed';
    assert.throws(() => assertEventYamlValid(broken, ['x']));
  });

  it('YSEC-22: throws when an expected event id is absent', () => {
    const ev = baseEvent();
    const content = campFile([buildEventYaml(ev)]);
    assert.throws(() => assertEventYamlValid(content, ['does-not-exist']));
  });

  it('YSEC-23: appending at the detected indent to a 2-space file yields valid YAML containing the new id', () => {
    const yaml = require('js-yaml');
    const existing = [
      'camp:',
      '  id: test-camp',
      '  name: Test',
      '  location: Here',
      "  start_date: '2026-06-22'",
      "  end_date: '2026-06-28'",
      'events:',
      '  - id: lunch-2026-06-22-1200',
      '    title: Lunch',
      "    date: '2026-06-22'",
      "    start: '12:00'",
      "    end: '13:00'",
      '    location: Matsalen',
      '    responsible: Alla',
      '    description: null',
      '    link: null',
      '    owner:',
      "      name: ''",
      "      email: ''",
      '    meta:',
      '      created_at: 2026-06-21 07:00',
      '      updated_at: 2026-06-21 07:00',
    ].join('\n') + '\n';

    const ev = baseEvent();
    const indent = detectEventIndent(existing);
    assert.strictEqual(indent, 2, 'expected 2-space indent to be detected');
    const combined = existing.trimEnd() + '\n' + buildEventYaml(ev, indent) + '\n';

    // Must parse and contain both events — this is the regression guard for the
    // indent-0-append-into-2-space-file bug.
    const parsed = yaml.load(combined);
    assert.strictEqual(parsed.events.length, 2);
    assert.ok(parsed.events.some((e) => e.id === ev.id));
    assert.doesNotThrow(() => assertEventYamlValid(combined, [ev.id]));
  });
});
