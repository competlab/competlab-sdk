# Changelog

All notable changes to `@competlab/sdk` are documented here.
This project adheres to [Semantic Versioning](https://semver.org).

## 7.0.0

The API answers a page at a time. Six dimension reads return their long lists one page at a time by
default, the ticket list is paged with a count per column, and a brand no answer named has no rank.
Major for four reasons, each of which breaks a build rather than a runtime: the ticket list's
response type is replaced, `summary` is optional on both check details, `rankByPresence` can be
`null`, and a ticket list row carries no `description` unless you ask for it.

### Changed — the dimension reads answer in a compact view by default

`aiVisibility.dashboard`, `aiVisibility.checkDetail`, `aiVisibility.history`, `aiSources.dashboard`,
`aiSources.checkDetail` and `techTrust.dashboard` take `view: 'compact' | 'full'`, and the API
defaults to `compact`:

- AI Visibility: `summary.marketMap.brands` is one page — `mapOffset` / `mapLimit` — with
  `summary.marketMap.brandsPage` (`{ offset, limit, total, hasMore }`). Your own row and every
  tracked competitor's are on every page, so a tracked competitor missing from it was named in no
  answer.
- AI Sources: `summary.pages` (`pagesOffset` / `pagesLimit`, narrowed by `pagesHost`) and
  `summary.brands` (`brandsOffset` / `brandsLimit`) are paged, with `pagesPage` and `brandsPage`;
  each `summary.coreHosts[]` lists `pageUrls` in place of `pages`.
- AI Visibility history: a compact row keeps the first 10 `competitorRankings` plus every tracked
  competitor's and your own, with `competitorRankingsPage`.
- Tech & Trust: `crawlerCatalog` and `explanationCatalog` state once what repeats, and the items
  carry the key.
- Every response of these reads opens with `readingGuide`, the reading rules for its fields.

`view: 'full'` returns every row, as 6.x did. A paging parameter beside `view: 'full'` is a
`400 paging_requires_compact_view`.

```typescript
// Before (6.x): every row of the map
const { data } = await cl.aiVisibility.dashboard('proj_abc');

// After (7.0.0): one page, or every row when you ask for it
const { data: page } = await cl.aiVisibility.dashboard('proj_abc');
const { total, hasMore } = page.item.summary.marketMap.brandsPage!;
const { data: whole } = await cl.aiVisibility.dashboard('proj_abc', { view: 'full' });
```

### Changed — a check detail read for answers comes without its summary

`summary` is optional on `aiVisibility.checkDetail` and `aiSources.checkDetail`. `includeSummary`
defaults to the opposite of `includeAnswers`, so an answers read stays small; pass
`includeSummary: true` for both. `includeSummary: false` without `includeAnswers: true` is a
`400 nothing_to_return`, and a paging parameter beside `includeSummary: false` a
`400 paging_requires_summary`.

### Changed — `rankByPresence` is `number | null`

On `summary.marketMap.brands[]` (AI Visibility) and `summary.brands[]` (AI Sources), a brand named
in no answer has no rank. A `null` beside `answersNaming: 0` reads "not named in any answer" —
never "not measured", never a place. On the trend, a company's `score` is a measured `0` on a check
that named it nowhere, and its `rank` and `rankChange` are `null` there.

### Changed — the ticket list is paged, sortable and filterable

`tickets.list` returns `{ items, pagination, byStatus }` in place of `{ items, total, hasMore }`.
It takes `page` and `limit` (default 50, max 100), `sort` (`board` · `priority` · `due` ·
`activity`) and the filters `impactMin`, `effort`, `maxMinutes`, `dueFrom`, `dueBefore`,
`activeSince` and `dimension: 'none'`; `q` matches the description too, and `closed` defaults to
`all`. A row is a `TicketListItemResponse`: every field but `description`, which
`include: ['description']` adds. `byStatus` counts the matches per column whatever `status` you
passed.

```typescript
// Before (6.x)
const { data } = await cl.tickets.list('proj_abc');
const { total, hasMore } = data;

// After (7.0.0)
const { data: page } = await cl.tickets.list('proj_abc', { status: ['triage', 'todo'], sort: 'priority' });
const { total, hasMore } = page.pagination;
const todo = page.byStatus.todo;
```

### Added

- `tickets.move` takes `position: 'top' | 'bottom'` as well as neighbours, and answers with
  `placement` — `above`, `below`, and `ignored[]`: each neighbour you named that was not used, and why.
- A comment carries `briefing` — `{ runId, kind, editionNumber, completedAt }` on one a Strategic
  Briefing wrote, `null` on every other. `kind` is the new `TicketCommentKind`.
- The briefing envelope's `tickets` gains `opened`, `commented`, `alreadyOnBoard` and
  `recheckedUnchanged`: what the edition did to the board, in one call.
- A briefing's ticket carries `briefing.extendsTicketId`, the ticket already on the board it builds on.
- The trend lists your company, every tracked competitor and up to 3 untracked companies, and every
  reading carries `checksAnalysed`.
- `techTrust.dashboard(projectId, { view })`.
- `CompetLabApiErrorCode` gains `paging_requires_compact_view`, `paging_requires_summary` and
  `nothing_to_return`.

### Changed — doc comments

- The impact scale reads "(1 Minor · 2 Moderate · 3 Significant · 4 Critical; 4 matters most)".
- A project's next briefing is scheduled roughly 30 days after its last run.
- An answers entry is about 1,500 characters; read `summary.totalEntries` to size the block.

## 6.0.0

A briefing's recommendations moved to the Strategic Tickets board, and the board is on the API —
read AND write. Major for one reason: `'actions'` left `BriefingSectionName`, so code that asks
for it stops compiling instead of getting a 400 at runtime.

### Added — `cl.tickets`, the Strategic Tickets board

Fifteen methods over the project's board: `list`, `get`, `create`, `update`, `move`, `delete`,
`assignees`; `comments.list/create/update/delete`; `labels.list/create/update/delete`.

- **The only part of the API that changes a project.** Every write needs a `read_write` key; a `read` key
  gets `403 insufficient_scope`.
- **Every ticket method needs an active subscription** — `402 subscription_required`, reads
  included. It is the only part of `/v1` that checks.
- **A move names neighbours, not a position** — `beforeId` / `afterId`. No ticket carries a
  position field.
- **On `update`, `null` clears a field and an omitted field is left alone**; the description
  clears with `""`, labels with `[]`.
- **A ticket a Strategic Briefing opened cannot be deleted.** Read `deletable`, and move it to
  `dismissed` instead.
- `number` is the ticket's number on the board (`#14` in the app). `list(projectId, { number: 14 })`
  finds it; every method that acts on a ticket takes its `id`.
- A comment a person wrote in the app cannot be edited through the API — `403 forbidden`, whatever
  the key.
- `CompetLabApiErrorCode` gains `subscription_required`, `forbidden`, `bad_request` and
  `not_found`.

### Removed — `'actions'` from `BriefingSectionName`

A finished edition opens each recommendation as a ticket (`origin: 'briefing'`) and stores them
nowhere else. The briefing envelope gains `tickets` — `{ total, byStatus }`, how they stand on the
board right now, `null` unless the run is `done`.

```typescript
// Before (5.x):
await cl.strategicBriefing.get('proj_abc', { sections: ['actions'] });

// After (6.0.0): one edition's recommendations
const { data } = await cl.strategicBriefing.get('proj_abc');
await cl.tickets.list('proj_abc', { origin: 'briefing', briefingRunId: data.meta.runId! });
```

### Changed — doc comments

- `prompts` on a project is no longer "always exactly 3": the count is set per account. Read the
  array's length.
- The fixed 25k / 46k `includeAnswers` token totals are gone; size the block from
  `summary.totalEntries` (about 375 tokens per entry).
- A briefing hub `diagnosis` row may carry no `deepDive`; request a `deep-<dimension>` section only
  for a pointer that is present.
- `agent-readiness` is the key for Agent Adoption; the key predates the name and does not change.

## 5.0.0

AI Visibility stopped answering "where do you rank" and started answering "who do the models
recommend, and how often". The average-position family is **deleted, not deprecated**, the trend
endpoint returns a different document, and the engine roster went from three to five. A sixth
dimension, AI Sources, arrives with it.

Major for four reasons, each of which breaks a build rather than a runtime: fields removed,
a response type replaced, two enums widened, and a set of fields that were guaranteed and now
are optional.

### Added — AI Sources, the sixth dimension

`cl.aiSources` — `dashboard()`, `history()`, `checkDetail()`. For the two engines that hand back
the pages they pulled while answering (Perplexity and Google AI Overviews), it asks a project's
eight buying questions, reads those pages, and reports per engine which companies the engine
named, which pages it retrieved, and which of those pages name your competitors and not you.

Three rules govern every figure it returns, and each is easy to break by accident:

- **Retrieved, never cited.** An engine does not say which of the pages it pulled it leaned on.
  **No count in this payload is a citation count**, and calling one that invents a fact the
  engines never published.
- **Per engine, never pooled.** The two engines share roughly a quarter of their source domains,
  so adding their page counts describes a list neither produced. Answers may pool as a vote
  (`summary.brands`); pages may not. The one cross-engine object is the core — the hosts at least
  two engines retrieved.
- **Counts, never rates.** Report `n of N answers`. Eight questions is a small set by design, and
  a percentage computed from it is false precision.

The trap is `status`, which has three values and not two:

```typescript
const hosts = data.item.summary.coreHosts;

// WRONG — sweeps in 'unreadable', turning a page we could not read into one that omits you
const wrong = hosts.filter((h) => h.status !== 'already_named');

// right: only 'missing' means we read the page and your name was not on it
const toWork = hosts.filter((h) => h.status === 'missing');
```

`actionHint.text` on each core host and the sentences under `summary.limits.sentences` are
payload — render them verbatim rather than composing your own.

### Removed — the average-position family

- **`avgRank`** on `AiVisibilityCustomerMetricsResponse` and `AiVisibilityTopCompetitorResponse`.
- **`overallAvgRank`**, **`openaiAvgRank`**, **`claudeAvgRank`**, **`geminiAvgRank`** on
  `AiVisibilityCompetitorRankingResponse`.
- **`rank`** on `AiVisibilityProviderMetricResponse`.

An average of positions pooled the engines into one number that moved when none of the engines
had moved, and it ordered brands by how high they landed when named rather than by how often
they were named at all — so it could rank a brand above one recommended twice as often.

**There is no replacement average, deliberately.** A brand's standing is now its **presence** on
`summary.marketMap`: the share of usable answers that named it, pooled over the check and up to
four previous published checks, shipped with a 95% interval. Two brands whose intervals overlap
are not ordered, and `rankByPresence` ranks by how often a brand is named, never by how high it
appeared.

Note what did **not** move: `AiVisibilityAnswerBrandResponse.rank` is still there and still means
the position inside one stored answer. It was never an average.

### Removed — the trend point list

- **`AiVisibilityTrendDataPointResponse`** is gone, and with it the `{ items, incompleteCycles }`
  envelope. `cl.aiVisibility.trend()` keeps its name and its path and returns
  `AiVisibilityTrendResponse`: `window`, `scope`, `companies[]` and `events`.

The old shape plotted your rate against a single "top competitor" per point. Measured against
stored history, the per-check rate moved a median of 11 points per check where the windowed
reading moved 2–3, and every large step in the competitor line was the line changing which
company it was about — a chart of its own bookkeeping.

Each company row now carries its reading `now`, its reading at the `start` of the window, and the
difference. **Read `presenceChangeSeparable` before narrating any of it:**

```typescript
const { data } = await cl.aiVisibility.trend('proj_abc');

for (const c of data.item.companies) {
  // WRONG — presenceChange is a number even when it is inside the noise
  if (c.presenceChange && c.presenceChange > 0) report(`${c.name} is up`);

  // right: the intervals have to actually separate
  if (c.presenceChangeSeparable === true && (c.presenceChange ?? 0) > 0) {
    report(`${c.name} is up`);
  }
}
```

Pass `detail: 'series'` for each company's share downsampled to at most 12 points. Under a
`provider` scope, `rank` and `score` are `null` and `enginesBacking` is omitted — there is no
per-engine score, by design.

### Changed — two engines joined, and `AiProvider` widened

**`AiProvider` is now `'openai' | 'claude' | 'gemini' | 'perplexity' | 'google_ai_overviews'`.**
An exhaustive `switch` or a `Record<AiProvider, T>` written against v4 will not compile. That is
the intent — a missing engine should be a build error, not a key that silently reads as zero.

Google AI Overviews answers in prose and ranks nothing. Its entries carry a `name` and a `domain`
and none of the profile fields, and any `rank` on them is **the order of first mention in
`answerText`, computed by CompetLab** — Google assigned no position, so never report it as a rank
Google gave.

### Changed — guaranteed fields that are now optional

This is the quiet half of the release, and the one most likely to reach production before you
notice. These were `required` in v4 and are optional now:

- **`AiVisibilityPerProviderResponse`** and **`AiVisibilityProviderStatusMapResponse`**: `openai`,
  `claude`, `gemini`. A check records the engines it actually asked, so an engine it did not ask
  is **absent** from these records. Absent means not measured — never zero.
- **`AiVisibilityAnswerBrandResponse`**: `description`, `rankingRationale`, `sentiment`,
  `mentionContext`, `targetAudience`, `pricingSignal`, `positionConfidence`, `features`,
  `differentiation`, `messaging`. The chat engines write these per brand; a prose engine does not,
  so they are absent on a Google AI Overviews entry.
- **`AiVisibilityAnswerDifferentiationResponse`**: `axis`, `uniqueValue`.
  **`AiVisibilityAnswerMessagingResponse`**: `keywords`, `credibilitySignals`,
  `differentiationClaims`.

```typescript
// WRONG — reads "this engine was never asked" as "this engine found nothing"
const openaiMentions = data.item.summary.customer.perProvider.openai?.mentionCount ?? 0;

// right: absence is its own answer
const openai = data.item.summary.customer.perProvider.openai;
if (openai) console.log(openai.mentionCount);
else console.log('OpenAI was not among the engines this check asked');
```

### Added — the readings behind the new standing

New exported types, all reachable from `summary`: `AiVisibilityMarketMapResponse` and its brand
rows (presence with its interval, zone, `rankByPresence`, the endorsement and price readings),
`AiVisibilityCustomerStandingResponse` (your readings set interval-against-interval against the
core), `AiVisibilityUntrackedCoreBrandResponse` (core companies you are not tracking),
`AiVisibilityPromptMarketResponse` (whether your prompts are reaching the competitors you track),
`AiVisibilityNoAnswerShownResponse`, and the full `AiSources*` family.

**`noAnswerShown` is not "not mentioned".** It is a third state beside answered and unmeasured:
the engine was read and had no answer to show — today, a Google results page that carried no AI
Overview. It is excluded from every count on the payload rather than scored as a miss, and
reporting it as "0 mentions" or as a failed query are both wrong.

**`BriefingSectionName` gains `deep-ai-sources`**, so the briefing now covers fourteen analysis
areas — six read from stored monitoring checks, eight researched for the briefing alone.

### Fixed

- `explanations` on the tech-trust dashboard is now **absent** where there is nothing to say,
  rather than an empty array. `[]` asserted that we weighed what needed saying and found nothing,
  when in fact sentences existed and were withheld.

## 4.0.0

The API rebuilt how it reads a site's robots.txt, and the shape of the answer changed with it.
Major because seven fields and three types were **deleted, not deprecated** — if you read any of
them, this release breaks your build, which is the point. They were answering a question the API
no longer believes is answerable.

### Removed — the single AI-access verdict

- **`allowsAiAccess`**, **`blockedAiBotsCount`** (tech-trust summary) and **`aiBotsBlocked`**
  (`robotsTxt`) are gone.

  One boolean cannot say whether AI can reach a site, because the map from assistant to crawler is
  neither one-to-one nor symmetric. Microsoft Copilot has no crawler of its own — it grounds on
  the Bing index, so `bingbot` decides it. Gemini Apps is decided by `Google-Extended`, a token
  that fetches nothing at all yet governs both training and that assistant. A site could block
  every OpenAI token by name and still be reachable by an assistant nobody considered, and
  `allowsAiAccess: false` said the opposite.

  There is **no replacement boolean**, deliberately. Read `aiAccess.assistantAccess` and answer
  per assistant.

### Removed — the AI accessibility score

- **`AiCrawlerCheckerAccessibilityResponse`** (`item.accessibility`, the 0–100 `score`, `label`,
  `interpretation`, `color`) and **`typicalScoreRange`** on `industryPosition`.

  The score weighted training crawlers most heavily, so blocking them — a legitimate content
  decision that costs no visibility — marked correct configurations red. It also moved when our
  crawler catalog changed rather than when your site did. Deleted rather than rebalanced, because
  a weighted score over a set we control has no defensible denominator.

- **`AiCrawlerCheckerStrategyResponse`** (`item.strategy`) is gone with it. It sorted crawlers into
  "training vs retrieval", a taxonomy that gets `Google-Extended` silently wrong in the direction
  that flatters you.

- **`AiCrawlerCheckerHeadersResponse`** (`item.headers`) is gone; the homepage read now carries
  that ground.

### Added — `aiAccess`, and one rule that will bite

`TechTrustCompetitorResponse.aiAccess` carries per-assistant reach across six assistants (ChatGPT,
Claude, Perplexity, Microsoft Copilot, Google AI Overviews, Gemini Apps) and per-operator training
access across nine operators. Each verdict names the crawlers that decided it and, where a rule
decided it, that directive verbatim with its line number.

New exported types: `AiAccessResponse`, `AiAccessMeasurementResponse`, `AiAccessSourcesReadResponse`,
`AiAccessSurfaceReadResponse`, `AiAccessExplanationResponse`, `AssistantAccessResponse`,
`ModelTrainingAccessResponse`, `DecidingCrawlerResponse`, `RuleThatMayNotWorkResponse`,
`RuleWithUnintendedScopeResponse`, `AiCrawlerCheckerAccessControlReadResponse`,
`AiCrawlerCheckerHomepageReadResponse`.

**The rule: absent is not empty, and neither is open.** When the robots.txt could not be read,
`assistantAccess` and `modelTrainingAccess` are **omitted entirely**. An empty array would claim
we evaluated all six assistants and none can reach the site — a different fact from "we could not
read the file". So the idiom that looks safe is the bug:

```typescript
const { data } = await cl.techTrust.dashboard(projectId);

for (const c of data.item.competitors) {
  // WRONG — turns "we never measured it" into "nothing can reach them"
  const reach = c.aiAccess?.assistantAccess ?? [];

  // right: branch on the status first
  if (!c.aiAccess) continue;                                   // no AI-access section at all
  switch (c.aiAccess.measurement.status) {
    case 'could_not_measure':
      break;                                                   // no verdicts exist; say so
    case 'measured_no_policy_found':                           // a real 404 on robots.txt —
    case 'measured':                                           // the standard allows everyone
      for (const a of c.aiAccess.assistantAccess ?? []) {
        console.log(a.assistantName, a.crawlerAccessStatus);
      }
  }
}
```

`crawlerAccessStatus` takes `can_reach_site`, `can_reach_part_of_site`, `cannot_reach_site` or
`blocked_but_may_not_be_honoured`. **Partial reach counts as reach** — counting only
`can_reach_site` reported Wikipedia as reachable by none of the six, when the truth was all six
reaching part of it. No count is stored anywhere; take `array.length`, and when you publish it,
name the denominator as our roster rather than as AI in general.

**Those values are documented, not typed.** `crawlerAccessStatus`, `trainingAccessStatus`,
`measurement.status`, `AiAccessSurfaceReadResponse.state`, `crawlerPurpose` and `honoursRobotsTxt`
all generate as `string`, because the API publishes them without an `enum`. So the switch above
compiles with no exhaustiveness checking and a typo in a `case` fails silently at runtime rather
than loudly at build. Until the API declares them, narrow them yourself:

```typescript
const REACH = [
  'can_reach_site', 'can_reach_part_of_site',
  'cannot_reach_site', 'blocked_but_may_not_be_honoured',
] as const;
type Reach = (typeof REACH)[number];

const isReach = (v: string): v is Reach => (REACH as readonly string[]).includes(v);
```

Note the asymmetry while it lasts: the free tool's equivalents on the same spec **do** carry
`enum`, so `AiCrawlerCheckerAccessControlReadResponse.reason` is a real four-value union while the
monitored dimension's neighbours are bare strings.

And a verdict says an assistant is **permitted to fetch** the content. It never says it cites it.

### Changed — reason enums narrowed to what can actually occur

`RobotsTxtUnavailableResponse.reason` went from eight values to **five**, and the free checker's
`AiCrawlerCheckerAccessControlReadResponse.reason` is a different set of **four** — they are not
versions of each other. The removed values were never emittable on those surfaces. Its `state`
likewise drops `not_attempted`, which that fetcher cannot produce since it always attempts every
resource. If you switched exhaustively over these, the removed arms are now unreachable code.

### Changed — trust signals

`categories.disclosures` is now **required** rather than optional, and the taxonomy is 26 signals
across five categories (was 24 across four): a new `disclosures` category holding a privacy-policy
signal, and `hasLGPDNotice` added to `compliance`.

## 3.3.0

### Fixed

- **`fetchUrl` documented a check that never fires.** Where `headersNeeded: true` is blocked by
  behavioural fingerprinting, the JSDoc said `headers` **would be absent**. It isn't — the API
  returns `headers: {}` with `headersAvailable: false`. So the documented check never took its
  branch, and `{}` read as "we looked and the response carried no headers" when the truth is
  "we could not see them". Published in 3.1.0 and 3.2.0; this is the release that corrects it.

  **Branch on `headersAvailable`, never on whether `headers` exists.** `headers` stays optional
  in the type because it is genuinely absent when you pass `headersNeeded: false` — so its
  presence answers "did you ask for headers", not "did we get any".

  ```typescript
  const res = await cl.tools.fetchUrl({ url, headersNeeded: true });

  if (!res.data.item.headers) { /* WRONG — never true when you asked for them */ }
  if (res.data.item.headersAvailable) { /* right: we saw them */ }
  ```

### Added

- **`ContentCategory` is now an exported type.** The twelve-value union 3.2.0 introduced
  generated inline on the parameter, with nothing to import — so narrowing a value meant reaching
  through `Parameters<typeof cl.content.changelog>`. The API now declares it as a named schema:

  ```typescript
  import CompetLab, { type ContentCategory } from '@competlab/sdk';

  const CATEGORIES = [
    'blog', 'docs', 'tools', 'landing', 'caseStudies', 'comparison',
    'integrations', 'changelog', 'webinars', 'legal', 'programmatic', 'other',
  ] as const satisfies readonly ContentCategory[];

  const isCategory = (v: string): v is ContentCategory =>
    (CATEGORIES as readonly string[]).includes(v);
  ```

  The `Parameters<…>` form from 3.2.0 still compiles — it resolves to the same union — so nothing
  needs changing. This is the version worth writing.

## 3.2.0

Two documentation fixes from the API, one of which changes a type. Minor rather than a patch
for the reason below: nothing that worked at runtime breaks, but a build can.

### Changed

- **`content.changelog({ category })` is now a union of the twelve categories** instead of
  `string`. The API has always rejected an unknown category with a `400` — the type just never
  said so, and `category: 'programatic'` compiled. Now it doesn't.

  **This can break a build.** A value that isn't known at compile time — a CLI argument, a
  query-string parameter, a column from a database — no longer assigns to it. Narrow it first:

  ```typescript
  type ChangelogCategory = NonNullable<
    NonNullable<Parameters<typeof cl.content.changelog>[1]>['category']
  >;

  const CATEGORIES = [
    'blog', 'docs', 'tools', 'landing', 'caseStudies', 'comparison',
    'integrations', 'changelog', 'webinars', 'legal', 'programmatic', 'other',
  ] as const satisfies readonly ChangelogCategory[];

  const isCategory = (v: string): v is ChangelogCategory =>
    (CATEGORIES as readonly string[]).includes(v);

  if (isCategory(input)) await cl.content.changelog('proj_abc', { category: input });
  ```

  The `satisfies` clause is the point: if the API adds a thirteenth category, the list above
  fails to compile on the next SDK upgrade rather than silently going stale.

- **The `category` parameter no longer contradicts itself.** Its description still claimed that
  templated pages arrive on changelog entries as `other` and that the dashboard was the only
  place carrying a programmatic total. That stopped being true when the API started categorising
  changelog rows over the whole URL set — which 3.1.0 shipped, while this comment still said
  otherwise on the parameter you read before making the call. Filtering by `programmatic` works,
  and now the JSDoc says so.

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
