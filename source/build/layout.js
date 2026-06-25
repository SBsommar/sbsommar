'use strict';

/**
 * Generates the shared <nav class="page-nav"> HTML.
 *
 * Renders two tiers:
 *   1. Page links – the five main site pages, with the current page marked active.
 *   2. Section links – anchor links to index page sections (only when navSections
 *      is non-empty). On non-index pages these point to index.html#id; on the
 *      index page they use bare anchors (#id).
 *
 * A hamburger <button class="nav-toggle"> is included for mobile; CSS hides it
 * on wide viewports. The toggle state is managed by nav.js.
 *
 * @param {string}   activeHref   - href of the currently active page, e.g. 'schema.html'
 * @param {Array<{id: string, navLabel: string}>} [navSections=[]]
 *   - sections to render as anchor links; defaults to [] (no section row)
 */
// Module-level config — set by build.js before rendering.
let _feedbackUrl = '';
function setFeedbackUrl(url) { _feedbackUrl = url || ''; }

function pageNav(activeHref, navSections = []) {
  const pageLinks = [
    { href: 'index.html',     label: 'Hem',        menuLabel: 'Hem' },
    { href: 'schema.html',    label: 'Schema',     menuLabel: 'Lägrets schema' },
    { href: 'idag.html',      label: 'Idag',       menuLabel: 'Dagens aktiviteter' },
    { href: 'lagg-till.html', label: 'Lägg till',  menuLabel: 'Lägg till aktivitet' },
    { href: 'arkiv.html',     label: 'Arkiv',      menuLabel: 'Lägerarkiv' },
  ];

  const pageItems = pageLinks
    .map(({ href, label, menuLabel }) => {
      const active = href === activeHref ? ' active' : '';
      return `      <a class="nav-link${active}" href="${href}"><span class="nav-label-short">${label}</span><span class="nav-label-long">${menuLabel}</span></a>`;
    })
    .join('\n');

  const onIndex = activeHref === 'index.html';
  let sectionRow = '';
  if (navSections.length > 0) {
    const sectionItems = navSections
      .map(({ id, navLabel }) => {
        const href = onIndex ? `#${id}` : `index.html#${id}`;
        return `      <a class="nav-link nav-link--section" href="${href}">${navLabel}</a>`;
      })
      .join('\n');
    sectionRow = `\n    <div class="nav-sections">\n${sectionItems}\n    </div>`;
  }

  const fbUrlAttr = _feedbackUrl ? ` data-api-url="${_feedbackUrl}"` : '';
  const feedbackBtn = `    <button type="button" class="feedback-btn" aria-label="Ge feedback"${fbUrlAttr}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>`;

  // Quick-add activity button — a one-tap link to the add-activity page in the
  // sticky nav. Omitted on the add page itself, where it would be redundant.
  const quickAddBtn = activeHref === 'lagg-till.html'
    ? ''
    : `    <a class="quick-add-btn" href="lagg-till.html" aria-label="Lägg till aktivitet">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </a>\n`;

  // Edit-shortcut button — a one-tap link to the edit page, shown beside the
  // hamburger menu button. Rendered hidden; nav.js reveals it only for visitors
  // who own an upcoming activity (admin token is deliberately ignored).
  // Omitted on the edit page itself, where it would be redundant.
  const editShortcutBtn = activeHref === 'redigera.html'
    ? ''
    : `    <a class="edit-shortcut-btn" href="redigera.html" aria-label="Redigera mina aktiviteter" hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>
      </svg>
    </a>\n`;

  const installBtn = `    <button type="button" class="pwa-install-btn" aria-label="Installera appen" hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </button>`;

  return `  <div class="site-content">
  <nav class="page-nav" aria-label="Sidnavigation">
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Öppna meny">
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
    </button>
${editShortcutBtn}    <button type="button" class="scroll-top" aria-label="Till toppen" hidden>&#x2B06;</button>
${quickAddBtn}${installBtn}
${feedbackBtn}
    <div class="nav-menu" id="nav-menu">
      <div class="nav-pages">
${pageItems}
      </div>${sectionRow}
    </div>
  </nav>`;
}

/**
 * Wraps pre-converted footer HTML in a <footer> element.
 * Returns an empty string when footerHtml is empty (file missing fallback).
 *
 * @param {string} footerHtml - HTML produced by convertMarkdown from footer.md
 */
function pageFooter(footerHtml) {
  const trimmed = (footerHtml || '').trim();
  if (!trimmed) return '';
  return `  </div>\n  <footer class="site-footer">\n<div class="site-footer__inner">\n${trimmed}\n</div>\n  </footer>`;
}

module.exports = { pageNav, pageFooter, setFeedbackUrl };
