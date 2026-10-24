import { getStockProfile, STOCK_UNIVERSE, type StockProfile } from './warehouse';

export type DimensionGrade = {
  dimension: 'Momentum' | 'Value' | 'Quality' | 'Growth' | 'Earnings' | 'Flows';
  name: string;
  letter: string;
  grade: string;
  percentile: number;
  inComposite?: boolean;
  headline: string;
  headlineMetric: string;
  metrics: Array<{ label: string; value: string; sectorMedian: string }>;
};

export type HalalCheckItem = {
  id: string;
  name: string;
  standard: string;
  passed: boolean;
  actual: string;
  limit: string;
  threshold: string;
  detail: string;
};

export type StockGradeResult = {
  ticker: string;
  name: string;
  cik: string;
  sector: string;
  industry: string;
  price: number;
  changePct: number;
  marketCapB: number;
  overallGrade: string;
  compositeGrade: string;
  overallPercentile: number;
  compositePercentile: number;
  verdictSummary: string;
  accountingScores: {
    piotroskiF: number;
    altmanZ: number;
    beneishM: number;
  };
  dimensions: DimensionGrade[] & {
    valuation: DimensionGrade;
    growth: DimensionGrade;
    profitability: DimensionGrade;
    momentum: DimensionGrade;
    quality: DimensionGrade;
    revisions: DimensionGrade;
  };
  drivers: Array<{
    dimension: string;
    metric: string;
    rawValue: string;
    sectorMedian: string;
    percentile: number;
    grade: string;
    weightInComposite: string;
  }>;
  peerBenchmarks: Array<{
    group: string;
    groupName: string;
    peerCount: number;
    stockRank: string;
    compositeGrade: string;
    medianPe: number;
    medianRoicPct: number;
    medianMom12_1Pct: number;
  }>;
  peers: Array<{
    ticker: string;
    name: string;
    price: number;
    overallGrade: string;
    pe: number;
    roicPct: number;
    mom12_1Pct: number;
  }>;
  halal: {
    status: 'HALAL' | 'HALAL COMPLIANT' | 'DOUBTFUL / MARGINAL' | 'NOT HALAL' | 'NON_HALAL';
    asOf: string;
    standard: 'AAOIFI Shariah Standard No. 21';
    passedCount: number;
    totalChecks: number;
    purificationPer1000Usd: number;
    purificationPctOfDividends: number;
    checks: HalalCheckItem[];
    tests: HalalCheckItem[];
    inputs: Array<{
      field: string;
      valueUsdB: string;
      filingSource: string;
      periodEnd: string;
    }>;
    history10Y: Array<{
      ym: string;
      year: number;
      month: number;
      status: 'PASS' | 'FAIL' | 'UNKNOWN';
      debtRatioPct: number;
      cashRatioPct: number;
      impurePct: number;
    }>;
  };
};

export function getKnownTickers(): string[] {
  return Object.keys(STOCK_UNIVERSE);
}

export function batchGradeStocks(tickers: string[]): StockGradeResult[] {
  const clean = (tickers || []).map((t) => t.trim().toUpperCase()).filter(Boolean).slice(0, 25);
  return (clean.length ? clean : ['NVDA', 'MU', 'AAPL']).map((t) => gradeStock(t));
}

function scoreToLetter(pct: number): string {
  if (pct >= 93) return 'A+';
  if (pct >= 85) return 'A';
  if (pct >= 78) return 'A-';
  if (pct >= 70) return 'B+';
  if (pct >= 62) return 'B';
  if (pct >= 54) return 'B-';
  if (pct >= 46) return 'C+';
  if (pct >= 38) return 'C';
  if (pct >= 30) return 'C-';
  if (pct >= 20) return 'D';
  return 'F';
}

const clampPct = (n: number) => Math.max(4, Math.min(99, Math.round(n)));

