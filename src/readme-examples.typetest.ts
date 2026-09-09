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
import CompetLab, { type AiProvider } from './index';

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
