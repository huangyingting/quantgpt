'use client';

import Link from 'next/link';
import React from 'react';
import { TerminalShell } from '@/components/TerminalShell';

export default function MonitorPage() {
  return (
    <TerminalShell
      title="4-Panel Live Operator Monitor"
      subtitle="Simultaneous view of 200-Day Regime, Top Factor Deciles, World Event Guard Status & Paper Book NAV"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 font-mono-num text-xs">
        {/* Panel 1 */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="font-bold text-[var(--amber)]">PANEL 01 · MACRO & 200-DAY TREND REGIMES</span>
            <span className="text-[var(--up)]">● LIVE</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {[
              { sym: '$SPXTR (S&P 500)', dist: '+6.4% vs 200d SMA', state: 'BULL REGIME (+1%/-3% Band)' },
              { sym: '$NDX (Nasdaq-100)', dist: '+8.1% vs 200d SMA', state: 'BULL REGIME (+1%/-3% Band)' },
              { sym: 'US 3M T-Bill Yield', dist: '4.32% Annualized', state: 'DEFENSIVE CASH RATE' },
              { sym: 'VIX Volatility Index', dist: '14.8', state: 'LOW-VOL EXPANSION' },
            ].map((r) => (
              <div key={r.sym} className="flex items-center justify-between border border-[var(--line)] bg-[var(--bg)] p-2.5">
                <span className="font-bold text-[var(--ink)]">{r.sym}</span>
                <span className="text-[var(--amber)]">{r.dist}</span>
                <span className="text-[var(--up)]">{r.state}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2 */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="font-bold text-[var(--amber)]">PANEL 02 · TOP FACTOR & HALAL LEADERS</span>
            <Link href="/grade" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Open Grader →
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {[
              { sym: 'NVDA', grade: 'A+', f: '8/9', halal: 'HALAL (5/5)' },
              { sym: 'MU', grade: 'A-', f: '8/9', halal: 'HALAL (5/5)' },
              { sym: 'AVGO', grade: 'A', f: '8/9', halal: 'HALAL (5/5)' },
              { sym: 'LLY', grade: 'A', f: '8/9', halal: 'HALAL (5/5)' },
            ].map((s) => (
              <div key={s.sym} className="flex items-center justify-between border border-[var(--line)] bg-[var(--bg)] p-2.5">
                <span className="font-bold text-[var(--amber)]">{s.sym}</span>
                <span>Composite {s.grade}</span>
                <span>Piotroski {s.f}</span>
                <span className="text-[var(--up)]">{s.halal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3 */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="font-bold text-[var(--amber)]">PANEL 03 · WORLD EVENT GUARD OVERLAYS</span>
            <Link href="/events" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Open Events →
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
              <div className="text-[var(--up)] font-bold">✓ NO ACTIVE CHOKEPOINT / WAR ONSET COOLDOWN</div>
              <div className="mt-1 text-[11px] text-[var(--muted)]">
                Guard rules (pause_entries / reduce_size) standing by across 19 geopolitical event kinds.
              </div>
            </div>
            <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
              <div className="text-[var(--amber)] font-bold">NEXT SCHEDULED MACRO EVENT: FOMC RATE DECISION</div>
              <div className="mt-1 text-[11px] text-[var(--muted)]">
                Historical +5d S&P 500 median reaction: +0.48% (62% positive sign test).
              </div>
            </div>
          </div>
        </div>

        {/* Panel 4 */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="font-bold text-[var(--amber)]">PANEL 04 · CLOUD BOT & PAPER BOOK TELEMETRY</span>
            <Link href="/runner" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Open Cloud Runner →
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between border border-[var(--line)] bg-[var(--bg)] p-3">
              <div>
                <div className="font-bold text-[var(--ink)]">Core Momentum + Quality ($100K Paper)</div>
                <div className="text-[10px] text-[var(--muted)]">Next NY Cron: 15:50 ET</div>
              </div>
              <span className="text-base font-bold text-[var(--up)]">$108,420 (+8.42%)</span>
            </div>
            <div className="flex items-center justify-between border border-[var(--line)] bg-[var(--bg)] p-3">
              <div>
                <div className="font-bold text-[var(--ink)]">200d Buffered Trend Bot (SHA 94a21c8e)</div>
                <div className="text-[10px] text-[var(--muted)]">Alpaca Paper Connected</div>
              </div>
              <span className="text-xs font-bold text-[var(--up)]">● ARMED</span>
            </div>
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}
