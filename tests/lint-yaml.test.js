'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// The script exports { validateYaml } when required as a module.
// The CLI entry point is guarded by require.main === module.
const { validateYaml, validateFragment } = require('../source/scripts/lint-yaml');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeYaml(events = [], campOverrides = {}) {
  const camp = Object.assign({
    id: 'test-camp',
    name: 'Test Camp',
    location: 'Testvik',
    start_date: '2026-07-01',
    end_date: '2026-07-07',
  }, campOverrides);

  const campBlock = [
    'camp:',
    `  id: ${camp.id}`,
    `  name: ${camp.name}`,
    `  location: ${camp.location}`,
    `  start_date: '${camp.start_date}'`,
    `  end_date: '${camp.end_date}'`,
  ].join('\n');

  const eventLines = events.map((e) => {
    const ev = Object.assign({
      id: 'frukost-2026-07-01-0800',
      title: 'Frukost',
      date: '2026-07-01',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    }, e);
    const lines = [
      `- id: ${ev.id}`,
      `  title: ${ev.title}`,
      `  date: '${ev.date}'`,
      `  start: '${ev.start}'`,
      `  end: '${ev.end}'`,
      `  location: ${ev.location}`,
      `  responsible: ${ev.responsible}`,
      '  description: null',
      '  link: null',
    ];
    return lines.join('\n');
  });

  const eventsBlock = eventLines.length > 0
    ? 'events:\n' + eventLines.join('\n')
    : 'events: []';

  return campBlock + '\n\n' + eventsBlock + '\n';
}

function validEvent(overrides = {}) {
  return Object.assign({
    id: 'frukost-2026-07-01-0800',
    title: 'Frukost',
    date: '2026-07-01',
    start: '08:00',
    end: '09:00',
    location: 'Matsalen',
    responsible: 'Alla',
  }, overrides);
}

// ── LNT-01: YAML parse ────────────────────────────────────────────────────────

describe('validateYaml – parse check (02-§23.1)', () => {
  it('LNT-01: accepts a valid YAML file', () => {
    const r = validateYaml(makeYaml([validEvent()]));
    assert.strictEqual(r.ok, true, `expected ok but got errors: ${r.errors}`);
  });

  it('LNT-01b: rejects a YAML syntax error', () => {
    const r = validateYaml('camp:\n  id: [unclosed');
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /parse|yaml/i.test(e)), `expected parse error, got: ${r.errors}`);
  });
});

// ── LNT-02..09: Required event fields (02-§23.2) ─────────────────────────────

describe('validateYaml – required event fields (02-§23.2)', () => {
  const REQUIRED = ['id', 'title', 'date', 'start', 'end', 'location', 'responsible'];

  for (const field of REQUIRED) {
    it(`LNT-0${REQUIRED.indexOf(field) + 2}: rejects event with missing ${field}`, () => {
      const ev = validEvent({ [field]: undefined });
      // Build YAML manually without the missing field
      const lines = [
        ev.id !== undefined     ? `- id: ${ev.id}` : null,
        ev.title !== undefined  ? `  title: ${ev.title}` : null,
        ev.date !== undefined   ? `  date: '${ev.date}'` : null,
        ev.start !== undefined  ? `  start: '${ev.start}'` : null,
        ev.end !== undefined    ? `  end: '${ev.end}'` : null,
        ev.location !== undefined   ? `  location: ${ev.location}` : null,
        ev.responsible !== undefined ? `  responsible: ${ev.responsible}` : null,
        '  description: null',
        '  link: null',
      ].filter(Boolean);
      const yaml = [
        "camp:",
        "  id: test-camp",
        "  name: Test Camp",
        "  location: Testvik",
        "  start_date: '2026-07-01'",
        "  end_date: '2026-07-07'",
        "",
        "events:",
        lines.join('\n'),
      ].join('\n');
      const r = validateYaml(yaml);
      assert.strictEqual(r.ok, false, `expected failure when ${field} is missing`);
    });
  }

  it('LNT-09: accepts an event with all required fields present', () => {
    const r = validateYaml(makeYaml([validEvent()]));
    assert.strictEqual(r.ok, true);
  });
});

