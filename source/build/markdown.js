'use strict';

const { Marked } = require('marked');
const { renderers } = require('../assets/js/client/markdown-renderers');

/**
 * Replaces regular hyphens with non-breaking hyphens (&#8209;) inside the
 * text content of tel: links so phone numbers don't line-break at the hyphen
 * and the html-validate tel-non-breaking rule passes.
 */
function fixTelHyphens(html) {
  return html.replace(
    /(<a\s[^>]*href="tel:[^"]*"[^>]*>)([^<]+)(<\/a>)/gi,
    (_, open, text, close) => open + text.replace(/-/g, '&#8209;') + close,
  );
}

/**
 * Removes trailing whitespace from every line of an HTML string.
 *
 * Event descriptions are free text: a participant can type a trailing space at
 * the end of a line, and a multi-paragraph description carries blank lines.
 * Marked preserves both, so the rendered HTML would contain trailing whitespace
 * that fails html-validate's `no-trailing-whitespace` rule (CL-§5.1). Stripping
 * it here — the single point every schedule, today, display, archive and
 * per-event page renders a description through — keeps every HTML output valid
 * regardless of what is stored in the event data.
 */
function stripTrailingWhitespace(html) {
  return html.replace(/[ \t]+$/gm, '');
}

/**
 * Converts a Markdown description string to sanitized HTML.
 *
 * Sanitization is performed by the marked renderer overrides defined in
 * `source/assets/js/client/markdown-renderers.js` (shared with the live
 * preview): raw HTML tokens are dropped at parse time and unsafe-scheme
 * URIs in links and images are neutralized. See 02-§56.6.
 *
 * @param {string|null} text - Markdown text
 * @returns {string} Sanitized HTML
 */
function renderDescriptionHtml(text) {
  if (!text || !text.trim()) return '';
  const md = new Marked({ renderer: renderers });
  const html = stripTrailingWhitespace(md.parse(text).trim());
  return fixTelHyphens(html);
}

/**
 * Strips Markdown syntax from text, returning plain text.
 * Used for RSS and iCal where HTML is not appropriate.
 *
 * @param {string|null} text - Markdown text
 * @returns {string} Plain text without Markdown syntax
 */
function stripMarkdown(text) {
  if (!text || !text.trim()) return '';
  return text
    // Remove images: ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove links: [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove heading markers: # ## ### etc.
    .replace(/^#{1,6}\s+/gm, '')
    // Remove unordered list markers: - or *
    .replace(/^[\s]*[-*]\s+/gm, '')
    // Remove ordered list markers: 1. 2. etc.
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquote markers
    .replace(/^>\s+/gm, '')
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { renderDescriptionHtml, stripMarkdown, stripTrailingWhitespace };
