'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Module under test — will be created in Phase 4
const { renderEventIcal, renderIcalFeed, escapeIcal } = require('../source/build/render-ical');

// ── Fixtures ────────────────────────────────────────────────────────────────

const camp = {
  id: '2026-06-syssleback',
  name: 'SB Sommar Juni 2026',
  location: 'Sysslebäck',
  start_date: '2026-06-28',
  end_date: '2026-07-05',
};

const siteUrl = 'https://sommar.digitalasynctransparency.com';

const fullEvent = {
  id: 'fotboll-2026-06-29-1000',
  title: 'Fotboll',
  date: '2026-06-29',
  start: '10:00',
  end: '12:00',
  location: 'Planen',
  responsible: 'Erik',
  description: 'Alla är välkomna att spela fotboll.',
  link: 'https://example.com/fotboll',
};

const minimalEvent = {
  id: 'frukost-2026-06-29-0800',
  title: 'Frukost',
  date: '2026-06-29',
  start: '08:00',
  end: null,
  location: 'Matsalen',
  responsible: 'Kocken',
  description: null,
  link: null,
};

const events = [fullEvent, minimalEvent, {
  id: 'vandring-2026-06-30-1400',
  title: 'Vandring',
  date: '2026-06-30',
  start: '14:00',
  end: '17:00',
  location: 'Skogen',
  responsible: 'Anna',
  description: null,
  link: null,
}];

// ── escapeIcal ──────────────────────────────────────────────────────────────

describe('escapeIcal (02-§45)', () => {
  it('ICAL-01: escapes backslashes', () => {
    assert.strictEqual(escapeIcal('a\\b'), 'a\\\\b');
  });

  it('ICAL-02: escapes semicolons', () => {
    assert.strictEqual(escapeIcal('a;b'), 'a\\;b');
  });

  it('ICAL-03: escapes commas', () => {
    assert.strictEqual(escapeIcal('a,b'), 'a\\,b');
  });

  it('ICAL-04: converts newlines to literal \\n', () => {
    assert.strictEqual(escapeIcal('line1\nline2'), 'line1\\nline2');
  });

  it('ICAL-05: handles combined special characters', () => {
    assert.strictEqual(escapeIcal('a\\b;c,d\ne'), 'a\\\\b\\;c\\,d\\ne');
  });
});

// ── renderEventIcal (per-event .ics) ────────────────────────────────────────

describe('renderEventIcal – per-event .ics (02-§45.2–45.6)', () => {
  it('ICAL-06 (02-§45.3): output is valid iCalendar with VCALENDAR wrapper', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.includes('BEGIN:VCALENDAR'), 'should start VCALENDAR');
    assert.ok(ics.includes('END:VCALENDAR'), 'should end VCALENDAR');
    assert.ok(ics.includes('VERSION:2.0'), 'should have VERSION:2.0');
  });

  it('ICAL-07 (02-§45.3): contains exactly one VEVENT', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    const count = (ics.match(/BEGIN:VEVENT/g) || []).length;
    assert.strictEqual(count, 1, 'should have exactly one VEVENT');
  });

  it('ICAL-08 (02-§45.4): VEVENT includes DTSTART with Stockholm TZID', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.includes('DTSTART;TZID=Europe/Stockholm:20260629T100000'), 'should have DTSTART anchored to Europe/Stockholm');
  });

  it('ICAL-09 (02-§45.4): VEVENT includes DTEND when end is set', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.includes('DTEND;TZID=Europe/Stockholm:20260629T120000'), 'should have DTEND anchored to Europe/Stockholm');
  });

  it('ICAL-10 (02-§45.4): VEVENT includes SUMMARY', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.includes('SUMMARY:Fotboll'), 'should have SUMMARY');
  });

  it('ICAL-11 (02-§45.4): VEVENT includes LOCATION', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.includes('LOCATION:Planen'), 'should have LOCATION');
  });

  it('ICAL-12 (02-§45.4): VEVENT DESCRIPTION starts with Ansvarig', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.includes('DESCRIPTION:Ansvarig: Erik'), 'DESCRIPTION should start with responsible');
  });

  it('ICAL-13 (02-§45.4): VEVENT DESCRIPTION includes event description when set', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    const descMatch = ics.match(/DESCRIPTION:(.+)/);
    assert.ok(descMatch, 'should have DESCRIPTION line');
    assert.ok(descMatch[1].includes('Alla är välkomna att spela fotboll.'), 'should include event description');
  });

  it('ICAL-14 (02-§45.4): VEVENT includes URL', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.includes(`URL:${siteUrl}/schema/${fullEvent.id}/`), 'should have URL to event detail page');
  });

  it('ICAL-15 (02-§45.4): VEVENT includes UID with hostname', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.includes('UID:fotboll-2026-06-29-1000@sommar.digitalasynctransparency.com'), 'should have UID with hostname');
  });

  it('ICAL-16 (02-§45.5): times are anchored to Europe/Stockholm (TZID, no Z)', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    // DTSTART/DTEND must NOT use a UTC Z suffix — they are zoned local times
    assert.ok(!/DTSTART[^\r\n]*Z\r?\n/.test(ics), 'DTSTART should not have Z suffix');
    assert.ok(!/DTEND[^\r\n]*Z\r?\n/.test(ics), 'DTEND should not have Z suffix');
    // They must carry the Europe/Stockholm TZID parameter
    assert.ok(ics.includes('DTSTART;TZID=Europe/Stockholm:'), 'DTSTART should carry TZID=Europe/Stockholm');
  });

  it('ICAL-17 (02-§45.6): DTEND omitted when end is null', () => {
    const ics = renderEventIcal(minimalEvent, camp, siteUrl);
    assert.ok(!ics.includes('DTEND'), 'should not have DTEND when end is null');
  });

  it('ICAL-18 (02-§45.6): DTSTART present even when end is null', () => {
    const ics = renderEventIcal(minimalEvent, camp, siteUrl);
    assert.ok(ics.includes('DTSTART;TZID=Europe/Stockholm:20260629T080000'), 'should have DTSTART');
  });

  it('ICAL-19: DESCRIPTION for event without description only shows responsible', () => {
    const ics = renderEventIcal(minimalEvent, camp, siteUrl);
    const descMatch = ics.match(/DESCRIPTION:(.+)/);
    assert.ok(descMatch, 'should have DESCRIPTION');
    assert.strictEqual(descMatch[1], 'Ansvarig: Kocken', 'should only have responsible');
  });

  it('ICAL-20: escapes iCal special characters in fields', () => {
    const specialEvent = {
      ...fullEvent,
      title: 'Mat, Dryck; Fest',
      location: 'Sal\\A',
      responsible: 'O;Brien',
    };
    const ics = renderEventIcal(specialEvent, camp, siteUrl);
    assert.ok(ics.includes('SUMMARY:Mat\\, Dryck\\; Fest'), 'should escape comma and semicolon in SUMMARY');
    assert.ok(ics.includes('LOCATION:Sal\\\\A'), 'should escape backslash in LOCATION');
  });
});

