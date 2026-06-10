'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { validateEventRequest, validateEditRequest } = require('../source/api/validate');

// ── Helpers ───────────────────────────────────────────────────────────────────

function valid(overrides = {}) {
  return {
    title: 'Frukost',
    date: '2099-06-22',
    start: '08:00',
    end: '09:00',
    location: 'Matsalen',
    responsible: 'Alla',
    ...overrides,
  };
}

// ── Body guard ────────────────────────────────────────────────────────────────

describe('validateEventRequest – body guard', () => {
  it('rejects null body', () => {
    const r = validateEventRequest(null);
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.length > 0);
  });

  it('rejects non-object body', () => {
    const r = validateEventRequest('string');
    assert.strictEqual(r.ok, false);
  });

  it('rejects missing body (undefined)', () => {
    const r = validateEventRequest(undefined);
    assert.strictEqual(r.ok, false);
  });
});

// ── Required fields ───────────────────────────────────────────────────────────

describe('validateEventRequest – required fields', () => {
  it('rejects missing title', () => {
    const r = validateEventRequest(valid({ title: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('rejects whitespace-only title', () => {
    const r = validateEventRequest(valid({ title: '   ' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('rejects non-string title', () => {
    const r = validateEventRequest(valid({ title: 42 }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('rejects missing date', () => {
    const r = validateEventRequest(valid({ date: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('date'));
  });

  it('rejects missing start', () => {
    const r = validateEventRequest(valid({ start: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('start'));
  });

  it('rejects missing end', () => {
    const r = validateEventRequest(valid({ end: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('rejects missing location', () => {
    const r = validateEventRequest(valid({ location: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('location'));
  });

  it('rejects missing responsible', () => {
    const r = validateEventRequest(valid({ responsible: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('responsible'));
  });
});

// ── Date format ───────────────────────────────────────────────────────────────

describe('validateEventRequest – date validation', () => {
  it('rejects date in wrong format (DD-MM-YYYY)', () => {
    const r = validateEventRequest(valid({ date: '22-06-2025' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('YYYY-MM-DD'));
  });

  it('rejects date in wrong format (YYYY/MM/DD)', () => {
    const r = validateEventRequest(valid({ date: '2025/06/22' }));
    assert.strictEqual(r.ok, false);
  });

  it('rejects date with text', () => {
    const r = validateEventRequest(valid({ date: 'not-a-date' }));
    assert.strictEqual(r.ok, false);
  });

  it('rejects structurally valid but calendar-impossible date', () => {
    // 2025-13-01 matches the regex but is not a real date
    const r = validateEventRequest(valid({ date: '2025-13-01' }));
    assert.strictEqual(r.ok, false);
  });

  it('accepts a valid ISO date', () => {
    const r = validateEventRequest(valid({ date: '2099-06-22' }));
    assert.strictEqual(r.ok, true);
  });
});

// ── Time ordering ─────────────────────────────────────────────────────────────

describe('validateEventRequest – time ordering', () => {
  it('rejects end equal to start', () => {
    const r = validateEventRequest(valid({ start: '09:00', end: '09:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('rejects end before start', () => {
    const r = validateEventRequest(valid({ start: '10:00', end: '09:00' }));
    assert.strictEqual(r.ok, false);
  });

  it('accepts end one minute after start', () => {
    const r = validateEventRequest(valid({ start: '08:00', end: '08:01' }));
    assert.strictEqual(r.ok, true);
  });

  it('accepts events near midnight (23:00 → 23:59)', () => {
    const r = validateEventRequest(valid({ start: '23:00', end: '23:59' }));
    assert.strictEqual(r.ok, true);
  });

  it('accepts events starting at 00:00', () => {
    const r = validateEventRequest(valid({ start: '00:00', end: '01:00' }));
    assert.strictEqual(r.ok, true);
  });
});

// ── Midnight crossing (02-§54.1–54.5) ────────────────────────────────────────

describe('validateEventRequest – midnight crossing', () => {
  it('VLD-56: accepts 90-min midnight crossing (23:00 → 00:30)', () => {
    const r = validateEventRequest(valid({ start: '23:00', end: '00:30' }));
    assert.strictEqual(r.ok, true);
  });

  it('VLD-57: accepts 60-min midnight crossing (23:17 → 00:17)', () => {
    const r = validateEventRequest(valid({ start: '23:17', end: '00:17' }));
    assert.strictEqual(r.ok, true);
  });

  it('VLD-58: accepts crossing at threshold (07:00 → 00:00 = 1020 min)', () => {
    const r = validateEventRequest(valid({ start: '07:00', end: '00:00' }));
    assert.strictEqual(r.ok, true);
  });

  it('VLD-59: rejects crossing over threshold (06:59 → 00:00 = 1021 min)', () => {
    const r = validateEventRequest(valid({ start: '06:59', end: '00:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('VLD-60: still rejects end equal to start', () => {
    const r = validateEventRequest(valid({ start: '09:00', end: '09:00' }));
    assert.strictEqual(r.ok, false);
  });

  it('VLD-61: still accepts normal end > start (regression)', () => {
    const r = validateEventRequest(valid({ start: '08:00', end: '17:00' }));
    assert.strictEqual(r.ok, true);
  });
});

describe('validateEditRequest – midnight crossing', () => {
  it('VLD-62: accepts midnight crossing (23:00 → 00:30)', () => {
    const r = validateEditRequest(validEdit({ start: '23:00', end: '00:30' }));
    assert.strictEqual(r.ok, true);
  });

  it('VLD-63: rejects crossing over threshold (06:00 → 00:00 = 1080 min)', () => {
    const r = validateEditRequest(validEdit({ start: '06:00', end: '00:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });
});

// ── Optional fields ───────────────────────────────────────────────────────────

describe('validateEventRequest – optional fields', () => {
  it('accepts request with no optional fields', () => {
    const r = validateEventRequest({
      title: 'Frukost',
      date: '2099-06-22',
      start: '08:00',
      end: '09:00',
      location: 'Matsalen',
      responsible: 'Alla',
    });
    assert.strictEqual(r.ok, true);
  });

  it('accepts valid description string', () => {
    const r = validateEventRequest(valid({ description: 'Kom hungrig.' }));
    assert.strictEqual(r.ok, true);
  });

  it('rejects non-string description', () => {
    const r = validateEventRequest(valid({ description: 123 }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('description'));
  });

  it('accepts valid link string', () => {
    const r = validateEventRequest(valid({ link: 'https://example.com' }));
    assert.strictEqual(r.ok, true);
  });

  it('rejects non-string link', () => {
    const r = validateEventRequest(valid({ link: true }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('link'));
  });

  it('accepts valid ownerName string', () => {
    const r = validateEventRequest(valid({ ownerName: 'Anna Andersson' }));
    assert.strictEqual(r.ok, true);
  });

  it('rejects non-string ownerName', () => {
    const r = validateEventRequest(valid({ ownerName: [] }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('ownerName'));
  });
});

// ── validateEditRequest – end time required ────────────────────────────────────

function validEdit(overrides = {}) {
  return {
    id: '2099-08-04-frukost',
    title: 'Frukost',
    date: '2099-06-22',
    start: '08:00',
    end: '09:00',
    location: 'Matsalen',
    responsible: 'Alla',
    ...overrides,
  };
}

describe('validateEditRequest – end time required', () => {
  it('VLD-27: rejects empty end', () => {
    const r = validateEditRequest(validEdit({ end: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('VLD-28: rejects absent end', () => {
    const r = validateEditRequest(validEdit({ end: undefined }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('VLD-29: rejects end equal to start', () => {
    const r = validateEditRequest(validEdit({ start: '09:00', end: '09:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('end'));
  });

  it('VLD-30: rejects end before start', () => {
    const r = validateEditRequest(validEdit({ start: '10:00', end: '09:00' }));
    assert.strictEqual(r.ok, false);
  });

  it('VLD-31: accepts end one minute after start', () => {
    const r = validateEditRequest(validEdit({ start: '08:00', end: '08:01' }));
    assert.strictEqual(r.ok, true);
  });

  it('VLD-32: accepts a fully valid edit request', () => {
    const r = validateEditRequest(validEdit());
    assert.deepStrictEqual(r, { ok: true });
  });
});

// ── Past-date blocking (02-§26.4, 02-§26.5, 02-§26.6) ──────────────────────

describe('validateEventRequest – past-date blocking', () => {
  it('PDT-03: rejects a date in the past', () => {
    const r = validateEventRequest(valid({ date: '2020-01-01' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('förflutna'));
  });

  it('PDT-04: accepts today\'s date', () => {
    const today = new Date().toISOString().slice(0, 10);
    const r = validateEventRequest(valid({ date: today }));
    assert.strictEqual(r.ok, true);
  });
});

describe('validateEditRequest – past-date blocking', () => {
  it('PDT-05: rejects a date in the past', () => {
    const r = validateEditRequest(validEdit({ date: '2020-01-01' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('förflutna'));
  });

  it('PDT-06: accepts today\'s date', () => {
    const today = new Date().toISOString().slice(0, 10);
    const r = validateEditRequest(validEdit({ date: today }));
    assert.strictEqual(r.ok, true);
  });
});

// ── Time format (05-§4.2, 05-§4.4) ──────────────────────────────────────────

describe('validateEventRequest – time format', () => {
  it('VLD-33: rejects start without leading zero (e.g. "8:00")', () => {
    const r = validateEventRequest(valid({ start: '8:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('HH:MM'));
  });

  it('VLD-34: rejects start with extra characters (e.g. "08:00:00")', () => {
    const r = validateEventRequest(valid({ start: '08:00:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('HH:MM'));
  });

  it('VLD-35: rejects end without leading zero (e.g. "9:00")', () => {
    const r = validateEventRequest(valid({ end: '9:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('HH:MM'));
  });

  it('VLD-36: rejects end with no colon (e.g. "0900")', () => {
    const r = validateEventRequest(valid({ end: '0900' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('HH:MM'));
  });

  it('VLD-37: rejects start with letters (e.g. "ab:cd")', () => {
    const r = validateEventRequest(valid({ start: 'ab:cd' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('HH:MM'));
  });

  it('VLD-38: accepts valid HH:MM start "08:00"', () => {
    const r = validateEventRequest(valid({ start: '08:00', end: '09:00' }));
    assert.strictEqual(r.ok, true);
  });

  it('VLD-39: accepts valid HH:MM end "23:59"', () => {
    const r = validateEventRequest(valid({ start: '23:00', end: '23:59' }));
    assert.strictEqual(r.ok, true);
  });
});

describe('validateEditRequest – time format', () => {
  it('VLD-40: rejects start without leading zero', () => {
    const r = validateEditRequest(validEdit({ start: '8:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('HH:MM'));
  });

  it('VLD-41: rejects end without leading zero', () => {
    const r = validateEditRequest(validEdit({ end: '9:00' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('HH:MM'));
  });
});

// ── String length limits (02-§10.3) ─────────────────────────────────────────

describe('validateEventRequest – string length limits', () => {
  it('VLD-42: rejects title exceeding 80 characters', () => {
    const r = validateEventRequest(valid({ title: 'A'.repeat(81) }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('VLD-43: accepts title at exactly 80 characters', () => {
    const r = validateEventRequest(valid({ title: 'A'.repeat(80) }));
    assert.strictEqual(r.ok, true);
  });

  it('VLD-44: rejects location exceeding 200 characters', () => {
    const r = validateEventRequest(valid({ location: 'B'.repeat(201) }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('location'));
  });

  it('VLD-45: rejects responsible exceeding 60 characters', () => {
    const r = validateEventRequest(valid({ responsible: 'C'.repeat(61) }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('responsible'));
  });

  it('VLD-46: rejects description exceeding 2000 characters', () => {
    const r = validateEventRequest(valid({ description: 'D'.repeat(2001) }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('description'));
  });

  it('VLD-47: accepts description at exactly 2000 characters', () => {
    const r = validateEventRequest(valid({ description: 'D'.repeat(2000) }));
    assert.strictEqual(r.ok, true);
  });

  it('VLD-48: rejects link exceeding 500 characters', () => {
    const r = validateEventRequest(valid({ link: 'https://example.com/' + 'x'.repeat(481) }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('link'));
  });
});

describe('validateEditRequest – string length limits', () => {
  it('VLD-49: rejects title exceeding 80 characters', () => {
    const r = validateEditRequest(validEdit({ title: 'A'.repeat(81) }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });
});

// ── Date within camp range (05-§4.1) ────────────────────────────────────────

describe('validateEventRequest – date within camp range', () => {
  it('VLD-50: rejects date before camp start_date', () => {
    const r = validateEventRequest(valid({ date: '2099-06-20' }), {
      start_date: '2099-06-21',
      end_date: '2099-06-28',
    });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('utanför'));
  });

  it('VLD-51: rejects date after camp end_date', () => {
    const r = validateEventRequest(valid({ date: '2099-06-29' }), {
      start_date: '2099-06-21',
      end_date: '2099-06-28',
    });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('utanför'));
  });

  it('VLD-52: accepts date on camp start_date (inclusive)', () => {
    const r = validateEventRequest(valid({ date: '2099-06-21' }), {
      start_date: '2099-06-21',
      end_date: '2099-06-28',
    });
    assert.strictEqual(r.ok, true);
  });

  it('VLD-53: accepts date on camp end_date (inclusive)', () => {
    const r = validateEventRequest(valid({ date: '2099-06-28' }), {
      start_date: '2099-06-21',
      end_date: '2099-06-28',
    });
    assert.strictEqual(r.ok, true);
  });

  it('VLD-54: skips range check when no camp dates provided', () => {
    const r = validateEventRequest(valid({ date: '2099-06-22' }));
    assert.strictEqual(r.ok, true);
  });
});

describe('validateEditRequest – date within camp range', () => {
  it('VLD-55: rejects date outside camp range', () => {
    const r = validateEditRequest(validEdit({ date: '2099-06-20' }), {
      start_date: '2099-06-21',
      end_date: '2099-06-28',
    });
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('utanför'));
  });
});

// ── Happy path ────────────────────────────────────────────────────────────────

describe('validateEventRequest – happy path', () => {
  it('accepts a fully populated valid request', () => {
    const r = validateEventRequest({
      title: 'Morgonmöte',
      date: '2099-06-22',
      start: '08:30',
      end: '09:00',
      location: 'GA Datorsal',
      responsible: 'Lisa Lautrup',
      description: 'Ta med din dator.',
      link: 'https://meet.example.com',
      ownerName: 'Lisa Lautrup',
    });
    assert.strictEqual(r.ok, true);
  });

  it('returns { ok: true } with no extra fields on success', () => {
    const r = validateEventRequest(valid());
    assert.deepStrictEqual(r, { ok: true });
  });
});

// ── Injection pattern scanning (02-§49.1, 02-§49.2, 02-§49.3) ──────────────

describe('validateEventRequest – injection pattern scanning', () => {
  it('ASEC-01: rejects <script> tag in title', () => {
    const r = validateEventRequest(valid({ title: '<script>alert(1)</script>' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('ASEC-02: rejects javascript: URI in description', () => {
    const r = validateEventRequest(valid({ description: 'javascript:alert(1)' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('description'));
  });

  it('ASEC-03: rejects on*= event handler in location', () => {
    const r = validateEventRequest(valid({ location: 'Room onerror=alert(1)' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('location'));
  });

  it('ASEC-04: rejects <iframe> in responsible', () => {
    const r = validateEventRequest(valid({ responsible: '<iframe src="x">' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('responsible'));
  });

  it('ASEC-05: rejects <object> in title', () => {
    const r = validateEventRequest(valid({ title: '<object data="x">' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('ASEC-06: rejects <embed> in description', () => {
    const r = validateEventRequest(valid({ description: '<embed src="x">' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('description'));
  });

  it('ASEC-07: rejects data:text/html in description', () => {
    const r = validateEventRequest(valid({ description: 'data:text/html,<h1>x</h1>' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('description'));
  });
});

// ── Link protocol validation (02-§49.4) ─────────────────────────────────────

describe('validateEventRequest – link protocol validation', () => {
  it('ASEC-08: rejects javascript: link', () => {
    const r = validateEventRequest(valid({ link: 'javascript:alert(1)' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('link'));
  });

  it('ASEC-09: rejects ftp:// link', () => {
    const r = validateEventRequest(valid({ link: 'ftp://example.com/file' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('link'));
  });

  it('ASEC-10: rejects relative link (no protocol)', () => {
    const r = validateEventRequest(valid({ link: '/some/path' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('link'));
  });
});

// ── Edit request: injection + link protocol (02-§49.5) ──────────────────────

describe('validateEditRequest – injection pattern scanning', () => {
  it('ASEC-11: rejects <script> tag in title', () => {
    const r = validateEditRequest(validEdit({ title: '<script>alert(1)</script>' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('ASEC-12: rejects javascript: URI in description', () => {
    const r = validateEditRequest(validEdit({ description: 'javascript:alert(1)' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('description'));
  });

  it('ASEC-13: rejects on*= event handler in location', () => {
    const r = validateEditRequest(validEdit({ location: 'Room onclick=x' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('location'));
  });

  it('ASEC-14: rejects <embed> in responsible', () => {
    const r = validateEditRequest(validEdit({ responsible: '<embed src="x">' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('responsible'));
  });
});

describe('validateEditRequest – link protocol validation', () => {
  it('ASEC-15: rejects ftp:// link', () => {
    const r = validateEditRequest(validEdit({ link: 'ftp://example.com' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('link'));
  });

  it('ASEC-16: rejects data: link', () => {
    const r = validateEditRequest(validEdit({ link: 'data:text/html,<h1>x</h1>' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('link'));
  });
});

// ── Control characters / line breaks in single-line fields (02-§102.1, .2) ───
// A line break or control character in a single-line scalar field could break
// out of its line and alter the appended YAML structure, so these are rejected
// before anything reaches git.

describe('validateEventRequest – control characters in single-line fields (02-§102)', () => {
  it('YSEC-01: rejects a newline in title', () => {
    const r = validateEventRequest(valid({ title: "Frukost\nresponsible: 'evil'" }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('YSEC-02: rejects a newline in location', () => {
    const r = validateEventRequest(valid({ location: 'Matsalen\n  smuggled: true' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('location'));
  });

  it('YSEC-03: rejects a newline in responsible', () => {
    const r = validateEventRequest(valid({ responsible: 'Alla\nevil' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('responsible'));
  });

  it('YSEC-04: rejects a newline in link', () => {
    const r = validateEventRequest(valid({ link: 'https://example.com\nevil' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('link'));
  });

  it('YSEC-05: rejects a newline in ownerName', () => {
    const r = validateEventRequest(valid({ ownerName: 'Anna\nevil' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('ownerName'));
  });

  it('YSEC-06: rejects a carriage return in title', () => {
    const r = validateEventRequest(valid({ title: 'Frukost\rmiddag' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('YSEC-07: rejects a tab in responsible', () => {
    const r = validateEventRequest(valid({ responsible: 'Alla\tevil' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('responsible'));
  });

  it('YSEC-08: rejects a NUL byte in location', () => {
    const r = validateEventRequest(valid({ location: 'Mat\u0000salen' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('location'));
  });

  it('YSEC-09: accepts a value whose only line break is trailing (trimmed away)', () => {
    const r = validateEventRequest(valid({ title: 'Frukost\n' }));
    assert.strictEqual(r.ok, true);
  });
});

// ── description multi-line handling (02-§102.3) ──────────────────────────────
// description is the only intentionally multi-line field: \t, \n, \r are
// permitted; any other control character is rejected.

describe('validateEventRequest – description multi-line handling (02-§102.3)', () => {
  it('YSEC-10: accepts a newline inside description', () => {
    const r = validateEventRequest(valid({ description: 'Rad ett.\nRad två.' }));
    assert.strictEqual(r.ok, true);
  });

  it('YSEC-11: accepts a tab inside description', () => {
    const r = validateEventRequest(valid({ description: 'Kolumn1\tKolumn2' }));
    assert.strictEqual(r.ok, true);
  });

  it('YSEC-12: rejects a NUL byte in description', () => {
    const r = validateEventRequest(valid({ description: 'Text\u0000slut' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('description'));
  });
});

describe('validateEditRequest – control characters in single-line fields (02-§102)', () => {
  it('YSEC-13: rejects a newline in title', () => {
    const r = validateEditRequest(validEdit({ title: 'Frukost\nevil' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('YSEC-14: rejects a newline in ownerName', () => {
    const r = validateEditRequest(validEdit({ ownerName: 'Anna\nevil' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('ownerName'));
  });
});
