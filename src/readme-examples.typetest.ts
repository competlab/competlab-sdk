/**
 * The code snippets published in README.md and CHANGELOG.md, compiled.
 *
 * Nothing imports this file — it exists so `npm run typecheck` fails when a
 * documented example stops matching the generated types. A README example is a
 * contract with a reader who will paste it, and the two artifacts drift the way
 * every pair of hand-kept copies drifts: silently, in the direction of the one
 * nobody compiles. Its first run caught a `summary.perProvider` that has always
 * lived at `summary.customer.perProvider`.
 *
 * Keep the snippets here byte-identical to the docs, wrong-then-right pairs
 * included — the WRONG line must compile, or it would not be a trap worth
 * warning about. It is excluded from the bundle by not being reachable from
 * `src/index.ts`, and from the package by `files` in package.json.
 */
import CompetLab, { isMeasured, type AiProvider } from './index';

declare function report(msg: string): void;

const cl = new CompetLab({ apiKey: 'cl_live_placeholder' });

async function aiSourcesExamples() {
  const { data } = await cl.aiSources.dashboard('proj_abc');

  const verdict: 'recommended_nowhere' | 'named_on_most_core_hosts' | 'missing_from_most_core_hosts' =
    data.item.summary.verdict;
  report(verdict);

  const work = data.item.summary.coreHosts.filter((h) => h.status === 'missing');
  for (const host of work) {
    report(`${host.host} ${host.ownership} ${host.actionHint.text}`);
  }

  const hosts = data.item.summary.coreHosts;
  const wrong = hosts.filter((h) => h.status !== 'already_named');
  const toWork = hosts.filter((h) => h.status === 'missing');
  report(`${wrong.length} ${toWork.length}`);

  for (const sentence of data.item.summary.limits.sentences) {
    report(sentence.text);
  }

  await cl.aiSources.dashboard('proj_abc', { includeAnswers: true, engine: 'perplexity', promptIndex: 0 });
  await cl.aiSources.history('proj_abc', { page: 1, limit: 10 });
  await cl.aiSources.checkDetail('proj_abc', 'chk_1', { includeAnswers: true });
}

async function trendExamples() {
  const { data } = await cl.aiVisibility.trend('proj_abc');

  report(`${data.item.window.from} ${data.item.window.to} ${data.item.scope}`);
  report(String(data.item.events.promptsLastChangedAt));

  for (const c of data.item.companies) {
    if (c.presenceChange && c.presenceChange > 0) report(`${c.name} is up`);

    if (c.presenceChangeSeparable === true && (c.presenceChange ?? 0) > 0) {
      report(`${c.name} is up`);
    }

    report(String(c.now.presence.answersNaming));
    report(String(c.start?.presence.presence));
  }

  await cl.aiVisibility.trend('proj_abc', { provider: 'perplexity', detail: 'series' });
}

async function perProviderExample() {
  const { data } = await cl.aiVisibility.dashboard('proj_abc');

  const openaiMentions = data.item.summary.customer.perProvider.openai?.mentionCount ?? 0;
  report(String(openaiMentions));

  const openai = data.item.summary.customer.perProvider.openai;
  if (openai) report(String(openai.mentionCount));
  else report('OpenAI was not among the engines this check asked');

  await cl.aiVisibility.dashboard('proj_abc', {
    includeAnswers: true,
    brand: 'rival.com',
  });
}

// The widened engine roster — this list must be exhaustive or the build fails.
const everyEngine: Record<AiProvider, true> = {
  openai: true,
  claude: true,
  gemini: true,
  perplexity: true,
  google_ai_overviews: true,
};

export { aiSourcesExamples, trendExamples, perProviderExample, everyEngine };

async function ticketExamples() {
  const { data } = await cl.strategicBriefing.get('proj_abc');

  const deep = await cl.strategicBriefing.get('proj_abc', {
    sections: ['deep-ai-visibility'],
    includeCharts: true,
  });
  report(String(deep.data.meta.status));

  const { data: board } = await cl.tickets.list('proj_abc', {
    origin: 'briefing',
    briefingRunId: data.meta.runId!,
  });
  report(String(board.items.length));

  // A page at a time: pagination.total counts every match, byStatus the matches per column.
  const { data: page } = await cl.tickets.list('proj_abc', { status: ['triage', 'todo'], sort: 'priority' });
  report(`${page.pagination.total} ${page.byStatus.todo}`);

  const { data: created } = await cl.tickets.create('proj_abc', {
    title: 'Answer the pricing-page objection Acme now leads with',
    status: 'todo',
  });
  const ticketId = created.item.id;

  // Name the tickets it sits between (beforeId above, afterId below), or a position. Naming nothing
  // puts it at the bottom of the column; placement says where it landed.
  const { data: moved } = await cl.tickets.move('proj_abc', ticketId, { status: 'in_progress', position: 'top' });
  report(String(moved.placement.below?.number));

  // On an update, null clears a field and an omitted field is left alone.
  await cl.tickets.update('proj_abc', ticketId, { dueDate: null });

  await cl.tickets.comments.create('proj_abc', ticketId, { body: 'Draft is in the doc.' });

  // After (v6.x) — the recommendations are tickets on the board:
  const recs = await cl.tickets.list('proj_abc', { origin: 'briefing' });
  report(String(recs.data.items.length));
}
void ticketExamples;

