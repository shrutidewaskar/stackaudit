This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Conversation Memory & Context Engine

StackAudit utilizes a provider-agnostic memory design, ensuring that LLMs are completely stateless. All conversation histories, context parameters, company information, and user preferences are retained directly on StackAudit.

### 1. Memory Architecture
Memory is segmented into three distinct operational tiers:
* **Level 1 (Short-Term Memory)**: Current active chat message transactions and temporary reasoning logs.
* **Level 2 (Session Memory)**: Session-specific metadata including running conversation summaries, extracted entities, topics discussed, and business decisions.
* **Level 3 (Long-Term Memory)**: Overall organization profiles (connected tools, company sizes, compliance policies), historic audits, and user provider/language preferences.

### 2. Session Lifecycle
Conversations are managed via the `SessionManager` class:
* **Creation**: Instantiates a new chat session with associated provider, model, and metadata.
* **Load / Renaming**: Updates session attributes locally or in Supabase.
* **Archiving / Deletion**: Modifies status to "archived" or deletes the session record and associated message lists.

### 3. Context Builder
The `ContextBuilder` aggregates all relevant data (Audits, Profiles, History, Preferences) and generates a structured payload for the LLM. The LLM never queries the database directly; it operates solely on the context provided.

### 4. Memory Retrieval & Search
Includes `MemoryRetrieval` helpers supporting keyword matching across conversation records, extracted topics, summaries, and user prompts, in addition to historical fact extraction.

### 5. Future AI Integration
When integrating live models (e.g. Gemini, Claude, or GPT-4):
1. Resolve the active provider via `providerRegistry`.
2. Extract the prompt context via `ContextBuilder.build()`.
3. Dispatch the assembled prompt to the model and return the unified structured response.


## Enterprise Connector SDK

StackAudit implements a unified, provider-independent Connector SDK designed to integrate with any external directory provider, browser extension, or SSO channel without modifying the primary application business logic.

### 1. Architectural Strategy
* **Registry Pattern**: All integrations register themselves with the centralized `ConnectorRegistry`. Downstream features fetch connectors through name resolution interfaces rather than initializing classes directly.
* **Normalization Engine**: Standardizes all response models (e.g. `NormalizedEmployee`, `NormalizedLicense`, `NormalizedUsageEvent`) to isolate downstream systems from provider-specific JSON schemas.
* **Event-Driven Lifecycle**: Connector lifecycle stages emit uniform event signals (`SyncStarted`, `NormalizationCompleted`, `AuthenticationExpired`) enabling real-time telemetry logs.

### 2. Connector Lifecycle Contracts (`BaseConnector`)
Every connector implementation inherits from the abstract `BaseConnector` class and must implement the following operations:
* `connect()`: Starts session validation.
* `disconnect()`: Revokes active tokens.
* `authenticate()`: Handles security credential negotiations.
* `validateConfiguration(config)`: Validates credentials format/scope.
* `healthCheck()`: Assesses network status.
* `sync()`: Fetches raw metadata payloads.
* `normalize(rawData)`: Maps schemas into standardized shapes.
* `getCapabilities()`: Returns supported features.
* `getMetadata()`: Exposes branding, description, and privacy details.

