# Helsinki Apartment Tracker — Implementation Plan

## Overview

Ordered list of GitHub issues for building the apartment tracker. Each issue follows the structured template from AI-ADR-007. Issues are grouped by phase and ordered as vertical slices — each delivers working, verifiable functionality.

**Phases:**
- **Phase A (Bootstrap)** — interactive, human + Claude Code. Foundational work requiring judgment.
- **Phase B (Tracer Bullet)** — semi-autonomous. First end-to-end slice + CI review setup.
- **Phase C (Autonomous Widening)** — fully autonomous. Ralph + Haiku processes the issue queue.

**Labels:**
- `phase:a`, `phase:b`, `phase:c` — which phase
- `risk:high`, `risk:low` — auto-merge eligibility
- `ralph-ready` — available for autonomous pickup (Phase C only)
- `model:opus`, `model:sonnet`, `model:haiku` — suggested model

---

## Phase A — Bootstrap (Interactive)

These issues set up the project skeleton, infrastructure, and AI workflow. Do them interactively with Claude Code (Sonnet or Opus). Do not attempt autonomously — they require judgment and involve configuration that agents shouldn't touch unsupervised.

---

### A-01: Set up root CLAUDE.md, docs, and Git repo

**Labels:** `phase:a`, `risk:high`, `model:opus`

#### Context
Claude Code is used from the very first task. It needs project context before doing anything else. The architecture decisions, AI workflow decisions, and implementation plan already exist as documents — they need to be in the repo so Claude Code can read them.

#### Task
- `git init`, create GitHub repo, push initial commit
  - The remote: `git remote add origin git@github.com:eetulatja/luukkuputki.git`
- Create `docs/` directory with:
  - `architecture-decisions.md` (from planning session)
  - `ai-workflow-decisions.md` (from planning session)
  - `future-improvements.md` (from planning session)
  - `implementation-plan.md` (this document)
