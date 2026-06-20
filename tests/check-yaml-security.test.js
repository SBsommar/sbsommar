'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// The script exports { scanYaml } when required as a module.
// The CLI entry point is guarded by require.main === module.
const { scanYaml } = require('../source/scripts/check-yaml-security');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeYaml(events = []) {
  const header = [
    'camp:',
    '  id: test-camp',
    '  name: Test Camp',
    '  location: Testvik',
    "  start_date: '2026-07-01'",
    "  end_date: '2026-07-07'",
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
      description: null,
      link: null,
    }, e);

    const descLine = ev.description
      ? `  description: '${ev.description}'`
      : '  description: null';
    const linkLine = ev.link
      ? `  link: '${ev.link}'`
      : '  link: null';

    return [
      `- id: ${ev.id}`,
      `  title: '${ev.title}'`,
      `  date: '${ev.date}'`,
      `  start: '${ev.start}'`,
      `  end: '${ev.end}'`,
      `  location: '${ev.location}'`,
      `  responsible: '${ev.responsible}'`,
      descLine,
      linkLine,
    ].join('\n');
  });

  const eventsBlock = eventLines.length > 0
    ? 'events:\n' + eventLines.join('\n')
    : 'events: []';

  return header + '\n\n' + eventsBlock + '\n';
}

function clean(overrides = {}) {
  return Object.assign({
    id: 'frukost-2026-07-01-0800',
    title: 'Frukost',
    location: 'Matsalen',
    responsible: 'Alla',
    description: null,
    link: null,
  }, overrides);
}

// ── Baseline ──────────────────────────────────────────────────────────────────

describe('scanYaml – baseline', () => {
  it('passes a clean event file', () => {
    const r = scanYaml(makeYaml([clean()]));
    assert.strictEqual(r.ok, true, `expected ok but got: ${r.findings}`);
  });

  it('passes a file with no events', () => {
    const r = scanYaml(makeYaml([]));
    assert.strictEqual(r.ok, true);
  });
});

// ── SEC-01..06: Injection patterns (02-§23.6) ─────────────────────────────────

