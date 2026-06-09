'use strict';

// Tests for the PHP API .env living outside the web root in the deploy
// workflow (§100, 02-§100.7 / 02-§100.8 / 02-§100.11).
//
// Structural checks against the workflow YAML. The live behaviour (no .env
// served, file present at $DEPLOY_DIR/.env) is a manual checkpoint.
//
// Manual checkpoints:
//   ENVLOC-M01: After a deploy, ls $DEPLOY_DIR/public_html/api/.env → absent.
//   ENVLOC-M02: ls $DEPLOY_DIR/.env → present with valid credentials.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WORKFLOW_PATH = path.resolve(
  __dirname,
  '../.github/workflows/deploy-reusable.yml',
);
const SRC = fs.readFileSync(WORKFLOW_PATH, 'utf8');

describe('02-§100.7 — deploy never writes .env into the web root', () => {
  it('ENVLOC-01: the API archive excludes .env', () => {
    assert.match(
      SRC,
      /--exclude=['"]\.env['"]/,
      'the api tar must be built with --exclude=\'.env\'',
    );
  });

  it('ENVLOC-02: no step copies/moves .env into the API staging or web root', () => {
    // Any restore of .env into a web-served path reintroduces the exposure.
    // The patterns match a destination position only (`cp|mv SRC DST`), so the
    // §100.8 migration — which reads $PUBLIC_DIR/api/.env as the *source* and
    // moves it out — is correctly allowed.
    assert.doesNotMatch(
      SRC,
      /(cp|mv)\s+[^\n]+\s+"\$API_STAGING\/\.env"/,
      'nothing may write .env into $API_STAGING (which becomes public_html/api)',
    );
    assert.doesNotMatch(
      SRC,
      /(cp|mv)\s+[^\n]+\s+"\$PUBLIC_DIR\/api\/\.env"/,
      'nothing may write .env into $PUBLIC_DIR/api',
    );
  });
});

describe('02-§100.8 — one-time migration of a legacy in-web-root .env', () => {
  it('ENVLOC-03: a migration moves public_html/api/.env to $DEPLOY_DIR/.env', () => {
    // Guarded move: only when the canonical file is absent and the legacy
    // copy exists.
    assert.match(
      SRC,
      /mv\s+"\$PUBLIC_DIR\/api\/\.env"\s+"\$DEPLOY_DIR\/\.env"/,
      'the workflow must migrate a legacy public_html/api/.env to $DEPLOY_DIR/.env',
    );
    assert.match(
      SRC,
      /\[\s*!\s*-f\s+"\$DEPLOY_DIR\/\.env"\s*\]/,
      'the migration must be guarded by an "is $DEPLOY_DIR/.env missing" test',
    );
  });
});

describe('02-§100.11 — persistent backup mechanism removed (supersedes §53.3)', () => {
  it('ENVLOC-04: no .env.api.persistent or .env.api.bak backup remains', () => {
    assert.doesNotMatch(
      SRC,
      /\.env\.api\.(persistent|bak)/,
      'the superseded backup-and-restore files must not be referenced',
    );
  });
});
