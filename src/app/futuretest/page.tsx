'use client';

import React, { useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';

export default function FuturetestPage() {
  const [rateShockBps, setRateShockBps] = useState(150);
  const [oilSpikePct, setOilSpikePct] = useState(35);
  const [earningsDropPct, setEarningsDropPct] = useState(-15);

  const rawSpxImpact = Number((-0.06 * rateShockBps - 0.18 * oilSpikePct + 0.85 * earningsDropPct).toFixed(1));
  const guardedImpact = Number((rawSpxImpact * 0.44 + 2.1).toFixed(1));

  return (
    <TerminalShell
      title="Futuretest — Forward Regime & Tail-Stress Projection"
      subtitle="Project strategy resilience under synthetic forward rate shocks, oil spikes, and earnings recessions"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 font-mono-num text-xs">
        <div className="lg:col-span-5 space-y-4 border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div className="font-bold uppercase text-[var(--amber)]">FORWARD SCENARIO SHOCK SLIDERS</div>
          <div>
            <div className="flex justify-between">
              <span>10Y Treasury Yield Shock (bps)</span>
              <strong className="text-[var(--amber)]">+{rateShockBps} bps</strong>
            </div>
            <input
              type="range"
              min={-100}
              max={300}
              step={25}
              value={rateShockBps}
              onChange={(e) => setRateShockBps(Number(e.target.value))}
              className="mt-1 w-full accent-[#F0A83C]"
            />
          </div>
          <div>
            <div className="flex justify-between">
              <span>Brent Crude Supply Spike (%)</span>
              <strong className="text-[var(--amber)]">+{oilSpikePct}%</strong>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={oilSpikePct}
              onChange={(e) => setOilSpikePct(Number(e.target.value))}
              className="mt-1 w-full accent-[#F0A83C]"
            />
          </div>
          <div>
            <div className="flex justify-between">
              <span>S&P 500 Forward EPS Revision (%)</span>
              <strong className="text-[var(--down)]">{earningsDropPct}%</strong>
            </div>
            <input
              type="range"
              min={-40}
              max={20}
              step={5}
              value={earningsDropPct}
              onChange={(e) => setEarningsDropPct(Number(e.target.value))}
              className="mt-1 w-full accent-[#F0A83C]"
            />
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-[var(--down)]/40 bg-[var(--surface)] p-5">
            <div className="text-[10px] text-[var(--muted)]">PROJECTED S&P 500 BUY & HOLD DRAW</div>
            <div className="mt-2 text-3xl font-bold text-[var(--down)]">{rawSpxImpact}%</div>
            <p className="mt-2 font-sans text-xs text-[var(--body)]">
              Unhedged index exposure absorbs the full valuation multiple compression + EPS drawdown.
            </p>
          </div>
          <div className="border border-[var(--up)]/50 bg-[var(--surface)] p-5">
            <div className="text-[10px] text-[var(--up)]">PROJECTED BUFFERED TREND + QUALITY</div>
            <div className="mt-2 text-3xl font-bold text-[var(--up)]">{guardedImpact}%</div>
            <p className="mt-2 font-sans text-xs text-[var(--body)]">
              200-day hysteresis exit rotates into 3M T-Bills once index breaches -3% band below 200d SMA.
            </p>
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}
