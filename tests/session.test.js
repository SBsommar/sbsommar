'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  parseSessionIds,
  parseVerifiedSessionIds,
  createOwnershipEntry,
  buildSetCookieHeader,
  mergeOwnershipEntries,
} = require('../source/api/session');

const SECRET = 'test-session-secret';

// ── parseSessionIds ───────────────────────────────────────────────────────────

describe('parseSessionIds', () => {
  it('SES-01: returns [] for null cookie header', () => { // SES-01
    assert.deepStrictEqual(parseSessionIds(null), []);
  });

  it('SES-02: returns [] when sb_session cookie is absent', () => { // SES-02
    assert.deepStrictEqual(parseSessionIds('other=value; another=foo'), []);
  });

  it('SES-03: returns display IDs from signed ownership entries', () => { // SES-03
    const entries = [
      createOwnershipEntry('event-a', SECRET),
      createOwnershipEntry('event-b', SECRET),
    ];
    const cookieHeader = `sb_session=${encodeURIComponent(JSON.stringify(entries))}; Path=/`;
    assert.deepStrictEqual(parseSessionIds(cookieHeader), ['event-a', 'event-b']);
  });

  it('SES-04: returns [] for malformed JSON in sb_session', () => { // SES-04
    assert.deepStrictEqual(parseSessionIds('sb_session=not-json'), []);
  });

  it('SES-05: filters out malformed entries but keeps legacy strings for display only', () => { // SES-05
    const signed = createOwnershipEntry('signed-id', SECRET);
    const cookieHeader = `sb_session=${encodeURIComponent(JSON.stringify([42, '', 'legacy-id', null, signed]))}`;
    assert.deepStrictEqual(parseSessionIds(cookieHeader), ['legacy-id', 'signed-id']);
  });
});

// ── signed ownership verification ────────────────────────────────────────────

describe('signed ownership entries', () => {
  it('SES-16: createOwnershipEntry binds id to a signature', () => {
    const entry = createOwnershipEntry('event-a', SECRET);
    assert.deepStrictEqual(Object.keys(entry).sort(), ['exp', 'id', 'sig']);
    assert.strictEqual(entry.id, 'event-a');
    assert.ok(entry.exp > Math.floor(Date.now() / 1000));
    assert.match(entry.sig, /^[a-f0-9]{64}$/);
  });

  it('SES-17: parseVerifiedSessionIds accepts a valid signed ownership entry', () => {
    const entry = createOwnershipEntry('event-a', SECRET);
    const cookieHeader = `sb_session=${encodeURIComponent(JSON.stringify([entry]))}`;
    assert.deepStrictEqual(parseVerifiedSessionIds(cookieHeader, SECRET), ['event-a']);
  });

  it('SES-18: parseVerifiedSessionIds rejects legacy raw event ID strings', () => {
    const cookieHeader = `sb_session=${encodeURIComponent(JSON.stringify(['event-a']))}`;
    assert.deepStrictEqual(parseVerifiedSessionIds(cookieHeader, SECRET), []);
  });

  it('SES-19: parseVerifiedSessionIds rejects entries signed with another secret', () => {
    const entry = createOwnershipEntry('event-a', 'other-secret');
    const cookieHeader = `sb_session=${encodeURIComponent(JSON.stringify([entry]))}`;
    assert.deepStrictEqual(parseVerifiedSessionIds(cookieHeader, SECRET), []);
  });

  it('SES-20: parseVerifiedSessionIds rejects a tampered event ID', () => {
    const entry = createOwnershipEntry('event-a', SECRET);
    const cookieHeader = `sb_session=${encodeURIComponent(JSON.stringify([{ ...entry, id: 'event-b' }]))}`;
    assert.deepStrictEqual(parseVerifiedSessionIds(cookieHeader, SECRET), []);
  });

  it('SES-21: parseVerifiedSessionIds rejects expired ownership entries', () => {
    const now = Date.UTC(2026, 0, 1, 12, 0, 0);
    const entry = createOwnershipEntry('event-a', SECRET, now);
    const afterExpiry = now + (7 * 24 * 60 * 60 * 1000) + 1000;
    const cookieHeader = `sb_session=${encodeURIComponent(JSON.stringify([entry]))}`;
    assert.deepStrictEqual(parseVerifiedSessionIds(cookieHeader, SECRET, afterExpiry), []);
  });
});

// ── buildSetCookieHeader ──────────────────────────────────────────────────────

describe('buildSetCookieHeader', () => {
  it('SES-06: includes the cookie name and encoded ownership entries', () => { // SES-06
    const header = buildSetCookieHeader([createOwnershipEntry('my-event-id', SECRET)]);
    assert.ok(header.startsWith('sb_session='), `Expected header to start with sb_session=, got: ${header}`);
    assert.ok(header.includes('my-event-id'));
    assert.ok(header.includes('exp'));
    assert.ok(header.includes('sig'));
  });

  it('SES-07: includes Max-Age of 604800 (7 days)', () => { // SES-07
    const header = buildSetCookieHeader([]);
    assert.ok(header.includes('Max-Age=604800'), `Missing Max-Age=604800 in: ${header}`);
  });

  it('SES-08: includes the Secure flag', () => { // SES-08
    const header = buildSetCookieHeader([]);
    assert.ok(header.includes('Secure'), `Missing Secure flag in: ${header}`);
  });

  it('SES-09: includes SameSite=Strict', () => { // SES-09
    const header = buildSetCookieHeader([]);
    assert.ok(header.includes('SameSite=Strict'), `Missing SameSite=Strict in: ${header}`);
  });

  it('SES-14: includes Domain attribute when a domain is provided', () => { // SES-14
    const header = buildSetCookieHeader([createOwnershipEntry('my-event', SECRET)], 'sommar.example.com');
    assert.ok(header.includes('Domain=sommar.example.com'), `Missing Domain= in: ${header}`);
  });

  it('SES-15: omits Domain attribute when no domain is provided', () => { // SES-15
    const header = buildSetCookieHeader([createOwnershipEntry('my-event', SECRET)]);
    assert.ok(!header.includes('Domain='), `Unexpected Domain= in: ${header}`);
  });
});

// ── mergeOwnershipEntries ─────────────────────────────────────────────────────

describe('mergeOwnershipEntries', () => {
  it('SES-10: adds a new ownership entry to an existing array', () => { // SES-10
    const a = createOwnershipEntry('a', SECRET);
    const b = createOwnershipEntry('b', SECRET);
    const result = mergeOwnershipEntries([a], b);
    assert.deepStrictEqual(result, [a, b]);
  });

  it('SES-11: does not duplicate an event ID already present', () => { // SES-11
    const a = createOwnershipEntry('a', SECRET);
    const duplicate = createOwnershipEntry('a', SECRET);
    const result = mergeOwnershipEntries([a], duplicate);
    assert.deepStrictEqual(result, [a]);
  });

  it('SES-12: handles an empty existing array', () => { // SES-12
    const entry = createOwnershipEntry('new-event', SECRET);
    const result = mergeOwnershipEntries([], entry);
    assert.deepStrictEqual(result, [entry]);
  });

  it('SES-13: handles a non-array existing value gracefully', () => { // SES-13
    const entry = createOwnershipEntry('new-event', SECRET);
    const result = mergeOwnershipEntries(null, entry);
    assert.deepStrictEqual(result, [entry]);
  });
});
