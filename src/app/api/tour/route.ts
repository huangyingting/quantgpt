import { NextResponse } from 'next/server';
import { TOUR_DATA } from '@/lib/quant/warehouse';

export async function GET() {
  return NextResponse.json(TOUR_DATA);
}
