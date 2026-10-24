// Page tours: a handful of steps anchored to element ids, each shown only
// when the member's plan opens what it points at. A tour opens only when it
// is asked for (Brett, 2026-10-08, the UX pass mock 3: one first-run path,
// tours on request): Help's "Take this page's tour", a page's own Take the
// tour button, explain.js's [Show me], or ?tour=1 on the address. No tour
// opens by itself on a first visit any more, and no hint offers one. One
// exception (Brett, 2026-10-17, DECISIONS K50): the leaderboard's own page
// (pages/board2.html) plays its "leaderboard" walkthrough once, the first time a
// member opens it, and records it in the board's settings.
//
// A page opts in with one tag, after nav.js:
//   <script src="/static/tour.js?v=ask4" data-tour="journal" defer></script>
// The steps live below in TOURS, keyed by that name. The block between the
// TOURS markers is plain JSON on purpose: test_learn_tours.py reads it and checks
// that every id exists on its page and every plan and surface name exists in
// tiers.py. A step may carry
//   min      the lowest plan that sees it (tiers.PLANS order)
//   max      the highest plan that sees it (a note only a free member needs)
//   surface  a tiers.py surface key that must be open for this member
//   skip_if  a selector; while it matches, the step is out
// and a step whose element is missing or not rendered is skipped too. Both
// are checked again as each step comes up, since a page can still be
// answering its own fetches when the tour opens (a table that fills in, a
// panel that shows after a run).
//
// A tour may carry quiet_url, a pattern tested against the address's query
// and hash (quietFor): kept for explain.js and the tests that read it.
//
// The plan comes from window.qgTiers (nav.js). The tour waits for the
// qg:tiers event; when the ladder never answers, only the ungated steps show.
// A tour that was opened and then closed (dismissed, clicked off or played
// through) is recorded in localStorage qg_tour_<name> and, signed in, on the
// account (POST /api/account/tours; /api/tiers/me tours_seen), the record
// PR #416 added. ?tour=1 on the address plays it, and ?tour=1&tour_step=N
// starts it at step N.
// window.qgTour.startAt(name, step) plays the page's tour from a step: its
// 0-based index in the tour's own list, or its element id (explain.js's
// [Show me], a page's own Take the tour). A step the member's plan or the
// page does not show starts the tour at the next one that does.
// Opening and closing tell the page, on the document: qg:tour-open and
// qg:tour-close, detail {name}. Focus moves to each step, Escape closes the
// tour alone (it is caught first, on the window, so a drawer under the
// tour stays open), the arrow keys page, and every step is read out through
// an aria-live line. No dependencies. ASCII only.
(function (root) {
  "use strict";
  var PLANS = ["newbie", "quantgpt", "pro", "institutional"];
  var TOURS = /* TOURS */ {
    "terminal": {"title": "Your first backtest", "steps": [
      {"id": "study", "title": "Pick a backtest",
       "body": "Start from a documented strategy in the library, or pick custom criteria and build your own under Settings and criteria."},
      {"id": "benchmark", "title": "The yardstick",
       "body": "What your backtest is measured against: the index you could have simply held instead."},
      {"id": "run", "title": "Run it",
       "body": "The backtest runs on our data and the curve draws as it computes."},
      {"id": "trial-left", "title": "Your free runs", "max": "newbie",
       "body": "Your Free plan carries a lifetime allowance of backtests by hand and of AI calls. The line under Run backtest counts what is left."},
      {"id": "c", "title": "The curve",
       "body": "Amber is your backtest, the other line is the benchmark, and the dashed line is where the years it never saw begin. The tiles beside it fill in as the run lands."},
      {"id": "btoggle", "title": "Settings and criteria",
       "body": "The start year, the year from which the test runs on years your rules never saw (a finding has to hold there too), the engine, and every factor in our data: filter, rank, hold the top names, rebalance on your schedule."},
      {"id": "title", "title": "After the run",
       "body": "A verdict card opens under the chart: strategy growth of $10,000, growth per year (CAGR), benchmark growth of $10,000, and max drawdown."}
    ]},
    "journal": {"title": "Your journal", "steps": [
      {"id": "tiles", "title": "Your record",
       "body": "Every backtest you finish is recorded here with its finding and the last date it saw."},
      {"id": "tbl", "title": "What happened next",
       "body": "One row per finding. Since then is the return over the benchmark after the finding's last date, not the raw return."},
      {"id": "grade", "title": "Graded when you open it",
       "body": "Opening the journal runs each finding again on data that arrived after its last date, the one test a backtest cannot fake. Grade again does it now. Fewer than three new periods is too early to say."},
      {"id": "paper", "title": "Paper books",
       "body": "Follow on paper under a backtest's result lands here: the criteria followed on paper and marked every night. No broker, no order."}
    ]},
    "monitor": {"title": "Monitor", "steps": [
      {"id": "board", "title": "Your board",
       "body": "Panels on a free canvas: the tape, charts, sector heat and the news. Drag a title to move a panel and a corner to resize it."},
      {"id": "ws-edit", "title": "Edit layout",
       "body": "Add or remove panels, save the layout, share it, or open the gallery of boards other members have shared. Done puts the tools away."},
      {"id": "ws-sel", "title": "Your boards",
       "body": "Load a board: your own, a ready-made one, or one you saved. Save keeps this layout, Save as keeps a copy under a new name."},
      {"id": "ws-sel", "title": "The prediction market board", "surface": "pm",
       "body": "Your plan opens the prediction market board. Pick Prediction market board in this list: open markets beside the record of how markets like them resolved."}
    ]},
    "model": {"title": "Valuation", "steps": [
      {"id": "ticker", "title": "Pick a company",
       "body": "Type a ticker. The statements come from our data as they were filed."},
      {"id": "growth", "title": "Your growth",
       "body": "Leave it blank and the model uses the company's own history. Type a rate to argue with it."},
      {"id": "discount", "title": "The rate that decides it",
       "body": "The discount rate and the terminal growth decide most of the value. The sensitivity grid shows how far each one moves it."},
      {"id": "run", "title": "Model it",
       "body": "Three scenarios, the growth the price already implies, the sensitivity grid and the schedule, from one press."},
      {"id": "run", "title": "The Excel model", "min": "pro",
       "body": "Your plan adds the spreadsheet: an Inputs sheet and a DCF sheet of live formulas, so a changed cell recalculates in Excel."}
    ]},
    "connect": {"title": "Connect your AI", "steps": [
      {"id": "endpoint", "title": "The address",
       "body": "Your AI connects here. The Claude and ChatGPT apps sign in through us with no key to paste; Claude Code takes your key in one command."},
      {"id": "endpoint", "title": "Your free calls", "max": "newbie",
       "body": "Your Free plan carries a lifetime allowance of AI calls. The line under Run backtest, on the Backtest page, counts what is left."},
      {"id": "endpoint", "title": "Your limits", "min": "institutional",
       "body": "On Business your AI call limits are built for your volume."},
      {"id": "claude", "title": "From Claude",
       "body": "Claude Code takes one command with your key. Claude Desktop and claude.ai take the address as a custom connector."},
      {"id": "chatgpt", "title": "From ChatGPT",
       "body": "Developer mode, a custom connector, OAuth. The connection lands as a key on your account page, and you can revoke it there."},
      {"id": "pastepack", "title": "No connectors?",
       "body": "The setup prompt carries the same context into any chat AI by copy and paste."},
      {"id": "plib", "title": "What to ask",
       "body": "Prompts people actually ask. Tap one to copy it, swap in your ticker, paste it to your AI."}
    ]},
    "events": {"title": "World events", "quiet_url": "[?&]event=|#", "steps": [
      {"id": "mapwrap", "title": "The map",
       "body": "Every event is a dot where it happened, colored by its lens: the world, politics, markets, nature, science, sports. Click a country to filter the feed below."},
      {"id": "feed", "title": "A dot",
       "body": "Click a dot on the map, or its row in this feed. Its record opens on the right: the S&P 500 1, 5, 21 and 63 sessions later, beside past events of its kind."},
      {"id": "mapwrap", "title": "The ripple",
       "body": "The record also carries the ripple: how far the event traveled, in four rings: its country's own fund, the rest of its region, its continent, the rest of the world."},
      {"id": "viewpill", "title": "Turn the world",
       "body": "Draw the world as a globe that turns, or as one theater or continent at a time. Events pulse where they land, and a dot opens the same record in every view."},
      {"id": "pins", "title": "Your pins",
       "body": "A ticker and the country it is exposed to. Pins light their country on the map, ride along every event, and tell you when something lands on them."},
      {"id": "deskdeep-futuretest", "title": "Futuretest", "flag": "futuretest",
       "body": "Your book through every past analogue of a scenario, like a war over Taiwan or a tariff shock, or a what-if anywhere: the spread of what it went through, kept on record as the future arrives."},
      {"id": "deskdeep-rules", "title": "Event rules",
       "body": "When an event lands that matches, a rule can tell you, open paper legs you choose, or raise a signal your AI can read. Backtest it on every past event first. Nothing here places an order."}
    ]},
    "forum": {"title": "The forum", "quiet_url": "#", "steps": [
      {"id": "p-me", "title": "Your card",
       "body": "Pick a handle and an avatar. They show on every post you make, and the same card is on your account page. Badges light up as you earn them."},
      {"id": "cats", "title": "The rooms",
       "body": "Findings, the desk, help, bug reports and more. Boards shows every room with its newest thread; All lists every thread."},
      {"id": "cats", "title": "Locked rooms", "max": "quantgpt",
       "body": "A lock on a thread means its room opens on a higher plan. The title still shows, and the lock names the plan that opens it."},
      {"id": "cats", "title": "Your plan's room", "min": "pro",
       "body": "Your plan opens the room where members post backtests with the criteria attached and the results shown."},
      {"id": "nt-title", "title": "Start a thread",
       "body": "A title, a room and the details. Real numbers only. Paste the link of one of our chart images on its own line and the chart shows in the post."},
      {"id": "nt-open", "title": "Start a thread",
       "body": "A title, a room and the details. Real numbers only. Paste the link of one of our chart images on its own line and the chart shows in the post."},
      {"id": "threads", "title": "The threads",
       "body": "Open one to read and reply. A dot marks posts that are new since your last read, and you can follow a member from any thread."},
      {"id": "btn-inbox", "title": "Mail and alerts",
       "body": "Inbox is mail from handle to handle. Alerts gathers the replies to you and the posts of members you follow."}
    ]},
    "account": {"title": "Your account", "quiet_url": "#", "steps": [
      {"id": "plan", "title": "Your plan",
       "body": "Your plan and where it stands. When you pay by card, the billing button on this row manages the card and the subscription."},
      {"id": "ladder", "title": "What comes next", "max": "pro",
       "body": "What the next plan adds to yours, with one click to get it. Every lock on the site names the plan that opens it."},
      {"id": "plan", "title": "Your team", "min": "institutional",
       "body": "Your plan carries seats for a team. The team page shares notes, uploaded data and pinned backtests between them."},
      {"id": "alerts", "title": "Strategy alerts",
       "body": "Set a watch from a backtest's result and its screen runs again every night after our data updates. When a name enters or leaves, it shows here. Nothing is bought or sold."},
      {"id": "pref-benchmark", "title": "Your defaults",
       "body": "The benchmark and the first year every new backtest starts from, and the tickers on your monitor's tape. They follow you to any device."},
      {"id": "key-new", "title": "Keys for your AI",
       "body": "Issue a key for an AI that takes one, such as Claude Code. The key shows once, so copy it then. Revoke one here any time."},
      {"id": "tfa-state", "title": "Lock the door",
       "body": "Two-factor asks for a code from an app on your phone when you sign in. A passkey signs you in with this device's fingerprint, face or PIN."},
      {"id": "data-head", "title": "Your data",
       "body": "Download your data, sign out on every device, or delete the account. Deleting it cancels billing too."}
    ]},
    "review": {"title": "Portfolio review", "quiet_url": "#", "steps": [
      {"id": "holdings", "title": "Paste your book",
       "body": "One holding per line: a symbol and shares, or a symbol and a weight. The list is kept in this browser for your next visit."},
      {"id": "criteria", "title": "Against your own criteria",
       "body": "Optional. Pick a saved backtest and every holding is marked pass or fail against its criteria today."},
      {"id": "months", "title": "The window",
       "body": "How many months of history the book is rebuilt over, beside the S&P 500 over the same months."},
      {"id": "run", "title": "Run the review",
       "body": "Each name graded, the factor reads, how concentrated the book is and how alike its names move, then the findings in plain sentences. A description of what you hold, not advice."},
      {"id": "findings", "title": "What stands out",
       "body": "One name or one sector carrying the book, names that move together, a high market beta, a deeper fall than the market's: each finding comes with its numbers."},
      {"id": "hist", "title": "The book's own history",
       "body": "Today's names at today's weights, rebalanced monthly and gross of costs, beside the S&P 500 over the same months. Names you sold before are not in it."}
    ]},
    "pm": {"title": "Prediction markets", "steps": [
      {"id": "venue", "title": "Pick the board",
       "body": "Every open market on Polymarket and Kalshi, or one venue. Narrow it by words in the category, the least history a read needs and the least volume."},
      {"id": "minn", "title": "How much history",
       "body": "A read compares a market with resolved markets priced like it and this far from close. With fewer of them than this number, the row shows no read."},
      {"id": "run", "title": "Read the board",
       "body": "The board comes from a cache of up to fifteen minutes. Refresh fetches both venues again."},
      {"id": "tbl", "title": "Price against the record",
       "body": "Each row: the crowd's price, how often markets like it resolved yes, and the gap. A gap is the crowd's past habit, not a forecast for this market."},
      {"id": "tbl", "title": "What yes returned",
       "body": "The average return of buying yes at prices like this across the resolved markets behind the read, with no fees or spread modelled. Nothing here takes a side."}
    ]},
    "chat": {"title": "Ask your AI", "quiet_url": "#", "steps": [
      {"id": "chat-root", "title": "Ask in plain words",
       "body": "Say what you want tested. The AI picks the tool, runs it on our data, and the backtest draws itself under the answer."},
      {"id": "chat-prompts", "title": "Try one",
       "body": "Research questions members ask. Tap one and the AI takes it from there."},
      {"id": "chat-start", "title": "Read the finding",
       "body": "Measured against its benchmark: ahead on growth per year and on return for its risk, and on the years it never saw, reads DATA VALIDATED. Ahead on part of that reads TRADE-OFF. Level or behind on both reads NO EDGE."},
      {"id": "chat-root", "title": "QuantGPT's AI, or your own",
       "body": "Where your plan includes it, QuantGPT's AI answers with no key. Use your own AI, at the top of the chat, takes your key for Claude, ChatGPT, Gemini and more. The key stays in this browser."},
      {"id": "plan-card", "title": "Your plan",
       "body": "What your plan opens. A locked row names the plan that opens it; tap it to see what comes with it."},
      {"id": "chat-rules", "title": "The rules",
       "body": "Your AI reports what criteria would have done and what they screen to today. It never tells you to buy anything, and none of its tools can place an order."}
    ]},
    "leaderboard": {"title": "The leaderboard", "steps": [
      {"id": "board-head", "title": "This is the leaderboard",
       "body": "Every member is on it, you too, under your forum name. You can turn that off on your account page; with no forum name you show as an operator name."},
      {"id": "podium", "title": "How you climb",
       "body": "Run backtests, journal studies, post in the forum and come back on more days. Each one adds to your score in the window you pick."},
      {"id": "board-pick", "title": "Pick a board to climb",
       "body": "Total work ranks by what you do here. CAGR and Sharpe rank the backtests members include, hypothetical results on past data."},
      {"id": "acct-link", "title": "Your settings",
       "body": "Your name on the board, what you share and which runs count live on your account page."}
    ]},
    "technicals": {"title": "Technicals", "steps": [
      {"id": "tc-ticker", "title": "Pick a stock",
       "body": "Type a ticker and press Chart. Every number on the page comes from our daily prices, adjusted for splits and dividends."},
      {"id": "tc-ranges", "title": "The window",
       "body": "Three months to five years. Three years and more draw on a log scale, and five years draws weekly bars."},
      {"id": "tc-overlays", "title": "On the price",
       "body": "Moving averages and the three channels: Bollinger, Keltner and Donchian. With Keltner on, the dots along the foot show the squeeze."},
      {"id": "tc-panels", "title": "The panels",
       "body": "Volume, RSI, MACD, the stochastic, ADX, and on-balance volume with the money flow index, each in its own panel under the price."},
      {"id": "tc-chart", "title": "The chart",
       "body": "Drag to pan, scroll to zoom, double-click to reset. The marks are the signals in the list below."},
      {"id": "signals", "title": "Signals",
       "body": "What the price did in the window, newest first: breakouts with their volume, crosses, RSI and MACD crossings, the squeeze and new 52-week highs and lows."},
      {"id": "now", "title": "Now",
       "body": "The latest value of each indicator in one plain line, with the usual reference lines named."},
      {"id": "tc-ai", "title": "Ask your AI",
       "body": "Copies a prompt with this chart's numbers for the AI you use. Backtest a rule on this opens the backtest with the ticker and one rule filled in."}
    ]}
  } /* END TOURS */;

  function rank(plan) { return PLANS.indexOf(plan); }

  function surfaceOpen(t, key) {
    var list = (t && t.surfaces) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].key === key) return !list[i].locked;
    }
    return false;
  }

  // the steps this member's plan opens, in order. t is the /api/tiers/me
  // answer, or null when it never came: then only the ungated steps show.
  function stepsFor(name, t) {
    var tour = TOURS[name];
    if (!tour) return [];
    var r = rank(t && t.plan);
    return tour.steps.filter(function (s) {
      if (s.min && r < rank(s.min)) return false;
      if (s.max && (r < 0 || r > rank(s.max))) return false;
      if (s.surface && !surfaceOpen(t, s.surface)) return false;
      // a switched feature (Futuretest, QG_FUTURETEST, off by default)
      if (s.flag && !(t && t.switches && t.switches[s.flag])) return false;
      return true;
    });
  }

  // a step named from outside: its 0-based index in the tour's own list (a
  // number, or digits), or its element id; -1 when it names none
  function stepIndex(name, step) {
    var steps = (TOURS[name] || {}).steps || [];
    if (typeof step === "number") return step >= 0 && step < steps.length ? Math.floor(step) : -1;
    var s = String(step == null ? "" : step);
    if (/^\d+$/.test(s)) return stepIndex(name, parseInt(s, 10));
    for (var i = 0; i < steps.length; i++) if (steps[i].id === s) return i;
    return -1;
  }

  // the address came for something else: a feature's explainer, a lock's
  // upgrade card, or what the tour's own quiet_url names
  function quietFor(name, here) {
    here = String(here || "");
    if (/[?&](explain|locked)=/.test(here)) return true;
    var q = (TOURS[name] || {}).quiet_url;
    if (!q) return false;
    try { return new RegExp(q).test(here); } catch (e) { return false; }
  }

  var api = { plans: PLANS, tours: TOURS, stepsFor: stepsFor, stepIndex: stepIndex, quietFor: quietFor,
              start: function () {}, startAt: function () { return false; } };
  root.qgTour = api;

  // the rest needs a page; under node (the tests) it stops here
  if (typeof document === "undefined") return;
  var me = document.currentScript;
  var name = me && me.getAttribute("data-tour");
  if (!name || !TOURS[name]) return;

  var KEY = "qg_tour_" + name;
  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  // the record (Brett, 2026-10-08: once dismissed, clicked off or done, a
  // tutorial stays off): the browser's key and the account's list, which
  // other first-run pieces (the Backtest page's three steps) read too
  var told = false;
  function markSeen() {
    try { localStorage.setItem(KEY, "done"); } catch (e) {}
    if (told) return;
    told = true;
    // signed out, the browser's record is all there is (the call answers 401)
    try {
      fetch("/api/account/tours", { method: "POST", credentials: "same-origin", keepalive: true,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tour: name }) })
        .catch(function () {});
    } catch (e) {}
  }

  // the page hears the tour open and close (events.html retires its hint)
  function tell(what) {
    try {
      document.dispatchEvent(new CustomEvent("qg:tour-" + what, { detail: { name: name } }));
    } catch (e) {}
  }

  // pages style h2, p and button globally (a border under every h2 on
  // connect, a 112px floor on buttons elsewhere), so the card resets what
  // it does not set itself. The card sits over the event desk's drawer
  // (395) and its scrim (394), so a step that opens the drawer leaves NEXT
  // in reach, and under nav.js's palette (400) and upgrade card (420). The
  // ring stays under the drawer, so its shade never dims an open drawer.
  var css = document.createElement("style");
  css.textContent =
    "#qg-tour-ring{position:fixed;z-index:389;pointer-events:none;border:2px solid var(--amber,#F0A83C);" +
      "border-radius:var(--radius,6px);box-shadow:0 0 0 9999px rgba(5,7,11,.55);" +
      "transition:top .18s,left .18s,width .18s,height .18s}" +
    "#qg-tour{position:fixed;z-index:397;width:340px;max-width:calc(100vw - 32px);box-sizing:border-box;" +
      "background:var(--surface,#10151E);border:1px solid var(--amber,#F0A83C);border-radius:var(--radius-lg,10px);" +
      "box-shadow:0 18px 60px rgba(var(--shade-rgb),.6);padding:.85rem .95rem .8rem;color:var(--ink,#E7ECF4);" +
      "font-family:var(--sans,'Segoe UI',Selawik,system-ui,sans-serif)}" +
    "#qg-tour:focus{outline:none}" +
    "#qg-tour .tk{font-family:var(--sans,system-ui,sans-serif);font-size:.78rem;letter-spacing:0;color:var(--muted,#8B96A8)}" +
    "#qg-tour .tk b{color:var(--amber,#F0A83C);font-weight:400}" +
    "#qg-tour h2{font-family:var(--cond,'Archivo',sans-serif);font-weight:700;font-size:1.05rem;" +
      "letter-spacing:-.01em;margin:.35rem 0 .3rem;padding:0;border:0;line-height:1.25;text-transform:none;" +
      "color:var(--ink,#E7ECF4)}" +
    "#qg-tour h2:focus{outline:none}" +
    "#qg-tour h2:focus-visible{outline:2px solid rgba(var(--amber-rgb),.55);outline-offset:2px}" +
    "#qg-tour p{color:var(--muted,#8B96A8);font-size:.82rem;line-height:1.55;margin:0;max-width:none}" +
    "#qg-tour .tf{display:flex;gap:.45rem;align-items:center;margin-top:.85rem}" +
    "#qg-tour button{min-width:0;height:auto;box-shadow:none;transform:none}" +
    "#qg-tour .skip{margin-right:auto}" +
    "#qg-tour .back[hidden]{display:none}" +
    "#qg-tour .keys{font-family:var(--sans,system-ui,sans-serif);font-size:.74rem;letter-spacing:0;" +
      "color:var(--muted,#8B96A8);margin-top:.55rem}" +
    "#qg-tour .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}" +
    "@media (max-width:560px){#qg-tour{left:16px!important;right:16px;top:auto!important;bottom:16px;width:auto}" +
      "#qg-tour.up{top:16px!important;bottom:auto}" +
      "#qg-tour .keys{display:none}}" +
    "@media (prefers-reduced-motion:reduce){#qg-tour-ring{transition:none}}";

  var ring = null, card = null, live = null, list = [], at = 0, back = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function rendered(node) {
    return !!node && node.getClientRects().length > 0;
  }

  function stepNode(s) {
    var n = document.getElementById(s.id);
    return rendered(n) ? n : null;
  }

  function skipNow(s) {
    if (!s.skip_if) return false;
    try { return !!document.querySelector(s.skip_if); } catch (e) { return true; }
  }

  // a step shows when its element is on the page and its skip_if is not
  function usable(s) {
    return !skipNow(s) && !!stepNode(s);
  }

  function build() {
    if (card) return;
    document.head.appendChild(css);
    ring = el("div");
    ring.id = "qg-tour-ring";
    ring.setAttribute("aria-hidden", "true");
    card = el("div");
    card.id = "qg-tour";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "false");
    card.setAttribute("aria-labelledby", "qg-tour-t");
    card.setAttribute("aria-describedby", "qg-tour-b");
    var tk = el("div", "tk");
    tk.id = "qg-tour-k";
    var h = el("h2");
    h.id = "qg-tour-t";
    h.tabIndex = -1;
    var p = el("p");
    p.id = "qg-tour-b";
    var tf = el("div", "tf");
    var skip = el("button", "qg-btn quiet skip", "Skip the tour");
    skip.type = "button";
    var bk = el("button", "qg-btn secondary back", "Back");
    bk.type = "button";
    var nx = el("button", "qg-btn next", "Next");
    nx.type = "button";
    tf.appendChild(skip); tf.appendChild(bk); tf.appendChild(nx);
    var keys = el("div", "keys", "Arrow keys to step, Esc to close");
    live = el("div", "sr");
    live.setAttribute("aria-live", "polite");
    live.setAttribute("role", "status");
    card.appendChild(tk); card.appendChild(h); card.appendChild(p);
    card.appendChild(tf); card.appendChild(keys); card.appendChild(live);
    skip.onclick = close;
    bk.onclick = function () { go(at - 1, -1); };
    nx.onclick = function () { go(at + 1, 1); };
    card.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); nx.click(); }
      else if (e.key === "ArrowLeft" && !bk.hidden) { e.preventDefault(); bk.click(); }
    });
  }

  function isOpen() { return !!(card && card.parentNode); }

  // the other cards on a page: nav.js's upgrade card, the search, help,
  // the What's new card, the phone menu, and explain.js's "?" popover.
  // The tour does not open over any of them by itself (ease rule 6).
  function navOverlayUp() {
    var sel = ["#qg-tier.open", "#qg-pal.open", "#qg-help.open", "#qg-wn", "#qg-xpop", "#qgside.open"];
    for (var i = 0; i < sel.length; i++) if (document.querySelector(sel[i])) return true;
    return false;
  }

  // on the window, before the page's own handlers: Escape closes the tour
  // and nothing under it (the event desk's drawer, a replay, a popover)
  function onKey(e) {
    if (e.key !== "Escape" || !isOpen()) return;
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    close();
  }

  var raf = 0;
  function onMove() {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; place(); });
  }

  function place() {
    if (!isOpen()) return;
    var node = document.getElementById(list[at].id);
    if (!node) return;
    var r = node.getBoundingClientRect(), pad = 6;
    ring.style.top = (r.top - pad) + "px";
    ring.style.left = (r.left - pad) + "px";
    ring.style.width = (r.width + pad * 2) + "px";
    ring.style.height = (r.height + pad * 2) + "px";
    var vw = window.innerWidth, vh = window.innerHeight, edge = 16, gap = 14;
    if (vw <= 560) {
      // docked to the bottom by the stylesheet; to the top when the card
      // would sit on the thing it points at (terminal's pinned RUN on
      // phones) and the top is clear of it
      card.classList.remove("up");
      var c = card.getBoundingClientRect();
      var onIt = r.bottom + pad > c.top && r.top - pad < c.bottom;
      var topClear = r.top - pad >= edge + c.height;
      if (onIt && topClear) card.classList.add("up");
      return;
    }
    var cw = card.offsetWidth, ch = card.offsetHeight;
    var top = r.bottom + gap;
    if (top + ch > vh - edge) top = r.top - gap - ch;          // no room below: above
    if (top < edge) top = Math.min(vh - ch - edge, Math.max(edge, r.top + edge));   // tall target: inside it
    var left = Math.max(edge, Math.min(r.left, vw - cw - edge));
    card.style.top = top + "px";
    card.style.left = left + "px";
  }

  // show step i, walking in direction dir past any step whose element is
  // not on the page, or whose skip_if matches, right now. The count is of
  // the steps that would show now, so the last one says DONE.
  function go(i, dir) {
    while (i >= 0 && i < list.length && !usable(list[i])) i += dir || 1;
    if (i < 0 || i >= list.length) { if (dir < 0) return; close(); return; }
    at = i;
    var s = list[i], node = stepNode(s);
    var n = 0, of = 0;
    for (var k = 0; k < list.length; k++) {
      if (k !== i && !usable(list[k])) continue;
      of++;
      if (k <= i) n++;
    }
    document.getElementById("qg-tour-k").innerHTML =
      "<b>Tour</b> &middot; " + TOURS[name].title + " &middot; " + n + " of " + of;
    document.getElementById("qg-tour-t").textContent = s.title;
    document.getElementById("qg-tour-b").textContent = s.body;
    card.querySelector(".back").hidden = n === 1;
    card.querySelector(".next").textContent = n >= of ? "Done" : "Next";
    live.textContent = "Tour step " + n + " of " + of + ". " + s.title + ". " + s.body;
    try { node.scrollIntoView({ block: "center", inline: "nearest", behavior: reduce ? "auto" : "smooth" }); }
    catch (e) { node.scrollIntoView(); }
    place();
    try { document.getElementById("qg-tour-t").focus({ preventScroll: true }); }
    catch (e) { document.getElementById("qg-tour-t").focus(); }
  }

  // where in this member's list to start for a step named from outside:
  // that step, or the first after it that shows now, or else the last
  // before it that does; -1 when nothing shows
  function startIndex(l, from) {
    var steps = TOURS[name].steps, want = from == null ? 0 : stepIndex(name, from), i;
    if (want < 0) want = 0;
    for (i = 0; i < l.length; i++) if (steps.indexOf(l[i]) >= want && usable(l[i])) return i;
    for (i = l.length - 1; i >= 0; i--) if (usable(l[i])) return i;
    return -1;
  }

  // the plan's steps stay in the list whether or not their element is on
  // the page yet, so a table that fills in after the tour opened still
  // gets its step; go() passes by whatever is not there
  function open(t, from, auto) {
    if (auto) root.qgTourPending = false;
    if (auto && (isOpen() || navOverlayUp())) return;
    if (!auto && !isOpen() && root.qgOverlayQuiet) root.qgOverlayQuiet("tour");
    var l = stepsFor(name, t), i = startIndex(l, from);
    if (i < 0) return;
    build();
    list = l;
    if (!isOpen()) {
      back = document.activeElement;
      document.body.appendChild(ring);
      document.body.appendChild(card);
      window.addEventListener("keydown", onKey, true);
      document.addEventListener("mousedown", onOutside, true);
      document.addEventListener("touchstart", onOutside, true);
      window.addEventListener("scroll", onMove, true);
      window.addEventListener("resize", onMove);
      tell("open");
    }
    go(i, 1);
    // shown once is seen: leaving the page, signing out or clicking away
    // never brings an auto tour back on the next visit
    if (auto) markSeen();
  }

  // a click off the card closes the tour (and counts as dismissed)
  function onOutside(e) {
    if (!isOpen() || !card || card.contains(e.target)) return;
    // a drag on the page's own scrollbar lands on <html>: not a click off
    if (e.target === document.documentElement) return;
    close();
  }

  function close() {
    markSeen();
    if (!isOpen()) return;
    card.parentNode.removeChild(card);
    if (ring.parentNode) ring.parentNode.removeChild(ring);
    window.removeEventListener("keydown", onKey, true);
    document.removeEventListener("mousedown", onOutside, true);
    document.removeEventListener("touchstart", onOutside, true);
    window.removeEventListener("scroll", onMove, true);
    window.removeEventListener("resize", onMove);
    if (back && back.focus && document.contains(back)) {
      try { back.focus({ preventScroll: true }); } catch (e) { back.focus(); }
    }
    tell("close");
  }

  // the ladder arrives once from nav.js; a member whose ladder never
  // answers gets the ungated steps after a short wait
  function whenTiers(cb) {
    var done = false;
    function fire(t) { if (done) return; done = true; cb(t || null); }
    if (window.qgTiers) { fire(window.qgTiers); return; }
    document.addEventListener("qg:tiers", function (e) { fire(e.detail); });
    setTimeout(function () { fire(window.qgTiers); }, 4000);
  }

  api.start = function () { whenTiers(function (t) { open(t, 0); }); };
  api.isOpen = isOpen;
  api.close = close;
  api.startAt = function (tour, step) {
    if (tour !== name) return false;
    whenTiers(function (t) { open(t, step); });
    return true;
  };

  // on request only: ?tour=1 on the address (Help's "Take this page's tour"
  // links it). Every other way in goes through api.start and api.startAt.
  var search = String(location.search || "");
  if (!/[?&]tour=1(&|$)/.test(search)) return;
  // nav.js's What's new card waits for a tour that is about to open
  root.qgTourPending = true;
  var m = /[?&]tour_step=([A-Za-z0-9_-]+)/.exec(search);
  whenTiers(function (t) {
    // a beat after the page's own first paint, so the anchors have settled
    setTimeout(function () { open(t, m ? m[1] : 0, true); }, 700);
  });
})(typeof window !== "undefined" ? window : this);
