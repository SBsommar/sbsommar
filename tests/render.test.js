'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  toDateString,
  escapeHtml,
  formatDate,
  groupAndSortEvents,
  eventExtraHtml,
  renderEventRow,
} = require('../source/build/render');

// ── toDateString ─────────────────────────────────────────────────────────────

describe('toDateString', () => {
  it('passes through an ISO string unchanged', () => {
    assert.strictEqual(toDateString('2025-06-22'), '2025-06-22');
  });

  it('converts a Date object to YYYY-MM-DD', () => {
    assert.strictEqual(toDateString(new Date('2025-06-22T12:00:00Z')), '2025-06-22');
  });

  it('coerces a number to string', () => {
    assert.strictEqual(toDateString(42), '42');
  });
});

// ── escapeHtml ───────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('escapes ampersand', () => {
    assert.strictEqual(escapeHtml('a & b'), 'a &amp; b');
  });

  it('escapes less-than and greater-than', () => {
    assert.strictEqual(escapeHtml('<script>'), '&lt;script&gt;');
  });

  it('escapes double quotes', () => {
    assert.strictEqual(escapeHtml('say "hi"'), 'say &quot;hi&quot;');
  });

  it('returns empty string for null', () => {
    assert.strictEqual(escapeHtml(null), '');
  });

  it('returns empty string for undefined', () => {
    assert.strictEqual(escapeHtml(undefined), '');
  });

  it('passes through a safe string unchanged', () => {
    assert.strictEqual(escapeHtml('Hello world'), 'Hello world');
  });
});

// ── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a Sunday in Swedish', () => {
    assert.strictEqual(formatDate('2025-06-22'), 'söndag 22 juni 2025');
  });

  it('formats a Monday in Swedish', () => {
    assert.strictEqual(formatDate('2025-06-23'), 'måndag 23 juni 2025');
  });

  it('formats a Saturday in Swedish', () => {
    assert.strictEqual(formatDate('2025-06-28'), 'lördag 28 juni 2025');
  });

  it('uses the correct Swedish month name', () => {
    assert.ok(formatDate('2025-08-10').includes('augusti'), 'Expected "augusti"');
  });

  // All 7 weekdays
  it('formats a Tuesday in Swedish', () => {
    assert.strictEqual(formatDate('2025-06-24'), 'tisdag 24 juni 2025');
  });

  it('formats a Wednesday in Swedish', () => {
    assert.strictEqual(formatDate('2025-06-25'), 'onsdag 25 juni 2025');
  });

  it('formats a Thursday in Swedish', () => {
    assert.strictEqual(formatDate('2025-06-26'), 'torsdag 26 juni 2025');
  });

  it('formats a Friday in Swedish', () => {
    assert.strictEqual(formatDate('2025-06-27'), 'fredag 27 juni 2025');
  });

  // All 12 months
  it('uses the correct month name for January', () => {
    assert.ok(formatDate('2025-01-15').includes('januari'), 'Expected "januari"');
  });

  it('uses the correct month name for February', () => {
    assert.ok(formatDate('2025-02-15').includes('februari'), 'Expected "februari"');
  });

  it('uses the correct month name for March', () => {
    assert.ok(formatDate('2025-03-15').includes('mars'), 'Expected "mars"');
  });

  it('uses the correct month name for April', () => {
    assert.ok(formatDate('2025-04-15').includes('april'), 'Expected "april"');
  });

  it('uses the correct month name for May', () => {
    assert.ok(formatDate('2025-05-15').includes('maj'), 'Expected "maj"');
  });

  it('uses the correct month name for July', () => {
    assert.ok(formatDate('2025-07-15').includes('juli'), 'Expected "juli"');
  });

  it('uses the correct month name for September', () => {
    assert.ok(formatDate('2025-09-15').includes('september'), 'Expected "september"');
  });

  it('uses the correct month name for October', () => {
    assert.ok(formatDate('2025-10-15').includes('oktober'), 'Expected "oktober"');
  });

  it('uses the correct month name for November', () => {
    assert.ok(formatDate('2025-11-15').includes('november'), 'Expected "november"');
  });

  it('uses the correct month name for December', () => {
    assert.ok(formatDate('2025-12-15').includes('december'), 'Expected "december"');
  });
});

// ── groupAndSortEvents ───────────────────────────────────────────────────────

