'use strict';

// Feedback validation and GitHub Issue creation.
// Mirrors the injection patterns from validate.js.

const { githubRequest, env } = require('./github');

const VALID_CATEGORIES = ['bug', 'suggestion', 'other'];

const CATEGORY_LABELS = {
  bug:        'feedback:bug',
  suggestion: 'feedback:suggestion',
  other:      'feedback:other',
};

const CATEGORY_DISPLAY = {
  bug:        'Bugg',
  suggestion: 'Förslag',
  other:      'Övrigt',
};

const MAX_LENGTHS = {
  title:       200,
  description: 2000,
  name:        200,
};

const TEXT_FIELDS = ['title', 'description', 'name'];

const INJECTION_PATTERNS = [
  { re: /<script/i,         label: '<script>' },
  { re: /javascript:/i,     label: 'javascript: URI' },
  { re: /on\w+\s*=/i,       label: 'event handler (on*=)' },
  { re: /<iframe/i,         label: '<iframe>' },
  { re: /<object/i,         label: '<object>' },
  { re: /<embed/i,          label: '<embed>' },
  { re: /data:text\/html/i, label: 'data:text/html URI' },
];

// ── Validation ───────────────────────────────────────────────────────────────

function validateFeedbackRequest(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' };
  }

  // Honeypot check — return ok but flag it
  const website = typeof body.website === 'string' ? body.website.trim() : '';
  if (website) {
    return { ok: true, honeypot: true };
  }

  const category    = typeof body.category    === 'string' ? body.category.trim()    : '';
  const title       = typeof body.title       === 'string' ? body.title.trim()       : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const name        = typeof body.name        === 'string' ? body.name.trim()        : '';

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return { ok: false, error: 'category måste vara bug, suggestion eller other' };
  }
  if (!title) return { ok: false, error: 'title är obligatoriskt' };
  if (!description) return { ok: false, error: 'description är obligatoriskt' };

  // Length limits
  if (title.length > MAX_LENGTHS.title) {
    return { ok: false, error: `title överskrider maxlängd ${MAX_LENGTHS.title} tecken` };
  }
  if (description.length > MAX_LENGTHS.description) {
    return { ok: false, error: `description överskrider maxlängd ${MAX_LENGTHS.description} tecken` };
  }
  if (name.length > MAX_LENGTHS.name) {
    return { ok: false, error: `name överskrider maxlängd ${MAX_LENGTHS.name} tecken` };
  }

  // Injection scan
  for (const field of TEXT_FIELDS) {
    const val = typeof body[field] === 'string' ? body[field] : '';
    if (!val) continue;
    for (const { re, label } of INJECTION_PATTERNS) {
      if (re.test(val)) {
        return { ok: false, error: `${field} innehåller otillåtet mönster: ${label}` };
      }
    }
  }

  return { ok: true };
}

// ── GitHub Issue creation ────────────────────────────────────────────────────

// Client-supplied metadata length caps (issue #383). These fields are not run
// through the injection scan and end up in a GitHub-issue Markdown table.
const META_MAX_LENGTHS = {
  url:       500,
  viewport:  20,
  userAgent: 400,
  timestamp: 40,
  name:      200,
};

// Make a value safe to drop into a single Markdown table cell (issue #383):
// collapse control characters (incl. CR/LF/TAB) to a single space so a value
// cannot break the table row, escape the `|` column delimiter, and cap the
// length so a client cannot inject table structure or an unbounded payload.
function sanitizeMetaField(value, maxLen) {
  return String(value == null ? '' : value)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f\x7f]+/g, ' ')
    // Escape the backslash FIRST, then the table delimiter — otherwise an input
    // like `\|` becomes `\\|` (literal backslash + an unescaped pipe) and still
    // breaks the Markdown table (CodeQL js/incomplete-sanitization, #383).
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .trim()
    .slice(0, maxLen);
}

// Build the GitHub issue payload (title, body, labels) from a validated body.
// Pure and exported so the sanitisation can be unit-tested without network.
function buildFeedbackIssue(body) {
  const category    = body.category.trim();
  const title       = body.title.trim();
  const description = body.description.trim();
  const name        = sanitizeMetaField(typeof body.name === 'string' ? body.name.trim() : '', META_MAX_LENGTHS.name);
  const pageUrl     = sanitizeMetaField(typeof body.url  === 'string' ? body.url.trim()  : '', META_MAX_LENGTHS.url);
  const viewport    = sanitizeMetaField(body.viewport,  META_MAX_LENGTHS.viewport);
  const userAgent   = sanitizeMetaField(body.userAgent, META_MAX_LENGTHS.userAgent);
  const timestamp   = sanitizeMetaField(body.timestamp, META_MAX_LENGTHS.timestamp);

  const issueTitle = `[Feedback] ${CATEGORY_DISPLAY[category]}: ${title}`;
  const issueBody = `${description}

---

| Metadata | Värde |
|----------|-------|
| Kategori | ${CATEGORY_DISPLAY[category]} |
| Sida | ${pageUrl || 'Ej angivet'} |
| Viewport | ${viewport || 'Ej angivet'} |
| Tid | ${timestamp || 'Ej angivet'} |
| Namn/kontakt | ${name || 'Ej angivet'} |
| User-Agent | ${userAgent || 'Ej angivet'} |`;

  return { title: issueTitle, body: issueBody, labels: [CATEGORY_LABELS[category]] };
}

async function createFeedbackIssue(body) {
  const owner = env('GITHUB_OWNER');
  const repo  = env('GITHUB_REPO');
  const token = env('GITHUB_TOKEN');

  const issue = buildFeedbackIssue(body);

  const apiPath = `/repos/${owner}/${repo}/issues`;
  const { data } = await githubRequest('POST', apiPath, {
    title:  issue.title,
    body:   issue.body,
    labels: issue.labels,
  }, token);

  return data.html_url;
}

module.exports = { validateFeedbackRequest, createFeedbackIssue, buildFeedbackIssue, sanitizeMetaField };
