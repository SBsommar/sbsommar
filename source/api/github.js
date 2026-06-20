'use strict';

const https = require('https');
const yaml  = require('js-yaml');
const { patchEventInYaml, patchEventObject, removeEventFromYaml } = require('./edit-event');
const { resolveActiveCamp } = require('../scripts/resolve-active-camp');

const CAMPS_PATH = 'source/data/camps.yaml';

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

// Wrap a YAML scalar in single quotes only when necessary.
function yamlScalar(val) {
  if (val === null || val === undefined) return 'null';
  const s = String(val);
  if (!s) return "''";
  if (/[:#{}[\],&*?|<>=!%@`]/.test(s) || /^[\s"'0-9]/.test(s) || s !== s.trim()) {
    return "'" + s.replace(/'/g, "''") + "'";
  }
  return s;
}

// Serialise an event's field lines (everything after the id line), using `fp` as
// the field-line prefix and `dp` as the description body / sub-key prefix. Shared
// by buildEventYaml (camp-file list item) and buildFragmentYaml (fragment file).
function eventBodyLines(event, fp, dp) {
  const lines = [
    `${fp}title: ${yamlScalar(event.title)}`,
    `${fp}date: '${event.date}'`,
    `${fp}start: '${event.start}'`,
    `${fp}end: '${event.end}'`,
    `${fp}location: ${yamlScalar(event.location)}`,
    `${fp}responsible: ${yamlScalar(event.responsible)}`,
  ];

  if (event.description) {
    lines.push(`${fp}description: |`);
    // Normalise CRLF / lone CR to LF so the literal block has no stray carriage
    // returns regardless of the submitter's platform (02-§102.4).
    event.description.replace(/\r\n?/g, '\n').split('\n').forEach((l) => lines.push(`${dp}${l}`));
  } else {
    lines.push(`${fp}description: null`);
  }

  lines.push(`${fp}link: ${event.link ? yamlScalar(event.link) : 'null'}`);
  lines.push(`${fp}owner:`);
  lines.push(`${dp}name: '${((event.owner && event.owner.name) || '').replace(/'/g, "''")}'`);
  lines.push(`${dp}email: ''`);
  lines.push(`${fp}meta:`);
  lines.push(`${dp}created_at: ${event.meta.created_at}`);
  lines.push(`${dp}updated_at: ${event.meta.updated_at}`);

  return lines;
}

// Serialise a single event as a YAML block ready to append.
// `indent` is the number of leading spaces for the list marker (`- id:`).
// Field lines are indented by `indent + 2`.  Default 0 matches the camp
// YAML format where list items sit at column 0 under the `events:` key.
function buildEventYaml(event, indent = 0) {
  const p  = ' '.repeat(indent);      // prefix for "- id:" line
  const fp = ' '.repeat(indent + 2);  // prefix for field lines
  const dp = ' '.repeat(indent + 4);  // prefix for description body / sub-keys

  return [`${p}- id: ${event.id}`, ...eventBodyLines(event, fp, dp)].join('\n');
}

// Serialise a single event as a standalone fragment file: one top-level `event:`
// mapping with fields indented two spaces (02-§109.2). Written to its own file so
// concurrent submissions never touch the same file (02-§109.5, §109.7).
function buildFragmentYaml(event) {
  return ['event:', `  id: ${event.id}`, ...eventBodyLines(event, '  ', '    ')].join('\n');
}

// Per-camp fragment directory and file path (02-§109.1, §109.3).
//   fragmentPath('2026-06-syssleback.yaml', 'x-2026-06-22-0800')
//     → 'source/data/2026-06-syssleback/x-2026-06-22-0800.yaml'
function fragmentDir(campFile) {
  return `source/data/${campFile.replace(/\.ya?ml$/, '')}`;
}
function fragmentPath(campFile, eventId) {
  return `${fragmentDir(campFile)}/${eventId}.yaml`;
}

// Backstop before any branch/PR (02-§109.17): the proposed fragment must parse to
// a single `event:` mapping whose id matches the one we intend to write.
function assertFragmentYamlValid(content, expectedId) {
  let doc;
  try {
    doc = yaml.load(content);
  } catch (e) {
    throw new Error(`Proposed fragment YAML failed to parse: ${e.message}`, { cause: e });
  }
  if (!doc || typeof doc.event !== 'object' || doc.event === null || Array.isArray(doc.event)) {
    throw new Error('Proposed fragment YAML is missing the event mapping');
  }
  if (doc.event.id !== expectedId) {
    throw new Error(`Proposed fragment YAML has wrong event id: expected ${expectedId}, got ${doc.event.id}`);
  }
}

// Determine the indentation (number of leading spaces) of the existing
// `events:` list items so an appended block matches and the combined file
// stays valid YAML (02-§10.6, 02-§102.8). Defaults to 2 when the list has no
// items yet.
function detectEventIndent(campContent) {
  const lines = campContent.split('\n');
  const eventsIdx = lines.findIndex((l) => /^events:/.test(l));
  if (eventsIdx !== -1) {
    for (let i = eventsIdx + 1; i < lines.length; i++) {
      const m = lines[i].match(/^( *)- +id:/);
      if (m) return m[1].length;
      // A non-indented, non-empty line means the events list has ended.
      if (/^\S/.test(lines[i]) && lines[i].trim() !== '') break;
    }
  }
  return 2;
}

// Defence-in-depth backstop (02-§102.5): parse the complete proposed camp
// document and confirm it contains every newly created event id before any
// branch or pull request is created. Throws on a parse failure or a missing id
// so the caller aborts without writing anything to git.
function assertEventYamlValid(yamlContent, expectedIds) {
  let doc;
  try {
    doc = yaml.load(yamlContent);
  } catch (e) {
    throw new Error(`Proposed camp YAML failed to parse: ${e.message}`, { cause: e });
  }
  if (!doc || !Array.isArray(doc.events)) {
    throw new Error('Proposed camp YAML is missing the events list');
  }
  const ids = new Set(doc.events.map((e) => e && e.id));
  for (const id of expectedIds) {
    if (!ids.has(id)) {
      throw new Error(`Proposed camp YAML is missing expected event id: ${id}`);
    }
  }
}

// ── GitHub API primitives ────────────────────────────────────────────────────

function env(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing environment variable: ${name}`);
  return val;
}

// Make a single HTTPS request to the GitHub Contents API.
// Returns Promise<{ status: number, data: object }>.
function githubRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept':        'application/vnd.github+json',
        'User-Agent':    'sbsommar-api/1.0',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(payload ? {
          'Content-Type':   'application/json',
          'Content-Length': Buffer.byteLength(payload),
        } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let data = null;
        try { data = JSON.parse(raw); } catch { /* non-JSON body, ignore */ }
        if (res.statusCode >= 400) {
          const err = new Error(`GitHub API ${res.statusCode}: ${data && data.message || raw}`);
          err.status = res.statusCode;
          return reject(err);
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Fetch a file from the repo. Returns { content: string, sha: string }.
async function getFile(filePath) {
  const owner  = env('GITHUB_OWNER');
  const repo   = env('GITHUB_REPO');
  const branch = env('GITHUB_BRANCH');
  const token  = env('GITHUB_TOKEN');

  const apiPath = `/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  const { data } = await githubRequest('GET', apiPath, null, token);

  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return { content, sha: data.sha };
}

// Like getFile, but returns null when the file does not exist (HTTP 404) instead
// of throwing — used to decide whether an event lives in a fragment file
// (02-§109.9).
async function getFileMaybe(filePath) {
  try {
    return await getFile(filePath);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

// Commit a file to a specific branch. Omit `sha` (null/undefined) to create a new
// file; pass the current blob sha to update an existing one.
async function putFile(filePath, content, sha, message, branch) {
  const owner = env('GITHUB_OWNER');
  const repo  = env('GITHUB_REPO');
  const token = env('GITHUB_TOKEN');

  const apiPath = `/repos/${owner}/${repo}/contents/${filePath}`;
  const payload = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch,
  };
  if (sha) payload.sha = sha;
  await githubRequest('PUT', apiPath, payload, token);
}

// Delete a file on a specific branch (02-§109.11).
async function deleteFile(filePath, sha, message, branch) {
  const owner = env('GITHUB_OWNER');
  const repo  = env('GITHUB_REPO');
  const token = env('GITHUB_TOKEN');

  const apiPath = `/repos/${owner}/${repo}/contents/${filePath}`;
  await githubRequest('DELETE', apiPath, { message, sha, branch }, token);
}

// Return the latest commit SHA on the configured main branch.
async function getMainSha() {
  const owner  = env('GITHUB_OWNER');
  const repo   = env('GITHUB_REPO');
  const branch = env('GITHUB_BRANCH');
  const token  = env('GITHUB_TOKEN');

  const { data } = await githubRequest('GET', `/repos/${owner}/${repo}/git/refs/heads/${branch}`, null, token);
  return data.object.sha;
}

// Create a new branch pointing at the given commit SHA.
async function createBranch(name, sha) {
  const owner = env('GITHUB_OWNER');
  const repo  = env('GITHUB_REPO');
  const token = env('GITHUB_TOKEN');

  await githubRequest('POST', `/repos/${owner}/${repo}/git/refs`, {
    ref: `refs/heads/${name}`,
    sha,
  }, token);
}

// Open a pull request from head into the configured main branch.
// Returns { number, node_id } — node_id is required for GraphQL auto-merge.
async function createPullRequest(title, head, body) {
  const owner = env('GITHUB_OWNER');
  const repo  = env('GITHUB_REPO');
  const base  = env('GITHUB_BRANCH');
  const token = env('GITHUB_TOKEN');

  const { data } = await githubRequest('POST', `/repos/${owner}/${repo}/pulls`, {
    title,
    head,
    base,
    body: body || 'Automatically generated by the SB Sommar API.',
  }, token);

  return { number: data.number, node_id: data.node_id };
}

// Enable squash auto-merge on a pull request via the GraphQL API.
// GraphQL errors arrive as HTTP 200 with a body-level errors array — must be checked explicitly.
async function enableAutoMerge(nodeId) {
  const token = env('GITHUB_TOKEN');

  const query = `
    mutation($id: ID!) {
      enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: SQUASH }) {
        pullRequest { number }
      }
    }
  `;

  const { data } = await githubRequest('POST', '/graphql', {
    query,
    variables: { id: nodeId },
  }, token);

  if (data && data.errors && data.errors.length > 0) {
    throw new Error(`GraphQL error enabling auto-merge: ${data.errors[0].message}`);
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

// Resolve the active camp from camps.yaml on main (shared by all mutations).
async function resolveActiveCampFromGitHub() {
  const { content: campsYaml } = await getFile(CAMPS_PATH);
  const campsData = yaml.load(campsYaml);
  const buildEnv = process.env.BUILD_ENV || undefined;
  return resolveActiveCamp(campsData.camps || [], undefined, buildEnv);
}

// Writes a new event as its own fragment file in the active camp's directory
// (02-§109.5). Because the file is brand-new and named after the event id, the
// resulting PR can never conflict with another in-flight submission (02-§109.7).
async function addEventToActiveCamp(body) {
  const title       = body.title.trim();
  const date        = body.date.trim();
  const start       = body.start.trim();
  const end         = body.end.trim();
  const location    = body.location.trim();
  const responsible = body.responsible.trim();
  const description = typeof body.description === 'string' ? body.description.trim() || null : null;
  const link        = typeof body.link        === 'string' ? body.link.trim()        || null : null;
  const ownerName   = typeof body.ownerName   === 'string' ? body.ownerName.trim()          : '';

  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const event = {
    id:          `${slugify(title)}-${date}-${start.replace(':', '')}`,
    title, date, start, end, location, responsible, description, link,
    owner:       { name: ownerName, email: '' },
    meta:        { created_at: now, updated_at: now },
  };

  const camp = await resolveActiveCampFromGitHub();

  // Build the fragment and verify it parses with the expected id before any
  // branch/PR is created (02-§102.5, §109.17).
  const fragPath   = fragmentPath(camp.file, event.id);
  const content    = buildFragmentYaml(event) + '\n';
  assertFragmentYamlValid(content, event.id);
  const commitMsg  = `Add event to ${camp.name}: ${title} (${date})`;

  // Ephemeral branch → create the new fragment file (no sha) → PR → auto-merge.
  const mainSha    = await getMainSha();
  const branchName = `event/${date}-${slugify(title)}-${Date.now()}`;
  await createBranch(branchName, mainSha);
  await putFile(fragPath, content, null, commitMsg, branchName);
  const pr = await createPullRequest(commitMsg, branchName, 'Automatically created by the SB Sommar add-event API.');
  await enableAutoMerge(pr.node_id);
}

// Edits an event by ID. Looks for the event's fragment file first; if present it
// rewrites that file in place (02-§109.10). Otherwise it falls back to patching
// the camp YAML file, exactly as before (02-§109.12).
async function updateEventInActiveCamp(eventId, updates) {
  const camp       = await resolveActiveCampFromGitHub();
  const now        = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const commitMsg  = `Edit event in ${camp.name}: ${eventId}`;
  const mainSha    = await getMainSha();
  const branchName = `event-edit/${eventId}-${Date.now()}`;

  // Fragment path first (02-§109.9).
  const fragPath = fragmentPath(camp.file, eventId);
  const frag     = await getFileMaybe(fragPath);
  if (frag) {
    const doc = yaml.load(frag.content) || {};
    if (!doc.event) throw new Error(`Event not found: ${eventId}`);
    const patched = patchEventObject(doc.event, updates, now);
    const content = buildFragmentYaml(patched) + '\n';
    assertFragmentYamlValid(content, eventId);
    await createBranch(branchName, mainSha);
    await putFile(fragPath, content, frag.sha, commitMsg, branchName);
    const pr = await createPullRequest(commitMsg, branchName, 'Automatically created by the SB Sommar edit-event API.');
    await enableAutoMerge(pr.node_id);
    return;
  }

  // Fallback: patch the camp YAML file in place.
  const campFilePath = `source/data/${camp.file}`;
  const { content: campContent, sha: fileSha } = await getFile(campFilePath);
  const newContent = patchEventInYaml(campContent, eventId, updates);
  if (newContent === null) throw new Error(`Event not found: ${eventId}`);
  await createBranch(branchName, mainSha);
  await putFile(campFilePath, newContent, fileSha, commitMsg, branchName);
  const pr = await createPullRequest(commitMsg, branchName, 'Automatically created by the SB Sommar edit-event API.');
  await enableAutoMerge(pr.node_id);
}

// Deletes an event by ID. Removes the event's fragment file if it exists
// (02-§109.11); otherwise removes it from the camp YAML file (02-§109.12).
async function removeEventFromActiveCamp(eventId) {
  const camp       = await resolveActiveCampFromGitHub();
  const commitMsg  = `Delete event in ${camp.name}: ${eventId}`;
  const mainSha    = await getMainSha();
  const branchName = `event-delete/${eventId}-${Date.now()}`;

  const fragPath = fragmentPath(camp.file, eventId);
  const frag     = await getFileMaybe(fragPath);
  if (frag) {
    await createBranch(branchName, mainSha);
    await deleteFile(fragPath, frag.sha, commitMsg, branchName);
    const pr = await createPullRequest(commitMsg, branchName, 'Automatically created by the SB Sommar delete-event API.');
    await enableAutoMerge(pr.node_id);
    return;
  }

  const campFilePath = `source/data/${camp.file}`;
  const { content: campContent, sha: fileSha } = await getFile(campFilePath);
  const newContent = removeEventFromYaml(campContent, eventId);
  if (newContent === null) throw new Error(`Event not found: ${eventId}`);
  await createBranch(branchName, mainSha);
  await putFile(campFilePath, newContent, fileSha, commitMsg, branchName);
  const pr = await createPullRequest(commitMsg, branchName, 'Automatically created by the SB Sommar delete-event API.');
  await enableAutoMerge(pr.node_id);
}

module.exports = { addEventToActiveCamp, updateEventInActiveCamp, removeEventFromActiveCamp, slugify, yamlScalar, buildEventYaml, buildFragmentYaml, fragmentDir, fragmentPath, assertFragmentYamlValid, detectEventIndent, assertEventYamlValid, githubRequest, env };
