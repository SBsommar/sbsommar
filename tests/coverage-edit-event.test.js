'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const yaml = require('js-yaml');

const { patchEventObject } = require('../source/api/edit-event');
const { addOneDay, isOutsideEditingPeriod } = require('../source/api/time-gate');
const {
  createOwnershipEntry,
  mergeOwnershipEntries,
  buildSetCookieHeader,
  COOKIE_NAME,
  MAX_AGE_SECONDS,
} = require('../source/api/session');

const SESSION_SECRET = 'test-session-secret';

// ── 05-§6.2  Event id stable after creation ─────────────────────────────────

const SAMPLE_YAML = `\
camp:
  id: test-camp
  name: Test Camp
  location: Testort
  start_date: '2099-06-01'
  end_date: '2099-06-07'
events:
- id: stable-id-001
  title: Original Title
  date: '2099-06-01'
  start: '10:00'
  end: '11:00'
  location: Servicehus
  responsible: Anna
  description: null
  link: null
  owner:
    name: ''
    email: ''
  meta:
    created_at: 2099-05-01 12:00
    updated_at: 2099-05-01 12:00
`;

// Edits go through the fragment path (patchEventObject); each event lives in its
// own file, so these checks operate on the single event object.
const SAMPLE_EVENT = yaml.load(SAMPLE_YAML).events[0];
const NOW = '2099-05-02 09:00';

describe('05-§6.2 — Event ID stable after edits', () => {
  it('EEC-01: id unchanged after editing title', () => {
    const ev = patchEventObject(SAMPLE_EVENT, { title: 'Ny titel' }, NOW);
    assert.strictEqual(ev.id, 'stable-id-001');
  });

  it('EEC-02: id unchanged after editing multiple fields', () => {
    const ev = patchEventObject(SAMPLE_EVENT, {
      title: 'Ny titel',
      date: '2099-06-03',
      start: '12:00',
      end: '13:00',
      location: 'Strand',
      responsible: 'Bo',
    }, NOW);
    assert.strictEqual(ev.id, 'stable-id-001');
  });

  it('EEC-03: owner preserved even when all mutable fields change', () => {
    const ev = patchEventObject(SAMPLE_EVENT, {
      title: 'X', date: '2099-06-02', start: '14:00', end: '15:00',
      location: 'Y', responsible: 'Z', description: 'Desc', link: 'https://x.com',
    }, NOW);
    assert.deepStrictEqual(ev.owner, { name: '', email: '' });
  });
});

// ── 02-§18.35  meta.updated_at updated on every edit ────────────────────────

describe('02-§18.35 — meta.updated_at updated on edit', () => {
  it('EEC-04: meta.updated_at set to now, created_at preserved after edit', () => {
    const ev = patchEventObject(SAMPLE_EVENT, { title: 'Ändrad' }, NOW);
    assert.strictEqual(ev.meta.updated_at, NOW);
    assert.ok(ev.meta.created_at !== null, 'created_at preserved');
  });
});

// ── addOneDay ───────────────────────────────────────────────────────────────

describe('addOneDay — date arithmetic', () => {
  it('EEC-05: adds one day to a normal date', () => {
    assert.strictEqual(addOneDay('2099-07-01'), '2099-07-02');
  });

  it('EEC-06: handles month boundary', () => {
    assert.strictEqual(addOneDay('2099-07-31'), '2099-08-01');
  });

  it('EEC-07: handles year boundary', () => {
    assert.strictEqual(addOneDay('2099-12-31'), '2100-01-01');
  });

  it('EEC-08: handles February non-leap', () => {
    assert.strictEqual(addOneDay('2099-02-28'), '2099-03-01');
  });
});

// ── isOutsideEditingPeriod ──────────────────────────────────────────────────

describe('isOutsideEditingPeriod — time-gate logic', () => {
  const opens = '2099-07-01';
  const endDate = '2099-07-07'; // closes = 2099-07-08

  it('EEC-09: returns true before opens_for_editing', () => {
    assert.strictEqual(isOutsideEditingPeriod('2099-06-30', opens, endDate), true);
  });

  it('EEC-10: returns false on opens_for_editing', () => {
    assert.strictEqual(isOutsideEditingPeriod('2099-07-01', opens, endDate), false);
  });

  it('EEC-11: returns false during camp', () => {
    assert.strictEqual(isOutsideEditingPeriod('2099-07-04', opens, endDate), false);
  });

  it('EEC-12: returns false on end_date + 1 day (closes)', () => {
    assert.strictEqual(isOutsideEditingPeriod('2099-07-08', opens, endDate), false);
  });

  it('EEC-13: returns true after end_date + 1 day', () => {
    assert.strictEqual(isOutsideEditingPeriod('2099-07-09', opens, endDate), true);
  });
});

