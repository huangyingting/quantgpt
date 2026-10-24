import { NextResponse } from 'next/server';
import { runParameterSweep } from '@/lib/quant/backtester';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const splitYear = Number(url.searchParams.get('splitYear') || 2015);
  return NextResponse.json(runParameterSweep({ splitYear }));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(runParameterSweep(body));
}
