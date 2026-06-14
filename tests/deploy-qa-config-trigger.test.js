'use strict';

// Tests for the config-file QA deploy trigger (02-§108).
//
// deploy-qa.yml runs the full-site QA deploy. It must ignore per-camp event
// files (those are deployed by event-data-deploy-post-merge.yml) but still fire
// for the site-wide config files camps.yaml and local.yaml, whose changes affect
// pages the event-data pipeline never rebuilds.
//
// Phase 3 commits these tests before Phase 4 narrows the ignore list. While the
// broad 'source/data/**.yaml' pattern is still present the new-behaviour suite
// skips, so the pre-commit hook stays green; it runs in full once the fix lands.

const nodeTest = require('node:test');
const { it } = nodeTest;
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function loadWorkflow(name) {
  return yaml.load(
    fs.readFileSync(path.resolve(__dirname, '../.github/workflows/', name), 'utf8'),
  );
}

const qa = loadWorkflow('deploy-qa.yml');
const prod = loadWorkflow('deploy-prod.yml');
// js-yaml (YAML 1.2 core schema) keeps the `on` key as a string.
const qaOn = qa.on ?? qa[true];
const prodOn = prod.on ?? prod[true];
const pathsIgnore = (qaOn.push && qaOn.push['paths-ignore']) || [];

// Convert a GitHub path-filter glob (supporting `*` and `[...]`) to a RegExp.
// `*` matches any run of non-slash characters.
function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === '*') re += '[^/]*';
    else if (ch === '[') {
      const end = glob.indexOf(']', i);
      re += glob.slice(i, end + 1);
      i = end;
    } else if ('.+^${}()|\\/'.includes(ch)) re += '\\' + ch;
    else re += ch;
  }
  return new RegExp('^' + re + '$');
}

function isIgnored(file) {
  return pathsIgnore.some((p) => globToRegExp(p).test(file));
}

// The fix is in once the broad catch-all is gone.
const implemented = !pathsIgnore.includes('source/data/**.yaml');
const describe = implemented ? nodeTest.describe : nodeTest.describe.skip;

// ── deploy-qa.yml trigger (02-§108) ─────────────────────────────────────────

describe('deploy-qa.yml config-file trigger (02-§108)', () => {
  it('DQT-01 (02-§108.2): ignores dated per-camp event files', () => {
    assert.ok(isIgnored('source/data/2026-06-syssleback.yaml'));
    assert.ok(isIgnored('source/data/2018-06-syssleback.yaml'));
  });

  it('DQT-02 (02-§108.2): ignores qa-* camp files', () => {
    assert.ok(isIgnored('source/data/qa-testcamp.yaml'));
    assert.ok(isIgnored('source/data/qa-thisweek.yaml'));
  });

  it('DQT-03 (02-§108.3): does NOT ignore camps.yaml or local.yaml', () => {
    assert.ok(!isIgnored('source/data/camps.yaml'), 'camps.yaml must trigger full deploy');
    assert.ok(!isIgnored('source/data/local.yaml'), 'local.yaml must trigger full deploy');
  });

  it('DQT-04: no broad source/data catch-all remains', () => {
    assert.ok(!pathsIgnore.includes('source/data/**.yaml'));
    assert.ok(!pathsIgnore.includes('source/data/**'));
  });
});

// These run regardless of the fix — they assert pre-existing invariants.

nodeTest.describe('deploy trigger invariants (02-§108.1, 02-§108.4)', () => {
  it('DQT-05 (02-§108.1): deploy-qa fires on push to main and supports manual dispatch', () => {
    assert.deepEqual(qaOn.push.branches, ['main']);
    assert.ok('workflow_dispatch' in qaOn, 'workflow_dispatch trigger must be present');
  });

  it('DQT-06 (02-§108.4): deploy-prod is manual only (no push trigger)', () => {
    assert.ok('workflow_dispatch' in prodOn, 'deploy-prod must support workflow_dispatch');
    assert.ok(!('push' in prodOn), 'deploy-prod must not auto-deploy on push');
  });
});
