# Acceptance Criteria & Verification Matrix — QuantGPT

## 1. Authentication, Invite-Only Registration & Admin Console
- [ ] **AC-1.1 (Zero Demo Accounts):** Database starts with zero pre-seeded user accounts; `/signin` and `/join` show no demo credentials or one-click demo buttons.
- [ ] **AC-1.2 (CLI Bootstrap Admin):** Running `npm run bootstrap:admin -- --email admin@quantgpt.co --password <pw> --name "Desk Admin"` creates an `ADMIN` user and records `ADMIN_BOOTSTRAPPED` in `AuditLog`.
- [ ] **AC-1.3 (Invite-Only Enforcement):** Submitting `/join` (`POST /api/auth/register`) without a valid invitation token or with a mismatched email returns `403` and creates no user.
- [ ] **AC-1.4 (Single-Use & Expiration):** Admin can create an invitation in `/admin` (`POST /api/admin/invitations`), copy the invite link (`/join?invite=<token>`), register a user once, and any subsequent attempt to reuse the token fails with `ACCEPTED`. Revoked or expired tokens fail with `REVOKED` / `EXPIRED`.
- [ ] **AC-1.5 (Audit Logging & RBAC):** All invitation creations, revocations, acceptances, and role updates appear in `/admin` Audit Log table with actor, target email, timestamp, and metadata.

## 2. Interactive Courses, Tour & University
- [ ] **AC-2.1 (Playable Lessons `/learn/1..7`):**
  - `/learn/1` (*Arm Your AI*): Interactive assistant selector (Claude / ChatGPT / Paste-pack), prompt copy, and simulated AI tool execution with equity curve and skeptic checks.
  - `/learn/2` (*Become a Quant*): Interactive 6-stage canvas chart on real 1999–2026 S&P 500 & Nasdaq-100 data (`lesson2-data.json`) showing 200-day SMA, green/red regimes, 196 naive flips, and 42 buffered quant trades.
  - `/learn/3` (*The Backtester*): Interactive 300-run SMA sweep (`lesson3-data.json`), walk-forward 2015 split reveal, and 5 skeptic checks.
  - `/learn/4` (*World Events*): Interactive `war_onset` event study with S&P 500 1/5/21/63-session reactions, sign test, and 4-ring ripple.
  - `/learn/5` (*Walk-Forward & Skeptic*): Interactive walk-forward split and 11-check Skeptic challenge lesson.
  - `/learn/6` (*Event Rules & Signals*): Interactive `sanction` event study with rule builder (`pause_entries`, `reduce_size`, `exit_to_cash`, `hedge_on`).
  - `/learn/7` (*Team Board & DCF*): Interactive Kanban board (`NOTES` -> `RUNNING` -> `DATA VALIDATED`) and Micron (`MU`) DCF valuation model with Bear/Base/Bull presets and 5×5 sensitivity grid.
- [ ] **AC-2.2 (First-Run Tour `/tour`):** 7 interactive slides powered by `/api/tour` with live backtest run, skeptic check reveal, Micron `MU` stock grading, warehouse facts, and starter prompts.
- [ ] **AC-2.3 (QuantGPT University `/university`):** All 10 chapters (`S1..S5`, `G1..G5`) render lesson links (`/learn/<n>?uni=<id>`), product actions, and 3-question mastery quizzes that persist progress.

## 3. Research, Track, AI & Public Pages
- [ ] **AC-3.1 (Strategy Library & Studies):** `/library` renders all 175 documented strategies with search, source/type/tag filters, expandable criteria, and `RUN IT →` links into the terminal backtester; `/study/[slug]` renders public study pages.
- [ ] **AC-3.2 (Terminal Backtester):** `/terminal` runs library strategies, market timing rules, and multi-factor screens, rendering the equity curve, drawdown chart, decade-by-decade table, year-by-year grid (losing years in red), `DATA VALIDATED` / `TRADE-OFF` / `NO EDGE` badge, 11-check Skeptic panel, Parameter Sweep, Save to Journal, and Follow on Paper.
- [ ] **AC-3.3 (Stock Grader & Halal Screen):** `/grade` and `/halal` compute 6-dimension letter grades (`A+` to `F`), batch grading, peer comparisons, and the 5-test AAOIFI Shariah Standard 21 Halal screen.
- [ ] **AC-3.4 (Technicals & DCF Model):** `/technicals` renders interactive price + overlay + lower panel charts and signal studies; `/model` computes 10-year DCF schedules, reverse-DCF implied growth, 5×5 sensitivity matrices, and exports spreadsheet formulas.
- [ ] **AC-3.5 (Track & Cloud Desks):** `/journal`, `/monitor`, `/pm`, `/events`, `/events/simulator`, `/futuretest`, `/portfolio`, `/review`, and `/runner` all function end-to-end with persistent database state.
- [ ] **AC-3.6 (MCP Server & Ask AI):** `POST /api/mcp` responds to JSON-RPC 2.0 `initialize`, `tools/list`, and `tools/call` (`describe_capabilities`, `search_library`, `run_backtest`, `grade_stock`, `check_halal`, `world_events`, etc.).

## 4. Technical & Quality Gates
- [ ] **AC-4.1:** `npm run typecheck` and `npm run lint` pass with zero errors.
- [ ] **AC-4.2:** `npm test` (Vitest unit & integration suite) and `npm run build` succeed cleanly.
- [ ] **AC-4.3:** Playwright verification confirms desktop and mobile responsiveness across public, course, terminal, and admin workflows.
