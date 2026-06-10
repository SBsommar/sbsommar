'use strict';

// Tests for the 2026-06 security-hardening sweep (issues #369, #370, #371,
// #383, #384, #385, #386, #387). Node-runnable unit tests plus structural
// checks for the PHP-side and workflow/htaccess changes that cannot run in
// Node. The PHP behaviour itself is exercised by PHPUnit (api/tests/).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = (...p) => path.resolve(__dirname, '..', ...p);
const read = (rel) => fs.readFileSync(root(rel), 'utf8');

// ── #383 Feedback metadata sanitisation ──────────────────────────────────────

const { buildFeedbackIssue, sanitizeMetaField } = require('../source/api/feedback');

describe('#383 — feedback metadata sanitisation', () => {
  it('SEC-383-01: escapes the table delimiter "|" in metadata', () => {
    assert.strictEqual(sanitizeMetaField('a|b', 100), 'a\\|b');
  });

  it('SEC-383-02: collapses CR/LF/control chars to a single space', () => {
    assert.strictEqual(sanitizeMetaField('a\r\n\tb c', 100), 'a b c');
  });

  it('SEC-383-03: caps the field length', () => {
    assert.strictEqual(sanitizeMetaField('x'.repeat(50), 10).length, 10);
  });

  it('SEC-383-04: a malicious userAgent cannot break the issue table', () => {
    const issue = buildFeedbackIssue({
      category: 'bug',
      title: 'Test',
      description: 'desc',
      userAgent: 'Evil | extra | row\n| Injected | row |',
      url: 'https://qa.sbsommar.se/',
      viewport: '100x100',
      timestamp: '2026-06-10T00:00:00Z',
      name: 'A | B',
    });
    // No raw pipe survives outside the intended cell boundaries: every pipe in
    // the metadata values is escaped, and there are no stray newlines in cells.
    const tableLines = issue.body.split('\n').filter((l) => l.startsWith('|'));
    for (const line of tableLines) {
      // Each metadata row has exactly the two-column shape "| k | v |".
      const unescaped = line.replace(/\\\|/g, '');
      assert.strictEqual((unescaped.match(/\|/g) || []).length, 3, `row has injected columns: ${line}`);
    }
  });

  it('SEC-383-05: PHP Feedback mirrors the sanitiser', () => {
    const php = read('api/src/Feedback.php');
    assert.match(php, /sanitizeMetaField/);
    assert.match(php, /META_MAX_LENGTHS/);
  });
});

// ── #385 Link protocol validation in the render layer ────────────────────────

const { safeLinkHref } = require('../source/build/utils');

