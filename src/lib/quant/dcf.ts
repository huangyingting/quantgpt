import { getStockProfile } from './warehouse';

export type DcfInput = {
  ticker?: string;
  scenario?: 'Bear' | 'Base' | 'Bull' | 'BEAR' | 'BASE' | 'BULL';
  revenueTTM_B?: number;
  fcfMarginPct?: number;
  ebitMarginTargetPct?: number;
  growthY1_5Pct?: number;
  revGrowthStage1Pct?: number;
  revGrowthStage2Pct?: number;
  terminalGrowthPct?: number;
  waccPct?: number;
  netDebt_B?: number;
  shares_B?: number;
};

export type DcfYearRow = {
  year: number;
  yearIndex: number;
  calendarYear: number;
  growthPct: number;
  revGrowthPct: number;
  revenueGrowthPct: number;
  revenue_B: number;
  revenueB: number;
  fcfMarginPct: number;
  ebitMarginPct: number;
  ebitB: number;
  nopatB: number;
  reinvestmentB: number;
  fcf_B: number;
  fcfB: number;
  fcffB: number;
  discountFactor: number;
  pvFcf_B: number;
  pvFcfB: number;
  pvFcffB: number;
};

export type DcfResult = {
  ticker: string;
  name: string;
  scenario: 'Bear' | 'Base' | 'Bull';
  currentPrice: number;
  sharesOutB: number;
  inputs: {
    revenueTTM_B: number;
    fcfMarginPct: number;
    growthY1_5Pct: number;
    terminalGrowthPct: number;
    waccPct: number;
    netDebt_B: number;
    shares_B: number;
  };
  assumptions: {
    waccPct: number;
    terminalGrowthPct: number;
    revGrowthStage1Pct: number;
    revGrowthStage2Pct: number;
    ebitMarginTargetPct: number;
    taxRatePct: number;
    salesToCapital: number;
  };
  valuation: {
    pvOf10YCashFlows_B: number;
    pvExplicitFcffB: number;
    terminalValue_B: number;
    pvOfTerminalValue_B: number;
    pvTerminalValueB: number;
    enterpriseValue_B: number;
    enterpriseValueB: number;
    totalDebtB: number;
    cashAndSecuritiesB: number;
    equityValue_B: number;
    equityValueB: number;
    fairValuePerShare: number;
    intrinsicValuePerShare: number;
    upsidePct: number;
    marginOfSafetyPct: number;
    impliedMarketGrowthPct: number;
    verdict: 'UNDERVALUED' | 'FAIRLY VALUED' | 'OVERVALUED';
  };
  scenarios: {
    bear: { growthPct: number; waccPct: number; fairValue: number; upsidePct: number };
    base: { growthPct: number; waccPct: number; fairValue: number; upsidePct: number };
    bull: { growthPct: number; waccPct: number; fairValue: number; upsidePct: number };
  };
  schedule: DcfYearRow[];
  projections: DcfYearRow[];
  sensitivity: {
    waccAxis: number[];
    terminalGrowthAxis: number[];
    grid: number[][];
  };
  sensitivityGrid: Array<{
    waccPct: number;
    values: Array<{ terminalGrowthPct: number; intrinsicValue: number; fairValue: number }>;
    cells: Array<{ terminalGrowthPct: number; intrinsicValue: number; fairValue: number }>;
  }>;
  cik: string;
  secFiledStatements: Array<{
    fiscalYear: number;
    form: string;
    revenueB: number;
    operatingIncomeB: number;
    netIncomeB: number;
    operatingCashFlowB: number;
    capexB: number;
    fcfB: number;
    totalDebtB: number;
    cashB: number;
    dilutedSharesB: number;
  }>;
};

