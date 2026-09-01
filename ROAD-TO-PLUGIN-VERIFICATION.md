# Road to Homebridge Plugin Verification

Gap analysis and action plan for getting `@cbrunnkvist/homebridge-tuya-ir` verified
under the [Homebridge Verified Plugin program](https://github.com/homebridge/plugins/wiki/Verified-Plugins).

---

## 1. Node.js LTS Support

**Gap:** `engines.node` is `>=18.0.0`. Verification requires explicit support for current LTS versions (v22 and v24).

**Action:**
- [x] Update `package.json` `engines.node` to `"^22 || ^24"`
- [x] Run lint, build, and the local failure-path suite on Node 22 and 24
- [x] Add a non-publishing CI matrix for Node 22 and 24
- [x] Update `devDependencies` accordingly (drop `@types/node@^14`, upgrade to `^22`; upgrade TypeScript to parse the Node 22 declarations)

**Files:** `package.json`

---

## 2. Remove Dead Dependencies

**Gap:** `request` (deprecated, unused — code uses native `https`), `http` (npm shim, never imported), `escape-html` (no usage found in source).

**Action:**
- [x] Run `npm ls request http escape-html` to confirm no imports
- [x] Remove `request`, `http`, and `escape-html` from `dependencies`
- [ ] Run `npm run build` and `npm test` to verify nothing breaks

`npm test` starts Homebridge successfully, but the repository has no local
configuration and the available Node.js version is v26.5.0, outside the
supported engine range. It is not evidence for a configured Node 22/24 run.

**Files:** `package.json`

---

## 3. Graceful Error Recovery (No Unhandled Exceptions)

**Gap:** When DNS resolution fails (e.g. `EAI_AGAIN openapi.tuyaeu.com`), the child bridge process exits with code 1. Verification requires the plugin to catch and log its own errors without crashing.

**Current behaviour:**
- `LoginHelper.invokeTuyaLoginAPI` calls `callback({ success: false, msg: ... })` on network error
- `TuyaIRDiscovery.attemptDiscovery` catches the rejected promise but the child bridge still terminates

**Action:**
- [x] Ensure `attemptDiscovery` never rejects — all errors should be caught and logged, with retries handled internally
- [x] Handle rejected proactive token refreshes and missing `smartIR` configuration
- [x] Verify a configured Homebridge process stays alive after a DNS login failure during its retry window
- [x] Add deterministic tests for rejected login handling and missing `smartIR` configuration

**Files:** `src/lib/TuyaIRDiscovery.ts`, `src/lib/api/LoginHelper.ts`

---

## 4. Create GitHub Releases for Each Version

**Gap:** No GitHub releases exist yet. Verification requires a release with notes for every version.

**Action:**
- [ ] After publishing v1.3.2 to npm, delete and re-tag so CI creates the release:
  ```bash
  git tag -d v1.3.2 && git tag v1.3.2
  git push origin :refs/tags/v1.3.2 && git push origin v1.3.2
  ```
- [ ] Verify the CI `Create GitHub Release` step runs and uses the CHANGELOG.md entry as the release body
- [ ] Going forward: the CI workflow now validates CHANGELOG.md and creates releases automatically

**Files:** `.github/workflows/publish.yml` (already updated), `CHANGELOG.md`

---

## 5. Differentiation from Verified `@homebridge-plugins/homebridge-tuya`

**Gap:** The Homebridge team requires that a verified plugin "must not offer the same nor less functionality than that of any existing verified plugin." The verified `@homebridge-plugins/homebridge-tuya` handles general Tuya devices (bulbs, switches, sensors). This plugin specifically targets **IR blasters** — a different device category with a different API surface (`/v2.0/infrareds/` endpoints).

**Action:**
- [x] Add a clear "Difference from @homebridge-plugins/homebridge-tuya" section to the README explaining:
  - This plugin targets Tuya IR Blaster hardware (hubs that emit infrared signals)
  - It uses Tuya's IR-specific API endpoints (`/v2.0/infrareds/{deviceId}/remotes/...`)
  - It supports AC, fan, light, and DIY (learned-button) IR remotes
  - The verified Tuya plugin controls Zigbee/Wi-Fi devices via the generic Tuya device API
- [ ] Use this explanation in the verification submission PR

**Files:** `README.md`

---

## 6. Final Checklist Before Submission

- [ ] All of the above items completed
- [x] `npm run lint` passes with zero warnings
- [x] `npm run build` produces clean output
- [x] Plugin installs cleanly with `npm ci` and runs the verification suite on Node 22 and 24
- [x] Plugin starts only when configured (the no-configuration smoke run loads no plugins)
- [x] No analytics, tracking, or post-install scripts found in the package or source
- [x] Plugin Settings GUI is provided by `config.schema.json`
- [ ] Open an issue at https://github.com/homebridge/plugins/issues with the verification request
