'use strict';

const { toDateString } = require('./utils');
const { stripMarkdown } = require('./markdown');

/**
 * Escapes text for use in iCalendar content lines (RFC 5545 §3.3.11).
 * Backslashes, semicolons, and commas are escaped with a backslash prefix.
 * Newlines are encoded as literal \n.
 */
function escapeIcal(str) {
  if (str == null) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * IANA time zone for all camp times. Event data stores naive local times
 * (05-§4.5); the iCal export anchors them to this concrete zone so calendar
 * apps render the correct wall-clock time regardless of the device zone.
 */
const TZID = 'Europe/Stockholm';

/**
 * Formats a date string (YYYY-MM-DD) and time string (HH:MM) as an
 * iCalendar local datetime: YYYYMMDDTHHMMSS (no Z suffix). It is paired with
 * a TZID=Europe/Stockholm parameter on the DTSTART/DTEND property.
 */
function toIcalDatetime(dateStr, timeStr) {
  const d = toDateString(dateStr).replace(/-/g, '');
  const t = String(timeStr).replace(':', '') + '00';
  return `${d}T${t}`;
}

/**
 * Returns the VTIMEZONE component (RFC 5545 §3.6.5) defining Europe/Stockholm
 * with its EU CET/CEST daylight-saving rules. Embedded once per .ics file so
 * the TZID referenced by every DTSTART/DTEND resolves unambiguously.
 */
function buildVtimezone() {
  return [
    'BEGIN:VTIMEZONE',
    `TZID:${TZID}`,
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
  ].join('\r\n');
}

/**
 * Extracts the hostname from a URL string.
 */
function extractHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'sbsommar.se';
  }
}

/**
 * Builds the DESCRIPTION value for a VEVENT.
 * Format: "Ansvarig: {responsible}" followed by description if set.
 */
function buildDescription(event) {
  const parts = [`Ansvarig: ${event.responsible}`];
  if (event.description) {
    parts.push(stripMarkdown(event.description));
  }
  return parts.join('\n');
}

/**
 * Returns the current UTC time as an iCalendar DTSTAMP value (YYYYMMDDTHHMMSSZ).
 */
function buildDtstamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}`
       + `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
}

/**
 * Renders the VEVENT lines for a single event.
 */
function renderVevent(event, siteUrl) {
  const hostname = extractHostname(siteUrl);
  const lines = [
    'BEGIN:VEVENT',
    `DTSTART;TZID=${TZID}:${toIcalDatetime(event.date, event.start)}`,
  ];
  if (event.end) {
    lines.push(`DTEND;TZID=${TZID}:${toIcalDatetime(event.date, event.end)}`);
  }
  lines.push(
    `DTSTAMP:${buildDtstamp()}`,
    `SUMMARY:${escapeIcal(event.title)}`,
    `LOCATION:${escapeIcal(event.location)}`,
    `DESCRIPTION:${escapeIcal(buildDescription(event))}`,
    `URL:${siteUrl}/schema/${event.id}/`,
    `UID:${event.id}@${hostname}`,
    'END:VEVENT',
  );
  return lines.join('\r\n');
}

/**
 * Renders a single-event .ics file (VCALENDAR with one VEVENT).
 *
 * @param {object} event - Event object
 * @param {object} camp - Camp object
 * @param {string} siteUrl - Base URL
 * @returns {string} iCalendar string
 */
function renderEventIcal(event, camp, siteUrl) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SB Sommar//Schema//SV',
    `X-WR-CALNAME:${escapeIcal(camp.name)}`,
    'METHOD:PUBLISH',
    buildVtimezone(),
    renderVevent(event, siteUrl),
    'END:VCALENDAR',
    '',
  ];
  return lines.join('\r\n');
}

/**
 * Renders a full-camp .ics file (VCALENDAR with one VEVENT per event).
 *
 * @param {object} camp - Camp object
 * @param {Array}  events - Array of event objects
 * @param {string} siteUrl - Base URL
 * @returns {string} iCalendar string
 */
function renderIcalFeed(camp, events, siteUrl) {
  const vevents = events.map((e) => renderVevent(e, siteUrl)).join('\r\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SB Sommar//Schema//SV',
    `X-WR-CALNAME:Schema – ${escapeIcal(camp.name)}`,
    'METHOD:PUBLISH',
    buildVtimezone(),
  ];
  if (vevents) {
    lines.push(vevents);
  }
  lines.push('END:VCALENDAR', '');
  return lines.join('\r\n');
}

module.exports = { escapeIcal, renderEventIcal, renderIcalFeed };
