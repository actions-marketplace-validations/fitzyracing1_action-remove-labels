# Architecture

| Path | Role |
|---|---|
| `action.yml` | metadata, inputs, node24 runtime |
| `src/main.ts` | action logic |
| `dist/` | ncc bundle that is actually run |
| `test/` | fake GitHub API server and tests |
| `docs/assets/` | images |


