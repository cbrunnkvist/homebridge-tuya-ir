# Agent Instructions

## Package Manager
- Use **npm**: `npm install`

## Commands
| Task | Command |
|------|---------|
| Lint | `npm run lint` |
| Build | `npm run build` |
| Local test | `npm test` |

## Publishing
Trigger: `npm version <patch|minor|major>` then `git push --follow-tags`.

The GitHub Actions workflow (`.github/workflows/publish.yml`) publishes via OIDC Trusted Publishing when a `v*` tag is pushed. `npm version` bumps `package.json`, creates the matching tag, and commits — never run `git tag` manually.

## Key Conventions
- `dist/` is committed; regenerate with `npm run build`
- `PLUGIN_NAME` in `src/platform.ts` must match `name` in `package.json`
- This is a fork of `prasad-edlabadka/homebridge-tuya-ir`
