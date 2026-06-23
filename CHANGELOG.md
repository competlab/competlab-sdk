# Changelog

All notable changes to `@competlab/sdk` are documented here.
This project adheres to [Semantic Versioning](https://semver.org).

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
