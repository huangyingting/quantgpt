'use client';

import React from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { OIL_SHOCKS } from '@/lib/quant/warehouse';

export default function OilShocksPage() {
  return (
    <TerminalShell
      title="15 Historical Oil Supply & Geopolitical Shocks (1973–2026)"
      subtitle="Full empirical dataset from /events/oil-shocks.csv with Brent spike magnitude and S&P 500 forward returns"
      actions={
        <a
          href="/events/oil-shocks.csv"
          download
          className="bg-[var(--amber)] px-3 py-1 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
        >
          ⬇ Download oil-shocks.csv
        </a>
      }
    >
      <div className="overflow-x-auto border border-[var(--line)] bg-[var(--surface)]">
        <table className="w-full text-left font-mono-num text-xs">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
              <th className="p-3">#</th>
              {Object.keys(OIL_SHOCKS[0] || { event: 'Event', date: 'Date' }).map((col) => (
                <th key={col} className="p-3">
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {OIL_SHOCKS.map((row, idx) => (
              <tr key={idx} className="hover:bg-[var(--bg)]">
                <td className="p-3 font-bold text-[var(--amber)]">{idx + 1}</td>
                {Object.values(row).map((val, cIdx) => (
                  <td key={cIdx} className="p-3 text-[var(--ink)]">
                    {String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TerminalShell>
  );
}
