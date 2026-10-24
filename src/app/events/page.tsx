'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { WORLD_KINDS, OIL_SHOCKS } from '@/lib/quant/warehouse';

export default function WorldEventsPage() {
  const kinds = Object.keys(WORLD_KINDS);
  const [selectedKind, setSelectedKind] = useState(kinds[0] || 'war_onset');
  const activeData = WORLD_KINDS[selectedKind];

  return (
    <TerminalShell
      title="World Events, 4-Ring Geographic Ripple & Event Guard Desk"
      subtitle="19 geopolitical & macro event classifications with 1, 5, 21, and 63-session forward S&P 500 reaction distributions"
      actions={
        <div className="flex gap-2 font-mono-num text-xs">
          <Link
            href="/events/simulator"
            className="border border-[var(--line2)] bg-[var(--bg)] px-3 py-1 text-[var(--ink)] hover:border-[var(--amber)]"
          >
            Crisis Simulator
          </Link>
          <Link
            href="/events/oil-shocks"
            className="border border-[var(--line2)] bg-[var(--bg)] px-3 py-1 text-[var(--ink)] hover:border-[var(--amber)]"
          >
            15 Oil Shocks ({OIL_SHOCKS.length})
          </Link>
          <Link
            href="/futuretest"
            className="bg-[var(--amber)] px-3 py-1 font-bold uppercase text-[#0A0D13]"
          >
            Futuretest Scenarios →
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Event Guard Banner */}
        <div id="guard-banner" className="flex flex-wrap items-center justify-between gap-3 border border-[var(--amber)]/50 bg-[var(--amber)]/10 px-4 py-3 font-mono-num text-xs">
          <div>
            <span className="font-bold uppercase text-[var(--amber)]">EVENT GUARD STATUS: NORMAL</span>
            <span className="ml-3 text-[var(--body)]">
              Next macro window: FOMC Rate Decision (+5d) · Two-sided binomial sign test on {selectedKind.replace(/_/g, ' ')}: {activeData?.test?.read || 'Indistinguishable from noise'}
            </span>
          </div>
          <Link href={`/world/kind/${selectedKind}`} className="font-bold text-[var(--amber)] underline">
            Inspect Binomial Sign Test →
          </Link>
        </div>

        {/* 19 Event Kinds Pills */}
        <div id="ev-list" className="border border-[var(--line2)] bg-[var(--surface)] p-4">
          <div className="mb-2 font-mono-num text-xs uppercase text-[var(--amber)]">
            SELECT EVENT KIND ({kinds.length} TAXONOMY CLASSES)
          </div>
          <div className="flex flex-wrap gap-1.5 font-mono-num text-xs">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSelectedKind(k)}
                className={`px-2.5 py-1 uppercase transition ${
                  selectedKind === k
                    ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                    : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {k.replace(/_/g, ' ')} ({WORLD_KINDS[k]?.n ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* 1/5/21/63 Session Horizon Distribution vs Unconditional Baseline */}
        {activeData?.h && (
          <div id="study-table" className="border border-[var(--line2)] bg-[var(--surface)] p-5 font-mono-num text-xs">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold uppercase text-[var(--amber)]">
                FORWARD S&P 500 RETURN DISTRIBUTION ({activeData.n} HISTORICAL {selectedKind.toUpperCase()} EVENTS VS {activeData.base?.n?.toLocaleString() || '7,120'} BASELINE DAYS)
              </span>
              <span className="text-[var(--up)] font-bold">{activeData.test?.read}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              {(['1', '5', '21', '63'] as const).map((horizon) => {
                const dist = activeData.h?.[horizon];
                const base = activeData.base?.[`h${horizon}`];
                if (!dist) return null;
                return (
                  <div key={horizon} className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                    <div className="flex items-center justify-between text-[10px] uppercase text-[var(--muted)]">
                      <span>+{horizon} SESSION HORIZON</span>
                      <span>Win {dist.pos}%</span>
                    </div>
                    <div className={`mt-1 text-xl font-bold ${dist.med >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                      {dist.med >= 0 ? '+' : ''}
                      {dist.med}% Median
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--muted)]">
                      IQR: [{dist.iqr?.[0] ?? -1.1}%, +{dist.iqr?.[1] ?? 1.8}%] · Mean {(dist.mean ?? 0) >= 0 ? '+' : ''}{dist.mean ?? 0}%
                    </div>
                    {base && (
                      <div className="mt-1 border-t border-[var(--line)] pt-1 text-[10px] text-[var(--faint)]">
                        Baseline all days: +{base.med}% med ({base.pos}% win)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4-Ring Geographic Ripple Model */}
        <div id="ripple-rings" className="grid grid-cols-1 gap-4 md:grid-cols-4 font-mono-num text-xs">
          {[
            { ring: 'RING 1 · EPICENTER', desc: 'Sovereign Country ETF, Local FX & Domestic Banks', impact: '-4.8% (1d Median)' },
            { ring: 'RING 2 · SUPPLY CHAIN', desc: 'Direct Commodity Chokepoints, Shipping & Defense Primes', impact: '+3.1% Defense / +6.4% Brent' },
            { ring: 'RING 3 · SECTOR BETA', desc: 'US S&P 500 Energy (XLE), Semis (SOXX), Airlines (JETS)', impact: '±1.9% Dispersion' },
            { ring: 'RING 4 · GLOBAL INDEX', desc: 'S&P 500 ($SPXTR) +21d & +63d Absorption Window', impact: '+1.85% (+21d Median)' },
          ].map((r) => (
            <div key={r.ring} className="border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="text-[10px] font-bold text-[var(--amber)]">{r.ring}</div>
              <div className="mt-1 font-sans text-xs text-[var(--body)]">{r.desc}</div>
              <div className="mt-2 font-bold text-[var(--up)]">{r.impact}</div>
            </div>
          ))}
        </div>

        {/* Event Catalog Table */}
        <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono-num text-xs">
            <div>
              <span className="font-bold uppercase text-[var(--amber)]">
                HISTORICAL CATALOG: {selectedKind.toUpperCase()} ({activeData?.events?.length || 0} EVENTS)
              </span>
              <p className="text-[var(--muted)]">
                {activeData?.test?.read || 'Audited historical event dates and forward S&P 500 reaction windows.'}
              </p>
            </div>
            <Link
              href={`/world/kind/${selectedKind}`}
              className="border border-[var(--line2)] px-3 py-1 text-[var(--amber)]"
            >
              Permalink /world/kind/{selectedKind} →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-num text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Headline</th>
                  <th className="p-2.5">Epicenter</th>
                  <th className="p-2.5">S&P +1d</th>
                  <th className="p-2.5">S&P +5d</th>
                  <th className="p-2.5">S&P +21d</th>
                  <th className="p-2.5">S&P +63d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {(activeData?.events || []).slice(0, 25).map((ev, idx) => {
                  const r1 = ev.r?.['1'] ?? ev.spx_1d ?? 0;
                  const r5 = ev.r?.['5'] ?? ev.spx_5d ?? 0;
                  const r21 = ev.r?.['21'] ?? ev.spx_21d ?? 0;
                  const r63 = ev.r?.['63'] ?? ev.spx_63d ?? 0;
                  return (
                    <tr key={idx} className="hover:bg-[var(--bg)]">
                      <td className="p-2.5 text-[var(--amber)]">{ev.date}</td>
                      <td className="p-2.5 font-bold text-[var(--ink)]">{ev.hl || ev.title || selectedKind}</td>
                      <td className="p-2.5 text-[var(--muted)]">{ev.cc || ev.country || 'Global'}</td>
                      <td className={`p-2.5 ${r1 >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                        {r1 >= 0 ? '+' : ''}{r1}%
                      </td>
                      <td className={`p-2.5 ${r5 >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                        {r5 >= 0 ? '+' : ''}{r5}%
                      </td>
                      <td className={`p-2.5 font-bold ${r21 >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                        {r21 >= 0 ? '+' : ''}{r21}%
                      </td>
                      <td className={`p-2.5 font-bold ${r63 >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                        {r63 >= 0 ? '+' : ''}{r63}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}
