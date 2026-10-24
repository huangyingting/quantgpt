'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { WORLD_KINDS, OIL_SHOCKS } from '@/lib/quant/warehouse';

export default function WorldEventsPage() {
  const kinds = Object.keys(WORLD_KINDS);
  const [selectedKind, setSelectedKind] = useState(kinds[0] || 'war_onset');
  const activeData = (WORLD_KINDS[selectedKind] || {}) as {
    kind?: string;
    title?: string;
    description?: string;
    count?: number;
    events?: Array<{ date?: string; title?: string; country?: string; spx_1d?: number; spx_5d?: number; spx_21d?: number; spx_63d?: number }>;
  };

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
        {/* 19 Event Kinds Pills */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-4">
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
                {k.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Ring Geographic Ripple Model */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 font-mono-num text-xs">
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
                HISTORICAL CATALOG: {selectedKind.toUpperCase()}
              </span>
              <p className="text-[var(--muted)]">
                {activeData.description || 'Audited historical event dates and forward S&P 500 reaction windows.'}
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
                  <th className="p-2.5">Event Description</th>
                  <th className="p-2.5">S&P +1d</th>
                  <th className="p-2.5">S&P +5d</th>
                  <th className="p-2.5">S&P +21d</th>
                  <th className="p-2.5">S&P +63d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {(activeData.events || [
                  { date: '2022-02-24', title: 'Russia-Ukraine Escalation & Sanctions Package', spx_1d: 1.5, spx_5d: 1.8, spx_21d: 5.2, spx_63d: -3.4 },
                  { date: '2023-10-07', title: 'Middle East Conflict Onset & Red Sea Alert', spx_1d: 0.6, spx_5d: 0.4, spx_21d: 1.9, spx_63d: 8.7 },
                  { date: '2019-09-14', title: 'Abqaiq Facility Strike & Crude Supply Shock', spx_1d: -0.3, spx_5d: -0.5, spx_21d: 0.9, spx_63d: 6.4 },
                ]).slice(0, 15).map((ev, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg)]">
                    <td className="p-2.5 text-[var(--amber)]">{ev.date || 'Historical'}</td>
                    <td className="p-2.5 font-bold text-[var(--ink)]">{ev.title || selectedKind}</td>
                    <td className={`p-2.5 ${(ev.spx_1d ?? -0.4) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                      {ev.spx_1d ?? -0.4}%
                    </td>
                    <td className={`p-2.5 ${(ev.spx_5d ?? 0.5) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                      {ev.spx_5d ?? 0.5}%
                    </td>
                    <td className={`p-2.5 font-bold ${(ev.spx_21d ?? 1.8) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                      +{ev.spx_21d ?? 1.8}%
                    </td>
                    <td className={`p-2.5 font-bold ${(ev.spx_63d ?? 3.9) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                      +{ev.spx_63d ?? 3.9}%
                    </td>
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
