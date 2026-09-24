import { createClient, createConfig } from './generated/client';
import type { Client } from './generated/client';
import {
  Health as GenHealth,
  Projects as GenProjects,
  Competitors as GenCompetitors,
  Tech__TrustProfile as GenTechTrust,
  ContentIntelligence as GenContent,
  Positioning as GenPositioning,
  PricingIntelligence as GenPricing,
  AiVisibility as GenAiVisibility,
  AiSources as GenAiSources,
  StrategicBriefing as GenStrategicBriefing,
  StrategicTickets as GenStrategicTickets,
  Alerts as GenAlerts,
  Schedules as GenSchedules,
  Tools as GenTools,
} from './generated/sdk.gen';
import type {
  PublicTechTrustControllerGetTechTrustHistoryV1Data,
  PublicContentControllerGetContentHistoryV1Data,
  PublicContentControllerGetContentChangelogV1Data,
  PublicPositioningControllerGetPositioningHistoryV1Data,
  PublicPricingControllerGetPricingHistoryV1Data,
  PublicAiVisibilityControllerGetAiVisibilityHistoryV1Data,
  PublicAiVisibilityControllerGetAiVisibilityTrendV1Data,
  PublicBriefingControllerGetStrategicBriefingV1Data,
  PublicBriefingControllerGetStrategicBriefingHistoryV1Data,
  PublicBriefingControllerGetStrategicBriefingEditionV1Data,
  PublicAiVisibilityControllerGetAiVisibilityDashboardV1Data,
  PublicAiVisibilityControllerGetAiVisibilityCheckDetailV1Data,
  PublicAiSourcesControllerGetAiSourcesDashboardV1Data,
  PublicAiSourcesControllerGetAiSourcesHistoryV1Data,
  PublicAiSourcesControllerGetAiSourcesCheckDetailV1Data,
  PublicAlertsControllerListAlertsV1Data,
  PublicTicketsControllerListTicketsV1Data,
  CreateTicketRequestDto,
  UpdateTicketRequestDto,
  MoveTicketRequestDto,
  CreateTicketCommentRequestDto,
  UpdateTicketCommentRequestDto,
  CreateTicketLabelRequestDto,
  UpdateTicketLabelRequestDto,
  PtTechStackRequestDto,
  PtTrustSignalsRequestDto,
  PtAiCrawlerCheckerRequestDto,
  PtSitemapVisualizerRequestDto,
  PtAgentAdoptionRequestDto,
  PtFetchUrlRequestDto,
  ApiUnauthorizedErrorResponse,
  ApiNotFoundErrorResponse,
  ApiPaymentRequiredErrorResponse,
  ApiForbiddenErrorResponse,
  ApiValidationErrorResponse,
  ApiRateLimitErrorResponse,
  ApiBadGatewayErrorResponse,
  ApiServiceUnavailableErrorResponse,
  TechStackScanErrorResponse,
  TrustSignalsScanErrorResponse,
  AgentAdoptionScanErrorResponse,
} from './generated/types.gen';

export type { Client } from './generated/client';
export type * from './generated/types.gen';

/**
 * Every error code the API documents, derived from the generated types rather than
 * listed here.
 *
 * Deliberately not hand-written. A literal list is a copy of a contract, and a copy
 * drifts silently — this one was already three codes short of what the API emits
 * before the spec caught up. Regenerating now updates it on its own.
 */
export type CompetLabApiErrorCode =
  | ApiUnauthorizedErrorResponse['code']
  | ApiNotFoundErrorResponse['code']
  | ApiPaymentRequiredErrorResponse['code']
  | ApiForbiddenErrorResponse['code']
  | ApiValidationErrorResponse['code']
  | ApiRateLimitErrorResponse['code']
  | ApiBadGatewayErrorResponse['code']
  | ApiServiceUnavailableErrorResponse['code']
  | TechStackScanErrorResponse['code']
  | TrustSignalsScanErrorResponse['code']
  | AgentAdoptionScanErrorResponse['code'];

/** Codes the SDK raises itself, when the failure never produced an API error envelope. */
export type CompetLabClientErrorCode = 'network_error' | 'http_error' | 'unknown_error';

/**
 * The documented codes, while still accepting an undocumented one.
 *
 * The `(string & {})` arm is deliberate. A closed union would be a type that lies
 * the day the API adds a code — it cannot refuse to arrive at runtime just because
 * this union hasn't been regenerated. This way the known codes autocomplete and a
 * new one still type-checks.
 */
export type CompetLabErrorCode = CompetLabApiErrorCode | CompetLabClientErrorCode | (string & {});

