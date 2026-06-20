'use strict';

// Guards that a commit touching only fragment files counts as a data-only change
// in ci.yml, so full CI (npm ci, build, lint, tests) is skipped and the
// post-merge deploy workflow does the build instead (02-§109.24, CL-§9.4).
//
// ci.yml classifies a change as code (`has_code=true`) when EITHER a changed
// path does not start with `source/data/`, OR a changed path is exactly
// `source/data/camps.yaml` / `source/data/local.yaml`. A fragment path such as
// `source/data/2026-06-syssleback/foo.yaml` starts with `source/data/` and is
// not camps/local, so neither condition fires → data-only. This test asserts the
// detect step still contains those two patterns, and replicates the rule to
// document the fragment outcome.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CI = yaml.load(
  fs.readFileSync(path.resolve(__dirname, '../.github/workflows/ci.yml'), 'utf8')
);

function detectStepRun() {
  const steps = CI.jobs.ci.steps || [];
  const detect = steps.find((s) => s.id === 'changes');
  assert.ok(detect, 'ci.yml must have a step with id "changes"');
  return detect.run;
}

// Mirror of the ci.yml shell classification, kept in sync with the asserted
// patterns below. Returns true when the change set is treated as code.
function hasCode(changedPaths) {
  const nonData = changedPaths.some((p) => !/^source\/data\//.test(p));
  const configData = changedPaths.some((p) => /^source\/data\/(camps|local)\.yaml$/.test(p));
  return nonData || configData;
}

describe('ci.yml data-only detection — fragments (FRAG-70..73)', () => {
  it('FRAG-70: detect step keys on ^source/data/ and the camps/local exception', () => {
    const run = detectStepRun();
    assert.ok(run.includes("'^source/data/'"), 'must test the source/data/ prefix');
    assert.ok(/\(camps\|local\)\\?\.yaml/.test(run), 'must except camps.yaml / local.yaml');
  });

  it('FRAG-71: a fragment-only change set is data-only (02-§109.24)', () => {
    assert.strictEqual(hasCode(['source/data/2026-06-syssleback/frukost-2026-06-22-0800.yaml']), false);
  });

  it('FRAG-72: a camps.yaml change is treated as code', () => {
    assert.strictEqual(hasCode(['source/data/camps.yaml']), true);
  });

  it('FRAG-73: a fragment mixed with a code file is treated as code', () => {
    assert.strictEqual(
      hasCode(['source/data/2026-06-syssleback/x.yaml', 'source/build/build.js']),
      true
    );
  });
});
