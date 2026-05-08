# Helsinki Apartment Tracker — AI Workflow Decision Records

## Overview

Decisions governing how AI-assisted and autonomous development practices are applied to this project. Companion document to `architecture-decisions.md`.

---

## AI-ADR-001: AI Tooling

**Decision:** Claude Code as the sole AI coding tool.

**Usage model:**
- All-in vibe coding for front-end and boilerplate (Docker Compose, tRPC setup, Recharts dashboards)
- Scaffolding + hard parts for the Kafka pipeline (write consumer loops and offset management with more hands-on involvement to maximize learning)

**Rationale:** Claude Code's agentic capabilities (multi-file edits, shell access, codebase reasoning) are the right fit for both interactive development and autonomous workflows. Inline completion tools (Copilot) are nice-to-have but not essential.

---

## AI-ADR-002: Context Hierarchy

**Decision:** Three-layer context architecture:

1. **Root `CLAUDE.md`** — universal: monorepo structure, shared commands (`turbo dev`, `turbo build`, `turbo test`, `turbo lint`, `turbo validate`), coding conventions, pointers to `docs/`
2. **Per-package `CLAUDE.md` files** (e.g. `packages/processor/CLAUDE.md`) — always-relevant context for that package: what topic it reads/writes, consumer group, key patterns, how to run and test. Loaded automatically when Claude works on files in that directory.
3. **Skills in `.claude/skills/`** — task-specific workflows loaded on demand via description matching or slash command.

**Rationale:** Progressive disclosure of context. Root file is always loaded (keep lean). Package files are loaded when working in that directory. Skills are loaded only when the task matches. This prevents context bloat while ensuring agents always have what they need.

---

## AI-ADR-003: Skills — Initial Set

**Decision:** Start with three skills, add more as repetition demands:

- `.claude/skills/new-enrichment/SKILL.md` — how to add an enrichment function: pure function pattern, co-located test, wire into processor pipeline
- `.claude/skills/review-architecture/SKILL.md` — run dependency-cruiser, check for violations, generate dependency graph
- `.claude/skills/replay-topic/SKILL.md` — how to bump consumer group version and reprocess from beginning

**Deferred:** `new-consumer`, `new-trpc-endpoint`, `new-dashboard-view` — useful but infrequent enough that writing the skill may take longer than doing the task.

**Rationale:** Let skills emerge from repetition rather than pre-creating them speculatively.

---

## AI-ADR-004: Planning Mode Usage

**Decision:** Plan mode for complex tasks only.

- **Use plan mode:** creating a new package, wiring a new consumer, changes touching 3+ files or crossing package boundaries, Kafka pipeline work
- **Skip plan mode:** single-file edits, adding a test, tweaking a chart, vibe coding the dashboard

**Rationale:** Planning pays off when getting the order wrong wastes time (pipeline wiring). For well-scoped tasks, direct execution is faster.

---

## AI-ADR-005: Task Decomposition — Vertical Slices

**Decision:** Use the vertical slice / tracer bullet pattern for decomposition.

First slice (tracer bullet): one CSV row → Kafka raw topic → enriched with €/m² → written to TimescaleDB → visible via one tRPC endpoint → displayed in one React view.

Subsequent slices widen each layer: additional enrichments, more endpoints, more dashboard views.

**Rationale:** Vertical slices deliver working end-to-end functionality at every step. Avoids the integration hell of building horizontal layers in isolation. Each slice is independently verifiable — critical for autonomous agents.

---

## AI-ADR-006: Autonomous Development Workflow

**Decision:** GitHub-centric Three-Body pattern, built incrementally:

**Phase 1 (Bootstrap + CI review):**
- Set up GitHub repo
- Install `claude-code-action` via `/install-github-app`
- Write well-specified issues with acceptance criteria
- Use Ralph loop locally for implementation
- GitHub Actions auto-reviews every PR

**Phase 2 (CI pipeline):**
- GitHub Actions: typecheck + Vitest + Biome + dependency-cruiser via Turborepo
- All checks must pass before merge

**Phase 3 (Close the loop):**
- Build custom orchestrator in `packages/orchestrator`
- Fixer pattern: GitHub Action triggers on CI failure, attempts fix, pushes commit
- Auto-merge for low-risk PRs that pass CI + AI review

**Rationale:** Incremental trust-building. Never build autonomous infrastructure without a real codebase to test on. Never build a large pipeline without autonomous tooling to accelerate it.

---

## AI-ADR-007: GitHub Issue Template

**Decision:** Structured template for all issues intended for autonomous implementation:

