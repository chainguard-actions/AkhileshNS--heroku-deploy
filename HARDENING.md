<!-- markdownlint-disable -->

# Hardening Report: AkhileshNS--heroku-deploy/v3.15.15

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **AkhileshNS--heroku-deploy/v3.15.15** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### missing-permissions (severity: medium)

The workflow file .github/workflows/main.yml has no top-level `permissions:` key and none of its four jobs (deploy-test-1, deploy-test-2, deploy-test-3, deploy-test-4) define a job-level `permissions:` block. This means the workflow runs with the default (broad) repository permissions.

Locations:

- `.github/workflows/main.yml:1`

### broad-permissions (severity: medium)

The workflow file .github/workflows/github-dependents-info.yml sets top-level `permissions: read-all`, which grants overly broad read access across all scopes. It should be replaced with specific minimal permissions.

Locations:

- `.github/workflows/github-dependents-info.yml:12`

### unpinned-uses (severity: high)

Multiple `uses:` references in .github/workflows/main.yml are pinned to mutable tags or branch names instead of full 40-character commit SHAs, making the workflow vulnerable to supply-chain attacks: `actions/checkout@v2` (appears 4 times) and `akhileshns/heroku-deploy@master` (appears 4 times, using a branch ref).

Locations:

- `.github/workflows/main.yml:10`
- `.github/workflows/main.yml:15`
- `.github/workflows/main.yml:30`
- `.github/workflows/main.yml:35`
- `.github/workflows/main.yml:50`
- `.github/workflows/main.yml:55`
- `.github/workflows/main.yml:70`
- `.github/workflows/main.yml:75`

### unpinned-uses (severity: high)

Multiple `uses:` references in .github/workflows/github-dependents-info.yml are pinned to mutable tags instead of full 40-character commit SHAs: `actions/checkout@v4`, `nvuillam/github-dependents-info@v1.5.1`, and `peter-evans/create-pull-request@v6`.

Locations:

- `.github/workflows/github-dependents-info.yml:26`
- `.github/workflows/github-dependents-info.yml:33`
- `.github/workflows/github-dependents-info.yml:47`

### script-injection (severity: high)

Rule (a) violation: In .github/workflows/github-dependents-info.yml, the `Create PR output` step directly interpolates GitHub Actions expressions inside a `run:` shell command. The expressions `${{ steps.cpr.outputs.pull-request-number }}` and `${{ steps.cpr.outputs.pull-request-url }}` are substituted into the shell string before the shell parses it, allowing a malicious pull-request-number or URL value to inject arbitrary shell commands. These values should be passed via an `env:` variable and the variable double-quoted in the script.

Locations:

- `.github/workflows/github-dependents-info.yml:57`
- `.github/workflows/github-dependents-info.yml:58`

## Iteration Notes

### Iteration 1

**Fixes applied:** missing-permissions, broad-permissions, unpinned-uses, script-injection

**Notes:**

Fixed all 5 findings across 2 workflow files:

1. main.yml - missing-permissions: Added `permissions: {}` at top level and `permissions: contents: read` at each of the 4 job levels.

2. github-dependents-info.yml - broad-permissions: Replaced top-level `permissions: read-all` with `permissions: {}` (job-level permissions were already correctly scoped).

3. main.yml - unpinned-uses: Pinned `actions/checkout@v2` → `@0717577d45739eb3c851188b29f50ed6c0b2194e` (4 occurrences) and `akhileshns/heroku-deploy@master` → `@1b080913896a5d6d44a18e9e208f8eb1fee9b0f7` (4 occurrences).

4. github-dependents-info.yml - unpinned-uses: Pinned `actions/checkout@v4` → `@11d5960a326750d5838078e36cf38b85af677262`, `nvuillam/github-dependents-info@v1.5.1` → `@ca5a109b3014d4cd906ffe0cb1cf9eea362c8846`, and `peter-evans/create-pull-request@v6` → `@c5a7806660adbe173f04e3e038b0ccdcd758773c`.

5. github-dependents-info.yml - script-injection: Moved `${{ steps.cpr.outputs.pull-request-number }}` and `${{ steps.cpr.outputs.pull-request-url }}` into an `env:` block as `PR_NUMBER` and `PR_URL`, referenced as plain env vars in the shell script.

