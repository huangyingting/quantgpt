# Architecture Decision Records (ADRs) — QuantGPT Platform

## ADR-001: Unified Next.js App Router Architecture Serving Both Marketing (`quantgpt.co`) and Terminal (`terminal.quantgpt.co`) Surfaces
- **Status:** Accepted
- **Context:** The original QuantGPT system splits its web footprint across `https://quantgpt.co/` (marketing, strategy library of 175 documented edges, interactive educational tools like Become a Quant & Headline Check, MCP/Warehouse/Execution documentation, and competitor comparisons) and `https://terminal.quantgpt.co/` (the authenticated quantitative research terminal, 7-step Ramp, interactive courses `/learn/1..7`, University `S1..S5`/`G1..G5`, Backtester, Stock Grader + Halal screen, Technicals, DCF Valuation Model, Leaderboard, Findings Journal, Monitor + Prediction Markets, World Events + Crisis Simulator + Futuretest, Portfolio & Checkup, QuantGPT Cloud bot runner, Ask AI drawer/page, MCP server `/api/mcp`, Forum, Team board, Account settings, and Admin Invite Console).
- **Decision:** Implement a unified Next.js 16 (App Router) + React 19 + TypeScript application that serves both the public research/marketing pages and the full terminal workspace seamlessly, using shared design tokens (`--bg: #0A0D13`, `--surface: #10151E`, `--amber: #F0A83C`, `--up: #43BD85`, `--down: #DF605E`, condensed/mono/sans typography, and `Night`/`Day`/`System` theme support).
- **Consequences:** Single deployment artifact, zero CORS friction between the Strategy Library (`Run It` links) and the Terminal Backtester, and unified authentication and session state.

## ADR-002: Dual-Database Prisma 7 Setup (SQLite for Local Dev, PostgreSQL for Production)
- **Status:** Accepted
- **Context:** The system must run out-of-the-box locally using SQLite (`file:./dev.db` via `@prisma/adapter-better-sqlite3`) and scale in production with PostgreSQL (`prisma/schema.postgres.prisma` via `@prisma/adapter-pg`), matching the proven pattern in `../Arcade`.
- **Decision:** Maintain `prisma/schema.prisma` (SQLite provider) for local development and automated verification, and `prisma/schema.postgres.prisma` (PostgreSQL provider) for production deployments, with a unified `src/lib/prisma.ts` client factory and `prisma.config.ts`.
- **Consequences:** Developers and CI/CD pipelines can run migrations, seed market/strategy data, and execute Playwright tests with zero external database containers required locally, while production deployments use PostgreSQL.

## ADR-003: Invite-Only Registration with Single-Use Expiring Codes, RBAC, Revocation, Audit Logging, and CLI Bootstrap Admin
- **Status:** Accepted
- **Context:** Production deployment requires strict invite-only account admission (`AccountInvitation`), role-based access control (`ADMIN`, `PRO`, `MEMBER`), invitation revocation, comprehensive security/audit logging (`AuditLog`), and **zero demo user accounts** in the database or UI.
- **Decision:**
  1. Do not seed or expose any demo user accounts.
  2. Provide `npm run bootstrap:admin` (`scripts/bootstrap-admin.ts`) to provision or update the initial administrator account from CLI arguments or environment variables (`BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_NAME`).
  3. Enforce single-use, expiring, email-bound invitation tokens (`AccountInvitation`) with SHA-256 token hashing (`src/lib/account-admission/invitations.ts`) in an atomic database transaction during registration (`/join` and `/accept`).
  4. Record every invitation lifecycle event (`INVITATION_CREATED`, `INVITATION_REVOKED`, `INVITATION_ACCEPTED`, `USER_ROLE_UPDATED`, `ADMIN_BOOTSTRAPPED`, `MCP_KEY_ISSUED`, `MCP_KEY_REVOKED`) in `AuditLog`.
- **Consequences:** Production-grade security posture with complete auditability and zero hardcoded/demo credentials.

## ADR-004: Deterministic Point-in-Time Quantitative Backtest, Skeptic, Grader, Halal, Technicals, and DCF Engines
- **Status:** Accepted
- **Context:** QuantGPT's core value proposition is honest, reproducible quantitative testing with walk-forward out-of-sample splits (default 2015), three fixed findings (`DATA VALIDATED`, `TRADE-OFF`, `NO EDGE`), an 11-check Skeptic challenge (`challenge_finding`), 6-dimension Stock Grader (`A+` to `F`), AAOIFI Standard 21 Halal 5-test screen, 44-factor Technicals engine, and 10-year DCF + 5x5 sensitivity valuation model.
- **Decision:** Embed the real historical time-series, strategy definitions (all 175 strategies from `quantgpt.co/library/`), real S&P 500 / Nasdaq-100 / Treasury bill series (1999–2026 from `/static/lesson2-data.json` and `/api/tour`), 300-run SMA sweep dataset (`/static/lesson3-data.json`), 19 geopolitical/macro event kinds (`/world/kind/*.json`), and 39 computed study benchmarks into deterministic TypeScript quantitative engines (`src/lib/quant/*`) backed by Prisma persistence for user journals, paper books, watches, portfolios, and cloud bots.
- **Consequences:** Sub-second backtests, sweeps, stock grades, technical charts, and DCF models that match the exact mathematical rules and findings logic of QuantGPT.

## ADR-005: Built-in Model Context Protocol (MCP) JSON-RPC 2.0 Server (`/api/mcp`) and In-Terminal AI Agent (`#qg-agent` & `/chat`)
- **Status:** Accepted
- **Context:** QuantGPT is "The Data and Trading Platform for AI." Users connect Claude, ChatGPT, Gemini, or Cursor over MCP (`/api/mcp`) using `qg_sk_...` keys or OAuth/session auth, or use the built-in Ask AI drawer (`#qg-agent`) and `/chat` page.
- **Decision:** Implement a standards-compliant JSON-RPC 2.0 MCP endpoint at `/api/mcp` supporting `initialize`, `tools/list`, and `tools/call` across all core and category tools (`describe_capabilities`, `available_categories`, `activate_category`, `list_factors`, `search_library`, `run_backtest`, `run_market_timing`, `run_library_strategy`, `run_sweep`, `challenge_finding`, `grade_stock`, `check_halal`, `technicals`, `signal_study`, `financial_model`, `market_snapshot`, `world_events`, `query_warehouse`, `list_warehouse`, `guide`, `get_prompt_library`).
- **Consequences:** External AI clients and the in-terminal Ask AI assistant execute the exact same quantitative tools and return rich structured findings, charts, and grade cards.