describe('scanYaml – injection patterns (02-§23.6)', () => {
  it('SEC-01: rejects <script> tag in title', () => {
    const r = scanYaml(makeYaml([clean({ title: '<script>alert(1)</script>' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /title/i.test(f)));
  });

  it('SEC-02: rejects javascript: URI in title', () => {
    const r = scanYaml(makeYaml([clean({ title: 'javascript:alert(1)' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /title/i.test(f)));
  });

  it('SEC-03: rejects on*= event handler attribute in description', () => {
    const r = scanYaml(makeYaml([clean({ description: 'Click here onerror=alert(1)' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /description/i.test(f)));
  });

  it('SEC-04: rejects <iframe> in location', () => {
    const r = scanYaml(makeYaml([clean({ location: '<iframe src="x"></iframe>' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /location/i.test(f)));
  });

  it('SEC-05: rejects <object> in responsible', () => {
    const r = scanYaml(makeYaml([clean({ responsible: '<object data="x">' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /responsible/i.test(f)));
  });

  it('SEC-06: rejects data:text/html URI in description', () => {
    const r = scanYaml(makeYaml([clean({ description: 'data:text/html,<h1>x</h1>' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /description/i.test(f)));
  });

  it('does not scan owner fields for injection (they are not rendered in public HTML)', () => {
    // A YAML file where owner.name contains a script tag should NOT be flagged by the
    // security scan — those fields are never rendered in public output.
    // Inject an owner block containing a script tag in owner.name.
    // The helper does not generate an owner block, so we patch the raw YAML string.
    const yaml = makeYaml([clean()]).replace(
      'events:',
      [
        'owner:',
        "  name: '<script>alert(1)</script>'",
        '  email: owner@example.com',
        '',
        'events:',
      ].join('\n'),
    );
    // The scan only looks at title, location, responsible, description, link.
    // owner.name and owner.email are never rendered in public HTML, so they must not be flagged.
    const r = scanYaml(yaml);
    assert.strictEqual(r.ok, true);
  });
});

// ── SEC-07..09: Link protocol validation (02-§23.7) ──────────────────────────

describe('scanYaml – link protocol (02-§23.7)', () => {
  it('SEC-07: rejects a javascript: link', () => {
    const r = scanYaml(makeYaml([clean({ link: 'javascript:alert(1)' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /link/i.test(f)));
  });

  it('SEC-08: rejects a ftp:// link', () => {
    const r = scanYaml(makeYaml([clean({ link: 'ftp://example.com/file' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /link/i.test(f)));
  });

  it('SEC-09: rejects a relative link (no protocol)', () => {
    const r = scanYaml(makeYaml([clean({ link: '/some/path' })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /link/i.test(f)));
  });

  it('accepts an http:// link', () => {
    const r = scanYaml(makeYaml([clean({ link: 'http://example.com' })]));
    assert.strictEqual(r.ok, true);
  });

  it('accepts an https:// link', () => {
    const r = scanYaml(makeYaml([clean({ link: 'https://www.facebook.com/groups/x' })]));
    assert.strictEqual(r.ok, true);
  });

  it('accepts a null link', () => {
    const r = scanYaml(makeYaml([clean({ link: null })]));
    assert.strictEqual(r.ok, true);
  });
});

// ── SEC-10..13: Length limits (02-§23.8) ─────────────────────────────────────

describe('scanYaml – length limits (02-§23.8)', () => {
  it('SEC-10: rejects title exceeding 200 characters', () => {
    const r = scanYaml(makeYaml([clean({ title: 'A'.repeat(201) })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /title/i.test(f)));
  });

  it('SEC-11: rejects location exceeding 200 characters', () => {
    const r = scanYaml(makeYaml([clean({ location: 'B'.repeat(201) })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /location/i.test(f)));
  });

  it('SEC-12: rejects description exceeding 2000 characters', () => {
    const r = scanYaml(makeYaml([clean({ description: 'C'.repeat(2001) })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /description/i.test(f)));
  });

  it('SEC-13: rejects link exceeding 500 characters', () => {
    const r = scanYaml(makeYaml([clean({ link: 'https://example.com/' + 'x'.repeat(490) })]));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /link/i.test(f)));
  });

  it('accepts title exactly at the 200-character limit', () => {
    const r = scanYaml(makeYaml([clean({ title: 'A'.repeat(200) })]));
    assert.strictEqual(r.ok, true);
  });

  it('accepts description exactly at the 2000-character limit', () => {
    const r = scanYaml(makeYaml([clean({ description: 'A'.repeat(2000) })]));
    assert.strictEqual(r.ok, true);
  });
});

// ── Fragment files: single top-level event: mapping (02-§109.21) ──────────────

describe('scanYaml – fragment files (FRAG-80..82)', () => {
  function fragment(fields = {}) {
    const e = Object.assign({
      id: 'x-2026-07-02-1000', title: 'Lek', date: '2026-07-02', start: '10:00',
      end: '11:00', location: 'Salen', responsible: 'Alla',
    }, fields);
    const lines = ['event:'];
    for (const [k, v] of Object.entries(e)) {
      if (['date', 'start', 'end'].includes(k)) lines.push(`  ${k}: '${v}'`);
      else lines.push(`  ${k}: ${JSON.stringify(v)}`);
    }
    return lines.join('\n') + '\n';
  }

  it('FRAG-80: accepts a clean fragment', () => {
    assert.strictEqual(scanYaml(fragment()).ok, true);
  });

  it('FRAG-81: flags an injection pattern inside a fragment field', () => {
    const r = scanYaml(fragment({ title: '<script>alert(1)</script>' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /script/i.test(f)));
  });

  it('FRAG-82: flags a non-http link inside a fragment', () => {
    const r = scanYaml(fragment({ link: 'javascript:alert(1)' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.findings.some((f) => /link|javascript/i.test(f)));
  });
});
