# Feature Parity Matrix — QuantGPT

| Area / Surface | Original Route (`quantgpt.co` / `terminal.quantgpt.co`) | Cloned Route | Data Source / Reverse-Engineered Artifact | Status |
|---|---|---|---|---|
| **Marketing Home** | `quantgpt.co/` | `/` | `raw_https___quantgpt.co_` + `polish.css` | Planned / Full Parity |
| **Strategy Library (175 Edges)** | `quantgpt.co/library/` | `/library` | `all_175_strategies.json` (all 10 category JSONs) | Planned / Full Parity |
| **Strategy Answer Page** | `quantgpt.co/library/piotroski-f-score` | `/library/piotroski-f-score` | `raw_https___quantgpt.co_library_piotroski-f-score` | Planned / Full Parity |
| **Public Study Pages (39)** | `terminal.quantgpt.co/study/<slug>` | `/study/[slug]` | `all_studies_summary.json` + `study_*.html` | Planned / Full Parity |
| **Learn Hub** | `quantgpt.co/learn/` & `terminal.quantgpt.co/learn` | `/learn` | `raw_https___terminal.quantgpt.co_learn` | Planned / Full Parity |
| **Become a Quant (Public)** | `quantgpt.co/learn/become-a-quant` | `/learn/become-a-quant` | `become-a-quant-data.js` (157 KB real S&P/NDX data) | Planned / Full Parity |
| **The Headline Check** | `quantgpt.co/learn/headline-check` | `/learn/headline-check` | `headline-check.js` (19 KB math engine) | Planned / Full Parity |
| **The Findings System** | `quantgpt.co/learn/verdict` | `/learn/verdict` | `raw_https___quantgpt.co_learn_verdict` | Planned / Full Parity |
| **91 Research Papers Shelf** | `quantgpt.co/learn/resources` | `/learn/resources` | `raw_https___quantgpt.co_learn_resources.json` | Planned / Full Parity |
| **AI Connection Guides** | `quantgpt.co/learn/connect-*` | `/learn/connect-[slug]` | Claude, ChatGPT, Gemini, Cursor, Stock Data, Cloud guides | Planned / Full Parity |
| **MCP, Warehouse, Execution, Oil Shocks, Legit, Compare** | `/mcp`, `/data-warehouse`, `/execution`, `/events/oil-shocks`, `/is-quantgpt-legit`, `/compare/*` | Same routes | Extracted HTML + `oil-shocks.csv` | Planned / Full Parity |
| **Course Lesson 1: Arm Your AI** | `terminal.quantgpt.co/learn/1` | `/learn/1` | `/static/ramp-game.html` | Planned / Full Parity |
| **Course Lesson 2: Become a Quant** | `terminal.quantgpt.co/learn/2` | `/learn/2` | `/static/quant-lesson.html` + `lesson2-data.json` (226 KB) | Planned / Full Parity |
| **Course Lesson 3: The Backtester** | `terminal.quantgpt.co/learn/3` | `/learn/3` | `/static/backtest-lesson.html` + `lesson3-data.json` (59 KB) | Planned / Full Parity |
| **Course Lesson 4: World Events** | `terminal.quantgpt.co/learn/4` | `/learn/4` | `raw_https___terminal.quantgpt.co_learn_4` + `war_onset.json` | Planned / Full Parity |
| **Course Lesson 5: Skeptic & Walk-Forward** | `terminal.quantgpt.co/learn/5` | `/learn/5` | Walk-forward & 11-check Skeptic interactive lesson | Planned / Full Parity |
| **Course Lesson 6: Event Rules & Signals** | `terminal.quantgpt.co/learn/6` | `/learn/6` | `raw_https___terminal.quantgpt.co_learn_6` + `sanction.json` | Planned / Full Parity |
| **Course Lesson 7: Team & DCF Model** | `terminal.quantgpt.co/learn/7` | `/learn/7` | `/static/team-lesson.html` | Planned / Full Parity |
| **First-Run Interactive Tour (7 Slides)** | `terminal.quantgpt.co/tour` | `/tour` | `raw_https___terminal.quantgpt.co_tour` + `/api/tour` | Planned / Full Parity |
| **QuantGPT University (10 Chapters)** | `terminal.quantgpt.co/university` | `/university` & `/university/[id]` | `explain/university.json` + `uni-return.js` (`S1..S5`, `G1..G5`) | Planned / Full Parity |
| **Terminal Backtest Desk** | `terminal.quantgpt.co/` | `/terminal` | `explain/terminal.json` + `tour.js` + `nav.js` | Planned / Full Parity |
| **Stock Grader & Halal Screen** | `terminal.quantgpt.co/grade` & `/halal` | `/grade` & `/halal` | `explain/grade.json` + `explain/halal.json` | Planned / Full Parity |
| **Technicals & Signal Study** | `terminal.quantgpt.co/technicals` | `/technicals` | `explain/technicals.json` + `tour.js` | Planned / Full Parity |
| **DCF Valuation Model** | `terminal.quantgpt.co/model` | `/model` | `explain/model.json` + `tour.js` | Planned / Full Parity |
| **Operator Leaderboard** | `terminal.quantgpt.co/board` | `/board` | `explain/board.json` + `tour.js` | Planned / Full Parity |
| **Findings Journal & Paper Books** | `terminal.quantgpt.co/journal` | `/journal` | `explain/journal.json` + `tour.js` | Planned / Full Parity |
| **Live Monitor & Prediction Markets** | `terminal.quantgpt.co/monitor` & `/pm` | `/monitor` & `/pm` | `explain/monitor.json` + `explain/pm.json` | Planned / Full Parity |
| **World Events, Crisis Simulator & Futuretest** | `/events`, `/events/simulator`, `/futuretest`, `/world/kinds`, `/world/kind/[kind]` | Same routes | `all_world_kinds.json` (19 kinds) + `explain/events.json`, `simulator.json`, `futuretest.json` | Planned / Full Parity |
| **Portfolio & Checkup** | `terminal.quantgpt.co/portfolio` & `/review` | `/portfolio` & `/review` | `explain/portfolio.json` + `explain/review.json` | Planned / Full Parity |
| **QuantGPT Cloud Bot Runner** | `terminal.quantgpt.co/runner` | `/runner` | `explain/runner.json` + `/learn/quantgpt-cloud` | Planned / Full Parity |
| **Ask AI Chat & Drawer** | `terminal.quantgpt.co/chat` & `#qg-agent` | `/chat` & `#qg-agent` | `explain/chat.json` + `nav.js` | Planned / Full Parity |
| **Connect AI & Paste-Pack** | `terminal.quantgpt.co/connect` & `/pastepack.txt` | `/connect` & `/pastepack.txt` | `raw_https___terminal.quantgpt.co_connect` + `pastepack.txt` | Planned / Full Parity |
| **MCP JSON-RPC 2.0 Server** | `terminal.quantgpt.co/mcp` | `/api/mcp` & `/mcp` | 19 core tools + 7 categories | Planned / Full Parity |
| **Operator Forum (9 Rooms)** | `terminal.quantgpt.co/forum` | `/forum` | `explain/forum.json` + `tour.js` | Planned / Full Parity |
| **Team Board (3 Seats + Kanban)** | `terminal.quantgpt.co/team` | `/team` | `explain/team.json` + `team-lesson.html` | Planned / Full Parity |
| **Data Verify & Status Pages** | `/verify` & `/status` | `/verify` & `/status` | `/api/verify`, `/api/verify/bar`, `/status.json` | Implemented & Verified (1:1) |
| **Account Settings & Export** | `terminal.quantgpt.co/account` | `/account` | `raw_https___terminal.quantgpt.co_account` + `/api/account/export` | Implemented & Verified (1:1) |
| **Invite-Only Auth & Admin Console** | `/signin`, `/join`, `/accept`, `/admin`, `/reset` | Same routes | `NEXTAUTH_INVITE_ONLY_SPEC.md` + `npm run bootstrap:admin` | Implemented & Verified (1:1) |
| **Search Palette (`THE INDEX`)** | `/` or `⌘K` in `TerminalShell` | `/` or `⌘K` modal | Searches across all Pages, 175 Strategies, 39 Studies, and 180+ Explain features | Implemented & Verified (1:1) |
| **Interactive Page Walkthroughs** | `▶ WALKTHROUGH` & `?tour=1` | `TerminalShell` `#qg-tour` | Step-by-step DOM spotlight tours across Terminal, Grader, Halal, Technicals, Model, Events, University, Forum | Implemented & Verified (1:1) |
| **Explain Drawer & `[▶ Show me]`** | `? EXPLAIN` button (`24` JSONs) | `TerminalShell` Explain Drawer | All 24 `/static/explain/<page>.json` specs with `[▶ Show me]` element spotlight & `[Learn more]` links | Implemented & Verified (1:1) |
| **4 Backtester Engines + Diagnostics** | `/terminal` | `/terminal` | Engine 1 (`equity` + custom factor/mcap/halal), Engine 2 (`timing`), Engine 3 (`daily` overnight/intraday/buy-hold), Engine 4 (`seasonal`), plus Universe Funnel (`#funnel-panel`), Four More Lenses (`Costs`, `Monte Carlo`, `FF5+Mom Factor Lens`, `Optimizer`), and Run Log (`#tape-drawer`) | Implemented & Verified (1:1) |
| **Stock Grader Drivers & GICS Peers** | `/grade` | `/grade` | 6 Pillars (`Flows` marked shown alongside), 16 Raw Input Drivers (`#drivers-h`), and 3 GICS Peer Benchmarks (`#peers-h` Sub-Industry, Industry Group, Sector) | Implemented & Verified (1:1) |
| **AAOIFI Halal Historical Audit** | `/halal` | `/halal` | `asOf` (`YYYY-MM`) historical month selector, 5 AAOIFI tests, 6 SEC 10-K/10-Q dollar inputs (`#inputs`), and 120-month compliance strip (`#strip`) | Implemented & Verified (1:1) |
| **DCF 5-Year SEC Filed Statements** | `/model` | `/model` | 10-Year FCF schedule, Reverse-DCF Implied Growth solver, 5×5 WACC × Terminal G sensitivity matrix, and 5-year SEC 10-K/10-Q baseline table (`#stmts-head`) | Implemented & Verified (1:1) |
| **39 Full Pre-Computed Studies** | `/study/[slug]` | `/study/[slug]` | All 39 studies with full SVG equity curve, 6-metric grid, Walk-Forward Unseen Data callout, Cost Sensitivity, Losing Years, Decade Breakdown, Year-by-Year table, Exact Rules, Academic Citation, and 39-study index | Implemented & Verified (1:1) |
| **19 World Event Kinds + Sign Test** | `/events` & `/world/kind/[kind]` | `/events` & `/world/kind/[kind]` | All 19 `/world/kind/<kind>.json` datasets with 1/5/21/63d distributions, unconditional baseline (`base`), two-sided binomial sign test (`test.p_value` & `test.read`), and event catalogs | Implemented & Verified (1:1) |
| **9 Forum Badges & 9 Categories** | `/forum` | `/forum` | All 9 earned operator badges (`FORUM_BADGES`) and 9 discussion rooms (`FORUM_CATEGORIES`) | Implemented & Verified (1:1) |
| **Transmissions & Legal Suite** | `/transmissions`, `/cookies`, `/disclosures`, `/business-terms`, `/dmca`, `/eula`, `/legal/eula`, `/events/oil-shocks.csv` | Same routes | Extracted HTML + raw CSV download route | Implemented & Verified (1:1) |
