'use strict';

// Tests for the moved-activity marking (02-§119): the edit API records the slot
// a rescheduled activity left, the renderers show the previous time struck
// through next to the highlighted new time, and a minimal ghost marker is left
// at the previous slot.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const yaml = require('js-yaml');

const { patchEventObject, resolveMoved, normaliseMoved, resolveRelocated } = require('../source/api/edit-event');
const { buildFragmentYaml } = require('../source/api/github');
const { validateYaml } = require('../source/scripts/lint-yaml');
const { isMoved, movedToText, movedFromText, buildGhosts, isRelocated, locationHtml } = require('../source/build/moved');
const { renderSchedulePage, renderEventRow } = require('../source/build/render');
const { renderEventPage } = require('../source/build/render-event');

function baseEvent(overrides = {}) {
  return Object.assign({
    id: 'frukost-2026-06-22-0800',
    title: 'Frukost',
    date: '2026-06-22',
    start: '08:00',
    end: '09:00',
    location: 'Matsalen',
    responsible: 'Alla',
    description: null,
    link: null,
    owner: { name: '', email: '' },
    meta: { created_at: '2026-06-22 07:00', updated_at: '2026-06-22 07:00' },
  }, overrides);
}

const NOW = '2026-06-22 08:00';

describe('patchEventObject – moved capture (02-§119.3–§119.5)', () => {
  it('MOVED-01: records the previous slot when start changes', () => {
    const p = patchEventObject(baseEvent(), { start: '10:00' }, NOW);
    assert.deepEqual(p.moved, { from_date: '2026-06-22', from_start: '08:00', from_end: '09:00' });
  });

  it('MOVED-02: records the previous slot when end changes', () => {
    const p = patchEventObject(baseEvent(), { end: '09:30' }, NOW);
    assert.deepEqual(p.moved, { from_date: '2026-06-22', from_start: '08:00', from_end: '09:00' });
  });

  it('MOVED-03: records the previous slot when the date changes', () => {
    const p = patchEventObject(baseEvent(), { date: '2026-06-24' }, NOW);
    assert.equal(p.moved.from_date, '2026-06-22');
  });

  it('MOVED-04: a text-only edit leaves an existing marker untouched', () => {
    const ev = baseEvent({ moved: { from_date: '2026-06-21', from_start: '07:00', from_end: '08:00' } });
    const p = patchEventObject(ev, { title: 'Nytt' }, NOW);
    assert.deepEqual(p.moved, { from_date: '2026-06-21', from_start: '07:00', from_end: '08:00' });
  });

  it('MOVED-05: a text-only edit on an unmoved activity adds no marker', () => {
    const p = patchEventObject(baseEvent(), { title: 'Nytt' }, NOW);
    assert.equal(p.moved, undefined);
  });

  it('MOVED-06: moving back to the recorded original slot clears the marker', () => {
    const ev = baseEvent({ start: '10:00', end: '11:00', moved: { from_date: '2026-06-22', from_start: '08:00', from_end: '09:00' } });
    const p = patchEventObject(ev, { start: '08:00', end: '09:00' }, NOW);
    assert.equal(p.moved, undefined);
  });

  it('MOVED-07: a second move records the immediately-prior slot', () => {
    const ev = baseEvent({ start: '10:00', end: '11:00', moved: { from_date: '2026-06-22', from_start: '08:00', from_end: '09:00' } });
    const p = patchEventObject(ev, { start: '12:00', end: '13:00' }, NOW);
    assert.deepEqual(p.moved, { from_date: '2026-06-22', from_start: '10:00', from_end: '11:00' });
  });

  it('MOVED-08: the id never changes when an activity is moved', () => {
    const p = patchEventObject(baseEvent(), { start: '10:00' }, NOW);
    assert.equal(p.id, 'frukost-2026-06-22-0800');
  });
});

