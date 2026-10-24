'use client';

import React, { useMemo, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { gradeStock, getKnownTickers } from '@/lib/quant/grader';

export default function HalalScreenPage() {
  const [ticker, setTicker] = useState('NVDA');
  const [asOf, setAsOf] = useState('2026-04');
  const report = useMemo(() => gradeStock(ticker, asOf), [ticker, asOf]);

  return (
    <TerminalShell
      title="AAOIFI Halal Stock Screener"
      subtitle="Point-in-time 5-test Islamic finance compliance audit (Business Activity, Debt/MCap, Cash/MCap, Receivables/MCap, Impure Income)"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--line2)] bg-[var(--surface)] p-4 font-mono-num text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--muted)]">AUDIT TICKER:</span>
            <input
              id="tk"
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

          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)]">AS OF MONTH:</span>
            <select
              id="asof"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
              className="border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5 text-[var(--amber)]"
            >
              {[
                '2026-04',
                '2025-12',
                '2024-12',
                '2023-12',
                '2022-12',
                '2021-12',
                '2020-03',
                '2019-12',
                '2018-12',
              ].map((m) => (
                <option key={m} value={m}>
                  {m} (45d SEC Lag)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verdict Banner & 5 AAOIFI Tests */}
        <div id="verdict" className="border border-[var(--line2)] bg-[var(--surface)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <div className="font-mono-num text-xs text-[var(--amber)]">
                AAOIFI STANDARD NO. 21 · 36-MONTH AVERAGE MARKET CAP DENOMINATOR · AS OF {report.halal.asOf}
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
              {report.halal.passedCount} / 5 TESTS PASSED · {report.halal.status} · PURIFICATION: {report.halal.purificationPctOfDividends}%
            </div>
          </div>

          <div id="ratios" className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-5 font-mono-num text-xs">
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

        {/* Inputs from the Filing */}
        <div id="inputs" className="border border-[var(--line2)] bg-[var(--surface)] p-5 font-mono-num text-xs">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold uppercase text-[var(--amber)]">
              INPUTS FROM THE SEC FILING (CIK {report.cik} · 10-K / 10-Q XBRL TAGS)
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              Exact dollar numerators & 36-month average market cap denominator
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {report.halal.inputs.map((inp) => (
              <div key={inp.field} className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <div className="text-[10px] uppercase text-[var(--muted)]">{inp.filingSource} · {inp.periodEnd}</div>
                <div className="mt-1 font-bold text-[var(--ink)]">{inp.field}</div>
                <div className="mt-1 text-lg font-bold text-[var(--amber)]">{inp.valueUsdB}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 10-Year Monthly Compliance History Strip (120 Months) */}
        <div id="strip" className="border border-[var(--line2)] bg-[var(--surface)] p-5 font-mono-num text-xs">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold uppercase text-[var(--amber)]">
              10-YEAR MONTHLY COMPLIANCE HISTORY STRIP (120 MONTHS · 2017–2026)
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              Click any monthly square to evaluate {report.ticker} as of that historical month
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {report.halal.history10Y.map((cell) => (
              <button
                key={cell.ym}
                type="button"
                onClick={() => setAsOf(cell.ym)}
                title={`${cell.ym}: ${cell.status} (Debt/MCap ${cell.debtRatioPct}%)`}
                className={`h-4 w-4 border transition ${
                  asOf === cell.ym ? 'ring-2 ring-[var(--amber)]' : 'border-transparent'
                } ${
                  cell.status === 'PASS'
                    ? 'bg-[var(--up)]/75 hover:bg-[var(--up)]'
                    : cell.status === 'UNKNOWN'
                      ? 'bg-[var(--amber)]/75 hover:bg-[var(--amber)]'
                      : 'bg-[var(--down)]/75 hover:bg-[var(--down)]'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--muted)]">
            <span>2017-01</span>
            <div className="flex items-center gap-3">
              <span className="text-[var(--up)]">■ PASS (HALAL)</span>
              <span className="text-[var(--amber)]">■ DOUBTFUL (27–30% DEBT)</span>
              <span className="text-[var(--down)]">■ FAIL (NOT HALAL)</span>
            </div>
            <span>2026-10</span>
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}
