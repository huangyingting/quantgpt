import { NextResponse } from 'next/server';
import { OIL_SHOCKS } from '@/lib/quant/warehouse';

export async function GET() {
  const cols = ['date', 'event', 'category', 'wti_shock_pct', 'spx_1d', 'spx_5d', 'spx_21d', 'spx_63d', 'spx_252d'];
  const lines = [cols.join(',')];
  for (const row of OIL_SHOCKS) {
    const vals = cols.map((c) => {
      const v = String(row[c] ?? '').replace(/"/g, '""');
      return v.includes(',') ? `"${v}"` : v;
    });
    lines.push(vals.join(','));
  }
  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="oil-shocks.csv"',
    },
  });
}
