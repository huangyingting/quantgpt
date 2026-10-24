'use client';

import React, { useMemo, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { gradeStock, getKnownTickers } from '@/lib/quant/grader';

export default function HalalScreenPage() {
  const [ticker, setTicker] = useState('NVDA');
  const report = useMemo(() => gradeStock(ticker), [ticker]);

  return (
    <TerminalShell
      title="AAOIFI Halal Stock Screener"
      subtitle="Point-in-time 5-test Islamic finance compliance audit (Business Activity, Debt/MCap, Cash/MCap, Receivables/MCap, Impure Income)"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 border border-[var(--line2)] bg-[var(--surface)] p-4 font-mono-num text-xs">
          <span className="text-[var(--muted)]">AUDIT TICKER:</span>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-28 border border-[var(--line2)] bg-[var(--field)] px-3 py-1.5 font-bold uppercase text-[var(--amber)]"
          />
          {getKnownTickers().map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTicker(t)}
              className={`border px-2.5 py-1 ${
                ticker === t
                  ? 'border-[var(--amber)] bg-[var(--amber)] font-bold text-[#0A0D13]'
                  : 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <div className="font-mono-num text-xs text-[var(--amber)]">
                AAOIFI STANDARD NO. 21 · 36-MONTH AVERAGE MARKET CAP DENOMINATOR
              </div>
              <h2 className="mt-1 font-cond text-3xl font-bold uppercase text-[var(--ink)]">
                {report.ticker} ({report.name}) — {report.halal.status}
              </h2>
            </div>
            <div
              className={`border-2 px-4 py-2 font-mono-num text-sm font-bold ${
                report.halal.status === 'HALAL'
                  ? 'border-[var(--up)] bg-[var(--up)]/15 text-[var(--up)]'
                  : 'border-[var(--down)] bg-[var(--down)]/15 text-[var(--down)]'
              }`}
            >
              {report.halal.passedCount} / 5 TESTS PASSED · {report.halal.status}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-5 font-mono-num text-xs">
            {report.halal.tests.map((t) => (
              <div key={t.id} className="border border-[var(--line)] bg-[var(--bg)] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--muted)]">{t.threshold}</span>
                  <span className={t.passed ? 'text-[var(--up)] font-bold' : 'text-[var(--down)] font-bold'}>
                    {t.passed ? '✓ PASS' : '✕ FAIL'}
                  </span>
                </div>
                <div className="mt-2 font-bold text-[var(--ink)]">{t.name}</div>
                <div className="mt-1 text-base font-bold text-[var(--amber)]">{t.actual}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}
