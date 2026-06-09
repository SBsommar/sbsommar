---
title: "Releasing to Production"
---

# Releasing to Production

How to deploy the site to production. This guide assumes your changes are
already merged to `main` and verified on QA.

For background on environments and secrets, see
[08-ENVIRONMENTS.md](08-ENVIRONMENTS.md).

---

## Before you start

- [ ] Your PR is merged to `main`.
- [ ] CI passed on the merge commit (check the Actions tab).
- [ ] QA deploy completed (the "Deploy to QA" workflow shows green).
- [ ] You have verified your changes on the QA site in a browser.

If any of these are not true, fix them first. Do not deploy broken code
to production.

---

## Step 1 — Verify QA

Open the QA site and check that:

- The pages you changed look correct.
- Any new functionality works as expected.
- The schedule, today view, and form are not broken.

This is a manual check. There is no automated QA gate beyond CI.

---

## Step 2 — Trigger the production deploy

### Option A: GitHub web UI

1. Go to the repository on GitHub.
2. Click the **Actions** tab.
3. In the left sidebar, click **Deploy to Production**.
4. Click **Run workflow** (top right).
5. Select the `main` branch (default).
6. Click **Run workflow**.

### Option B: GitHub CLI

```bash
gh workflow run "Deploy to Production"
```

After triggering, the workflow pauses and waits for approval from a
[required reviewer](08-ENVIRONMENTS.md#production-approvers).

---

## Step 3 — Approve the deploy

If you are a required reviewer:

### GitHub web UI

1. Go to the **Actions** tab.
2. Open the running "Deploy to Production" workflow.
3. Click **Review deployments**.
4. Select the `production` environment and click **Approve and deploy**.

### GitHub CLI

```bash
gh run list --workflow="Deploy to Production" --limit 1
```

Note the run ID, then:

```bash
gh run view <run-id>
```

Approval must be done in the web UI — the CLI does not support approving
environment deployments.

---

## Step 4 — Verify production

Once the workflow completes (typically under 2 minutes):

- [ ] Open the production site and verify it loads.
- [ ] Check the pages you changed.
- [ ] Test the activity form if API changes were included.
- [ ] Confirm the schedule renders correctly.

---

## Rollback

If something is wrong on production after a deploy:

### Quick rollback — redeploy the previous version

1. Find the last known good commit on `main`:

   ```bash
   git log --oneline -10
   ```

2. If the problem was introduced in the latest merge, revert it:

   ```bash
   git revert <merge-commit-hash>
   git push
   ```

3. After the revert merges, trigger a new production deploy (Step 2 above).

### Server-side rollback

The deploy uses a zero-downtime swap. The previous release is kept on the
server as a backup directory. If you have SSH access, you can swap back
manually — but prefer the git revert approach when possible.

---

## Check current release status

Before planning a release, check what has been deployed:

```bash
# Fetch tags from remote (local clone may not have them)
git fetch --tags

# Show the five most recent release tags
git tag --sort=-v:refname | head -5

# Show all PRs merged since the last minor/major release (e.g. v1.0.0)
git log v1.0.0..HEAD --oneline --merges

# Or use the GitHub CLI to list releases
gh release list --limit 5
```

The first step — `git fetch --tags` — is essential. Tags are created by
the deploy workflow on the remote; a local clone will not have them
unless you fetch explicitly.

---

## Automatic versioning

Every production deploy is automatically tagged and the version is shown
in the site footer. No manual tagging is needed for regular deploys.

### How it works

1. The `VERSION` file in the project root contains the major.minor
   version (e.g. `1.0`).
2. When the production deploy workflow runs, it finds the latest
   `v1.0.*` tag, increments the patch number, and builds the site with
   that version in the footer (e.g. `v1.0.4`).
3. After a successful deploy, an annotated git tag is created and
   pushed (e.g. `v1.0.4`).

### Version in the footer

The footer shows different version strings per environment:

| Environment | Example | How |
| --- | --- | --- |
| Production | `v1.0.4` | Auto-incremented patch from git tags |
| QA (after PR merge) | `v1.0.4 – QA PR212` | Latest production version + PR number from merge commit |
| QA (after prod deploy) | `v1.0.4` | Exact production version — confirms QA matches prod |
| Local | `v1.0 – Lokal 2026-03-02 14:30` | Base version + build timestamp |

Event-data deploys do not update the version in the footer.

### Versioning convention

[Semantic versioning](https://semver.org/):

- **Patch** (`v1.0.1`) — auto-incremented on every production deploy.
  No manual action needed.
- **Minor** (`v1.1.0`) — new features, new pages, new form fields.
  Bump when one or more user-visible features have been added since the
  last minor release.
- **Major** (`v2.0.0`) — breaking changes, major redesigns.
  Bump when the site has been fundamentally restructured or redesigned
  in a way that would surprise returning users.

A minor bump is appropriate when the set of changes since the last
`.0` release feels like a meaningful milestone — for example, a new
page, a new schedule view, or a new form field. There is no fixed
threshold; use judgement. When in doubt, a minor bump is better than
letting patch numbers grow indefinitely.

### Preparing a minor or major release

Before bumping the version, review what has changed and draft release
notes. This makes the automatically generated GitHub Release more
useful and ensures nothing is forgotten.

#### 1. Check what has changed since the last `.0` release

```bash
git fetch --tags

# Find the base tag for the current version series
git tag --sort=-v:refname | grep 'v1\.0\.' | tail -1   # e.g. v1.0.0

# List merged PRs since that tag
git log v1.0.0..HEAD --oneline --merges

# Or for a more detailed diff
git log v1.0.0..HEAD --oneline
```

Replace `v1.0.0` with the actual base tag of the current version
series — this is the `.0` tag, not the latest patch.

#### 2. Draft release notes

Write a short summary of the release. Group changes by category:

- **Nya funktioner** — user-visible features added.
- **Förbättringar** — enhancements to existing features.
- **Buggfixar** — issues resolved.
- **Dokumentation** — significant doc updates (optional, skip if minor).

Keep it concise — a few bullet points per category. The audience is
someone who uses the site, not a developer.

#### 3. Bump and merge

1. Edit the `VERSION` file — change `1.0` to `1.1` (or `2.0`).
2. Commit: `chore: bump version to 1.1`
3. Merge to main via a PR.
4. Trigger "Deploy to Production" as usual.
5. The workflow detects no `v1.1.*` tags exist, tags as `v1.1.0`, and
   **automatically creates a GitHub Release** with auto-generated notes
   listing all PRs since the previous release.

#### 4. Edit the GitHub Release

After the deploy creates the release, open it on GitHub and replace or
supplement the auto-generated notes with your drafted summary from
step 2. This is the version that people will actually read.

Patch-only deploys (the normal case) create only a tag, not a Release.

---

## Summary

```text
Merge to main
  → CI passes
  → QA auto-deploys (footer: v1.0.3 – QA PR212)
  → You verify on QA
  → You trigger "Deploy to Production"
  → Approver approves
  → Production deploys (footer: v1.0.4)
  → Git tag v1.0.4 created automatically
  → QA auto-redeploys (footer: v1.0.4 — matches prod)
  → You verify on production
```

For event data submitted via the form, both QA and Production update
automatically — no manual step needed.
