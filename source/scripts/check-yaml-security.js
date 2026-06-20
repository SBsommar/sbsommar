'use strict';

// Scans a per-camp event YAML file for content that would be dangerous
// if injected into the rendered HTML.
//
// Usage (CLI):  node source/scripts/check-yaml-security.js <path-to-yaml>
// Usage (API):  const { scanYaml } = require('./check-yaml-security')
//               const { ok, findings } = scanYaml(yamlString)
//
// Exits 0 on success, 1 on any security finding (CLI mode only).

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Free-text fields whose content ends up rendered in public HTML.
// owner.name and owner.email are deliberately excluded: they are never
// rendered in public output (see docs/05-DATA_CONTRACT.md §3.3).
const TEXT_FIELDS = ['title', 'location', 'responsible', 'description'];

// Maximum lengths per field (generous limits to catch abusive payloads).
const MAX_LENGTHS = {
  title:       200,
  location:    200,
  responsible: 200,
  description: 2000,
  link:        500,
};

// Patterns indicating potential injection attempts.
const INJECTION_PATTERNS = [
  { re: /<script/i,         label: '<script> tag' },
  { re: /javascript:/i,     label: 'javascript: URI' },
  { re: /on\w+\s*=/i,       label: 'event handler attribute (on*=)' },
  { re: /<iframe/i,         label: '<iframe> tag' },
  { re: /<object/i,         label: '<object> tag' },
  { re: /<embed/i,          label: '<embed> tag' },
  { re: /data:text\/html/i, label: 'data:text/html URI' },
];

// ── Core scan ─────────────────────────────────────────────────────────────────

// Scans a YAML string for security issues.
// Returns { ok: true } or { ok: false, findings: string[] }.
function scanYaml(content) {
  const findings = [];

  let data;
  try {
    data = yaml.load(content);
  } catch (e) {
    return { ok: false, findings: [`YAML parse error: ${e.message}`] };
  }

  // A camp file holds an `events:` list; a fragment file holds a single
  // top-level `event:` mapping (02-§109.21). Scan whichever is present.
  let events = [];
  if (data && Array.isArray(data.events)) {
    events = data.events;
  } else if (data && data.event && typeof data.event === 'object' && !Array.isArray(data.event)) {
    events = [data.event];
  }

  for (const event of events) {
    const ref = `event id="${event.id || 'MISSING'}"`;

    // Scan free-text fields for injection patterns and length violations.
    for (const field of TEXT_FIELDS) {
      const val = event[field];
      if (val === null || val === undefined) continue;
      const str = String(val);

      if (MAX_LENGTHS[field] && str.length > MAX_LENGTHS[field]) {
        findings.push(`${ref}: field "${field}" exceeds max length of ${MAX_LENGTHS[field]} (got ${str.length})`);
      }

      for (const { re, label } of INJECTION_PATTERNS) {
        if (re.test(str)) {
          findings.push(`${ref}: field "${field}" contains suspicious pattern: ${label}`);
        }
      }
    }

    // Link field: must be http:// or https:// when non-empty, and within length limit.
    if (event.link !== null && event.link !== undefined) {
      const link = String(event.link).trim();
      if (link.length > 0) {
        if (link.length > MAX_LENGTHS.link) {
          findings.push(`${ref}: link exceeds max length of ${MAX_LENGTHS.link} (got ${link.length})`);
        }
        if (!/^https?:\/\//i.test(link)) {
          findings.push(`${ref}: link must use http:// or https:// protocol, got: "${link.slice(0, 80)}"`);
        }
      }
    }
  }

  return findings.length === 0 ? { ok: true } : { ok: false, findings };
}

module.exports = { scanYaml };

// ── CLI entry point ───────────────────────────────────────────────────────────

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node source/scripts/check-yaml-security.js <path-to-yaml>');
    process.exit(1);
  }

  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(1);
  }

  let content;
  try {
    content = fs.readFileSync(abs, 'utf8');
  } catch (e) {
    console.error(`Cannot read file: ${e.message}`);
    process.exit(1);
  }

  const { ok, findings } = scanYaml(content);
  if (!ok) {
    for (const f of findings) console.error(f);
    process.exit(1);
  }

  const data = yaml.load(content);
  const count = Array.isArray(data && data.events)
    ? data.events.length
    : (data && data.event ? 1 : 0);
  console.log(`OK: ${count} events passed security scan in ${filePath}`);
}