describe('#385 — link protocol validation', () => {
  it('SEC-385-01: passes http(s) URLs through', () => {
    assert.strictEqual(safeLinkHref('https://example.com'), 'https://example.com');
    assert.strictEqual(safeLinkHref('HTTP://example.com'), 'HTTP://example.com');
  });

  it('SEC-385-02: drops javascript:/data:/other schemes', () => {
    assert.strictEqual(safeLinkHref('javascript:alert(1)'), '');
    assert.strictEqual(safeLinkHref('data:text/html,<script>'), '');
    assert.strictEqual(safeLinkHref('mailto:x@y.z'), '');
    assert.strictEqual(safeLinkHref(''), '');
    assert.strictEqual(safeLinkHref(null), '');
  });

  it('SEC-385-03: renderers and client route the link through the guard', () => {
    assert.match(read('source/build/render.js'), /safeLinkHref\(e\.link\)/);
    assert.match(read('source/build/render-arkiv.js'), /safeLinkHref\(ev\.link\)/);
    assert.match(read('source/build/render-event.js'), /safeLinkHref\(event\.link\)/);
    const client = read('source/assets/js/client/events-today.js');
    assert.match(client, /safeHttp\(e\.link\)/);
    assert.doesNotMatch(client, /href="' \+ esc\(e\.link\)/);
  });

  it('SEC-385-04: schedule row drops a javascript: link, keeps http links', () => {
    const { eventExtraHtml } = require('../source/build/render');
    const bad = eventExtraHtml({ description: 'x', link: 'javascript:alert(1)' });
    assert.doesNotMatch(bad, /href="javascript:/i);
    assert.doesNotMatch(bad, /event-ext-link/);
    const good = eventExtraHtml({ description: '', link: 'https://ok.example/' });
    assert.match(good, /href="https:\/\/ok\.example\//);
  });

  it('SEC-385-05: per-event page drops a javascript: link', () => {
    const { renderEventPage } = require('../source/build/render-event');
    const camp = { id: 'c', name: 'C', location: 'L', start_date: '2099-06-01', end_date: '2099-06-08' };
    const ev = {
      id: 'x-2099-06-02-1000', title: 'X', date: '2099-06-02', start: '10:00', end: '11:00',
      location: 'L', responsible: 'R', description: null, link: 'javascript:alert(1)',
      owner: { name: '', email: '' }, meta: { created_at: '2099-06-01T10:00:00', updated_at: null },
    };
    const html = renderEventPage(ev, camp, 'https://s.example');
    assert.doesNotMatch(html, /href="javascript:/i);
  });
});

// ── #386 Constant-time admin-token comparison ────────────────────────────────

const { verifyAdminToken } = require('../source/api/admin');

describe('#386 — admin token comparison has no length pre-check', () => {
  const future = Math.floor(Date.now() / 1000) + 86400;

  it('SEC-386-01: accepts a matching token regardless of other tokens length', () => {
    const tok = `admin_${'a'.repeat(20)}_${future}`;
    assert.strictEqual(verifyAdminToken(tok, ['short', tok, 'another_longer_token_value']), true);
  });

  it('SEC-386-02: rejects a non-matching token of equal length', () => {
    const a = `aaaaa_${future}`;
    const b = `bbbbb_${future}`;
    assert.strictEqual(verifyAdminToken(a, [b]), false);
  });

  it('SEC-386-03: source has no length equality short-circuit', () => {
    const src = read('source/api/admin.js');
    assert.doesNotMatch(src, /candidate\.length === valid\.length/);
    assert.match(src, /timingSafeEqual/);
    assert.match(read('api/src/Admin.php'), /hash_equals\(self::tokenDigest/);
  });
});

// ── #371 PHP rate-limit: trusted proxy + file locking ────────────────────────

describe('#371 — PHP rate-limit hardening (structural)', () => {
  it('SEC-371-01: clientIp only trusts X-Forwarded-For from TRUSTED_PROXIES', () => {
    const src = read('api/index.php');
    assert.match(src, /TRUSTED_PROXIES/);
    assert.match(src, /FILTER_VALIDATE_IP/);
    assert.match(src, /REMOTE_ADDR/);
  });

  it('SEC-371-02: RateLimit uses an exclusive lock for read-modify-write', () => {
    const src = read('api/src/RateLimit.php');
    assert.match(src, /flock\([^,]+,\s*LOCK_EX\)/);
    assert.match(src, /ftruncate/);
  });
});

// ── #370 PHP time-gating fails closed when camp metadata is unavailable ──────

describe('#370 — PHP time-gating fails closed (structural)', () => {
  const src = read('api/index.php');

  it('SEC-370-01: camps.yaml is resolved from the bundled API path first', () => {
    assert.match(src, /__DIR__ \. '\/data\/camps\.yaml'/);
  });

  it('SEC-370-02: mutation handlers fail closed on null active camp', () => {
    const guards = src.match(/if \(\$activeCamp === null\) \{/g) || [];
    // add-event, add-events, edit-event, delete-event
    assert.ok(guards.length >= 4, `expected >= 4 fail-closed guards, found ${guards.length}`);
  });

  it('SEC-370-03: deploy workflow bundles camp metadata with the API', () => {
    const wf = read('.github/workflows/deploy-reusable.yml');
    assert.match(wf, /api\/data\/camps\.yaml/);
  });
});

// ── #369 Event-data PR workflow runs real validation ─────────────────────────

const yaml = require('js-yaml');

describe('#369 — event-data PR workflow validates', () => {
  const wf = yaml.load(read('.github/workflows/event-data-deploy.yml'));
  const steps = wf.jobs.check.steps;
  const runText = steps.filter((s) => s.run).map((s) => s.run).join('\n');

  it('SEC-369-01: runs the schema validator and security scanner', () => {
    assert.match(runText, /lint-yaml\.js/);
    assert.match(runText, /check-yaml-security\.js/);
  });

  it('SEC-369-02: checks out with enough history to diff against base (CL-§9.5)', () => {
    const checkout = steps.find((s) => s.uses && s.uses.startsWith('actions/checkout'));
    assert.ok(checkout, 'checkout step missing');
    assert.strictEqual(checkout.with['fetch-depth'], 0);
  });

  it('SEC-369-03: is not gated to only event/ and event-edit/ branches', () => {
    // The job must run for any data PR (incl. event-delete/ and manual PRs),
    // not only the two prefixes the placeholder allowed.
    assert.strictEqual(wf.jobs.check.if, undefined);
  });

  it('SEC-369-04: security scan is a hard block; schema is advisory for archived camps', () => {
    // Security scanner failure must set the failure status (hard block).
    assert.match(runText, /check-yaml-security\.js "\$f" \|\| status=1/);
    // Schema validator is advisory (warning, not status=1) for archived camps,
    // and the workflow derives the non-archived set from camps.yaml.
    assert.match(runText, /filter\(c=>!c\.archived\)/);
    assert.match(runText, /::warning::schema issues in archived/);
    // The loop reads a quoted here-string from the env var, not a pipe.
    assert.match(runText, /done <<< "\$CHANGED_FILES"/);
  });

  it('SEC-369-05: no untrusted ${{ }} is interpolated into a run script (injection-safe)', () => {
    // GitHub Actions script-injection hardening: untrusted values (changed
    // filenames, base SHA) must arrive via env vars, never as literal text in
    // a run: block — otherwise a filename like `x$(...).yaml` executes on the
    // runner. No run script may contain a ${{ ... }} expression at all.
    for (const s of steps) {
      if (typeof s.run === 'string') {
        assert.ok(!s.run.includes('${{'), `run script interpolates an expression: ${s.name}`);
      }
    }
    // The changed filenames reach the validator as an env var consumed as data.
    const validate = steps.find((s) => typeof s.run === 'string' && s.run.includes('CHANGED_FILES'));
    assert.ok(validate, 'validate step must exist');
    assert.strictEqual(validate.env.CHANGED_FILES, '${{ steps.changed.outputs.files }}');
    const changed = steps.find((s) => s.id === 'changed');
    assert.strictEqual(changed.env.BASE_SHA, '${{ github.event.pull_request.base.sha }}');
  });
});

// ── #384 Security headers ────────────────────────────────────────────────────

describe('#384 — site security headers', () => {
  const ht = read('source/static/.htaccess');

  it('SEC-384-01: sets a Content-Security-Policy', () => {
    assert.match(ht, /Content-Security-Policy/);
    assert.match(ht, /object-src 'none'/);
    assert.match(ht, /frame-ancestors 'none'/);
  });

  it('SEC-384-02: sets nosniff, frame, referrer, permissions and HSTS', () => {
    assert.match(ht, /X-Content-Type-Options "nosniff"/);
    assert.match(ht, /X-Frame-Options "DENY"/);
    assert.match(ht, /Referrer-Policy/);
    assert.match(ht, /Permissions-Policy/);
    assert.match(ht, /Strict-Transport-Security/);
  });

  it('SEC-384-03: build injects the API origin into connect-src (cross-origin), no placeholder left', () => {
    const { injectHtaccessCsp } = require('../source/build/utils');
    // Template carries the placeholder so the build can inject the origin.
    assert.match(ht, /connect-src 'self' __API_ORIGIN__/);

    // Cross-origin production API → origin appears in connect-src.
    const prod = injectHtaccessCsp(ht, 'https://api.sommar.example.com/add-event');
    assert.match(prod, /connect-src 'self' https:\/\/api\.sommar\.example\.com https:\/\/\*\.goatcounter\.com/);
    assert.doesNotMatch(prod, /__API_ORIGIN__/);

    // Same-origin/local (unset) → 'self' suffices, placeholder removed cleanly.
    const local = injectHtaccessCsp(ht, '');
    assert.match(local, /connect-src 'self' https:\/\/\*\.goatcounter\.com/);
    assert.doesNotMatch(local, /__API_ORIGIN__/);
  });
});

// ── #387 SESSION_SECRET documentation ────────────────────────────────────────

describe('#387 — SESSION_SECRET documented', () => {
  it('SEC-387-01: .env.example documents SESSION_SECRET and TRUSTED_PROXIES', () => {
    const env = read('.env.example');
    assert.match(env, /SESSION_SECRET/);
    assert.match(env, /TRUSTED_PROXIES/);
  });

  it('SEC-387-02: runtimes warn on a weak SESSION_SECRET', () => {
    assert.match(read('app.js'), /SESSION_SECRET is shorter than 32/);
    assert.match(read('api/index.php'), /SESSION_SECRET is shorter than 32/);
  });
});
