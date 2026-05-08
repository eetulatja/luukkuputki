# Helsinki Apartment Tracker

A real-time apartment sales tracking pipeline for the Helsinki capital region (PKS). Ingests completed sale data from asuntojen.hintatiedot.fi via CSV, streams events through Redpanda (Kafka), enriches them with price-per-sqm and area labels, persists to TimescaleDB, and serves a React dashboard. Primary learning vehicle for Kafka stream processing and AI-assisted "vibe coding" development.

## Package Structure (planned)

```
packages/
  shared/       — Zod schemas, config, topic constants, postal code lookups
  producer/     — CSV ingestion → apartment-sales-raw topic
  processor/    — sales-raw → enrichment → sales-enriched topic
  serving/      — sales-enriched → TimescaleDB writer
  api/          — tRPC server, queries TimescaleDB
  web/          — Vite + React dashboard (Recharts)
  orchestrator/ — autonomous development loop (spawns Claude Code headless)
```

## Key Commands

```
turbo dev       # start all services in watch mode
turbo build     # compile all packages
turbo check     # tsc --noEmit across all packages
turbo test      # vitest run across all packages
turbo lint      # biome check across all packages
turbo validate  # dependency-cruiser architecture rules
```

## Coding Conventions

- **Modules:** ESM (`"type": "module"`) in all packages
- **TypeScript:** strict mode, types inferred from Zod schemas
- **Validation:** Zod at all system boundaries (Kafka messages, API inputs, env vars)
- **Formatting:** Biome (single tool for lint + format, configured in `biome.json`)
- **Kafka:** KafkaJS client throughout
- **Enrichments:** pure functions — no side effects, no Kafka imports, co-located unit tests
- **SQL:** plain `pg` with parameterized queries, no ORM

## Docs

- `docs/architecture-decisions.md` — all technical decisions (ADRs)
- `docs/ai-workflow-decisions.md` — AI workflow and autonomous dev patterns
- `docs/implementation-plan.md` — ordered issue breakdown (Phase A → B → C)
- `docs/future-improvements.md` — deferred work and backlog

This is a new project. Refer to `docs/architecture-decisions.md` for all technical decisions and `docs/implementation-plan.md` for the task breakdown.
