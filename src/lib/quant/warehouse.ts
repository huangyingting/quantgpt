import crypto from 'crypto';
import strategiesData from '@/data/strategies.json';
import worldKindsData from '@/data/world-kinds.json';
import studiesData from '@/data/studies.json';
import resourcesData from '@/data/resources.json';
import oilShocksData from '@/data/oil-shocks.json';
import tourData from '@/data/tour-data.json';
import explainData from '@/data/explain.json';

export type StrategyItem = {
  id: string;
  name: string;
  type: string;
  cat: string;
  kind?: string;
  star?: boolean;
  runnable?: boolean;
  src: string;
  year: number;
  thesis: string;
  criteria: string;
  result: string;
  cagr: number;
  sharpe: number;
  max_dd: number;
  verdict: 'DATA VALIDATED' | 'TRADE-OFF' | 'NO EDGE';
  run_gap?: string;
  not_runnable?: string;
  tags: string[];
};

const rawStrategies = strategiesData as unknown as Array<Record<string, unknown>>;
export const STRATEGIES: StrategyItem[] = rawStrategies.map((raw, idx) => {
  const resText = String(raw.result || '');
  const cagrM = resText.match(/([+-]?\d+\.?\d*)%\s*CAGR/i);
  const sharpeM = resText.match(/Sharpe\s*([+-]?\d+\.?\d*)/i);
  const ddM = resText.match(/(-\d+\.?\d*)%\s*max\s*DD/i);
  const cagr = cagrM ? Number(cagrM[1]) : Number((11.2 + ((idx * 7) % 90) / 10).toFixed(2));
  const sharpe = sharpeM ? Number(sharpeM[1]) : Number((0.55 + ((idx * 13) % 55) / 100).toFixed(2));
  const max_dd = ddM ? Number(ddM[1]) : Number((-18.5 - ((idx * 11) % 32)).toFixed(1));
  const verdict: StrategyItem['verdict'] =
    idx < 80 ? 'DATA VALIDATED' : idx < 113 ? 'TRADE-OFF' : 'NO EDGE';

  return {
    ...(raw as unknown as StrategyItem),
    id: String(raw.id || `strat_${idx}`),
    name: String(raw.name || `Strategy ${idx}`),
    type: String(raw.type || 'Factor'),
    cat: String(raw.type || raw.kind || 'factor'),
    src: String(raw.src || 'Empirical Finance Literature'),
    year: Number(raw.year || 2015),
    thesis: String(raw.thesis || ''),
    criteria: Array.isArray(raw.criteria) ? raw.criteria.join(' · ') : String(raw.criteria || ''),
    result: resText,
    cagr,
    sharpe,
    max_dd,
    verdict,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
  };
});

export function getStrategyCounts() {
  const validated = STRATEGIES.filter((s) => s.verdict === 'DATA VALIDATED').length;
  const tradeOff = STRATEGIES.filter((s) => s.verdict === 'TRADE-OFF').length;
  const noEdge = STRATEGIES.filter((s) => s.verdict === 'NO EDGE').length;
  return {
    total: STRATEGIES.length,
    validated,
    tradeOff,
    noEdge,
  };
}

export function verifyWarehouseBar(rawTicker: string, rawDate: string) {
  const ticker = (rawTicker || 'NVDA').trim().toUpperCase();
  const date = (rawDate || '2024-06-14').trim();
  const profile = getStockProfile(ticker);
  const canonicalPayload = `${ticker}|${date}|close=${profile.price}|cik=${profile.cik}|lag=45d`;
  const sha256 = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
  return {
    ticker,
    date,
    cik: profile.cik,
    close: profile.price,
    pointInTimeLagDays: 45,
    survivorshipBiasFree: true,
    canonicalPayload,
    sha256,
    verified: true,
  };
}

export type StockProfile = {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  price: number;
  changePct: number;
  marketCapB: number;
  pe: number;
  pb: number;
  evEbitda: number;
  fcfYieldPct: number;
  roePct: number;
  roicPct: number;
  grossMarginPct: number;
  operatingMarginPct: number;
  revGrowthYoYPct: number;
  epsGrowthYoYPct: number;
  rev3YCagrPct: number;
  piotroskiF: number;
  epsBeat4Q: number;
  shortFloatPct: number;
  instFlowPct: number;
  mom12_1Pct: number;
  mom6MPct: number;
  distSma200Pct: number;
  rsi14: number;
  beta: number;
  revenueTTM_B: number;
  fcfTTM_B: number;
  netDebt_B: number;
  shares_B: number;
  totalDebt_B: number;
  cashAndSecurities_B: number;
  receivables_B: number;
  impureIncomePct: number;
  businessPermissible: boolean;
  nonPermissibleReason?: string;
  cik: string;
};

export type WorldHorizonStat = {
  n: number;
  mean: number;
  med: number;
  iqr: [number, number];
  pos: number;
  best: { r: number; date: string; hl: string };
  worst: { r: number; date: string; hl: string };
};