// ── LNT-10..13: Date validation (02-§23.3) ────────────────────────────────────

describe('validateYaml – date validation (02-§23.3)', () => {
  it('LNT-10: rejects date in wrong format', () => {
    const r = validateYaml(makeYaml([validEvent({ date: '01-07-2026' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /date/i.test(e)));
  });

  it('LNT-11: rejects a structurally valid but calendar-impossible date', () => {
    const r = validateYaml(makeYaml([validEvent({ date: '2026-02-30' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /date/i.test(e)));
  });

  it('LNT-12: rejects a date before the camp start_date', () => {
    const r = validateYaml(makeYaml([validEvent({ date: '2026-06-30' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /date|camp/i.test(e)));
  });

  it('LNT-13: rejects a date after the camp end_date', () => {
    const r = validateYaml(makeYaml([validEvent({ date: '2026-07-08' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /date|camp/i.test(e)));
  });

  it('accepts a date within the camp range', () => {
    const r = validateYaml(makeYaml([validEvent({ date: '2026-07-04' })]));
    assert.strictEqual(r.ok, true);
  });
});

// ── LNT-14..17: Time validation (02-§23.4) ────────────────────────────────────

describe('validateYaml – time validation (02-§23.4)', () => {
  it('LNT-14: rejects start time in wrong format', () => {
    const r = validateYaml(makeYaml([validEvent({ start: '8:00' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /start/i.test(e)));
  });

  it('LNT-15: rejects end time in wrong format', () => {
    const r = validateYaml(makeYaml([validEvent({ end: '900' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /end/i.test(e)));
  });

  it('LNT-16: rejects end equal to start', () => {
    const r = validateYaml(makeYaml([validEvent({ start: '10:00', end: '10:00' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /end|after|start/i.test(e)));
  });

  it('LNT-17: rejects end before start', () => {
    const r = validateYaml(makeYaml([validEvent({ start: '10:00', end: '09:00' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /end|after|start/i.test(e)));
  });

  it('accepts end one minute after start', () => {
    const r = validateYaml(makeYaml([validEvent({ start: '08:00', end: '08:01' })]));
    assert.strictEqual(r.ok, true);
  });
});

// ── LNT-24..25: Midnight crossing (05-§4.3) ─────────────────────────────────

describe('validateYaml – midnight crossing (05-§4.3)', () => {
  it('LNT-24: accepts midnight crossing (23:00 → 00:30)', () => {
    const r = validateYaml(makeYaml([validEvent({ start: '23:00', end: '00:30' })]));
    assert.strictEqual(r.ok, true);
  });

  it('LNT-25: rejects crossing over threshold (06:00 → 00:00 = 1080 min)', () => {
    const r = validateYaml(makeYaml([validEvent({ start: '06:00', end: '00:00' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /end|after|start/i.test(e)));
  });
});

// ── LNT-18: Duplicate IDs (02-§23.5) ──────────────────────────────────────────

describe('validateYaml – duplicate event IDs (02-§23.5)', () => {
  it('LNT-18: rejects a file with two events sharing the same id', () => {
    const events = [
      validEvent({ id: 'same-id', date: '2026-07-01', start: '08:00', end: '09:00' }),
      validEvent({ id: 'same-id', date: '2026-07-01', start: '10:00', end: '11:00', title: 'Lunch' }),
    ];
    const r = validateYaml(makeYaml(events));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /duplicate|id/i.test(e)));
  });

  it('accepts a file with unique event IDs', () => {
    const events = [
      validEvent({ id: 'frukost-2026-07-01-0800', date: '2026-07-01', start: '08:00', end: '09:00' }),
      validEvent({ id: 'lunch-2026-07-01-1200', date: '2026-07-01', start: '12:00', end: '13:00', title: 'Lunch' }),
    ];
    const r = validateYaml(makeYaml(events));
    assert.strictEqual(r.ok, true);
  });
});

// ── LNT-19..21: Unique (title + date + start) combo (05-§5.1) ──────────────

describe('validateYaml – unique (title+date+start) combo (05-§5.1)', () => {
  it('LNT-19: rejects two events with same title, date, and start', () => {
    const events = [
      validEvent({ id: 'frukost-2026-07-01-0800', title: 'Frukost', date: '2026-07-01', start: '08:00', end: '09:00' }),
      validEvent({ id: 'frukost-2026-07-01-0800b', title: 'Frukost', date: '2026-07-01', start: '08:00', end: '09:30' }),
    ];
    const r = validateYaml(makeYaml(events));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some((e) => /duplicate|title.*date.*start|kombination/i.test(e)));
  });

  it('LNT-20: accepts two events with same title but different start times', () => {
    const events = [
      validEvent({ id: 'frukost-2026-07-01-0800', title: 'Frukost', date: '2026-07-01', start: '08:00', end: '09:00' }),
      validEvent({ id: 'frukost-2026-07-01-1200', title: 'Frukost', date: '2026-07-01', start: '12:00', end: '13:00' }),
    ];
    const r = validateYaml(makeYaml(events));
    assert.strictEqual(r.ok, true);
  });

  it('LNT-21: accepts two events with same title and start but different dates', () => {
    const events = [
      validEvent({ id: 'frukost-2026-07-01-0800', title: 'Frukost', date: '2026-07-01', start: '08:00', end: '09:00' }),
      validEvent({ id: 'frukost-2026-07-02-0800', title: 'Frukost', date: '2026-07-02', start: '08:00', end: '09:00' }),
    ];
    const r = validateYaml(makeYaml(events));
    assert.strictEqual(r.ok, true);
  });
});

// LNT-22..23 removed: active+archived conflict check no longer exists
// (active field removed — see 02-§34.6, 02-§34.8).

// ── validateFragment — single-event fragment files (02-§109.17, §109.18) ──────

describe('validateFragment – event fragment files (FRAG-60..66)', () => {
  function fragment(event = {}) {
    const e = Object.assign({
      id: 'frukost-2026-07-02-0800',
      title: 'Frukost',
      date: '2026-07-02',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    }, event);
    const lines = ['event:'];
    for (const [k, v] of Object.entries(e)) {
      if (v === null) lines.push(`  ${k}: null`);
      else if (['date', 'start', 'end'].includes(k)) lines.push(`  ${k}: '${v}'`);
      else lines.push(`  ${k}: ${v}`);
    }
    return lines.join('\n') + '\n';
  }

  it('FRAG-60: accepts a well-formed fragment (02-§109.17)', () => {
    assert.deepStrictEqual(validateFragment(fragment()), { ok: true });
  });

  it('FRAG-61: rejects a missing required field (02-§109.18)', () => {
    const res = validateFragment(fragment({ location: null }));
    assert.strictEqual(res.ok, false);
    assert.ok(res.errors.some((e) => /location/.test(e)));
  });

  it('FRAG-62: rejects an invalid date (02-§109.18)', () => {
    const res = validateFragment(fragment({ date: '2026/07/02' }));
    assert.strictEqual(res.ok, false);
    assert.ok(res.errors.some((e) => /date/i.test(e)));
  });

  it('FRAG-63: rejects end not after start (02-§109.18)', () => {
    const res = validateFragment(fragment({ start: '10:00', end: '09:00' }));
    assert.strictEqual(res.ok, false);
    assert.ok(res.errors.some((e) => /end/i.test(e)));
  });

  it('FRAG-64: rejects a document with no top-level event mapping', () => {
    const res = validateFragment('events:\n  - id: x\n');
    assert.strictEqual(res.ok, false);
    assert.ok(res.errors.some((e) => /event/i.test(e)));
  });

  it('FRAG-65: rejects a YAML parse failure', () => {
    const res = validateFragment('event:\n  id: [oops');
    assert.strictEqual(res.ok, false);
  });

  it('FRAG-66: allows a midnight-crossing end within the 17h cap (05-§4.3)', () => {
    assert.deepStrictEqual(validateFragment(fragment({ start: '22:00', end: '01:00' })), { ok: true });
  });
});