async function marketMapExamples() {
  const { data } = await cl.aiVisibility.dashboard('proj_abc');
  const map = data.item.summary.marketMap;

  const you = map.brands.find((b) => b.isOwn);
  report(String(you?.rankByPresence === null));
  report(`${map.coreSize} ${map.brandsPage?.total}`);

  await cl.aiVisibility.dashboard('proj_abc', { mapOffset: 10, mapLimit: 50 });
  await cl.aiVisibility.dashboard('proj_abc', { view: 'full' });
  await cl.aiSources.dashboard('proj_abc', { pagesHost: 'g2.com' });
}

// CHANGELOG 7.0.0, the "After" halves.
async function sevenZeroExamples() {
  const { data: page } = await cl.aiVisibility.dashboard('proj_abc');
  const { total, hasMore } = page.item.summary.marketMap.brandsPage!;
  const { data: whole } = await cl.aiVisibility.dashboard('proj_abc', { view: 'full' });
  report(`${total} ${hasMore} ${whole.item.summary.marketMap.brands.length}`);

  const { data: tickets } = await cl.tickets.list('proj_abc', { status: ['triage', 'todo'], sort: 'priority' });
  const { total: ticketTotal, hasMore: moreTickets } = tickets.pagination;
  const todo = tickets.byStatus.todo;
  report(`${ticketTotal} ${moreTickets} ${todo}`);
}

// README "Reading the data", the pricing check's halves, WRONG lines included.
async function pricingNullExamples() {
  const { data } = await cl.pricing.dashboard('proj_abc');
  const rival = data.item.companies.find((c) => !c.isSelf)!; // facts: PricingFactResponse[] | null

  if (!rival.facts?.length) { /* WRONG — also true when we never read its pricing page */ }
  const facts = rival.facts ?? []; //  WRONG — invents a page we read and found empty
  report(String(facts.length));

  if (isMeasured(rival.facts)) {
    console.log(`${rival.facts.length} facts read`); // narrowed to the list, no cast needed
  } else {
    console.log(`not read: ${rival.factsAvailable?.reason}`); // never_read or no_page
  }

  const alerts = await cl.alerts.list('proj_abc', {
    dimension: 'pricing',
    level: 'now' // "Tell me now"; this_week is "Tell me this week", record is "Keep a record"
  });
  report(String(alerts.data.items.length));
}

// CHANGELOG 8.0.0, the "After" half.
async function eightZeroExamples() {
  const { data: check } = await cl.pricing.dashboard('proj_abc');
  const setup = check.item.setups?.[0];
  const place = setup?.customerRank; // with setup.of: "2nd cheapest of 3"
  const { data: full } = await cl.pricing.dashboard('proj_abc', { view: 'full' });
  const { data: since } = await cl.pricing.history('proj_abc', { since: '2026-05-01' });
  const price = full.item.companies[0]?.facts?.[0]?.price;
  const currency: string | null | undefined = price?.currency;
  report(`${place} ${since.items.length} ${currency}`);
}

// README "Reading the data", the positioning check's paragraph (9.0.0).
async function positioningNullExamples() {
  const { data: pos } = await cl.positioning.dashboard('proj_abc'); // compact: each claim's kind and value
  const rival = pos.item.companies.find((c) => !c.isSelf)!; // claims: PositioningClaimResponse[] | null

  if (isMeasured(rival.claims)) {
    const headline = rival.claims.find((claim) => claim.kind === 'headline');
    console.log(`${rival.name ?? rival.domain} says '${headline?.value}'`); // the page's own words
  } else {
    console.log(`not read: ${rival.claimsAvailable?.reason}`); // never_read, no_page or not_judged
  }

  for (const claim of pos.item.yourClaims ?? []) {
    console.log(claim.value, claim.saidBy.length === 0 ? '— nobody else says it on the homepages read' : claim.saidBy.map((s) => s.quote));
  }

  const { data: full } = await cl.positioning.runDetail('proj_abc', 'run_1', { view: 'full' });
  const { data: since } = await cl.positioning.history('proj_abc', { since: '2026-10-01' });
  console.log(full.item.companies[0]?.claims?.[0]?.quote, since.items[0]?.changes[0]?.field);
}

export { marketMapExamples, sevenZeroExamples, pricingNullExamples, eightZeroExamples, positioningNullExamples };
