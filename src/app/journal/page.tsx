'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';

export default function JournalPage() {
  const [tab, setTab] = useState<'findings' | 'paper' | 'watches'>('findings');
  const [findings, setFindings] = useState<Array<Record<string, unknown>>>([
    {
      id: 'default-1',
      title: '12-1 Month Cross-Sectional Momentum (Top 20)',
      strategyId: 'mom_01',
      verdict: 'DATA VALIDATED',
      cagrAtSave: 14.82,
      sharpeAtSave: 0.86,
      maxDdAtSave: -34.2,
      oosReturnSinceSave: 6.4,
      savedAt: '2026-01-15',
    },
    {
      id: 'default-2',
      title: '200-Day SMA Buffered Trend (+1%/-3% + 3M T-Bills)',
      strategyId: 'trend_01',
      verdict: 'TRADE-OFF',
      cagrAtSave: 10.62,
      sharpeAtSave: 0.94,
      maxDdAtSave: -24.5,
      oosReturnSinceSave: 4.1,
      savedAt: '2026-02-01',
    },
  ]);
  const [paperBooks, setPaperBooks] = useState<Array<Record<string, unknown>>>([
    {
      id: 'pb-1',
      name: 'Core Momentum + Quality Paper Book ($100K)',
      strategyId: 'mom_01',
      initialCapital: 100000,
      currentNav: 108420,
      status: 'ACTIVE',
    },
  ]);
  const [watches, setWatches] = useState<Array<Record<string, unknown>>>([
    {
      id: 'w-1',
      strategyId: 'val_01',
      name: 'Enterprise Multiple (EV/EBITDA) Value Decile',
      alertOnRebalance: true,
      alertOnRegimeFlip: true,
    },
  ]);

  useEffect(() => {
    fetch('/api/journal')
      .then((r) => r.json())
      .then((d) => {
        if (d.findings?.length) setFindings(d.findings);
        if (d.paperBooks?.length) setPaperBooks(d.paperBooks);
        if (d.watches?.length) setWatches(d.watches);
      })
      .catch(() => {});
  }, []);

  return (
    <TerminalShell
      title="Findings Journal, Out-of-Sample Tracker & $100K Paper Books"
      subtitle="Freeze backtest snapshots, measure forward out-of-sample decay after save date, and manage $100K paper portfolios"
      actions={
        <Link
          href="/terminal"
          className="bg-[var(--amber)] px-3 py-1 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
        >
          + New Finding in Backtester
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-[var(--line)] pb-2 font-mono-num text-xs">
          <button
            type="button"
            onClick={() => setTab('findings')}
            className={`px-4 py-1.5 uppercase ${
              tab === 'findings' ? 'bg-[var(--amber)] font-bold text-[#0A0D13]' : 'border border-[var(--line)] text-[var(--muted)]'
            }`}
          >
            Saved Findings ({findings.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('paper')}
            className={`px-4 py-1.5 uppercase ${
              tab === 'paper' ? 'bg-[var(--amber)] font-bold text-[#0A0D13]' : 'border border-[var(--line)] text-[var(--muted)]'
            }`}
          >
            $100K Paper Books ({paperBooks.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('watches')}
            className={`px-4 py-1.5 uppercase ${
              tab === 'watches' ? 'bg-[var(--amber)] font-bold text-[#0A0D13]' : 'border border-[var(--line)] text-[var(--muted)]'
            }`}
          >
            Strategy Watches ({watches.length})
          </button>
        </div>

        {tab === 'findings' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {findings.map((f, idx) => (
              <div key={String(f.id || idx)} className="border border-[var(--line2)] bg-[var(--surface)] p-5">
                <div className="flex items-center justify-between font-mono-num text-xs">
                  <span className="text-[var(--amber)]">{String(f.strategyId)}</span>
                  <span className="bg-[var(--up)]/15 px-2 py-0.5 font-bold text-[var(--up)]">
                    {String(f.verdict)}
                  </span>
                </div>
                <h3 className="mt-2 font-cond text-xl font-bold uppercase text-[var(--ink)]">
                  {String(f.title)}
                </h3>
                <div className="mt-4 grid grid-cols-4 gap-2 border-t border-[var(--line)] pt-3 font-mono-num text-xs">
                  <div>
                    <div className="text-[10px] text-[var(--muted)]">SAVED CAGR</div>
                    <div className="font-bold text-[var(--up)]">{Number(f.cagrAtSave).toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted)]">SHARPE</div>
                    <div className="font-bold text-[var(--amber)]">{Number(f.sharpeAtSave).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted)]">MAX DD</div>
                    <div className="font-bold text-[var(--down)]">{Number(f.maxDdAtSave).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--up)]">LIVE OOS SINCE SAVE</div>
                    <div className="font-bold text-[var(--up)]">+{Number(f.oosReturnSinceSave || 3.2)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'paper' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {paperBooks.map((pb, idx) => (
              <div key={String(pb.id || idx)} className="border border-[var(--up)]/50 bg-[var(--surface)] p-5">
                <div className="flex items-center justify-between font-mono-num text-xs">
                  <span className="text-[var(--up)] font-bold">● PAPER BOOK ACTIVE</span>
                  <span className="text-[var(--muted)]">Preset: {String(pb.strategyId)}</span>
                </div>
                <h3 className="mt-2 font-cond text-xl font-bold uppercase text-[var(--ink)]">
                  {String(pb.name)}
                </h3>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-3 font-mono-num text-xs">
                  <div>
                    <div className="text-[10px] text-[var(--muted)]">INITIAL CAPITAL</div>
                    <div className="text-base font-bold">${Number(pb.initialCapital).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted)]">CURRENT NAV</div>
                    <div className="text-base font-bold text-[var(--up)]">
                      ${Number(pb.currentNav).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted)]">NET GAIN</div>
                    <div className="text-base font-bold text-[var(--up)]">
                      +{(((Number(pb.currentNav) - Number(pb.initialCapital)) / Number(pb.initialCapital)) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'watches' && (
          <div className="space-y-3 font-mono-num text-xs">
            {watches.map((w, idx) => (
              <div
                key={String(w.id || idx)}
                className="flex flex-wrap items-center justify-between border border-[var(--line)] bg-[var(--surface)] p-4"
              >
                <div>
                  <div className="font-bold text-[var(--amber)]">{String(w.name)}</div>
                  <div className="text-[11px] text-[var(--muted)]">
                    Alerts active: Rebalance Trigger · 200d SMA Regime Flip
                  </div>
                </div>
                <Link
                  href={`/terminal?preset=${encodeURIComponent(String(w.strategyId))}`}
                  className="border border-[var(--line2)] px-3 py-1.5 text-[var(--ink)] hover:border-[var(--amber)]"
                >
                  Open Strategy →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </TerminalShell>
  );
}
