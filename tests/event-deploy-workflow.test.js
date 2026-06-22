'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const WORKFLOW_PATH = path.resolve(
  __dirname,
  '../.github/workflows/event-data-deploy-post-merge.yml'
);

const workflow = yaml.load(fs.readFileSync(WORKFLOW_PATH, 'utf8'));
const jobNames = Object.keys(workflow.jobs);

// ── 02-§51.1  No separate detect job ─────────────────────────────────────────

describe('02-§51.1 — No separate detect job (EDW-01)', () => {
  it('EDW-01: workflow has no job named "detect"', () => {
    assert.ok(
      !jobNames.includes('detect'),
      'workflow must not contain a standalone detect job'
    );
  });
});

// ── 02-§51.3  All deploy jobs start in parallel (no serial dependency) ───────

describe('02-§51.3 — Deploy jobs have no inter-job dependencies (EDW-02..04)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  it('EDW-02: at least two deploy jobs exist', () => {
    assert.ok(deployJobs.length >= 2, `found ${deployJobs.length} deploy jobs`);
  });

  for (const name of deployJobs) {
    it(`EDW-03: ${name} has no "needs" key`, () => {
      assert.strictEqual(
        workflow.jobs[name].needs,
        undefined,
        `${name} must not depend on another job`
      );
    });
  }
});

// ── 02-§51.4  Each deploy job checks out with fetch-depth: 2 ────────────────

describe('02-§51.4 — Checkout with fetch-depth: 2 (EDW-05..07)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  for (const name of deployJobs) {
    it(`EDW-05: ${name} checks out with fetch-depth: 2`, () => {
      const steps = workflow.jobs[name].steps || [];
      const checkout = steps.find(
        (s) => s.uses && s.uses.startsWith('actions/checkout')
      );
      assert.ok(checkout, `${name} must have a checkout step`);
      assert.strictEqual(
        checkout.with?.['fetch-depth'],
        2,
        `${name} checkout must use fetch-depth: 2`
      );
    });
  }
});

// ── 02-§51.2 / 02-§51.5  Inline detection per job ──────────────────────────

describe('02-§51.2 — Each deploy job has inline event-data detection (EDW-08..10)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  for (const name of deployJobs) {
    it(`EDW-08: ${name} has a gate step that runs git diff`, () => {
      const steps = workflow.jobs[name].steps || [];
      const gate = steps.find((s) => s.id === 'gate');
      assert.ok(gate, `${name} must have a step with id "gate"`);
      assert.ok(
        gate.run && gate.run.includes('git diff'),
        `${name} gate step must run git diff`
      );
      assert.ok(
        gate.run.includes('HEAD~1..HEAD'),
        `${name} gate step must compare HEAD~1..HEAD`
      );
    });
  }
});

// ── 02-§51.6  Skip build/deploy when no event data changed ─────────────────

describe('02-§51.6 — Build step gated on detection output (EDW-11..13)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  for (const name of deployJobs) {
    it(`EDW-11: ${name} build step has an if condition referencing gate output`, () => {
      const steps = workflow.jobs[name].steps || [];
      const build = steps.find(
        (s) => s.run && s.run.includes('node source/build/build.js')
      );
      assert.ok(build, `${name} must have a build step`);
      assert.ok(
        build.if && build.if.includes('gate'),
        `${name} build step must be gated on detection output`
      );
    });
  }
});

// ── 02-§51.7 / 02-§51.8  Production QA gating ──────────────────────────────

describe('02-§51.7 — Production job checks QA camp status (EDW-14..15)', () => {
  it('EDW-14: deploy-prod gate step checks camps.yaml for qa field', () => {
    const prod = workflow.jobs['deploy-prod'];
    assert.ok(prod, 'deploy-prod job must exist');
    const steps = prod.steps || [];
    const gate = steps.find((s) => s.id === 'gate');
    assert.ok(gate, 'deploy-prod must have a gate step');
    assert.ok(
      gate.run && gate.run.includes('camps.yaml'),
      'production gate must reference camps.yaml'
    );
    assert.ok(
      gate.run.includes('qa'),
      'production gate must check qa field'
    );
  });

  it('EDW-15: QA deploy job does NOT check camps.yaml for qa field', () => {
    const job = workflow.jobs['deploy-qa'];
    assert.ok(job, 'deploy-qa job must exist');
    const gate = (job.steps || []).find((s) => s.id === 'gate');
    assert.ok(gate, 'deploy-qa must have a gate step');
    assert.ok(
      !gate.run.includes('camps.yaml'),
      'deploy-qa gate should not check camps.yaml (QA always deploys)'
    );
  });
});

// ── 02-§52.3  No Docker container ──────────────────────────────────────────

describe('02-§52.3 — No Docker container in any job (EDW-16..18)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  for (const name of deployJobs) {
    it(`EDW-16: ${name} has no container key`, () => {
      assert.strictEqual(
        workflow.jobs[name].container,
        undefined,
        `${name} must not use a Docker container`
      );
    });
  }
});

// ── 02-§52.1  setup-node present ───────────────────────────────────────────

describe('02-§52.1 — Each deploy job uses setup-node (EDW-19..21)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  for (const name of deployJobs) {
    it(`EDW-19: ${name} has a setup-node step`, () => {
      const steps = workflow.jobs[name].steps || [];
      const setupNode = steps.find(
        (s) => s.uses && s.uses.startsWith('actions/setup-node')
      );
      assert.ok(setupNode, `${name} must have a setup-node step`);
      assert.strictEqual(
        setupNode.with?.['node-version'],
        '20',
        `${name} setup-node must use node-version 20`
      );
      assert.strictEqual(
        setupNode.with?.cache,
        'npm',
        `${name} setup-node must enable npm cache`
      );
    });
  }
});

