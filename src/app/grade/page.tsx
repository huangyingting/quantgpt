'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { gradeStock, batchGradeStocks, getKnownTickers } from '@/lib/quant/grader';

export default function StockGraderPage() {
  const [ticker, setTicker] = useState('NVDA');
  const [batchInput, setBatchInput] = useState('NVDA, MU, AAPL, MSFT, AVGO, LLY, COST, META, JPM, XOM');
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  const report = useMemo(() => gradeStock(ticker), [ticker]);
  const batchReports = useMemo(
    () =>
      batchGradeStocks(
        batchInput
          .split(/[\s,]+/)
          .map((t) => t.trim())
          .filter(Boolean)
      ),
    [batchInput]
  );

  return (
    <TerminalShell
      title="Stock Grader & Fundamental Quality Audit"
      subtitle="6-dimension sector-relative grading (A+ to F), Piotroski F-Score, Altman Z, Beneish M & AAOIFI Halal Screen"
      actions={
        <div className="flex gap-1.5 font-mono-num text-xs">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-3 py-1 ${
              mode === 'single' ? 'bg-[var(--amber)] font-bold text-[#0A0D13]' : 'border border-[var(--line2)]'
            }`}
          >
            Single Ticker Audit
          </button>
          <button
            type="button"
            onClick={() => setMode('batch')}
            className={`px-3 py-1 ${
              mode === 'batch' ? 'bg-[var(--amber)] font-bold text-[#0A0D13]' : 'border border-[var(--line2)]'
            }`}
          >
            Batch Grader (Up to 25)
          </button>
        </div>
      }
    >
      {mode === 'single' ? (
        <div className="space-y-6">
          {/* Ticker Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--line2)] bg-[var(--surface)] p-4">
            <div className="flex flex-wrap items-center gap-2 font-mono-num text-xs">
              <span className="text-[var(--muted)]">TICKER:</span>
              <input
                id="tk"
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-28 border border-[var(--line2)] bg-[var(--field)] px-3 py-1.5 font-bold uppercase text-[var(--amber)] outline-none focus:border-[var(--amber)]"
              />
              <div className="flex flex-wrap gap-1">
                {getKnownTickers()
                  .slice(0, 12)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTicker(t)}
                      className={`border px-2 py-1 text-[11px] ${
                        ticker === t
                          ? 'border-[var(--amber)] bg-[var(--amber)]/15 font-bold text-[var(--amber)]'
                          : 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex gap-2 font-mono-num text-xs">
              <Link
                href={`/halal?ticker=${report.ticker}`}
                className="border border-[var(--line2)] bg-[var(--bg)] px-3 py-1.5 text-[var(--ink)] hover:border-[var(--amber)]"
              >
                AAOIFI Halal →
              </Link>
              <Link
                href={`/technicals?ticker=${report.ticker}`}
                className="border border-[var(--line2)] bg-[var(--bg)] px-3 py-1.5 text-[var(--ink)] hover:border-[var(--amber)]"
              >
                Technicals →
              </Link>
              <Link
                href={`/model?ticker=${report.ticker}`}
                className="border border-[var(--line2)] bg-[var(--bg)] px-3 py-1.5 text-[var(--ink)] hover:border-[var(--amber)]"
              >
                10Y DCF Model →
              </Link>
            </div>
          </div>

          {/* Top Identity & Composite Grade Card */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4 border border-[var(--line2)] bg-[var(--surface)] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono-num text-xs text-[var(--muted)]">
                  <span>{report.sector}</span>
                  <span>CIK {report.cik}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <h2 className="font-cond text-3xl font-bold uppercase text-[var(--ink)]">
                      {report.ticker} · {report.name}
                    </h2>
                    <div className="font-mono-num text-sm text-[var(--amber)]">
                      ${report.price.toFixed(2)} · MCap ${report.marketCapB}B
                    </div>
                  </div>
                  <div id="badge" className="border-2 border-[var(--up)] bg-[var(--up)]/15 px-4 py-2 text-center font-mono-num">
                    <div className="text-[10px] text-[var(--muted)]">COMPOSITE</div>
                    <div className="text-3xl font-bold text-[var(--up)]">{report.compositeGrade}</div>
                    <div className="text-[9px] text-[var(--muted)]">5-PILLAR EQUAL</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-4 font-mono-num text-xs">
                <div className="border border-[var(--line)] bg-[var(--bg)] p-2.5">
                  <div className="text-[10px] text-[var(--muted)]">PIOTROSKI F</div>
                  <div className="mt-1 text-base font-bold text-[var(--up)]">
                    {report.accountingScores.piotroskiF} / 9
                  </div>
                </div>
                <div className="border border-[var(--line)] bg-[var(--bg)] p-2.5">
                  <div className="text-[10px] text-[var(--muted)]">ALTMAN Z</div>
                  <div className="mt-1 text-base font-bold text-[var(--amber)]">
                    {report.accountingScores.altmanZ}
                  </div>
                </div>
                <div className="border border-[var(--line)] bg-[var(--bg)] p-2.5">
                  <div className="text-[10px] text-[var(--muted)]">BENEISH M</div>
                  <div className="mt-1 text-base font-bold text-[var(--up)]">
                    {report.accountingScores.beneishM}
                  </div>
                </div>
              </div>
            </div>

            {/* 6 Dimensions Grid */}
            <div id="pillars" className="lg:col-span-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 font-mono-num">
              {Object.values(report.dimensions).map((dim) => (
                <div key={dim.name} className="border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-[var(--ink)]">{dim.name}</span>
                      <div className="text-[9px] uppercase text-[var(--faint)]">
                        {dim.inComposite ? '20% OF COMPOSITE' : 'SHOWN ALONGSIDE (0% WEIGHT)'}
                      </div>
                    </div>
                    <span
                      className={`border px-2 py-0.5 text-sm font-bold ${
                        dim.grade.startsWith('A') || dim.grade.startsWith('B')
                          ? 'border-[var(--up)]/50 bg-[var(--up)]/15 text-[var(--up)]'
                          : dim.grade.startsWith('C')
                            ? 'border-[var(--amber)]/50 bg-[var(--amber)]/15 text-[var(--amber)]'
                            : 'border-[var(--down)]/50 bg-[var(--down)]/15 text-[var(--down)]'
                      }`}
                    >
                      {dim.grade}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--amber)]">
                    {dim.percentile}th Sector Percentile
                  </div>
                  <div className="mt-2 font-sans text-xs text-[var(--muted)]">{dim.headlineMetric}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Benchmarks (Sub-Industry, Industry Group, Sector) */}
          <div id="peers-h" className="border border-[var(--line2)] bg-[var(--surface)] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono-num text-xs">
              <span className="font-bold uppercase text-[var(--amber)]">
                GICS PEER BENCHMARKS — {report.ticker} PERCENTILE ACROSS PEER COHORTS
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                Evaluated against live SEC XBRL Point-in-Time Cohorts
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 font-mono-num text-xs">
              {report.peerBenchmarks.map((pb) => (
                <div key={pb.group} className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                  <div className="text-[10px] uppercase text-[var(--muted)]">{pb.group}</div>
                  <div className="mt-1 font-bold text-[var(--ink)]">{pb.groupName}</div>
                  <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-2">
                    <span className="text-[var(--muted)]">{pb.peerCount} Peers · Grade {pb.compositeGrade}</span>
                    <span className="font-bold text-[var(--up)]">Rank {pb.stockRank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All 16 Input Drivers Table */}
          <div id="drivers-h" className="border border-[var(--line2)] bg-[var(--surface)] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono-num text-xs">
              <span className="font-bold uppercase text-[var(--amber)]">
                ALL {report.drivers.length} QUANTITATIVE INPUT DRIVERS (RAW VALUE VS SECTOR MEDIAN)
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                5 Composite Pillars + Flows Diagnostic
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-num text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                    <th className="p-2.5">Pillar</th>
                    <th className="p-2.5">Factor Metric</th>
                    <th className="p-2.5">{report.ticker} Raw Value</th>
                    <th className="p-2.5">Sector Median</th>
                    <th className="p-2.5">Sector Percentile</th>
                    <th className="p-2.5">Grade</th>
                    <th className="p-2.5">Composite Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {report.drivers.map((drv) => (
                    <tr key={`${drv.dimension}-${drv.metric}`} className="hover:bg-[var(--bg)]">
                      <td className="p-2.5 font-bold text-[var(--amber)]">{drv.dimension}</td>
                      <td className="p-2.5 text-[var(--ink)]">{drv.metric}</td>
                      <td className="p-2.5 font-bold text-[var(--ink)]">{drv.rawValue}</td>
                      <td className="p-2.5 text-[var(--muted)]">{drv.sectorMedian}</td>
                      <td className="p-2.5 text-[var(--up)]">{drv.percentile}th</td>
                      <td className="p-2.5 font-bold">{drv.grade}</td>
                      <td className="p-2.5 text-[var(--muted)]">{drv.weightInComposite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AAOIFI Halal 5-Test Compliance Panel */}
          <div className="border border-[var(--line2)] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
                  AAOIFI SHARIAH COMPLIANCE SCREEN (5 QUANTITATIVE TESTS)
                </div>
                <h3 className="font-cond text-xl font-bold uppercase text-[var(--ink)]">
                  {report.ticker} Halal Status: {report.halal.status} ({report.halal.passedCount}/5 Tests Passed)
                </h3>
              </div>
              <span
                className={`px-3 py-1 font-mono-num text-xs font-bold ${
                  report.halal.status === 'HALAL'
                    ? 'bg-[var(--up)]/15 text-[var(--up)] border border-[var(--up)]'
                    : 'bg-[var(--down)]/15 text-[var(--down)] border border-[var(--down)]'
                }`}
              >
                {report.halal.status} · Purification: {report.halal.purificationPctOfDividends}% of Dividends
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5 font-mono-num text-xs">
              {report.halal.tests.map((t) => (
                <div key={t.id} className="border border-[var(--line)] bg-[var(--bg)] p-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[var(--muted)]">{t.threshold}</span>
                    <span className={t.passed ? 'text-[var(--up)] font-bold' : 'text-[var(--down)] font-bold'}>
                      {t.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <div className="mt-1 font-bold text-[var(--ink)]">{t.name}</div>
                  <div className="mt-1 text-[var(--amber)]">{t.actual}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Batch Grader View */
        <div className="space-y-4">
          <div className="border border-[var(--line2)] bg-[var(--surface)] p-4">
            <label className="block font-mono-num text-xs uppercase text-[var(--amber)]">
              PASTE COMMA-SEPARATED TICKERS FOR BATCH FACTOR & HALAL GRADING
            </label>
            <input
              type="text"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value.toUpperCase())}
              className="mt-2 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-xs text-[var(--ink)]"
            />
          </div>
          <div className="overflow-x-auto border border-[var(--line)] bg-[var(--surface)]">
            <table className="w-full text-left font-mono-num text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                  <th className="p-2.5">Ticker</th>
                  <th className="p-2.5">Composite</th>
                  <th className="p-2.5">Valuation</th>
                  <th className="p-2.5">Growth</th>
                  <th className="p-2.5">Profitability</th>
                  <th className="p-2.5">Momentum</th>
                  <th className="p-2.5">Quality</th>
                  <th className="p-2.5">Piotroski F</th>
                  <th className="p-2.5">AAOIFI Halal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {batchReports.map((r) => (
                  <tr key={r.ticker} className="hover:bg-[var(--bg)]">
                    <td className="p-2.5 font-bold text-[var(--amber)]">{r.ticker}</td>
                    <td className="p-2.5 font-bold text-[var(--up)]">{r.compositeGrade} ({r.compositePercentile}%)</td>
                    <td className="p-2.5">{r.dimensions.valuation.grade}</td>
                    <td className="p-2.5">{r.dimensions.growth.grade}</td>
                    <td className="p-2.5">{r.dimensions.profitability.grade}</td>
                    <td className="p-2.5">{r.dimensions.momentum.grade}</td>
                    <td className="p-2.5">{r.dimensions.quality.grade}</td>
                    <td className="p-2.5">{r.accountingScores.piotroskiF}/9</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold ${
                          r.halal.status === 'HALAL'
                            ? 'bg-[var(--up)]/15 text-[var(--up)]'
                            : 'bg-[var(--down)]/15 text-[var(--down)]'
                        }`}
                      >
                        {r.halal.status} ({r.halal.passedCount}/5)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </TerminalShell>
  );
}