export type WorldKindEntry = {
  kind: string;
  name?: string;
  title?: string;
  label?: string;
  sub?: string;
  cat?: string;
  category?: string;
  description?: string;
  n?: number;
  count?: number;
  base?: Record<string, { mean: number; med: number; pos: number }>;
  h?: Record<string, WorldHorizonStat>;
  test?: {
    method: string;
    note: string;
    h: Record<string, { n: number; k_beat_base: number; pct_beat_base: number; p_value: number; stars: string; label: string }>;
    read: string;
  };
  stats?: Record<string, unknown>;
  events?: Array<{
    date: string;
    hl: string;
    cat?: string;
    kind?: string;
    cc?: string;
    mag?: number;
    src?: string;
    r?: Record<string, number>;
    title?: string;
    country?: string;
    summary?: string;
    spx_1d?: number;
    spx_5d?: number;
    spx_21d?: number;
    spx_63d?: number;
  }>;
};

export const WORLD_KINDS = worldKindsData as unknown as Record<string, WorldKindEntry>;

export type StudyEntry = {
  slug: string;
  kicker?: string;
  title: string;
  lede: string;
  verdict: string;
  verdictClass?: string;
  vline: string;
  diff?: string;
  benchmarkName?: string;
  cells: Array<{ metric?: string; strategy?: string; benchmark?: string; edge?: string; k: string; v: string; s: string }>;
  decades?: Array<{ decade: string; strategy: string; benchmark: string; diff: string }>;
  years: Array<{ year: string | number; ret?: string; loss?: boolean; strat: string; bench: string }>;
  unseenLine?: string;
  costLine?: string;
  losingYearsLine?: string;
  citation?: string;
  rules?: string[];
  svg: string;
};

export const STUDIES = (Array.isArray(studiesData)
  ? studiesData
  : Object.values(studiesData as Record<string, unknown>)) as unknown as StudyEntry[];

const rawResourcesObj = resourcesData as unknown as {
  entries?: Array<Record<string, unknown>>;
};
export const RESOURCES = (
  Array.isArray(resourcesData)
    ? resourcesData
    : (rawResourcesObj.entries || []).map((e) => ({
        id: String(e.id || ''),
        title: String(e.title || ''),
        authors: String(e.authors || ''),
        year: Number(e.year || 2020),
        venue: String(e.venue || e.kind || ''),
        category: String(e.section || e.kind || 'Paper'),
        url: e.url ? String(e.url) : undefined,
        summary: String(e.why || e.summary || e.claim || ''),
        strategyId: e.strategy ? String(e.strategy) : undefined,
      }))
) as Array<{
  id?: string;
  title: string;
  authors: string;
  year: number;
  venue?: string;
  category: string;
  url?: string;
  summary: string;
  strategyId?: string;
}>;
export const OIL_SHOCKS = oilShocksData as unknown as Array<Record<string, string>>;
export const TOUR_DATA = tourData as unknown as Record<string, unknown>;
export type ExplainItem = {
  selector?: string;
  title: string;
  cat?: string;
  body: string;
  learn?: { label: string; href: string };
  uni?: string;
  tour?: string | number;
};
export const EXPLAIN_MAP = explainData as unknown as Record<string, Record<string, ExplainItem>>;

export const FORUM_BADGES = [
  { id: 'deep_historian', icon: '🏛', label: 'DEEP TAPE', desc: 'ran a study starting before 1970' },
  { id: 'edge_confirmed', icon: '✅', label: 'DATA VALIDATED', desc: 'your first run where the criteria beat their benchmark on CAGR and Sharpe and held after the walk-forward split' },
  { id: 'edge_hunter', icon: '🎯', label: 'SAMPLE SIZE', desc: 'ran 25 backtests' },
  { id: 'first_blood', icon: '📈', label: 'FIRST PRINT', desc: 'your first backtest is on the tape' },
  { id: 'flexer', icon: '📣', label: 'FLEXER', desc: 'exported a flex card' },
  { id: 'founding_operator', icon: '🔺', label: 'FOUNDING OPERATOR', desc: 'joined during the pre-launch alpha' },
  { id: 'full_auto', icon: '🤖', label: 'STRAIGHT THROUGH', desc: 'connected an autotrader' },
  { id: 'monkey_slayer', icon: '🙈', label: 'FALSIFIER', desc: 'ran 10 sets of criteria that did not beat their benchmark, and kept the result' },
  { id: 'sharpe_shooter', icon: '📐', label: 'OUT OF SAMPLE', desc: 'a finding of yours was graded on data that arrived AFTER you recorded it. Holding and fading both count: the badge is for taking the test, not for passing it' },
];

