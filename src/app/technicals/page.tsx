'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense, useMemo, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { computeTechnicals } from '@/lib/quant/technicals';
import { getKnownTickers } from '@/lib/quant/grader';

function TechnicalsContent() {
  const searchParams = useSearchParams();
  const [ticker, setTicker] = useState(searchParams.get('ticker') || 'NVDA');
  const [signalType, setSignalType] = useState<'golden_cross' | 'rsi_oversold' | 'bb_squeeze' | 'above_sma200'>(
    'above_sma200'
  );

  const report = useMemo(() => computeTechnicals(ticker, signalType), [ticker, signalType]);
  const bars = report.bars.slice(-120);
  const minP = Math.min(...bars.map((b) => b.low));
  const maxP = Math.max(...bars.map((b) => b.high));

  const toX = (i: number) => 40 + (i / Math.max(1, bars.length - 1)) * 830;
  const toY = (p: number) => 205 - ((p - minP) / Math.max(1, maxP - minP)) * 175;

  const closePath = bars.map((b, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(b.close).toFixed(1)}`).join(' ');
  const sma50Path = bars.map((b, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(b.sma50).toFixed(1)}`).join(' ');
  const sma200Path = bars.map((b, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(b.sma200).toFixed(1)}`).join(' ');

  return (
    <TerminalShell
      title="Technicals & Empirical Signal Study"
      subtitle="Interactive price & volatility overlays (SMA 20/50/200, Bollinger Squeeze, RSI, MACD) + historical forward-return study"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--line2)] bg-[var(--surface)] p-4 font-mono-num text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--muted)]">TICKER:</span>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-24 border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5 font-bold uppercase text-[var(--amber)]"
            />
            {getKnownTickers().slice(0, 8).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTicker(t)}
                className={`border px-2 py-1 ${
                  ticker === t ? 'border-[var(--amber)] bg-[var(--amber)]/15 text-[var(--amber)] font-bold' : 'border-[var(--line)] text-[var(--muted)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)]">SIGNAL STUDY:</span>
            <select
              aria-label="Select technical signal study"
              value={signalType}
              onChange={(e) => setSignalType(e.target.value as typeof signalType)}
              className="border border-[var(--line2)] bg-[var(--field)] px-3 py-1.5 text-[var(--amber)]"
            >
              <option value="above_sma200">Close &gt; 200-Day SMA Trend</option>
              <option value="golden_cross">50d / 200d Golden Cross</option>
              <option value="rsi_oversold">RSI(14) &lt; 30 Mean Reversion</option>
              <option value="bb_squeeze">Bollinger Squeeze Breakout</option>
            </select>
          </div>
        </div>

        {/* Summary Ribbon */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 font-mono-num text-xs">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
            <div className="text-[10px] text-[var(--muted)]">LAST CLOSE</div>
            <div className="mt-1 text-lg font-bold text-[var(--ink)]">${report.lastClose}</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
            <div className="text-[10px] text-[var(--muted)]">TREND REGIME</div>
            <div className="mt-1 text-sm font-bold text-[var(--up)]">{report.summary.trendRegime}</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
            <div className="text-[10px] text-[var(--muted)]">RSI (14)</div>
            <div className="mt-1 text-lg font-bold text-[var(--amber)]">{report.summary.rsi14}</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
            <div className="text-[10px] text-[var(--muted)]">MACD HIST</div>
            <div className="mt-1 text-lg font-bold text-[var(--up)]">{report.summary.macdHist}</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
            <div className="text-[10px] text-[var(--muted)]">DIST TO 200D SMA</div>
            <div className="mt-1 text-lg font-bold text-[var(--up)]">+{report.summary.distFromSma200Pct}%</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
            <div className="text-[10px] text-[var(--muted)]">SQUEEZE STATUS</div>
            <div className="mt-1 text-sm font-bold text-[var(--amber)]">
              {report.summary.squeezeOn ? 'SQUEEZE ON' : 'NORMAL VOL'}
            </div>
          </div>
        </div>

        {/* Main Price + SMA Chart */}
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="mb-2 flex justify-between font-mono-num text-xs">
            <span className="font-bold text-[var(--ink)]">{report.ticker} DAILY PRICE + 50D / 200D SMA</span>
            <div className="flex gap-4">
              <span className="text-[var(--ink)]">━ Close</span>
              <span className="text-[var(--amber)]">━ SMA 50</span>
              <span className="text-[var(--up)]">┄ SMA 200</span>
            </div>
          </div>
          <svg viewBox="0 0 900 225" className="w-full h-60 bg-[var(--bg)] border border-[var(--line)]">
            <path d={sma200Path} fill="none" stroke="#43BD85" strokeWidth="1.5" strokeDasharray="4 3" />
            <path d={sma50Path} fill="none" stroke="#F0A83C" strokeWidth="1.5" />
            <path d={closePath} fill="none" stroke="#ECE8DF" strokeWidth="2.2" />
          </svg>
        </div>

        {/* Empirical Signal Study Output */}
        <div className="border border-[var(--amber)]/50 bg-[var(--surface)] p-5">
          <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
            EMPIRICAL SIGNAL STUDY · {report.signalStudy.occurrences} HISTORICAL OCCURRENCES ON {report.ticker}
          </div>
          <h3 className="mt-1 font-cond text-2xl font-bold uppercase text-[var(--ink)]">
            {report.signalStudy.signalName} — Forward Win Rate: {report.signalStudy.winRate21dPct}% (+21d)
          </h3>
          <p className="mt-1 text-xs text-[var(--body)]">{report.signalStudy.verdict}</p>
          <div className="mt-4 grid grid-cols-3 gap-4 font-mono-num text-xs">
            <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
              <div className="text-[10px] text-[var(--muted)]">+5D FORWARD MEDIAN</div>
              <div className="mt-1 text-lg font-bold text-[var(--up)]">+{report.signalStudy.fwd5dMedianPct}%</div>
            </div>
            <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
              <div className="text-[10px] text-[var(--muted)]">+21D FORWARD MEDIAN</div>
              <div className="mt-1 text-lg font-bold text-[var(--up)]">+{report.signalStudy.fwd21dMedianPct}%</div>
            </div>
            <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
              <div className="text-[10px] text-[var(--muted)]">+63D FORWARD MEDIAN</div>
              <div className="mt-1 text-lg font-bold text-[var(--up)]">+{report.signalStudy.fwd63dMedianPct}%</div>
            </div>
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}

export default function TechnicalsPage() {
  return (
    <Suspense fallback={<div className="p-10 font-mono-num text-xs">Loading Technicals Desk...</div>}>
      <TechnicalsContent />
    </Suspense>
  );
}