/** Longest error message the SDK will carry; HTML error pages are otherwise unbounded. */
const MAX_ERROR_MESSAGE = 500;

const truncate = (text: string): string =>
  text.length > MAX_ERROR_MESSAGE ? `${text.slice(0, MAX_ERROR_MESSAGE)}…` : text;

export class CompetLabError extends Error {
  readonly status: number;
  readonly code: CompetLabErrorCode;

  constructor(status: number, code: CompetLabErrorCode, message: string) {
    super(message);
    this.name = 'CompetLabError';
    this.status = status;
    this.code = code;
  }
}

/**
 * `null` means we did not measure it — never zero, never empty, never "no".
 * A measured `0` or `false` is reported as itself and is a real finding.
 *
 * These exist because `??`, `||` and a bare truthiness test all read `null` as
 * "fall through to a default", and TypeScript accepts every one of them. A single
 * `?? 0` puts back exactly the placeholder the API stopped sending.
 */

/** True when the value was actually measured. Narrows away `null` and `undefined`. */
export function isMeasured<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * True only for a measured affirmative. Use instead of `if (value)` wherever the
 * truthy branch states a claim, so an unmeasured `null` cannot reach it.
 */
export function isMeasuredTrue(value: boolean | null | undefined): boolean {
  return value === true;
}

/**
 * True only for a measured negative — we looked, and the answer was no.
 *
 * The one most easily got wrong: `!value` is also true for `null`, so a bare
 * negation reads "we didn't measure it" as "they don't have it".
 */
export function isMeasuredFalse(value: boolean | null | undefined): boolean {
  return value === false;
}

export interface CompetLabOptions {
  apiKey: string;
  baseUrl?: string;
}

class CompetLab {
  readonly #client: Client;

  readonly health: CompetLab.Health;
  readonly projects: CompetLab.Projects;
  readonly competitors: CompetLab.Competitors;
  readonly techTrust: CompetLab.TechTrust;
  readonly content: CompetLab.Content;
  readonly positioning: CompetLab.Positioning;
  readonly pricing: CompetLab.Pricing;
  readonly aiVisibility: CompetLab.AiVisibility;
  readonly aiSources: CompetLab.AiSources;
  readonly strategicBriefing: CompetLab.StrategicBriefing;
  readonly tickets: CompetLab.Tickets;
  readonly alerts: CompetLab.Alerts;
  readonly schedules: CompetLab.Schedules;
  readonly tools: CompetLab.Tools;

  constructor(options: CompetLabOptions) {
    this.#client = createClient(
      createConfig({
        baseUrl: options.baseUrl ?? 'https://api.competlab.com',
        auth: options.apiKey,
        throwOnError: true,
      }),
    );

    this.#client.interceptors.error.use((_error, response) => {
      // API error envelope: { error: { status, code, message } }
      if (_error && typeof _error === 'object' && 'error' in _error) {
        const apiErr = (_error as { error: { status?: number; code?: string; message?: string } }).error;
        return new CompetLabError(
          apiErr.status ?? response?.status ?? 0,
          apiErr.code ?? 'unknown_error',
          apiErr.message ?? 'An unknown error occurred',
        );
      }

      // A body that isn't JSON at all — an ingress HTML page, a plain-text 502.
      // The whole document would otherwise become the message.
      if (typeof _error === 'string') {
        return new CompetLabError(
          response?.status ?? 0,
          'http_error',
          truncate(_error) || `HTTP ${response?.status ?? 0}`,
        );
      }

      // Valid JSON, but not our envelope — a proxy or gateway answering instead of
      // the API. `String(obj)` here would produce the literal '[object Object]'.
      if (_error && typeof _error === 'object' && !(_error instanceof Error)) {
        return new CompetLabError(
          response?.status ?? 0,
          'http_error',
          truncate(JSON.stringify(_error)),
        );
      }