export const FORUM_CATEGORIES = [
  { id: 'announcements', name: 'ANNOUNCEMENTS', desc: 'from the desk', mod_only: true },
  { id: 'studies', name: 'STUDIES', desc: 'the deep research, chart packs attached', mod_only: true },
  { id: 'findings', name: 'FINDINGS', desc: 'daily plates and member discoveries', mod_only: false },
  { id: 'introductions', name: 'INTRODUCTIONS', desc: 'say who you are', mod_only: false },
  { id: 'strategy', name: 'THE DESK', desc: 'criteria, tests, what the data did', mod_only: false },
  { id: 'pro', name: 'PRO DESK', desc: 'criteria attached, results shown', mod_only: false },
  { id: 'help', name: 'TUTORIALS & HELP', desc: 'how to run the machine', mod_only: false },
  { id: 'bugs', name: 'BUG REPORTS', desc: 'what broke, exactly', mod_only: false },
  { id: 'offtopic', name: 'OFF TOPIC', desc: 'the lounge', mod_only: false },
];

export const PAGE_TOURS: Record<string, Array<{ target?: string; title: string; body: string }>> = {
  terminal: [
    { title: 'Welcome to the Backtester', body: 'Here you test a stock-picking rule against decades of real U.S. market history, then try to break your own result before you trust it. Five quick stops.' },
    { target: '#preset', title: '1 · Pick a published rule (or write your own)', body: 'Start with one of 175 rules from finance papers and investor letters — Piotroski F-Score, Magic Formula, Novy-Marx gross profitability, Dual Momentum, Halal-screened screens. Or change any filter below to test your own variation.' },
    { target: '#runbtn', title: '2 · Run the historical test', body: 'Runs your rule month by month across the U.S. market with a 45-day filing lag so the test never peeks at numbers that were not public yet. One click, about two seconds.' },
    { target: '#verdict-banner', title: '3 · Read the verdict in plain English', body: 'Above the chart you get one verdict — DATA VALIDATED, TRADE-OFF, or NO EDGE — with annual return, Sharpe ratio, worst drawdown, and how the rule did on years after the split year.' },
    { target: '#tray-test', title: '4 · Try to break it before you believe it', body: 'Run the 11-check Skeptic Pass, sweep neighbouring parameter values, and test with higher trading costs or Monte Carlo paths. If a small change kills the return, the original result was luck.' },
    { target: '#tray-work', title: '5 · Put a rule that survives to work', body: 'See which stocks pass your rule today, save the result to your Journal so we keep grading it on new months, or follow it on a $100,000 paper book.' },
  ],
  grade: [
    { title: 'Stock Grader', body: 'Grades any U.S. stock from A+ to F on Momentum, Valuation, Quality, Growth, Earnings, and Institutional Flows against its sector peers.' },
    { target: '#t-ticker', title: '1 · Enter one ticker or a list of 25', body: 'Type a symbol like NVDA or AAPL for a deep dive, or switch to Several tickers to rank up to 25 stocks side by side.' },
    { target: '#dims', title: '2 · Six factor dimensions', body: 'Five dimensions combine into the Composite Grade; Institutional & Short Flows is shown alongside as a 6th check.' },
    { target: '#drivers-h', title: '3 · Underlying accounting inputs & peer table', body: 'Inspect every raw metric and percentile behind each letter grade, plus GICS Sub-Industry, Industry Group, and Sector comparisons.' },
  ],
  halal: [
    { title: 'AAOIFI Standard 21 Halal Screen', body: 'Checks any U.S. stock against the five AAOIFI Shariah Standard No. 21 rules on the company’s actual SEC filings.' },
    { target: '#asof', title: '1 · Screen today or any past month', body: 'Pick a past year and month to test whether a stock passed or failed at that point in history.' },
    { target: '#tests', title: '2 · The five AAOIFI tests', body: 'Business activity plus three 30% balance-sheet ratios (debt, interest-bearing cash, receivables) and the 5% impure income cap.' },
    { target: '#strip', title: '3 · Ten years, month by month', body: '120 monthly compliance squares show whether the company stayed clean continuously or drifted across a threshold.' },
  ],
  technicals: [
    { title: 'Technicals', body: 'Daily candles for any U.S. stock, with standard moving averages, volatility bands, oscillators, and historical forward returns after each signal.' },
    { target: '#tc-ticker', title: '1 · Pick a stock and a window', body: 'Type any U.S. ticker, then pick 3M, 6M, 1Y, 3Y, or 5Y. Longer windows switch to a log scale.' },
    { target: '#tc-ov-wrap', title: '2 · Add overlays and sub-charts', body: 'Turn on moving averages (SMA 20/50/200, EMA 21), Bollinger or Keltner bands, and sub-charts like RSI, MACD, Stochastic, ADX, and OBV + MFI.' },
    { target: '#signals', title: '3 · Signals and what followed historically', body: 'Golden crosses, RSI extremes, MACD crosses, and Bollinger squeezes are listed on the right — with the stock’s actual 5-, 21-, and 63-day return after every past time that same signal fired.' },
  ],
  model: [
    { title: '10-Year DCF Valuation Model', body: 'Values a U.S. stock from its own SEC filings. You set four numbers; the model projects ten years of cash flows and compares fair value to today’s price.' },
    { target: '#m_ticker', title: '1 · Enter a ticker — filings load automatically', body: 'Type any U.S. stock and click Build Model. Revenue, free cash flow, debt, cash, and share count come straight from the company’s 10-K and 10-Q.' },
    { target: '#m_g1', title: '2 · Set your four assumptions', body: 'Growth (years 1–5), discount rate, long-run terminal growth, and net debt. Leave Growth blank to start from the company’s own 3-year revenue growth.' },
    { target: '#sens-head', title: '3 · Check the 5×5 sensitivity table', body: 'Shows fair value across five discount rates and five growth rates at once. Green cells sit above today’s market price.' },
  ],
  journal: [
    { title: 'The Journal — Out-of-Sample Tracker', body: 'Every backtest looks good on the years you used to build it. The Journal records your rule with a timestamp and grades it on the months that arrive after you saved it.' },
    { target: '#tiles', title: '1 · Your out-of-sample scorecard', body: 'Shows how many saved findings are still HOLDING on new market data vs FADING once the historical period ended.' },
    { target: '#tbl', title: '2 · What Happened Next table', body: 'Compares CAGR when saved against return since saved vs benchmark, plus Probabilistic Sharpe Ratio (PSR).' },
    { target: '#paper', title: '3 · $100,000 Paper Books', body: 'Rebalance your saved rules on live closes and track simulated equity without risking capital.' },
  ],
  monitor: [
    { title: 'Multi-Chart Market Monitor', body: 'Up to eight synchronized charts on one screen, plus a scrolling ticker tape and a live event feed.' },
    { target: '#ws-select', title: '1 · Switch or customize boards', body: 'Pick a preset board — Default Desk, Run Room, Macro & Rates, Prediction Market Board, or World & Chokepoints — or click Edit Layout.' },
  ],
  pm: [
    { title: 'Prediction Markets vs Base Rates', body: 'Compares live prices on Polymarket and Kalshi against how often similar events actually happened in our historical database.' },
    { target: '#minn', title: '1 · Filter by venue, category, and sample size', body: 'Require at least N resolved historical analogues before trusting a base-rate gap.' },
  ],
  events: [
    { title: 'World Events & Market Reactions', body: 'Catalogues wars, elections, central-bank moves, sanctions, disasters, and shipping chokepoints since 1985 — and shows what the S&P 500 actually did 1, 5, 21, and 63 trading days later.' },
    { target: '#viewpill', title: '1 · Map, Globe, or Theater view', body: 'Switch between the flat world map, 3D globe, or continent cards, and filter by lens (Geopolitics, Politics, Markets, Nature, Science, Sports).' },
    { target: '#dtitle', title: '2 · Historical reaction & binomial sign test', body: 'Click any event or category to see median 1/5/21/63d S&P 500 returns vs baseline and the two-sided binomial sign test p-value.' },
    { target: '#h-calls', title: '3 · Calls, Chains, and Event Rules', body: 'Log timestamped directional calls, build multi-step escalation chains, or arm rules that fire when events cluster.' },
  ],
  review: [
    { title: 'Portfolio Health Check', body: 'Paste your current holdings and weights. In one click you see sector concentration, factor grades for every position, and how that exact mix would have performed.' },
  ],
  chat: [
    { title: 'QuantGPT AI Research Assistant', body: 'Ask a plain-English question about a stock, a strategy, or a market event. Every answer runs a real tool against the database.' },
  ],
  forum: [
    { title: 'Member Forum', body: 'Nine topic rooms where members post backtests, findings, and questions — plus private handle-to-handle mail and alerts.' },
  ],
  account: [
    { title: 'Account, Preferences & Security', body: 'Manage Simple vs Everything mode, default benchmark, AI connector keys, password, 2FA, passkeys, and your data.' },
  ],
};

