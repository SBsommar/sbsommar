'use strict';

/**
 * Splits the single authoritative stylesheet into two delivered bundles so the
 * display board (`live.html`) can load only the CSS it actually uses.
 *
 * There is ONE source of truth: `source/assets/cs/style.css`. Contributors edit
 * that one file (and lint/tests read it whole). At build time this module splits
 * it, by top-level section header, into:
 *
 *   - the **live bundle** (`public/style.css`) — base tokens/reset/typography
 *     plus the schedule/display sections. `live.html` loads only this.
 *   - the **site bundle** (`public/site.css`) — everything else (site chrome,
 *     forms, modals, content pages, admin, …). Every page that has the site
 *     header/footer loads BOTH bundles, in order (live first, then site), so the
 *     full cascade is identical to the original single file.
 *
 * Section ownership is decided by the header title. Only the sections listed in
 * LIVE_SECTION_TITLES (plus the base block before the first header) go to the
 * live bundle; every other section defaults to the site bundle. That default is
 * the safe one: a new section reaches every ordinary page via the site bundle,
 * and the only page that would miss it is the passive display board — which
 * rarely needs new CSS, and whose sections are added here explicitly.
 *
 * A section header looks like `/* ── Title ── * /` (single line) or opens a
 * multi-line block `/* ── Title ────…` that closes a few lines later. The title
 * is the text between the leading and trailing box-drawing dashes.
 */

// Sections that the display board (live.html) needs. Keep this in sync with the
// schedule/display CSS; see docs/07-design/css-strategy.md.
const LIVE_SECTION_TITLES = new Set([
  'Today page',
  'Today card (live / display view)',
  'Display mode (live.html dark theme for screens)',
  'Dagens schema two-column layout',
  'Sidebar heading (day + date, replaces full-width h1)',
  'Display mode status bar (live clock + last-updated)',
  'Event rows',
  'Cancelled activities (02-§118)',
  'Location clashes (02-§120)',
  'Moved activities (02-§119)',
]);

// Matches a section-header start line and captures its title. The header style
// is `/* ── Title ──…`; ordinary explanatory comments (which start `/* Word…`,
// not `/* ──`) never match, so they stay inside their section.
const SECTION_HEADER_RE = /^\s*\/\*\s*─+\s*(.+?)\s*─/;

/**
 * @param {string} source - full contents of source/assets/cs/style.css
 * @returns {{ live: string, site: string, titles: string[] }}
 *   live/site bundle text and the list of section titles found (for validation).
 */
function splitCss(source) {
  const lines = source.split('\n');
  const liveLines = [];
  const siteLines = [];
  const titles = [];

  // The block before the first section header is base tokens/reset/typography;
  // it belongs in the live bundle (every page gets it — site-bundle pages load
  // the live bundle too).
  let target = liveLines;

  for (const line of lines) {
    const m = SECTION_HEADER_RE.exec(line);
    if (m) {
      const title = m[1];
      titles.push(title);
      target = LIVE_SECTION_TITLES.has(title) ? liveLines : siteLines;
    }
    target.push(line);
  }

  return {
    live: liveLines.join('\n'),
    site: siteLines.join('\n'),
    titles,
  };
}

module.exports = { splitCss, LIVE_SECTION_TITLES, SECTION_HEADER_RE };
