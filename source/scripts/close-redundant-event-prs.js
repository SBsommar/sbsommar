'use strict';

// Closes event-submission pull requests that a merge to main has made redundant
// (02-§110.6–110.9). Runs in event-data-deploy-post-merge.yml after each
// event-data merge.
//
// A duplicate submission (same title + date + start → same fragment path) can slip
// past the add-API duplicate pre-check (02-§110.2) when it is opened before the
// first identical submission merges: at branch-cut time neither fragment is on main
// yet, so both pull requests are created. Once the first merges, the second would
// add a file that already exists on main with identical content, so its net diff
// against main is empty. This script finds such pull requests and closes them,
// deleting their branches.
//
// A pull request that instead modifies an existing fragment (same id, different
// body → a non-empty diff) is left open and logged for manual attention, so the
// residual edge stays visible rather than being closed silently (02-§110.9).

const { execFileSync } = require('node:child_process');

const DATA_PREFIX = 'source/data/';

/**
 * Decide what to do with an event pull request, given its head branch and the
 * list of files it changes against the base (each: { filename, status,
 * additions, deletions }). Pure and side-effect free so it can be unit-tested.
 *
 * Returns one of:
 *   'ignore'     – not an add-submission PR, or it touches non-event-data files
 *   'close'      – empty net diff: the file already exists on main (redundant)
 *   'keep'       – genuine new event(s): every changed file is freshly added
 *   'log-manual' – same id but a different body (modified/removed file)
 */
function classifyEventPr({ branch, files } = {}) {
  // Add submissions use `event/<...>` branches; edit/delete use `event-edit/`,
  // `event-delete/`, which do not start with `event/` and are out of scope.
  if (typeof branch !== 'string' || !branch.startsWith('event/')) return 'ignore';

  const list = Array.isArray(files) ? files : [];

  // Only act on pull requests whose changes are confined to event data.
  if (list.some((f) => !String(f && f.filename).startsWith(DATA_PREFIX))) return 'ignore';

  const changed = list.filter((f) => ((f.additions || 0) + (f.deletions || 0)) > 0);
  if (changed.length === 0) return 'close';                      // redundant: identical file already on main
  if (changed.every((f) => f.status === 'added')) return 'keep'; // genuine new event(s)
  return 'log-manual';                                           // modified/removed: surface it
}

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8' });
}

function main() {
  const repo = process.env.GH_REPO || process.env.GITHUB_REPOSITORY || '';
  const repoArgs = repo ? ['--repo', repo] : [];

  const prs = JSON.parse(
    gh(['pr', 'list', ...repoArgs, '--state', 'open', '--limit', '100', '--json', 'number,headRefName']),
  );

  for (const pr of prs) {
    if (!pr.headRefName || !pr.headRefName.startsWith('event/')) continue;

    const files = JSON.parse(gh(['api', `repos/${repo}/pulls/${pr.number}/files`, '--paginate']));
    const verdict = classifyEventPr({ branch: pr.headRefName, files });

    if (verdict === 'close') {
      console.log(`Closing redundant duplicate PR #${pr.number} (${pr.headRefName}) — empty net diff against main`);
      gh([
        'pr', 'close', String(pr.number), ...repoArgs, '--delete-branch',
        '--comment', 'Stänger automatiskt: aktiviteten finns redan på sajten (identiskt inskick). Inget går förlorat.',
      ]);
    } else if (verdict === 'log-manual') {
      console.log(`::warning::Event PR #${pr.number} (${pr.headRefName}) shares an id with an existing activity but has a different body — needs manual review (02-§110.9)`);
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('close-redundant-event-prs failed:', err.message);
    process.exit(1);
  }
}

module.exports = { classifyEventPr };