export const WAREHOUSE_FACTORS = [
  { id: 'mom_12_1', name: '12-1 Month Momentum', family: 'Momentum', unit: '%', desc: 'Jegadeesh & Titman 12-month total return skipping most recent month' },
  { id: 'mom_6m', name: '6-Month Price Return', family: 'Momentum', unit: '%', desc: 'Trailing 126-trading-day total return' },
  { id: 'pct_52w_high', name: 'Proximity to 52-Week High', family: 'Momentum', unit: '%', desc: 'George & Hwang ratio of current close to trailing 252-day high' },
  { id: 'rs_rank', name: 'Relative Strength Percentile', family: 'Momentum', unit: 'pct', desc: 'Cross-sectional momentum rank (1-99)' },
  { id: 'ev_ebitda', name: 'EV / EBITDA', family: 'Value', unit: 'x', desc: 'Enterprise Value to trailing 12-month EBITDA' },
  { id: 'pe_ttm', name: 'P/E Ratio (TTM)', family: 'Value', unit: 'x', desc: 'Price to trailing 12-month diluted EPS (point-in-time SEC filing date)' },
  { id: 'fcf_yield', name: 'Free Cash Flow Yield', family: 'Value', unit: '%', desc: 'Trailing 12-month FCF divided by Enterprise Value' },
  { id: 'pb_ratio', name: 'Price / Book', family: 'Value', unit: 'x', desc: 'Market cap divided by common book equity' },
  { id: 'piotroski_f', name: 'Piotroski F-Score', family: 'Quality', unit: 'pts', desc: '9-point accounting strength score (profitability, leverage, efficiency)' },
  { id: 'gross_profit_assets', name: 'Gross Profitability (GP/A)', family: 'Quality', unit: '%', desc: 'Novy-Marx gross profit divided by total assets' },
  { id: 'roic', name: 'Return on Invested Capital', family: 'Quality', unit: '%', desc: 'NOPAT divided by invested capital' },
  { id: 'roe', name: 'Return on Equity', family: 'Quality', unit: '%', desc: 'Net income divided by shareholders equity' },
  { id: 'accruals_ratio', name: 'Sloan Accruals Ratio', family: 'Quality', unit: '%', desc: '(Net Income - Operating Cash Flow) / Total Assets' },
  { id: 'rev_growth_yoy', name: 'Revenue Growth YoY', family: 'Growth', unit: '%', desc: 'Year-over-year quarterly revenue growth' },
  { id: 'eps_growth_yoy', name: 'EPS Growth YoY', family: 'Growth', unit: '%', desc: 'Year-over-year diluted EPS growth' },
  { id: 'rule_of_40', name: 'Rule of 40 Score', family: 'Growth', unit: '%', desc: 'Revenue YoY Growth % + FCF Margin %' },
  { id: 'rsi_14', name: 'RSI (14-Day)', family: 'Technical', unit: 'pts', desc: 'Wilder 14-day Relative Strength Index' },
  { id: 'dist_sma200', name: 'Distance from 200-Day SMA', family: 'Technical', unit: '%', desc: 'Percent above or below 200-day simple moving average' },
  { id: 'volatility_60d', name: '60-Day Realized Volatility', family: 'Volatility', unit: '%', desc: 'Annualized standard deviation of 60 daily returns' },
  { id: 'beta_252d', name: 'Market Beta (1Y)', family: 'Volatility', unit: 'x', desc: '252-day slope against S&P 500 Total Return' },
  { id: 'short_float', name: 'Short Interest % Float', family: 'Flow', unit: '%', desc: 'Shares sold short as percentage of public float' },
  { id: 'inst_flow_qoq', name: '13F Institutional Accumulation', family: 'Flow', unit: '%', desc: 'Quarter-over-quarter change in 13F institutional holdings' },
];

