'use strict';

const path = require('path');
const { Marked } = require('marked');
const { pageNav, pageFooter } = require('./layout');
const { toDateString, escapeHtml } = require('./utils');
const { goatcounterScript } = require('./analytics');
const { pwaHeadTags } = require('./pwa');
const { getImageDimensions } = require('./image-dimensions');

// EDQ Hub has no brand image asset in the repo, so its icon is an inline SVG:
// a circular navy badge with a white "hub" glyph (central node linked to three
// satellite nodes) signalling a community hub. Sized and shaped to match the
// raster Discord/Facebook icons in the hero header. Shared by the hero social
// icon and the community banner so the markup is defined once.
const EDQHUB_ICON = '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true">'
  + '<circle cx="16" cy="16" r="16" fill="#192A3D"/>'
  + '<g stroke="#FFFFFF" stroke-width="1.6"><line x1="16" y1="16" x2="16" y2="8"/><line x1="16" y1="16" x2="9" y2="22"/><line x1="16" y1="16" x2="23" y2="22"/></g>'
  + '<g fill="#FFFFFF"><circle cx="16" cy="16" r="3.2"/><circle cx="16" cy="8" r="2.4"/><circle cx="9" cy="22" r="2.4"/><circle cx="23" cy="22" r="2.4"/></g>'
  + '</svg>';

/**
 * marked link renderer override. External http(s) links open in a new tab
 * with rel="noopener noreferrer", matching how the hero, registration CTA,
 * event and calendar links behave. Internal and in-page anchor links (e.g.
 * #mat, #service) return false so marked's default renderer handles them and
 * they stay in the same tab. Used as a method, so `this` is the renderer
 * instance and `this.parser` is available.
 */