```
## Context
What exists now and why this change is needed.
Reference specific files/functions where relevant.

## Task
What to implement, in concrete terms.

## Acceptance Criteria
- [ ] Specific, testable conditions that must be true when done
- [ ] Include both positive cases and edge cases

## Constraints
- Do NOT modify files outside the scope of this task
- Do NOT refactor unrelated code
- Run `turbo test` before committing

## References
Links to related ADRs, schemas, or other issues.
```

**Rationale:** Issue quality is the number one predictor of autonomous implementation success. Explicit constraints prevent scope creep. Acceptance criteria enable programmatic verification.

---

## AI-ADR-008: CI Pipeline

**Decision:** Four checks via Turborepo, targeting under 2 minutes:

```
turbo check      # tsc --noEmit across all packages
turbo test       # vitest run across all packages
turbo lint       # biome check across all packages
turbo validate   # dependency-cruiser across all packages
```

**Rationale:** Minimum viable CI that makes autonomous agents trustworthy. Fast CI means fast Fixer feedback loops. Turborepo caching skips unchanged packages.

---

## AI-ADR-009: Model Routing

**Decision:** Three-tier model routing:

| Model | Usage | When |
|---|---|---|
| Opus | Manual, on-demand | Architectural planning, complex debugging, trade-off analysis, writing initial CLAUDE.md and skills |
| Sonnet | Default for interactive work | Exploring codebase, first implementation of something new, code reviews in GitHub Actions |
| Haiku | Autonomous execution | Ralph loop iterations against well-specified issues, CI fixer, straightforward implementations |

**Escalation chain for autonomous work:** Haiku (3 attempts) → Sonnet (2 attempts) → label `needs-human` with summary → move to next issue.

**Rationale:** Cost-efficient — Haiku handles well-specified tasks, Sonnet is the safety net, Opus is reserved for high-judgment work. The fresh-context-per-loop design compensates for Haiku's weaker reasoning. Escalation prevents infinite loops.

---

## AI-ADR-010: Agent Context Across Iterations

**Decision:** GitHub issues as the source of truth for task state.

- Each issue is a self-contained task with acceptance criteria
- Ralph loop picks the next open issue with label `ralph-ready`
- Implements it, creates a PR referencing the issue
- Issue tracker = kanban board = agent task queue
- Reprioritize by reordering or relabeling issues

**Rationale:** No separate progress file to keep in sync. GitHub is the single source of truth for what's done, what's in progress (has a PR), and what's queued. The orchestrator queries `gh issue list --label ralph-ready --state open --limit 1`.

---

## AI-ADR-011: Stuck Handling

**Decision:** Iteration cap with escalation chain.

- Haiku: 3 attempts
- Auto-escalate to Sonnet: 2 attempts
- If still stuck: label issue `needs-human`, post comment summarizing what was tried and where it failed, move to next issue

**Rationale:** Cost benefits of Haiku for easy tasks, Sonnet as safety net, clean handoff when the agent genuinely can't solve it. `needs-human` label becomes the personal review queue. No task gets lost, no agent spins forever.

---

## AI-ADR-012: Custom Orchestrator

**Decision:** Build a thin custom orchestrator in TypeScript as `packages/orchestrator`.

**Responsibilities:**
- Query GitHub for next `ralph-ready` issue via `gh`
- Spawn Claude Code in headless mode (`--print`, `--output-format json`)
- Track iteration count per issue
- Handle model escalation (Haiku → Sonnet → needs-human)
- Create PR via `gh pr create`
- Label issues on success or failure
- Send Telegram notifications on key events

**Estimated size:** 200–300 lines.

**Rationale:** Ralph/ralphex would need modification anyway for GitHub issue integration and model escalation. Full frameworks (Ruflo) are overkill. Custom script gives full control and is itself a learning exercise.

---

## AI-ADR-013: Guardrails for Autonomous Agents

**Decision:** Layered guardrails:

1. **Permission mode `auto`** — safety classifier reviews each action, blocks dangerous operations, aborts on repeated blocks. No `--dangerously-skip-permissions`.
2. **Scope rules in CLAUDE.md** — "Only modify files within the package specified in the issue. Do NOT modify `docker-compose.yml`, `CLAUDE.md`, `.github/workflows/`, or configuration files unless the issue explicitly says to."
3. **Git worktree isolation** — each agent run on a fresh branch. Main branch never touched directly.
4. **Max turns per invocation** — `--max-turns 30` to prevent infinite loops.
5. **CI pipeline** — typecheck, tests, lint, dependency-cruiser must all pass before merge. Ultimate safety net.

**Rationale:** Defense in depth. Permission mode prevents dangerous actions. Scope rules prevent creep. Worktrees prevent main branch corruption. Turn limits prevent cost runaway. CI catches everything else.

---

## AI-ADR-014: Auto-Merge Policy

**Decision:** Tiered, based on issue labels:

