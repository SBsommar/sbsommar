'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderAddPage } = require('../source/build/render-add');

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099 juli',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-07',
  opens_for_editing: '2099-06-15',
};

const LOCATIONS = ['Servicehus', 'Strand', 'Skog', 'Annat'];
const API_URL = '/add-event';

function render(locs, camp) {
  return renderAddPage(camp || CAMP, locs || LOCATIONS, API_URL);
}

// ── 02-§2.5  Add-activity form exists ───────────────────────────────────────

describe('02-§2.5 — Add-activity page structure', () => {
  it('RADD-01: page has <!DOCTYPE html> and lang="sv"', () => {
    const html = render();
    assert.ok(html.includes('<!DOCTYPE html>'), 'has DOCTYPE');
    assert.ok(html.includes('<html lang="sv">'), 'has lang sv');
  });

  it('RADD-02: title includes "Lägg till aktivitet"', () => {
    const html = render();
    assert.ok(html.includes('<title>Lägg till aktivitet'), 'title present');
  });

  it('RADD-03: form element exists with id="event-form"', () => {
    const html = render();
    assert.ok(html.includes('id="event-form"'), 'form id present');
    assert.ok(html.includes('class="event-form"'), 'form class present');
  });

  it('RADD-04: heading says "Lägg till aktivitet"', () => {
    const html = render();
    assert.ok(html.includes('<h1>Lägg till aktivitet</h1>'), 'h1 heading');
  });
});

// ── 02-§6.2  Day grid constrained to camp date range ────────────────────────

describe('02-§6.2 — Day grid constrained to camp dates', () => {
  it('RADD-05: day grid has data-start from camp start_date', () => {
    const html = render();
    assert.ok(html.includes('data-start="2099-07-01"'), 'start date set');
  });

  it('RADD-06: day grid has data-end from camp end_date', () => {
    const html = render();
    assert.ok(html.includes('data-end="2099-07-07"'), 'end date set');
  });

  it('RADD-07: day grid contains day buttons', () => {
    const html = render();
    assert.ok(html.includes('class="day-btn"'), 'day-btn class');
    assert.ok(html.includes('class="day-grid"'), 'day-grid class');
  });
});

// ── 02-§6.3  Location field is a dropdown from local.yaml ───────────────────

describe('02-§6.3 — Location dropdown populated from data', () => {
  it('RADD-08: location field is a <select>', () => {
    const html = render();
    assert.ok(html.includes('<select id="f-location"'), 'select element present');
  });

  it('RADD-09: all locations appear as options', () => {
    const html = render();
    assert.ok(html.includes('>Servicehus<'), 'Servicehus option');
    assert.ok(html.includes('>Strand<'), 'Strand option');
    assert.ok(html.includes('>Skog<'), 'Skog option');
    assert.ok(html.includes('>Annat<'), 'Annat option');
  });

  it('RADD-10: placeholder "Välj plats..." is first option', () => {
    const html = render();
    const selectStart = html.indexOf('<select id="f-location"');
    const placeholderPos = html.indexOf('Välj plats...');
    const firstOptionPos = html.indexOf('<option value="Servicehus"');
    assert.ok(placeholderPos < firstOptionPos, 'placeholder before first real option');
    assert.ok(placeholderPos > selectStart, 'placeholder inside select');
  });
});

// ── 02-§6.4  Time fields use type="time" ────────────────────────────────────

describe('02-§6.4 — Time fields for HH:MM input', () => {
  it('RADD-11: start time has type="time"', () => {
    const html = render();
    assert.ok(html.includes('type="time" id="f-start"'), 'start time input');
  });

  it('RADD-12: end time has type="time"', () => {
    const html = render();
    assert.ok(html.includes('type="time" id="f-end"'), 'end time input');
  });
});

// ── 02-§8.2  "Annat" allows free-text location ─────────────────────────────

describe('02-§8.2 — "Annat" always present as last option', () => {
  it('RADD-13: "Annat" is last in the location list', () => {
    const html = render();
    const lastAnnatPos = html.lastIndexOf('>Annat<');
    const otherOptions = ['>Servicehus<', '>Strand<', '>Skog<'];
    for (const opt of otherOptions) {
      const pos = html.lastIndexOf(opt);
      assert.ok(pos < lastAnnatPos, `${opt} before Annat`);
    }
  });

  it('RADD-14: even if input already has Annat, it appears only once', () => {
    const html = render(['Servicehus', 'Annat', 'Strand']);
    const matches = html.match(/>Annat</g) || [];
    assert.strictEqual(matches.length, 1, 'Annat appears exactly once');
  });

  it('RADD-15: if no locations provided, defaults include Annat', () => {
    const html = renderAddPage(CAMP, null, API_URL);
    assert.ok(html.includes('>Annat<'), 'Annat in defaults');
    assert.ok(html.includes('>Servicehus<'), 'Servicehus in defaults');
  });
});

