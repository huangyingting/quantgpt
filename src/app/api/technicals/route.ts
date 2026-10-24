import { NextResponse } from 'next/server';
import { computeTechnicals } from '@/lib/quant/technicals';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ticker = url.searchParams.get('ticker') || 'NVDA';
  const range = (url.searchParams.get('range') || '1Y') as '3M' | '6M' | '1Y' | '2Y' | '5Y';
  return NextResponse.json(computeTechnicals(ticker, range));
}
