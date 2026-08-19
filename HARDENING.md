<!-- markdownlint-disable -->

# Hardening Report: AkhileshNS--heroku-deploy/v3.14.15

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **AkhileshNS--heroku-deploy/v3.14.15** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Two ${{ ... }} expressions are interpolated directly inside a run: shell command string in the 'Create PR output' step. Specifically, `${{ steps.cpr.outputs.pull-request-number }}` and `${{ steps.cpr.outputs.pull-request-url }}` are embedded directly in echo commands. Even though steps.*.outputs.* values are not directly attacker-controlled here, any ${{ }} expression inside a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, bypassing shell quoting. These should be moved to an env: block and referenced as shell variables.

Locations:

- `.github/workflows/github-dependents-info.yml:57`

### missing-permissions (severity: medium)

The workflow file main.yml has no top-level `permissions:` key and none of its four jobs (deploy-test-1, deploy-test-2, deploy-test-3, deploy-test-4) define a job-level `permissions:` block. This means the workflow runs with the default (potentially broad) GITHUB_TOKEN permissions. Explicit minimal permissions should be declared.

Locations:

- `.github/workflows/main.yml:1`

### broad-permissions (severity: medium)

The workflow file github-dependents-info.yml sets `permissions: read-all` at the top level. This grants read access to all repository scopes and is overly broad. It should be replaced with specific minimal permissions (e.g., only the scopes actually needed). Note: the job-level permissions (contents: write, pull-requests: write) are more specific, but the top-level read-all still grants unnecessary broad access.

Locations:

- `.github/workflows/github-dependents-info.yml:11`

### unpinned-uses (severity: high)

Multiple `uses:` references in main.yml use mutable tag or branch refs instead of full 40-character commit SHAs, making the workflow vulnerable to supply-chain attacks if the referenced tag or branch is moved or compromised. Failing references: `actions/checkout@v2` (used 4 times), `akhileshns/heroku-deploy@master` (used 4 times, a mutable branch ref).

Locations:

- `.github/workflows/main.yml:10`
- `.github/workflows/main.yml:20`
- `.github/workflows/main.yml:31`
- `.github/workflows/main.yml:41`
- `.github/workflows/main.yml:52`
- `.github/workflows/main.yml:62`
- `.github/workflows/main.yml:73`
- `.github/workflows/main.yml:83`

### unpinned-uses (severity: high)

Multiple `uses:` references in github-dependents-info.yml use mutable version tags instead of full 40-character commit SHAs, making the workflow vulnerable to supply-chain attacks. Failing references: `actions/checkout@v4`, `nvuillam/github-dependents-info@v1.5.1`, `peter-evans/create-pull-request@v6`.

Locations:

- `.github/workflows/github-dependents-info.yml:22`
- `.github/workflows/github-dependents-info.yml:28`
- `.github/workflows/github-dependents-info.yml:47`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, missing-permissions, broad-permissions, unpinned-uses

**Notes:**

Fixed all 5 findings across 2 workflow files:

1. **script-injection** (github-dependents-info.yml line 57): Moved `${{ steps.cpr.outputs.pull-request-number }}` and `${{ steps.cpr.outputs.pull-request-url }}` from the run: shell string into an env: block (PR_NUMBER, PR_URL), referencing them as plain shell variables.

2. **missing-permissions** (main.yml): Added `permissions: {}` at the top level since the workflow doesn't require GITHUB_TOKEN access.

3. **broad-permissions** (github-dependents-info.yml line 11): Replaced `permissions: read-all` with `permissions: {}` at the top level. The job-level `contents: write` and `pull-requests: write` permissions remain as the minimal required scopes.

4. **unpinned-uses** (main.yml): Pinned `actions/checkout@v2` → SHA `0717577d45739eb3c851188b29f50ed6c0b2194e` (4 occurrences) and `akhileshns/heroku-deploy@master` → SHA `1b080913896a5d6d44a18e9e208f8eb1fee9b0f7` (4 occurrences).

5. **unpinned-uses** (github-dependents-info.yml): Pinned `actions/checkout@v4` → `11d5960a326750d5838078e36cf38b85af677262`, `nvuillam/github-dependents-info@v1.5.1` → `ca5a109b3014d4cd906ffe0cb1cf9eea362c8846`, `peter-evans/create-pull-request@v6` → `c5a7806660adbe173f04e3e038b0ccdcd758773c`.

