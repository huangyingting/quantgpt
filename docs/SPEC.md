# Functional & Technical Specification — QuantGPT

## 1. Design System & Global Terminal Chrome
Reverse-engineered from `quantgpt.co/polish.css`, `terminal.quantgpt.co/static/desk.css`, and `terminal.quantgpt.co/static/nav.js`.

### 1.1 Color Tokens
- **Night Theme (default):**
  - `--bg`: `#0A0D13`
  - `--surface`: `#10151E`
  - `--surface2`: `#151C27`
  - `--field`: `#0C1017`
  - `--line`: `#212A38`
  - `--line2`: `#2E3A4D`
  - `--ink`: `#E7ECF4`
  - `--muted`: `#8B96A8`
  - `--faint`: `#5B6577`
  - `--amber`: `#F0A83C`
  - `--up`: `#43BD85`
  - `--down`: `#DF605E`
- **Day Theme (`[data-theme="day"]`):**
  - `--bg`: `#F5F2EB`, `--surface`: `#FFFFFF`, `--surface2`: `#EDE9DF`, `--line`: `#D8D2C5`, `--ink`: `#141821`, `--muted`: `#525B6C`, `--amber`: `#B87314`, `--up`: `#1D8356`, `--down`: `#C03836`.

### 1.2 Typography
- `--sans`: `"Segoe UI", Selawik, system-ui, -apple-system, sans-serif`
- `--cond`: `"Bahnschrift", "D-DIN", "Arial Narrow", "Helvetica Neue", Arial, sans-serif` (uppercase display headings, metrics, badges)
- `--mono`: `"Cascadia Mono", Consolas, ui-monospace, "SF Mono", Menlo, monospace` (kickers, table headers, tickers, tabular numbers)

### 1.3 Global Terminal Shell (`TerminalShell`)
- **Left Sidebar (`#qgside`):**
  - Brand mark `▲ QUANTGPT` + collapse toggle `[«]` (`qg_side_collapsed`).
  - **Mode Switch (`#qg-modeseg`):** `Simple` (shows 7 core items: Backtest, Library, Stock Grader, Portfolio, Ask AI, University, Account) vs `Everything` (shows all 5 groups: Research, Track, Your AI, Community, Account + Admin for `ADMIN` role).
  - **Command Palette button (`⌘K`):** Opens `#qg-pal` fuzzy launcher across all pages, 175 strategies, tickers, and actions.
  - **Footer utilities:** `Ask AI` drawer toggle (`#qg-agent-btn`), `What's New` badge, `Help` drawer toggle (`#qg-help`), Theme switcher (`Night` / `Day` / `System`), and Sign Out.
- **Bottom Deskbar (`#qg-deskbar`):**
  - Live warehouse status indicator (`WAREHOUSE: 2026-10-16 · 97.4M BARS`), customizable ticker tape chips (`SPY`, `QQQ`, `IWM`, `NVDA`, `AAPL`, `MSFT`, `MU`, `GLD`, `BTC`, `WTI`), MCP AI status light (`AI: ARMED`), and active plan/role badge.
- **Contextual Explain Popovers (`?` buttons):**
  - Powered by the 22 reverse-engineered `/static/explain/*.json` definitions, providing plain-English popover cards with `Read in University` and `Show me on this page` tour triggers.

---

## 2. Quantitative Engines Specification

### 2.1 Findings Verdict Rules (`src/lib/quant/findings.ts`)
Every backtest computes metrics for the **Full Window**, **In-Sample (before Split Year, default 2015)**, and **Out-of-Sample (from Split Year onward)**:
- **`DATA VALIDATED` (`good` / `#43BD85`):** Strategy beats benchmark on **both** CAGR (`strategy.cagr > benchmark.cagr`) **and** Sharpe (`strategy.sharpe > benchmark.sharpe`) in the full window **and** does not fall behind on both in the out-of-sample window (`oos.cagr >= benchmark_oos.cagr` and `oos.sharpe >= benchmark_oos.sharpe`).
- **`TRADE-OFF` (`mixed` / `#F0A83C`):** Beats benchmark on either CAGR (higher return, worse risk) or Sharpe (lower drawdown/better risk-adjusted return, lower or comparable CAGR), or beat on both overall but trailed on one axis out-of-sample.
- **`NO EDGE` (`bad` / `#DF605E`):** Trails benchmark on both CAGR and Sharpe.

