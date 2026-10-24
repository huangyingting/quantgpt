import { NextResponse } from 'next/server';
import { gradeStock } from '@/lib/quant/grader';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tickersParam = url.searchParams.get('tickers') || url.searchParams.get('ticker') || 'NVDA';
  const tickers = tickersParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);

  if (tickers.length > 1) {
    return NextResponse.json({
      batch: tickers.map((t) => gradeStock(t)),
    });
  }
  return NextResponse.json(gradeStock(tickers[0] || 'NVDA'));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ ticker: 'NVDA' }));
  if (Array.isArray(body.tickers)) {
    return NextResponse.json({
      batch: body.tickers.slice(0, 25).map((t: string) => gradeStock(String(t))),
    });
  }
  return NextResponse.json(gradeStock(String(body.ticker || 'NVDA')));
}
