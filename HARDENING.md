<!-- markdownlint-disable -->

# Hardening Report: AkhileshNS--heroku-deploy/v3.13.14

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **AkhileshNS--heroku-deploy/v3.13.14** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The workflow file uses unpinned action references. All four jobs use `actions/checkout@v2` (a mutable tag) and `akhileshns/heroku-deploy@master` (a mutable branch). These should be pinned to full 40-character commit SHAs to prevent supply-chain attacks where a tag or branch is silently updated with malicious code.

Locations:

- `.github/workflows/main.yml:10`
- `.github/workflows/main.yml:19`
- `.github/workflows/main.yml:30`
- `.github/workflows/main.yml:39`
- `.github/workflows/main.yml:51`
- `.github/workflows/main.yml:60`
- `.github/workflows/main.yml:72`
- `.github/workflows/main.yml:81`

### missing-permissions (severity: medium)

The workflow file `.github/workflows/main.yml` has no top-level `permissions:` key, and none of the four jobs (`deploy-test-1`, `deploy-test-2`, `deploy-test-3`, `deploy-test-4`) define their own `permissions:` block. Without explicit permissions, the workflow runs with the default (potentially broad) token permissions, violating the principle of least privilege.

Locations:

- `.github/workflows/main.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions

**Notes:**

Fixed all 8 unpinned action references in .github/workflows/main.yml: pinned actions/checkout@v2 to SHA 0717577d45739eb3c851188b29f50ed6c0b2194e and akhileshns/heroku-deploy@master to SHA 1b080913896a5d6d44a18e9e208f8eb1fee9b0f7. Added top-level `permissions: {}` to enforce least privilege since the workflow only uses repository secrets and requires no GitHub token permissions.