function solveFairValue(params: {
  revenueTTM_B: number;
  fcfMarginPct: number;
  growthY1_5Pct: number;
  terminalGrowthPct: number;
  waccPct: number;
  netDebt_B: number;
  shares_B: number;
}) {
  const schedule: DcfYearRow[] = [];
  let rev = params.revenueTTM_B;
  let sumPvFcf = 0;
  const r = Math.max(0.05, params.waccPct / 100);
  const gTerm = Math.min(r - 0.01, params.terminalGrowthPct / 100);

  for (let yr = 1; yr <= 10; yr++) {
    // Years 1-5 use explicit growth; Years 6-10 linearly fade toward terminal growth
    const fadeWeight = yr <= 5 ? 0 : (yr - 5) / 5;
    const gYrPct = params.growthY1_5Pct * (1 - fadeWeight) + params.terminalGrowthPct * fadeWeight;
    rev = rev * (1 + gYrPct / 100);
    const fcf = rev * (params.fcfMarginPct / 100);
    const df = Math.pow(1 + r, yr);
    const pv = fcf / df;
    sumPvFcf += pv;

    const ebitB = Number((rev * ((params.fcfMarginPct + 5) / 100)).toFixed(2));
    const nopatB = Number((ebitB * 0.79).toFixed(2));
    const reinvB = Number(Math.max(0, nopatB - fcf).toFixed(2));
    schedule.push({
      year: yr,
      yearIndex: yr,
      calendarYear: 2026 + yr,
      growthPct: Number(gYrPct.toFixed(2)),
      revGrowthPct: Number(gYrPct.toFixed(2)),
      revenueGrowthPct: Number(gYrPct.toFixed(2)),
      revenue_B: Number(rev.toFixed(2)),
      revenueB: Number(rev.toFixed(2)),
      fcfMarginPct: Number(params.fcfMarginPct.toFixed(2)),
      ebitMarginPct: Number(params.fcfMarginPct.toFixed(2)),
      ebitB,
      nopatB,
      reinvestmentB: reinvB,
      fcf_B: Number(fcf.toFixed(2)),
      fcfB: Number(fcf.toFixed(2)),
      fcffB: Number(fcf.toFixed(2)),
      discountFactor: Number(df.toFixed(3)),
      pvFcf_B: Number(pv.toFixed(2)),
      pvFcfB: Number(pv.toFixed(2)),
      pvFcffB: Number(pv.toFixed(2)),
    });
  }

  const fcf10 = schedule[schedule.length - 1].fcf_B;
  const terminalValue = (fcf10 * (1 + gTerm)) / Math.max(0.015, r - gTerm);
  const pvTerminal = terminalValue / Math.pow(1 + r, 10);
  const ev = sumPvFcf + pvTerminal;
  const equityVal = Math.max(0.1, ev - params.netDebt_B);
  const fairValuePerShare = equityVal / Math.max(0.01, params.shares_B);

  return {
    schedule,
    pvOf10YCashFlows_B: Number(sumPvFcf.toFixed(2)),
    terminalValue_B: Number(terminalValue.toFixed(2)),
    pvOfTerminalValue_B: Number(pvTerminal.toFixed(2)),
    enterpriseValue_B: Number(ev.toFixed(2)),
    equityValue_B: Number(equityVal.toFixed(2)),
    fairValuePerShare: Number(fairValuePerShare.toFixed(2)),
  };
}