### 3. Adding a New Connector (e.g., DeepSeek Enterprise)
To add a new integration:
1. Create a class extending `BaseConnector` (e.g., `lib/connectors/providers/deepseek.ts`).
2. Implement the lifecycle methods, declaring capabilities and metadata (sync frequency, collected details, privacy commitment).
3. Register the connector instance in [registry.ts](file:///c:/shruti_materials/Projects/StackAudit/lib/connectors/registry/registry.ts) via `this.registerProvider("deepseek", new DeepSeekConnector())`.
4. The integration automatically appears in the Connected Workspaces list, details panel, and sync workflows without further modifications.


## Enterprise Usage Collection Platform

StackAudit implements a standardized, cross-platform telemetry pipeline capable of aggregating AI activities (`UsageEvent`) from multiple ingestion sources (Browser Extensions, IDE plugins, Desktop Agents, or SaaS APIs).

### 1. The Standard Usage Event Schema (`UsageEvent`)
All incoming telemetry normalizes into the following standard fields:
* `eventId`: Unique transaction tracking key.
* `organizationId` / `employeeId` / `workspaceId`: Identifies the multi-tenant context.
* `provider` / `tool`: Tracks vendor (e.g., `openai`, `cursor`).
* `source`: Ingestion origin (`browser_extension`, `desktop_agent`, `ide_plugin`).
* `activeDuration` / `idleDuration`: Core optimization variables (in seconds).
* `domain` / `tabVisibility`: Focus context.
* `metadata`: Whitelisted, safe telemetry key-value details.

### 2. Telemetry Collector Interface (`UsageCollector`)
All data capture tools implement the uniform lifecycle methods:
* `start()`: Registers handlers.
* `stop()`: Halts collection.
* `collect(event)`: Normalizes and emits actions.
* `validate(event)`: Validates telemetry format.
* `normalize(rawData)`: Maps telemetry data to standard shapes.
* `flush()`: Clears queues.

### 3. Offline-First Event Queue (`LocalEventQueue`)
Aggregated events pass through a local memory queue featuring:
* **Deduplication**: Filters duplicate transaction keys.
* **Retry Engine**: Retries failed uploads (up to 3 attempts with exponential delay).
* **Local Storage Persistence**: Safely saves queue logs when network connectivity is lost.

### 4. Privacy Engine & Telemetry Sanitization
* Implements a strict privacy policy filtering all sensitive data.
* White-lists telemetry variables (`emailDomain`, `activeSeconds`, `idleSeconds`, etc.).
* Enforces that **Prompts, Responses, Keystrokes, Clipboard Content, and Uploaded Files are NEVER collected or stored**.


## Governance Intelligence Engine

StackAudit includes a deterministic, rule-based Governance Engine that evaluates corporate AI telemetry and reports risk findings, capability overlaps, and cost optimization opportunities.

### 1. Data Integrity and Rules (No LLMs)
All evaluations are calculated 100% deterministically to guarantee auditable, reproducible governance results:
* **Dormant Licenses**: Identifies employees with active seat licenses but zero tracked usage events within a configurable observation window (default: 30 days).
* **Capability Overlaps**: Maps tool registry capability matrices (General AI, Coding, Research, Writing) to flag overlapping tools (e.g. Claude vs ChatGPT).
* **Governance Gaps**: Detects unmonitored tools, stale directory synch loops, and missing department attributions.

### 2. Standardized Finding Model (`GovernanceFinding`)
All calculated insights output to a standard finding schema containing:
* `id` / `organizationId`: Multi-tenant boundary keys.
* `category`: Categorizes under `UTILIZATION`, `ADOPTION`, `REDUNDANCY`, `PROCUREMENT`, `GOVERNANCE`, `SECURITY`, or `PLANNING`.
* `severity`: Ranks from `INFO`, `LOW`, `MEDIUM`, `HIGH` up to `CRITICAL`.
* `evidence`: Structured parameters backing up the finding without LLMs.
* `recommendedAction`: Flags opportunities for human review (`REVIEW_LICENSE`, `REVIEW_VENDOR_OVERLAP`, etc.).
* `status`: Lifecycle indicators (`NEW`, `REVIEWING`, `ACKNOWLEDGED`, `RESOLVED`, `DISMISSED`).

### 3. Transparent Governance Score
Calculated as a weighted matrix across five dimensions:
* **Visibility (20%)**: Tracks sync status and active connectors.
* **Utilization (30%)**: Evaluates low usage and dormant seats.
* **Adoption (20%)**: Ranks adoption velocity.
* **Redundancy (20%)**: Penalizes capability overlaps.
* **Data Completeness (10%)**: Measures missing metadata attributes.


## AI Context & Grounding Layer

StackAudit utilizes a dedicated AI Grounding Engine that compiles and validates structured context datasets before they are passed to any AI provider (e.g. Gemini, Vertex AI).

### 1. Context Grounding Pipeline
* **Intent Detection**: Classifies question intents (e.g., `GOVERNANCE_EXPLANATION`, `USAGE_ANALYSIS`, `DEPARTMENT_ANALYSIS`) deterministically to retrieve only relevant context parameters.
* **Privacy Sanitization Policies**: Automatically matches and redacts raw prompts, keystrokes, passwords, private files, and clipboard logs.
* **Token Budget Limit Checks**: Enforces a strict 500KB context size ceiling to prevent uncontrolled token growth.
* **Source Traceability**: Retains source tracking identifiers (`snapshotId`, `findingId`, `reportId`) to support auditable AI citations.

* Context payloads are cached temporarily (1-minute TTL) with strict organization-id validation filters to guarantee zero multi-tenant data leakage.


## Browser Intelligence Extension

StackAudit includes a Chromium/Chrome Manifest V3 browser extension that serves as a client-side UsageCollector.

### 1. Privacy-First Tracking
* **Metadata Focus**: Monitors visibility tab actions, focus states, and key rates to calculate session durations.
* **Prohibited Content**: Prompts, responses, clipboard logs, screenshots, and raw text are strictly filtered out on the client before saving.
* **Offline Event Queue**: Temporarily queues events locally inside `chrome.storage.local` if connectivity drops, flushing batches on reconnect.


## Gemini Intelligence Engine

StackAudit integrates Google Cloud Vertex AI-native Gemini models using the official `@google/genai` Node/TypeScript SDK.

### 1. Environment Configurations
Configure the following environment variables to activate the integration:
* `AI_PROVIDER=gemini` (deploys real provider, defaults to mock mode)
* `GOOGLE_CLOUD_PROJECT=your-project-id` (scoping key)
* `GOOGLE_CLOUD_LOCATION=us-central1` (Vertex regional endpoint)
* `GEMINI_MODEL=gemini-2.5-flash` (production-ready Gemini Flash models)

### 2. Strictly Grounded Structured Output
* **Grounding Bounds**: Gemini is supplied only with validated, sanitised context objects and can never query databases directly.
* **Traceable Citations**: Output responses map exactly to the `AIResponse` structure, tracing metrics and findings directly back to original context resource IDs.