- Create root `CLAUDE.md` with:
  - Project overview (one paragraph — Helsinki apartment sales tracker, learning project for Kafka + vibe coding)
  - Intended monorepo structure (package list with one-line descriptions — packages don't exist yet but Claude needs to know the target)
  - Key commands (will use): `turbo dev`, `turbo build`, `turbo check`, `turbo test`, `turbo lint`, `turbo validate`
  - Coding conventions: ESM, TypeScript strict, Zod for validation, Biome for formatting, KafkaJS for Kafka, pure functions for enrichments
  - Pointers to all four docs in `docs/`
  - Note: "This is a new project. Refer to `docs/architecture-decisions.md` for all technical decisions and `docs/implementation-plan.md` for the task breakdown."
- Create `.env.example` with all required env vars documented (Kafka broker, DB URL, etc.)

#### Acceptance Criteria
- [x] GitHub repo exists with initial commit
- [x] Root `CLAUDE.md` exists and is under 80 lines
- [x] All four docs are in `docs/` and readable
- [x] Starting a Claude Code session in the repo root shows awareness of the project's purpose and architecture
- [x] `.env.example` documents all expected environment variables

#### Constraints
- Root `CLAUDE.md` must be lean — conventions and pointers only, no implementation details
- Do NOT create any package scaffolding yet — that's the next issue
- The CLAUDE.md describes the intended structure, not the current state (mark as "planned")

---

### A-02: Initialize monorepo skeleton

**Labels:** `phase:a`, `risk:high`, `model:sonnet`

#### Context
With the project context in place (CLAUDE.md, docs), we can now scaffold the monorepo. Claude Code will read the CLAUDE.md and docs to understand the intended structure.

See `docs/architecture-decisions.md` ADR-012 for the package structure.

#### Task
Initialize the project:
- `pnpm init` at root
- Create `pnpm-workspace.yaml` with packages glob
- Create empty packages: `shared`, `producer`, `processor`, `serving`, `api`, `web`, `orchestrator`
- Each package gets `package.json`, `tsconfig.json`, empty `src/index.ts`
- Root `tsconfig.json` with project references
- Root `turbo.json` with `dev`, `build`, `check`, `test`, `lint`, `validate` tasks
- `.gitignore`
- `biome.json` at root with TypeScript rules
- `.npmrc` with `shamefully-hoist=false`
- Update root `CLAUDE.md` to reflect actual structure (remove "planned" markers)

#### Acceptance Criteria
- [x] `pnpm install` succeeds with no errors
- [x] `turbo check` runs tsc across all packages with no errors
- [x] `turbo lint` runs biome across all packages with no errors
- [x] Each package can import from `shared` via workspace protocol
- [x] Dependency graph is clean: only `shared` is imported by other packages
- [x] Root `CLAUDE.md` reflects the actual project state

#### Constraints
- Use ESM (`"type": "module"`) in all packages
- TypeScript strict mode enabled
- No dependencies beyond dev tooling at this stage

---

### A-03: Set up Docker Compose infrastructure

**Labels:** `phase:a`, `risk:high`, `model:sonnet`

#### Context
The pipeline needs Redpanda (Kafka-compatible broker), Redpanda Console (web UI), and TimescaleDB (PostgreSQL + time-series extensions) running locally.

#### Task
Create `docker-compose.yml` at project root with:
- Redpanda single-node cluster (port 9092 for Kafka API, 8081 for Schema Registry, 8082 for Admin API)
- Redpanda Console (port 8080) connected to the Redpanda cluster
- TimescaleDB (port 5432) with a `apartment_tracker` database created on init
- Persistent volumes for both Redpanda and TimescaleDB data
- A shared network for all services

Create a `scripts/init-db.sql` that creates the TimescaleDB extension and the `apartment_sales` hypertable per ADR-030.

#### Acceptance Criteria
- [x] `docker compose up -d` starts all three services without errors
- [x] Redpanda Console is accessible at `http://localhost:8080`
- [x] `psql` can connect to TimescaleDB and the `apartment_sales` hypertable exists
- [x] Redpanda broker accepts connections on `localhost:19092` (remapped from 9092 — host port conflict with existing SSH tunnel)
- [x] `docker compose down` and `docker compose up -d` preserves data via volumes

#### Constraints
- Use Redpanda, not Apache Kafka
- TimescaleDB image, not plain PostgreSQL
- Do NOT add application services to Docker Compose — only infrastructure

---

### A-04: Create shared package — schemas, config, and postal code mappings

**Labels:** `phase:a`, `risk:high`, `model:sonnet`

#### Context
The `shared` package is the foundation imported by all other packages. It contains Zod schemas for Kafka events, shared configuration validated with Zod, topic name constants, and the postal code lookup table.

See `docs/architecture-decisions.md` ADR-006 (topics), ADR-013 (schemas), ADR-017 (config), ADR-023 (area naming), ADR-025 (serialization), ADR-030 (DB schema).

#### Task
Implement in `packages/shared/src/`:
- `schemas/raw-sale-event.ts` — Zod schema for raw apartment sale events (all fields from the CSV source)
- `schemas/enriched-sale-event.ts` — Zod schema extending raw with `price_per_sqm`, `area_label`, `district`, `deviation_from_area_avg`
- `config/index.ts` — reads env vars with Zod validation: `KAFKA_BROKER`, `DATABASE_URL`, `KAFKA_GROUP_PREFIX`
- `config/topics.ts` — exported constants: `TOPIC_SALES_RAW`, `TOPIC_SALES_ENRICHED`, `TOPIC_SALES_AGGREGATED`, `TOPIC_DEAD_LETTER`
- `lookups/postal-codes.ts` — static map of PKS postal codes to `{ areaLabel: string, district: string }` (cover at least 00100–00990 for Helsinki, 02100–02780 for Espoo, 01300–01770 for Vantaa)
- `types/index.ts` — re-export inferred types from Zod schemas

Create `.env.example` at repo root with all required env vars documented.

#### Acceptance Criteria
- [x] All Zod schemas parse valid data and reject invalid data (unit tests)
- [x] Config module throws descriptive error when required env var is missing (unit test)
- [x] Postal code lookup returns correct area label and district for known codes (unit test)
- [x] All types are re-exported and importable from `@apartment-tracker/shared`
- [x] `turbo test` passes for the shared package

#### Constraints
- Do NOT add any dependencies beyond `zod`
- Postal code map does not need to be exhaustive — cover the major areas, mark as TODO where gaps exist
- Keep schemas minimal — only fields we know the data source provides

---

### A-05: Set up dependency-cruiser with architecture rules

**Labels:** `phase:a`, `risk:high`, `model:sonnet`

#### Context
Per ADR-032, we use dependency-cruiser to enforce package boundaries. Rules must be in place before any cross-package imports happen.

#### Task
- Install `dependency-cruiser` as a root dev dependency
- Create `.dependency-cruiser.cjs` at root with rules:
  - `shared` must not import from any other package
  - `producer` may only import from `shared`
  - `processor` may only import from `shared`
  - `serving` may only import from `shared`
  - `api` may only import from `shared`
  - `web` may only import from `shared`
  - `orchestrator` may only import from `shared`
  - No circular dependencies
- Add `validate` script to root `package.json`: `depcruise --config .dependency-cruiser.cjs packages/`
- Wire into Turborepo as `turbo validate`
- Add a script to generate SVG dependency graph: `depcruise --config .dependency-cruiser.cjs --output-type dot packages/ | dot -T svg > docs/dependency-graph.svg`

#### Acceptance Criteria
- [ ] `turbo validate` passes with the current (correct) dependency structure
- [ ] Intentionally adding a forbidden import (e.g. `shared` importing from `producer`) causes `turbo validate` to fail with a clear error message
- [ ] SVG dependency graph is generated and shows the package structure

#### Constraints
- Rules must match the architecture described in ADR-032 exactly
- Do NOT modify any package source code — only add tooling config

---

### A-06: Set up GitHub repo CI pipeline and Claude Code Action

**Labels:** `phase:a`, `risk:high`, `model:opus`

#### Context
Per AI-ADR-006 and AI-ADR-008, we need CI and AI-powered PR review before starting feature work. The repo already exists on GitHub (A-01).

#### Task
- Create `.github/workflows/ci.yml`:
  - Triggers on pull request to main
  - Steps: checkout, setup Node, pnpm install, `turbo check`, `turbo test`, `turbo lint`, `turbo validate`
  - All four must pass for the PR to be mergeable
- Set up branch protection on `main`: require CI to pass, require 1 review (Claude counts)
- Run `/install-github-app` in Claude Code to set up claude-code-action
- Create `.github/workflows/claude.yml` for PR review with `@claude` trigger
- Create GitHub issue template (`.github/ISSUE_TEMPLATE/task.md`) matching AI-ADR-007 format
- Add `ANTHROPIC_API_KEY` to repository secrets

#### Acceptance Criteria
- [ ] Push to a branch and open a PR triggers CI workflow
- [ ] CI runs all four checks and reports status on the PR
- [ ] Commenting `@claude review` on the PR triggers Claude Code Action
- [ ] Claude posts a review comment on the PR
- [ ] Issue template is available when creating new issues
- [ ] Branch protection prevents direct pushes to main

#### Constraints
- Use `claude-code-action@v1`
- CI should complete in under 3 minutes
- Do NOT add auto-merge yet — that comes in Phase C

---

### A-07: Set up per-package CLAUDE.md files and initial skills

**Labels:** `phase:a`, `risk:high`, `model:opus`

#### Context
Per AI-ADR-002 and AI-ADR-003, per-package context and skills must be in place before autonomous work begins. The root CLAUDE.md and docs already exist (A-01). Now that all packages are scaffolded, each needs its own context file.

#### Task
- Create per-package `CLAUDE.md` for each package:
  - `shared`: schemas, config, lookups, no external dependencies
  - `producer`: reads CSV, publishes to `apartment-sales-raw`, uses KafkaJS
  - `processor`: consumes `sales-raw`, enriches, publishes to `sales-enriched`, consumer group `processor-enrichment`
  - `serving`: consumes `sales-enriched`, writes to TimescaleDB, consumer group `serving-db-writer`
  - `api`: tRPC server, queries TimescaleDB, no Kafka dependency
  - `web`: Vite + React, Recharts, connects to tRPC API
  - `orchestrator`: spawns Claude Code headless, queries GitHub issues
- Create three skills:
  - `.claude/skills/new-enrichment/SKILL.md`
  - `.claude/skills/review-architecture/SKILL.md`
  - `.claude/skills/replay-topic/SKILL.md`

#### Acceptance Criteria
- [ ] Every package directory has a `CLAUDE.md`
- [ ] All three skills have `SKILL.md` with YAML frontmatter (name, description, trigger conditions)
- [ ] Starting a Claude Code session in any package directory shows awareness of that package's role
- [ ] Skills reference specific files and patterns in the codebase

#### Constraints
- Per-package files should be 10–30 lines each
- Skills should be actionable — an agent following the skill should produce correct output
- Do NOT modify root `CLAUDE.md` — it already points to docs

---

### A-08: Set up Claude Code hooks

**Labels:** `phase:a`, `risk:high`, `model:sonnet`

#### Context
Per AI-ADR-017, we need five hooks configured before autonomous work begins. These provide deterministic guardrails.

#### Task
Configure in `.claude/settings.json`:
1. **PostToolUse → auto-format**: matcher `Write|Edit`, run `biome format --write` on the edited file path
2. **PreToolUse → file protection**: matcher `Write|Edit`, block edits to `docker-compose.yml`, `.github/workflows/`, `.claude/` — exit code 2 with error message
3. **Stop → test runner**: run `turbo test` and `turbo check`, surface results as context
4. **Notification → Telegram**: async command hook that posts to Telegram bot API (read bot token and chat ID from env vars, no-op if not configured)
5. **SessionStart → context loader**: inject output of `git status --short`, `git branch --show-current`, and if a `CURRENT_ISSUE` env var is set, fetch the issue body via `gh issue view`

Create hook scripts in `.claude/hooks/` as standalone scripts:
- `format.sh`
- `protect.sh`
- `test-on-stop.sh`
- `notify-telegram.sh`
- `load-context.sh`

#### Acceptance Criteria
- [ ] Editing a `.ts` file via Claude Code triggers auto-formatting
- [ ] Attempting to edit `docker-compose.yml` is blocked with a clear error
- [ ] When Claude finishes a task, test results appear in the output
- [ ] If `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set, a notification is sent
- [ ] Session start shows git status and current branch
- [ ] `/hooks` in Claude Code shows all five hooks under the correct events

#### Constraints
- All hooks must be command type (no prompt or agent hooks yet)
- Each hook script must be fast (under 2 seconds) except the stop hook (test runner)
- Telegram hook must be async and must not fail the session if Telegram is unreachable
- File protection hook must be bypassable by setting `ALLOW_INFRA_EDIT=true` env var

---

## Phase B — Tracer Bullet (Semi-Autonomous)

The first end-to-end vertical slice. Build interactively with Claude Code (Sonnet), using plan mode for multi-file tasks. PRs get AI review via claude-code-action. This phase validates the full pipeline and the AI review workflow.

---

### B-01: Implement CSV producer

**Labels:** `phase:b`, `risk:high`, `model:sonnet`

#### Context
First step in the data pipeline. The producer reads a CSV file (manually downloaded from asuntojen.hintatiedot.fi) and publishes each row as a raw event to Kafka.

See `packages/shared/src/schemas/raw-sale-event.ts` for the event schema.
See `packages/shared/src/config/topics.ts` for `TOPIC_SALES_RAW`.

#### Task
Implement in `packages/producer/src/`:
- `csv-parser.ts` — reads a CSV file path from CLI args, parses rows, maps to raw sale event objects
- `kafka-producer.ts` — connects to Redpanda via KafkaJS, publishes events to `TOPIC_SALES_RAW` with postal code as key, JSON serialized
- `index.ts` — main entry point: parse CSV → validate each row with Zod → publish valid rows → log invalid rows with reason → print summary (N published, M skipped)

Add `kafkajs` as a dependency of `producer`.
Add a sample CSV file `data/sample-sales.csv` with 10-20 realistic Helsinki apartment sale rows.

#### Acceptance Criteria
- [ ] `tsx packages/producer/src/index.ts data/sample-sales.csv` publishes events to Redpanda
- [ ] Events are visible in Redpanda Console on the `apartment-sales-raw` topic
- [ ] Each event has the postal code as the message key
- [ ] Invalid rows are logged with validation error details and skipped (not published)
- [ ] Summary printed: "Published 18 events, skipped 2 (invalid)"
- [ ] Unit test for CSV row → Zod schema mapping with valid and invalid inputs

#### Constraints
- Do NOT modify the `shared` package schemas unless a field is genuinely missing from the CSV data
- Do NOT implement any enrichment — raw data only
- Use the Zod schema from `shared` for validation, do not duplicate

---

### B-02: Implement price-per-sqm enrichment in processor

**Labels:** `phase:b`, `risk:high`, `model:sonnet`

#### Context
First enrichment step. The processor consumes raw events, calculates €/m², and publishes enriched events. This is the core Kafka consumer-producer pattern we want to learn.

See `packages/shared/src/schemas/enriched-sale-event.ts` for the target schema.
See `packages/shared/src/config/topics.ts` for `TOPIC_SALES_RAW` and `TOPIC_SALES_ENRICHED`.
Follow the error handling pattern from ADR-019: try/catch with publish to `TOPIC_DEAD_LETTER` on failure.

#### Task
Implement in `packages/processor/src/`:
- `enrichments/price-per-sqm.ts` — pure function: takes raw event, returns `price_per_sqm` (price / square_meters). Handles edge cases (zero sqm, missing data).
- `enrichments/area-label.ts` — pure function: takes postal code, returns `area_label` and `district` from the shared lookup table. Returns "Unknown" for unmapped codes.
- `kafka-consumer.ts` — KafkaJS consumer in group `processor-enrichment-v1`, subscribes to `TOPIC_SALES_RAW`, for each message: parse with Zod, apply enrichments, publish to `TOPIC_SALES_ENRICHED`. On error: publish original event + error to `TOPIC_DEAD_LETTER`.
- `index.ts` — main entry point: connect consumer, start processing loop, handle graceful shutdown (SIGINT/SIGTERM)

Stub out `deviation_from_area_avg` as `null` for now — it requires historical data we don't have yet.

#### Acceptance Criteria
- [ ] With producer and processor both running, events flow from `sales-raw` to `sales-enriched`
- [ ] Enriched events in Redpanda Console have `price_per_sqm`, `area_label`, and `district` fields
- [ ] An event with `square_meters: 0` lands in `sales-dead-letter` with error details
- [ ] An event with an unknown postal code gets `area_label: "Unknown"` (not dead-lettered)
- [ ] Graceful shutdown: Ctrl+C disconnects cleanly without losing messages
- [ ] Unit tests for `price-per-sqm.ts` and `area-label.ts` with edge cases
- [ ] `turbo test` passes

#### Constraints
- Consumer group ID must include version suffix (`-v1`) per ADR-027
- Do NOT implement deviation scoring yet — just stub as null
- Do NOT implement the serving layer — that's the next issue
- Enrichment functions must be pure — no side effects, no Kafka imports

---

### B-03: Implement serving layer — DB writer

**Labels:** `phase:b`, `risk:high`, `model:sonnet`

#### Context
The serving consumer reads enriched events and writes them to TimescaleDB. This completes the data pipeline — after this, data flows from CSV to database.

See `packages/shared/src/schemas/enriched-sale-event.ts` for the event schema.
See `scripts/init-db.sql` for the table schema.
See ADR-029 for deduplication via upsert with composite natural key.

#### Task
Implement in `packages/serving/src/`:
- `db.ts` — database connection pool using `pg` (node-postgres). Reads `DATABASE_URL` from shared config.
- `writer.ts` — function that takes an enriched sale event and upserts into `apartment_sales` table. Uses `INSERT ... ON CONFLICT (postal_code, address, sale_date, price, square_meters) DO NOTHING`.
- `kafka-consumer.ts` — KafkaJS consumer in group `serving-db-writer-v1`, subscribes to `TOPIC_SALES_ENRICHED`, for each message: parse with Zod, write to DB. On DB error: publish to dead letter.
- `index.ts` — main entry point: connect consumer and DB pool, start processing loop, graceful shutdown closes both.

Add `pg` as a dependency.

#### Acceptance Criteria
- [ ] With full pipeline running (producer → processor → serving), events land in the `apartment_sales` TimescaleDB table
- [ ] `SELECT * FROM apartment_sales` returns the sample data with enriched fields
- [ ] Running the same CSV through the producer again does not create duplicate rows (upsert works)
- [ ] DB connection errors are caught and the event is sent to dead letter (not crash)
- [ ] Graceful shutdown closes DB pool and Kafka consumer
- [ ] `turbo test` passes (unit test for the upsert SQL generation)

#### Constraints
- Do NOT use an ORM — plain `pg` with parameterized queries
- Do NOT implement the aggregator consumer yet — that's a future improvement
- Ensure SQL is parameterized to prevent injection

---

### B-04: Implement tRPC API with three endpoints

**Labels:** `phase:b`, `risk:high`, `model:sonnet`

#### Context
The API layer exposes data from TimescaleDB to the front-end. Per ADR-021, we need three views: time series, area comparison, and filtered sale list.

See ADR-010 (tRPC), ADR-022 (filtering), ADR-030 (DB schema).

#### Task
Implement in `packages/api/src/`:
- `db.ts` — database connection pool (can share pattern with serving, but separate instance)
- `routers/sales.ts` — tRPC router with three procedures:
  - `timeSeries` — input: postal codes (array), date range. Returns monthly avg €/m² per postal code. SQL uses TimescaleDB `time_bucket`.
  - `areaComparison` — input: postal codes (array), date range. Returns aggregate stats per postal code (avg/median/min/max €/m², count).
  - `salesList` — input: postal codes (array), date range, optional min/max price, sort field, sort order, limit, offset. Returns paginated list of individual sales.
- `index.ts` — tRPC standalone server (or express adapter) with CORS enabled for localhost dev.

Add `@trpc/server`, `pg`, and `express` (or standalone adapter) as dependencies.

#### Acceptance Criteria
- [ ] API starts and serves on `http://localhost:3000`
- [ ] `timeSeries` returns monthly data points for requested postal codes
- [ ] `areaComparison` returns aggregate stats grouped by postal code
- [ ] `salesList` returns paginated results with correct filtering and sorting
- [ ] Empty postal codes array returns data for all areas
- [ ] Date range filtering works correctly
- [ ] Invalid inputs return proper tRPC error responses
- [ ] `turbo test` passes (unit tests for SQL query builders)

#### Constraints
- Do NOT add authentication
- Do NOT implement caching — direct DB queries are fine at this scale
- All inputs must be validated with Zod (tRPC does this naturally)
- SQL must be parameterized

---

### B-05: Implement React dashboard with three views

**Labels:** `phase:b`, `risk:low`, `model:sonnet`

#### Context
The front-end layer. Per ADR-021 and ADR-022, we need time series chart, area comparison bar chart, and filterable sale list, with global area and date range filters.

See ADR-011 (Vite + React + Recharts), ADR-022 (hybrid filtering).

#### Task
Scaffold and implement in `packages/web/`:
- Vite + React setup with TypeScript
- tRPC client connected to `http://localhost:3000`
- Global filter bar at top: postal code multi-select dropdown, date range picker (start/end month)
- Three view components:
  - `TimeSeriesChart.tsx` — Recharts LineChart, one line per selected postal code, monthly €/m² over time
  - `AreaComparison.tsx` — Recharts BarChart, avg €/m² per selected postal code for the date range
  - `SalesList.tsx` — table with columns: date, area, address, price, m², €/m², rooms, building type. Sortable by clicking column headers. Paginated.
- Layout: filter bar at top, two charts side by side (or stacked on small screens), table below

#### Acceptance Criteria
- [ ] `turbo dev` starts the web app and it loads in browser
- [ ] Changing the area multi-select updates all three views
- [ ] Changing the date range updates all three views
- [ ] Time series chart shows one line per selected area
- [ ] Area comparison chart shows bars for selected areas
- [ ] Sale list is sortable by each column
- [ ] Sale list paginates (next/previous page)
- [ ] Loading states shown while data fetches
- [ ] Empty states shown when no data matches filters

#### Constraints
- Do NOT add routing — single page is fine
- Do NOT add authentication
- Do NOT focus on polish — functional is the goal, styling can improve later
- Use Recharts, not D3 or Chart.js

---

### B-06: End-to-end tracer bullet verification

**Labels:** `phase:b`, `risk:high`, `model:sonnet`

#### Context
All pipeline components now exist. This issue verifies the full flow works end-to-end and documents the "how to run" process.

#### Task
- Create `scripts/run-pipeline.sh` that:
  1. Checks Docker Compose is running
  2. Runs the producer with `data/sample-sales.csv`
  3. Waits for events to flow through (poll Redpanda Console or check DB)
  4. Prints summary: events in raw topic, enriched topic, dead letter, DB rows
- Update root `README.md` with:
  - Project description
  - Prerequisites (Docker, Node, pnpm)
  - Quick start: `docker compose up -d`, `pnpm install`, `turbo dev`, `scripts/run-pipeline.sh`
  - Architecture diagram (from ADR docs)
  - Link to docs
- Verify the full flow manually: CSV → raw topic → enriched topic → TimescaleDB → tRPC API → React dashboard showing charts and data
- Fix any integration issues discovered

#### Acceptance Criteria
- [ ] A new developer can clone the repo, follow README, and see data in the dashboard within 10 minutes
- [ ] `scripts/run-pipeline.sh` succeeds and prints correct counts
- [ ] Dashboard shows time series, area comparison, and sale list with the sample data
- [ ] Dead letter topic is empty (all sample data is valid)
- [ ] README is accurate and complete

#### Constraints
- Do NOT add new features — this is verification and documentation only
- Fix integration bugs in the relevant package, not with workarounds

---

## Phase C — Autonomous Widening

These issues are designed for autonomous execution via Ralph loop. Each is self-contained with clear acceptance criteria. Label `ralph-ready` when ready for pickup. Start with `risk:high` (manual review), move to `risk:low` after confidence builds.

---

### C-01: Build the orchestrator package

**Labels:** `phase:c`, `risk:high`, `model:sonnet`

#### Context
Per AI-ADR-012, we need a thin TypeScript orchestrator that queries GitHub issues and spawns Claude Code headless. This enables the autonomous development loop.

See `docs/ai-workflow-decisions.md` AI-ADR-012 for requirements.

#### Task
Implement in `packages/orchestrator/src/`:
- `github.ts` — query issues via `gh` CLI: `listReadyIssues()` (label `ralph-ready`, state open, limit 1), `labelIssue(id, label)`, `createPR(branch, title, body)`
- `claude.ts` — spawn Claude Code in headless mode: `runClaude(prompt, options)` with `--print`, `--output-format json`, `--permission-mode auto`, `--max-turns 30`, configurable model
- `escalation.ts` — track attempts per issue, implement escalation chain: Haiku (3) → Sonnet (2) → needs-human
- `index.ts` — main loop: fetch next issue → set `CURRENT_ISSUE` env var → spawn Claude with issue body as prompt → on success: create PR, label issue `in-review` → on failure: escalate or label `needs-human` → repeat
- `notify.ts` — send Telegram messages on key events (PR created, issue escalated, loop complete)

#### Acceptance Criteria
- [ ] `tsx packages/orchestrator/src/index.ts` picks up a `ralph-ready` issue and spawns Claude Code
- [ ] On successful implementation, a PR is created referencing the issue
- [ ] After 3 Haiku failures, automatically retries with Sonnet
- [ ] After 2 Sonnet failures, labels issue `needs-human` with summary comment
- [ ] Telegram notification sent on PR creation and escalation
- [ ] Loop moves to next issue after completing or escalating current one
- [ ] Graceful shutdown on SIGINT

#### Constraints
- Do NOT use `--dangerously-skip-permissions` — use `--permission-mode auto`
- Orchestrator must only import from `shared`
- Maximum 300 lines of code — keep it simple

---

### C-02: Add deviation scoring enrichment

**Labels:** `phase:c`, `risk:low`, `ralph-ready`, `model:haiku`

#### Context
The `deviation_from_area_avg` field is currently stubbed as `null` in the processor. Now that we have historical data in TimescaleDB, we can calculate it.

See `packages/processor/src/enrichments/price-per-sqm.ts` for the existing enrichment pattern.
See `packages/shared/src/schemas/enriched-sale-event.ts` for the field definition.

#### Task
Implement in `packages/processor/src/`:
- `enrichments/deviation-score.ts` — function that takes `postal_code` and `price_per_sqm`, queries TimescaleDB for the area's average €/m² over the last 365 days, returns the percentage deviation. Returns `null` if fewer than 5 sales in the area.
- Wire into the processor pipeline alongside existing enrichments
- Add DB connection to the processor (read-only, for lookups)

#### Acceptance Criteria
- [ ] Enriched events now include a numeric `deviation_from_area_avg` or `null`
- [ ] A sale at exactly the area average has deviation `0`
- [ ] A sale 10% above average has deviation `10` (or `0.1` — be consistent with schema)
- [ ] Areas with fewer than 5 historical sales get `null`
- [ ] Unit test for the deviation calculation logic
- [ ] Existing tests still pass — `turbo test` green

#### Constraints
- Do NOT modify the Zod schemas in `shared` (field already exists)
- Do NOT modify the serving layer or API — they already handle this field
- Keep the DB query simple — no caching needed at this scale

---

### C-03: Add building type filter to sales list

**Labels:** `phase:c`, `risk:low`, `ralph-ready`, `model:haiku`

#### Context
The sales list currently filters by area and date range. Adding a building type filter (kerrostalo/rivitalo/etc.) is a useful per-view filter as described in ADR-022.

See `packages/api/src/routers/sales.ts` for the `salesList` procedure.
See `packages/web/src/` for the SalesList component.

#### Task
- Add optional `buildingTypes` (string array) input to the `salesList` tRPC procedure
- Add WHERE clause filtering when building types are provided
- Add a multi-select or checkbox group to the SalesList component for building type filtering
- Populate the building type options from the data (query distinct values, or hardcode common types)

#### Acceptance Criteria
- [ ] Selecting "kerrostalo" shows only apartment building sales
- [ ] Selecting multiple types shows sales matching any selected type
- [ ] No selection shows all types (current behavior preserved)
- [ ] Building type filter combines correctly with area and date range filters
- [ ] `turbo test` passes

#### Constraints
- Do NOT modify global filters — this is a per-view filter on the sales list only
- Do NOT modify other views

---

### C-04: Add room count filter to sales list

**Labels:** `phase:c`, `risk:low`, `ralph-ready`, `model:haiku`

#### Context
Similar to C-03, adding a room count filter to the sales list. Users often want to see "all 2-room apartments in Kallio."

See `packages/api/src/routers/sales.ts` for the `salesList` procedure.

#### Task
- Add optional `minRooms` and `maxRooms` (number) inputs to the `salesList` tRPC procedure
- Add WHERE clause filtering
- Add room count range inputs (two number dropdowns or a slider) to the SalesList component

#### Acceptance Criteria
- [ ] Setting rooms 2–3 shows only 2- and 3-room apartments
- [ ] Setting only minRooms works (no upper bound)
- [ ] Setting only maxRooms works (no lower bound)
- [ ] Combines correctly with all other filters
- [ ] `turbo test` passes

#### Constraints
- Do NOT modify other views or global filters

---

### C-05: Add price range filter to sales list

**Labels:** `phase:c`, `risk:low`, `ralph-ready`, `model:haiku`

#### Context
Users want to filter by total price (e.g. "apartments under €300,000").

See `packages/api/src/routers/sales.ts` for the `salesList` procedure.

#### Task
- Add optional `minPrice` and `maxPrice` (number) inputs to the `salesList` tRPC procedure
- Add WHERE clause filtering
- Add price range inputs to the SalesList component (two number inputs with € formatting)

#### Acceptance Criteria
- [ ] Setting max price €200,000 shows only cheaper apartments
- [ ] Combines correctly with all other filters
- [ ] `turbo test` passes

#### Constraints
- Do NOT modify other views or global filters

---

### C-06: Add €/m² range filter to sales list

**Labels:** `phase:c`, `risk:low`, `ralph-ready`, `model:haiku`

#### Context
Filtering by €/m² is often more useful than total price for comparison purposes.

See `packages/api/src/routers/sales.ts` for the `salesList` procedure.

#### Task
- Add optional `minPricePerSqm` and `maxPricePerSqm` (number) inputs to the `salesList` tRPC procedure
- Add WHERE clause filtering on `price_per_sqm` column
- Add €/m² range inputs to the SalesList component

#### Acceptance Criteria
- [ ] Setting range 3000–5000 shows only sales in that €/m² range
- [ ] Combines correctly with all other filters
- [ ] `turbo test` passes

#### Constraints
- Do NOT modify other views or global filters

---

### C-07: Add summary stats cards to dashboard

**Labels:** `phase:c`, `risk:low`, `ralph-ready`, `model:haiku`

#### Context
Per the future improvements backlog, headline numbers at the top of the dashboard give quick context: median €/m² this period, total sales count, highest/lowest €/m² area.

See `packages/api/src/routers/sales.ts` for existing query patterns.

#### Task
- Add `summaryStats` tRPC procedure — input: postal codes, date range. Returns: total sales count, median €/m², avg €/m², area with highest avg €/m², area with lowest avg €/m²
- Add `SummaryCards.tsx` component to the dashboard, displayed above the charts
- Show 4-5 cards with the key numbers

#### Acceptance Criteria
- [ ] Summary cards appear at the top of the dashboard
- [ ] Cards update when global filters change
- [ ] Numbers are formatted readably (€ symbol, thousand separators)
- [ ] Loading state while data fetches
- [ ] `turbo test` passes

#### Constraints
- Do NOT modify existing views — add above them

---

### C-08: Add building year filter and decade grouping

**Labels:** `phase:c`, `risk:low`, `ralph-ready`, `model:haiku`

#### Context
Building age significantly affects apartment prices. A decade grouping (1960s, 1970s, etc.) is more useful than exact year filtering.

#### Task
- Add optional `buildingDecades` (string array, e.g. `["1970", "1980"]`) input to the `salesList` procedure
- SQL: `building_year >= 1970 AND building_year < 1980` for decade "1970"
- Add decade multi-select to the SalesList component
- Add building decade as a grouping option in `areaComparison` — when enabled, bars show avg €/m² per decade instead of per area

#### Acceptance Criteria
- [ ] Filtering by decade "2000" shows only buildings built 2000–2009
- [ ] Multiple decades can be selected
- [ ] Area comparison view can toggle between "by area" and "by decade" grouping
- [ ] `turbo test` passes

#### Constraints
- Do NOT modify the time series view

---

### C-09: Improve dashboard styling and responsiveness

**Labels:** `phase:c`, `risk:low`, `ralph-ready`, `model:haiku`

#### Context
The v1 dashboard is functional but unstyled. Basic visual polish makes it more pleasant to use without going overboard.

#### Task
- Add a consistent color scheme (use Recharts default colors or a simple custom palette)
- Add proper spacing, padding, and typography
- Make the layout stack vertically on screens under 768px wide
- Style the filter controls to look cohesive
- Add a simple header with project name
- Format numbers throughout: € with thousand separators, m² with one decimal, dates in Finnish format (DD.MM.YYYY)

#### Acceptance Criteria
- [ ] Dashboard looks cohesive and professional (subjective — reviewer's judgment)
- [ ] All numbers are formatted consistently
- [ ] Layout works on both desktop (1200px+) and tablet (768px) widths
- [ ] No styling changes break functionality
- [ ] `turbo test` passes

#### Constraints
- Do NOT add a CSS framework — use plain CSS or CSS modules
- Do NOT change any data logic or API calls
- Keep it simple — this is not a redesign

---

### C-10: Add CSV export for filtered sales

**Labels:** `phase:c`, `risk:low`, `ralph-ready`, `model:haiku`

#### Context
Users may want to export filtered data for further analysis in Excel or other tools.

#### Task
- Add an "Export CSV" button to the SalesList component
- On click, fetch all matching sales (not just the current page) and generate a CSV file
- Trigger browser download of the CSV

#### Acceptance Criteria
- [ ] Clicking "Export CSV" downloads a `.csv` file
- [ ] CSV includes all columns visible in the table
- [ ] CSV respects current filters (area, date range, building type, etc.)
- [ ] CSV includes a header row
- [ ] Works with large result sets (1000+ rows)
- [ ] `turbo test` passes

#### Constraints
- Generate CSV client-side (no new API endpoint needed — reuse salesList with high limit)
- Do NOT add server-side CSV generation

---

### C-11: Set up GitHub Actions Fixer workflow

**Labels:** `phase:c`, `risk:high`, `model:sonnet`

#### Context
Per AI-ADR-006 Phase 3, we need a Fixer agent that auto-repairs CI failures on PRs. This closes the autonomous loop.

#### Task
- Create `.github/workflows/fixer.yml`:
  - Triggers when CI workflow fails on a PR
  - Runs claude-code-action with prompt: "CI failed on this PR. Read the CI logs, identify the failure, fix it, and push a commit."
  - Limits to 1 fix attempt per CI failure (prevent infinite loops)
  - Only runs on PRs created by the orchestrator (check PR author or label)
- Add `fix-attempt` label to track that a fix was attempted

#### Acceptance Criteria
- [ ] When CI fails on an orchestrator PR, the fixer workflow triggers
- [ ] Claude reads the failure logs and pushes a fix commit
- [ ] CI re-runs on the fix commit
- [ ] If the fix succeeds, PR becomes green
- [ ] Fixer does NOT trigger on human-created PRs
- [ ] Fixer does NOT trigger more than once per CI failure (no infinite loop)
- [ ] `fix-attempt` label is added after the attempt

#### Constraints
- Do NOT trigger on PRs not created by the orchestrator
- Do NOT allow more than 2 consecutive fix attempts on the same PR
- Use `claude-code-action@v1`

---

### C-12: Set up auto-merge for low-risk PRs

**Labels:** `phase:c`, `risk:high`, `model:sonnet`

#### Context
Per AI-ADR-014, PRs from `risk:low` issues should auto-merge when CI passes and AI review has no blockers.

#### Task
- Create `.github/workflows/auto-merge.yml`:
  - Triggers when CI passes on a PR
  - Checks if the linked issue has `risk:low` label
  - Checks if Claude's review has no blocking comments
  - If both conditions met, enables auto-merge (squash)
- Update branch protection to allow auto-merge when enabled

#### Acceptance Criteria
- [ ] A `risk:low` PR that passes CI and review auto-merges
- [ ] A `risk:high` PR that passes CI does NOT auto-merge
- [ ] A `risk:low` PR with a blocking review comment does NOT auto-merge
- [ ] Merged PRs close the linked issue

#### Constraints
- Do NOT enable auto-merge for any PR without the `risk:low` label on its linked issue
- Squash merge only — keep main branch history clean

---

## Issue Summary

| ID | Title | Phase | Risk | Model | Dependencies |
|---|---|---|---|---|---|
| A-01 | Set up root CLAUDE.md, docs, and Git repo | A | high | opus | — |
| A-02 | Initialize monorepo skeleton | A | high | sonnet | A-01 |
| A-03 | Set up Docker Compose infrastructure | A | high | sonnet | A-02 |
| A-04 | Create shared package | A | high | sonnet | A-02 |
| A-05 | Set up dependency-cruiser | A | high | sonnet | A-02, A-04 |
| A-06 | Set up GitHub repo CI, Claude Action | A | high | opus | A-02 through A-05 |
| A-07 | Set up per-package CLAUDE.md and skills | A | high | opus | A-06 |
| A-08 | Set up Claude Code hooks | A | high | sonnet | A-07 |
| B-01 | Implement CSV producer | B | high | sonnet | A-03, A-04 |
| B-02 | Implement processor with enrichments | B | high | sonnet | B-01 |
| B-03 | Implement serving layer — DB writer | B | high | sonnet | B-02 |
| B-04 | Implement tRPC API | B | high | sonnet | B-03 |
| B-05 | Implement React dashboard | B | low | sonnet | B-04 |
| B-06 | End-to-end tracer bullet verification | B | high | sonnet | B-05 |
| C-01 | Build the orchestrator package | C | high | sonnet | B-06 |
| C-02 | Add deviation scoring enrichment | C | low | haiku | B-06 |
| C-03 | Add building type filter | C | low | haiku | B-06 |
| C-04 | Add room count filter | C | low | haiku | B-06 |
| C-05 | Add price range filter | C | low | haiku | B-06 |
| C-06 | Add €/m² range filter | C | low | haiku | B-06 |
| C-07 | Add summary stats cards | C | low | haiku | B-06 |
| C-08 | Add building year filter and decade grouping | C | low | haiku | B-06 |
| C-09 | Improve dashboard styling | C | low | haiku | B-06 |
| C-10 | Add CSV export | C | low | haiku | B-06 |
| C-11 | Set up GitHub Actions Fixer | C | high | sonnet | C-01 |
| C-12 | Set up auto-merge | C | high | sonnet | C-11 |

**Phase A:** 8 issues (interactive, ~2 days)
**Phase B:** 6 issues (semi-autonomous, ~2-3 days)
**Phase C:** 12 issues (autonomous, ~1-2 days of agent time + review)

**Total estimated effort:** ~1 week of focused work, with Phase C largely hands-off.