// ── 02-§8.3  Locations from predefined list ─────────────────────────────────

describe('02-§8.3 — Locations from predefined list', () => {
  it('RADD-16: location is a dropdown, not free text', () => {
    const html = render();
    // It should be a select, not an input type text
    assert.ok(html.includes('<select id="f-location"'), 'select for location');
    assert.ok(!html.includes('type="text" id="f-location"'), 'not a text input');
  });
});

// ── 02-§6.6  Submit button text ─────────────────────────────────────────────

describe('02-§6.6 — Submit button', () => {
  it('RADD-17: submit button has text "Skicka →"', () => {
    const html = render();
    assert.ok(html.includes('Skicka →'), 'submit button text');
  });

  it('RADD-18: submit button is type="submit"', () => {
    const html = render();
    assert.ok(html.includes('type="submit"'), 'submit type');
  });

  it('RADD-19: submit button has btn-primary class', () => {
    const html = render();
    assert.ok(html.includes('class="btn-primary"'), 'primary button class');
  });
});

// ── 02-§14.1  All text in Swedish ───────────────────────────────────────────

describe('02-§14.1 — Add-activity form uses Swedish labels', () => {
  it('RADD-20: field labels are in Swedish', () => {
    const html = render();
    assert.ok(html.includes('Rubrik'), 'Rubrik label');
    assert.ok(html.includes('Datum'), 'Datum label');
    assert.ok(html.includes('Starttid'), 'Starttid label');
    assert.ok(html.includes('Sluttid'), 'Sluttid label');
    assert.ok(html.includes('Plats'), 'Plats label');
    assert.ok(html.includes('Ansvarig'), 'Ansvarig label');
    assert.ok(html.includes('Beskrivning'), 'Beskrivning label');
    assert.ok(html.includes('Länk'), 'Länk label');
  });

  it('RADD-21: intro paragraphs are in Swedish', () => {
    const html = render();
    assert.ok(html.includes('schemat'), 'Swedish schedule reference');
    assert.ok(html.includes('aktivitet'), 'Swedish activity reference');
  });
});

// ── 02-§26.13  Time-gate data attributes ────────────────────────────────────

describe('02-§26.13 — Time-gate data attributes on form', () => {
  it('RADD-22: form has data-opens attribute', () => {
    const html = render();
    assert.ok(html.includes('data-opens="2099-06-15"'), 'opens date set');
  });

  it('RADD-23: add form has data-closes attribute set to end_date (02-§26.6)', () => {
    const html = render();
    // The add form locks once the last camp day passes, so data-closes is
    // end_date itself — not the end_date + 1 server grace day.
    assert.ok(html.includes('data-closes="2099-07-07"'), 'closes date set (end_date)');
  });

  it('RADD-24: form has data-api-url attribute', () => {
    const html = render();
    assert.ok(html.includes('data-api-url="/add-event"'), 'API URL set');
  });
});

// ── 02-§18.39  No owner name field ──────────────────────────────────────────

describe('02-§18.39 — No owner name field on add form', () => {
  it('RADD-25: no ownerName input exists', () => {
    const html = render();
    assert.ok(!html.includes('name="ownerName"'), 'no ownerName field');
    assert.ok(!html.includes('id="f-ownerName"'), 'no ownerName id');
  });
});

// ── Required field markers ──────────────────────────────────────────────────

describe('Add form — required field indicators', () => {
  it('RADD-26: required fields marked with * indicator', () => {
    const html = render();
    // Count required span elements
    const reqCount = (html.match(/class="req">\*</g) || []).length;
    assert.strictEqual(reqCount, 6, 'six required field markers (title, date, start, end, location, responsible)');
  });

  it('RADD-27: optional fields marked as "(valfritt)"', () => {
    const html = render();
    const optCount = (html.match(/class="opt">\(valfritt\)</g) || []).length;
    assert.strictEqual(optCount, 2, 'two optional field markers (description, link)');
  });
});

// ── Script loading ──────────────────────────────────────────────────────────

describe('Add form — client scripts', () => {
  it('RADD-28: loads cookie-consent.js', () => {
    const html = render();
    assert.ok(html.includes('src="cookie-consent.js"'), 'cookie consent script');
  });

  it('RADD-29: loads lagg-till.js', () => {
    const html = render();
    assert.ok(html.includes('src="lagg-till.js"'), 'form handler script');
  });

  it('RADD-30: loads nav.js with defer', () => {
    const html = render();
    assert.ok(html.includes('src="nav.js" defer'), 'nav.js deferred');
  });
});
