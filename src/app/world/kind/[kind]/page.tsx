'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { WORLD_KINDS } from '@/lib/quant/warehouse';

export default function WorldKindDetailPage() {
  const params = useParams<{ kind: string }>();
  const kind = String(params?.kind || 'war_onset');
  const data = WORLD_KINDS[kind] || WORLD_KINDS.war_onset;

  return (
    <TerminalShell
      title={`Event Kind Study: ${kind.toUpperCase()}`}
      subtitle="Historical event catalog, two-sided binomial sign test, and S&P 500 1/5/21/63-session reaction distribution"
      actions={
        <Link
          href="/world/kinds"
          className="border border-[var(--line2)] bg-[var(--bg)] px-3 py-1 font-mono-num text-xs text-[var(--muted)]"
        >
          ← All 19 Event Kinds
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono-num text-xs">
            <span className="uppercase text-[var(--amber)]">
              WAREHOUSE EVENT TAXONOMY · /world/kind/{kind} · {data?.n ?? 0} HISTORICAL INSTANCES
            </span>
            <span className="border border-[var(--up)]/50 bg-[var(--up)]/15 px-2.5 py-1 font-bold text-[var(--up)]">
              p-value = {data?.test?.h?.['21']?.p_value ?? 0.5} · {data?.test?.read}
            </span>
          </div>
          <h2 className="mt-2 font-cond text-3xl font-bold uppercase text-[var(--ink)]">
            {kind.replace(/_/g, ' ')} — Empirical S&P 500 Reaction Study
          </h2>

          {data?.h && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4 font-mono-num text-xs">
              {(['1', '5', '21', '63'] as const).map((horizon) => {
                const dist = data.h?.[horizon];
                const base = data.base?.[`h${horizon}`];
                if (!dist) return null;
                return (
                  <div key={horizon} className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                    <div className="text-[10px] uppercase text-[var(--muted)]">+{horizon} TRADING DAYS</div>
                    <div className={`mt-1 text-xl font-bold ${dist.med >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                      {dist.med >= 0 ? '+' : ''}{dist.med}% Median
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--muted)]">
                      Win {dist.pos ?? 55}% · IQR [{dist.iqr?.[0] ?? -1.1}%, +{dist.iqr?.[1] ?? 1.8}%]
                    </div>
                    {base && (
                      <div className="mt-1 text-[10px] text-[var(--faint)]">
                        Unconditional Baseline: +{base.med}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left font-mono-num text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Headline</th>
                  <th className="p-2.5">Epicenter</th>
                  <th className="p-2.5">+1d</th>
                  <th className="p-2.5">+5d</th>
                  <th className="p-2.5">+21d</th>
                  <th className="p-2.5">+63d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {(data?.events || []).map((ev, i) => (
                  <tr key={i} className="hover:bg-[var(--bg)]">
                    <td className="p-2.5 text-[var(--amber)]">{ev.date}</td>
                    <td className="p-2.5 font-bold text-[var(--ink)]">{ev.hl || ev.title}</td>
                    <td className="p-2.5 text-[var(--muted)]">{ev.cc || ev.country || 'Global'}</td>
                    <td className="p-2.5">{ev.r?.['1'] ?? ev.spx_1d ?? 0}%</td>
                    <td className="p-2.5">{ev.r?.['5'] ?? ev.spx_5d ?? 0}%</td>
                    <td className="p-2.5 font-bold text-[var(--up)]">{ev.r?.['21'] ?? ev.spx_21d ?? 0}%</td>
                    <td className="p-2.5 font-bold text-[var(--up)]">{ev.r?.['63'] ?? ev.spx_63d ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}
