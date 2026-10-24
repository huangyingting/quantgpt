import { NextResponse } from 'next/server';
import { runDcfModel, type DcfInput } from '@/lib/quant/dcf';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ticker = url.searchParams.get('ticker') || 'MU';
  return NextResponse.json(runDcfModel({ ticker }));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DcfInput;
  return NextResponse.json(runDcfModel(body));
}
