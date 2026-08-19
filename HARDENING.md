<!-- markdownlint-disable -->

# Hardening Report: AkhileshNS--heroku-deploy/v3.12.14

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **AkhileshNS--heroku-deploy/v3.12.14** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The workflow file uses action references pinned to mutable tags/branches instead of immutable 40-character commit SHAs. Specifically: `actions/checkout@v2` (tag) is used in all 4 jobs, and `akhileshns/heroku-deploy@master` (branch) is used in all 4 jobs. These can be silently updated to point to different (potentially malicious) code without any change to the workflow file.

Locations:

- `.github/workflows/main.yml:10`
- `.github/workflows/main.yml:14`
- `.github/workflows/main.yml:26`
- `.github/workflows/main.yml:30`
- `.github/workflows/main.yml:50`
- `.github/workflows/main.yml:54`
- `.github/workflows/main.yml:72`
- `.github/workflows/main.yml:76`

### missing-permissions (severity: medium)

The workflow file `.github/workflows/main.yml` has no top-level `permissions:` key and none of its 4 jobs (deploy-test-1, deploy-test-2, deploy-test-3, deploy-test-4) define job-level `permissions:` blocks. Without explicit permissions, the workflow runs with the default (potentially broad) GITHUB_TOKEN permissions, violating the principle of least privilege.

Locations:

- `.github/workflows/main.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions

**Notes:**

Fixed .github/workflows/main.yml: (1) Pinned all 4 occurrences of actions/checkout@v2 to SHA 0717577d45739eb3c851188b29f50ed6c0b2194e and all 4 occurrences of akhileshns/heroku-deploy@master to SHA 1b080913896a5d6d44a18e9e208f8eb1fee9b0f7, with original tag/branch preserved as inline comments. (2) Added top-level `permissions: {}` to enforce least privilege — the workflow uses HEROKU_API_KEY secrets rather than GITHUB_TOKEN, so no token permissions are required.

