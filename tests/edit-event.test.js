'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const yaml = require('js-yaml');

const { isEventPast, patchEventObject } = require('../source/api/edit-event');

// ── Helpers ───────────────────────────────────────────────────────────────────

const SAMPLE_YAML = `\
camp:
  id: test-camp
  name: Test Camp
  location: Testort
  start_date: '2099-06-01'
  end_date: '2099-06-07'
events:
- id: event-one-2099-06-01-1000
  title: Event One
  date: '2099-06-01'
  start: '10:00'
  end: '11:00'
  location: Stor scenen
  responsible: Anna
  description: null
  link: null
  owner:
    name: ''
    email: ''
  meta:
    created_at: 2099-05-01 12:00
    updated_at: 2099-05-01 12:00
- id: event-two-2099-06-02-1400
  title: Event Two
  date: '2099-06-02'
  start: '14:00'
  end: '15:00'
  location: Matsalen
  responsible: Bo
  description: Med lite text.
  link: https://example.com
  owner:
    name: ''
    email: ''
  meta:
    created_at: 2099-05-02 09:00
    updated_at: 2099-05-02 09:00
`;

// ── isEventPast ───────────────────────────────────────────────────────────────

describe('isEventPast', () => {
  it('EDIT-01: returns true for a clearly past date', () => { // EDIT-01
    assert.strictEqual(isEventPast('2000-01-01'), true);
  });

  it('EDIT-02: returns false for a clearly future date', () => { // EDIT-02
    assert.strictEqual(isEventPast('9999-12-31'), false);
  });

  it('EDIT-03: returns false for today (today is not yet past)', () => { // EDIT-03
    const today = new Date().toISOString().slice(0, 10);
    assert.strictEqual(isEventPast(today), false);
  });
});

// ── patchEventObject ──────────────────────────────────────────────────────────
// Edits go through the fragment path: patchEventObject applies the project's
// mutable-field rules to a single event object (02-§109.9, §109.10). Each event
// lives in its own file, so cross-event isolation is structural rather than a
// property of this function.

describe('patchEventObject', () => {
  const NOW = '2099-05-02 09:00';
  // Fresh copy of "event-one" for each test (patchEventObject returns a new
  // object, but the fixture must not leak between cases).
  const baseEvent = () => yaml.load(SAMPLE_YAML).events[0];

  it('EDIT-05: updates the title', () => { // EDIT-05
    assert.strictEqual(patchEventObject(baseEvent(), { title: 'Ny titel' }, NOW).title, 'Ny titel');
  });

  it('EDIT-06: updates the start time', () => { // EDIT-06
    assert.strictEqual(patchEventObject(baseEvent(), { start: '11:00' }, NOW).start, '11:00');
  });

  it('EDIT-07: updates the end time', () => { // EDIT-07
    assert.strictEqual(patchEventObject(baseEvent(), { end: '12:00' }, NOW).end, '12:00');
  });

  it('EDIT-08: clears end time when empty string is provided', () => { // EDIT-08
    assert.strictEqual(patchEventObject(baseEvent(), { end: '' }, NOW).end, null);
  });

  it('EDIT-09: updates the location', () => { // EDIT-09
    assert.strictEqual(patchEventObject(baseEvent(), { location: 'Ny plats' }, NOW).location, 'Ny plats');
  });

  it('EDIT-10: updates the responsible person', () => { // EDIT-10
    assert.strictEqual(patchEventObject(baseEvent(), { responsible: 'Karin' }, NOW).responsible, 'Karin');
  });

  it('EDIT-11: updates the description', () => { // EDIT-11
    assert.strictEqual(patchEventObject(baseEvent(), { description: 'Ny beskrivning.' }, NOW).description, 'Ny beskrivning.');
  });

  it('EDIT-12: updates the link', () => { // EDIT-12
    assert.strictEqual(patchEventObject(baseEvent(), { link: 'https://new.example.com' }, NOW).link, 'https://new.example.com');
  });

  it('EDIT-13: preserves the event ID after patching', () => { // EDIT-13
    assert.strictEqual(patchEventObject(baseEvent(), { title: 'Ändrad' }, NOW).id, 'event-one-2099-06-01-1000');
  });

  it('EDIT-14: preserves the owner block after patching', () => { // EDIT-14
    assert.deepStrictEqual(patchEventObject(baseEvent(), { title: 'Ändrad' }, NOW).owner, { name: '', email: '' });
  });

  it('EDIT-15: sets meta.updated_at to the supplied timestamp and preserves created_at', () => { // EDIT-15
    const ev = patchEventObject(baseEvent(), { title: 'Ändrad' }, NOW);
    assert.strictEqual(ev.meta.updated_at, NOW);
    assert.ok(ev.meta.created_at !== null, 'created_at preserved');
  });
});