describe('normaliseMoved / resolveMoved (02-§119.1)', () => {
  it('MOVED-09: normaliseMoved rejects a value with no from_date', () => {
    assert.equal(normaliseMoved({ from_start: '08:00' }), null);
  });

  it('MOVED-10: normaliseMoved keeps a null from_end', () => {
    assert.deepEqual(normaliseMoved({ from_date: '2026-06-22', from_start: '08:00' }),
      { from_date: '2026-06-22', from_start: '08:00', from_end: null });
  });

  it('MOVED-11: resolveMoved returns null when nothing changed', () => {
    assert.equal(resolveMoved(baseEvent(), '2026-06-22', '08:00', '09:00'), null);
  });
});

describe('buildFragmentYaml – moved serialisation (02-§119.1)', () => {
  it('MOVED-12: round-trips the moved block', () => {
    const y = buildFragmentYaml(baseEvent({ moved: { from_date: '2026-06-21', from_start: '07:00', from_end: '08:00' } }));
    const doc = yaml.load(y);
    assert.deepEqual(doc.event.moved, { from_date: '2026-06-21', from_start: '07:00', from_end: '08:00' });
  });

  it('MOVED-13: serialises a null from_end', () => {
    const y = buildFragmentYaml(baseEvent({ end: null, moved: { from_date: '2026-06-21', from_start: '07:00', from_end: null } }));
    const doc = yaml.load(y);
    assert.equal(doc.event.moved.from_end, null);
  });

  it('MOVED-14: omits the moved block when absent', () => {
    assert.ok(!buildFragmentYaml(baseEvent()).includes('moved:'));
  });
});

describe('lint-yaml – moved validation (05-§3.6)', () => {
  const wrap = (eventLines) => `camp:\n  id: c\n  name: C\n  location: L\n  start_date: '2026-06-22'\n  end_date: '2026-06-28'\nevents:\n${eventLines}\n`;
  const valid = [
    "- id: a-2026-06-24-1000",
    "  title: A",
    "  date: '2026-06-24'",
    "  start: '10:00'",
    "  end: '11:00'",
    "  location: L",
    "  responsible: R",
  ];

  it('MOVED-15: accepts a well-formed moved block', () => {
    const lines = valid.concat([
      '  moved:',
      "    from_date: '2026-06-22'",
      "    from_start: '08:00'",
      "    from_end: '09:00'",
    ]).join('\n');
    assert.equal(validateYaml(wrap(lines)).ok, true);
  });

  it('MOVED-16: rejects a bad moved.from_start', () => {
    const lines = valid.concat([
      '  moved:',
      "    from_date: '2026-06-22'",
      "    from_start: 'nope'",
    ]).join('\n');
    const res = validateYaml(wrap(lines));
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => /moved\.from_start/.test(e)));
  });
});

describe('moved.js helpers (02-§119.7–§119.9)', () => {
  const movedDiffDay = baseEvent({ date: '2026-06-24', start: '16:00', end: '17:00', moved: { from_date: '2026-06-22', from_start: '08:00', from_end: '09:00' } });
  const movedSameDay = baseEvent({ start: '16:00', end: '17:00', moved: { from_date: '2026-06-22', from_start: '08:00', from_end: '09:00' } });

  it('MOVED-17: isMoved is false without a marker', () => {
    assert.equal(isMoved(baseEvent()), false);
  });

  it('MOVED-18: movedToText includes the new date for a cross-day move', () => {
    assert.equal(movedToText(movedDiffDay), 'Flyttad till 24 juni 16:00–17:00');
  });

  it('MOVED-19: movedToText omits the date for a same-day move', () => {
    assert.equal(movedToText(movedSameDay), 'Flyttad till 16:00–17:00');
  });

  it('MOVED-20: movedFromText omits the date for a same-day move', () => {
    assert.equal(movedFromText(movedSameDay), '08:00–09:00');
  });

  it('MOVED-21: movedFromText includes the date for a cross-day move', () => {
    assert.equal(movedFromText(movedDiffDay), '22 juni 08:00–09:00');
  });

  it('MOVED-22: buildGhosts emits one ghost per moved activity at its old slot', () => {
    const ghosts = buildGhosts([movedDiffDay, baseEvent()]);
    assert.equal(ghosts.length, 1);
    assert.equal(ghosts[0].date, '2026-06-22');
    assert.equal(ghosts[0].start, '08:00');
    assert.equal(ghosts[0]._ghost, true);
  });
});

