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
  Analysis as GenAnalysis,
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
  PublicAlertsControllerListAlertsV1Data,
  PtTechStackRequestDto,
  PtTrustSignalsRequestDto,
  PtAiCrawlerCheckerRequestDto,
  PtSitemapVisualizerRequestDto,
  PtAgentAdoptionRequestDto,
  PtFetchUrlRequestDto,
} from './generated/types.gen';

export type { Client } from './generated/client';
export type * from './generated/types.gen';

export class CompetLabError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'CompetLabError';
    this.status = status;
    this.code = code;
  }
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
  readonly analysis: CompetLab.Analysis;
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
      // Network error or unparseable response
      return new CompetLabError(
        response?.status ?? 0,
        'network_error',
        _error instanceof Error ? _error.message : String(_error),
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
    this.analysis = new CompetLab.Analysis(this.#client);
    this.alerts = new CompetLab.Alerts(this.#client);
    this.schedules = new CompetLab.Schedules(this.#client);
    this.tools = new CompetLab.Tools(this.#client);
  }
}

namespace CompetLab {
  export class Health {
    constructor(private readonly client: Client) {}

    check() {
      return GenHealth.publicHealthControllerGetHealthV1({ client: this.client });
    }
  }

  export class Projects {
    constructor(private readonly client: Client) {}

    list() {
      return GenProjects.publicProjectsControllerListProjectsV1({
        client: this.client,
      });
    }

    get(projectId: string) {
      return GenProjects.publicProjectsControllerGetProjectV1({
        client: this.client,
        path: { projectId },
      });
    }
  }

  export class Competitors {
    constructor(private readonly client: Client) {}

    list(projectId: string) {
      return GenCompetitors.publicCompetitorsControllerListCompetitorsV1({
        client: this.client,
        path: { projectId },
      });
    }

    get(projectId: string, competitorId: string) {
      return GenCompetitors.publicCompetitorsControllerGetCompetitorV1({
        client: this.client,
        path: { projectId, competitorId },
      });
    }
  }

  export class TechTrust {
    constructor(private readonly client: Client) {}

    dashboard(projectId: string) {
      return GenTechTrust.publicTechTrustControllerGetTechTrustDashboardV1({
        client: this.client,
        path: { projectId },
      });
    }

    history(projectId: string, query?: PublicTechTrustControllerGetTechTrustHistoryV1Data['query']) {
      return GenTechTrust.publicTechTrustControllerGetTechTrustHistoryV1({
        client: this.client,
        path: { projectId },
        query,
      });
    }

    runDetail(projectId: string, runId: string) {
      return GenTechTrust.publicTechTrustControllerGetTechTrustRunDetailV1({
        client: this.client,
        path: { projectId, runId },
      });
    }
  }

  export class Content {
    constructor(private readonly client: Client) {}

    dashboard(projectId: string) {
      return GenContent.publicContentControllerGetContentDashboardV1({
        client: this.client,
        path: { projectId },
      });
    }

    history(projectId: string, query?: PublicContentControllerGetContentHistoryV1Data['query']) {
      return GenContent.publicContentControllerGetContentHistoryV1({
        client: this.client,
        path: { projectId },
        query,
      });
    }

    runDetail(projectId: string, runId: string) {
      return GenContent.publicContentControllerGetContentRunDetailV1({
        client: this.client,
        path: { projectId, runId },
      });
    }

    changelog(projectId: string, query?: PublicContentControllerGetContentChangelogV1Data['query']) {
      return GenContent.publicContentControllerGetContentChangelogV1({
        client: this.client,
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
        path: { projectId },
      });
    }

    history(projectId: string, query?: PublicPositioningControllerGetPositioningHistoryV1Data['query']) {
      return GenPositioning.publicPositioningControllerGetPositioningHistoryV1({
        client: this.client,
        path: { projectId },
        query,
      });
    }

    runDetail(projectId: string, runId: string) {
      return GenPositioning.publicPositioningControllerGetPositioningRunDetailV1({
        client: this.client,
        path: { projectId, runId },
      });
    }
  }

  export class Pricing {
    constructor(private readonly client: Client) {}

    dashboard(projectId: string) {
      return GenPricing.publicPricingControllerGetPricingDashboardV1({
        client: this.client,
        path: { projectId },
      });
    }

    history(projectId: string, query?: PublicPricingControllerGetPricingHistoryV1Data['query']) {
      return GenPricing.publicPricingControllerGetPricingHistoryV1({
        client: this.client,
        path: { projectId },
        query,
      });
    }

    runDetail(projectId: string, runId: string) {
      return GenPricing.publicPricingControllerGetPricingRunDetailV1({
        client: this.client,
        path: { projectId, runId },
      });
    }
  }

  export class AiVisibility {
    constructor(private readonly client: Client) {}

    dashboard(projectId: string) {
      return GenAiVisibility.publicAiVisibilityControllerGetAiVisibilityDashboardV1({
        client: this.client,
        path: { projectId },
      });
    }

    history(projectId: string, query?: PublicAiVisibilityControllerGetAiVisibilityHistoryV1Data['query']) {
      return GenAiVisibility.publicAiVisibilityControllerGetAiVisibilityHistoryV1({
        client: this.client,
        path: { projectId },
        query,
      });
    }

    checkDetail(projectId: string, checkId: string) {
      return GenAiVisibility.publicAiVisibilityControllerGetAiVisibilityCheckDetailV1({
        client: this.client,
        path: { projectId, checkId },
      });
    }

    trend(projectId: string, query?: PublicAiVisibilityControllerGetAiVisibilityTrendV1Data['query']) {
      return GenAiVisibility.publicAiVisibilityControllerGetAiVisibilityTrendV1({
        client: this.client,
        path: { projectId },
        query,
      });
    }
  }

  export class Analysis {
    constructor(private readonly client: Client) {}

    actionPlan(projectId: string) {
      return GenAnalysis.publicAnalysisControllerGetActionPlanV1({
        client: this.client,
        path: { projectId },
      });
    }
  }

  export class Alerts {
    constructor(private readonly client: Client) {}

    list(projectId: string, query?: PublicAlertsControllerListAlertsV1Data['query']) {
      return GenAlerts.publicAlertsControllerListAlertsV1({
        client: this.client,
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
        path: { projectId },
      });
    }
  }

  export class TechStackScans {
    constructor(private readonly client: Client) {}

    startScan(body: PtTechStackRequestDto) {
      return GenTools.publicTechStackToolControllerCreateScanV1({
        client: this.client,
        body,
      });
    }

    getScan(scanId: string) {
      return GenTools.publicTechStackToolControllerGetScanV1({
        client: this.client,
        path: { scanId },
      });
    }
  }

  export class TrustSignalsScans {
    constructor(private readonly client: Client) {}

    startScan(body: PtTrustSignalsRequestDto) {
      return GenTools.publicTrustSignalsToolControllerCreateScanV1({
        client: this.client,
        body,
      });
    }

    getScan(scanId: string) {
      return GenTools.publicTrustSignalsToolControllerGetScanV1({
        client: this.client,
        path: { scanId },
      });
    }
  }

  export class AgentAdoptionScans {
    constructor(private readonly client: Client) {}

    startScan(body: PtAgentAdoptionRequestDto) {
      return GenTools.publicAgentAdoptionToolControllerCreateScanV1({
        client: this.client,
        body,
      });
    }

    getScan(scanId: string) {
      return GenTools.publicAgentAdoptionToolControllerGetScanV1({
        client: this.client,
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
        body,
      });
    }

    aiCrawlerChecker(body: PtAiCrawlerCheckerRequestDto) {
      return GenTools.publicAiCrawlerCheckerToolControllerDetectAiCrawlersV1({
        client: this.client,
        body,
      });
    }

    fetchUrl(body: PtFetchUrlRequestDto) {
      return GenTools.publicFetchUrlToolControllerFetchUrlV1({
        client: this.client,
        body,
      });
    }
  }
}

export default CompetLab;