### 2.2 Skeptic 11-Check Challenge (`challenge_finding`)
Evaluates strategy robustness across:
1. **Out-of-sample split** (held-out CAGR & Sharpe after cut year vs before)
2. **Luck / Probabilistic Sharpe Ratio (PSR)** (confidence that Sharpe > benchmark given sample length, skew, kurtosis)
3. **Trading costs sensitivity** (net CAGR at 5, 10, 25, and 50 bps per side)
4. **Every decade** (1990s, 2000s, 2010s, 2020s breakdown)
5. **Sample depth** (years, rebalances, total trades)
6. **Bootstrap 1,000 resampled histories** (% of resampled paths beating benchmark)
7. **Random-book baseline** (percentile rank against random equal-weight portfolios)
8. **Start +5 years sensitivity** (dropping first 5 years)
9. **Parameter neighbor +1 step** (perturbing primary threshold up)
10. **Parameter neighbor -1 step** (perturbing primary threshold down)
11. **Sub-universe stability** (top-500 large cap vs broad 3,000 liquid universe)

### 2.3 Stock Grader & Halal Screen (`src/lib/quant/grader.ts`)
- **6 Dimensions (`A+` to `F`, percentile 0–100):**
  1. `Momentum`: 12-1M return, 6M return, distance from 200-day SMA.
  2. `Value`: Earnings yield, FCF yield, EV/EBITDA, Price/Book vs sector.
  3. `Quality`: ROE, ROIC, Gross Profitability (Novy-Marx), Piotroski F-Score (0–8).
  4. `Growth`: YoY Revenue growth, EPS growth, 3Y Revenue CAGR.
  5. `Earnings`: Last 4 quarters EPS beat rate, post-earnings drift, accruals ratio.
  6. `Flows`: Institutional ownership change, insider net buying, short interest % of float.
- **Halal Screen (AAOIFI Shariah Standard 21):**
  1. Business Activity Screen (excludes conventional finance, alcohol, tobacco, gambling, pork, weapons, adult entertainment).
  2. Interest-Bearing Debt / 36M Avg Market Cap < 30%.
  3. Cash & Interest-Bearing Securities / 36M Avg Market Cap < 30%.
  4. Impure / Non-Permissible Income / Total Revenue < 5% (with purification amount per $1,000 invested).
  5. Accounts Receivable & Liquid Assets / Market Cap < 49%.

### 2.4 DCF Valuation Model (`src/lib/quant/dcf.ts`)
- Inputs: Ticker, Base Revenue, Base FCF Margin / Operating Margin, Years 1–5 Growth %, Terminal Growth % (default 2.5%), Discount Rate / WACC % (default 9.5%), Net Debt, Diluted Shares.
- Outputs:
  - 10-Year projected Free Cash Flow schedule (Years 1–5 explicit growth, Years 6–10 linear fade to terminal growth), PV of FCF, Terminal Value, PV of Terminal Value, Enterprise Value, Equity Value, Fair Value per Share, Margin of Safety / Upside % vs current price.
  - Bear / Base / Bull scenario cards.
  - Reverse-DCF Implied Growth Solver (solves for 5-year CAGR implied by current market price).
  - 5×5 WACC × Terminal Growth sensitivity matrix.

### 2.5 Playable Courses & University (`src/lib/courses/*`)
- All 6 playable interactive lessons (`/learn/1`, `/learn/2`, `/learn/3`, `/learn/4`, `/learn/6`, `/learn/7`) plus Lesson 5 (`/learn/5` - Skeptic & Walk-Forward Validation) are implemented with their authentic datasets (`lesson2-data.json`, `lesson3-data.json`, `war_onset.json`, `sanction.json`, `api/tour`) and support `?uni=S1..G5` return-to-chapter navigation (`Back to University: chapter <ID> ▸`).
- All 10 University chapters (`S1..S5`, `G1..G5`) include lesson playback tracking, product action verification, and 3-question interactive quizzes persisted to the user's profile.
