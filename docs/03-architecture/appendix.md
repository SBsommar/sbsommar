---
title: "SB Sommar – Architecture: Appendix"
---

# SB Sommar – Architecture: Appendix

Trailing sections from the original architecture document: decisions deliberately rejected, and the design philosophy that frames the system. Both `§10` and `§11` here are out of numerical order with the rest of the document and `§11` is a duplicate heading (the other `§11` is "Event Data CI Pipeline" in [`ci-and-deploy.md`](./ci-and-deploy.md)). These irregularities are preserved as-is — the section IDs are stable strings, not encoded positions.

Part of [the architecture index](./index.md).

---

## 10. Decided Against

Decisions evaluated and deliberately rejected. Kept here so they are not re-proposed.

| Decision | Reason | Date |
| --- | --- | --- |
| CSS/JS minification | Total CSS+JS is ~22 KB; server gzips text assets, so actual transfer savings would be ~3–5 KB. Images (~1.7 MB) are the real payload. Build complexity not justified. | 2026-02 |
| Docs site: own layout + own CSS (drop the Primer theme) | GitHub Pages' default `jekyll-theme-primer` already gives every page chrome, a max-width container, sans-serif typography, syntax highlighting, and the robots meta. Replacing it would re-implement all of that and own all styling for no gain. Extending Primer with a shadow layout plus nav includes (arch §34) is the smaller change. | 2026-06 |
| Docs site: `just-the-docs` theme | Provides a sidebar tree and client-side search out of the box, but builds its navigation from per-file `parent`/`nav_order` front-matter — per-file hand-maintenance that conflicts with 02-§97.29's single-source listing — and restyles the whole site. Overkill at the current document count; revisit if the docs grow past ~30 files. | 2026-06 |
| Docs site: do nothing | Leaves the genuine gaps unaddressed: no breadcrumb, no within-family navigation, and two `<h1>` elements per page. | 2026-06 |

---

## 11. Design Philosophy

- YAML is the database
- Git is the archive
- Simplicity over cleverness
- One clear data contract
- No hidden state

The system must remain:

- Predictable
- Minimal
- Maintainable
