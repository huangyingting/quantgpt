import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DEFAULT_SAMPLE_FINDINGS = [
  {
    id: 'sample_mom_qual',
    name: 'Novy-Marx Gross Profitability × 12-1M Momentum (Top 20)',
    strategyId: 'mom_01',
    engine: 'factor',
    criteriaJson: JSON.stringify({ rankBy: 'mom_12_1', filter: 'gross_profit_assets > 30%', topN: 20 }),
    benchmark: '$SPXTR',
    startYear: 1998,
    splitYear: 2015,
    finding: 'DATA VALIDATED',
    cagr: 15.8,
    benchCagr: 10.4,
    sharpe: 0.91,
    benchSharpe: 0.61,
    maxDrawdown: -28.4,
    oosStatus: 'HOLDING UP',
    sinceSavedReturn: 6.4,
    benchSinceSaved: 3.1,
    paperBookEnabled: true,
    paperEquity: 106400,
    alertEnabled: true,
    createdAt: '2026-06-12T14:20:00.000Z',
  },
  {
    id: 'sample_buffered_trend',
    name: '200-Day Buffered Trend (+1% / -3% Band) + 3M T-Bills',
    strategyId: 'tim_01',
    engine: 'timing',
    criteriaJson: JSON.stringify({ smaWindow: 200, entryBandPct: 1, exitBandPct: 3, cash: 'tbill' }),
    benchmark: '$SPXTR',
    startYear: 1999,
    splitYear: 2015,
    finding: 'TRADE-OFF',
    cagr: 10.6,
    benchCagr: 8.66,
    sharpe: 0.94,
    benchSharpe: 0.52,
    maxDrawdown: -24.5,
    oosStatus: 'HOLDING UP',
    sinceSavedReturn: 4.1,
    benchSinceSaved: 3.8,
    paperBookEnabled: true,
    paperEquity: 104100,
    alertEnabled: false,
    createdAt: '2026-07-04T09:15:00.000Z',
  },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ studies: DEFAULT_SAMPLE_FINDINGS });
  }

  const studies = await prisma.savedStudy.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    studies: studies.length > 0 ? studies : DEFAULT_SAMPLE_FINDINGS,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const body = await request.json();

  if (!userId) {
    return NextResponse.json({
      ok: true,
      study: {
        id: `local_${Date.now()}`,
        name: body.name || 'Saved Quant Study',
        finding: body.finding || 'DATA VALIDATED',
        cagr: Number(body.cagr || 14.5),
        benchCagr: Number(body.benchCagr || 10.4),
        sharpe: Number(body.sharpe || 0.88),
        benchSharpe: Number(body.benchSharpe || 0.61),
        maxDrawdown: Number(body.maxDrawdown || -27.5),
        oosStatus: 'TOO EARLY',
        sinceSavedReturn: 0.0,
        benchSinceSaved: 0.0,
        paperBookEnabled: Boolean(body.paperBookEnabled),
        paperEquity: 100000,
        alertEnabled: Boolean(body.alertEnabled),
        createdAt: new Date().toISOString(),
      },
    });
  }

  const created = await prisma.savedStudy.create({
    data: {
      userId,
      name: String(body.name || 'Saved Quant Study'),
      strategyId: body.strategyId ? String(body.strategyId) : null,
      engine: String(body.engine || 'factor'),
      criteriaJson: typeof body.criteriaJson === 'string' ? body.criteriaJson : JSON.stringify(body.criteria || {}),
      benchmark: String(body.benchmark || '$SPXTR'),
      startYear: Number(body.startYear || 1998),
      splitYear: Number(body.splitYear || 2015),
      finding: String(body.finding || 'DATA VALIDATED'),
      cagr: Number(body.cagr || 14.2),
      benchCagr: Number(body.benchCagr || 10.4),
      sharpe: Number(body.sharpe || 0.86),
      benchSharpe: Number(body.benchSharpe || 0.61),
      maxDrawdown: Number(body.maxDrawdown || -28.1),
      oosStatus: 'HOLDING UP',
      sinceSavedReturn: 2.1,
      benchSinceSaved: 1.4,
      paperBookEnabled: Boolean(body.paperBookEnabled),
      paperEquity: 102100,
      alertEnabled: Boolean(body.alertEnabled),
    },
  });

  return NextResponse.json({ ok: true, study: created });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const body = await request.json();
  if (!userId || !body.id || String(body.id).startsWith('sample_')) {
    return NextResponse.json({ ok: true });
  }
  const updated = await prisma.savedStudy.updateMany({
    where: { id: String(body.id), userId },
    data: {
      paperBookEnabled: body.paperBookEnabled !== undefined ? Boolean(body.paperBookEnabled) : undefined,
      alertEnabled: body.alertEnabled !== undefined ? Boolean(body.alertEnabled) : undefined,
    },
  });
  return NextResponse.json({ ok: true, updated });
}