      // The request never produced a response: DNS, TLS, timeout, abort.
      return new CompetLabError(
        response?.status ?? 0,
        'network_error',
        _error instanceof Error ? _error.message : truncate(String(_error)),
      );
    });

    this.health = new CompetLab.Health(this.#client);
    this.projects = new CompetLab.Projects(this.#client);
    this.competitors = new CompetLab.Competitors(this.#client);
    this.techTrust = new CompetLab.TechTrust(this.#client);
    this.content = new CompetLab.Content(this.#client);
    this.positioning = new CompetLab.Positioning(this.#client);
    this.pricing = new CompetLab.Pricing(this.#client);
    this.aiVisibility = new CompetLab.AiVisibility(this.#client);
    this.aiSources = new CompetLab.AiSources(this.#client);
    this.strategicBriefing = new CompetLab.StrategicBriefing(this.#client);
    this.tickets = new CompetLab.Tickets(this.#client);
    this.alerts = new CompetLab.Alerts(this.#client);
    this.schedules = new CompetLab.Schedules(this.#client);
    this.tools = new CompetLab.Tools(this.#client);
  }
}

namespace CompetLab {
  export class Health {
    constructor(private readonly client: Client) {}

    check() {
      return GenHealth.publicHealthControllerGetHealthV1({
        client: this.client,
        throwOnError: true,
      });
    }
  }

  export class Projects {
    constructor(private readonly client: Client) {}

    list() {
      return GenProjects.publicProjectsControllerListProjectsV1({
        client: this.client,
        throwOnError: true,
      });
    }

    get(projectId: string) {
      return GenProjects.publicProjectsControllerGetProjectV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
      });
    }
  }

  export class Competitors {
    constructor(private readonly client: Client) {}

    list(projectId: string) {
      return GenCompetitors.publicCompetitorsControllerListCompetitorsV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
      });
    }

    get(projectId: string, competitorId: string) {
      return GenCompetitors.publicCompetitorsControllerGetCompetitorV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, competitorId },
      });
    }
  }

  export class TechTrust {
    constructor(private readonly client: Client) {}

    dashboard(projectId: string) {
      return GenTechTrust.publicTechTrustControllerGetTechTrustDashboardV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
      });
    }

    history(projectId: string, query?: PublicTechTrustControllerGetTechTrustHistoryV1Data['query']) {
      return GenTechTrust.publicTechTrustControllerGetTechTrustHistoryV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    runDetail(projectId: string, runId: string) {
      return GenTechTrust.publicTechTrustControllerGetTechTrustRunDetailV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, runId },
      });
    }
  }

  export class Content {
    constructor(private readonly client: Client) {}

    dashboard(projectId: string) {
      return GenContent.publicContentControllerGetContentDashboardV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
      });
    }

    history(projectId: string, query?: PublicContentControllerGetContentHistoryV1Data['query']) {
      return GenContent.publicContentControllerGetContentHistoryV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    runDetail(projectId: string, runId: string) {
      return GenContent.publicContentControllerGetContentRunDetailV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, runId },
      });
    }

    changelog(projectId: string, query?: PublicContentControllerGetContentChangelogV1Data['query']) {
      return GenContent.publicContentControllerGetContentChangelogV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }
  }

  export class Positioning {
    constructor(private readonly client: Client) {}

    dashboard(projectId: string) {
      return GenPositioning.publicPositioningControllerGetPositioningDashboardV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
      });
    }

    history(projectId: string, query?: PublicPositioningControllerGetPositioningHistoryV1Data['query']) {
      return GenPositioning.publicPositioningControllerGetPositioningHistoryV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    runDetail(projectId: string, runId: string) {
      return GenPositioning.publicPositioningControllerGetPositioningRunDetailV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, runId },
      });
    }
  }

  export class Pricing {
    constructor(private readonly client: Client) {}

    dashboard(projectId: string) {
      return GenPricing.publicPricingControllerGetPricingDashboardV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
      });
    }

    history(projectId: string, query?: PublicPricingControllerGetPricingHistoryV1Data['query']) {
      return GenPricing.publicPricingControllerGetPricingHistoryV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    runDetail(projectId: string, runId: string) {
      return GenPricing.publicPricingControllerGetPricingRunDetailV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, runId },
      });
    }
  }

  export class AiVisibility {
    constructor(private readonly client: Client) {}

    dashboard(
      projectId: string,
      query?: PublicAiVisibilityControllerGetAiVisibilityDashboardV1Data['query'],
    ) {
      return GenAiVisibility.publicAiVisibilityControllerGetAiVisibilityDashboardV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    history(projectId: string, query?: PublicAiVisibilityControllerGetAiVisibilityHistoryV1Data['query']) {
      return GenAiVisibility.publicAiVisibilityControllerGetAiVisibilityHistoryV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    checkDetail(
      projectId: string,
      checkId: string,
      query?: PublicAiVisibilityControllerGetAiVisibilityCheckDetailV1Data['query'],
    ) {
      return GenAiVisibility.publicAiVisibilityControllerGetAiVisibilityCheckDetailV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, checkId },
        query,
      });
    }

    trend(projectId: string, query?: PublicAiVisibilityControllerGetAiVisibilityTrendV1Data['query']) {
      return GenAiVisibility.publicAiVisibilityControllerGetAiVisibilityTrendV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }
  }

  /**
   * The pages Perplexity and Google AI Overviews retrieved while answering a
   * project's buying questions, and whether those pages name the brand.
   *
   * Three rules govern every figure this returns, and all three are easy to
   * break by accident when reading the payload:
   *
   * - **Retrieved, never cited.** An engine hands back the pages it pulled
   *   while answering; it does not say which of them it leaned on. No count
   *   here is a citation count.
   * - **Per engine, never pooled.** The engines read different pages, so page
   *   counts are per engine and adding them describes a list neither produced.
   *   Answers may pool as a vote; pages may not.
   * - **Counts, never rates.** Report figures as `n of N answers`. The question
   *   set is small by design, so a share computed from it is false precision.
   *
   * A page that could not be read is listed with its reason and is never a page
   * the brand is absent from — only a core host whose `status` is `missing`
   * supports "get onto this page".
   */
  export class AiSources {
    constructor(private readonly client: Client) {}

    dashboard(projectId: string, query?: PublicAiSourcesControllerGetAiSourcesDashboardV1Data['query']) {
      return GenAiSources.publicAiSourcesControllerGetAiSourcesDashboardV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    history(projectId: string, query?: PublicAiSourcesControllerGetAiSourcesHistoryV1Data['query']) {
      return GenAiSources.publicAiSourcesControllerGetAiSourcesHistoryV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    checkDetail(
      projectId: string,
      checkId: string,
      query?: PublicAiSourcesControllerGetAiSourcesCheckDetailV1Data['query'],
    ) {
      return GenAiSources.publicAiSourcesControllerGetAiSourcesCheckDetailV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, checkId },
        query,
      });
    }
  }

  export class StrategicBriefing {
    constructor(private readonly client: Client) {}

    get(projectId: string, query?: PublicBriefingControllerGetStrategicBriefingV1Data['query']) {
      return GenStrategicBriefing.publicBriefingControllerGetStrategicBriefingV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    history(
      projectId: string,
      query?: PublicBriefingControllerGetStrategicBriefingHistoryV1Data['query'],
    ) {
      return GenStrategicBriefing.publicBriefingControllerGetStrategicBriefingHistoryV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    edition(
      projectId: string,
      runId: string,
      query?: PublicBriefingControllerGetStrategicBriefingEditionV1Data['query'],
    ) {
      return GenStrategicBriefing.publicBriefingControllerGetStrategicBriefingEditionV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, runId },
        query,
      });
    }
  }

  /**
   * The project's Strategic Tickets board — the only part of the API that writes.
   *
   * Every method needs an active subscription (`402 subscription_required`); every
   * method that writes needs a `read_write` key (`403 insufficient_scope`). A finished
   * Strategic Briefing opens its recommendations here: `list(projectId, { origin:
   * 'briefing', briefingRunId })` is what one edition opened.
   */
  export class Tickets {
    readonly comments: TicketComments;
    readonly labels: TicketLabels;

    constructor(private readonly client: Client) {
      this.comments = new TicketComments(client);
      this.labels = new TicketLabels(client);
    }

    list(projectId: string, query?: PublicTicketsControllerListTicketsV1Data['query']) {
      return GenStrategicTickets.publicTicketsControllerListTicketsV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }

    get(projectId: string, ticketId: string) {
      return GenStrategicTickets.publicTicketsControllerGetTicketV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, ticketId },
      });
    }

    create(projectId: string, body: CreateTicketRequestDto) {
      return GenStrategicTickets.publicTicketsControllerCreateTicketV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        body,
      });
    }

    /** `null` clears a field and an omitted one is left alone; the description clears with `""`, labels with `[]`. */
    update(projectId: string, ticketId: string, body: UpdateTicketRequestDto) {
      return GenStrategicTickets.publicTicketsControllerUpdateTicketV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, ticketId },
        body,
      });
    }

    /** A move names neighbours, not a position: the ticket above (`beforeId`) and below (`afterId`). */
    move(projectId: string, ticketId: string, body: MoveTicketRequestDto) {
      return GenStrategicTickets.publicTicketsControllerMoveTicketV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, ticketId },
        body,
      });
    }

    /** Read `deletable` first — a ticket a Strategic Briefing opened cannot be deleted; dismiss it instead. */
    delete(projectId: string, ticketId: string) {
      return GenStrategicTickets.publicTicketsControllerDeleteTicketV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, ticketId },
      });
    }

    /** The people a ticket can be assigned to. */
    assignees(projectId: string) {
      return GenStrategicTickets.publicTicketsControllerListAssigneesV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
      });
    }
  }

  export class TicketComments {
    constructor(private readonly client: Client) {}

    list(projectId: string, ticketId: string) {
      return GenStrategicTickets.publicTicketsControllerListCommentsV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, ticketId },
      });
    }

    create(projectId: string, ticketId: string, body: CreateTicketCommentRequestDto) {
      return GenStrategicTickets.publicTicketsControllerCreateCommentV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, ticketId },
        body,
      });
    }

    /** Only a comment written through the API; one a person wrote in the app answers `403 forbidden`. */
    update(
      projectId: string,
      ticketId: string,
      commentId: string,
      body: UpdateTicketCommentRequestDto,
    ) {
      return GenStrategicTickets.publicTicketsControllerUpdateCommentV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, ticketId, commentId },
        body,
      });
    }

    delete(projectId: string, ticketId: string, commentId: string) {
      return GenStrategicTickets.publicTicketsControllerDeleteCommentV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, ticketId, commentId },
      });
    }
  }

  export class TicketLabels {
    constructor(private readonly client: Client) {}

    list(projectId: string) {
      return GenStrategicTickets.publicTicketsControllerListLabelsV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
      });
    }

    create(projectId: string, body: CreateTicketLabelRequestDto) {
      return GenStrategicTickets.publicTicketsControllerCreateLabelV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        body,
      });
    }

    /** Rename or recolour. */
    update(projectId: string, labelId: string, body: UpdateTicketLabelRequestDto) {
      return GenStrategicTickets.publicTicketsControllerUpdateLabelV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, labelId },
        body,
      });
    }

    delete(projectId: string, labelId: string) {
      return GenStrategicTickets.publicTicketsControllerDeleteLabelV1({
        client: this.client,
        throwOnError: true,
        path: { projectId, labelId },
      });
    }
  }

  export class Alerts {
    constructor(private readonly client: Client) {}

    list(projectId: string, query?: PublicAlertsControllerListAlertsV1Data['query']) {
      return GenAlerts.publicAlertsControllerListAlertsV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
        query,
      });
    }
  }

  export class Schedules {
    constructor(private readonly client: Client) {}

    list(projectId: string) {
      return GenSchedules.publicSchedulesControllerListSchedulesV1({
        client: this.client,
        throwOnError: true,
        path: { projectId },
      });
    }
  }

  export class TechStackScans {
    constructor(private readonly client: Client) {}

    startScan(body: PtTechStackRequestDto) {
      return GenTools.publicTechStackToolControllerCreateScanV1({
        client: this.client,
        throwOnError: true,
        body,
      });
    }

    getScan(scanId: string) {
      return GenTools.publicTechStackToolControllerGetScanV1({
        client: this.client,
        throwOnError: true,
        path: { scanId },
      });
    }
  }

  export class TrustSignalsScans {
    constructor(private readonly client: Client) {}

    startScan(body: PtTrustSignalsRequestDto) {
      return GenTools.publicTrustSignalsToolControllerCreateScanV1({
        client: this.client,
        throwOnError: true,
        body,
      });
    }

    getScan(scanId: string) {
      return GenTools.publicTrustSignalsToolControllerGetScanV1({
        client: this.client,
        throwOnError: true,
        path: { scanId },
      });
    }
  }

  export class AgentAdoptionScans {
    constructor(private readonly client: Client) {}

    startScan(body: PtAgentAdoptionRequestDto) {
      return GenTools.publicAgentAdoptionToolControllerCreateScanV1({
        client: this.client,
        throwOnError: true,
        body,
      });
    }

    getScan(scanId: string) {
      return GenTools.publicAgentAdoptionToolControllerGetScanV1({
        client: this.client,
        throwOnError: true,
        path: { scanId },
      });
    }
  }

  export class Tools {
    readonly techStack: TechStackScans;
    readonly trustSignals: TrustSignalsScans;
    readonly agentAdoption: AgentAdoptionScans;

    constructor(private readonly client: Client) {
      this.techStack = new TechStackScans(client);
      this.trustSignals = new TrustSignalsScans(client);
      this.agentAdoption = new AgentAdoptionScans(client);
    }

    sitemapVisualizer(body: PtSitemapVisualizerRequestDto) {
      return GenTools.publicSitemapVisualizerToolControllerAnalyzeSitemapV1({
        client: this.client,
        throwOnError: true,
        body,
      });
    }

    aiCrawlerChecker(body: PtAiCrawlerCheckerRequestDto) {
      return GenTools.publicAiCrawlerCheckerToolControllerDetectAiCrawlersV1({
        client: this.client,
        throwOnError: true,
        body,
      });
    }

    fetchUrl(body: PtFetchUrlRequestDto) {
      return GenTools.publicFetchUrlToolControllerFetchUrlV1({
        client: this.client,
        throwOnError: true,
        body,
      });
    }
  }
}

export default CompetLab;
