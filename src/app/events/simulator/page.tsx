'use client';

import React, { useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';

const CRISIS_EPOCHS = [
  { id: '1973_oil', name: '1973–74 OPEC Oil Embargo & Stagflation', spxDd: -48.2, trendDd: -19.4, tbillGain: '+11.8%', recoveryMonths: 69 },
  { id: '1987_crash', name: '1987 Black Monday Crash (-20.4% in 1 Day)', spxDd: -33.5, trendDd: -16.1, tbillGain: '+6.2%', recoveryMonths: 20 },
  { id: '2000_dotcom', name: '2000–02 Dot-Com Bust & 9/11 Shock', spxDd: -49.1, trendDd: -21.8, tbillGain: '+12.4%', recoveryMonths: 56 },
  { id: '2008_gfc', name: '2007–09 Global Financial Crisis (Lehman)', spxDd: -56.8, trendDd: -24.5, tbillGain: '+4.9%', recoveryMonths: 49 },
  { id: '2020_covid', name: '2020 COVID-19 Liquidity Shock', spxDd: -33.9, trendDd: -18.2, tbillGain: '+0.8%', recoveryMonths: 5 },
  { id: '2022_rates', name: '2022 Fed +425 bps Rate Hike & Ukraine War', spxDd: -25.4, trendDd: -12.9, tbillGain: '+3.1%', recoveryMonths: 19 },
];

export default function CrisisSimulatorPage() {
  const [selected, setSelected] = useState(CRISIS_EPOCHS[3]);
  const [portfolioValue, setPortfolioValue] = useState(250000);

  const rawLoss = Math.round(portfolioValue * (selected.spxDd / 100));
  const guardedLoss = Math.round(portfolioValue * (selected.trendDd / 100));
  const capitalSaved = Math.abs(rawLoss - guardedLoss);

  return (
    <TerminalShell
      title="Historical Crisis Replay Simulator"
      subtitle="Replay your portfolio through 1973 Stagflation, 1987 Black Monday, 2000 Dot-Com, 2008 GFC, 2020 COVID & 2022 Rate Shock"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 font-mono-num text-xs">
          {CRISIS_EPOCHS.map((ep) => (
            <button
              key={ep.id}
              type="button"
              onClick={() => setSelected(ep)}
              className={`border p-4 text-left transition ${
                selected.id === ep.id
                  ? 'border-[var(--amber)] bg-[var(--amber)]/15'
                  : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line2)]'
              }`}
            >
              <div className="font-bold text-[var(--ink)]">{ep.name}</div>
              <div className="mt-1 flex justify-between text-[11px]">
                <span className="text-[var(--down)]">Raw S&P: {ep.spxDd}%</span>
                <span className="text-[var(--up)]">Buffered 200d: {ep.trendDd}%</span>
              </div>
            </button>
          ))}
        </div>

        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4 font-mono-num text-xs">
            <div>
              <div className="text-[var(--amber)]">ACTIVE CRISIS REPLAY</div>
              <h2 className="mt-1 font-cond text-3xl font-bold uppercase text-[var(--ink)]">{selected.name}</h2>
            </div>
            <div>
              <label className="block text-[10px] text-[var(--muted)]">PORTFOLIO SIZE ($ USD)</label>
              <input
                type="number"
                step={25000}
                value={portfolioValue}
                onChange={(e) => setPortfolioValue(Number(e.target.value))}
                className="mt-1 border border-[var(--line2)] bg-[var(--field)] px-3 py-1.5 font-bold text-[var(--amber)]"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-4 font-mono-num">
            <div className="border border-[var(--down)]/40 bg-[var(--bg)] p-4">
              <div className="text-[10px] text-[var(--muted)]">UNHEDGED BUY & HOLD LOSS</div>
              <div className="mt-1 text-2xl font-bold text-[var(--down)]">
                -${Math.abs(rawLoss).toLocaleString()} ({selected.spxDd}%)
              </div>
            </div>
            <div className="border border-[var(--amber)]/40 bg-[var(--bg)] p-4">
              <div className="text-[10px] text-[var(--muted)]">BUFFERED 200D + EVENT GUARD</div>
              <div className="mt-1 text-2xl font-bold text-[var(--amber)]">
                -${Math.abs(guardedLoss).toLocaleString()} ({selected.trendDd}%)
              </div>
            </div>
            <div className="border border-[var(--up)]/50 bg-[var(--bg)] p-4">
              <div className="text-[10px] text-[var(--up)]">CAPITAL PRESERVED</div>
              <div className="mt-1 text-2xl font-bold text-[var(--up)]">
                +${capitalSaved.toLocaleString()}
              </div>
            </div>
            <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
              <div className="text-[10px] text-[var(--muted)]">RAW RECOVERY TIME</div>
              <div className="mt-1 text-2xl font-bold text-[var(--ink)]">
                {selected.recoveryMonths} Months
              </div>
            </div>
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}
