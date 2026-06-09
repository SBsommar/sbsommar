# SB Sommar – Architecture Overview

This project is a static, YAML-driven camp platform with a small API server for live event submissions. Two API implementations exist: a Node.js version (`app.js`) for local development and Node.js-capable hosts, and a PHP version (`api/`) for shared hosting environments (e.g. Loopia) that do not support Node.js.

The system is intentionally simple:

- No database
- No CMS
- No server-side rendering — HTML is generated at build time
- Git is the archive

Architecture is split across topic files for readability. Section IDs (`03-§N.M`) are stable strings cited from source code, tests, and `99-traceability/` — the ID does not encode the file path, so a section can be moved between files without breaking references.

---

## Contents

| File | Topic | Sections |
| ---- | ----- | -------- |
| [`data-layer.md`](./data-layer.md) | Data Layer | §1, §2, §3, §4, §4a, §4b, §4c |
| [`rendering.md`](./rendering.md) | Rendering | §5, §6, §17, §18 |
| [`forms-and-api.md`](./forms-and-api.md) | Forms and API | §7, §7a, §7b, §8, §9, §13, §29 |
| [`ci-and-deploy.md`](./ci-and-deploy.md) | CI and Deploy | §11 (Event Data CI), §19, §20, §21, §27 |
| [`pages-and-content.md`](./pages-and-content.md) | Pages and Content | §12, §14, §15, §16, §22, §23, §24, §25, §26, §32 |
| [`platform-and-security.md`](./platform-and-security.md) | Platform and Security | §28, §30, §31, §33 |
| [`appendix.md`](./appendix.md) | Appendix | §10, §11 (Design Philosophy) |

Looking for `03-§N`? Search this directory: `grep -l '## N\.' docs/03-architecture/*.md` finds the file that owns the section. Two `§11` headings exist (a pre-existing irregularity, preserved during the split): "Event Data CI Pipeline" lives in `ci-and-deploy.md`, "Design Philosophy" lives in `appendix.md`.