describe('groupAndSortEvents', () => {
  const events = [
    { id: 'c', date: '2025-06-22', start: '14:00', title: 'Afternoon' },
    { id: 'a', date: '2025-06-22', start: '08:00', title: 'Morning' },
    { id: 'b', date: '2025-06-23', start: '10:00', title: 'Next day' },
  ];

  it('groups events by date', () => {
    const { byDate } = groupAndSortEvents(events);
    assert.deepStrictEqual(Object.keys(byDate), ['2025-06-22', '2025-06-23']);
    assert.strictEqual(byDate['2025-06-22'].length, 2);
    assert.strictEqual(byDate['2025-06-23'].length, 1);
  });

  it('returns dates in chronological order', () => {
    const { dates } = groupAndSortEvents(events);
    assert.deepStrictEqual(dates, ['2025-06-22', '2025-06-23']);
  });

  it('sorts events within a day by start time', () => {
    const { byDate } = groupAndSortEvents(events);
    const day = byDate['2025-06-22'];
    assert.strictEqual(day[0].start, '08:00');
    assert.strictEqual(day[1].start, '14:00');
  });

  it('handles an empty events list', () => {
    const { dates, byDate } = groupAndSortEvents([]);
    assert.deepStrictEqual(dates, []);
    assert.deepStrictEqual(byDate, {});
  });

  it('handles a single event', () => {
    const single = [{ id: 'x', date: '2025-07-01', start: '09:00', title: 'Solo' }];
    const { dates, byDate } = groupAndSortEvents(single);
    assert.deepStrictEqual(dates, ['2025-07-01']);
    assert.strictEqual(byDate['2025-07-01'].length, 1);
  });
});

// ── eventExtraHtml ───────────────────────────────────────────────────────────

describe('eventExtraHtml', () => {
  it('renders a description paragraph', () => {
    const html = eventExtraHtml({ description: 'Bring sunscreen.', link: null });
    assert.ok(html.includes('Bring sunscreen.'), 'Expected desc text');
    assert.ok(html.includes('class="event-desc"'), 'Expected event-desc class');
  });

  it('splits double newlines into separate paragraphs', () => {
    const html = eventExtraHtml({ description: 'First.\n\nSecond.', link: null });
    assert.ok(html.includes('<p>First.</p>'), 'Expected first paragraph');
    assert.ok(html.includes('<p>Second.</p>'), 'Expected second paragraph');
  });

  it('renders an external link', () => {
    const html = eventExtraHtml({ description: null, link: 'https://example.com' });
    assert.ok(html.includes('href="https://example.com"'), 'Expected href');
    assert.ok(html.includes('Extern länk →'), 'Expected link text');
    assert.ok(html.includes('target="_blank"'), 'Expected target blank');
    assert.ok(html.includes('rel="noopener"'), 'Expected rel noopener');
  });

  it('renders both description and link', () => {
    const html = eventExtraHtml({ description: 'Details.', link: 'https://example.com' });
    assert.ok(html.includes('Details.'), 'Expected description');
    assert.ok(html.includes('href="https://example.com"'), 'Expected link');
  });

  it('renders markdown bold as <strong> in description (02-§56.2)', () => {
    const html = eventExtraHtml({ description: 'This is **bold** text', link: null });
    assert.ok(html.includes('<strong>bold</strong>'), `Expected <strong>, got: ${html}`);
  });

  it('sanitizes script tags in markdown description (02-§56.6)', () => {
    const html = eventExtraHtml({ description: 'Hello <script>alert(1)</script>', link: null });
    assert.ok(!html.includes('<script>'), `script tags must be stripped, got: ${html}`);
  });

  it('escapes HTML in link URL', () => {
    const html = eventExtraHtml({ description: null, link: 'https://x.com?a=1&b=2' });
    assert.ok(html.includes('&amp;'), 'Expected escaped ampersand in URL');
    assert.ok(!html.includes('&b=2'), 'Must not contain unescaped &b=2');
  });
});

// ── renderEventRow ───────────────────────────────────────────────────────────

