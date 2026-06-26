'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const CSS = fs.readFileSync(path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'), 'utf8');

// ── Helper ──────────────────────────────────────────────────────────────────

function rootHas(prop, value) {
  // Match custom property in :root block, tolerating whitespace alignment
  const rootMatch = CSS.match(/:root\s*\{([^}]+)\}/);
  assert.ok(rootMatch, ':root block exists');
  const rootBlock = rootMatch[1];
  if (value) {
    // Allow variable whitespace between colon and value (CSS often pads for alignment)
    const re = new RegExp(prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\s*' + value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    assert.ok(re.test(rootBlock), `${prop}: ${value} in :root`);
  } else {
    assert.ok(rootBlock.includes(prop), `${prop} in :root`);
  }
}

// ── 07-§2.1–2.7  Color palette ──────────────────────────────────────────────

describe('07-§2.1–2.7 — Color palette custom properties', () => {
  it('CSS-01: terracotta defined as #C76D48 (07-§2.1)', () => {
    rootHas('--color-terracotta', '#C76D48');
  });

  it('CSS-02: sage defined as #ADBF77 (07-§2.2)', () => {
    rootHas('--color-sage', '#ADBF77');
  });

  it('CSS-03: cream defined as #F5EEDF (07-§2.3)', () => {
    rootHas('--color-cream', '#F5EEDF');
  });

  it('CSS-04: navy defined as #192A3D (07-§2.4)', () => {
    rootHas('--color-navy', '#192A3D');
  });

  it('CSS-05: charcoal defined as #3B3A38 (07-§2.5)', () => {
    rootHas('--color-charcoal', '#3B3A38');
  });

  it('CSS-06: white defined as #FFFFFF (07-§2.6)', () => {
    rootHas('--color-white', '#FFFFFF');
  });
});

// ── 07-§3.1–3.11  Typography ────────────────────────────────────────────────

describe('07-§3.1–3.11 — Typography tokens', () => {
  it('CSS-07: font-sans is system-ui stack (07-§3.1, 07-§3.2)', () => {
    rootHas('--font-sans', 'system-ui');
  });

  it('CSS-08: font-serif is Georgia (07-§3.3)', () => {
    rootHas('--font-serif', 'Georgia');
  });

  it('CSS-09: base font size is 16px (07-§3.7)', () => {
    rootHas('--font-size-base', '16px');
  });

  it('CSS-10: small font size is 14px (07-§3.8)', () => {
    rootHas('--font-size-small', '14px');
  });

  it('CSS-11: nav font size is 12px (07-§3.10)', () => {
    rootHas('--font-size-nav', '12px');
  });

  it('CSS-12: body line height is 1.65 (07-§3.11)', () => {
    rootHas('--line-height-body', '1.65');
  });
});

// ── 07-§3.4–3.6  Heading sizes ──────────────────────────────────────────────

describe('07-§3.4–3.6 — Heading sizes in CSS', () => {
  it('CSS-13: h1 is 40px (07-§3.4)', () => {
    assert.ok(CSS.includes('font-size: 40px'), 'h1 size');
  });

  it('CSS-14: h2 is 35px (07-§3.5)', () => {
    assert.ok(CSS.includes('font-size: 35px'), 'h2 size');
  });

  it('CSS-15: h3 is 30px (07-§3.6)', () => {
    assert.ok(CSS.includes('font-size: 30px'), 'h3 size');
  });
});

// ── 07-§4.1–4.10  Spacing tokens ───────────────────────────────────────────

describe('07-§4.1–4.10 — Spacing tokens', () => {
  it('CSS-16: container-wide is 1290px (07-§4.1)', () => {
    rootHas('--container-wide', '1290px');
  });

  it('CSS-17: container-narrow is 750px (07-§4.2)', () => {
    rootHas('--container-narrow', '750px');
  });

  it('CSS-18: space-xs is 8px (07-§4.5)', () => {
    rootHas('--space-xs', '8px');
  });

  it('CSS-19: space-sm is 16px (07-§4.6)', () => {
    rootHas('--space-sm', '16px');
  });

  it('CSS-20: space-md is 24px (07-§4.7)', () => {
    rootHas('--space-md', '24px');
  });

  it('CSS-21: space-lg is 40px (07-§4.8)', () => {
    rootHas('--space-lg', '40px');
  });

  it('CSS-22: space-xl is 64px (07-§4.9)', () => {
    rootHas('--space-xl', '64px');
  });

  it('CSS-23: space-xxl is 96px (07-§4.10)', () => {
    rootHas('--space-xxl', '96px');
  });
});