describe('renderEventRow / renderSchedulePage – moved markup (02-§119.6, §119.8)', () => {
  const moved = baseEvent({ date: '2026-06-24', start: '16:00', end: '17:00', moved: { from_date: '2026-06-22', from_start: '08:00', from_end: '09:00' } });

  it('MOVED-23: a moved row carries is-moved with struck old + amber new time', () => {
    const html = renderEventRow(moved);
    assert.ok(html.includes('is-moved'));
    assert.ok(html.includes('<span class="ev-time-old">22 juni 08:00–09:00</span>'));
    assert.ok(html.includes('<span class="ev-time-new">16:00–17:00</span>'));
  });

  it('MOVED-43: the new time is rendered before (above) the struck old time', () => {
    const html = renderEventRow(moved);
    assert.ok(html.indexOf('ev-time-new') < html.indexOf('ev-time-old'));
  });

  it('MOVED-24: a ghost row shows title + Flyttad till and no detail', () => {
    const html = renderEventRow({ _ghost: true, title: 'Frukost', date: '2026-06-22', start: '08:00', end: '09:00', movedToText: 'Flyttad till 24 juni 16:00–17:00' });
    assert.ok(html.includes('is-ghost'));
    assert.ok(html.includes('Flyttad till 24 juni 16:00–17:00'));
    assert.ok(!html.includes('data-event-start'));
  });

  it('MOVED-25: the schedule shows the activity on its new day and a ghost on the old day', () => {
    const html = renderSchedulePage({ name: 'Test' }, [moved]);
    assert.ok(html.includes('<details class="day" id="2026-06-22" open>'));
    assert.ok(html.includes('<details class="day" id="2026-06-24" open>'));
    assert.ok(html.includes('ev-moved-to'));
  });

  it('MOVED-26: an unmoved schedule is unchanged (no ghost rows)', () => {
    const html = renderSchedulePage({ name: 'Test' }, [baseEvent()]);
    assert.ok(!html.includes('is-ghost'));
    assert.ok(!html.includes('is-moved'));
  });
});

describe('renderEventPage – moved time, no ghost (02-§119.6, §119.10)', () => {
  it('MOVED-27: the event page shows struck old time and highlighted new time', () => {
    const moved = baseEvent({ date: '2026-06-24', start: '16:00', end: '17:00', moved: { from_date: '2026-06-22', from_start: '08:00', from_end: '09:00' } });
    const html = renderEventPage(moved, { name: 'Test' }, '');
    assert.ok(html.includes('ev-time-old'));
    assert.ok(html.includes('ev-time-new'));
    assert.ok(!html.includes('ev-moved-to'));
  });
});

describe('patchEventObject – relocated capture (02-§119.15)', () => {
  it('MOVED-28: records the previous location when location changes', () => {
    const p = patchEventObject(baseEvent(), { location: 'Nya salen' }, NOW);
    assert.deepEqual(p.relocated, { from_location: 'Matsalen' });
  });

  it('MOVED-29: a non-location edit leaves an existing relocated marker untouched', () => {
    const ev = baseEvent({ relocated: { from_location: 'Ursprung' } });
    const p = patchEventObject(ev, { title: 'Nytt' }, NOW);
    assert.deepEqual(p.relocated, { from_location: 'Ursprung' });
  });

  it('MOVED-30: a non-relocated edit adds no marker', () => {
    const p = patchEventObject(baseEvent(), { title: 'Nytt' }, NOW);
    assert.equal(p.relocated, undefined);
  });

  it('MOVED-31: restoring the original location clears the marker', () => {
    const ev = baseEvent({ location: 'Nya salen', relocated: { from_location: 'Matsalen' } });
    const p = patchEventObject(ev, { location: 'Matsalen' }, NOW);
    assert.equal(p.relocated, undefined);
  });

  it('MOVED-32: resolveRelocated returns null when the location is unchanged', () => {
    assert.equal(resolveRelocated(baseEvent(), 'Matsalen'), null);
  });

  it('MOVED-33: a location change is independent of a time move', () => {
    const p = patchEventObject(baseEvent(), { start: '10:00', location: 'Nya salen' }, NOW);
    assert.deepEqual(p.moved, { from_date: '2026-06-22', from_start: '08:00', from_end: '09:00' });
    assert.deepEqual(p.relocated, { from_location: 'Matsalen' });
  });
});