// ── renderIcalFeed (full-camp .ics) ─────────────────────────────────────────

describe('renderIcalFeed – full-camp .ics (02-§45.10–45.12)', () => {
  it('ICAL-21 (02-§45.10): output is valid iCalendar with VCALENDAR wrapper', () => {
    const ics = renderIcalFeed(camp, events, siteUrl);
    assert.ok(ics.includes('BEGIN:VCALENDAR'), 'should start VCALENDAR');
    assert.ok(ics.includes('END:VCALENDAR'), 'should end VCALENDAR');
  });

  it('ICAL-22 (02-§45.11): contains one VEVENT per event', () => {
    const ics = renderIcalFeed(camp, events, siteUrl);
    const count = (ics.match(/BEGIN:VEVENT/g) || []).length;
    assert.strictEqual(count, events.length, 'should have one VEVENT per event');
  });

  it('ICAL-23 (02-§45.12): VCALENDAR includes PRODID', () => {
    const ics = renderIcalFeed(camp, events, siteUrl);
    assert.ok(ics.includes('PRODID:-//SB Sommar//Schema//SV'), 'should have PRODID');
  });

  it('ICAL-24 (02-§45.12): VCALENDAR includes X-WR-CALNAME with camp name', () => {
    const ics = renderIcalFeed(camp, events, siteUrl);
    assert.ok(ics.includes(`X-WR-CALNAME:Schema – ${camp.name}`), 'should have X-WR-CALNAME');
  });

  it('ICAL-25 (02-§45.12): VCALENDAR includes METHOD:PUBLISH', () => {
    const ics = renderIcalFeed(camp, events, siteUrl);
    assert.ok(ics.includes('METHOD:PUBLISH'), 'should have METHOD:PUBLISH');
  });

  it('ICAL-26: handles empty events array', () => {
    const ics = renderIcalFeed(camp, [], siteUrl);
    assert.ok(ics.includes('BEGIN:VCALENDAR'), 'should still have VCALENDAR');
    const count = (ics.match(/BEGIN:VEVENT/g) || []).length;
    assert.strictEqual(count, 0, 'should have no VEVENTs');
  });

  it('ICAL-27 (02-§45.11): each VEVENT has same fields as per-event files', () => {
    const ics = renderIcalFeed(camp, events, siteUrl);
    // Check that the full event has all expected fields
    assert.ok(ics.includes('SUMMARY:Fotboll'), 'should have Fotboll SUMMARY');
    assert.ok(ics.includes('SUMMARY:Frukost'), 'should have Frukost SUMMARY');
    assert.ok(ics.includes('SUMMARY:Vandring'), 'should have Vandring SUMMARY');
    assert.ok(ics.includes('LOCATION:Planen'), 'should have Planen LOCATION');
    assert.ok(ics.includes(`UID:fotboll-2026-06-29-1000@sommar.digitalasynctransparency.com`), 'should have UID');
  });
});