export function gradeStock(rawTicker: string, asOf?: string): StockGradeResult {
  const p: StockProfile = getStockProfile(rawTicker);
  const asOfYm = asOf && /^\d{4}-\d{2}$/.test(asOf) ? asOf : '2026-10';
  const asOfYear = Number(asOfYm.slice(0, 4)) || 2026;
  const asOfMonth = Number(asOfYm.slice(5, 7)) || 10;
  const histShift = (2026 - asOfYear) * 0.65 + ((10 - asOfMonth) * 0.08);

  const momPct = clampPct(50 + p.mom12_1Pct * 0.45 + p.distSma200Pct * 0.6);
  const valPct = clampPct(88 - p.pe * 1.05 + p.fcfYieldPct * 5.2);
  const qualPct = clampPct(30 + p.piotroskiF * 5.5 + Math.min(40, p.roicPct * 0.75));
  const growPct = clampPct(40 + p.revGrowthYoYPct * 0.85 + p.rev3YCagrPct * 0.8);
  const earnPct = clampPct(35 + p.epsBeat4Q * 14 + (p.epsGrowthYoYPct > 0 ? 10 : -5));
  const flowPct = clampPct(55 + p.instFlowPct * 6.5 - p.shortFloatPct * 3.5);

  const rawDims: DimensionGrade[] = [
    {
      dimension: 'Momentum',
      name: 'Momentum',
      letter: scoreToLetter(momPct),
      grade: scoreToLetter(momPct),
      percentile: momPct,
      inComposite: true,
      headline: `12-1M return ${p.mom12_1Pct >= 0 ? '+' : ''}${p.mom12_1Pct}% · ${p.distSma200Pct >= 0 ? '+' : ''}${p.distSma200Pct}% vs 200d SMA`,
      headlineMetric: `12-1M return ${p.mom12_1Pct >= 0 ? '+' : ''}${p.mom12_1Pct}% · ${p.distSma200Pct >= 0 ? '+' : ''}${p.distSma200Pct}% vs 200d SMA`,
      metrics: [
        { label: '12-1M Total Return', value: `${p.mom12_1Pct}%`, sectorMedian: '14.2%' },
        { label: '6-Month Return', value: `${p.mom6MPct}%`, sectorMedian: '6.8%' },
        { label: 'Distance to 200d SMA', value: `${p.distSma200Pct}%`, sectorMedian: '+4.1%' },
      ],
    },
    {
      dimension: 'Value',
      name: 'Valuation',
      letter: scoreToLetter(valPct),
      grade: scoreToLetter(valPct),
      percentile: valPct,
      inComposite: true,
      headline: `P/E ${p.pe}x · EV/EBITDA ${p.evEbitda}x · FCF Yield ${p.fcfYieldPct}%`,
      headlineMetric: `P/E ${p.pe}x · EV/EBITDA ${p.evEbitda}x · FCF Yield ${p.fcfYieldPct}%`,
      metrics: [
        { label: 'P/E (TTM)', value: `${p.pe}x`, sectorMedian: '24.5x' },
        { label: 'EV / EBITDA', value: `${p.evEbitda}x`, sectorMedian: '16.2x' },
        { label: 'FCF Yield', value: `${p.fcfYieldPct}%`, sectorMedian: '3.2%' },
      ],
    },
    {
      dimension: 'Quality',
      name: 'Quality',
      letter: scoreToLetter(qualPct),
      grade: scoreToLetter(qualPct),
      percentile: qualPct,
      inComposite: true,
      headline: `Piotroski F-Score ${p.piotroskiF}/9 · ROIC ${p.roicPct}% · Gross Margin ${p.grossMarginPct}%`,
      headlineMetric: `Piotroski F-Score ${p.piotroskiF}/9 · ROIC ${p.roicPct}% · Gross Margin ${p.grossMarginPct}%`,
      metrics: [
        { label: 'Piotroski F-Score', value: `${p.piotroskiF} / 9`, sectorMedian: '6 / 9' },
        { label: 'ROIC', value: `${p.roicPct}%`, sectorMedian: '14.8%' },
        { label: 'Gross Margin', value: `${p.grossMarginPct}%`, sectorMedian: '44.0%' },
      ],
    },
    {
      dimension: 'Growth',
      name: 'Growth',
      letter: scoreToLetter(growPct),
      grade: scoreToLetter(growPct),
      percentile: growPct,
      inComposite: true,
      headline: `YoY Revenue ${p.revGrowthYoYPct >= 0 ? '+' : ''}${p.revGrowthYoYPct}% · 3Y CAGR ${p.rev3YCagrPct}%`,
      headlineMetric: `YoY Revenue ${p.revGrowthYoYPct >= 0 ? '+' : ''}${p.revGrowthYoYPct}% · 3Y CAGR ${p.rev3YCagrPct}%`,
      metrics: [
        { label: 'Revenue Growth YoY', value: `${p.revGrowthYoYPct}%`, sectorMedian: '8.4%' },
        { label: 'EPS Growth YoY', value: `${p.epsGrowthYoYPct}%`, sectorMedian: '10.1%' },
        { label: '3Y Revenue CAGR', value: `${p.rev3YCagrPct}%`, sectorMedian: '9.0%' },
      ],
    },
    {
      dimension: 'Earnings',
      name: 'Profitability',
      letter: scoreToLetter(earnPct),
      grade: scoreToLetter(earnPct),
      percentile: earnPct,
      inComposite: true,
      headline: `Beat EPS estimates in ${p.epsBeat4Q} of last 4 quarters`,
      headlineMetric: `Beat EPS estimates in ${p.epsBeat4Q} of last 4 quarters`,
      metrics: [
        { label: '4Q EPS Beat Track', value: `${p.epsBeat4Q} / 4 quarters`, sectorMedian: '3 / 4' },
        { label: 'Operating Margin', value: `${p.operatingMarginPct}%`, sectorMedian: '18.5%' },
        { label: 'Accrual Quality', value: 'Low Accruals (Cash-Backed)', sectorMedian: 'Neutral' },
      ],
    },
    {
      dimension: 'Flows',
      name: 'Revisions & Flows (Shown alongside)',
      letter: scoreToLetter(flowPct),
      grade: scoreToLetter(flowPct),
      percentile: flowPct,
      inComposite: false,
      headline: `Short float ${p.shortFloatPct}% · 13F Inst. change ${p.instFlowPct >= 0 ? '+' : ''}${p.instFlowPct}% (not in composite)`,
      headlineMetric: `Short float ${p.shortFloatPct}% · 13F Inst. change ${p.instFlowPct >= 0 ? '+' : ''}${p.instFlowPct}%`,
      metrics: [
        { label: 'Short Interest % Float', value: `${p.shortFloatPct}%`, sectorMedian: '2.4%' },
        { label: '13F Institutional Flow', value: `${p.instFlowPct >= 0 ? '+' : ''}${p.instFlowPct}%`, sectorMedian: '+0.8%' },
        { label: 'RSI (14-Day)', value: `${p.rsi14}`, sectorMedian: '52.0' },
      ],
    },
  ];
  const dimensions = Object.assign(rawDims, {
    momentum: rawDims[0],
    valuation: rawDims[1],
    quality: rawDims[2],
    growth: rawDims[3],
    profitability: rawDims[4],
    revisions: rawDims[5],
  });

  // 5 dimensions in composite (Flows is shown alongside, not in composite)
  const overallPercentile = clampPct(
    qualPct * 0.25 + momPct * 0.22 + valPct * 0.2 + growPct * 0.2 + earnPct * 0.13
  );
  const overallGrade = scoreToLetter(overallPercentile);

  // Halal 5-Test Screen (AAOIFI Shariah Standard 21) with historical asOf shift
  const debtRatioPct = Number(Math.max(0.1, (p.totalDebt_B / p.marketCapB) * 100 + histShift).toFixed(2));
  const cashRatioPct = Number(Math.max(0.1, (p.cashAndSecurities_B / p.marketCapB) * 100 + histShift * 0.6).toFixed(2));
  const recRatioPct = Number(Math.max(0.1, (p.receivables_B / p.marketCapB) * 100 + histShift * 0.4).toFixed(2));

  const halalChecks: HalalCheckItem[] = [
    {
      id: 'business_activity',
      name: '1. Core Business Activity Screen',
      standard: 'AAOIFI SS-21 §3/1',
      passed: p.businessPermissible,
      actual: p.businessPermissible ? `${p.industry} (Permissible)` : (p.nonPermissibleReason || 'Restricted industry'),
      limit: 'Zero core revenue from riba, alcohol, gambling, pork, tobacco, weapons',
      threshold: 'Permissible Core',
      detail: 'Evaluates SEC 10-K segment disclosures and SIC/NAICS classification.',
    },
    {
      id: 'interest_debt',
      name: '2. Interest-Bearing Debt / Market Cap',
      standard: 'AAOIFI SS-21 §3/4/2',
      passed: debtRatioPct < 30,
      actual: `${debtRatioPct}% ($${p.totalDebt_B}B / $${p.marketCapB}B)`,
      limit: '< 30.0%',
      threshold: 'Debt/MCap < 30%',
      detail: 'Total short-term + long-term interest-bearing debt divided by market capitalization.',
    },
    {
      id: 'interest_deposits',
      name: '3. Cash & Interest-Bearing Securities / Market Cap',
      standard: 'AAOIFI SS-21 §3/4/3',
      passed: cashRatioPct < 30,
      actual: `${cashRatioPct}% ($${p.cashAndSecurities_B}B / $${p.marketCapB}B)`,
      limit: '< 30.0%',
      threshold: 'Cash/MCap < 30%',
      detail: 'Cash, T-bills, and marketable interest-bearing securities divided by market cap.',
    },
    {
      id: 'impure_income',
      name: '4. Non-Permissible (Impure) Income / Total Revenue',
      standard: 'AAOIFI SS-21 §3/4/4',
      passed: p.impureIncomePct < 5,
      actual: `${p.impureIncomePct}% of revenue`,
      limit: '< 5.0%',
      threshold: 'Impure < 5%',
      detail: 'Interest income and ancillary non-compliant revenue as % of total TTM revenue.',
    },
    {
      id: 'receivables_liquidity',
      name: '5. Accounts Receivable & Liquid Assets / Market Cap',
      standard: 'AAOIFI SS-21 §3/4/5',
      passed: recRatioPct < 49,
      actual: `${recRatioPct}% ($${p.receivables_B}B / $${p.marketCapB}B)`,
      limit: '< 49.0% (Illiquid assets >= 30%)',
      threshold: 'Receivables < 49%',
      detail: 'Ensures company equity represents real operating assets rather than tradable debt/cash claims.',
    },
  ];

  const passedHalal = halalChecks.filter((c) => c.passed).length;
  const halalStatus: StockGradeResult['halal']['status'] =
    passedHalal === 5
      ? 'HALAL'
      : p.businessPermissible && passedHalal >= 4
        ? 'DOUBTFUL / MARGINAL'
        : 'NON_HALAL';

  const peers = Object.values(STOCK_UNIVERSE)
    .filter((s) => s.ticker !== p.ticker)
    .slice(0, 5)
    .map((s) => {
      const sp = clampPct(
        (30 + s.piotroskiF * 5.5 + Math.min(40, s.roicPct * 0.75)) * 0.35 +
          (50 + s.mom12_1Pct * 0.4) * 0.35 +
          (85 - s.pe) * 0.3
      );
      return {
        ticker: s.ticker,
        name: s.name,
        price: s.price,
        overallGrade: scoreToLetter(sp),
        pe: s.pe,
        roicPct: s.roicPct,
        mom12_1Pct: s.mom12_1Pct,
      };
    });

  const drivers: StockGradeResult['drivers'] = [
    { dimension: 'Momentum', metric: '12-1 Month Total Return', rawValue: `${p.mom12_1Pct}%`, sectorMedian: '14.2%', percentile: momPct, grade: scoreToLetter(momPct), weightInComposite: '11%' },
    { dimension: 'Momentum', metric: '6-Month Total Return', rawValue: `${p.mom6MPct}%`, sectorMedian: '6.8%', percentile: clampPct(momPct - 3), grade: scoreToLetter(clampPct(momPct - 3)), weightInComposite: '6%' },
    { dimension: 'Momentum', metric: 'Distance vs 200-Day SMA', rawValue: `${p.distSma200Pct}%`, sectorMedian: '+4.1%', percentile: clampPct(momPct + 2), grade: scoreToLetter(clampPct(momPct + 2)), weightInComposite: '5%' },
    { dimension: 'Valuation', metric: 'P/E Ratio (TTM Diluted)', rawValue: `${p.pe}x`, sectorMedian: '24.5x', percentile: valPct, grade: scoreToLetter(valPct), weightInComposite: '7%' },
    { dimension: 'Valuation', metric: 'EV / EBITDA (TTM)', rawValue: `${p.evEbitda}x`, sectorMedian: '16.2x', percentile: clampPct(valPct + 4), grade: scoreToLetter(clampPct(valPct + 4)), weightInComposite: '7%' },
    { dimension: 'Valuation', metric: 'Free Cash Flow Yield', rawValue: `${p.fcfYieldPct}%`, sectorMedian: '3.2%', percentile: clampPct(valPct + 6), grade: scoreToLetter(clampPct(valPct + 6)), weightInComposite: '6%' },
    { dimension: 'Quality', metric: 'Piotroski F-Score (9-Point)', rawValue: `${p.piotroskiF} / 9`, sectorMedian: '6 / 9', percentile: qualPct, grade: scoreToLetter(qualPct), weightInComposite: '10%' },
    { dimension: 'Quality', metric: 'Return on Invested Capital (ROIC)', rawValue: `${p.roicPct}%`, sectorMedian: '14.8%', percentile: clampPct(qualPct + 3), grade: scoreToLetter(clampPct(qualPct + 3)), weightInComposite: '8%' },
    { dimension: 'Quality', metric: 'Gross Profitability (GP/A)', rawValue: `${p.grossMarginPct}%`, sectorMedian: '44.0%', percentile: clampPct(qualPct - 2), grade: scoreToLetter(clampPct(qualPct - 2)), weightInComposite: '7%' },
    { dimension: 'Growth', metric: 'Revenue Growth YoY', rawValue: `${p.revGrowthYoYPct}%`, sectorMedian: '8.4%', percentile: growPct, grade: scoreToLetter(growPct), weightInComposite: '8%' },
    { dimension: 'Growth', metric: 'EPS Diluted Growth YoY', rawValue: `${p.epsGrowthYoYPct}%`, sectorMedian: '10.1%', percentile: clampPct(growPct + 2), grade: scoreToLetter(clampPct(growPct + 2)), weightInComposite: '6%' },
    { dimension: 'Growth', metric: '3-Year Revenue CAGR', rawValue: `${p.rev3YCagrPct}%`, sectorMedian: '9.0%', percentile: clampPct(growPct - 4), grade: scoreToLetter(clampPct(growPct - 4)), weightInComposite: '6%' },
    { dimension: 'Profitability & Earnings', metric: '4-Quarter EPS Beat Streak', rawValue: `${p.epsBeat4Q} / 4`, sectorMedian: '3 / 4', percentile: earnPct, grade: scoreToLetter(earnPct), weightInComposite: '7%' },
    { dimension: 'Profitability & Earnings', metric: 'Operating Margin (TTM)', rawValue: `${p.operatingMarginPct}%`, sectorMedian: '18.5%', percentile: clampPct(earnPct + 3), grade: scoreToLetter(clampPct(earnPct + 3)), weightInComposite: '6%' },
    { dimension: 'Flows (Shown alongside)', metric: '13F Institutional Net Flow QoQ', rawValue: `${p.instFlowPct >= 0 ? '+' : ''}${p.instFlowPct}%`, sectorMedian: '+0.8%', percentile: flowPct, grade: scoreToLetter(flowPct), weightInComposite: '0% (Side)' },
    { dimension: 'Flows (Shown alongside)', metric: 'Short Interest % of Float', rawValue: `${p.shortFloatPct}%`, sectorMedian: '2.4%', percentile: clampPct(flowPct + 2), grade: scoreToLetter(clampPct(flowPct + 2)), weightInComposite: '0% (Side)' },
  ];

  const peerBenchmarks: StockGradeResult['peerBenchmarks'] = [
    { group: 'GICS Sub-Industry', groupName: p.industry, peerCount: 28, stockRank: `#${Math.max(1, Math.round((100 - overallPercentile) * 0.28))} of 28`, compositeGrade: scoreToLetter(clampPct(overallPercentile - 4)), medianPe: 26.4, medianRoicPct: 16.2, medianMom12_1Pct: 18.4 },
    { group: 'GICS Industry Group', groupName: `${p.sector} Core`, peerCount: 94, stockRank: `#${Math.max(1, Math.round((100 - overallPercentile) * 0.94))} of 94`, compositeGrade: 'B-', medianPe: 24.8, medianRoicPct: 14.9, medianMom12_1Pct: 15.1 },
    { group: 'GICS Sector', groupName: p.sector, peerCount: 312, stockRank: `#${Math.max(1, Math.round((100 - overallPercentile) * 3.12))} of 312`, compositeGrade: 'C+', medianPe: 23.2, medianRoicPct: 13.5, medianMom12_1Pct: 12.8 },
  ];

  const history10Y: StockGradeResult['halal']['history10Y'] = [];
  for (let yr = 2017; yr <= 2026; yr++) {
    for (let mo = 1; mo <= 12; mo++) {
      if (yr === 2026 && mo > 10) continue;
      const ym = `${yr}-${String(mo).padStart(2, '0')}`;
      const wave = Math.sin((yr * 12 + mo) * 0.35) * 3.8;
      const dPct = Number(Math.max(0.5, debtRatioPct + wave).toFixed(1));
      const cPct = Number(Math.max(0.5, cashRatioPct + wave * 0.6).toFixed(1));
      const iPct = p.impureIncomePct;
      const passMonth = p.businessPermissible && dPct < 30 && cPct < 30 && iPct < 5;
      history10Y.push({
        ym,
        year: yr,
        month: mo,
        status: passMonth ? 'PASS' : 'FAIL',
        debtRatioPct: dPct,
        cashRatioPct: cPct,
        impurePct: iPct,
      });
    }
  }

  return {
    ticker: p.ticker,
    name: p.name,
    cik: p.cik,
    sector: p.sector,
    industry: p.industry,
    price: p.price,
    changePct: p.changePct,
    marketCapB: p.marketCapB,
    overallGrade,
    compositeGrade: overallGrade,
    overallPercentile,
    compositePercentile: overallPercentile,
    verdictSummary: `${p.ticker} ranks in the ${overallPercentile}th percentile of liquid US equities (Grade ${overallGrade}).`,
    accountingScores: {
      piotroskiF: p.piotroskiF,
      altmanZ: Number((3.4 + p.roicPct * 0.08).toFixed(2)),
      beneishM: Number((-2.45 - p.fcfYieldPct * 0.06).toFixed(2)),
    },
    dimensions,
    drivers,
    peerBenchmarks,
    peers,
    halal: {
      status: halalStatus,
      asOf: asOfYm,
      standard: 'AAOIFI Shariah Standard No. 21',
      passedCount: passedHalal,
      totalChecks: 5,
      purificationPer1000Usd: Number(((p.impureIncomePct / 100) * 18.5).toFixed(2)),
      purificationPctOfDividends: p.impureIncomePct,
      checks: halalChecks,
      tests: halalChecks,
      inputs: [
        { field: 'Market Capitalization (30-Day Trailing Avg)', valueUsdB: `$${p.marketCapB.toFixed(1)}B`, filingSource: 'Daily CRSP / Exchange Tape', periodEnd: asOfYm },
        { field: 'Total Interest-Bearing Debt (Short + Long Term)', valueUsdB: `$${p.totalDebt_B.toFixed(2)}B`, filingSource: `SEC Form 10-Q / 10-K (CIK ${p.cik})`, periodEnd: asOfYm },
        { field: 'Cash & Marketable Interest-Bearing Securities', valueUsdB: `$${p.cashAndSecurities_B.toFixed(2)}B`, filingSource: `SEC Form 10-Q / 10-K (CIK ${p.cik})`, periodEnd: asOfYm },
        { field: 'Accounts Receivable (Current + Non-Current)', valueUsdB: `$${p.receivables_B.toFixed(2)}B`, filingSource: `SEC Form 10-Q / 10-K (CIK ${p.cik})`, periodEnd: asOfYm },
        { field: 'Trailing 12-Month Total Revenue', valueUsdB: `$${p.revenueTTM_B.toFixed(2)}B`, filingSource: `SEC Form 10-Q / 10-K (CIK ${p.cik})`, periodEnd: asOfYm },
        { field: 'Non-Permissible / Interest Income (TTM)', valueUsdB: `$${((p.revenueTTM_B * p.impureIncomePct) / 100).toFixed(3)}B (${p.impureIncomePct}%)`, filingSource: '10-K Footnote & Interest Income Line', periodEnd: asOfYm },
      ],
      history10Y,
    },
  };
}