describe('renderEventRow', () => {
  it('renders a plain row when there is no description and no link', () => {
    const e = {
      title: 'Frukost',
      date: '2025-06-22',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'alla',
      description: null,
      link: null,
    };
    const html = renderEventRow(e);
    assert.ok(html.includes('class="event-row plain"'), 'Expected plain class');
    assert.ok(html.includes('08:00–09:00'), 'Expected time range');
    assert.ok(html.includes('Frukost'), 'Expected title');
    assert.ok(html.includes('Matsalen'), 'Expected location');
    assert.ok(!html.includes('<details'), 'Must not be a details element');
  });

  it('renders a <details> row when description is present', () => {
    const e = {
      title: 'Workshop',
      date: '2025-06-22',
      start: '10:00',
      end: '12:00',
      location: 'Salen',
      responsible: 'Bob',
      description: 'Bring your laptop.',
      link: null,
    };
    const html = renderEventRow(e);
    assert.ok(html.includes('<details class="event-row"'), 'Expected details element');
    assert.ok(html.includes('<summary>'), 'Expected summary element');
    assert.ok(html.includes('Bring your laptop.'), 'Expected description text');
  });

  it('renders a <details> row when link is present', () => {
    const e = {
      title: 'Utflykt',
      date: '2025-06-22',
      start: '13:00',
      end: null,
      location: 'Utomhus',
      responsible: 'Anna',
      description: null,
      link: 'https://maps.example.com',
    };
    const html = renderEventRow(e);
    assert.ok(html.includes('<details class="event-row"'), 'Expected details element');
    assert.ok(html.includes('href="https://maps.example.com"'), 'Expected link URL');
  });

  it('omits the en-dash when end time is missing', () => {
    const e = {
      title: 'Morgonmöte',
      date: '2025-06-22',
      start: '07:30',
      end: null,
      location: 'Tältet',
      responsible: 'alla',
      description: null,
      link: null,
    };
    const html = renderEventRow(e);
    assert.ok(html.includes('07:30'), 'Expected start time');
    assert.ok(!html.includes('–'), 'Must not contain en-dash without end time');
  });

  it('renders location and responsible in meta span', () => {
    const e = {
      title: 'Kvällsmys',
      date: '2025-06-22',
      start: '21:00',
      end: null,
      location: 'Stugan',
      responsible: 'Kalle',
      description: null,
      link: null,
    };
    const html = renderEventRow(e);
    assert.ok(html.includes('class="ev-meta"'), 'Expected meta span');
    assert.ok(html.includes('Stugan'), 'Expected location');
    assert.ok(html.includes('Kalle'), 'Expected responsible');
  });

  it('escapes HTML in event title', () => {
    const e = {
      title: '<XSS>',
      date: '2025-06-22',
      start: '09:00',
      end: null,
      location: 'Somewhere',
      responsible: 'alla',
      description: null,
      link: null,
    };
    const html = renderEventRow(e);
    assert.ok(html.includes('&lt;XSS&gt;'), 'Expected escaped title');
    assert.ok(!html.includes('<XSS>'), 'Must not contain raw <XSS>');
  });

  it('RND-46: includes a data-event-id attribute with the event ID', () => { // RND-46
    const e = {
      id: 'frukost-2025-06-22-0800',
      title: 'Frukost',
      date: '2025-06-22',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
      description: null,
      link: null,
    };
    const html = renderEventRow(e);
    assert.ok(html.includes('data-event-id="frukost-2025-06-22-0800"'), `Missing data-event-id in:\n${html}`);
  });

  it('RND-47: data-event-id value matches the event id exactly', () => { // RND-47
    const id = 'morgonyoga-2025-06-23-0730';
    const e = {
      id,
      title: 'Morgonyoga',
      date: '2025-06-23',
      start: '07:30',
      end: '08:00',
      location: 'Idrott',
      responsible: 'Stina',
      description: null,
      link: null,
    };
    const html = renderEventRow(e);
    // Extract the data-event-id value from the HTML
    const match = html.match(/data-event-id="([^"]+)"/);
    assert.ok(match, 'Expected data-event-id attribute');
    assert.strictEqual(match[1], id);
  });

  it('RND-48: exposes data-event-start and data-event-end on a plain row (02-§116.1)', () => { // RND-48
    const e = {
      title: 'Frukost',
      date: '2025-06-22',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'alla',
      description: null,
      link: null,
    };
    const html = renderEventRow(e);
    assert.ok(html.includes('data-event-start="08:00"'), `Missing data-event-start in:\n${html}`);
    assert.ok(html.includes('data-event-end="09:00"'), `Missing data-event-end in:\n${html}`);
  });

  it('RND-49: exposes data-event-start and data-event-end on a details row (02-§116.1)', () => { // RND-49
    const e = {
      title: 'Workshop',
      date: '2025-06-22',
      start: '10:00',
      end: '12:00',
      location: 'Salen',
      responsible: 'Bob',
      description: 'Bring your laptop.',
      link: null,
    };
    const html = renderEventRow(e);
    assert.ok(html.includes('<details class="event-row"'), 'Expected details element');
    assert.ok(html.includes('data-event-start="10:00"'), `Missing data-event-start in:\n${html}`);
    assert.ok(html.includes('data-event-end="12:00"'), `Missing data-event-end in:\n${html}`);
  });

  it('RND-50: omits data-event-end when the activity has no end time (02-§116.3)', () => { // RND-50
    const e = {
      title: 'Morgonmöte',
      date: '2025-06-22',
      start: '07:30',
      end: null,
      location: 'Tältet',
      responsible: 'alla',
      description: null,
      link: null,
    };
    const html = renderEventRow(e);
    assert.ok(html.includes('data-event-start="07:30"'), 'Expected data-event-start');
    assert.ok(!html.includes('data-event-end'), `Must not emit data-event-end without an end time:\n${html}`);
  });
});
