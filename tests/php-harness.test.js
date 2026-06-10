'use strict';

// Guards the PHP test harness wiring (02-§103). The PHP tests themselves run
// under PHPUnit (api/tests/), but these Node assertions — which always run in
// the Node suite and pre-commit hook — ensure the harness stays wired into
// Composer, PHPUnit, and CI, and that the pre-commit hook stays Node-only.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('PHP harness — Composer (02-§103.1, 02-§103.3)', () => {
  const composer = JSON.parse(read('api/composer.json'));

  it('PHARN-01: declares phpunit/phpunit as a dev dependency', () => {
    assert.ok(composer['require-dev'], 'require-dev block missing');
    assert.ok(composer['require-dev']['phpunit/phpunit'], 'phpunit/phpunit not in require-dev');
  });

  it('PHARN-02: keeps phpunit out of production (non-dev) requires', () => {
    assert.ok(!(composer.require && composer.require['phpunit/phpunit']), 'phpunit must not be a production dependency');
  });

  it('PHARN-03: defines a composer "test" script', () => {
    assert.ok(composer.scripts && composer.scripts.test, 'scripts.test missing');
    assert.match(composer.scripts.test, /phpunit/);
  });

  it('PHARN-04: autoloads the test namespace from tests/', () => {
    const dev = composer['autoload-dev'] && composer['autoload-dev']['psr-4'];
    assert.ok(dev && dev['SBSommar\\Tests\\'] === 'tests/', 'autoload-dev PSR-4 for SBSommar\\Tests\\ → tests/ missing');
  });
});

describe('PHP harness — PHPUnit config (02-§103.2)', () => {
  it('PHARN-05: phpunit.xml exists and registers the tests/ suite', () => {
    const xml = read('api/phpunit.xml');
    assert.match(xml, /<testsuite[^>]*>/);
    assert.match(xml, /<directory>tests<\/directory>/);
  });
});

describe('PHP harness — CI integration (02-§103.5, 02-§103.6)', () => {
  const ci = yaml.load(read('.github/workflows/ci.yml'));
  const steps = ci.jobs.ci.steps;
  const guard = "steps.changes.outputs.has_code == 'true'";

  const setupPhp = steps.find((s) => typeof s.uses === 'string' && s.uses.startsWith('shivammathur/setup-php'));
  const phpTest = steps.find((s) => typeof s.run === 'string' && s.run.includes('composer test'));
  const composerInstall = steps.find((s) => typeof s.run === 'string' && s.run.includes('composer install'));

  it('PHARN-06: sets up PHP via shivammathur/setup-php', () => {
    assert.ok(setupPhp, 'setup-php step missing');
  });

  it('PHARN-07: installs deps and runs composer test in api/', () => {
    assert.ok(composerInstall, 'composer install step missing');
    assert.ok(phpTest, 'composer test step missing');
    assert.strictEqual(composerInstall['working-directory'], 'api');
    assert.strictEqual(phpTest['working-directory'], 'api');
  });

  it('PHARN-08: PHP steps are guarded by the has_code data-only skip', () => {
    for (const step of [setupPhp, composerInstall, phpTest]) {
      assert.ok(step.if && step.if.includes(guard), `step "${step.name}" is not guarded by has_code`);
    }
  });
});

describe('PHP harness — pre-commit hook stays Node-only (02-§103.9)', () => {
  it('PHARN-09: pre-commit hook does not invoke php or composer', () => {
    const hook = read('.githooks/pre-commit');
    assert.doesNotMatch(hook, /\bphp\b/);
    assert.doesNotMatch(hook, /\bcomposer\b/);
  });
});
