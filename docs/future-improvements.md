# Helsinki Apartment Tracker — Future Improvements Backlog

Items explicitly deferred during architecture planning. Roughly ordered by value and natural sequencing.

---

## Individual Sale Features — Deferred

These features require individual apartment sale records (address, price, m², rooms, building year) rather than the aggregate statistics provided by the Tilastokeskus StatFin PxWeb API. Deferred until an individual sale data source is available (e.g. DVV/Maanmittauslaitos, or a future StatFin endpoint with record-level data).

### Room Count Filter
Filter the sale list by number of rooms (e.g. "all 2-room apartments in Kallio").
- Requires `rooms` field in the data model
- Was C-04 before the data source change

### Total Price Range Filter
Filter by total sale price (e.g. "apartments under €300,000").
- Requires individual `price` field in the data model
- Was C-05 before the data source change

### Building Year Filter and Decade Grouping
Filter by building construction decade. Add decade grouping option to area comparison view.
- Requires `building_year` field in the data model
- Was C-08 before the data source change

---

## Iteration 2 — Natural Next Steps

### Map View
Add a geographic view with sales plotted on a map, color-coded by €/m².
- Requires geocoding postal codes (or street addresses) to coordinates
- Leaflet integration with marker clustering
- Consider Helsinki Region Infoshare or OpenStreetMap for geocoding
- **Prerequisite for:** transit distance enrichment

### Rolling Averages via Continuous Aggregates
Extend TimescaleDB continuous aggregate to compute rolling window stats (90/180/365 day median €/m² per area).
- TimescaleDB supports this natively
- Powers trend lines on time series charts
- Consider adding the `serving-aggregator` consumer group at this stage

### Oikotie / Etuovi Scraping
Add active listings as a second data source alongside completed sales.
- Playwright/Puppeteer scheduled scraping
- New topic: `apartment-listings-raw` (separate from sales)
- Legal/ToS considerations to review
- Enables "listing price vs actual sale price" analysis

---

## Iteration 3 — Enrichments

### Distance to Transit
Enrich sales with distance to nearest metro/train/tram station.
- HSL open data or OpenStreetMap for station locations
- Haversine distance or routing API
- Requires geocoded addresses (depends on map view work)

### Building Age Buckets
Classify buildings into era categories (pre-war, 1950s–60s, 1970s brutalist, 1980s–90s, 2000s+, new build).
- Simple range mapping from `building_year`
- Enables "how does building era affect €/m²" analysis

### Summary Stats Dashboard Cards
Headline numbers at the top of the dashboard: median €/m² this quarter, total sales count, most expensive area, biggest price change.
- Derived from existing data, just a new front-end component

---

## Iteration 4 — Production Hardening

### Integration Tests with Testcontainers
Spin up real Redpanda and TimescaleDB in Docker for end-to-end pipeline tests.
- Test full flow: produce CSV → raw topic → enriched topic → DB → API response
- Use Testcontainers for Node.js

### Deployment to DigitalOcean VPS
Deploy via Docker Compose to existing DigitalOcean Linux VPS.
- Move Docker Compose to production mode (resource limits, restart policies)
- Consider Caddy or nginx reverse proxy for the web dashboard
- Set up basic monitoring (health checks, disk space)

### Logging and Observability
Replace console.log with structured logging (pino).
- Correlation IDs across pipeline stages
- Log aggregation if deployed

### CI/CD Pipeline
GitHub Actions or similar.
- Run Vitest unit tests
- Run dependency-cruiser validation
- Build check for all packages
- Optional: deploy on push to main

---

## Iteration 5 — Nice to Have

### Mobile Responsiveness
Make the dashboard usable on phone/tablet.
- Responsive Recharts configuration
- Collapsible filter panels
- Touch-friendly controls

### Authentication
Add basic auth if deploying publicly.
- Simple approach: HTTP basic auth via reverse proxy
- Or: Cloudflare Access (free for small teams)

### Additional Data Sources
- **DVV / Maanmittauslaitos** — official property transaction records for cross-validation
- **Tilastokeskus** — aggregate statistics for macro-level context
- **FMI weather data** — seasonal correlation analysis (do sales patterns follow seasons?)

### Alerts / Notifications
Notify when a sale matches certain criteria (e.g. "€/m² under 3000 in Kallio").
- Consumer that checks enriched events against saved filters
- Telegram bot or email notification
- Would require some kind of user preferences store

### Schema Registry Migration
Move from Zod-only validation to Avro/Protobuf with Confluent Schema Registry.
- Enforces schema evolution rules (backward/forward compatibility)
- Useful learning exercise for production Kafka patterns
- Redpanda has built-in Schema Registry support

### Kafka Streams / Faust Exploration
Rewrite the processor using a proper stream processing framework.
- Compare ergonomics with manual KafkaJS loops
- Practice windowed aggregations, stream-table joins
- Could be Java Kafka Streams or Python Faust as a polyglot experiment

### LLM-Powered Analysis
Use an LLM to generate natural language market summaries.
- "Prices in Kallio rose 3% this quarter, driven by new builds near Sörnäisten metro"
- Could be a scheduled job or on-demand via the dashboard
- Interesting intersection of the Kafka pipeline with AI trends (learning goal #3)

---

## AI Workflow Improvements

### Claude Code Action for PR Review
Add AI-powered PR review via `@claude` mentions using `anthropics/claude-code-action@v1`.
- Requires an Anthropic API key (`ANTHROPIC_API_KEY` repo secret)
- Workflow file: `.github/workflows/claude.yml` — triggers on `issue_comment`, `pull_request_review_comment`, `pull_request_review`, and `issues` events
- Model: `claude-sonnet-4-6` per AI-ADR-009
- Consider also triggering automatically on `pull_request: [opened, synchronize]` to remove the need for manual `@claude review` comments

### Additional Skills
Create as repetition demands:
- `new-consumer` — step-by-step for creating a new Kafka consumer
- `new-trpc-endpoint` — add a tRPC procedure with proper typing
- `new-dashboard-view` — add a new React view wired to tRPC and global filters

### Prompt / Agent Hooks
Graduate from command-only hooks to more sophisticated patterns:
- **Prompt hook for security gate** — AI evaluates whether an edit touches sensitive areas (auth, config, payment) and blocks for human review
- **Agent hook for deep verification** — spawns a subagent that reads the full PR diff and checks for architectural violations beyond what dependency-cruiser catches

### Token Usage Dashboard
Track cost per issue, success/failure rates, and model escalation frequency.
- Could be a simple script that parses Anthropic billing API or local JSONL session logs
- Helps optimize model routing decisions over time

### Multi-Agent Teams
Use Claude Code's Agent Teams feature for parallel work:
- One agent implements backend, another implements frontend simultaneously
- Coordinator agent merges results
- Overkill for solo project now, but interesting to experiment with

### Claude Code Routines
Replace local Ralph loop with Anthropic-hosted routines when trust is high enough.
- Runs on Anthropic infrastructure, no local machine needed
- Limited to 5/day on Pro plan — evaluate if Max plan is worth it
- Good fit for scheduled maintenance tasks (dependency updates, doc freshness checks)

### Advanced Orchestrator Features
- Automatic issue decomposition — if an issue is too large, the orchestrator asks an LLM to break it into sub-issues
- Cost tracking per issue — log token usage and surface in GitHub issue comments
- Parallel issue processing — run multiple agents on independent issues simultaneously
- Smart scheduling — run autonomous work during off-peak hours for cheaper API rates

---

## Notes

- Items may shift between iterations based on what feels interesting at the time
- The iteration groupings are suggestions, not commitments
- New ideas will emerge during development — add them here
