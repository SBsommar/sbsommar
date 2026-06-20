'use strict';

// Maps a changed repository path to the camp file it belongs to, so the
// post-merge deploy workflow can apply QA gating to fragment files nested under a
// per-camp directory (02-§109.22).
//
//   source/data/2026-06-syssleback/x.yaml  → 2026-06-syssleback.yaml  (fragment)
//   source/data/2026-06-syssleback.yaml    → 2026-06-syssleback.yaml  (camp file)
//   source/data/camps.yaml | local.yaml    → null  (config, not event data)
//   anything outside source/data/*.yaml    → null
//
// Returns the camp file basename (e.g. "2026-06-syssleback.yaml") or null.

const PREFIX = 'source/data/';

function campFileForPath(changedPath) {
  if (typeof changedPath !== 'string') return null;
  let p = changedPath.trim().replace(/^\.\//, '');
  if (!p.startsWith(PREFIX)) return null;

  const rel = p.slice(PREFIX.length);
  if (!/\.ya?ml$/.test(rel)) return null;

  const slash = rel.indexOf('/');
  if (slash === -1) {
    // Top-level file directly in source/data/. camps.yaml / local.yaml are
    // configuration, not per-camp event data.
    if (rel === 'camps.yaml' || rel === 'local.yaml') return null;
    return rel;
  }

  // Nested fragment: the camp file is named after the first directory segment.
  return rel.slice(0, slash) + '.yaml';
}

module.exports = { campFileForPath };

// ── CLI ───────────────────────────────────────────────────────────────────────
// Prints the camp file for the given path, or nothing (exit 0) when the path is
// not per-camp event data. Used by the deploy workflow's gate step.
if (require.main === module) {
  const result = campFileForPath(process.argv[2] || '');
  if (result) process.stdout.write(result + '\n');
}
