# 360 Bench Remove Labels

> Part of **[360 Bench](https://github.com/fitzyracing1/360-bench)**, tested fixes for abandoned packages and actions.

![screenshot](./docs/assets/screenshot.png)

This is a GitHub Action to remove GitHub labels from an issue or a pull request.

> **This is a fork of [actions-ecosystem/action-remove-labels](https://github.com/actions-ecosystem/action-remove-labels)
> by [The Actions Ecosystem Authors](https://github.com/actions-ecosystem)**, updated to run on
> Node 24. Upstream has not been released since v1.3.0 (September 2021), and its `@v1` still
> declares `using: node12`. All credit for the original action goes to its authors; it remains
> available under the same [Apache License 2.0](./LICENSE). See [NOTICE](./NOTICE) for what was changed.

## What's fixed in this fork

Based on upstream `main` at [`d051625`](https://github.com/actions-ecosystem/action-remove-labels/commit/d051625)
(the `v1.3.0` code plus a docs fix). The inputs are the same, the action still has no outputs, each
label is still removed with its own API call, and a label that isn't on the issue is still only a
warning unless you set `fail_on_error: 'true'`.

- **Runs on Node 24 (`using: node24`) instead of `node12`.** GitHub
  [removed Node 20 from Actions runners on 2026-09-23](https://github.blog/changelog/2026-09-23-node-20-is-no-longer-available-in-github-actions/)
  and now force-runs older JavaScript actions on Node 24, flagging every run with a deprecation
  warning. `node24` is the runtime GitHub currently documents for JavaScript actions.
  Upstream issue: [#413](https://github.com/actions-ecosystem/action-remove-labels/issues/413).
  Unmerged upstream PRs with the same idea: [#418](https://github.com/actions-ecosystem/action-remove-labels/pull/418),
  [#436](https://github.com/actions-ecosystem/action-remove-labels/pull/436) (node16) and
  [#458](https://github.com/actions-ecosystem/action-remove-labels/pull/458) (node20).
- **Current `@actions/core` (3.x) and `@actions/github` (9.x), rebuilt with `ncc`.** The old bundle
  shipped `@actions/core` 1.2 (which only knows the deprecated `::set-output` / `::save-state`
  commands) and an Octokit that prints a Node `DEP0169` (`url.parse()`) deprecation warning on
  Node 24. The new bundle writes through `$GITHUB_OUTPUT` / `$GITHUB_STATE` when it needs to and
  prints no deprecation warnings.

## How to switch

Replace the `uses:` line; nothing else changes:

```diff
-      - uses: actions-ecosystem/action-remove-labels@v1
+      - uses: fitzyracing1/action-remove-labels@v1
```

For the strictest setup, pin the full commit SHA of the release instead of `@v1`.

## Inputs

|      NAME       |                                           DESCRIPTION                                           |   TYPE   | REQUIRED |                                     DEFAULT                                     |
| --------------- | ----------------------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------- |
| `github_token`  | A GitHub token.                                                                                 | `string` | `false`  | `${{ github.token }}`                                                           |
| `labels`        | The labels' name to be removed. Must be separated with line breaks if there're multiple labels. | `string` | `true`   | `N/A`                                                                           |
| `number`        | The number of the issue or pull request.                                                        | `number` | `false`  | `${{ github.event.issue.number }}` or `${{ github.event.pull_request.number }}` |
| `repo`          | The owner and repository name. e.g.) `Codertocat/Hello-World`                                   | `string` | `false`  | `${{ github.repository }}`                                                      |
| `fail_on_error` | Whether the action fails or not when getting errors. [true,false]                               | `bool`   | `false`  | `false`                                                                         |

The token needs `issues: write` (for issues) or `pull-requests: write` (for pull requests).

## Example

### Remove a single label with a comment

```yaml
name: Remove Label

on: [issue_comment]

permissions:
  issues: write
  pull-requests: write

jobs:
  remove_label:
    runs-on: ubuntu-latest
    steps:
      - uses: fitzyracing1/action-remove-labels@v1
        if: ${{ startsWith(github.event.comment.body, '/remove-labels') }}
        with:
          labels: bug
```

### Remove multiple labels with a comment

```yaml
name: Remove Labels

on: [issue_comment]

permissions:
  issues: write
  pull-requests: write

jobs:
  remove_labels:
    runs-on: ubuntu-latest
    steps:
      - uses: fitzyracing1/action-remove-labels@v1
        if: ${{ startsWith(github.event.comment.body, '/remove-labels') }}
        with:
          labels: |
            documentation
            changelog
```

## Tests

```sh
npm ci
npm run typecheck
npm run build   # rebuilds dist/ with ncc
npm test
```

`npm test` runs the bundled `dist/index.js` in a fresh Node process, the way the runner does, with
`INPUT_*` / `GITHUB_*` variables and `GITHUB_API_URL` pointed at a small fake GitHub API
(`test/fake-github.mjs`). It checks that each label is removed with
`DELETE /repos/{owner}/{repo}/issues/{number}/labels/{name}` (URL-encoded, with the token), that the
number falls back to the triggering pull request, that a missing label only warns unless
`fail_on_error` is `'true'`, that empty input makes no call, that no `::set-output` / `::save-state`
or Node deprecation warnings are printed, and that `action.yml` uses `node24` with the upstream
inputs unchanged. `test/act-workflow.yml` runs the same checks through [act](https://github.com/nektos/act).

## License

Copyright 2020 The Actions Ecosystem Authors. Modifications copyright 2026 Joshua Almeida.

Released under the [Apache License 2.0](./LICENSE). See [NOTICE](./NOTICE) for the list of changes.

## Documentation

- In-repo docs: [docs/](docs/index.md)
- Wiki: [https://github.com/fitzyracing1/action-remove-labels/wiki](https://github.com/fitzyracing1/action-remove-labels/wiki)
