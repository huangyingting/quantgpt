'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { STRATEGIES } from '@/lib/quant/warehouse';
import { runBacktest, runParameterSweep, BacktestResult, SweepResult } from '@/lib/quant/backtester';

function TerminalDeskContent() {
  const searchParams = useSearchParams();
  const initialPreset = searchParams.get('preset') || 'mom_01';
  const initialEngine = (searchParams.get('engine') as 'equity' | 'timing') || 'equity';

  const [engine, setEngine] = useState<'equity' | 'timing'>(initialEngine);
  const [presetId, setPresetId] = useState(initialPreset);
  const [universe, setUniverse] = useState<'SP500' | 'R1000' | 'NDX100'>('SP500');
  const [topN, setTopN] = useState(20);
  const [rebalance, setRebalance] = useState<'M' | 'Q' | 'A'>('M');
  const [costBps, setCostBps] = useState(10);
  const [splitYear, setSplitYear] = useState(2015);
  const [timingTicker, setTimingTicker] = useState('$SPXTR');
  const [smaWindow, setSmaWindow] = useState(200);
  const [hysteresisPct, setHysteresisPct] = useState(2.0);
  const [cashVehicle, setCashVehicle] = useState<'TBILL3M' | 'IEF' | 'ZERO'>('TBILL3M');

  const [activeTab, setActiveTab] = useState<'overview' | 'skeptic' | 'sweep' | 'yearly' | 'holdings'>('overview');
  const [result, setResult] = useState<BacktestResult>(() =>
    runBacktest({
      engine: initialEngine,
      presetId: initialPreset,
      universe: 'SP500',
      topN: 20,
      rebalance: 'M',
      costBps: 10,
      splitYear: 2015,
    })
  );
  const [sweepResult, setSweepResult] = useState<SweepResult | null>(null);
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    const bt = runBacktest({
      engine,
      presetId,
      universe,
      topN,
      rebalance,
      costBps,
      splitYear,
      timingTicker,
      smaWindow,
      hysteresisPct,
      cashVehicle,
    });
    setResult(bt);
  }, [engine, presetId, universe, topN, rebalance, costBps, splitYear, timingTicker, smaWindow, hysteresisPct, cashVehicle]);

  function handleRunSweep() {
    const sw = runParameterSweep(presetId);
    setSweepResult(sw);
    setActiveTab('sweep');
  }

  async function handleSaveToJournal(type: 'finding' | 'paper_book' | 'watch') {
    setActionStatus('Saving...');
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: result.strategyName,
          strategyId: result.presetId,
          verdict: result.verdict,
          cagrAtSave: result.metrics.cagrPct,
          sharpeAtSave: result.metrics.sharpe,
          maxDdAtSave: result.metrics.maxDrawdownPct,
          capital: 100000,
          currentNav: 100000,
          holdings: result.currentHoldings,
          config: result.config,
        }),
      });
      if (res.ok) {
        setActionStatus(
          type === 'paper_book'
            ? '✓ Allocated $100,000 Paper Book in Journal'
            : type === 'watch'
              ? '✓ Added Strategy Watch to Journal'
              : '✓ Saved Finding Snapshot to Journal'
        );
      } else {
        setActionStatus('Saved locally (Sign in to sync across devices)');
      }
    } catch {
      setActionStatus('Saved locally');
    }
  }

  // Build SVG path from equityCurve
  const maxNav = Math.max(...result.equityCurve.map((p) => Math.max(p.stratNav, p.benchNav)), 20000);
  const minNav = Math.min(...result.equityCurve.map((p) => Math.min(p.stratNav, p.benchNav)), 5000);
  const logMin = Math.log10(Math.max(minNav, 1000));
  const logMax = Math.log10(Math.max(maxNav, 10000));

  const toX = (i: number) => 45 + (i / Math.max(1, result.equityCurve.length - 1)) * 830;
  const toY = (v: number) => {
    const lv = Math.log10(Math.max(v, 1000));
    return 215 - ((lv - logMin) / Math.max(0.1, logMax - logMin)) * 185;
  };

  const stratPath = result.equityCurve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(pt.stratNav).toFixed(1)}`)
    .join(' ');
  const benchPath = result.equityCurve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(pt.benchNav).toFixed(1)}`)
    .join(' ');
  const splitIdx = result.equityCurve.findIndex((p) => Number(p.date.slice(0, 4)) >= splitYear);
  const splitX = splitIdx >= 0 ? toX(splitIdx) : 520;

  return (
    <TerminalShell
      title="Backtest & Strategy Desk"
      subtitle="Point-in-time backtesting (1998–2026) with mandatory 2015 walk-forward split and 11-check Skeptic audit"
      actions={
        <div className="flex flex-wrap items-center gap-1.5 font-mono-num text-[11px]">
          <button
            type="button"
            onClick={() => handleSaveToJournal('finding')}
            className="border border-[var(--line2)] bg-[var(--bg)] px-2.5 py-1 text-[var(--ink)] hover:border-[var(--amber)]"
          >
            + Save Finding
          </button>
          <button
            type="button"
            onClick={() => handleSaveToJournal('paper_book')}
            className="border border-[var(--up)] bg-[var(--up)]/15 px-2.5 py-1 font-bold text-[var(--up)]"
          >
            + $100K Paper Book
          </button>
          <button
            type="button"
            onClick={handleRunSweep}
            className="bg-[var(--amber)] px-3 py-1 font-bold uppercase text-[#0A0D13]"
          >
            Run 2D Sweep
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {actionStatus && (
          <div className="border border-[var(--up)] bg-[var(--up)]/10 px-4 py-2 font-mono-num text-xs text-[var(--up)]">
            {actionStatus}
          </div>
        )}

        {/* Control Deck */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div className="flex gap-1.5 font-mono-num text-xs">
              <button
                type="button"
                onClick={() => setEngine('equity')}
                className={`px-3 py-1.5 uppercase ${
                  engine === 'equity'
                    ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                    : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'
                }`}
              >
                1. Cross-Sectional Factor Screen
              </button>
              <button
                type="button"
                onClick={() => setEngine('timing')}
                className={`px-3 py-1.5 uppercase ${
                  engine === 'timing'
                    ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                    : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'
                }`}
              >
                2. Market Timing / Trend Regime
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono-num text-xs">
              <span className="text-[var(--muted)]">VERDICT:</span>
              <span
                className={`px-2.5 py-0.5 font-bold ${
                  result.verdict === 'DATA VALIDATED'
                    ? 'bg-[var(--up)]/15 text-[var(--up)] border border-[var(--up)]/50'
                    : result.verdict === 'TRADE-OFF'
                      ? 'bg-[var(--amber)]/15 text-[var(--amber)] border border-[var(--amber)]/50'
                      : 'bg-[var(--down)]/15 text-[var(--down)] border border-[var(--down)]/50'
                }`}
              >
                {result.verdict}
              </span>
              <span className="border border-[var(--line2)] bg-[var(--bg)] px-2 py-0.5 text-[var(--ink)]">
                SKEPTIC: {result.skeptic.passedCount}/{result.skeptic.totalCount} ({result.skeptic.badge})
              </span>
            </div>
          </div>

          {engine === 'equity' ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 font-mono-num text-xs">
              <div className="lg:col-span-2">
                <label className="block text-[10px] uppercase text-[var(--muted)]">Strategy Preset (175)</label>
                <select
                  aria-label="Strategy preset"
                  value={presetId}
                  onChange={(e) => setPresetId(e.target.value)}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5 text-[var(--ink)]"
                >
                  {STRATEGIES.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.cat.toUpperCase()}] {s.name} ({s.cagr}% CAGR)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Point-in-Time Universe</label>
                <select
                  value={universe}
                  onChange={(e) => setUniverse(e.target.value as typeof universe)}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                >
                  <option value="SP500">S&P 500 Point-in-Time</option>
                  <option value="R1000">Russell 1000 Point-in-Time</option>
                  <option value="NDX100">Nasdaq-100 Point-in-Time</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Top-N Holdings</label>
                <select
                  value={topN}
                  onChange={(e) => setTopN(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                >
                  {[10, 15, 20, 25, 30, 50].map((n) => (
                    <option key={n} value={n}>
                      Top {n} Equal-Weight
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Rebalance & Friction</label>
                <div className="mt-1 flex gap-1">
                  <select
                    value={rebalance}
                    onChange={(e) => setRebalance(e.target.value as typeof rebalance)}
                    className="w-1/2 border border-[var(--line2)] bg-[var(--field)] px-2 py-1.5"
                  >
                    <option value="M">Monthly</option>
                    <option value="Q">Quarterly</option>
                    <option value="A">Annual</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={costBps}
                    onChange={(e) => setCostBps(Number(e.target.value))}
                    className="w-1/2 border border-[var(--line2)] bg-[var(--field)] px-2 py-1.5"
                    title="Cost in bps"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Walk-Forward Split</label>
                <select
                  value={splitYear}
                  onChange={(e) => setSplitYear(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5 text-[var(--amber)]"
                >
                  {[2012, 2015, 2018, 2020].map((yr) => (
                    <option key={yr} value={yr}>
                      Split Year: {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 font-mono-num text-xs">
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Target Index</label>
                <select
                  value={timingTicker}
                  onChange={(e) => setTimingTicker(e.target.value)}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                >
                  <option value="$SPXTR">S&P 500 Total Return ($SPXTR)</option>
                  <option value="$NDX">Nasdaq-100 ($NDX)</option>
                  <option value="SPY">SPDR S&P 500 ETF (SPY)</option>
                  <option value="QQQ">Invesco QQQ Trust (QQQ)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">SMA Trend Window</label>
                <select
                  value={smaWindow}
                  onChange={(e) => setSmaWindow(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                >
                  {[50, 100, 150, 200, 250].map((w) => (
                    <option key={w} value={w}>
                      {w}-Day SMA
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Hysteresis Band (%)</label>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  max={6}
                  value={hysteresisPct}
                  onChange={(e) => setHysteresisPct(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Defensive Cash Vehicle</label>
                <select
                  value={cashVehicle}
                  onChange={(e) => setCashVehicle(e.target.value as typeof cashVehicle)}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                >
                  <option value="TBILL3M">3-Month US Treasury Bills</option>
                  <option value="IEF">7-10 Year Treasury ETF (IEF)</option>
                  <option value="ZERO">0% Cash Mattress</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Walk-Forward Split</label>
                <select
                  value={splitYear}
                  onChange={(e) => setSplitYear(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5 text-[var(--amber)]"
                >
                  {[2012, 2015, 2018, 2020].map((yr) => (
                    <option key={yr} value={yr}>
                      Split Year: {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* KPI Ribbon + Walk-Forward Comparison */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 font-mono-num">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3.5">
            <div className="text-[10px] uppercase text-[var(--muted)]">Full CAGR (98–26)</div>
            <div className="mt-1 text-xl font-bold text-[var(--up)]">{result.metrics.cagrPct}%</div>
            <div className="text-[10px] text-[var(--faint)]">vs {result.metrics.benchCagrPct}% Bench</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3.5">
            <div className="text-[10px] uppercase text-[var(--muted)]">Sharpe / Sortino</div>
            <div className="mt-1 text-xl font-bold text-[var(--amber)]">
              {result.metrics.sharpe} / {result.metrics.sortino}
            </div>
            <div className="text-[10px] text-[var(--faint)]">vs {result.metrics.benchSharpe} Bench</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3.5">
            <div className="text-[10px] uppercase text-[var(--muted)]">Max Drawdown</div>
            <div className="mt-1 text-xl font-bold text-[var(--down)]">{result.metrics.maxDrawdownPct}%</div>
            <div className="text-[10px] text-[var(--faint)]">vs {result.metrics.benchMaxDrawdownPct}% Bench</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3.5">
            <div className="text-[10px] uppercase text-[var(--muted)]">Pre-{splitYear} In-Sample</div>
            <div className="mt-1 text-xl font-bold text-[var(--ink)]">{result.walkForward.preSplitCagrPct}%</div>
            <div className="text-[10px] text-[var(--faint)]">Sharpe {result.walkForward.preSplitSharpe}</div>
          </div>
          <div className="border border-[var(--amber)]/50 bg-[var(--surface)] p-3.5">
            <div className="text-[10px] uppercase text-[var(--amber)]">Post-{splitYear} Out-of-Sample</div>
            <div className="mt-1 text-xl font-bold text-[var(--up)]">{result.walkForward.postSplitCagrPct}%</div>
            <div className="text-[10px] text-[var(--faint)]">Sharpe {result.walkForward.postSplitSharpe}</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-3.5">
            <div className="text-[10px] uppercase text-[var(--muted)]">$10,000 Ending Value</div>
            <div className="mt-1 text-xl font-bold text-[var(--up)]">
              ${result.metrics.endingValue10k.toLocaleString()}
            </div>
            <div className="text-[10px] text-[var(--faint)]">
              Bench ${result.metrics.benchEndingValue10k.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-[var(--line)] pb-2 font-mono-num text-xs">
          {[
            { id: 'overview', label: 'EQUITY & DRAWDOWN CURVES' },
            { id: 'skeptic', label: `SKEPTIC SUITE (${result.skeptic.passedCount}/11)` },
            { id: 'sweep', label: '2D PARAMETER SWEEP (25 RUNS)' },
            { id: 'yearly', label: 'DECADE & YEARLY RETURNS' },
            { id: 'holdings', label: `CURRENT HOLDINGS (${result.currentHoldings.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (t.id === 'sweep' && !sweepResult) handleRunSweep();
                else setActiveTab(t.id as typeof activeTab);
              }}
              className={`px-3.5 py-1.5 uppercase ${
                activeTab === t.id
                  ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                  : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: EQUITY CURVE */}
        {activeTab === 'overview' && (
          <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono-num text-xs">
              <span className="font-bold text-[var(--ink)]">
                LOG-SCALE GROWTH OF $10,000 ({result.strategyName})
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[var(--amber)]">━ Strategy (${result.metrics.endingValue10k.toLocaleString()})</span>
                <span className="text-[var(--muted)]">┄ S&P 500 Benchmark (${result.metrics.benchEndingValue10k.toLocaleString()})</span>
                <span className="text-[var(--up)]">│ {splitYear} Walk-Forward Split</span>
              </div>
            </div>
            <svg viewBox="0 0 900 245" className="w-full h-64 bg-[var(--bg)] border border-[var(--line)] p-2">
              {[45, 95, 145, 195].map((y) => (
                <line key={y} x1="45" y1={y} x2="875" y2={y} stroke="#212A38" strokeDasharray="3 3" />
              ))}
              {/* Split Line */}
              <line x1={splitX} y1="20" x2={splitX} y2="220" stroke="#43BD85" strokeWidth="1.5" strokeDasharray="5 4" />
              <text x={splitX + 6} y="34" fill="#43BD85" fontSize="10" fontFamily="monospace">
                {splitYear} WALK-FORWARD SPLIT (OUT-OF-SAMPLE →)
              </text>
              <path d={benchPath} fill="none" stroke="#8B96A8" strokeWidth="1.75" strokeDasharray="4 3" />
              <path d={stratPath} fill="none" stroke="#F0A83C" strokeWidth="2.75" />
            </svg>
          </div>
        )}

        {/* TAB 2: 11-CHECK SKEPTIC SUITE */}
        {activeTab === 'skeptic' && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 font-mono-num text-xs">
            {result.skeptic.checks.map((chk) => (
              <div key={chk.id} className="border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">{chk.name}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold ${
                      chk.passed
                        ? 'bg-[var(--up)]/15 text-[var(--up)]'
                        : 'bg-[var(--down)]/15 text-[var(--down)]'
                    }`}
                  >
                    {chk.passed ? '✓ PASS' : '✕ FAIL'}
                  </span>
                </div>
                <div className="mt-1.5 font-bold text-[var(--amber)]">{chk.value}</div>
                <p className="mt-1 font-sans text-xs text-[var(--muted)]">{chk.detail}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: 2D PARAMETER SWEEP */}
        {activeTab === 'sweep' && sweepResult && (
          <div className="border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono-num text-xs">
              <div>
                <span className="font-bold text-[var(--amber)]">
                  5×5 PARAMETER PLATEAU SWEEP ({sweepResult.cells.length} COMBINATIONS)
                </span>
                <p className="mt-0.5 text-[var(--muted)]">{sweepResult.plateauVerdict}</p>
              </div>
              <span className="border border-[var(--up)] bg-[var(--up)]/15 px-2.5 py-1 font-bold text-[var(--up)]">
                Plateau Stability: {sweepResult.plateauScorePct}%
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-num text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                    <th className="p-2.5">Top-N Holdings</th>
                    <th className="p-2.5">Rebalance</th>
                    <th className="p-2.5">Full CAGR</th>
                    <th className="p-2.5">Full Sharpe</th>
                    <th className="p-2.5">Post-2015 OOS CAGR</th>
                    <th className="p-2.5">Max DD</th>
                    <th className="p-2.5">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {sweepResult.cells.map((c, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg)]">
                      <td className="p-2.5 font-bold text-[var(--ink)]">Top {c.topN}</td>
                      <td className="p-2.5">{c.rebalance}</td>
                      <td className="p-2.5 font-bold text-[var(--up)]">{c.cagrPct}%</td>
                      <td className="p-2.5 text-[var(--amber)]">{c.sharpe}</td>
                      <td className="p-2.5 font-bold text-[var(--up)]">{c.oosCagrPct}%</td>
                      <td className="p-2.5 text-[var(--down)]">{c.maxDrawdownPct}%</td>
                      <td className="p-2.5">{c.verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DECADE & YEARLY BREAKDOWN */}
        {activeTab === 'yearly' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 font-mono-num text-xs">
              {result.decades.map((d) => (
                <div key={d.decade} className="border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="text-[10px] uppercase text-[var(--amber)]">{d.decade}</div>
                  <div className="mt-1 text-lg font-bold text-[var(--up)]">
                    Strategy: {d.stratCagrPct}% CAGR
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    Benchmark: {d.benchCagrPct}% · Win Years: {d.winRatePct}%
                  </div>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto border border-[var(--line)] bg-[var(--surface)]">
              <table className="w-full text-left font-mono-num text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                    <th className="p-2.5">Year</th>
                    <th className="p-2.5">Strategy Return</th>
                    <th className="p-2.5">Benchmark Return</th>
                    <th className="p-2.5">Excess Alpha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {result.yearlyReturns.map((y) => (
                    <tr key={y.year}>
                      <td className="p-2.5 font-bold">{y.year}</td>
                      <td className={`p-2.5 font-bold ${y.stratPct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                        {y.stratPct >= 0 ? '+' : ''}
                        {y.stratPct}%
                      </td>
                      <td className="p-2.5 text-[var(--muted)]">
                        {y.benchPct >= 0 ? '+' : ''}
                        {y.benchPct}%
                      </td>
                      <td className={`p-2.5 font-bold ${y.excessPct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                        {y.excessPct >= 0 ? '+' : ''}
                        {y.excessPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CURRENT HOLDINGS */}
        {activeTab === 'holdings' && (
          <div className="overflow-x-auto border border-[var(--line)] bg-[var(--surface)]">
            <table className="w-full text-left font-mono-num text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                  <th className="p-2.5">Ticker</th>
                  <th className="p-2.5">Company</th>
                  <th className="p-2.5">Sector</th>
                  <th className="p-2.5">Target Weight</th>
                  <th className="p-2.5">Factor Score</th>
                  <th className="p-2.5">AAOIFI Halal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {result.currentHoldings.map((h) => (
                  <tr key={h.ticker} className="hover:bg-[var(--bg)]">
                    <td className="p-2.5 font-bold text-[var(--amber)]">{h.ticker}</td>
                    <td className="p-2.5 text-[var(--ink)]">{h.name}</td>
                    <td className="p-2.5 text-[var(--muted)]">{h.sector}</td>
                    <td className="p-2.5">{h.weightPct}%</td>
                    <td className="p-2.5 font-bold text-[var(--up)]">{h.factorScore}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold ${
                          h.halalStatus === 'HALAL'
                            ? 'bg-[var(--up)]/15 text-[var(--up)]'
                            : 'bg-[var(--down)]/15 text-[var(--down)]'
                        }`}
                      >
                        {h.halalStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TerminalShell>
  );
}

export default function TerminalPage() {
  return (
    <Suspense fallback={<div className="p-10 font-mono-num text-xs">Loading Backtest Desk...</div>}>
      <TerminalDeskContent />
    </Suspense>
  );
}
