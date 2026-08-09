# Changelog

All notable changes to `@competlab/sdk` are documented here.
This project adheres to [Semantic Versioning](https://semver.org).

## 3.1.0

Regenerated from the deployed API contract. Everything here is additive — no field changed type,
no field was removed, and no existing call site needs editing.

### Added

- **`programmatic` — a 12th content category.** Templated pages generated from a database or a
  pattern (per-item catalog entries, reference tables) are now counted separately instead of
  landing in `other`. It appears as a key in `categorizedCounts`, as a value of the content
  changelog's `category` filter, and in the free sitemap tool's category breakdown.

  It is **not** one of the 9 strategic categories, so it stays out of `strategicUrls`,
  `criticalGaps`, `advantages` and `onTrack` — which means `totalUrls - strategicUrls` is no
  longer safe to read as "legal plus junk". On a vendor that generates templated pages at scale
  most of that difference is a real content operation. Read `categorizedCounts.programmatic`
  before drawing a conclusion from the gap.

- **`programmaticExampleUrls`** on each content competitor — up to 5 real URLs sampled from that
  competitor's templated pages, so you can settle in seconds what a large `programmatic` count
  actually is. The platform deliberately does not judge why a vendor generates them, because a
  URL shape cannot show intent; these make that refusal checkable rather than unhelpful. Sampled
  at read time, so they may differ between calls. Typed `Array<string> | null` and always
  present: `null` exactly when `contentDataAvailable` is present, `[]` when we read the sitemap
  and there genuinely are none.

- **`trustComparisonState` and `comparableCompetitors`** on the tech & trust summary, with a new
  exported `ComparisonState` union. The state says how to read `trustSignalGap` instead of
  leaving you to infer it — whether the comparison was complete, incomplete, or never attempted —
  and `comparableCompetitors` is the sample it was drawn from. Both are optional: a run recorded
  before they shipped omits them, and an absent state must not be read as `'compared'`. See
  *Reading the data* in the README.

### Changed

- **The content changelog now agrees with the content dashboard about the same URL.** Rows used
  to be categorised one URL at a time, which made group verdicts unreachable there — a page added
  into a templated catalog arrived as `other`. It is now categorised against the whole URL set,
  so it arrives as `programmatic`. An API-side change, carried here because it changes what the
  method returns.

- **Five dashboard methods document the 404 they can return.** `no_data_available` means the
  project exists and simply has no completed run for that dimension yet — not a missing project
  and not a failed measurement. The distinction from `project_not_found` is now in the JSDoc you
  see at the call site.

- Nullable properties: **130, up from 129** — the one addition is `programmaticExampleUrls`.

## 3.0.0

> **2.4.0 was never published.** It was built and tagged in the repository but never released to
> npm, so everything it contained ships here. If you are on 2.3.0 — the previous npm release —
> this entry is your complete upgrade path.

### Breaking

- **Fields that were never measured are now `null` instead of a placeholder.** The API stopped
  publishing invented values: when a site couldn't be fetched, a page didn't exist, or a market
  was too thin to compare, it used to return `false`, `0` or `[]` anyway. Those are now `null`.
  The generated types carry it — **129 nullable properties, up from 43 in 2.3.0**.

  This will surface as compile errors wherever you assigned a `number` to a `number`, and that
  is the point: the old type was wrong, not the new one. **`null` means we did not measure it —
  never zero, never empty, never "no".** A measured `0` or `false` is reported as itself and is a
  real finding. See *Reading the data* in the README, and the new `isMeasured` /
  `isMeasuredTrue` / `isMeasuredFalse` guards — `??`, `||` and bare truthiness all convert a
  `null` back into the placeholder the API just stopped sending.

- **Methods no longer declare an error branch they never return.** Every method already threw
  `CompetLabError`, but the declared return type also carried a `{ data: undefined, error }`
  arm that runtime never produced. So `const { data } = await cl.projects.list()` failed to
  compile, and `if (result.error)` was permanently dead code. `data` is now always present on a
  returned result. Remove any `!` assertions or `result.error` checks; use `try/catch`.

- **`CompetLabError.code` is typed** instead of bare `string` — the documented codes
  (`project_not_found`, `api_key_invalid`, `rate_limit_exceeded`, …) autocomplete, while an
  undocumented code still type-checks.

- **`types` now points at `dist/index.d.cts`** to match the CJS `main`, for legacy
  `moduleResolution: node` consumers. Modern resolution is unaffected — the `exports` map already
  declared per-condition types.

### Added
- **Null-safety guards.** `isMeasured`, `isMeasuredTrue`, `isMeasuredFalse` — exported from the
  package root, matching the platform's own read-path convention.
- **Briefing editions.** `strategicBriefing.history(projectId, { page, limit })` lists past
  editions newest first — one cheap metadata row each (`runId`, date, edition number, status,
  headline), never briefing content. `strategicBriefing.edition(projectId, runId, { sections,
  includeCharts })` reads one of them in full, in the same shape as `get()`. Together they close
  a real gap: `get()` returns the latest run in whatever state it is in, so on a `running` or
  `failed` run `item` is null while an earlier edition is usually still readable. Only
  `meta.status === null` means the project genuinely has none.
- **AI Visibility answers.** `aiVisibility.dashboard()` and `aiVisibility.checkDetail()` now take
  a query argument carrying `includeAnswers`, `provider`, `brand` and `promptIndex` — the models'
  raw answers behind the scores, with filters. `provider` and `promptIndex` narrow the answers
  array; `brand` narrows the `brands` list inside each answer instead, so answers that did not
  name that domain still come back with an empty list. The prose returned is unverified model
  output about the brands that model named — attribute it to the `provider`, never to CompetLab.

### Fixed
- **README briefing example referenced fields that do not exist.** It told you to branch on
  `meta.availability` and read `data.dimensionHealth`; neither is in the API. Corrected to
  `meta.status` and `contains`, with the fallback-to-history path spelled out. The same wrong
  fields were still being taught by the 2.0.0 entry below, which ships inside the tarball — also
  corrected.
- **Error messages for non-API failures.** A JSON body that wasn't our error envelope produced
  the literal message `[object Object]`, and an HTML error page from a gateway put the whole
  document into `message`. Both now report as `http_error` with the status and a bounded message;
  `network_error` is reserved for requests that never reached the API.
- **Documented the error contract at all.** The README never mentioned that methods throw, nor
  that `CompetLabError` exists.
- **Source maps.** The CJS bundle shipped without one while the ESM bundle had full inlined
  sources; declaration maps pointed at `src/`, which the package does not publish. Both JS
  formats now carry working maps, and the dead declaration maps are gone.
- **Counts in the README.** The badge said 34 methods beside body text saying 36, and the MCP
  server was described as having 32 tools when it has 35.
- **The README claimed the SDK reads `COMPETLAB_API_KEY`.** It does not, and never has — pass
  `apiKey` explicitly.

### Changed
- Regenerated from the OpenAPI spec (34 -> 36 operations). The two new query arguments are
  optional and existing call signatures are unchanged; the breaking part is the nullability
  above.
- **CI now verifies before publishing.** The release workflow asserts the git tag matches
  `package.json`, re-runs codegen and fails if it differs from what was committed, then
  typechecks — none of which happened before. Publishes now carry npm provenance.

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
  - Returns `{ meta, item, coverage, contains }`. Branch on `meta.status`; `item` is `null`
    until the first edition has finished generating.
  - *Corrected in 3.0.0: this entry originally described `dimensionHealth` and
    `meta.availability`. Neither field has ever existed in the API — read `contains` and
    `meta.status` instead.*
  - `sections` defaults to `['hub']` (the executive digest + navigation map). Drill deeper with
    `actions`, `competitors`, any `deep-<dimension>`, or `all`. `includeCharts` (default `false`)
    adds full chart series.

### Migrating from v1.x
```ts
// Before (v1.x):
const plan = await cl.analysis.actionPlan(projectId);

// After (v2.x) — the hub digest is the synthesized strategic read:
const { data } = await cl.strategicBriefing.get(projectId);
// data.meta.status, data.item

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
