# Getting started

## Install

```
- uses: fitzyracing1/action-remove-labels@v1
  with:
    labels: |
      needs-triage
```

Inputs (`action.yml`): `github_token`, `labels` (required, newline-separated), `repo`, `number`, `fail_on_error` (default `false`).

## Usage

Change only the `uses:` line from `actions-ecosystem/action-remove-labels@v1`. There are no outputs.

## Develop and test

```
npm ci
npm run typecheck && npm run format-check
npm run build    # ncc -> dist/ (commit dist)
npm test
```