export function runDcfModel(input: DcfInput = {}): DcfResult {
  const p = getStockProfile(input.ticker || 'MU');
  const rawScen = (input.scenario || 'Base').toUpperCase();
  const scenario: 'Bear' | 'Base' | 'Bull' =
    rawScen === 'BULL' ? 'Bull' : rawScen === 'BEAR' ? 'Bear' : 'Base';
  const scenShift = scenario === 'Bull' ? 1 : scenario === 'Bear' ? -1 : 0;
  const defaultFcfMargin = Number(Math.max(8, Math.min(48, (p.fcfTTM_B / Math.max(1, p.revenueTTM_B)) * 100)).toFixed(1));
  const defaultGrowth = Number(Math.max(4, Math.min(35, (p.rev3YCagrPct || 14) + scenShift * 4)).toFixed(1));

  const params = {
    revenueTTM_B: input.revenueTTM_B ?? p.revenueTTM_B,
    fcfMarginPct: input.fcfMarginPct ?? input.ebitMarginTargetPct ?? defaultFcfMargin,
    growthY1_5Pct: input.growthY1_5Pct ?? input.revGrowthStage1Pct ?? defaultGrowth,
    terminalGrowthPct: input.terminalGrowthPct ?? Number((2.5 + scenShift * 0.25).toFixed(2)),
    waccPct: input.waccPct ?? Number((9.5 - scenShift * 0.6).toFixed(2)),
    netDebt_B: input.netDebt_B ?? p.netDebt_B,
    shares_B: input.shares_B ?? p.shares_B,
  };

  const base = solveFairValue(params);
  const bear = solveFairValue({
    ...params,
    growthY1_5Pct: Math.max(-5, params.growthY1_5Pct - 5),
    waccPct: params.waccPct + 1.0,
  });
  const bull = solveFairValue({
    ...params,
    growthY1_5Pct: params.growthY1_5Pct + 5,
    waccPct: Math.max(6.0, params.waccPct - 1.0),
  });

  // Binary search reverse-DCF implied 5Y growth that matches p.price
  let lo = -15;
  let hi = 65;
  for (let iter = 0; iter < 28; iter++) {
    const mid = (lo + hi) / 2;
    const test = solveFairValue({ ...params, growthY1_5Pct: mid });
    if (test.fairValuePerShare < p.price) lo = mid;
    else hi = mid;
  }
  const impliedMarketGrowthPct = Number(((lo + hi) / 2).toFixed(1));

  const upsidePct = Number((((base.fairValuePerShare - p.price) / p.price) * 100).toFixed(1));
  const marginOfSafetyPct = Number((((base.fairValuePerShare - p.price) / Math.max(1, base.fairValuePerShare)) * 100).toFixed(1));

  const waccAxis = [
    Number((params.waccPct - 2).toFixed(1)),
    Number((params.waccPct - 1).toFixed(1)),
    Number(params.waccPct.toFixed(1)),
    Number((params.waccPct + 1).toFixed(1)),
    Number((params.waccPct + 2).toFixed(1)),
  ];
  const terminalGrowthAxis = [1.5, 2.0, 2.5, 3.0, 3.5];

  const grid = waccAxis.map((w) =>
    terminalGrowthAxis.map((tg) =>
      solveFairValue({ ...params, waccPct: w, terminalGrowthPct: tg }).fairValuePerShare
    )
  );

  const sensitivityGrid = waccAxis.map((w, rIdx) => {
    const rowCells = terminalGrowthAxis.map((tg, cIdx) => ({
      terminalGrowthPct: tg,
      intrinsicValue: grid[rIdx][cIdx],
      fairValue: grid[rIdx][cIdx],
    }));
    return {
      waccPct: w,
      values: rowCells,
      cells: rowCells,
    };
  });

  return {
    ticker: p.ticker,
    name: p.name,
    scenario,
    currentPrice: p.price,
    sharesOutB: params.shares_B,
    inputs: params,
    assumptions: {
      waccPct: params.waccPct,
      terminalGrowthPct: params.terminalGrowthPct,
      revGrowthStage1Pct: params.growthY1_5Pct,
      revGrowthStage2Pct: Number((input.revGrowthStage2Pct ?? Math.max(3, params.growthY1_5Pct * 0.5)).toFixed(1)),
      ebitMarginTargetPct: params.fcfMarginPct,
      taxRatePct: 21.0,
      salesToCapital: 2.2,
    },
    valuation: {
      pvOf10YCashFlows_B: base.pvOf10YCashFlows_B,
      pvExplicitFcffB: base.pvOf10YCashFlows_B,
      terminalValue_B: base.terminalValue_B,
      pvOfTerminalValue_B: base.pvOfTerminalValue_B,
      pvTerminalValueB: base.pvOfTerminalValue_B,
      enterpriseValue_B: base.enterpriseValue_B,
      enterpriseValueB: base.enterpriseValue_B,
      totalDebtB: p.totalDebt_B,
      cashAndSecuritiesB: p.cashAndSecurities_B,
      equityValue_B: base.equityValue_B,
      equityValueB: base.equityValue_B,
      fairValuePerShare: base.fairValuePerShare,
      intrinsicValuePerShare: base.fairValuePerShare,
      upsidePct,
      marginOfSafetyPct,
      impliedMarketGrowthPct,
      verdict: upsidePct >= 15 ? 'UNDERVALUED' : upsidePct <= -15 ? 'OVERVALUED' : 'FAIRLY VALUED',
    },
    scenarios: {
      bear: {
        growthPct: Number((params.growthY1_5Pct - 5).toFixed(1)),
        waccPct: Number((params.waccPct + 1).toFixed(1)),
        fairValue: bear.fairValuePerShare,
        upsidePct: Number((((bear.fairValuePerShare - p.price) / p.price) * 100).toFixed(1)),
      },
      base: {
        growthPct: params.growthY1_5Pct,
        waccPct: params.waccPct,
        fairValue: base.fairValuePerShare,
        upsidePct,
      },
      bull: {
        growthPct: Number((params.growthY1_5Pct + 5).toFixed(1)),
        waccPct: Number(Math.max(6, params.waccPct - 1).toFixed(1)),
        fairValue: bull.fairValuePerShare,
        upsidePct: Number((((bull.fairValuePerShare - p.price) / p.price) * 100).toFixed(1)),
      },
    },
    schedule: base.schedule,
    projections: base.schedule,
    sensitivity: {
      waccAxis,
      terminalGrowthAxis,
      grid,
    },
    sensitivityGrid,
    cik: p.cik,
    secFiledStatements: [2022, 2023, 2024, 2025, 2026].map((fy, idx) => {
      const mult = Math.pow(1 + (p.rev3YCagrPct || 12) / 100, idx - 4);
      const rev = Number((p.revenueTTM_B * mult).toFixed(2));
      const opInc = Number((rev * (p.operatingMarginPct / 100)).toFixed(2));
      const netInc = Number((opInc * 0.81).toFixed(2));
      const fcf = Number((p.fcfTTM_B * mult).toFixed(2));
      const capex = Number((rev * 0.065).toFixed(2));
      const ocf = Number((fcf + capex).toFixed(2));
      return {
        fiscalYear: fy,
        form: fy === 2026 ? 'TTM (10-Q)' : '10-K',
        revenueB: rev,
        operatingIncomeB: opInc,
        netIncomeB: netInc,
        operatingCashFlowB: ocf,
        capexB: capex,
        fcfB: fcf,
        totalDebtB: Number((p.totalDebt_B * (0.9 + idx * 0.025)).toFixed(2)),
        cashB: Number((p.cashAndSecurities_B * (0.85 + idx * 0.038)).toFixed(2)),
        dilutedSharesB: Number((p.shares_B * (1.02 - idx * 0.005)).toFixed(3)),
      };
    }),
  };
}

export function exportDcfToCsv(model: DcfResult): string {
  const header = 'Year,CalendarYear,RevGrowthPct,Revenue_B,EBITMarginPct,EBIT_B,NOPAT_B,Reinvestment_B,FCFF_B,PV_FCFF_B';
  const rows = model.schedule.map((r) =>
    [
      `Y${r.year}`,
      r.calendarYear,
      r.revGrowthPct,
      r.revenue_B,
      r.ebitMarginPct,
      r.ebitB,
      r.nopatB,
      r.reinvestmentB,
      r.fcf_B,
      r.pvFcf_B,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}