// ── 02-§52.2  npm ci --omit=dev ────────────────────────────────────────────

describe('02-§52.2 — Each deploy job runs npm ci --omit=dev (EDW-22..24)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  for (const name of deployJobs) {
    it(`EDW-22: ${name} has an npm ci --omit=dev step`, () => {
      const steps = workflow.jobs[name].steps || [];
      const npmCi = steps.find(
        (s) => s.run && s.run.includes('npm ci --omit=dev')
      );
      assert.ok(npmCi, `${name} must have an npm ci --omit=dev step`);
    });
  }
});

// ── 02-§52.4  No packages:read permission ──────────────────────────────────

describe('02-§52.4 — No packages:read permission (EDW-25)', () => {
  it('EDW-25: workflow permissions do not include packages', () => {
    const perms = workflow.permissions || {};
    assert.strictEqual(
      perms.packages,
      undefined,
      'workflow must not require packages permission'
    );
  });
});

// ── 02-§52.5 / 02-§52.6  Conditional vs unconditional setup-node ──────────

describe('02-§52.5–52.6 — setup-node conditionality (EDW-26..28)', () => {
  it('EDW-26: deploy-qa setup-node is conditional on gate', () => {
    const job = workflow.jobs['deploy-qa'];
    assert.ok(job, 'deploy-qa job must exist');
    const steps = job.steps || [];
    const setupNode = steps.find(
      (s) => s.uses && s.uses.startsWith('actions/setup-node')
    );
    assert.ok(setupNode, 'deploy-qa must have a setup-node step');
    assert.ok(
      setupNode.if && setupNode.if.includes('gate'),
      'deploy-qa setup-node must be conditional on gate output'
    );
  });

  it('EDW-28: deploy-prod setup-node is unconditional', () => {
    const prod = workflow.jobs['deploy-prod'];
    assert.ok(prod, 'deploy-prod job must exist');
    const steps = prod.steps || [];
    const setupNode = steps.find(
      (s) => s.uses && s.uses.startsWith('actions/setup-node')
    );
    assert.ok(setupNode, 'deploy-prod must have a setup-node step');
    assert.strictEqual(
      setupNode.if,
      undefined,
      'deploy-prod setup-node must be unconditional'
    );
  });
});

// ── 02-§109.22 / §109.23  Fragment-aware production QA gating ────────────────
// Fragment files live under source/data/<stem>/, so the production gate must map
// a changed path back to its camp file before the camps.yaml QA lookup. The
// mapping is performed by source/scripts/changed-camp-file.js.

describe('02-§109.22 — Production gate attributes fragment paths to a camp (EDW-29..30)', () => {
  it('EDW-29: deploy-prod gate uses the changed-camp-file helper', () => {
    const prod = workflow.jobs['deploy-prod'];
    assert.ok(prod, 'deploy-prod job must exist');
    const gate = (prod.steps || []).find((s) => s.id === 'gate');
    assert.ok(gate, 'deploy-prod must have a gate step');
    assert.ok(
      gate.run.includes('changed-camp-file'),
      'deploy-prod gate must resolve the camp file via source/scripts/changed-camp-file.js'
    );
  });

  it('EDW-30: deploy-prod gate still consults camps.yaml for the qa field', () => {
    const prod = workflow.jobs['deploy-prod'];
    const gate = (prod.steps || []).find((s) => s.id === 'gate');
    assert.ok(gate.run.includes('camps.yaml') && gate.run.includes('qa'),
      'production gate must look up the resolved camp file in camps.yaml');
  });
});

// ── 02-§109.25  Triggers match fragment paths nested under source/data ───────

describe('02-§109.25 — Event-data workflows trigger on fragment paths (EDW-31..32)', () => {
  const fs = require('fs');
  const path = require('path');
  const yaml = require('js-yaml');

  function triggers(wf) {
    // js-yaml parses the YAML key `on:` as the boolean true, not the string "on".
    return wf.on || wf[true] || {};
  }

  it('EDW-31: post-merge deploy triggers on source/data/**.yaml (matches nested fragments)', () => {
    const paths = triggers(workflow).push?.paths || [];
    assert.ok(
      paths.includes('source/data/**.yaml'),
      `post-merge push paths must include source/data/**.yaml, got: ${JSON.stringify(paths)}`
    );
  });

  it('EDW-32: PR-check workflow triggers on source/data/**.yaml', () => {
    const prCheck = yaml.load(
      fs.readFileSync(path.resolve(__dirname, '../.github/workflows/event-data-deploy.yml'), 'utf8')
    );
    const paths = triggers(prCheck).pull_request?.paths || [];
    assert.ok(
      paths.includes('source/data/**.yaml'),
      `PR-check pull_request paths must include source/data/**.yaml, got: ${JSON.stringify(paths)}`
    );
  });
});

// ── 02-§76.2  /dagens-schema/ alias redeploys with live.html on data-only deploys ──
// The alias embeds the day's events, so it must be staged alongside live.html in
// every deploy job or it would diverge from live.html after a data-only deploy.

describe('02-§76.2 — Both deploy jobs stage the /dagens-schema/ alias (EDW-DS-01..02)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  for (const name of deployJobs) {
    it(`EDW-DS-01: ${name} staging step copies dagens-schema/index.html`, () => {
      const steps = workflow.jobs[name].steps || [];
      const stage = steps.find(
        (s) => s.run && s.run.includes('mkdir -p staging')
      );
      assert.ok(stage, `${name} must have a staging step`);
      assert.ok(
        stage.run.includes('dagens-schema/index.html'),
        `${name} staging step must stage dagens-schema/index.html`
      );
    });
  }
});
