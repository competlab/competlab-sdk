# Changelog

All notable changes to `@competlab/sdk` are documented here.
This project adheres to [Semantic Versioning](https://semver.org).

## 2.3.0

### Added
- **Typed free-tool request bodies.** The five tool endpoints now declare their fields instead of
  accepting a freeform object: `tools.techStack.startScan()` and `tools.trustSignals.startScan()`
  take `{ domain }`; `tools.agentAdoption.startScan()` adds optional `debugMode` /
  `includeFixPrompts`; `tools.sitemapVisualizer()` adds optional `sitemapUrl` / `includeUrls`;
  `tools.aiCrawlerChecker()` adds optional `industry` (a literal union of the supported verticals).
- **Typed alert filters.** `alerts.list()`'s `dimension` and `severity` query params are now
  string-literal unions (`'tech-trust' | 'content' | 'positioning' | 'pricing' | 'ai-visibility'`
  and `'critical' | 'high' | 'medium' | 'info'`) instead of `string`.
- **Documented error codes.** Per-status error-envelope types are now generated with enum'd `code`
  values (401 `api_key_missing` / `api_key_invalid` / `api_key_revoked` / `api_key_expired` /
  `insufficient_scope`, 400 `invalid_parameters`, 429 `rate_limit_exceeded`, 502 `bad_gateway` /
  `bot_protection_blocked` / `fetch_failed`, 503 `target_unreachable`).

### Changed
- Regenerated from the refreshed OpenAPI spec: request/response field descriptions cleaned up and
  the async scan endpoints now carry coherent queued/completed examples. No runtime behavior change.

> **Upgrade note:** additive and runtime-identical — every existing call keeps working unchanged
> (`domain` was always required server-side). The tool request-body and alert-filter types are now
> *tightened* (freeform → declared shapes; `string` → unions); strict-TypeScript consumers that were
> passing bogus or extra properties may see a new compile error, but correct usage is unaffected. No
> method, resource, or endpoint changed.

## 2.2.0

### Changed
- **`alerts.list()` — each alert's `context` is now always present** (`AlertListItemResponse.context`
  changed from optional to a required field). It is an **empty object (`{}`)** when the alert carries
  no extra context, rather than being absent. Non-breaking: reads that previously guarded
  `alert.context?…` still compile.
- **`context` is now keyed by the alert's canonical dimension slug** — identical to the alert's
  `dimension` field — so you can index it directly, e.g. `alert.context[alert.dimension]`. Structure
  varies by dimension: most carry field-level changes with `previousValue`/`currentValue` pairs;
  **AI Visibility** carries a `scoreShift` with `scoreFrom`/`scoreTo`. (`context` stays typed as an
  open `{ [key: string]: unknown }` — narrow it at the point of use.)

> **Upgrade note:** type-only change on the alert response — no code changes required. Strict-TypeScript
> consumers gain a guarantee (`context` is no longer `| undefined`); existing optional-chaining reads
> keep working. No method, resource, or request-shape changed.

## 2.1.0

### Changed
- **`content.dashboard()` — `summary.overallRank` is now nullable** (`number | null`, and
  optional in the response type). It is `null` when fewer than two competitors returned
  comparable content data, or when your own site returned no usable data to rank — instead of
  the previous (sometimes misleading) numeric rank. **Handle the `null` case.**

### Added
- **`summary.comparableCompetitors`** on the content dashboard — the number of competitors
  (excluding your own site) with usable content data that the rank and gap/advantage
  comparisons were computed over. The overall rank's field size is `comparableCompetitors + 1`
  (your own site included).

> **Upgrade note:** if you read `summary.overallRank`, it can now be `null`/`undefined` — guard
> it (e.g. `if (summary.overallRank != null) …`). Strict-TypeScript consumers will see a type
> change here. No other surface changed.

## 2.0.0

### Breaking
- **Removed `cl.analysis`** (`cl.analysis.actionPlan(projectId)`). The underlying
  `GET /v1/projects/{projectId}/analysis/action-plan` endpoint was removed from the CompetLab API.

### Added
- **`cl.strategicBriefing`** — the synthesized competitive briefing that supersedes the action plan.
  - `cl.strategicBriefing.get(projectId, { sections?, includeCharts? })` →
    `GET /v1/projects/{projectId}/strategic-briefing`.
  - Returns `{ item, meta, coverage, dimensionHealth }`. Branch on `meta.availability`
    (`ready` | `ready-refreshing` | `preparing` | `none`); `item` is `null` until the first
    edition has finished generating.
  - `sections` defaults to `['hub']` (the executive digest + navigation map). Drill deeper with
    `actions`, `competitors`, any `deep-<dimension>`, or `all`. `includeCharts` (default `false`)
    adds full chart series.

### Migrating from v1.x
```ts
// Before (v1.x):
const plan = await cl.analysis.actionPlan(projectId);

// After (v2.x) — the hub digest is the synthesized strategic read:
const { data } = await cl.strategicBriefing.get(projectId);
// data.meta.availability, data.item

// Closest equivalent of the old prioritized action list:
const actions = await cl.strategicBriefing.get(projectId, { sections: ['actions'] });
```

## 1.2.0
- Added `cl.tools.fetchUrl()` and synced response-shape extensions with the API.

## 1.1.0
- Added 8 free-tool methods mirroring the API's tool additions.

## 1.0.1
- README / npm documentation updates.

## 1.0.0
- Initial public release.