describe('buildFragmentYaml – relocated serialisation (02-§119.14)', () => {
  it('MOVED-34: round-trips the relocated block', () => {
    const y = buildFragmentYaml(baseEvent({ location: 'Nya salen', relocated: { from_location: 'Matsalen' } }));
    assert.deepEqual(yaml.load(y).event.relocated, { from_location: 'Matsalen' });
  });

  it('MOVED-35: omits the relocated block when absent', () => {
    assert.ok(!buildFragmentYaml(baseEvent()).includes('relocated:'));
  });
});

describe('lint-yaml – relocated validation (05-§3.7)', () => {
  const wrap = (eventLines) => `camp:\n  id: c\n  name: C\n  location: L\n  start_date: '2026-06-22'\n  end_date: '2026-06-28'\nevents:\n${eventLines}\n`;
  const valid = [
    "- id: a-2026-06-24-1000",
    "  title: A",
    "  date: '2026-06-24'",
    "  start: '10:00'",
    "  end: '11:00'",
    "  location: Nya salen",
    "  responsible: R",
  ];

  it('MOVED-36: accepts a well-formed relocated block', () => {
    const lines = valid.concat(['  relocated:', '    from_location: Gamla salen']).join('\n');
    assert.equal(validateYaml(wrap(lines)).ok, true);
  });

  it('MOVED-37: rejects an empty relocated.from_location', () => {
    const lines = valid.concat(['  relocated:', "    from_location: ''"]).join('\n');
    const res = validateYaml(wrap(lines));
    assert.equal(res.ok, false);
    assert.ok(res.errors.some((e) => /relocated\.from_location/.test(e)));
  });
});

describe('moved.js – location markup (02-§119.16)', () => {
  it('MOVED-38: isRelocated is false without a marker', () => {
    assert.equal(isRelocated(baseEvent()), false);
  });

  it('MOVED-39: locationHtml shows the struck old location before the new one', () => {
    const html = locationHtml(baseEvent({ location: 'Nya salen', relocated: { from_location: 'Matsalen' } }));
    assert.equal(html, '<span class="ev-loc-old">Matsalen</span> Nya salen');
  });

  it('MOVED-40: locationHtml is the plain location when not relocated', () => {
    assert.equal(locationHtml(baseEvent({ location: 'Matsalen' })), 'Matsalen');
  });

  it('MOVED-41: a relocated schedule row shows the struck old location, no ghost', () => {
    const ev = baseEvent({ location: 'Nya salen', relocated: { from_location: 'Matsalen' } });
    const html = renderSchedulePage({ name: 'Test' }, [ev]);
    assert.ok(html.includes('<span class="ev-loc-old">Matsalen</span> Nya salen'));
    assert.ok(!html.includes('is-ghost'));
  });

  it('MOVED-42: the event page shows the struck old location', () => {
    const ev = baseEvent({ location: 'Nya salen', relocated: { from_location: 'Matsalen' } });
    const html = renderEventPage(ev, { name: 'Test' }, '');
    assert.ok(html.includes('<span class="ev-loc-old">Matsalen</span> Nya salen'));
  });
});