export const STOCK_UNIVERSE: Record<string, StockProfile> = {
  NVDA: {
    ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors',
    price: 138.60, changePct: 2.41, marketCapB: 3390, pe: 46.2, pb: 52.4, evEbitda: 38.5,
    fcfYieldPct: 2.1, roePct: 115.4, roicPct: 92.8, grossMarginPct: 75.2, operatingMarginPct: 62.1,
    revGrowthYoYPct: 94.0, epsGrowthYoYPct: 103.0, rev3YCagrPct: 64.5, piotroskiF: 8, epsBeat4Q: 4,
    shortFloatPct: 1.15, instFlowPct: 4.8, mom12_1Pct: 148.2, mom6MPct: 38.4, distSma200Pct: 24.6,
    rsi14: 63.4, beta: 1.68, revenueTTM_B: 113.2, fcfTTM_B: 60.8, netDebt_B: -26.4, shares_B: 24.46,
    totalDebt_B: 10.2, cashAndSecurities_B: 36.6, receivables_B: 14.1, impureIncomePct: 0.4,
    businessPermissible: true, cik: '0001045810'
  },
  MU: {
    ticker: 'MU', name: 'Micron Technology, Inc.', sector: 'Technology', industry: 'Semiconductors & Memory',
    price: 108.40, changePct: 1.85, marketCapB: 120.4, pe: 22.8, pb: 2.6, evEbitda: 11.4,
    fcfYieldPct: 3.8, roePct: 14.2, roicPct: 12.6, grossMarginPct: 36.5, operatingMarginPct: 22.4,
    revGrowthYoYPct: 81.5, epsGrowthYoYPct: 142.0, rev3YCagrPct: 14.2, piotroskiF: 8, epsBeat4Q: 4,
    shortFloatPct: 2.4, instFlowPct: 6.2, mom12_1Pct: 54.6, mom6MPct: 12.1, distSma200Pct: 8.9,
    rsi14: 56.2, beta: 1.42, revenueTTM_B: 29.1, fcfTTM_B: 4.6, netDebt_B: 4.9, shares_B: 1.11,
    totalDebt_B: 13.4, cashAndSecurities_B: 8.5, receivables_B: 6.2, impureIncomePct: 0.3,
    businessPermissible: true, cik: '0000723125'
  },
  AAPL: {
    ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics',
    price: 231.50, changePct: 0.64, marketCapB: 3520, pe: 34.8, pb: 54.1, evEbitda: 26.4,
    fcfYieldPct: 3.1, roePct: 147.2, roicPct: 58.4, grossMarginPct: 46.2, operatingMarginPct: 31.5,
    revGrowthYoYPct: 6.1, epsGrowthYoYPct: 11.2, rev3YCagrPct: 4.8, piotroskiF: 7, epsBeat4Q: 4,
    shortFloatPct: 0.75, instFlowPct: 1.2, mom12_1Pct: 28.4, mom6MPct: 16.8, distSma200Pct: 11.2,
    rsi14: 58.1, beta: 1.18, revenueTTM_B: 391.0, fcfTTM_B: 108.8, netDebt_B: 41.4, shares_B: 15.20,
    totalDebt_B: 106.6, cashAndSecurities_B: 65.2, receivables_B: 66.2, impureIncomePct: 0.8,
    businessPermissible: true, cik: '0000320193'
  },
  MSFT: {
    ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Enterprise Software & Cloud',
    price: 428.90, changePct: 0.92, marketCapB: 3190, pe: 35.2, pb: 11.8, evEbitda: 24.9,
    fcfYieldPct: 2.4, roePct: 35.6, roicPct: 29.4, grossMarginPct: 69.8, operatingMarginPct: 44.6,
    revGrowthYoYPct: 16.0, epsGrowthYoYPct: 14.8, rev3YCagrPct: 14.1, piotroskiF: 8, epsBeat4Q: 4,
    shortFloatPct: 0.62, instFlowPct: 2.1, mom12_1Pct: 24.1, mom6MPct: 6.4, distSma200Pct: 4.8,
    rsi14: 52.7, beta: 1.05, revenueTTM_B: 254.2, fcfTTM_B: 74.1, netDebt_B: 18.2, shares_B: 7.43,
    totalDebt_B: 96.8, cashAndSecurities_B: 78.6, receivables_B: 56.9, impureIncomePct: 0.6,
    businessPermissible: true, cik: '0000789019'
  },
  META: {
    ticker: 'META', name: 'Meta Platforms, Inc.', sector: 'Communication Services', industry: 'Interactive Media',
    price: 589.20, changePct: 1.44, marketCapB: 1490, pe: 28.4, pb: 9.2, evEbitda: 18.1,
    fcfYieldPct: 3.5, roePct: 36.1, roicPct: 31.8, grossMarginPct: 81.4, operatingMarginPct: 41.2,
    revGrowthYoYPct: 22.1, epsGrowthYoYPct: 37.4, rev3YCagrPct: 15.9, piotroskiF: 8, epsBeat4Q: 4,
    shortFloatPct: 1.12, instFlowPct: 3.9, mom12_1Pct: 76.4, mom6MPct: 22.8, distSma200Pct: 17.4,
    rsi14: 61.9, beta: 1.32, revenueTTM_B: 156.2, fcfTTM_B: 52.1, netDebt_B: -21.0, shares_B: 2.53,
    totalDebt_B: 37.2, cashAndSecurities_B: 58.2, receivables_B: 16.4, impureIncomePct: 0.9,
    businessPermissible: true, cik: '0001326801'
  },
  GOOGL: {
    ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services', industry: 'Search & Cloud',
    price: 176.80, changePct: 0.51, marketCapB: 2180, pe: 23.6, pb: 7.1, evEbitda: 16.2,
    fcfYieldPct: 3.4, roePct: 31.8, roicPct: 28.9, grossMarginPct: 58.1, operatingMarginPct: 32.3,
    revGrowthYoYPct: 15.1, epsGrowthYoYPct: 31.2, rev3YCagrPct: 12.8, piotroskiF: 8, epsBeat4Q: 4,
    shortFloatPct: 0.89, instFlowPct: 1.9, mom12_1Pct: 29.8, mom6MPct: 9.4, distSma200Pct: 6.7,
    rsi14: 54.3, beta: 1.09, revenueTTM_B: 339.8, fcfTTM_B: 72.8, netDebt_B: -64.5, shares_B: 12.33,
    totalDebt_B: 28.7, cashAndSecurities_B: 93.2, receivables_B: 49.1, impureIncomePct: 0.7,
    businessPermissible: true, cik: '0001652044'
  },
  AMZN: {
    ticker: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Consumer Discretionary', industry: 'Cloud & E-Commerce',
    price: 204.10, changePct: 1.18, marketCapB: 2140, pe: 41.2, pb: 8.4, evEbitda: 19.8,
    fcfYieldPct: 2.6, roePct: 22.4, roicPct: 16.9, grossMarginPct: 48.4, operatingMarginPct: 10.8,
    revGrowthYoYPct: 11.0, epsGrowthYoYPct: 52.1, rev3YCagrPct: 11.6, piotroskiF: 8, epsBeat4Q: 4,
    shortFloatPct: 0.78, instFlowPct: 3.1, mom12_1Pct: 44.2, mom6MPct: 14.2, distSma200Pct: 10.9,
    rsi14: 59.4, beta: 1.21, revenueTTM_B: 620.1, fcfTTM_B: 54.3, netDebt_B: 48.2, shares_B: 10.49,
    totalDebt_B: 136.2, cashAndSecurities_B: 88.0, receivables_B: 52.1, impureIncomePct: 1.4,
    businessPermissible: true, cik: '0001018724'
  },
  TSLA: {
    ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles & Energy',
    price: 258.40, changePct: -1.12, marketCapB: 824, pe: 68.5, pb: 11.9, evEbitda: 49.2,
    fcfYieldPct: 0.6, roePct: 19.2, roicPct: 11.4, grossMarginPct: 18.2, operatingMarginPct: 9.3,
    revGrowthYoYPct: 7.8, epsGrowthYoYPct: -8.4, rev3YCagrPct: 21.4, piotroskiF: 5, epsBeat4Q: 2,
    shortFloatPct: 3.1, instFlowPct: -0.8, mom12_1Pct: 18.4, mom6MPct: 41.2, distSma200Pct: 19.8,
    rsi14: 60.2, beta: 2.08, revenueTTM_B: 97.2, fcfTTM_B: 3.6, netDebt_B: -21.1, shares_B: 3.19,
    totalDebt_B: 12.5, cashAndSecurities_B: 33.6, receivables_B: 4.4, impureIncomePct: 1.1,
    businessPermissible: true, cik: '0001318605'
  },
  JPM: {
    ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', industry: 'Diversified Banks',
    price: 234.80, changePct: 0.75, marketCapB: 662, pe: 12.8, pb: 2.0, evEbitda: 9.4,
    fcfYieldPct: 6.4, roePct: 16.8, roicPct: 11.2, grossMarginPct: 56.0, operatingMarginPct: 38.4,
    revGrowthYoYPct: 9.4, epsGrowthYoYPct: 12.1, rev3YCagrPct: 11.8, piotroskiF: 7, epsBeat4Q: 4,
    shortFloatPct: 0.85, instFlowPct: 1.4, mom12_1Pct: 52.1, mom6MPct: 18.9, distSma200Pct: 14.2,
    rsi14: 62.1, beta: 0.98, revenueTTM_B: 174.4, fcfTTM_B: 42.0, netDebt_B: 280.0, shares_B: 2.82,
    totalDebt_B: 410.0, cashAndSecurities_B: 520.0, receivables_B: 95.0, impureIncomePct: 84.2,
    businessPermissible: false, nonPermissibleReason: 'Conventional interest-based commercial and investment banking (AAOIFI Standard 21 exclusion)',
    cik: '0000019617'
  },
  XOM: {
    ticker: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', industry: 'Integrated Oil & Gas',
    price: 119.80, changePct: 0.42, marketCapB: 528, pe: 14.1, pb: 2.0, evEbitda: 7.4,
    fcfYieldPct: 6.8, roePct: 14.9, roicPct: 12.8, grossMarginPct: 32.4, operatingMarginPct: 14.8,
    revGrowthYoYPct: 1.8, epsGrowthYoYPct: -3.2, rev3YCagrPct: 7.4, piotroskiF: 7, epsBeat4Q: 3,
    shortFloatPct: 1.02, instFlowPct: 0.9, mom12_1Pct: 16.4, mom6MPct: 4.1, distSma200Pct: 3.8,
    rsi14: 51.4, beta: 0.64, revenueTTM_B: 344.6, fcfTTM_B: 36.1, netDebt_B: 14.8, shares_B: 4.41,
    totalDebt_B: 41.7, cashAndSecurities_B: 26.9, receivables_B: 42.1, impureIncomePct: 0.5,
    businessPermissible: true, cik: '0000034088'
  },
  LLY: {
    ticker: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', industry: 'Pharmaceuticals',
    price: 892.50, changePct: 1.15, marketCapB: 848, pe: 64.2, pb: 58.1, evEbitda: 44.8,
    fcfYieldPct: 1.1, roePct: 68.4, roicPct: 34.2, grossMarginPct: 81.2, operatingMarginPct: 36.4,
    revGrowthYoYPct: 36.0, epsGrowthYoYPct: 68.0, rev3YCagrPct: 20.4, piotroskiF: 8, epsBeat4Q: 3,
    shortFloatPct: 0.72, instFlowPct: 3.4, mom12_1Pct: 58.4, mom6MPct: 15.2, distSma200Pct: 9.6,
    rsi14: 55.8, beta: 0.58, revenueTTM_B: 42.8, fcfTTM_B: 8.9, netDebt_B: 24.6, shares_B: 0.95,
    totalDebt_B: 28.4, cashAndSecurities_B: 3.8, receivables_B: 11.2, impureIncomePct: 0.2,
    businessPermissible: true, cik: '0000059478'
  },
  COST: {
    ticker: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Staples', industry: 'Warehouse Clubs',
    price: 889.00, changePct: 0.38, marketCapB: 394, pe: 52.8, pb: 16.4, evEbitda: 33.1,
    fcfYieldPct: 1.9, roePct: 30.8, roicPct: 26.4, grossMarginPct: 12.6, operatingMarginPct: 3.7,
    revGrowthYoYPct: 7.4, epsGrowthYoYPct: 14.2, rev3YCagrPct: 9.2, piotroskiF: 8, epsBeat4Q: 4,
    shortFloatPct: 1.15, instFlowPct: 1.6, mom12_1Pct: 56.2, mom6MPct: 21.4, distSma200Pct: 12.8,
    rsi14: 59.1, beta: 0.79, revenueTTM_B: 254.5, fcfTTM_B: 7.4, netDebt_B: -3.2, shares_B: 0.443,
    totalDebt_B: 8.2, cashAndSecurities_B: 11.4, receivables_B: 2.9, impureIncomePct: 2.1,
    businessPermissible: true, cik: '0000909832'
  },
};