// ── DTSTAMP (02-§46.14–46.15) ────────────────────────────────────────────────

describe('DTSTAMP in VEVENT (02-§46.14–46.15)', () => {
  it('ICAL-29 (02-§46.14): per-event .ics includes DTSTAMP', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.includes('DTSTAMP:'), 'should have DTSTAMP property');
  });

  it('ICAL-30 (02-§46.15): DTSTAMP is UTC format with Z suffix', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    const match = ics.match(/DTSTAMP:(\S+)/);
    assert.ok(match, 'should have DTSTAMP value');
    assert.match(match[1], /^\d{8}T\d{6}Z$/, 'DTSTAMP should be YYYYMMDDTHHMMSSZ');
  });

  it('ICAL-31 (02-§46.14): full-camp .ics includes DTSTAMP in every VEVENT', () => {
    const ics = renderIcalFeed(camp, events, siteUrl);
    const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    const dtstampCount = (ics.match(/DTSTAMP:/g) || []).length;
    assert.strictEqual(dtstampCount, veventCount, 'every VEVENT should have DTSTAMP');
  });
});

// ── VTIMEZONE / Europe/Stockholm anchoring (02-§45.5) ───────────────────────

describe('VTIMEZONE anchoring (02-§45.5)', () => {
  it('ICAL-34 (02-§45.5): per-event .ics embeds a Europe/Stockholm VTIMEZONE with DST rules', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.includes('BEGIN:VTIMEZONE'), 'should open VTIMEZONE');
    assert.ok(ics.includes('TZID:Europe/Stockholm'), 'should declare TZID:Europe/Stockholm');
    assert.ok(ics.includes('BEGIN:DAYLIGHT'), 'should define the DAYLIGHT (CEST) sub-component');
    assert.ok(ics.includes('BEGIN:STANDARD'), 'should define the STANDARD (CET) sub-component');
    assert.ok(ics.includes('END:VTIMEZONE'), 'should close VTIMEZONE');
  });

  it('ICAL-35 (02-§45.5): VTIMEZONE appears before the first VEVENT', () => {
    const ics = renderEventIcal(fullEvent, camp, siteUrl);
    assert.ok(ics.indexOf('BEGIN:VTIMEZONE') < ics.indexOf('BEGIN:VEVENT'), 'VTIMEZONE should precede VEVENT');
  });

  it('ICAL-36 (02-§45.5): full-camp feed includes exactly one shared VTIMEZONE', () => {
    const ics = renderIcalFeed(camp, events, siteUrl);
    const count = (ics.match(/BEGIN:VTIMEZONE/g) || []).length;
    assert.strictEqual(count, 1, 'should embed one shared VTIMEZONE regardless of event count');
  });
});

// ── No external iCal library (02-§45.7) ─────────────────────────────────────

describe('render-ical.js source (02-§45.7)', () => {
  it('ICAL-28 (02-§45.7): no external iCal library import', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'source', 'build', 'render-ical.js'), 'utf8');
    assert.ok(!src.includes("require('ical"), 'should not import ical library');
    assert.ok(!src.includes('require("ical'), 'should not import ical library');
    assert.ok(!src.includes("require('node-ical"), 'should not import node-ical');
  });
});

// ── Markdown stripping in DESCRIPTION (02-§56.5) ─────────────────────────────

describe('iCal DESCRIPTION markdown stripping (02-§56.5)', () => {
  it('ICAL-32 (02-§56.5): markdown bold syntax is stripped from DESCRIPTION', () => {
    const mdEvent = { ...fullEvent, description: 'This is **bold** and *italic* text' };
    const ics = renderEventIcal(mdEvent, camp, siteUrl);
    assert.ok(!ics.includes('**bold**'), 'bold markers should be stripped');
    assert.ok(!ics.includes('*italic*'), 'italic markers should be stripped');
    assert.ok(ics.includes('bold'), 'bold text should remain');
    assert.ok(ics.includes('italic'), 'italic text should remain');
  });

  it('ICAL-33 (02-§56.5): markdown link syntax is stripped, text kept', () => {
    const mdEvent = { ...fullEvent, description: 'See [the docs](https://example.com)' };
    const ics = renderEventIcal(mdEvent, camp, siteUrl);
    assert.ok(ics.includes('the docs'), 'link text should remain');
    assert.ok(!ics.includes('[the docs]'), 'link brackets should be stripped');
  });
});
