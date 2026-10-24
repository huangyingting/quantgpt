import { NextResponse } from 'next/server';
import { runBacktest, type BacktestRequest } from '@/lib/quant/backtester';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const presetId = url.searchParams.get('presetId') || url.searchParams.get('id') || 'mom_01';
  const benchmark = (url.searchParams.get('benchmark') || '$SPXTR') as BacktestRequest['benchmark'];
  const startYear = Number(url.searchParams.get('startYear') || 1998);
  const splitYear = Number(url.searchParams.get('splitYear') || 2015);
  const costBps = Number(url.searchParams.get('costBps') || 10);
  const engine = (url.searchParams.get('engine') || undefined) as BacktestRequest['engine'];

  const result = runBacktest({ presetId, benchmark, startYear, splitYear, costBps, engine });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BacktestRequest;
    const result = runBacktest(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(runBacktest({}));
  }
}
