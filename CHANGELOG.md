# Changelog

## [1.3.2]

### Fixed
- Always send IR commands regardless of stale internal state; removed short-circuit guards in `AirConditionerAccessory.setOn` and `FanAccessory.setOn` that skipped commands when the plugin's cached state already matched the desired value.

### Added
- Command logging at info level and error logging for all accessories (AC, Fan, Generic, DIY).

### Changed
- Moved discovery retry logic from `LoginHelper` into `TuyaIRDiscovery` with bounded exponential backoff (30s–5min, max 10 attempts).

## [1.3.1]

### Fixed
- Removed `required` from `configuredRemotes` items in config schema to avoid Homebridge UI form validation bug.
- Use standard JSON Schema `required` arrays instead of non-standard boolean format.

## [1.3.0]

### Added
- DNS cache with 60s TTL to reduce DNS/TLS churn across requests.
- Token refresh resilience: proactive timer-based refresh, reactive refresh on API token errors (1010/1011/1012), and concurrent refresh guard.
- Crash safety and polling backoff for accessories.

### Changed
- Widened `engines.node` to `>=18.0.0`.
- Re-scoped package to `@cbrunnkvist/homebridge-tuya-ir`.

## [1.2.0]

### Added
- Homebridge 2.0 compatibility.

## [1.1.0]

### Added
- Air conditioner, fan, light, and DIY remote support.
