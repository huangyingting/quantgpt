import { NextResponse } from 'next/server';
import { WORLD_KINDS, OIL_SHOCKS } from '@/lib/quant/warehouse';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kind = url.searchParams.get('kind');
  if (kind && WORLD_KINDS[kind]) {
    return NextResponse.json(WORLD_KINDS[kind]);
  }
  return NextResponse.json({
    kindsCount: Object.keys(WORLD_KINDS).length,
    kinds: Object.entries(WORLD_KINDS).map(([k, v]) => ({
      kind: k,
      name: v.name || k.replace(/_/g, ' '),
      category: v.category || 'geopolitical',
      count: Array.isArray(v.events) ? v.events.length : v.count || 0,
      stats: v.stats || {},
      events: Array.isArray(v.events) ? v.events.slice(0, 12) : [],
    })),
    oilShocks: OIL_SHOCKS,
  });
}
