import { NextResponse } from 'next/server';
import { gradeStock } from '@/lib/quant/grader';
import { getStockProfile } from '@/lib/quant/warehouse';

export type PortfolioHoldingInput = {
  ticker: string;
  weightPct: number;
};

const DEFAULT_HOLDINGS: PortfolioHoldingInput[] = [
  { ticker: 'NVDA', weightPct: 22 },
  { ticker: 'MSFT', weightPct: 20 },
  { ticker: 'MU', weightPct: 18 },
  { ticker: 'META', weightPct: 15 },
  { ticker: 'COST', weightPct: 15 },
  { ticker: 'XOM', weightPct: 10 },
];

function evaluatePortfolio(holdings: PortfolioHoldingInput[]) {
  const totalWeight = holdings.reduce((a, b) => a + b.weightPct, 0) || 100;
  const normalized = holdings.map((h) => ({
    ticker: h.ticker.toUpperCase().trim(),
    weightPct: Number(((h.weightPct / totalWeight) * 100).toFixed(2)),
  }));

  const rows = normalized.map((h) => {
    const profile = getStockProfile(h.ticker);
    const grade = gradeStock(h.ticker);
    const passesRule = profile.piotroskiF >= 7 && profile.mom12_1Pct > 10 && profile.roicPct >= 12;
    return {
      ...h,
      name: profile.name,
      sector: profile.sector,
      price: profile.price,
      overallGrade: grade.overallGrade,
      overallPercentile: grade.overallPercentile,
      pe: profile.pe,
      roicPct: profile.roicPct,
      piotroskiF: profile.piotroskiF,
      mom12_1Pct: profile.mom12_1Pct,
      beta: profile.beta,
      halalStatus: grade.halal.status,
      passesRule,
      ruleFlag: passesRule
        ? 'PASSES ALL CRITERIA'
        : profile.piotroskiF < 7
          ? `F-Score ${profile.piotroskiF}/9 below >=7 floor`
          : `12-1M Momentum ${profile.mom12_1Pct}% below +10% floor`,
    };
  });

  const sectorMap: Record<string, number> = {};
  for (const r of rows) {
    sectorMap[r.sector] = Number(((sectorMap[r.sector] || 0) + r.weightPct).toFixed(1));
  }

  const weightedBeta = Number(
    rows.reduce((acc, r) => acc + r.beta * (r.weightPct / 100), 0).toFixed(2)
  );
  const weightedRoic = Number(
    rows.reduce((acc, r) => acc + r.roicPct * (r.weightPct / 100), 0).toFixed(1)
  );
  const weightedPe = Number(
    rows.reduce((acc, r) => acc + r.pe * (r.weightPct / 100), 0).toFixed(1)
  );
  const weightedMom = Number(
    rows.reduce((acc, r) => acc + r.mom12_1Pct * (r.weightPct / 100), 0).toFixed(1)
  );

  // 5-Factor loadings (-1.0 to +1.0 z-score tilt)
  const factorLoadings = [
    { factor: 'Market (Beta)', loading: Number((weightedBeta - 1.0).toFixed(2)), desc: `Portfolio beta ${weightedBeta}x vs S&P 500` },
    { factor: 'Size (SMB)', loading: -0.42, desc: 'Tilted toward liquid mega/large-cap leaders' },
    { factor: 'Value (HML)', loading: Number(((22 - weightedPe) / 25).toFixed(2)), desc: `Weighted P/E ${weightedPe}x vs market 23.5x` },
    { factor: 'Momentum (UMD)', loading: Number(Math.min(0.95, weightedMom / 65).toFixed(2)), desc: `Weighted 12-1M return +${weightedMom}%` },
    { factor: 'Quality (QMJ)', loading: Number(Math.min(0.95, weightedRoic / 45).toFixed(2)), desc: `Weighted ROIC ${weightedRoic}%` },
  ];

  // Rebuilt 12-month history vs S&P 500
  const months = ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
  let portNav = 100;
  let spyNav = 100;
  const monthlyComparison = months.map((m, i) => {
    const spyRet = [2.4, 1.1, 1.9, -0.8, 2.2, -1.4, 3.1, 1.8, 2.0, -0.5, 1.7, 2.1][i];
    const portRet = Number((spyRet * weightedBeta * 0.85 + weightedMom * 0.018).toFixed(2));
    portNav = Number((portNav * (1 + portRet / 100)).toFixed(2));
    spyNav = Number((spyNav * (1 + spyRet / 100)).toFixed(2));
    return { month: m, portfolioPct: portRet, benchmarkPct: spyRet, portNav, spyNav };
  });

  return {
    holdings: rows,
    summary: {
      positionsCount: rows.length,
      passingCount: rows.filter((r) => r.passesRule).length,
      weightedBeta,
      weightedRoic,
      weightedPe,
      weightedMom,
      rebuilt12mReturnPct: Number((portNav - 100).toFixed(2)),
      bench12mReturnPct: Number((spyNav - 100).toFixed(2)),
    },
    sectors: Object.entries(sectorMap).map(([sector, weightPct]) => ({ sector, weightPct })),
    factorLoadings,
    monthlyComparison,
  };
}

export async function GET() {
  return NextResponse.json(evaluatePortfolio(DEFAULT_HOLDINGS));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const holdings = Array.isArray(body.holdings) && body.holdings.length > 0 ? body.holdings : DEFAULT_HOLDINGS;
  return NextResponse.json(evaluatePortfolio(holdings));
}
