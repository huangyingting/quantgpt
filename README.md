# QuantGPT — Quantitative Research Platform & AI Warehouse Clone

A full-stack, production-ready re-implementation of **QuantGPT** (`quantgpt.co` and `terminal.quantgpt.co`) built with **Next.js 16 (App Router, React 19, TypeScript)**, **Auth.js / NextAuth v4**, **Prisma 7** (SQLite for local development, PostgreSQL for production), and **invite-only account admission** with single-use expiring tokens, role-based access (`USER`, `ADMIN`), revocation, and immutable audit logging.

---

## Key Capabilities

1. **Invite-Only Registration & Zero Demo Accounts**:
   - No open public signup and **zero seeded demo user accounts** (`npm run db:seed` creates 0 users).
   - First administrator is provisioned via `npm run bootstrap:admin` (`scripts/bootstrap-admin.ts`).
   - Admins issue single-use, expiring, role-scoped (`USER` or `ADMIN`) invitations at `/admin` (`POST /api/admin/invitations`), which generate SHA-256 hashed tokens and `/accept?token=...` links.
   - Every invitation creation, revocation, acceptance, and bootstrap action is recorded in `AuditLog`.
2. **Playable Courses & QuantGPT University**:
   - **7 Playable Interactive Courses (`/learn/1` – `/learn/7`)**:
     - `/learn/1`: Arm Your AI in 60 Seconds (Interactive MCP setup & tool execution game)
     - `/learn/2` & `/learn/become-a-quant`: 6-Step Become a Quant course on 1999–2026 S&P 500 & Nasdaq-100 data (200-day SMA, green/red regimes, 196 whipsaws vs 42 buffered trades + 3M T-Bill yield)
     - `/learn/3`: 300-Run Moving-Average Parameter Sweep & 2015 Walk-Forward Overfitting Lab
     - `/learn/4`: World Events & 4-Ring Geographic Ripple Study
     - `/learn/5`: Walk-Forward Validation & 11-Check Skeptic Suite
     - `/learn/6`: Automated Event Guard Rules (`pause_entries`, `reduce_size`, `exit_to_cash`, `hedge_on`)
     - `/learn/7`: Shared Team Kanban Board (`NOTES` → `RUNNING` → `DATA VALIDATED`) + Micron (`MU`) 10-Year DCF & Reverse-DCF Implied Growth Solver
   - **QuantGPT University (`/university`, `/university/S1..S5`, `/university/G1..G5`)**: 10 structured chapters across Quant School (`S1–S5`) and Grad School (`G1–G5`) with 3-question mastery quizzes and database progress tracking.
   - **7-Slide Product Tour (`/tour`)**, **Headline Check (`/learn/headline-check`)**, **Findings Verdict System (`/learn/verdict`)**, and **91 Quant Papers & Books (`/learn/resources`)**.
3. **Terminal Research, Track & Execution Desks**:
   - **Backtester (`/terminal`)**: 175 strategy presets, Cross-Sectional Factor & Market Timing engines, 2015 walk-forward split, 11-check Skeptic audit, and 5×5 Parameter Sweep (`/api/sweep`).
   - **Stock Grader (`/grade`) & AAOIFI Halal Screener (`/halal`)**: 6-dimension sector-relative grades (`A+` to `F`), Piotroski F-Score (`0–9`), Altman Z-Score, Beneish M-Score, and 5-test AAOIFI Shariah compliance.
   - **Technicals Desk (`/technicals`)**: Interactive Price + SMA 50/200 chart, Bollinger Squeeze, RSI(14), MACD, and empirical forward-return signal study.
   - **10-Year DCF Valuation Model (`/model`)**: Bear/Base/Bull cases, Reverse-DCF Market-Implied Growth Solver, 5×5 WACC × Terminal Growth sensitivity grid, and CSV export.
   - **World Events (`/events`, `/events/simulator`, `/events/oil-shocks`, `/futuretest`, `/world/kinds`, `/world/kind/[kind]`)**: 19 event kinds, 15 historical oil shocks, 4-ring geographic ripple, and crisis simulator.
   - **Strategy Library (`/library`, `/library/[slug]`) & 39 Research Studies (`/study/[slug]`)**: 175 strategies (`80 DATA VALIDATED`, `33 TRADE-OFF`, `62 NO EDGE`).
   - **Journal (`/journal`), Leaderboard (`/board`), 4-Panel Monitor (`/monitor`), Prediction Markets (`/pm`), Portfolio Builder (`/portfolio`, `/review`), Cloud Bot Runner (`/runner`), Ask AI (`/chat`), Connect AI MCP (`/connect`, `/api/mcp`), Forum (`/forum`), Team Board (`/team`), Warehouse Verification (`/verify`), and Telemetry (`/status`)**.

---

## Engineering Documentation (`docs/`)

- [`docs/ADR.md`](docs/ADR.md) — Architecture Decision Records (ADR-001 through ADR-010)
- [`docs/PRD.md`](docs/PRD.md) — Product Requirements Document
- [`docs/SPEC.md`](docs/SPEC.md) — Functional & Technical Specification
- [`docs/ARCHITECTURE_AND_DATA_MODEL.md`](docs/ARCHITECTURE_AND_DATA_MODEL.md) — System Architecture & Dual SQLite/PostgreSQL Data Model
- [`docs/NEXTAUTH_INVITE_ONLY_SPEC.md`](docs/NEXTAUTH_INVITE_ONLY_SPEC.md) — NextAuth + Invite-Only Registration & Audit Specification
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — Phased Implementation Plan
- [`docs/TASK_BACKLOG.md`](docs/TASK_BACKLOG.md) — Engineering Task Backlog
- [`docs/ACCEPTANCE_CRITERIA.md`](docs/ACCEPTANCE_CRITERIA.md) — Testable Acceptance Criteria
- [`docs/FEATURE_PARITY.md`](docs/FEATURE_PARITY.md) — 1:1 Feature Parity Matrix

---

## Quick Start (Local Development — SQLite)

```bash
# 1. Install dependencies
npm install

# 2. Apply SQLite Prisma migrations and seed reference data (0 demo users)
npx prisma migrate deploy
npm run db:seed

# 3. Bootstrap your initial ADMIN operator account (when needed)
BOOTSTRAP_ADMIN_EMAIL="admin@quantgpt.local" \
BOOTSTRAP_ADMIN_PASSWORD="StrongAdminPassword123!" \
npm run bootstrap:admin

# 4. Start development server
npm run dev
```

## Production Deployment (PostgreSQL)

Set `DATABASE_URL="postgresql://user:pass@host:5432/quantgpt?schema=public"`—`prisma.config.ts` and `src/lib/prisma.ts` automatically switch to `prisma/schema.postgres.prisma` and `@prisma/adapter-pg`.
