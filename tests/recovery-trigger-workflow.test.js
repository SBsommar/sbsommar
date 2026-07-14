'use strict';

// Workflow-config checks for the stranded-recovery triggers (02-§112.16, 112.17).
// These assert the YAML wiring; the live recovery behaviour is manual checkpoint
// STRAND-M01.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const load = (rel) =>
  yaml.load(fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8'));

const recovery = load('.github/workflows/merge-queue-recovery.yml');
const postMerge = load('.github/workflows/event-data-deploy-post-merge.yml');

// `on:` is a YAML 1.1 boolean, so some parsers key it as `true`. Accept either.
const triggersOf = (wf) => wf.on ?? wf[true];

const CONCURRENCY_GROUP = 'stranded-recovery';

describe('merge-queue-recovery triggers (02-§112.16)', () => {
  const on = triggersOf(recovery);

  it('RECTRIG-01: keeps schedule (120-minute backstop) and workflow_dispatch triggers', () => {
    assert.ok(on.schedule, 'schedule trigger must remain as the backstop');
    assert.equal(on.schedule[0].cron, '0 */2 * * *', 'schedule is the 120-minute backstop');
    assert.ok('workflow_dispatch' in on, 'workflow_dispatch must remain');
  });

  it('RECTRIG-02: runs on check_suite completed', () => {
    assert.ok(on.check_suite, 'check_suite trigger must be present');
    assert.deepEqual(on.check_suite.types, ['completed']);
  });
});

describe('single-flight concurrency (02-§112.17)', () => {
  it('RECTRIG-03: scheduled workflow uses the shared group, no cancel-in-progress', () => {
    assert.equal(recovery.concurrency.group, CONCURRENCY_GROUP);
    assert.equal(recovery.concurrency['cancel-in-progress'], false);
  });

  it('RECTRIG-04: post-merge recover job shares the same group, no cancel-in-progress', () => {
    const job = postMerge.jobs['recover-stranded-event-prs'];
    assert.ok(job, 'post-merge recover job must exist');
    assert.equal(job.concurrency.group, CONCURRENCY_GROUP);
    assert.equal(job.concurrency['cancel-in-progress'], false);
  });
});

describe('recovery auth wiring stays intact (02-§112.12)', () => {
  const tokenOf = (job) => {
    const step = job.steps.find((s) => s.run && s.run.includes('recover-stranded-event-prs.js'));
    return step && step.env && step.env.GITHUB_TOKEN;
  };

  it('RECTRIG-05: both recovery entry points pass EVENT_AUTOMERGE_TOKEN', () => {
    const expected = '${{ secrets.EVENT_AUTOMERGE_TOKEN }}';
    assert.equal(tokenOf(recovery.jobs['recover-stranded-event-prs']), expected);
    assert.equal(tokenOf(postMerge.jobs['recover-stranded-event-prs']), expected);
  });
});
