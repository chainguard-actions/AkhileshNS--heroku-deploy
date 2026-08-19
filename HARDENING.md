<!-- markdownlint-disable -->

# Hardening Report: AkhileshNS--heroku-deploy/v3.13.15

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **AkhileshNS--heroku-deploy/v3.13.15** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The workflow references actions by mutable tags and branch names instead of pinned full-length SHA commits. This exposes the workflow to supply-chain attacks where a tag or branch is silently updated to malicious code. Failing references:
- `actions/checkout@v2` (tag) — used in all 4 jobs
- `akhileshns/heroku-deploy@master` (branch) — used in all 4 jobs
All should be pinned to a 40-character hex commit SHA (e.g. `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v2`).

Locations:

- `.github/workflows/main.yml:11`
- `.github/workflows/main.yml:18`
- `.github/workflows/main.yml:30`
- `.github/workflows/main.yml:37`
- `.github/workflows/main.yml:49`
- `.github/workflows/main.yml:56`
- `.github/workflows/main.yml:68`
- `.github/workflows/main.yml:75`

### missing-permissions (severity: medium)

The workflow file `.github/workflows/main.yml` has no top-level `permissions:` key and none of its 4 jobs (deploy-test-1, deploy-test-2, deploy-test-3, deploy-test-4) define a job-level `permissions:` block. Without explicit permissions, the workflow inherits the repository's default token permissions, which may be overly broad. A minimal `permissions:` block (e.g. `contents: read`) should be added at the top level or per job.

Locations:

- `.github/workflows/main.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions

**Notes:**

Fixed all 8 unpinned action references in .github/workflows/main.yml: pinned actions/checkout@v2 to SHA 0717577d45739eb3c851188b29f50ed6c0b2194e and akhileshns/heroku-deploy@master to SHA 1b080913896a5d6d44a18e9e208f8eb1fee9b0f7. Added top-level `permissions: contents: read` block to enforce least-privilege token access.

