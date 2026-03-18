# @competlab/sdk

[![npm version](https://img.shields.io/npm/v/@competlab/sdk)](https://www.npmjs.com/package/@competlab/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@competlab/sdk)](https://www.npmjs.com/package/@competlab/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Share on X](https://img.shields.io/badge/Share_on_X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/intent/tweet?text=TypeScript%20SDK%20for%20competitive%20intelligence%20%E2%80%94%20track%20what%20ChatGPT%20says%20about%20your%20brand&url=https://github.com/competlab/competlab-sdk)
[![Share on LinkedIn](https://img.shields.io/badge/Share_on_LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/sharing/share-offsite/?url=https://github.com/competlab/competlab-sdk)

> Track what ChatGPT, Claude, and Gemini say about your brand — programmatically.

40% of B2B buyers ask AI before they Google. This SDK gives you typed access to everything CompetLab monitors: AI visibility, competitor pricing, content changes, positioning shifts, and tech stack signals. 3 lines to your first insight.

## Install

```sh
npm install @competlab/sdk
```

## Quick Start

```typescript
import CompetLab from '@competlab/sdk';

const cl = new CompetLab({ apiKey: process.env.COMPETLAB_API_KEY });

// See how 3 AI systems rank your brand vs competitors
const visibility = await cl.aiVisibility.dashboard('proj_abc');
```

## What is CompetLab?

Competitive intelligence for the AI era. One platform, 5 dimensions, monitored automatically:

| Dimension | What It Tracks |
|-----------|---------------|
| **Tech & Trust** | Tech stacks, security headers, trust signals |
| **Content** | Sitemaps, content categories, publishing cadence |
| **Positioning** | Homepage messaging, value props, CTAs |
| **Pricing** | Plans, pricing models, feature comparisons |
| **AI Visibility** | How ChatGPT, Claude, and Gemini rank your brand vs competitors |

AI Visibility is what makes CompetLab unique — no other CI platform tracks how LLMs recommend brands in real time.

> [Start free trial](https://app.competlab.com/register) | [Learn more](https://competlab.com)

## Available Resources

```typescript
cl.health           // API health check
cl.projects         // List and get projects
cl.competitors      // Monitored competitors
cl.techTrust        // Tech stack & trust signals
cl.content          // Content analysis & changelog
cl.positioning      // Homepage messaging analysis
cl.pricing          // Pricing intelligence
cl.aiVisibility     // AI visibility scores & trends
cl.analysis         // AI-generated action plans
cl.alerts           // Competitive change alerts
cl.schedules        // Monitoring schedules
```

**11 resources. 25 methods. Zero dependencies.** Uses native `fetch` — no axios, no bloat.

## Examples

### See what AI says about you

```typescript
const { data } = await cl.aiVisibility.dashboard('proj_abc');

// data.item.summary =>
// {
//   customer: { domain: "you.com", mentionRate: 100, aiScore: 82 },
//   topCompetitor: { domain: "rival.com", mentionRate: 33 },
//   mentionRateGap: 67,
//   competitorRankings: [
//     { name: "You",   domain: "you.com",   mentionRate: 100, aiScore: 82, isOwn: true },
//     { name: "Rival", domain: "rival.com", mentionRate: 33,  aiScore: 31, isOwn: false }
//   ]
// }
```

### Track how your AI ranking changes over time

```typescript
const trend = await cl.aiVisibility.trend('proj_abc', {
  provider: 'openai'
});
// Weekly snapshots of your visibility score — spot drops before they cost you deals
```

### Get a competitive action plan

```typescript
const plan = await cl.analysis.actionPlan('proj_abc');
// AI-generated priorities across all 5 dimensions:
// "Your competitor added 3 trust badges you're missing — here's which ones matter"
```

### Catch competitor pricing changes

```typescript
const alerts = await cl.alerts.list('proj_abc', {
  dimension: 'pricing',
  severity: 'critical'
});
// Know the moment a competitor changes pricing — not weeks later from a churned customer
```

### Compare competitor tech stacks

```typescript
const tech = await cl.techTrust.dashboard('proj_abc');
// Security headers, frameworks, CDNs, analytics tools — across all monitored competitors
```

## MCP Server

Prefer AI-native access? CompetLab also offers an MCP server with 24 tools — connect Claude Code, Cursor, or VS Code directly.

> [competlab.com/developers/mcp](https://competlab.com/developers/mcp)

## API Reference

Full interactive API documentation with "Try It" panel:

> [competlab.com/developers/api](https://competlab.com/developers/api)

## Requirements

- Node.js 20+
- CompetLab API key ([start free trial](https://app.competlab.com/register) — 14 days, no credit card)

## License

MIT — see [LICENSE](./LICENSE)

---

Built by the [CompetLab](https://competlab.com) team. Competitive intelligence for the AI era.