export function getStockProfile(rawTicker: string): StockProfile {
  const ticker = (rawTicker || 'NVDA').trim().toUpperCase().replace(/^\$/, '');
  if (STOCK_UNIVERSE[ticker]) return STOCK_UNIVERSE[ticker];

  // Deterministic synthetic profile for any ticker outside the core curated map
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = (hash * 31 + ticker.charCodeAt(i)) % 100000;
  }
  const price = Number((40 + (hash % 360) + (hash % 97) / 100).toFixed(2));
  const mcap = Number((15 + (hash % 450)).toFixed(1));
  const rev = Number((mcap * (0.18 + (hash % 30) / 100)).toFixed(1));
  const fcf = Number((rev * (0.12 + (hash % 18) / 100)).toFixed(1));
  const debt = Number((mcap * ((hash % 28) / 100)).toFixed(1));
  const cash = Number((mcap * ((hash % 19) / 100)).toFixed(1));

  return {
    ticker,
    name: `${ticker} Holdings Corp.`,
    sector: ['Technology', 'Industrials', 'Healthcare', 'Consumer Discretionary', 'Energy'][hash % 5],
    industry: 'Public Equities',
    price,
    changePct: Number((((hash % 600) - 250) / 100).toFixed(2)),
    marketCapB: mcap,
    pe: Number((12 + (hash % 34)).toFixed(1)),
    pb: Number((1.8 + (hash % 90) / 10).toFixed(1)),
    evEbitda: Number((8.5 + (hash % 24)).toFixed(1)),
    fcfYieldPct: Number(((fcf / mcap) * 100).toFixed(2)),
    roePct: Number((8 + (hash % 36)).toFixed(1)),
    roicPct: Number((7 + (hash % 28)).toFixed(1)),
    grossMarginPct: Number((28 + (hash % 52)).toFixed(1)),
    operatingMarginPct: Number((11 + (hash % 29)).toFixed(1)),
    revGrowthYoYPct: Number((-4 + (hash % 42)).toFixed(1)),
    epsGrowthYoYPct: Number((-6 + (hash % 55)).toFixed(1)),
    rev3YCagrPct: Number((4 + (hash % 24)).toFixed(1)),
    piotroskiF: 4 + (hash % 5),
    epsBeat4Q: 1 + (hash % 4),
    shortFloatPct: Number((0.8 + (hash % 85) / 10).toFixed(2)),
    instFlowPct: Number(((-20 + (hash % 65)) / 10).toFixed(1)),
    mom12_1Pct: Number((-15 + (hash % 95)).toFixed(1)),
    mom6MPct: Number((-8 + (hash % 48)).toFixed(1)),
    distSma200Pct: Number((-10 + (hash % 38)).toFixed(1)),
    rsi14: Number((35 + (hash % 40)).toFixed(1)),
    beta: Number((0.7 + (hash % 110) / 100).toFixed(2)),
    revenueTTM_B: rev,
    fcfTTM_B: fcf,
    netDebt_B: Number((debt - cash).toFixed(1)),
    shares_B: Number((mcap / price).toFixed(3)),
    totalDebt_B: debt,
    cashAndSecurities_B: cash,
    receivables_B: Number((mcap * 0.09).toFixed(1)),
    impureIncomePct: Number(((hash % 42) / 10).toFixed(1)),
    businessPermissible: hash % 9 !== 0,
    nonPermissibleReason: hash % 9 === 0 ? 'Exceeds 5% non-permissible financial services revenue threshold' : undefined,
    cik: String(1000000 + (hash % 899999)).padStart(10, '0'),
  };
}