- **`risk:low`** — auto-merge if CI passes and AI review has no blockers. Examples: adding a test, implementing a pure function enrichment, adding a dashboard component with no backend changes.
- **`risk:high`** — requires manual review. Examples: Kafka consumer wiring, database schema changes, configuration changes, orchestrator changes.

**Starting posture:** Everything `risk:high`. Gradually move task types to `risk:low` as confidence builds.

**Rationale:** Practical path from full supervision to full autonomy without an all-or-nothing switch.

---

## AI-ADR-015: Context Maintenance

**Decision:** Agent-maintained documentation with human review.

- Issue template includes constraint: "If this task establishes a new pattern or changes an existing one, update the relevant CLAUDE.md and/or skill files in the same PR."
- Agent updates docs as part of implementation while context is fresh
- Human verifies documentation quality during PR review
- Periodic `review-context` skill run scans each package's CLAUDE.md against actual code and flags drift

**Supporting context layers:**
- Code itself — always the source of truth
- Hierarchical CLAUDE.md files — evolve with the project
- Issue descriptions carry task-specific context with file/schema references
- `docs/decisions.md` and `docs/backlog.md` for project-level context
- Git history and PR descriptions for archaeological context

**Rationale:** Sustainable — the agent documents while context is fresh, human reviews for quality. No complex external memory system needed for a solo project.

---

## AI-ADR-016: Observability

**Decision:** GitHub as primary audit trail, plus lightweight Telegram notifications.

- PRs, issue comments, CI logs capture everything
- Telegram bot pings on: issue escalated to `needs-human`, PR auto-merged, cost threshold hit
- Telegram notification implemented as async HTTP hook in orchestrator

**Deferred:** Token usage dashboards, success/failure rate tracking.

**Rationale:** GitHub already captures the full audit trail. Push notifications keep you aware without building infrastructure. Check Anthropic billing page periodically for cost monitoring.

---

## AI-ADR-017: Claude Code Hooks

**Decision:** Five hooks to start:

| Hook | Event | Type | Purpose |
|---|---|---|---|
| Auto-format | PostToolUse (Write\|Edit) | command | Run `biome format` on every edited file |
| File protection | PreToolUse (Write\|Edit) | command | Block edits to `docker-compose.yml`, `.github/workflows/`, `.claude/` unless issue allows |
| Test runner | Stop | command | Run `turbo test` and `turbo check` when Claude finishes |
| Telegram notify | Notification | command (async) | Post to Telegram bot when Claude needs attention |
| Context loader | SessionStart | command | Inject git status, current branch, current issue description |

**Rationale:** Five hooks covering the most impactful patterns. All command hooks — simple, fast, predictable. Work identically in interactive and headless mode. Stay under the recommended 10-15 hook ceiling. Add prompt/agent hooks later only if needed.

---

## AI-ADR-018: Linter/Formatter

**Decision:** Biome (single tool for both linting and formatting).

**Options considered:** ESLint + Prettier (two tools, more config), oxlint + Prettier.

**Rationale:** Single tool, single config (`biome.json`), extremely fast (Rust-based — matters for PostToolUse hooks and CI speed), strong TypeScript support. Mature ecosystem as of 2026.

---

## AI-ADR-019: Implementation Order

**Decision:** Three phases, interleaved:

**Phase A — Bootstrap (interactive, human + Claude Code):**
- Monorepo skeleton, Docker Compose, `shared` package with Zod schemas
- Root CLAUDE.md, per-package CLAUDE.md stubs
- GitHub repo, basic CI pipeline
- Hook configuration
- Foundational work requiring human judgment

**Phase B — Tracer bullet + CI review (semi-autonomous):**
- First vertical slice: one CSV row through full pipeline to one React view
- Set up `claude-code-action` for PR reviews
- Validate CLAUDE.md files and issue templates work (AI reviewer is first "agent consumer")

**Phase C — Autonomous widening (fully autonomous):**
- Write well-specified issues for remaining work
- Build orchestrator package
- Ralph + Haiku processes issue queue
- Human reviews PRs and handles `needs-human` escalations

**Rationale:** Never build autonomous infrastructure without a real codebase to test on. Never build a large pipeline without autonomous tooling to accelerate it.

---

## Updated Technology Stack

| Concern | Choice |
|---|---|
| AI coding tool | Claude Code |
| Context system | Hierarchical CLAUDE.md + skills (`.claude/skills/`) |
| Task management | GitHub Issues with structured template |
| Autonomous loop | Custom orchestrator + Claude Code headless mode |
| CI/CD | GitHub Actions + Turborepo |
| PR review | claude-code-action |
| Model routing | Opus (planning) / Sonnet (interactive) / Haiku (autonomous) |
| Linter/Formatter | Biome |
| Notifications | Telegram bot |
| Hooks | 5 command hooks (format, protect, test, notify, context) |
