'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { STRATEGIES } from '@/lib/quant/warehouse';

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<'ALL' | 'DATA VALIDATED' | 'TRADE-OFF'>('ALL');

  const ranked = STRATEGIES.filter((s) => (filter === 'ALL' ? true : s.verdict === filter))
    .slice()
    .sort((a, b) => b.sharpe - a.sharpe)
    .slice(0, 35);

  return (
    <TerminalShell
      title="Operator & Strategy Leaderboard"
      subtitle="Ranked by post-2015 out-of-sample Sharpe ratio, net CAGR, and 11-check Skeptic survival"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--line2)] bg-[var(--surface)] p-4 font-mono-num text-xs">
          <div className="flex gap-1.5">
            {(['ALL', 'DATA VALIDATED', 'TRADE-OFF'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 ${
                  filter === f ? 'bg-[var(--amber)] font-bold text-[#0A0D13]' : 'border border-[var(--line)] text-[var(--muted)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-[var(--muted)]">Showing top {ranked.length} audited strategies</span>
        </div>

        <div className="overflow-x-auto border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full text-left font-mono-num text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                <th className="p-3">Rank</th>
                <th className="p-3">Strategy</th>
                <th className="p-3">Category</th>
                <th className="p-3">Sharpe</th>
                <th className="p-3">CAGR (98–26)</th>
                <th className="p-3">Max DD</th>
                <th className="p-3">Verdict</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {ranked.map((s, idx) => (
                <tr key={s.id} className="hover:bg-[var(--bg)]">
                  <td className="p-3 font-bold text-[var(--amber)]">#{idx + 1}</td>
                  <td className="p-3 font-bold text-[var(--ink)]">{s.name}</td>
                  <td className="p-3 uppercase text-[var(--muted)]">{s.cat}</td>
                  <td className="p-3 font-bold text-[var(--amber)]">{s.sharpe.toFixed(2)}</td>
                  <td className="p-3 font-bold text-[var(--up)]">{s.cagr.toFixed(2)}%</td>
                  <td className="p-3 text-[var(--down)]">{s.max_dd.toFixed(1)}%</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold ${
                        s.verdict === 'DATA VALIDATED'
                          ? 'bg-[var(--up)]/15 text-[var(--up)]'
                          : 'bg-[var(--amber)]/15 text-[var(--amber)]'
                      }`}
                    >
                      {s.verdict}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/terminal?preset=${encodeURIComponent(s.id)}`}
                      className="text-[var(--amber)] hover:underline"
                    >
                      Load in Desk →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TerminalShell>
  );
}