// ── mergeOwnershipEntries ───────────────────────────────────────────────────

describe('mergeOwnershipEntries — session cookie deduplication', () => {
  it('EEC-14: appends a new ownership entry', () => {
    const a = createOwnershipEntry('a', SESSION_SECRET);
    const b = createOwnershipEntry('b', SESSION_SECRET);
    assert.deepStrictEqual(mergeOwnershipEntries([a], b), [a, b]);
  });

  it('EEC-15: does not duplicate an existing id', () => {
    const a = createOwnershipEntry('a', SESSION_SECRET);
    const duplicate = createOwnershipEntry('a', SESSION_SECRET);
    assert.deepStrictEqual(mergeOwnershipEntries([a], duplicate), [a]);
  });

  it('EEC-16: handles empty array', () => {
    const x = createOwnershipEntry('x', SESSION_SECRET);
    assert.deepStrictEqual(mergeOwnershipEntries([], x), [x]);
  });

  it('EEC-17: handles null existing', () => {
    const x = createOwnershipEntry('x', SESSION_SECRET);
    assert.deepStrictEqual(mergeOwnershipEntries(null, x), [x]);
  });
});

// ── 02-§18.4 / 02-§18.7  Cookie properties ─────────────────────────────────

describe('02-§18.4 / 02-§18.7 — Session cookie properties', () => {
  it('EEC-18: cookie name is sb_session', () => {
    assert.strictEqual(COOKIE_NAME, 'sb_session');
  });

  it('EEC-19: max age is 7 days', () => {
    assert.strictEqual(MAX_AGE_SECONDS, 7 * 24 * 60 * 60);
  });

  it('EEC-20: cookie header includes Secure flag', () => {
    const header = buildSetCookieHeader([createOwnershipEntry('id1', SESSION_SECRET)]);
    assert.ok(header.includes('Secure'), 'has Secure');
  });

  it('EEC-21: cookie header includes SameSite=Strict', () => {
    const header = buildSetCookieHeader([createOwnershipEntry('id1', SESSION_SECRET)]);
    assert.ok(header.includes('SameSite=Strict'), 'has SameSite=Strict');
  });

  it('EEC-22: cookie header includes Path=/', () => {
    const header = buildSetCookieHeader([createOwnershipEntry('id1', SESSION_SECRET)]);
    assert.ok(header.includes('Path=/'), 'has Path=/');
  });

  it('EEC-23: cookie header starts with sb_session=', () => {
    const header = buildSetCookieHeader([createOwnershipEntry('id1', SESSION_SECRET)]);
    assert.ok(header.startsWith('sb_session='), 'starts with cookie name');
  });
});

// ── 02-§18.41  Domain= when COOKIE_DOMAIN provided ─────────────────────────

describe('02-§18.41 — Cookie domain for cross-subdomain', () => {
  it('EEC-24: no Domain= when domain not provided', () => {
    const header = buildSetCookieHeader([createOwnershipEntry('id1', SESSION_SECRET)]);
    assert.ok(!header.includes('Domain='), 'no Domain by default');
  });

  it('EEC-25: Domain= included when domain provided', () => {
    const header = buildSetCookieHeader([createOwnershipEntry('id1', SESSION_SECRET)], '.example.com');
    assert.ok(header.includes('Domain=.example.com'), 'Domain included');
  });
});

// ── 02-§18.5  Cookie is not httpOnly ────────────────────────────────────────

describe('02-§18.5 — Session cookie is JS-readable', () => {
  it('EEC-26: cookie header does NOT include HttpOnly', () => {
    const header = buildSetCookieHeader([createOwnershipEntry('id1', SESSION_SECRET)]);
    assert.ok(!header.includes('HttpOnly'), 'no HttpOnly flag');
  });
});
