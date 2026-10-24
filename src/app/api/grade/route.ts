import { NextResponse } from 'next/server';
import { gradeStock } from '@/lib/quant/grader';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tickersParam = url.searchParams.get('tickers') || url.searchParams.get('ticker') || 'NVDA';
  const asOf = url.searchParams.get('asOf') || undefined;
  const tickers = tickersParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);

  if (tickers.length > 1) {
    return NextResponse.json({
      batch: tickers.map((t) => gradeStock(t, asOf)),
    });
  }
  return NextResponse.json(gradeStock(tickers[0] || 'NVDA', asOf));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ ticker: 'NVDA' }));
  const asOf = body.asOf ? String(body.asOf) : undefined;
  if (Array.isArray(body.tickers)) {
    return NextResponse.json({
      batch: body.tickers.slice(0, 25).map((t: string) => gradeStock(String(t), asOf)),
    });
  }
  return NextResponse.json(gradeStock(String(body.ticker || 'NVDA'), asOf));
}
