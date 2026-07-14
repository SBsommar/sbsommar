'use strict';

// Verifies the seasonal QA camp model in source/data/camps.yaml (02-§42.31–42.34).
//
// The site keeps two QA-only camps (qa: true): a "spring" camp that closes when
// the next real camp opens for editing, and an "autumn" camp covering Oct 1
// – Dec 31 of the current year. Together they leave every real camp's active
// window QA-free while ensuring continuous QA coverage outside those windows.
// The isolation rule is evaluated per real camp, so camps.yaml may stage more
// than one future season at a time and QA camps may sit in the gaps between them.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const CAMPS_PATH = path.join(__dirname, '..', 'source', 'data', 'camps.yaml');
const camps = yaml.load(fs.readFileSync(CAMPS_PATH, 'utf8')).camps;

const qaCamps = camps.filter((c) => c.qa === true);
const realCamps = camps.filter((c) => !c.qa && c.archived !== true);

describe('camps.yaml – seasonal QA camp model (02-§42.31–42.34)', () => {
  it('QSEAS-01 (02-§42.31): exactly two QA-only camps exist', () => {
    assert.equal(
      qaCamps.length, 2,
      `Expected 2 qa: true camps, found ${qaCamps.length}: ${qaCamps.map((c) => c.id).join(', ')}`,
    );
  });

  it('QSEAS-02 (02-§42.34): an autumn QA camp runs Oct 1 – Dec 31 of its year', () => {
    const autumn = qaCamps.find((c) => /-10-01$/.test(c.start_date));
    assert.ok(autumn, 'No QA camp starts on Oct 1');
    assert.match(autumn.end_date, /-12-31$/, 'Autumn QA camp must end on Dec 31');
    assert.equal(
      autumn.start_date.slice(0, 4),
      autumn.end_date.slice(0, 4),
      'Autumn QA camp start and end years must match',
    );
  });

  it('QSEAS-03 (02-§42.31): a spring QA camp exists (the non-autumn QA camp)', () => {
    const spring = qaCamps.find((c) => !/-10-01$/.test(c.start_date));
    assert.ok(spring, 'No spring QA camp found');
  });

  it('QSEAS-04 (02-§42.32): spring QA camp end_date equals the next real camp opens_for_editing', () => {
    const spring = qaCamps.find((c) => !/-10-01$/.test(c.start_date));
    assert.ok(spring, 'No spring QA camp found');

    const upcomingReal = realCamps
      .filter((c) => c.start_date > spring.end_date)
      .sort((a, b) => a.start_date.localeCompare(b.start_date))[0];

    assert.ok(upcomingReal, 'No upcoming real camp after spring QA camp end_date');

    assert.equal(
      spring.end_date, upcomingReal.opens_for_editing,
      `Spring QA camp end_date (${spring.end_date}) must equal the next real camp's opens_for_editing (${upcomingReal.id}: ${upcomingReal.opens_for_editing})`,
    );
  });

  it("QSEAS-05 (02-§42.33): no QA camp overlaps any real camp's active window", () => {
    // Evaluated per real camp rather than against a single min..max span, so
    // camps.yaml may stage more than one future season while QA camps stay in
    // the gaps between them.
    for (const qc of qaCamps) {
      for (const rc of realCamps) {
        const overlaps = qc.start_date <= rc.end_date && qc.end_date >= rc.start_date;
        assert.ok(
          !overlaps,
          `QA camp "${qc.id}" (${qc.start_date}..${qc.end_date}) overlaps real camp "${rc.id}" active window (${rc.start_date}..${rc.end_date})`,
        );
      }
    }
  });
});
