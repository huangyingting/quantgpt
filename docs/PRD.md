# Product Requirements Document (PRD) — QuantGPT

## 1. Product Vision & Positioning
**QuantGPT** ("Trading is war. Arm your AI with data.") is an agentic quantitative finance research platform, historical market data warehouse, and strategy validation terminal. It empowers retail investors, quantitative researchers, and teams to test trading hypotheses on decades of US market data, validate edges using strict walk-forward splits, grade stocks across 6 dimensions, study geopolitical/macro world events, and connect AI assistants (Claude, ChatGPT, Gemini, Cursor) over MCP—without QuantGPT ever taking custody of funds or autonomously placing unreviewed trades.

## 2. Target Personas
1. **Self-Directed Retail Quant (`MEMBER`):** Uses the Strategy Library (175 strategies), Playable Lessons (`/learn/1..7`), University (`S1..S5`, `G1..G5`), No-Code Backtester, Stock Grader, Halal Screen, Portfolio Checkup, and Findings Journal.
2. **Systematic / Pro Operator (`PRO`):** Uses Parameter Sweeps (up to 100 variants), 11-check Skeptic Validation, Valuation DCF Model with Excel export, Prediction Markets Base-Rate Board, Crisis Simulator, Futuretest scenario cones, and QuantGPT Cloud (hosted Python bot runner connected to user's own Alpaca paper/live keys).
3. **Platform Administrator & Team Lead (`ADMIN`):** Manages invite-only account admission (`AccountInvitation`), issues single-use expiring invite links, revokes invitations, manages user roles (`ADMIN`, `PRO`, `MEMBER`), audits security logs (`AuditLog`), and coordinates shared 3-seat Team Boards (`/team`).

## 3. Core Product Pillars & Functional Requirements

### P1: Invite-Only Account Admission & Security (`NEXTAUTH_INVITE_ONLY_SPEC`)
- **Zero Demo Accounts:** No pre-seeded demo users or one-click demo logins in production or development.
- **CLI Bootstrap Admin:** `npm run bootstrap:admin` creates/updates the initial `ADMIN` user.
- **Single-Use Expiring Invitations:** Admins generate email-bound invitations with role assignment (`MEMBER`, `PRO`, `ADMIN`) and custom expiration windows.
- **Atomic Registration (`/join` & `/accept`):** Invitation token is validated (exists, not revoked, not expired, not accepted, email matches case-insensitively) and consumed atomically on account creation.
- **Account Security (`/account`):** Password rotation, TOTP 2FA setup & recovery codes, WebAuthn Passkeys management, MCP API keys (`qg_sk_...`, max 3 on QuantGPT, 5 on Pro), full JSON account export (`/api/account/export`), sign out everywhere, and account deletion.

### P2: Interactive Courses, First-Run Tour & QuantGPT University
- **Playable Interactive Lessons (`/learn` & `/learn/1..7`):**
  - **Lesson 1 (`/learn/1`):** *Arm Your AI in 60 Seconds* — Interactive Claude/ChatGPT/No-Connector simulator, 1-click prompt copy, live simulated MCP tool calls and Equity Curve + Skeptic checks.
  - **Lesson 2 (`/learn/2`):** *Become a Quant* — Interactive 6-step walkthrough on real 1999–2026 S&P 500 & Nasdaq-100 daily data (`lesson2-data.json`), 200-day SMA regime painting, 196 naive whipsaws vs 42 buffered trades (+1%/-3% band with 3-month T-bill yield while flat).
  - **Lesson 3 (`/learn/3`):** *The Backtester* — Interactive 300-parameter SMA sweep (`lesson3-data.json`), overfitting discovery, 2015 walk-forward split, and 5 Skeptic checks.
  - **Lesson 4 (`/learn/4`):** *World Events* — Interactive event study on `war_onset` (`war_onset.json`), S&P 500 1/5/21/63-session reactions, sign test, and 4-ring geographic ripple.
  - **Lesson 6 (`/learn/6`):** *Event Rules & Your Signals* — Interactive sanction event study (`sanction.json`) + custom event rule builder (`pause_entries`, `reduce_size`, `exit_to_cash`, `hedge_on`).
  - **Lesson 7 (`/learn/7`):** *Team Board & DCF Valuation* — Interactive 3-column Kanban board (`NOTES`, `RUNNING`, `DATA VALIDATED`) + interactive Micron (`MU`) DCF valuation model with Bear/Base/Bull scenarios, implied growth solver, and 5x5 sensitivity grid.
- **Interactive First-Run Tour (`/tour`):** 7-slide guided interactive onboarding with live backtest execution, skeptic checks, `MU` stock grading, warehouse facts, and starter prompts.
- **QuantGPT University (`/university`):** 10 structured chapters (`S1..S5` Specialist Track, `G1..G5` Generalist Track), each combining an interactive lesson, a live terminal action, and a 3-question mastery quiz with progress tracking and completion badges.
- **Public Interactive Tools (`/learn/become-a-quant`, `/learn/headline-check`, `/learn/verdict`, `/learn/resources`):**
  - *Headline Check* (`/learn/headline-check`): Client-side return series analyzer computing since-inception drawdowns, rolling windows (12/36/60 months), calendar year returns, and net-of-fee/tax/slippage tables.
  - *Resources* (`/learn/resources`): 91 curated academic papers and practitioner books with interactive search and filtering.

### P3: Quantitative Research Terminal
- **Backtest Engine (`/terminal` / `/`):** Simple vs Everything mode toggle, 175 Library Presets (55 runnable), Custom multi-factor screener (up to 8 filters + ranking across 151 factors) or Market Timing engine, Benchmark selector (`$SPXTR`, `SPY`, `QQQ`), Start Year (1998–2025), OOS Split Year (default 2015), Cost bps (0–50 bps), Equity Curve + Drawdown SVG/Canvas charts, Decade-by-Decade & Year-by-Year tables (losing years in red), Fixed 3-state Finding badge (`DATA VALIDATED`, `TRADE-OFF`, `NO EDGE`), 11-check Skeptic challenge, Parameter Sweep (`#sweep`), Optimizer, Save to Journal, Follow on Paper ($100k paper book), Set Alert, Today's Screen, and CSV/JSON/AI Criteria export.
- **Strategy Library (`/library` & `/study/[slug]`):** All 175 documented strategies across 10 categories (`momentum`, `value`, `quality`, `events`, `seasonality`, `technical_ibd`, `legends`, `flow_short`, `macro_vol`, `alt_markets`) with search, source/type/tag filters, expandable thesis/criteria/gap details, and 39 public study pages (`/study/[slug]`).
- **Stock Grader & Halal Screen (`/grade` & `/halal`):** Grades any ticker (or batch up to 25 tickers) `A+` to `F` across Momentum, Value, Quality, Growth, Earnings Track, and Money Flows, plus Peer Comparison and AAOIFI Shariah Standard 21 Halal 5-test screen (business activity, debt/mcap < 30%, cash+interest securities/mcap < 30%, impure income < 5%, receivables/mcap < 49%).
- **Technicals (`/technicals`):** Interactive price/indicator chart (3M to 5Y) with SMA/EMA/Bollinger/Keltner/Donchian overlays, RSI/MACD/Stochastic/ADX/OBV/MFI lower panels, TTM Squeeze strip, active signals list, and cross-market `signal_study`.
- **Valuation / DCF Model (`/model`):** 10-year DCF & SEC statement model with revenue growth, operating margin, WACC/discount rate, terminal growth, Bear/Base/Bull presets, reverse-DCF implied growth solver, 5x5 sensitivity matrix, and `.xlsx`/CSV export.
- **Track & Workspace (`/journal`, `/monitor`, `/pm`, `/events`, `/events/simulator`, `/futuretest`, `/portfolio`, `/review`, `/runner`):**
  - *Findings Journal (`/journal`):* Out-of-sample live tracking (`HOLDING UP`, `MIXED`, `FADING`, `TOO EARLY`), $100k Paper Books, and Nightly Strategy Watches.
  - *Monitor (`/monitor`) & Prediction Markets (`/pm`):* Multi-panel live workspace canvas + Polymarket/Kalshi vs historical warehouse base-rate comparison board.
  - *World Events (`/events`), Crisis Simulator (`/events/simulator`), & Futuretest (`/futuretest`):* 19 event kinds feed, interactive SVG world map, 4-ring ripple, ticker/country pins, event rules, session-by-session historical crisis replay (Hold / Hedge / Cash), and forward scenario fan cones.
  - *Portfolio & Checkup (`/portfolio`, `/review`):* Holdings & weights editor, saved backtest criteria check, holdings grades, sector concentration, rebuilt monthly history vs S&P 500, and 5-factor loadings (Market, Size, Value, Momentum, Quality).
  - *QuantGPT Cloud (`/runner`):* Pro bot code editor with version hashes, 5-field NY cron schedule with next 5 wake times, sealed Alpaca paper/live key management, live attestation, 30-day paper window choice, and execution logs.
- **Community, AI & Global Chrome (`/chat`, `/connect`, `/forum`, `/board`, `/team`, `/whats-new`, `/verify`, `/status`):**
  - Collapsible left sidebar (`#qgside`) with `Simple` / `Everything` mode switch, `Cmd+K` Command Palette (`#qg-pal`), slide-over Ask AI drawer (`#qg-agent`), contextual `?` explain popovers, glossary tooltips, 7-step Ramp bar (`#qg-ramp`), and bottom status deskbar (`#qg-deskbar`).
