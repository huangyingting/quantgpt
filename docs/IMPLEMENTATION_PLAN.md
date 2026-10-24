# Implementation Plan — QuantGPT

## Phase 1: Exploration & Reverse-Engineering (Completed)
- Crawled `https://quantgpt.co/` and `https://terminal.quantgpt.co/` with Playwright.
- Captured 35 desktop and mobile screenshots in `/home/azadmin/quantgpt/screenshots/`.
- Extracted all 175 strategy definitions (`all_175_strategies.json`), 39 public study benchmarks, 19 world event kinds (`all_world_kinds.json`), S&P 500 & Nasdaq-100 1999–2026 daily series (`lesson2-data.json`), 300-run SMA sweep (`lesson3-data.json`), 91 academic resources (`resources.json`), oil shocks CSV (`oil-shocks.csv`), tour payload (`api/tour`), and all 22 contextual explain maps (`/static/explain/*.json`).

## Phase 2: Architecture & Specification Docs (Completed)
- Created `ADR.md`, `PRD.md`, `SPEC.md`, `ARCHITECTURE_AND_DATA_MODEL.md`, `NEXTAUTH_INVITE_ONLY_SPEC.md`, `IMPLEMENTATION_PLAN.md`, `TASK_BACKLOG.md`, `ACCEPTANCE_CRITERIA.md`, and `FEATURE_PARITY.md` in `/home/azadmin/quantgpt/docs/`.

## Phase 3: Project Scaffolding & Dual-Database Prisma Layer
- Initialize Next.js 16 + React 19 + TypeScript + Tailwind CSS + NextAuth v4 + Prisma 7 in `/home/azadmin/quantgpt`.
- Configure `.gitignore` to strictly exclude `.cred`, `.env*` (except `.env.example`), `*.db`, `node_modules`, and `.next`.
- Create `prisma/schema.prisma` (SQLite for local dev) and `prisma/schema.postgres.prisma` (PostgreSQL for production) with migrations and `prisma.config.ts`.
- Implement `src/lib/prisma.ts`, `src/lib/account-admission/invitations.ts`, `src/lib/auth.ts`, and `scripts/bootstrap-admin.ts` (`npm run bootstrap:admin`).

## Phase 4: Quantitative Data Warehouse, Engines, Courses & API Layer
- Bundle extracted real datasets into `src/data/` (`strategies.json`, `lesson2-data.json`, `lesson3-data.json`, `world-kinds.json`, `studies.json`, `resources.json`, `explain.json`, `tour-data.json`).
- Implement deterministic quantitative engines in `src/lib/quant/`:
  - `backtester.ts` (Market timing, library presets, multi-factor screener, walk-forward split, decade/yearly tables, `DATA VALIDATED` / `TRADE-OFF` / `NO EDGE` findings, 11-check Skeptic challenge, parameter sweep, optimizer).
  - `grader.ts` (6-dimension stock grader `A+` to `F` + peer comparison + AAOIFI Halal 5-test screen).
  - `technicals.ts` (Daily price bars, SMA/EMA/Bollinger/Keltner/Donchian, RSI/MACD/Stoch/ADX/OBV/MFI, TTM Squeeze, `signal_study`).
  - `dcf.ts` (10-year DCF, Bear/Base/Bull scenarios, reverse-DCF implied growth solver, 5×5 WACC/terminal growth sensitivity grid, CSV/XLSX formula export).
  - `headline-check.ts` (Return series parser, rolling windows, calendar years, fee/tax/slippage net calculator).
- Implement API routes:
  - Auth & Invites: `/api/auth/[...nextauth]`, `/api/auth/register`, `/api/invitations/[token]`, `/api/admin/invitations`, `/api/admin/invitations/[id]/revoke`, `/api/admin/users`, `/api/admin/audit-logs`.
  - Terminal APIs: `/api/backtest`, `/api/sweep`, `/api/grade`, `/api/technicals`, `/api/model`, `/api/events`, `/api/verify`, `/api/verify/bar`, `/api/status`, `/api/tour`, `/api/journal`, `/api/portfolio`, `/api/runner`, `/api/forum`, `/api/team`, `/api/university`, `/api/account`, `/api/account/export`, `/api/chat`, and `/api/mcp` (JSON-RPC 2.0 MCP server).

## Phase 5: Responsive Frontend UI & Interactive Courses
- Implement global terminal shell (`TerminalShell`) with `#qgside` (`Simple` / `Everything` toggle), `#qg-pal` (`⌘K` command palette), `#qg-agent` (Ask AI drawer), `#qg-help` (Help & Explain popovers), `#qg-ramp` (7-step Ramp), and `#qg-deskbar` (live tape & warehouse bar).
- Implement public marketing & educational pages (`/`, `/library`, `/library/[slug]`, `/study/[slug]`, `/learn`, `/learn/become-a-quant`, `/learn/headline-check`, `/learn/verdict`, `/learn/resources`, `/learn/quantgpt-cloud`, `/learn/connect-claude`, `/learn/connect-chatgpt`, `/learn/connect-gemini`, `/learn/connect-cursor`, `/learn/connect-ai-to-stock-data`, `/mcp`, `/data-warehouse`, `/data-for-ai-agents`, `/execution`, `/events/oil-shocks`, `/transmissions/001`, `/is-quantgpt-legit`, `/compare/*`, `/contact`, and legal pages).
- Implement all 7 playable interactive courses (`/learn/1..7`), 7-slide `/tour`, and 10-chapter `/university` (`S1..S5`, `G1..G5`).
- Implement all terminal workspaces (`/terminal`, `/grade`, `/halal`, `/technicals`, `/model`, `/board`, `/journal`, `/monitor`, `/pm`, `/events`, `/events/simulator`, `/futuretest`, `/portfolio`, `/review`, `/runner`, `/chat`, `/connect`, `/forum`, `/team`, `/whats-new`, `/account`, `/admin`, `/signin`, `/join`, `/accept`, `/verify`, `/status`).

## Phase 6: Verification, Testing & Git Push
- Run Vitest unit/integration tests covering invite-only admission, backtest findings, stock grader/halal, DCF solver, headline check, and MCP JSON-RPC tools.
- Run `npm run lint`, `npm run typecheck`, and `npm run build`.
- Verify live running application with Playwright across desktop and mobile viewports (including bootstrap admin, invitation creation, invite-only registration, courses, backtester, grader, and MCP).
- Commit and push all code, docs, and screenshots (excluding `.cred`) to the remote repository.
