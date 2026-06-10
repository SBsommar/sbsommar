'use strict';

// js-yaml may parse unquoted YYYY-MM-DD values as Date objects.
function toDateString(val) {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Swedish weekday + date formatting without locale dependency
const WEEKDAYS_SV = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const MONTHS_SV = [
  'januari',
  'februari',
  'mars',
  'april',
  'maj',
  'juni',
  'juli',
  'augusti',
  'september',
  'oktober',
  'november',
  'december',
];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const weekday = WEEKDAYS_SV[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_SV[d.getMonth()];
  const year = d.getFullYear();
  return `${weekday} ${day} ${month} ${year}`;
}

const WEEKDAYS_SHORT_SV = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];

/**
 * Generate an array of { isoDate, label } for each day in the range [start, end].
 * label = "Mån 28/7" style.
 */
function campDayButtons(startDate, endDate) {
  const days = [];
  const start = new Date(toDateString(startDate) + 'T12:00:00');
  const end = new Date(toDateString(endDate) + 'T12:00:00');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const weekday = WEEKDAYS_SHORT_SV[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    days.push({ isoDate: iso, label: `${weekday}<br>${day}/${month}` });
  }
  return days;
}

// Return the URL unchanged only when it is a safe http(s) link; otherwise ''.
// Defence-in-depth (02-§49.4, issue #385): the render layer must not emit a
// `javascript:`/`data:`/other-scheme URI into an href even if a value reached
// events.json without passing API/CI validation (e.g. legacy or hand-edited
// camp YAML). escapeHtml neutralises quotes but not the URL scheme.
function safeLinkHref(url) {
  if (url == null) return '';
  const s = String(url).trim();
  return /^https?:\/\//i.test(s) ? s : '';
}

// Inject the API origin into the CSP `connect-src` placeholder in the built
// `.htaccess` (#384). The static site and the API can be different origins —
// in production the API is a separate `api.` host (CORS + credentials are only
// needed cross-origin), so `connect-src 'self'` alone would block the form,
// feedback, edit/delete, and verify-admin `fetch()` calls. `'self'` already
// covers a same-origin (QA/local) API, so the placeholder resolves to empty
// when API_URL is unset or same-origin-redundant. After injection no
// `__API_ORIGIN__` token remains.
function injectHtaccessCsp(template, apiUrl) {
  let origin = '';
  if (apiUrl) {
    try {
      origin = new URL(apiUrl).origin;
    } catch {
      origin = '';
    }
  }
  return template.replace(/__API_ORIGIN__ ?/g, origin ? origin + ' ' : '');
}

module.exports = { toDateString, escapeHtml, formatDate, campDayButtons, safeLinkHref, injectHtaccessCsp };
