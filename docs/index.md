# fitzyracing1/action-remove-labels@v1 (360 Bench Remove Labels)

`fitzyracing1/action-remove-labels@v1 (360 Bench Remove Labels)` is a drop-in fork of [actions-ecosystem/action-remove-labels](https://github.com/actions-ecosystem/action-remove-labels) and part of [360 Bench](https://github.com/fitzyracing1/360-bench). It is based on upstream upstream v1, and the API is unchanged. All credit for the original library goes to its authors and contributors.

## What the fork fixes (summary of [README.md](../README.md))

- Runs on Node 24 (`using: node24`) instead of `node12`.
- Uses current `@actions/core` 3.x and `@actions/github` 9.x, rebuilt with `ncc`.

The full details and links to the upstream issues are in [README.md](../README.md).

Pages: [Getting started](getting-started.md) · [Architecture](architecture.md) · [Contributing](contributing.md)

## CI

`.github/workflows/test.yml` runs `npm ci`, typecheck, format-check, build, a check that `dist/` is up to date, and `npm test`. A run is **lit** when it succeeds and **dark** otherwise.

## License

Apache-2.0 (see LICENSE and NOTICE). The original notice is kept: Copyright 2020 The Actions Ecosystem Authors.
Modifications: Copyright (c) 2026 Joshua Almeida.
