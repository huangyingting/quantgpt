export type UniversityChapter = {
  id: string;
  track: 'specialist' | 'generalist' | 'SCHOOL' | 'GRAD';
  number: number;
  title: string;
  subtitle: string;
  readMinutes: number;
  readingMinutes: number;
  lessonUrl: string;
  linkedLessonHref: string;
  lessonTitle: string;
  productUrl: string;
  productLabel: string;
  summary: string;
  keyTakeaways: string[];
  content: string[];
  quiz: Array<{
    q: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
};

type RawUniversityChapter = Omit<UniversityChapter, 'readingMinutes' | 'linkedLessonHref' | 'content' | 'quiz'> & {
  quiz: Array<{
    q: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
};

const RAW_UNIVERSITY_CHAPTERS: RawUniversityChapter[] = [
  {
    id: 'S1',
    track: 'specialist',
    number: 1,
    title: 'Arm Your AI & Warehouse Fundamentals',
    subtitle: 'Why raw LLMs hallucinate prices and how MCP connects Claude/ChatGPT to point-in-time SEC & price tables.',
    readMinutes: 6,
    lessonUrl: '/learn/1?uni=S1',
    lessonTitle: 'Play Lesson 1: Arm Your AI in 60 Seconds',
    productUrl: '/connect',
    productLabel: 'Open Connect AI Desk',
    summary: 'Learn how Model Context Protocol (MCP) replaces guessed financial numbers with verifiable warehouse queries across 97M+ daily bars and point-in-time SEC filings.',
    keyTakeaways: [
      'Point-in-time filing dates prevent look-ahead bias on restatements and late 10-K filings.',
      'Survivorship-bias-free universes include delisted and bankrupt tickers.',
      'Every MCP call returns auditable citations and splits results at the 2015 walk-forward boundary.',
    ],
    quiz: [
      {
        q: 'Why does testing a stock screen only on today’s S&P 500 constituents inflate historical CAGR?',
        options: [
          'Because today’s index excludes companies that shrank, delisted, or went bankrupt (survivorship bias)',
          'Because dividend yields were higher in the 1990s',
          'Because trading commissions were zero before 2015',
        ],
        correctIndex: 0,
        explanation: 'Survivorship bias drops historical losers from the test universe, artificially boosting past returns.',
      },
      {
        q: 'What prevents look-ahead bias when backtesting quarterly accounting ratios like Piotroski F-Score?',
        options: [
          'Using the fiscal quarter-end date',
          'Using the SEC EDGAR public filing timestamp when investors actually saw the report',
          'Averaging the last four years of earnings',
        ],
        correctIndex: 1,
        explanation: 'A Q4 report ending Dec 31 is often not filed until February or March; trading on it in January is look-ahead bias.',
      },
      {
        q: 'What does the QuantGPT MCP connector give an AI assistant?',
        options: [
          'Custody of your brokerage cash',
          'Read-only tool access to the historical data warehouse, backtester, grader, and world events engine',
          'Automatic unreviewed live order placement',
        ],
        correctIndex: 1,
        explanation: 'QuantGPT never takes custody of funds; MCP exposes verifiable research and testing tools to your AI.',
      },
    ],
  },
  {
    id: 'S2',
    track: 'specialist',
    number: 2,
    title: 'Trend Following, Regime Filters & Whipsaw Buffers',
    subtitle: 'From raw buy-and-hold drawdowns (-56% S&P, -83% NDX) to buffered 200-day trend rules with T-bill cash yield.',
    readMinutes: 8,
    lessonUrl: '/learn/2?uni=S2',
    lessonTitle: 'Play Lesson 2: Become a Quant',
    productUrl: '/terminal?engine=timing',
    productLabel: 'Run Market Timing in Backtester',
    summary: 'Walk through 27 years of daily S&P 500 and Nasdaq-100 data (1999–2026) to see why unbuffered moving average crossovers suffer 196 whipsaws and how a +1%/-3% hysteresis band cuts trades to 42.',
    keyTakeaways: [
      'A 50% drawdown requires a +100% gain just to recover to break-even.',
      'Crossing a single 200-day SMA line triggers 196 whipsaw trades in sideways markets.',
      'Adding an asymmetrical +1% entry / -3% exit hysteresis band plus 3M T-bill yield turns a noisy rule into a durable risk filter.',
    ],
    quiz: [
      {
        q: 'If an index drops -83% (like the Nasdaq-100 in 2000–2002), what gain is needed from the bottom just to get back to even?',
        options: ['+83%', '+166%', '+488%'],
        correctIndex: 2,
        explanation: 'After losing 83%, only 17% of capital remains; 100 / 17 = 5.88x (+488%).',
      },
      {
        q: 'Why did the naive 200-day SMA rule produce 196 trades between 1999 and 2026?',
        options: [
          'Price frequently oscillates within ±1% of the 200-day average during choppy consolidations (whipsaws)',
          'The moving average resets every January',
          'Dividends force monthly sales',
        ],
        correctIndex: 0,
        explanation: 'Without a buffer band, every 0.1% cross above and below the 200-day line triggers a round-trip trade.',
      },
      {
        q: 'What does the buffered trend rule hold when the market regime is red (below the -3% exit band)?',
        options: ['2x leveraged short ETFs', '3-Month US Treasury Bills earning risk-free yield', 'Gold miners'],
        correctIndex: 1,
        explanation: 'Earning 3-month Treasury bill interest while out of equities adds positive carry during bear markets.',
      },
    ],
  },
  {
    id: 'S3',
    track: 'specialist',
    number: 3,
    title: 'Overfitting, Parameter Sweeps & Walk-Forward Splits',
    subtitle: 'Why testing 300 parameter combinations guarantees a fake winner—and how the 2015 split catches it.',
    readMinutes: 9,
    lessonUrl: '/learn/3?uni=S3',
    lessonTitle: 'Play Lesson 3: The Backtester & 300-Run Sweep',
    productUrl: '/terminal#sweep',
    productLabel: 'Open Parameter Sweep in Terminal',
    summary: 'Explore a 300-combination grid of fast/slow moving averages and hysteresis bands, witness how the #1 in-sample winner collapses after 2015, and apply the 11-check Skeptic challenge.',
    keyTakeaways: [
      'Selection bias (multiple testing) makes the best-looking backtest out of 300 runs likely to be luck.',
      'Holding out 2015–present as an out-of-sample split exposes curve-fitted parameters.',
      'Robust strategies live on broad parameter plateaus, not isolated needle peaks.',
    ],
    quiz: [
      {
        q: 'What is the primary danger of picking the single highest-CAGR run from a 300-parameter sweep?',
        options: [
          'Multiple-testing / data-mining bias that fits historical noise rather than a repeatable signal',
          'The computer takes too long to sort 300 rows',
          'Sharpe ratio cannot be computed on sweeps',
        ],
        correctIndex: 0,
        explanation: 'When you test hundreds of variations, extreme lucky outliers rise to the top even when no real edge exists.',
      },
      {
        q: 'How does QuantGPT assign the DATA VALIDATED badge?',
        options: [
          'Any backtest with CAGR above 12%',
          'Beats benchmark on both CAGR and Sharpe overall AND does not fall behind on both after the out-of-sample split year',
          'Any strategy published in an academic journal',
        ],
        correctIndex: 1,
        explanation: 'DATA VALIDATED requires beating the benchmark on both return and risk-adjusted return and holding up out-of-sample.',
      },
      {
        q: 'What do Skeptic checks #9 and #10 (Parameter Neighbors ±1 step) test?',
        options: [
          'Whether neighboring parameter values also work (a plateau) vs collapsing (a fragile spike)',
          'Whether the stock trades on NYSE or Nasdaq',
          'Tax withholding rates',
        ],
        correctIndex: 0,
        explanation: 'If nudging a lookback window by 1 step ruins the backtest, the parameter was curve-fit to a few historical dates.',
      },
    ],
  },
  {
    id: 'S4',
    track: 'specialist',
    number: 4,
    title: 'Multi-Factor Screening & Stock Grading (6 Dimensions)',
    subtitle: 'Combining Momentum, Value, Quality, Growth, Earnings, and Flows—plus AAOIFI Halal screening.',
    readMinutes: 7,
    lessonUrl: '/learn/1?uni=S4',
    lessonTitle: 'Interactive Factor & Grader Walkthrough',
    productUrl: '/grade',
    productLabel: 'Open Stock Grader & Halal Screen',
    summary: 'Understand how academic anomalies (Jegadeesh-Titman Momentum, Piotroski F-Score, Novy-Marx Gross Profitability, Sloan Accruals) combine into a 6-dimension grade card.',
    keyTakeaways: [
      'Value alone buys cheap turnaround traps; pairing Value with Quality (F-Score >= 7) filters out deteriorating balance sheets.',
      'Momentum works best over 6–12 months skipping the most recent month (12-1M) to avoid 1-month short-term reversal.',
      'AAOIFI Shariah Standard 21 tests core business activity plus 30% debt, 30% interest cash, and 5% impure income ceilings.',
    ],
    quiz: [
      {
        q: 'Why is standard academic momentum measured as 12-1M (skipping the most recent month)?',
        options: [
          'The most recent 1-month return exhibits short-term microstructure mean reversion',
          'Last month’s prices are secret',
          'Dividends are only paid in month 12',
        ],
        correctIndex: 0,
        explanation: 'Jegadeesh (1990) and Jegadeesh & Titman (1993) showed 1-month returns mean-revert while 2–12 month returns trend.',
      },
      {
        q: 'Why does pairing Value with Piotroski F-Score improve risk-adjusted returns?',
        options: [
          'It eliminates distressed value traps with shrinking margins, rising leverage, and share dilution',
          'It selects only mega-cap tech stocks',
          'It trades every 5 minutes',
        ],
        correctIndex: 0,
        explanation: 'Piotroski (2000) showed that 9 binary financial health checks separate healthy cheap stocks from value traps.',
      },
      {
        q: 'Under AAOIFI Shariah Standard 21, what is the maximum allowed ratio of interest-bearing debt to market cap?',
        options: ['10%', '30%', '60%'],
        correctIndex: 1,
        explanation: 'AAOIFI Standard 21 caps interest-bearing debt at 30% of market capitalization.',
      },
    ],
  },
  {
    id: 'S5',
    track: 'specialist',
    number: 5,
    title: 'Intrinsic Valuation, Reverse DCF & Sensitivity Grids',
    subtitle: 'Building a 10-year DCF model, solving for market-implied growth, and collaborating on the Team Board.',
    readMinutes: 8,
    lessonUrl: '/learn/7?uni=S5',
    lessonTitle: 'Play Lesson 7: Team Board & DCF Model',
    productUrl: '/model',
    productLabel: 'Open DCF Valuation Model',
    summary: 'Learn how to stress-test a growth stock with a 10-year Free Cash Flow schedule, solve for the 5-year CAGR already priced in by the market, and inspect a 5×5 WACC × Terminal Growth matrix.',
    keyTakeaways: [
      'A point-estimate DCF fair value is fragile; always inspect the 5×5 WACC × Terminal Growth sensitivity grid.',
      'Reverse DCF flips the question: instead of guessing growth, compute the exact growth rate the current share price demands.',
      'Team Boards move ideas from NOTES to RUNNING to DATA VALIDATED only after passing Skeptic and valuation checks.',
    ],
    quiz: [
      {
        q: 'What does the Reverse-DCF Implied Growth Solver calculate?',
        options: [
          'The 5-year revenue/FCF growth rate required for the DCF fair value to equal today’s market price',
          'Yesterday’s trading volume',
          'The company’s tax rate in 1998',
        ],
        correctIndex: 0,
        explanation: 'Reverse DCF tells you what expectations are already baked into the current stock price.',
      },
      {
        q: 'In a DCF model, what happens to Fair Value per Share when WACC (discount rate) increases?',
        options: [
          'Fair value decreases because future cash flows are discounted more heavily',
          'Fair value increases linearly',
          'Fair value is unchanged',
        ],
        correctIndex: 0,
        explanation: 'Higher discount rates reduce the present value of distant cash flows and terminal value.',
      },
      {
        q: 'Why must terminal growth rate (g) remain strictly below WACC (r) in the Gordon Growth terminal value formula?',
        options: [
          'Because FCF_10 * (1 + g) / (r - g) explodes to infinity or negative if g >= r, and no company can outgrow the economy forever',
          'Because SEC filings only have 5 columns',
          'Because spreadsheets cannot divide decimals',
        ],
        correctIndex: 0,
        explanation: 'Perpetual growth cannot exceed the discount rate or long-run nominal GDP growth.',
      },
    ],
  },
  {
    id: 'G1',
    track: 'generalist',
    number: 1,
    title: 'World Events & Geopolitical Market Reactions',
    subtitle: 'Measuring 1, 5, 21, and 63-session S&P 500 forward distributions across 19 event kinds.',
    readMinutes: 7,
    lessonUrl: '/learn/4?uni=G1',
    lessonTitle: 'Play Lesson 4: World Events Study',
    productUrl: '/events',
    productLabel: 'Open World Events Desk',
    summary: 'Examine historical base rates across 19 event categories (war onset, sanctions, oil shocks, central bank surprises, tariffs) using 4-ring geographic ripple analysis and sign tests.',
    keyTakeaways: [
      'Headlines trigger emotional overreaction; historical base rates show how often 1-day drops mean-revert by day 21 or 63.',
      'A sign test checks whether the hit rate (e.g. 14/20 positive) is statistically distinguishable from a 50/50 coin flip.',
      'The 4-ring geographic ripple maps direct country impact (Ring 1) to regional neighbors (Ring 2), trade partners (Ring 3), and global benchmarks (Ring 4).',
    ],
    quiz: [
      {
        q: 'Why does World Events report median return and sign-test p-value alongside mean return?',
        options: [
          'Because a single extreme crisis outlier can skew the average, while median and sign test show typical consistency',
          'Because mean return is always zero',
          'To hide negative years',
        ],
        correctIndex: 0,
        explanation: 'Small event samples are sensitive to outliers; median and binomial sign tests measure whether the direction is consistent.',
      },
      {
        q: 'What are the 4 standard forward reaction windows measured after each world event?',
        options: [
          '1, 5, 21, and 63 trading sessions (1 day, 1 week, 1 month, 1 quarter)',
          '1 minute, 5 minutes, 10 minutes, 1 hour',
          '10, 20, 30, and 40 years',
        ],
        correctIndex: 0,
        explanation: '1, 5, 21, and 63 trading days correspond to 1 day, 1 trading week, 1 trading month, and 1 trading quarter.',
      },
      {
        q: 'What does Ring 1 represent in the 4-Ring Geographic Ripple model?',
        options: [
          'Primary country / epicenter assets directly involved in the event',
          'Unrelated utilities in another hemisphere',
          'Cryptocurrency miners only',
        ],
        correctIndex: 0,
        explanation: 'Ring 1 is the direct epicenter, Ring 2 is regional neighbors, Ring 3 is supply-chain/trade partners, and Ring 4 is global macro.',
      },
    ],
  },
  {
    id: 'G2',
    track: 'generalist',
    number: 2,
    title: 'Event Guard Rules & Signal Overlays',
    subtitle: 'How pausing entries or trimming size around scheduled/unscheduled shocks alters strategy drawdowns.',
    readMinutes: 6,
    lessonUrl: '/learn/6?uni=G2',
    lessonTitle: 'Play Lesson 6: Event Rules & Signals',
    productUrl: '/events',
    productLabel: 'Configure Event Rules',
    summary: 'Build and backtest explicit event overlays (`pause_entries`, `reduce_size`, `exit_to_cash`, `hedge_on`) triggered by specific World Event kinds.',
    keyTakeaways: [
      'Most event-guard rules reduce drawdown slightly at the cost of missed rebound days.',
      'Pausing new momentum entries for 3–5 sessions around major sanctions or rate shocks avoids buying into initial liquidity air-pockets.',
      'Always compare Baseline vs With-Rule CAGR, Sharpe, and Max Drawdown before activating a live guard.',
    ],
    quiz: [
      {
        q: 'What does the `pause_entries` event rule action do during an N-day event window?',
        options: [
          'Holds existing positions but blocks new buy signals until N trading sessions after the event',
          'Liquidates the entire portfolio at market open',
          'Doubles leverage on every position',
        ],
        correctIndex: 0,
        explanation: '`pause_entries` avoids initiating fresh positions during acute event volatility without panic-selling existing holdings.',
      },
      {
        q: 'Why can exiting to 100% cash on every geopolitical headline hurt long-term CAGR?',
        options: [
          'Because many geopolitical dips V-bottom within 5–21 sessions, causing cash rules to sell the dip and miss the recovery',
          'Because cash has infinite volatility',
          'Because brokers prohibit holding cash',
        ],
        correctIndex: 0,
        explanation: 'Historical event studies show sharp relief rallies often follow initial headline shocks.',
      },
      {
        q: 'How should an operator decide whether to keep an Event Rule active?',
        options: [
          'Verify in the side-by-side comparison that drawdown reduction outweighs any CAGR drag across full history',
          'Enable all 19 event kinds simultaneously with 60-day windows',
          'Guess based on social media sentiment',
        ],
        correctIndex: 0,
        explanation: 'Every rule is a trade-off between protection and time-in-market; test the exact delta first.',
      },
    ],
  },
  {
    id: 'G3',
    track: 'generalist',
    number: 3,
    title: 'The Headline Check & Portfolio Factor Audit',
    subtitle: 'Looking past since-inception CAGR to rolling 3-year windows, worst drawdowns, and 5-factor loadings.',
    readMinutes: 7,
    lessonUrl: '/learn/headline-check?uni=G3',
    lessonTitle: 'Open Interactive Headline Check Tool',
    productUrl: '/review',
    productLabel: 'Run Portfolio Checkup',
    summary: 'Audit any return track or live portfolio by leading with loss-first metrics (max drawdown, longest underwater stretch, rolling 36M windows) and decomposing holdings across Market, Size, Value, Momentum, and Quality factors.',
    keyTakeaways: [
      'A great 25-year headline CAGR can hide a 7-year underwater stretch that most real investors would have abandoned.',
      'Rolling 36-month windows show what a typical 3-year investor experience actually looked like.',
      'Portfolio Checkup reveals hidden sector concentration and factor tilts before they bite.',
    ],
    quiz: [
      {
        q: 'Why does the Headline Check display Maximum Drawdown and Longest Underwater Stretch before CAGR?',
        options: [
          'Because you only earn the long-term CAGR if you can survive the worst interim drawdown without capitulating',
          'Because CAGR is impossible to calculate',
          'Because losses are taxed differently',
        ],
        correctIndex: 0,
        explanation: 'Investors abandon strategies during deep or multi-year drawdowns long before the 25-year average materializes.',
      },
      {
        q: 'What do Rolling 36-Month Windows reveal that a single since-inception CAGR hides?',
        options: [
          'The distribution of 3-year returns across every possible entry month, not just day one',
          'Intraday tick volume',
          'CEO compensation',
        ],
        correctIndex: 0,
        explanation: 'Rolling windows show how consistently a strategy performed regardless of which year an investor started.',
      },
      {
        q: 'Which 5 academic factors are measured in the Portfolio Checkup factor-loadings bar chart?',
        options: [
          'Market, Size, Value, Momentum, and Quality',
          'Gold, Silver, Oil, Wheat, and Corn',
          'Monday, Tuesday, Wednesday, Thursday, and Friday',
        ],
        correctIndex: 0,
        explanation: 'The 5-factor decomposition measures exposure to Market beta, Size (SMB), Value (HML), Momentum (UMD), and Quality (QMJ).',
      },
    ],
  },
  {
    id: 'G4',
    track: 'generalist',
    number: 4,
    title: 'Findings Journal, Paper Books & Out-of-Sample Decay',
    subtitle: 'Tracking saved strategies after discovery (`HOLDING UP`, `MIXED`, `FADING`) and running $100K paper books.',
    readMinutes: 6,
    lessonUrl: '/learn/5?uni=G4',
    lessonTitle: 'Play Lesson 5: Walk-Forward & Live Tracking',
    productUrl: '/journal',
    productLabel: 'Open Findings Journal',
    summary: 'Learn how the Findings Journal records a tamper-evident timestamp when you save a backtest and measures true post-discovery out-of-sample alpha alongside a nightly $100,000 paper book.',
    keyTakeaways: [
      'The truest out-of-sample test starts the day you save a finding to your Journal.',
      'Strategies are badged HOLDING UP, MIXED, FADING, or TOO EARLY (< 30 days since saved) against their benchmark.',
      'Paper Books simulate $100,000 of virtual capital marked to market each night before risking a dollar of live capital.',
    ],
    quiz: [
      {
        q: 'Why does the Findings Journal show `TOO EARLY` during the first 30 days after saving a strategy?',
        options: [
          'Because < 30 days of live market noise is statistically meaningless for judging a multi-year factor strategy',
          'Because database backups run monthly',
          'Because prices are delayed by 30 days',
        ],
        correctIndex: 0,
        explanation: 'Short-term noise over a few weeks cannot validate or invalidate a systematic strategy.',
      },
      {
        q: 'What starting notional balance is allocated when you click "Follow on paper" for a saved study?',
        options: ['$100,000 virtual paper book', '$10', '$1,000,000,000'],
        correctIndex: 0,
        explanation: 'Every paper book initializes at $100,000 and marks holdings nightly against the warehouse.',
      },
      {
        q: 'What triggers a `FADING` status on a saved Journal finding?',
        options: [
          'Since-saved realized return significantly trails both its historical expectation and benchmark after >30 days',
          'Changing your account avatar',
          'Viewing the page in Day theme',
        ],
        correctIndex: 0,
        explanation: '`FADING` warns the operator that post-save live performance is decaying relative to the backtest.',
      },
    ],
  },
  {
    id: 'G5',
    track: 'generalist',
    number: 5,
    title: 'QuantGPT Cloud Runner, Crisis Simulator & Prediction Markets',
    subtitle: 'Deploying scheduled Python bots to your own Alpaca paper/live account with version-hashed attestations.',
    readMinutes: 8,
    lessonUrl: '/learn/quantgpt-cloud?uni=G5',
    lessonTitle: 'Read QuantGPT Cloud Architecture Guide',
    productUrl: '/runner',
    productLabel: 'Open QuantGPT Cloud Runner',
    summary: 'Master the operational safeguards of QuantGPT Cloud: 5-field NY cron schedules, version-hashed code attestation, sealed Alpaca key storage, and comparing Polymarket/Kalshi odds to warehouse base rates.',
    keyTakeaways: [
      'QuantGPT Cloud runs your exact Python code on a schedule; any single-character edit changes the SHA version hash and requires re-attestation before live execution.',
      'You can choose a 30-day paper-trading soak or go straight to live execution on your own Alpaca key.',
      'Prediction Markets (`/pm`) compares crowd contract prices (Polymarket/Kalshi) against historical warehouse base rates to spot mispriced macro probabilities.',
    ],
    quiz: [
      {
        q: 'What happens in QuantGPT Cloud if you edit a live bot’s Python code?',
        options: [
          'The bot’s version hash changes and live execution pauses until you review and re-attest the new version',
          'The old and new code both run simultaneously',
          'Your Alpaca account is closed',
        ],
        correctIndex: 0,
        explanation: 'Live attestation is strictly bound to an immutable code version hash.',
      },
      {
        q: 'In what timezone are QuantGPT Cloud 5-field cron schedules evaluated?',
        options: ['America/New_York (NYSE market time)', 'UTC+12', 'Local browser random time'],
        correctIndex: 0,
        explanation: 'All runner cron schedules (e.g. `35 9 * * 1-5` for 09:35 ET) run on NYSE market time.',
      },
      {
        q: 'What does the Prediction Markets board (`/pm`) compare against Polymarket and Kalshi contract prices?',
        options: [
          'Empirical historical base-rate frequencies from the QuantGPT data warehouse',
          'Sports scores',
          'Horoscope charts',
        ],
        correctIndex: 0,
        explanation: 'Comparing crowd-implied probability to multi-decade historical frequency highlights where headlines over- or under-price an event.',
      },
    ],
  },
];

export const UNIVERSITY_CHAPTERS: UniversityChapter[] = RAW_UNIVERSITY_CHAPTERS.map((ch) => ({
  ...ch,
  readingMinutes: ch.readMinutes,
  linkedLessonHref: ch.lessonUrl,
  content: [ch.summary, ...ch.keyTakeaways],
  quiz: ch.quiz.map((q) => ({
    ...q,
    question: q.q,
  })),
}));

export function getUniversityChapter(id: string): UniversityChapter | undefined {
  const clean = (id || '').trim().toUpperCase();
  return UNIVERSITY_CHAPTERS.find((c) => c.id.toUpperCase() === clean);
}