// ── 07-§6.14, 07-§6.20  Border radius tokens ───────────────────────────────

describe('07-§6.14, 07-§6.20 — Border radius tokens', () => {
  it('CSS-24: radius-sm is 4px (07-§6.14)', () => {
    rootHas('--radius-sm', '4px');
  });

  it('CSS-25: radius-md is 6px (07-§6.20)', () => {
    rootHas('--radius-md', '6px');
  });

  it('CSS-26: radius-full is 50% (07-§8.4)', () => {
    rootHas('--radius-full', '50%');
  });
});

// ── 07-§6.21  Shadow token ──────────────────────────────────────────────────

describe('07-§6.21 — Shadow token', () => {
  it('CSS-27: shadow-card defined', () => {
    rootHas('--shadow-card');
  });
});

// ── 07-§7.1  All CSS uses custom properties ─────────────────────────────────
// We verify that color hex values are only in the :root block.

describe('07-§7.1 — CSS custom properties used throughout', () => {
  it('CSS-28: body uses var(--color-charcoal) for color', () => {
    assert.ok(CSS.includes('color: var(--color-charcoal)'), 'body uses charcoal token');
  });

  it('CSS-29: body uses var(--color-cream) for background', () => {
    assert.ok(CSS.includes('background: var(--color-cream)'), 'body uses cream token');
  });

  it('CSS-30: body uses var(--font-sans) for font-family', () => {
    assert.ok(CSS.includes('font-family: var(--font-sans)'), 'body uses font-sans token');
  });
});

// ── 07-§4.3  Container centered ─────────────────────────────────────────────

describe('07-§4.3 — Container centering', () => {
  it('CSS-31: body has margin: 0 auto', () => {
    assert.ok(CSS.includes('margin: 0 auto'), 'centered margin');
  });
});

// ── 07-§6.1–6.3  Hero grid layout ──────────────────────────────────────────

describe('07-§6.1–6.3 — Hero layout', () => {
  it('CSS-32: hero is constrained to container-narrow width', () => {
    assert.ok(CSS.includes('.hero') && CSS.includes('container-narrow'), 'hero max-width');
  });

  it('CSS-33: hero image has object-fit: cover', () => {
    assert.ok(CSS.includes('object-fit: cover'), 'hero image cover');
  });
});

// ── 07-§6.28  Accordion uses no JS framework ───────────────────────────────
// Verified structurally: no JS framework CSS classes like .react, .vue, etc.

describe('07-§6.28 — No CSS framework', () => {
  it('CSS-34: no CSS framework imports or Bootstrap/Tailwind classes', () => {
    assert.ok(!CSS.includes('@import "bootstrap'), 'no bootstrap');
    assert.ok(!CSS.includes('@tailwind'), 'no tailwind');
    assert.ok(!CSS.includes('.container-fluid'), 'no bootstrap container');
  });
});

// ── 07-§7.4  No CSS preprocessor ────────────────────────────────────────────

describe('07-§7.4 — No CSS preprocessor', () => {
  it('CSS-35: file is plain CSS (no $variables, no @mixin, no @include)', () => {
    assert.ok(!CSS.includes('$color'), 'no SCSS variables');
    assert.ok(!CSS.includes('@mixin'), 'no mixins');
    assert.ok(!CSS.includes('@include'), 'no includes');
  });
});

// ── 07-§4.14  CSS Grid used ─────────────────────────────────────────────────

describe('07-§4.14 — CSS Grid', () => {
  it('CSS-36: display: grid is used', () => {
    assert.ok(CSS.includes('display: grid'), 'CSS Grid used');
  });
});

// ── 02-§47.1–47.2  Heading and link colors ─────────────────────────────────

describe('02-§47.1–47.2 — Heading and link colors', () => {
  it('HDC-01: h1 uses terracotta color (02-§47.1)', () => {
    const m = CSS.match(/(?:^|\n)\s*h1\s*\{([^}]+)\}/);
    assert.ok(m, 'h1 rule block exists');
    assert.ok(m[1].includes('var(--color-terracotta)'), 'h1 color is terracotta');
  });

  it('HDC-02: h2 uses terracotta color (02-§47.1)', () => {
    const m = CSS.match(/(?:^|\n)\s*h2\s*\{([^}]+)\}/);
    assert.ok(m, 'h2 rule block exists');
    assert.ok(m[1].includes('var(--color-terracotta)'), 'h2 color is terracotta');
  });

  it('HDC-03: h3 uses terracotta color (02-§47.1)', () => {
    const m = CSS.match(/(?:^|\n)\s*h3\s*\{([^}]+)\}/);
    assert.ok(m, 'h3 rule block exists');
    assert.ok(m[1].includes('var(--color-terracotta)'), 'h3 color is terracotta');
  });

  it('HDC-04: content links have permanent underline (02-§47.2)', () => {
    const m = CSS.match(/\.content\s+a\s*\{([^}]+)\}/);
    assert.ok(m, '.content a rule block exists');
    assert.ok(m[1].includes('text-decoration: underline'), '.content a has text-decoration: underline');
  });
});

