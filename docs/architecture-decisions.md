# Helsinki Apartment Tracker — Architecture Decision Records

## Project Overview

A real-time apartment sales tracking pipeline for the Helsinki capital region (Helsinki, Espoo, Vantaa). The project serves as a learning vehicle for Kafka, stream processing, and AI-assisted "vibe coding" development practices, while producing a genuinely useful apartment market dashboard.

---

## ADR-001: Project Goal

**Decision:** Primarily a learning vehicle (Kafka + vibe coding), with the apartment domain providing a real, useful context.

**Rationale:** Focusing on learning means we make proper architectural decisions driven by the domain, without getting blocked on production-grade data quality from day one. The data quality and coverage can improve incrementally.

---

## ADR-002: Data Source — Initial

**Status: Superseded by ADR-033** — asuntojen.hintatiedot.fi is no longer available as a data source.

**Decision:** Start with [asuntojen.hintatiedot.fi](https://asuntojen.hintatiedot.fi) (Housing Finance and Development Centre / ARA) as the first and only data source.

**Options considered:** Oikotie/Etuovi (scraping, no public API), DVV/Maanmittauslaitos (official property records), Tilastokeskus (aggregate statistics).

**Rationale:** Open data with completed sale prices, no scraping headaches or legal grey areas. Gets us to the Kafka parts fast. Additional sources (especially Oikotie for active listings) can be added later.

---

## ADR-003: Geographic Scope

**Decision:** Helsinki + Espoo + Vantaa (pääkaupunkiseutu).

**Rationale:** Broad enough for interesting cross-city comparisons and commuter zone analysis, narrow enough to keep data manageable. The pipeline is scope-agnostic — widening later requires no structural changes.

---

## ADR-004: Data Storage Philosophy

**Decision:** Store everything the source provides as raw events. Compute derived fields (€/m², averages, trends) in downstream processing consumers.

**Rationale:** Follows the Kafka best practice of immutable raw events with transformations in the processing layer. Avoids premature filtering — we'll want metrics we haven't thought of yet.

---

## ADR-005: Ingestion Method

**Status: Superseded by ADR-033** — the producer now calls the PxWeb REST API instead of reading a CSV.

**Decision:** Start with manual CSV download, with a producer that reads the file and publishes each row as a Kafka event. Automate (scheduled scraping) later.

**Rationale:** Gets the pipeline running in an hour instead of a day. The Kafka side is decoupled from the ingestion method — swapping the producer later requires no downstream changes.

---

## ADR-006: Kafka Topic Design

**Decision:**

- `apartment-sales-raw` — single raw topic, partitioned by postal code
- `sales-enriched` — output of the processing layer
- `sales-aggregated` — output of aggregation processing
- `sales-dead-letter` — failed events

**Rationale:** Partitioning by postal code gives ordering within a neighborhood (useful for trend calculations) and good consumer parallelism. Splitting by processing stage decouples pipeline steps cleanly. Splitting by city would be premature — consumers can filter easily.

---

## ADR-007: Enrichments — Phase 1

**Status: Superseded by ADR-033** — €/m² calculation is no longer an enrichment (data arrives pre-aggregated). Deviation scoring definition changed to PKS-wide comparison.

**Decision:** Initial enrichments: €/m² calculation, postal-code-to-area-name mapping, deviation scoring (how far a sale is from the area average).

**Phase 2 (future):** Rolling averages (median €/m² per area over 90/180/365 days).

**Deferred:** Distance to transit (HSL/OSM data), building age buckets.

**Rationale:** Phase 1 enrichments produce immediately interesting dashboard data without requiring external API calls. All are pure functions — easily testable.

---

## ADR-008: Processing Layer Technology

**Decision:** KafkaJS consumer/producer loops in TypeScript (manual consume-transform-produce).

**Options considered:** kafka-streams TS ports (immature), Java Kafka Streams (outside TS monorepo), Faust/Python (outside TS monorepo).

**Rationale:** More manual than a streams DSL, but that's the point for learning — you understand partitions, offsets, consumer groups, and backpressure by writing the plumbing yourself. Keeps everything in the TS monorepo. Processing logic is simple enough that a streams DSL isn't needed.

---

## ADR-009: Serving Layer Database

**Decision:** PostgreSQL with TimescaleDB extension.

**Options considered:** Plain PostgreSQL, SQLite, Elasticsearch.

**Rationale:** TimescaleDB adds hypertables (automatic time-based partitioning) and continuous aggregates on top of familiar Postgres. Core questions are time-series in nature ("how have prices in Töölö trended"). Runs in Docker alongside Redpanda.

---

## ADR-010: API Layer

**Decision:** tRPC.

**Options considered:** REST with Express/Fastify, GraphQL.

**Rationale:** Already familiar, fits naturally in a TS monorepo, and type safety from DB query results to React front-end makes vibe coding fast — AI tooling can see the types and generate matching UI code. No REST ceremony or GraphQL overhead needed for a single-consumer project.

---

## ADR-011: Front-end Stack

**Decision:** Vite + React, with Leaflet (deferred to v2) for maps and Recharts for charts.

**Options considered:** Next.js (SSR overhead unnecessary), Remix (extra concepts unneeded).

**Rationale:** Vite keeps things simple and fast without framework overhead — no SSR needed for a personal dashboard. Recharts integrates naturally with React and is well-known to AI coding assistants. Simple filtered list with sorting for data tables initially.

---

## ADR-012: Monorepo Structure

**Decision:** pnpm workspaces with packages per concern:

```
packages/
  shared/        — Kafka event schemas, types, postal code mappings, config
  producer/      — CSV ingestion → apartment-sales-raw
  processor/     — sales-raw → enrichment → sales-enriched
  serving/       — sales-enriched → TimescaleDB
  api/           — tRPC server, queries TimescaleDB
  web/           — Vite + React dashboard
```

**Rationale:** Each piece is independently runnable and testable, mirrors the Kafka topology directly, and matches existing pnpm monorepo experience. The `shared` package provides end-to-end type safety.

---

## ADR-013: Schema Definition and Validation

**Decision:** Zod schemas in the `shared` package.

**Options considered:** TypeBox, plain TS types, Avro/Protobuf with Schema Registry.

**Rationale:** Runtime validation at consumer boundaries catches bad data early. TypeScript types are inferred automatically. Zero extra infrastructure. Schema Registry is the production answer but adds a service and serialization format to learn — a distraction from core learning goals.

---

## ADR-014: Local Infrastructure

**Decision:** Docker Compose with Redpanda + Redpanda Console + TimescaleDB.

**Options considered:** Full Apache Kafka + ZooKeeper, Homebrew native processes, Confluent Cloud.

**Rationale:** Redpanda is Kafka API-compatible, single binary, no ZooKeeper, starts in seconds, low memory. KafkaJS code is unaware of the difference. Redpanda Console (free web UI) is invaluable for inspecting topics, messages, and consumer groups while learning.

---

## ADR-015: Development Workflow

**Decision:** Turborepo with `turbo dev` for orchestrating all services.

**Options considered:** Manual terminal tabs, Docker Compose for TS services, `concurrently`.

**Rationale:** Minimal config (`turbo.json`), runs all packages with labeled output, gives `turbo build` with caching for free. Services stay as plain TS processes (easy to debug). Docker Compose stays focused on infrastructure only.

---

## ADR-016: TypeScript Execution

**Decision:** `tsx` with watch mode. Each package's dev script: `tsx watch src/index.ts`.

**Options considered:** ts-node, nodemon + tsc, Vite Node.

**Rationale:** Zero config, fast restarts via esbuild, no build step during development. Separate `tsconfig.json` for type checking and editor support.

---

## ADR-017: Configuration Management

**Decision:** Shared config module in `shared` that reads environment variables and validates with Zod. Single `.env` file at repo root. Topic names as constants in `shared`.

**Options considered:** Per-service config, config files (JSON/YAML).

**Rationale:** Services crash immediately at startup with clear errors if required env vars are missing. Topic names as shared constants prevent typo mismatches between producer and consumer. Turborepo passes the root `.env` through.

---

## ADR-018: Testing Strategy

**Decision:** Unit tests with Vitest for transformation logic from day one. Skip integration tests initially.

**Deferred:** Integration tests with Testcontainers.

**Rationale:** Enrichment functions are pure (event in, enriched event out) — trivially testable. These catch real bugs. Integration tests with Testcontainers are valuable but slow to set up. Manual testing via Redpanda Console covers pipeline wiring for v1.

---

## ADR-019: Error Handling

**Decision:** Dead letter topic (`sales-dead-letter`) with no retries. Failed events are published with the original event plus error message.

**Options considered:** Log and skip, retry then DLQ, crash the consumer.

**Rationale:** Core Kafka pattern worth learning. Simple try/catch with produce-to-DLQ on failure. Never loses data, never blocks the pipeline. Inspect failures in Redpanda Console. Retries add idempotency and backoff complexity unnecessary for batch CSV data.

---

## ADR-020: Backfill vs Live Data

**Decision:** No distinction. All events look the same — the sale date inside the event is what matters, not when it was ingested.

**Options considered:** Metadata flag (`source: "backfill" | "live"`), separate topics.

**Rationale:** One topic and one code path means less complexity. An optional `ingestionSource` field can be added later if needed.

---

## ADR-021: Dashboard Views — v1

**Decision:** Three views: time series chart (price trends by area), area comparison bar chart, and filterable/sortable sale list.

**Deferred:** Map view (most work — geocoding, Leaflet integration, marker clustering), summary stats headline cards.

**Rationale:** These three cover the most useful questions: "are prices going up?", "how do areas compare?", "show me the actual sales." Map view is the flashiest but also the highest effort — better as a satisfying second iteration.

---

## ADR-022: Dashboard Filtering

**Decision:** Hybrid — global area multi-select and date range picker at the top, with per-view extras where needed (e.g. min/max price filter on the sale list).

**Rationale:** Cohesive UX (change area, everything updates) while letting individual views serve specific queries. tRPC procedures accept area and date range as common parameters.

---

## ADR-023: Area/Neighborhood Naming

**Decision:** Postal code as the primary grouping key, with a display label like "Kamppi / Ruoholahti / Jätkäsaari (00180)". Static lookup table in `shared` with two levels: postal code → display label, postal code → district.

**Context:** Postal codes don't map 1:1 to neighborhoods (e.g. 00180 spans Kamppi, Ruoholahti, and Jätkäsaari). Using postal code as the atomic unit avoids double-counting in aggregations.

**Rationale:** Unambiguous grouping, no geocoding required, honest about the data granularity we actually have. Proper geocoding can be revisited when the map view is added.

---

## ADR-024: Deployment Target

**Decision:** Local only for v1.

**Future option:** DigitalOcean VPS with Docker Compose.

**Rationale:** Focus on learning Kafka and vibe coding, not DevOps. Fast feedback loop. Cloudflare Tunnel or ngrok for occasional sharing if needed.

---

## ADR-025: Message Key and Serialization

**Decision:** Postal code as the Kafka message key, JSON serialization.

**Rationale:** Postal code key ensures all sales in the same area land on the same partition in order — ideal for per-area trend calculations. JSON is human-readable, inspectable in Redpanda Console, and works natively with KafkaJS and Zod. Message size (~hundreds of bytes) makes binary serialization overhead irrelevant.

---

## ADR-026: Consumer Group Strategy

**Decision:** One consumer group per service:

- `processor-enrichment` — reads `sales-raw`, writes to `sales-enriched`
- `serving-db-writer` — reads `sales-enriched`, writes to TimescaleDB
- `serving-aggregator` — reads `sales-enriched`, computes and writes rolling aggregates

**Rationale:** Each tracks its own offsets, can be restarted or replayed independently, and scales separately. Canonical Kafka pattern.

---

## ADR-027: Reprocessing and Replay

**Decision:** New consumer group ID approach. Bump the version (e.g. `processor-enrichment-v2`), restart, and it reads from the beginning.

**Options considered:** Manual offset reset, CLI `--replay` flag, CSV re-import.

**Rationale:** Safest approach — no risk of accidentally resetting a consumer. Trivial to implement via shared config. Old group offsets stay around harmlessly.

---

## ADR-028: Topic Retention

**Decision:**

- `apartment-sales-raw` — infinite retention
- `sales-enriched`, `sales-aggregated` — 30 days
- `sales-dead-letter` — infinite retention

**Rationale:** Raw topic is the source of truth at negligible volume (few thousand sales/year). Downstream topics are derived and rebuildable via replay. DLQ is kept forever — never lose error evidence.

---

## ADR-029: Idempotency / Deduplication

**Status: Superseded by ADR-033** — deduplication key is now `(postal_code, quarter, building_type)`, and the strategy is DO UPDATE SET (not DO NOTHING) since StatFin may revise published figures.

**Decision:** Deduplication in the serving layer via upsert. Composite natural key: `(postal_code, address, sale_date, price, square_meters)`. Insert with `ON CONFLICT ... DO NOTHING`.

**Rationale:** Simplest approach — no state management in producers or processors, the DB handles it, and the Kafka pipeline stays stateless and replayable. Duplicates flow through Kafka harmlessly at negligible volume.

---

## ADR-030: TimescaleDB Schema

**Status: Superseded by ADR-033** — hypertable renamed to `area_stats`, schema reflects aggregate data model (see ADR-033 for new schema).

**Decision:**

**Hypertable `apartment_sales`** (time column: `sale_date`):

| Column | Type | Notes |
|---|---|---|
| sale_date | DATE | Hypertable time dimension |
| postal_code | VARCHAR | Message key / partition key |
| area_label | VARCHAR | e.g. "Kamppi / Ruoholahti / Jätkäsaari (00180)" |
| district | VARCHAR | e.g. "Eteläinen Helsinki" |
| address | VARCHAR | Street address from source |
| price | INTEGER | Sale price in euros |
| square_meters | DECIMAL | |
| rooms | SMALLINT | Number of rooms |
| building_type | VARCHAR | kerrostalo / rivitalo / etc. |
| building_year | SMALLINT | |
| price_per_sqm | DECIMAL | Derived: price / square_meters |
| deviation_from_area_avg | DECIMAL | Derived: how far from area mean |
| ingestion_timestamp | TIMESTAMPTZ | When the event was ingested |

**Unique constraint:** `(postal_code, address, sale_date, price, square_meters)`

**Continuous aggregate:** `area_monthly_stats` — monthly median/avg/min/max €/m² and sale count per postal code.

**Indexes:** `postal_code`, `district`, `sale_date`.

**Rationale:** Denormalized — area/district labels on every row, no joins needed. Static lookup lives in code. Continuous aggregate powers charts without expensive queries.

---

## ADR-031: MVP Definition (v1 Done Criteria)

**Status: Superseded by ADR-033** — MVP updated to reflect aggregate data model, PxWeb producer, and `area_stats` table (see ADR-033).

v1 is complete when:

1. Docker Compose starts Redpanda (with Console) and TimescaleDB
2. Producer reads a CSV and publishes raw events visible in Redpanda Console
3. Processor enriches events (€/m², area label, deviation score) → `sales-enriched`
4. Serving consumer writes to TimescaleDB with deduplication
5. tRPC API exposes three endpoints: time series by area, area comparison, filtered sale list
6. React dashboard shows three views with global area multi-select and date range picker
7. Dead letter topic exists and bad events land there

**Explicitly not in v1:** map view, rolling averages via continuous aggregates, Oikotie scraping, deployment, integration tests, authentication, mobile responsiveness.

---

## ADR-032: Architecture Enforcement

**Decision:** Use `dependency-cruiser` to enforce architectural boundaries between packages and visualize the dependency graph.

**Rules to enforce:**

- `shared` must not import from any other package
- `producer` may only import from `shared`
- `processor` may only import from `shared`
- `serving` may only import from `shared`
- `api` may only import from `shared`
- `web` may only import from `shared`
- No circular dependencies

**Rationale:** The layered architecture and package boundaries are a core learning goal. Dependency-cruiser provides both automated validation (CI-friendly) and visual dependency graphs (SVG/DOT output). Already familiar tooling from previous monorepo work.

---

## Pipeline Architecture Summary

```
[CSV File]
    │
    ▼
┌──────────┐     ┌─────────────────────┐
│ Producer │────▶│ apartment-sales-raw │
└──────────┘     └─────────┬───────────┘
                           │
                           ▼
                  ┌─────────────────┐     ┌─────────────────┐
                  │    Processor    │────▶│  sales-enriched  │
                  │  (enrichment)   │     └────────┬─────────┘
                  └────────┬────────┘              │
                           │                 ┌─────┴──────┐
                           ▼                 ▼            ▼
                  ┌──────────────┐   ┌───────────┐ ┌─────────────┐
                  │ sales-dead-  │   │ DB Writer │ │ Aggregator  │
                  │   letter     │   └─────┬─────┘ └──────┬──────┘
                  └──────────────┘         │              │
                                           ▼              ▼
                                    ┌──────────────────────────┐
                                    │   TimescaleDB (Postgres)  │
                                    └────────────┬─────────────┘
                                                 │
                                                 ▼
                                          ┌────────────┐
                                          │ tRPC API   │
                                          └──────┬─────┘
                                                 │
                                                 ▼
                                          ┌────────────┐
                                          │ React App  │
                                          └────────────┘
```

---

## Technology Stack Summary

| Concern | Choice |
|---|---|
| Language | TypeScript |
| Monorepo | pnpm workspaces + Turborepo |
| Kafka client | KafkaJS |
| Kafka broker | Redpanda (Docker) |
| Kafka UI | Redpanda Console |
| Schema validation | Zod |
| Database | PostgreSQL + TimescaleDB |
| API | tRPC |
| Front-end | Vite + React |
| Charts | Recharts |
| Linting/Formatting | Biome |
| Testing | Vitest |
| TS execution | tsx (watch mode) |
| Architecture enforcement | dependency-cruiser |

---

## ADR-033: Data Source Change — Tilastokeskus StatFin PxWeb API

**Status: Active**

**Decision:** Replace asuntojen.hintatiedot.fi with the Tilastokeskus StatFin PxWeb API as the primary data source. Shift the data model from individual apartment sales to aggregate statistics per `(postal_code, quarter, building_type)`.

**Context:** During pre-implementation exploration we discovered that asuntojen.hintatiedot.fi no longer works: no CSV export, no API access, and 2026 data is missing because their KVKL contract expired. A replacement was needed before any pipeline code could be written.

**New data source:** `https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__ashi/` — Tilastokeskus StatFin REST API. Returns average €/m² and sale counts per postal code, per quarter, per building type (kerrostalo/rivitalo). Covers all of Finland, actively maintained, free, no auth required.

**Impact on the data model:**

- **Raw event:** `(postal_code, quarter, building_type, avg_price_per_sqm, sale_count)` — no address, price, square_meters, rooms, or building_year
- **Enriched event:** adds `area_label`, `district`, `deviation_from_pks_avg`, `ingestion_timestamp`
- **Enrichments:** €/m² calculation removed (data arrives pre-aggregated). Deviation scoring redefined as percentage deviation from the PKS-wide average for the same quarter and building type.
- **DB hypertable:** renamed to `area_stats`, time column is `quarter` (DATE — first day of quarter), unique constraint `(postal_code, quarter, building_type)`, upsert uses DO UPDATE SET (StatFin may revise figures)
- **Kafka topics:** renamed to `area-stats-raw`, `area-stats-enriched`, `area-stats-aggregated`, `area-stats-dead-letter`
- **Dashboard:** "sale list" replaced by aggregate stats table. Per-sale filters (room count, price range, building year) deferred to future improvements pending an individual sale data source.
- **Producer:** calls PxWeb API, fetches last 4 quarters per run, manually triggered (same pattern as CSV producer — simple, decoupled, swap later)

**What stays the same:** overall pipeline architecture, Kafka topic count and topology, consumer group strategy, KafkaJS client, processing layer pattern, tRPC API structure, React + Recharts frontend, TimescaleDB.

**Supersedes:** ADR-002 (data source), ADR-005 (ingestion method), ADR-007 (enrichments), ADR-029 (deduplication), ADR-030 (DB schema), ADR-031 (MVP definition).

