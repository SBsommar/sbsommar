'use strict';

// Tests for 02-§117 — Schedule Colour Scheme.
// The schedule's attention accents are green (`--color-sage-dark`, or a
// `--color-sage` tint for fills); terracotta is reserved for cancelled
// activities (02-§118). These are CSS-presence checks; the actual on-screen
// appearance and the contrast ratio are manual/computed checkpoints.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const CSS = fs.readFileSync(path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'), 'utf8');

// Returns the body of the first CSS rule whose selector matches `selectorRe`.
function ruleBody(selectorRe) {
  const re = new RegExp(selectorRe.source + '\\s*\\{([^}]*)\\}');
  const m = CSS.match(re);
  return m ? m[1] : null;
}

describe('02-§117 — Schedule colour scheme', () => {
  it('SCOL-01: --color-sage-dark token defined at :root', () => {
    const root = CSS.match(/:root\s*\{([^}]+)\}/);
    assert.ok(root, ':root block exists');
    assert.match(root[1], /--color-sage-dark:\s*#4F6B1F/i, '--color-sage-dark: #4F6B1F in :root');
  });

  it('SCOL-02: .ev-time uses the green token, not terracotta', () => {
    const body = ruleBody(/\.ev-time/);
    assert.ok(body, '.ev-time rule exists');
    assert.match(body, /color:\s*var\(--color-sage-dark\)/, '.ev-time color is sage-dark');
    assert.ok(!/--color-terracotta/.test(body), '.ev-time is not terracotta');
  });

  it('SCOL-03: expanded activity title accent is green', () => {
    const body = ruleBody(/details\.event-row\[open\] > summary \.ev-title/);
    assert.ok(body, 'opened-title rule exists');
    assert.match(body, /var\(--color-sage-dark\)/, 'opened title uses sage-dark');
    assert.ok(!/--color-terracotta/.test(body), 'opened title is not terracotta');
  });

  it('SCOL-04: .is-now highlight uses sage, no terracotta', () => {
    const title = ruleBody(/body:not\(\.display-mode\) \.event-row\.is-now \.ev-title/);
    assert.ok(title, 'is-now title rule exists');
    assert.match(title, /var\(--color-sage-dark\)/, 'is-now title uses sage-dark');
    // The is-now background/accent block must carry a sage accent bar.
    assert.match(CSS, /box-shadow:\s*inset 4px 0 0 var\(--color-sage-dark\)/, 'is-now sage accent bar');
  });

  it('SCOL-05: back link and external link are green', () => {
    const back = ruleBody(/\.back-link a/);
    assert.ok(back, '.back-link a rule exists');
    assert.match(back, /var\(--color-sage-dark\)/, 'back link uses sage-dark');
    const ext = ruleBody(/\.event-ext-link/);
    assert.ok(ext, '.event-ext-link rule exists');
    assert.match(ext, /var\(--color-sage-dark\)/, 'external link uses sage-dark');
  });

  it('SCOL-06: display view in-progress highlight uses sage', () => {
    const disNow = ruleBody(/body\.display-mode \.event-row\.is-now/);
    assert.ok(disNow, 'display is-now rule exists');
    assert.match(disNow, /--color-sage/, 'display is-now uses sage');
    assert.ok(!/--color-terracotta/.test(disNow), 'display is-now is not terracotta');
  });

  it('SCOL-07: within the schedule, terracotta appears only for cancelled rows', () => {
    // Every terracotta reference inside an `.event-row…` selector must be a
    // cancelled-activity rule. (Chrome shared with the rest of the site —
    // buttons, nav, focus outlines — is outside .event-row and unaffected.)
    const lines = CSS.split('\n');
    const offenders = [];
    for (let i = 0; i < lines.length; i++) {
      if (!/--color-terracotta|199, 109, 72/.test(lines[i])) continue;
      // Walk back to the nearest selector line.
      let j = i;
      while (j >= 0 && !lines[j].includes('{')) j--;
      const selector = j >= 0 ? lines[j] : '';
      if (/\.event-row|\.ev-time|\.ev-title|\.back-link|\.event-ext-link/.test(selector)) {
        if (!/is-cancelled/.test(selector)) offenders.push(selector.trim());
      }
    }
    assert.deepEqual(offenders, [], `schedule terracotta only on cancelled rows; offenders: ${offenders.join(' | ')}`);
  });
});