function renderLink({ href, title, tokens }) {
  if (!/^https?:\/\//i.test(href)) return false;
  let cleanHref;
  try {
    cleanHref = encodeURI(href).replace(/%25/g, '%');
  } catch {
    return false;
  }
  const text = this.parser.parseInline(tokens);
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
  return `<a href="${cleanHref}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
}

/**
 * Converts inline Markdown (images, links, bold) to HTML using marked.
 * Content files are author-controlled so no HTML escaping is applied.
 */
function inlineHtml(text, contentDir) {
  const md = new Marked();
  md.use({
    renderer: {
      link: renderLink,
      image({ href, text: alt }) {
        const dimAttrs = resolveDimAttrs(href, contentDir);
        return `<img src="${href}" alt="${alt || ''}" class="content-img"${dimAttrs} loading="lazy">`;
      },
    },
  });
  return md.parseInline(text);
}

/**
 * Resolves width/height attributes for an image href relative to contentDir.
 * Returns a string like ' width="800" height="600"' or '' if unavailable.
 */
function resolveDimAttrs(href, contentDir) {
  if (!contentDir || !href) return '';
  const absPath = path.join(contentDir, href);
  const dims = getImageDimensions(absPath);
  if (!dims) return '';
  return ` width="${dims.width}" height="${dims.height}"`;
}

/**
 * Finds the first image in a markdown string, removes it, and returns both.
 * Used to hoist the hero image out of the body content.
 */
function extractHeroImage(md) {
  const match = md.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  if (!match) return { heroSrc: null, heroAlt: null, md };
  const remaining = md
    .replace(match[0], '')
    .replace(/\n{3,}/g, '\n\n')
    .trimStart();
  return { heroSrc: match[2], heroAlt: match[1], md: remaining };
}

/**
 * Extracts the text of the first # heading in a markdown string.
 */
function extractH1(md) {
  const match = md.match(/^# (.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Creates a configured Marked instance with heading offset and image class.
 */
function createMarked(headingOffset, contentDir) {
  const md = new Marked();
  md.use({
    renderer: {
      link: renderLink,
      heading({ tokens, depth }) {
        const level = Math.min(depth + headingOffset, 6);
        const text = this.parser.parseInline(tokens);
        return `<h${level}>${text}</h${level}>\n`;
      },
      image({ href, text: alt }) {
        const dimAttrs = resolveDimAttrs(href, contentDir);
        return `<img src="${href}" alt="${alt || ''}" class="content-img"${dimAttrs} loading="lazy">`;
      },
    },
  });
  return md;
}

/**
 * Converts Markdown to HTML using the marked library.
 *
 * headingOffset shifts all heading levels down (pass 1 for non-primary sections).
 *
 * collapsible: when true, wraps each ##-level section in
 * <details class="accordion"><summary>…</summary>…</details>.
 * Closed by default. Add `collapsible: true` in sections.yaml to enable.
 */
function convertMarkdown(input, headingOffset = 0, collapsible = false, contentDir = null) {
  if (!input || !input.trim()) return '';

  const md = createMarked(headingOffset, contentDir);
  const html = md.parse(input).trim();

  if (!collapsible) return html;

  // Post-process: split on the ## heading level (after offset) to build accordions.
  const splitLevel = 2 + headingOffset;
  const splitTag = `<h${splitLevel}>`;
  const splitCloseTag = `</h${splitLevel}>`;

  // Split the HTML into segments at the target heading level.
  const escapedTag = splitTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = html.split(new RegExp(`(?=${escapedTag})`));

  if (parts.length <= 1) return html;

  return parts
    .map((part) => {
      if (!part.startsWith(splitTag)) return part;

      // Extract the summary text from the heading.
      const headingEnd = part.indexOf(splitCloseTag);
      const summaryHtml = part.slice(splitTag.length, headingEnd);
      const body = part.slice(headingEnd + splitCloseTag.length).trim();

      const indented = body.split('\n').map((l) => (l ? '    ' + l : '')).join('\n');
      return [
        '<details class="accordion">',
        `  <summary>${summaryHtml}</summary>`,
        '  <div class="accordion-body">',
        indented,
        '  </div>',
        '</details>',
      ].join('\n');
    })
    .join('\n');
}

/**
 * Renders the full index.html.
 *
 * @param {object} opts
 * @param {string|null} opts.heroSrc  - path to hero image
 * @param {string|null} opts.heroAlt  - alt text for hero image
 * @param {string|null} opts.discordUrl  - URL for Discord link
 * @param {string|null} opts.facebookUrl - URL for Facebook link
 * @param {string|null} opts.edqhubUrl   - URL for EDQ Hub community-app link
 * @param {string|null} opts.countdownTarget - YYYY-MM-DD date for countdown
 * @param {string|null} opts.opensForEditing - YYYY-MM-DD first editing date
 * @param {string|null} opts.editingCloses  - YYYY-MM-DD last editing date (end_date + 1)
 * @param {Array<{id: string, navLabel: string, html: string}>} opts.sections
 * @param {Array<{id: string, name: string, registrationOpens: string, registrationCloses: string}>} [opts.registrationCamps]
 */
function renderIndexPage({ heroSrc, heroAlt, heroDims, sections, discordUrl, facebookUrl, edqhubUrl, countdownTarget, opensForEditing, editingCloses, registrationCamps }, footerHtml = '', navSections = [], goatcounterCode = '') {
  const countdownHtml = countdownTarget
    ? `<div class="hero-countdown" data-target="${countdownTarget}">\n        <span class="hero-countdown-number">00</span>\n        <span class="hero-countdown-label">Dagar kvar</span>\n      </div>`
    : '';

  const socialLinks = (discordUrl || facebookUrl || edqhubUrl)
    ? `\n    <div class="hero-social">${
      discordUrl ? `\n      <a href="${discordUrl}" class="hero-social-link" target="_blank" rel="noopener noreferrer" data-goatcounter-click="click-discord">\n        <img src="images/discord-ikon.webp" alt="Discord" width="32" height="32">\n      </a>` : ''
    }${
      facebookUrl ? `\n      <a href="${facebookUrl}" class="hero-social-link" target="_blank" rel="noopener noreferrer" data-goatcounter-click="click-facebook">\n        <img src="images/facebook-ikon.webp" alt="Facebook" width="32" height="32">\n      </a>` : ''
    }${
      edqhubUrl ? `\n      <a href="${edqhubUrl}" class="hero-social-link" target="_blank" rel="noopener noreferrer" aria-label="EDQ Hub" data-goatcounter-click="click-edqhub">\n        ${EDQHUB_ICON}\n      </a>` : ''
    }\n    </div>`
    : '';

  const heroDimAttrs = heroDims ? ` width="${heroDims.width}" height="${heroDims.height}"` : '';

  const actionButtonsHtml = (opensForEditing && editingCloses)
    ? `\n    <div class="hero-actions" hidden data-opens="${opensForEditing}" data-closes="${editingCloses}">\n      <a href="idag.html" class="hero-actions-btn">Idag</a>\n      <a href="schema.html" class="hero-actions-btn">Schema</a>\n      <a href="lagg-till.html" class="hero-actions-btn">Lägg till</a>\n    </div>`
    : '';

  const hubBannerHtml = renderHubBannerHtml(edqhubUrl);
  const registrationBannersHtml = renderRegistrationBannersHtml(registrationCamps);

  const heroHtml = heroSrc
    ? `\n  <div class="hero">\n    <div class="hero-header">\n      <h1 class="hero-title">Sommarläger i Sysslebäck</h1>${socialLinks}\n    </div>\n    <img src="${heroSrc}" alt="${heroAlt || ''}" class="hero-img"${heroDimAttrs} fetchpriority="high">${actionButtonsHtml}${hubBannerHtml}${registrationBannersHtml}\n  </div>`
    : '';

  const contentSections = sections
    .map((s, i) => {
      // First section is above the fold — don't lazy-load its images
      // (the RFSB logo there is the LCP element on mobile).
      let sectionHtml = i === 0
        ? s.html.replace(/ loading="lazy"/g, '')
        : s.html;

      // Inject countdown next to the upcoming camps list in the first section
      if (i === 0 && countdownHtml) {
        if (sectionHtml.includes('upcoming-camps')) {
          sectionHtml = sectionHtml.replace(
            /(<ul class="upcoming-camps">[\s\S]*?<\/ul>\s*<script>[\s\S]*?<\/script>)/,
            `<div class="camps-row">$1\n      ${countdownHtml}\n</div>`,
          );
        } else {
          sectionHtml = countdownHtml + '\n' + sectionHtml;
        }
      }

      // Wrap testimonial cards for the röster section
      if (s.id === 'roster') {
        sectionHtml = wrapTestimonialCards(sectionHtml);
      }

      // Inject the registration CTA button into the anmälan section (02-§94.15)
      if (s.id === 'anmalan') {
        sectionHtml = injectRegistrationCta(sectionHtml);
      }

      const inner = sectionHtml
        .split('\n')
        .map((l) => (l ? '      ' + l : ''))
        .join('\n');
      const classes = [];
      if (i === 0) classes.push('section-first');
      if (i > 0 && i % 2 === 1) classes.push('section-alt');
      const cls = classes.length ? ` class="${classes.join(' ')}"` : '';
      return `    <section id="${s.id}"${cls}>\n${inner}\n    </section>`;
    })
    .join('\n\n');

  const preloadHtml = heroSrc
    ? `\n  <link rel="preload" as="image" href="${heroSrc}">`
    : '';

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>SB Sommar</title>
  <link rel="stylesheet" href="style.css">${preloadHtml}
  <link rel="icon" type="image/png" href="images/sbsommar-icon-192.png">
${pwaHeadTags()}
</head>
<body>
${pageNav('index.html', navSections)}
<main>${heroHtml}
  <div class="content">
${contentSections}
  </div>
</main>
  <script src="nav.js" defer></script>
  <script src="feedback.js" defer></script>${countdownTarget ? `
  <script>
  (function () {
    var el = document.querySelector('.hero-countdown[data-target]');
    if (!el) return;
    var target = el.getAttribute('data-target');
    var p = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    var today = p.find(function (x) { return x.type === 'year'; }).value + '-' + p.find(function (x) { return x.type === 'month'; }).value + '-' + p.find(function (x) { return x.type === 'day'; }).value;
    var diff = Math.ceil((new Date(target + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);
    if (diff < 0) { el.hidden = true; return; }
    el.querySelector('.hero-countdown-number').textContent = diff < 10 ? '0' + diff : String(diff);
  })();
  </script>` : ''}${(opensForEditing && editingCloses) ? `
  <script>
  (function () {
    var el = document.querySelector('.hero-actions[data-opens]');
    if (!el) return;
    var opens = el.getAttribute('data-opens');
    var closes = el.getAttribute('data-closes');
    var p = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    var today = p.find(function (x) { return x.type === 'year'; }).value + '-' + p.find(function (x) { return x.type === 'month'; }).value + '-' + p.find(function (x) { return x.type === 'day'; }).value;
    if (today >= opens && today <= closes) el.removeAttribute('hidden');
  })();
  </script>` : ''}${(registrationCamps && registrationCamps.length > 0) ? `
  <script>
  (function () {
    var banners = document.querySelectorAll('.hero-registration-banner[data-opens]');
    if (!banners.length) return;
    var p = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    var today = p.find(function (x) { return x.type === 'year'; }).value + '-' + p.find(function (x) { return x.type === 'month'; }).value + '-' + p.find(function (x) { return x.type === 'day'; }).value;
    banners.forEach(function (el) {
      var opens = el.getAttribute('data-opens');
      var closes = el.getAttribute('data-closes');
      if (today >= opens && today <= closes) el.removeAttribute('hidden');
    });
  })();
  </script>` : ''}
  <script src="sw-register.js" defer></script>
  <script src="pwa-install.js" defer></script>
  <script src="admin.js" defer></script>${goatcounterScript(goatcounterCode)}
${pageFooter(footerHtml)}
</body>
</html>
`;
}

const MONTHS_SV_SHORT = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];

const MONTHS_SV_LONG = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

function formatShortDate(dateStr) {
  const d = new Date(toDateString(dateStr) + 'T12:00:00');
  return `${d.getDate()} ${MONTHS_SV_SHORT[d.getMonth()]}`;
}

function formatLongSvDate(dateStr) {
  const d = new Date(toDateString(dateStr) + 'T12:00:00');
  return `${d.getDate()} ${MONTHS_SV_LONG[d.getMonth()]}`;
}

function formatCampDateRange(startStr, endStr) {
  const end = new Date(toDateString(endStr) + 'T12:00:00');
  return `${formatShortDate(startStr)} – ${formatShortDate(endStr)} ${end.getFullYear()}`;
}

/**
 * Renders the "Kommande läger" section HTML from camps.yaml data.
 *
 * @param {Array} allCamps  - full camps array from camps.yaml
 * @param {number} currentYear - the year to use for filtering (e.g. 2026)
 * @returns {string} HTML string, or empty string if no camps match
 */
function renderUpcomingCampsHtml(allCamps, currentYear) {
  const camps = allCamps
    .filter((c) => {
      if (c.archived !== true) return true;
      const year = new Date(toDateString(c.start_date) + 'T12:00:00').getFullYear();
      return year === currentYear;
    })
    .sort((a, b) => toDateString(a.start_date).localeCompare(toDateString(b.start_date)));

  if (camps.length === 0) return '';

  const items = camps.map((camp) => {
    const name = escapeHtml(camp.name || '');
    const location = escapeHtml(camp.location || '');
    const dateRange = escapeHtml(formatCampDateRange(camp.start_date, camp.end_date));
    const endDate = toDateString(camp.end_date);
    return `    <li class="camp-item" data-end="${endDate}">
      <span class="camp-icon" aria-hidden="true"></span>
      <span class="camp-name">${name}</span>
      <span class="camp-meta">${location} · ${dateRange}</span>
    </li>`;
  }).join('\n');

  return `<ul class="upcoming-camps">
${items}
</ul>
<script>
(function () {
  var p = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  var today = p.find(function (x) { return x.type === 'year'; }).value + '-' + p.find(function (x) { return x.type === 'month'; }).value + '-' + p.find(function (x) { return x.type === 'day'; }).value;
  document.querySelectorAll('.camp-item[data-end]').forEach(function (el) {
    if (el.getAttribute('data-end') < today) el.classList.add('camp-past');
  });
})();
</script>`;
}

/**
 * Renders location data from local.yaml as individual accordion items.
 *
 * @param {Array<{id: string, name: string, information: string, image_path: string|string[]}>} locations
 * @returns {string} HTML string of accordion elements
 */
function renderLocationAccordions(locations, contentDir) {
  if (!locations || locations.length === 0) return '';

  return locations.map((loc) => {
    const name = escapeHtml(loc.name || '');
    const info = (loc.information || '').trim();
    const paths = Array.isArray(loc.image_path)
      ? loc.image_path.filter((p) => p)
      : (loc.image_path ? [loc.image_path] : []);

    const bodyParts = [];
    if (info) {
      bodyParts.push(`<p>${inlineHtml(info, contentDir)}</p>`);
    }
    for (const imgPath of paths) {
      const dimAttrs = resolveDimAttrs(imgPath, contentDir);
      bodyParts.push(`<img src="${escapeHtml(imgPath)}" alt="${name}" class="content-img"${dimAttrs} loading="lazy">`);
    }

    const bodyHtml = bodyParts.length > 0
      ? bodyParts.map((l) => '    ' + l).join('\n')
      : '';

    return [
      '<details class="accordion">',
      `  <summary>${name}</summary>`,
      '  <div class="accordion-body">',
      bodyHtml,
      '  </div>',
      '</details>',
    ].join('\n');
  }).join('\n');
}

/**
 * Post-processes testimonial section HTML: wraps each h3 + image + blockquote
 * group in a `.testimonial-card` div with a header row (circular image + name).
 *
 * Expects HTML produced by convertMarkdown with headingOffset=1, where ## in
 * the markdown becomes <h3>. Content before the first <h3> (e.g. the section
 * heading) is preserved outside cards.
 *
 * @param {string} html - HTML string from convertMarkdown
 * @returns {string} HTML with testimonial cards wrapped
 */
function wrapTestimonialCards(html) {
  const parts = html.split(/(?=<h3>)/);
  if (parts.length <= 1) return html;

  return parts.map((part) => {
    if (!part.startsWith('<h3>')) return part;

    // Extract name from <h3>Name</h3>
    const nameMatch = part.match(/<h3>(.*?)<\/h3>/);
    const name = nameMatch ? nameMatch[1] : '';

    // Extract image src and alt from <img ... class="content-img" ...>
    const imgMatch = part.match(/<img\s[^>]*?src="([^"]*)"[^>]*>/);
    const imgSrc = imgMatch ? imgMatch[1] : '';
    const imgAlt = name;

    // Remove the original h3, the paragraph containing the image, and rebuild
    let body = part;
    // Remove the <p><img ...></p> block (image paragraph)
    body = body.replace(/<p>\s*<img\s[^>]*class="content-img"[^>]*>\s*<\/p>\n?/, '');

    // Build the card
    const header = imgSrc
      ? `<div class="testimonial-header">\n<img src="${imgSrc}" alt="${imgAlt}" class="testimonial-img" width="60" height="60">\n<h3>${name}</h3>\n</div>`
      : `<div class="testimonial-header">\n<h3>${name}</h3>\n</div>`;

    // Remove the original <h3>...</h3> from body since we placed it in the header
    body = body.replace(/<h3>.*?<\/h3>\n?/, '');

    return `<div class="testimonial-card">\n${header}\n${body.trim()}\n</div>`;
  }).join('\n');
}

// ── EDQ Hub community banner (02-§121) ──────────────────────────────────────

/**
 * Renders the EDQ Hub community banner — a single, always-visible filled green
 * card in the hero inviting visitors to join the camp's EDQ Hub. Returns an
 * empty string when `edqhubUrl` is absent so no banner is emitted. Unlike the
 * registration banners it is not date-gated, so no `hidden` attribute and no
 * inline visibility script are involved.
 *
 * @param {string} edqhubUrl - the EDQ Hub join URL (defined in build code)
 * @returns {string} the banner anchor markup, or '' when no URL is given
 */
function renderHubBannerHtml(edqhubUrl) {
  if (!edqhubUrl) return '';

  return `\n    <a href="${edqhubUrl}" class="hero-hub-banner" target="_blank" rel="noopener noreferrer" data-goatcounter-click="click-hub-banner">
      <span class="hero-hub-banner-icon">${EDQHUB_ICON}</span>
      <span class="hero-hub-banner-text">
        <span class="hero-hub-banner-title">All info om lägret – på ett ställe</span>
        <span class="hero-hub-banner-meta">Vi flyttar från Facebook till EDQ Hub. Här finns schema, nyheter och kontakt före och under lägret.</span>
        <span class="hero-hub-banner-btn">Gå med <span aria-hidden="true">→</span></span>
      </span>
    </a>`;
}

// ── Registration banner and CTA (02-§94) ────────────────────────────────────

const REGISTRATION_URL = 'https://boka.sbsommar.se';

/**
 * Renders the hero registration banners — one per camp with an active
 * registration window. Returns an empty string when `registrationCamps` is
 * absent or empty so no container is emitted.
 *
 * @param {Array<{id: string, name: string, registrationOpens: string, registrationCloses: string}>} registrationCamps
 */
function renderRegistrationBannersHtml(registrationCamps) {
  if (!registrationCamps || registrationCamps.length === 0) return '';

  const items = registrationCamps.map((c) => {
    const lastLabel = escapeHtml(c.lastRegistrationLabel || formatLongSvDate(c.registrationCloses));
    const id = escapeHtml(c.id);
    const name = escapeHtml(c.name);
    return `      <a href="#anmalan" class="hero-registration-banner" hidden data-opens="${c.registrationOpens}" data-closes="${c.registrationCloses}" data-goatcounter-click="click-register-banner-${id}">
        <span class="hero-registration-banner-title">Anmälan till ${name} är öppen</span>
        <span class="hero-registration-banner-meta">Sista anmälningsdag ${lastLabel}</span>
      </a>`;
  }).join('\n');

  return `\n    <div class="hero-registration-banners">\n${items}\n    </div>`;
}

/**
 * Injects the "Anmäl er här" CTA button into the `anmalan` section HTML.
 * The CTA is inserted immediately after the first heading so that on desktop
 * the `float: right` layout lets the following paragraph text flow around it.
 * On mobile the CTA styling (07-§6.101) sets `float: none` and full width.
 *
 * @param {string} sectionHtml - rendered HTML of the anmälan section body
 * @returns {string} the section HTML with the CTA injected
 */
function injectRegistrationCta(sectionHtml) {
  const cta = `<div class="registration-cta">\n  <a href="${REGISTRATION_URL}" class="btn-primary registration-cta-btn" target="_blank" rel="noopener noreferrer" data-goatcounter-click="click-register-section">Anmäl er här</a>\n</div>`;

  const headingMatch = sectionHtml.match(/<\/h[1-6]>\s*/);
  if (!headingMatch) {
    return cta + '\n' + sectionHtml;
  }
  const insertPoint = headingMatch.index + headingMatch[0].length;
  return sectionHtml.slice(0, insertPoint) + cta + '\n' + sectionHtml.slice(insertPoint);
}

module.exports = { renderIndexPage, convertMarkdown, extractHeroImage, extractH1, renderUpcomingCampsHtml, renderLocationAccordions, wrapTestimonialCards, renderRegistrationBannersHtml, injectRegistrationCta, formatLongSvDate, REGISTRATION_URL };