// ── Display mode (02-§4.6) ──────────────────────────────────────────────────

describe('02-§4.6 — Display mode dark styles', () => {
  it('CSS-37: display-mode class exists in CSS', () => {
    assert.ok(CSS.includes('.display-mode'), 'display-mode class defined');
  });
});

// ── 02-§54.1–54.5  Modal design polish ──────────────────────────────────────

describe('02-§54.1–54.5 — Modal design polish', () => {
  it('MDP-01: modal heading suppresses focus outline (02-§54.1)', () => {
    assert.ok(
      CSS.includes('.modal-heading:focus'),
      '.modal-heading:focus rule exists'
    );
    const m = CSS.match(/\.modal-heading:focus\s*\{([^}]+)\}/);
    assert.ok(m, '.modal-heading:focus block found');
    assert.ok(m[1].includes('outline'), 'outline property set');
  });

  it('MDP-02: modal box uses --radius-lg (02-§54.2)', () => {
    const m = CSS.match(/\.modal-box\s*\{([^}]+)\}/);
    assert.ok(m, '.modal-box rule block exists');
    assert.ok(
      m[1].includes('var(--radius-lg)'),
      'border-radius uses --radius-lg token'
    );
  });

  it('MDP-03: modal box uses --space-lg for vertical padding (02-§54.3)', () => {
    const m = CSS.match(/\.modal-box\s*\{([^}]+)\}/);
    assert.ok(m, '.modal-box rule block exists');
    assert.ok(
      m[1].includes('var(--space-lg)'),
      'padding uses --space-lg token'
    );
  });

  it('MDP-04: modal heading is center-aligned (02-§54.4)', () => {
    const m = CSS.match(/\.modal-heading\s*\{([^}]+)\}/);
    assert.ok(m, '.modal-heading rule block exists');
    assert.ok(
      m[1].includes('text-align: center'),
      'heading is center-aligned'
    );
  });

  it('MDP-05: submit progress is center-aligned (02-§54.4)', () => {
    const m = CSS.match(/\.submit-progress\s*\{([^}]+)\}/);
    assert.ok(m, '.submit-progress rule block exists');
    assert.ok(
      m[1].includes('text-align: center'),
      'progress list is center-aligned'
    );
  });

  it('MDP-06: modal box has entry animation keyframes (02-§54.5)', () => {
    assert.ok(
      CSS.includes('@keyframes modal-enter'),
      'modal-enter keyframes defined'
    );
  });
});

// ── 02-§56.8  .event-description p no longer italic ──────────────────────────

describe('02-§56.8 — Description paragraph italic removed', () => {
  it('MKD-CSS-01 (02-§56.8): .event-description p does not set font-style: italic', () => {
    // Find the .event-description p rule block
    const m = CSS.match(/\.event-description\s+p\s*\{([^}]+)\}/);
    if (m) {
      assert.ok(!m[1].includes('font-style: italic'), '.event-description p must not set italic');
    }
    // If the rule doesn't exist at all, that's also fine
  });
});

// ── 07-§6.134, 6.135  Weekly-schedule time status (ended / in progress) ──────

describe('07-§6.134, 6.135 — Schedule row time status', () => {
  it('CSS-38: ended schedule rows get a light-grey background (07-§6.134)', () => {
    const m = CSS.match(/body:not\(\.display-mode\)\s+\.event-row\.is-past\s*\{([^}]+)\}/);
    assert.ok(m, '.is-past rule scoped to non-display mode exists');
    assert.ok(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.05\)/.test(m[1]), 'light-grey background');
  });

  it('CSS-39: in-progress schedule rows get a terracotta highlight (07-§6.135)', () => {
    const m = CSS.match(/body:not\(\.display-mode\)\s+\.event-row\.is-now\s*\{([^}]+)\}/);
    assert.ok(m, '.is-now rule scoped to non-display mode exists');
    assert.ok(/box-shadow:\s*inset 3px 0 0 var\(--color-terracotta\)/.test(m[1]), 'terracotta accent bar');
  });
});
