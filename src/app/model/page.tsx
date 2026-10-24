'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense, useMemo, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { runDcfModel, exportDcfToCsv } from '@/lib/quant/dcf';
import { getKnownTickers } from '@/lib/quant/grader';

function DcfModelContent() {
  const searchParams = useSearchParams();
  const [ticker, setTicker] = useState(searchParams.get('ticker') || 'MU');
  const [scenario, setScenario] = useState<'BEAR' | 'BASE' | 'BULL'>('BASE');
  const [growthY1_5Pct, setGrowthY1_5Pct] = useState(18);
  const [ebitMarginTargetPct, setEbitMarginTargetPct] = useState(28);
  const [waccPct, setWaccPct] = useState(9.5);
  const [terminalGrowthPct, setTerminalGrowthPct] = useState(2.5);

  const model = useMemo(
    () =>
      runDcfModel({
        ticker,
        scenario,
        growthY1_5Pct,
        ebitMarginTargetPct,
        waccPct,
        terminalGrowthPct,
      }),
    [ticker, scenario, growthY1_5Pct, ebitMarginTargetPct, waccPct, terminalGrowthPct]
  );

  function applyScenarioPreset(sc: 'BEAR' | 'BASE' | 'BULL') {
    setScenario(sc);
    if (sc === 'BEAR') {
      setGrowthY1_5Pct(9);
      setEbitMarginTargetPct(20);
      setWaccPct(10.5);
    } else if (sc === 'BASE') {
      setGrowthY1_5Pct(18);
      setEbitMarginTargetPct(28);
      setWaccPct(9.5);
    } else {
      setGrowthY1_5Pct(26);
      setEbitMarginTargetPct(35);
      setWaccPct(8.8);
    }
  }

  function handleDownloadCsv() {
    const csv = exportDcfToCsv(model);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.ticker}_10Y_DCF_Model.csv`;
    a.click();
  }

  return (
    <TerminalShell
      title="10-Year DCF Valuation & Reverse-DCF Implied Growth Solver"
      subtitle="SEC EDGAR baseline cash flows, Bear/Base/Bull presets, market-implied growth rate, and 5×5 WACC × Terminal Growth grid"
      actions={
        <button
          type="button"
          onClick={handleDownloadCsv}
          className="bg-[var(--amber)] px-3 py-1 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
        >
          ⬇ Export CSV / Excel
        </button>
      }
    >
      <div className="space-y-6">
        {/* Top Ticker & Scenario Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--line2)] bg-[var(--surface)] p-4 font-mono-num text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--muted)]">TICKER:</span>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-24 border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5 font-bold uppercase text-[var(--amber)]"
            />
            {['MU', 'NVDA', 'AAPL', 'MSFT', 'AVGO', 'META', 'LLY', 'AMZN'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTicker(t)}
                className={`border px-2 py-1 ${
                  ticker === t
                    ? 'border-[var(--amber)] bg-[var(--amber)]/15 font-bold text-[var(--amber)]'
                    : 'border-[var(--line)] text-[var(--muted)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            {(['BEAR', 'BASE', 'BULL'] as const).map((sc) => (
              <button
                key={sc}
                type="button"
                onClick={() => applyScenarioPreset(sc)}
                className={`px-3 py-1.5 font-bold ${
                  scenario === sc
                    ? 'bg-[var(--amber)] text-[#0A0D13]'
                    : 'border border-[var(--line2)] bg-[var(--bg)] text-[var(--muted)]'
                }`}
              >
                {sc} CASE
              </button>
            ))}
          </div>
        </div>

        {/* Sliders + Valuation Summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-4 border border-[var(--line)] bg-[var(--surface)] p-5 font-mono-num text-xs">
            <div className="font-bold uppercase text-[var(--amber)]">ASSUMPTION SLIDERS</div>
            <div>
              <div className="flex justify-between">
                <span>Years 1–5 Revenue Growth</span>
                <strong className="text-[var(--amber)]">{growthY1_5Pct}% / yr</strong>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={0.5}
                value={growthY1_5Pct}
                onChange={(e) => setGrowthY1_5Pct(Number(e.target.value))}
                className="mt-1 w-full accent-[#F0A83C]"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <span>Target Operating Margin</span>
                <strong className="text-[var(--amber)]">{ebitMarginTargetPct}%</strong>
              </div>
              <input
                type="range"
                min={8}
                max={55}
                step={0.5}
                value={ebitMarginTargetPct}
                onChange={(e) => setEbitMarginTargetPct(Number(e.target.value))}
                className="mt-1 w-full accent-[#F0A83C]"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <span>WACC Discount Rate</span>
                <strong className="text-[var(--amber)]">{waccPct}%</strong>
              </div>
              <input
                type="range"
                min={6.5}
                max={14}
                step={0.25}
                value={waccPct}
                onChange={(e) => setWaccPct(Number(e.target.value))}
                className="mt-1 w-full accent-[#F0A83C]"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <span>Terminal Growth Rate</span>
                <strong className="text-[var(--amber)]">{terminalGrowthPct}%</strong>
              </div>
              <input
                type="range"
                min={1.0}
                max={4.0}
                step={0.25}
                value={terminalGrowthPct}
                onChange={(e) => setTerminalGrowthPct(Number(e.target.value))}
                className="mt-1 w-full accent-[#F0A83C]"
              />
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:grid-cols-3 font-mono-num">
            <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="text-[10px] text-[var(--muted)]">CURRENT SHARE PRICE</div>
              <div className="mt-1 text-2xl font-bold text-[var(--ink)]">${model.currentPrice}</div>
              <div className="text-[10px] text-[var(--faint)]">{model.name}</div>
            </div>
            <div className="border border-[var(--up)]/60 bg-[var(--surface)] p-4">
              <div className="text-[10px] text-[var(--up)]">DCF INTRINSIC VALUE</div>
              <div className="mt-1 text-2xl font-bold text-[var(--up)]">${model.valuation.fairValuePerShare}</div>
              <div className="text-[10px] text-[var(--faint)]">EV ${model.valuation.enterpriseValueB}B</div>
            </div>
            <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="text-[10px] text-[var(--muted)]">IMPLIED UPSIDE / DOWNSIDE</div>
              <div
                className={`mt-1 text-2xl font-bold ${
                  model.valuation.upsidePct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
                }`}
              >
                {model.valuation.upsidePct >= 0 ? '+' : ''}
                {model.valuation.upsidePct}%
              </div>
              <div className="text-[10px] text-[var(--faint)]">{model.scenario} Case</div>
            </div>
            <div className="sm:col-span-3 border border-[var(--amber)]/50 bg-[var(--surface)] p-4">
              <div className="text-[10px] uppercase text-[var(--amber)]">
                REVERSE-DCF MARKET-IMPLIED 5-YEAR GROWTH RATE SOLVER
              </div>
              <div className="mt-1 text-lg font-bold text-[var(--ink)]">
                At ${model.currentPrice}/sh, the market is pricing in{' '}
                <span className="text-[var(--amber)]">{model.valuation.impliedMarketGrowthPct}%/yr</span> 5-year revenue growth (vs your modeled {growthY1_5Pct}%/yr).
              </div>
            </div>
          </div>
        </div>

        {/* 10-Year Cash Flow Schedule */}
        <div className="overflow-x-auto border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="mb-3 font-mono-num text-xs font-bold uppercase text-[var(--amber)]">
            10-YEAR FREE CASH FLOW PROJECTION ($ BILLIONS)
          </div>
          <table className="w-full text-left font-mono-num text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                <th className="p-2">Year</th>
                <th className="p-2">Revenue ($B)</th>
                <th className="p-2">Growth (%)</th>
                <th className="p-2">EBIT Margin (%)</th>
                <th className="p-2">NOPAT ($B)</th>
                <th className="p-2">Unlevered FCF ($B)</th>
                <th className="p-2">PV of FCF ($B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {model.projections.map((p) => (
                <tr key={p.yearIndex}>
                  <td className="p-2 font-bold">{p.calendarYear} (Y{p.yearIndex})</td>
                  <td className="p-2">${p.revenueB}B</td>
                  <td className="p-2 text-[var(--up)]">{p.revenueGrowthPct}%</td>
                  <td className="p-2">{p.ebitMarginPct}%</td>
                  <td className="p-2">${p.nopatB}B</td>
                  <td className="p-2 font-bold text-[var(--amber)]">${p.fcfB}B</td>
                  <td className="p-2 text-[var(--up)]">${p.pvFcfB}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5x5 Sensitivity Grid */}
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="mb-3 font-mono-num text-xs font-bold uppercase text-[var(--amber)]">
            5×5 SENSITIVITY MATRIX: WACC (ROWS) × TERMINAL GROWTH (COLUMNS)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono-num text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] text-[var(--muted)]">
                  <th className="p-2">WACC \ Term G</th>
                  {model.sensitivityGrid[0]?.cells.map((c) => (
                    <th key={c.terminalGrowthPct} className="p-2">
                      g = {c.terminalGrowthPct}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {model.sensitivityGrid.map((row) => (
                  <tr key={row.waccPct}>
                    <td className="bg-[var(--bg)] p-2 font-bold text-[var(--amber)]">WACC {row.waccPct}%</td>
                    {row.cells.map((cell) => (
                      <td
                        key={cell.terminalGrowthPct}
                        className={`p-2 font-bold ${
                          cell.fairValue >= model.currentPrice ? 'text-[var(--up)]' : 'text-[var(--down)]'
                        }`}
                      >
                        ${cell.fairValue}
                      </td>
                    ))}
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

export default function ModelPage() {
  return (
    <Suspense fallback={<div className="p-10 font-mono-num text-xs">Loading 10-Year DCF Model...</div>}>
      <DcfModelContent />
    </Suspense>
  );
}
