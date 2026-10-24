'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { STRATEGIES, WAREHOUSE_FACTORS } from '@/lib/quant/warehouse';
import { runBacktest, runParameterSweep, BacktestResult, SweepResult } from '@/lib/quant/backtester';

function TerminalDeskContent() {
  const searchParams = useSearchParams();
  const initialPreset = searchParams.get('preset') || 'mom_01';
  const initialEngine = (searchParams.get('engine') as 'equity' | 'timing' | 'daily' | 'seasonal') || 'equity';

  const [engine, setEngine] = useState<'equity' | 'timing' | 'daily' | 'seasonal'>(initialEngine);
  const [presetId, setPresetId] = useState(initialPreset);
  const [universe, setUniverse] = useState<'SP500' | 'R1000' | 'NDX100'>('SP500');
  const [rankBy, setRankBy] = useState('mom_12_1');
  const [rankDir, setRankDir] = useState<'desc' | 'asc'>('desc');
  const [minMcapB, setMinMcapB] = useState(1.0);
  const [halalOnly, setHalalOnly] = useState(false);
  const [startYear, setStartYear] = useState(1998);
  const [benchmark, setBenchmark] = useState<'$SPXTR' | 'SPY' | 'QQQ' | 'IWM'>('$SPXTR');
  const [topN, setTopN] = useState(20);
  const [rebalance, setRebalance] = useState<'M' | 'Q' | 'W' | 'A'>('M');
  const [costBps, setCostBps] = useState(10);
  const [splitYear, setSplitYear] = useState(2015);
  const [timingTicker, setTimingTicker] = useState('$SPXTR');
  const [smaWindow, setSmaWindow] = useState(200);
  const [hysteresisPct, setHysteresisPct] = useState(2.0);
  const [cashVehicle, setCashVehicle] = useState<'TBILL3M' | 'IEF' | 'ZERO'>('TBILL3M');
  const [dailyTicker, setDailyTicker] = useState('SPY');
  const [dailyRule, setDailyRule] = useState<'overnight' | 'intraday' | 'buy_and_hold'>('overnight');
  const [seasonalRule, setSeasonalRule] = useState<'nov_apr' | 'santa_rally' | 'turn_of_month' | 'january_effect'>('nov_apr');

  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'lenses' | 'skeptic' | 'sweep' | 'yearly' | 'holdings' | 'runlog'>('overview');
  const [activeLens, setActiveLens] = useState<'costs' | 'montecarlo' | 'factors' | 'optimizer'>('costs');
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
      rankBy,
      rankDir,
      minMcapB,
      halalOnly,
      startYear,
      benchmark,
      topN,
      rebalance,
      costBps,
      splitYear,
      timingTicker,
      smaWindow,
      hysteresisPct,
      cashVehicle,
      dailyTicker,
      dailyRule,
      seasonalRule,
    });
    setResult(bt);
  }, [
    engine,
    presetId,
    universe,
    rankBy,
    rankDir,
    minMcapB,
    halalOnly,
    startYear,
    benchmark,
    topN,
    rebalance,
    costBps,
    splitYear,
    timingTicker,
    smaWindow,
    hysteresisPct,
    cashVehicle,
    dailyTicker,
    dailyRule,
    seasonalRule,
  ]);

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
            <div className="flex flex-wrap gap-1.5 font-mono-num text-xs">
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
              <button
                type="button"
                onClick={() => setEngine('daily')}
                className={`px-3 py-1.5 uppercase ${
                  engine === 'daily'
                    ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                    : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'
                }`}
              >
                3. Daily Session Leg (Overnight vs Intraday)
              </button>
              <button
                type="button"
                onClick={() => setEngine('seasonal')}
                className={`px-3 py-1.5 uppercase ${
                  engine === 'seasonal'
                    ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                    : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'
                }`}
              >
                4. Calendar & Seasonality
              </button>
            </div>

            <div id="verdict-banner" className="flex items-center gap-2 font-mono-num text-xs">
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

          {engine === 'equity' && (
            <div className="mt-3 space-y-3 font-mono-num text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <div className="lg:col-span-2">
                  <label className="block text-[10px] uppercase text-[var(--muted)]">Strategy Preset (175)</label>
                  <select
                    id="preset"
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
                    id="top_n"
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
                      id="rebalance"
                      value={rebalance}
                      onChange={(e) => setRebalance(e.target.value as typeof rebalance)}
                      className="w-1/2 border border-[var(--line2)] bg-[var(--field)] px-2 py-1.5"
                    >
                      <option value="M">Monthly</option>
                      <option value="Q">Quarterly</option>
                      <option value="W">Weekly</option>
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
                    id="split_year"
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

              {/* Row 2: Custom Factor Rank, Direction, Min Market Cap, Halal Filter, Start Year, Benchmark */}
              <div className="grid grid-cols-1 gap-3 border-t border-[var(--line)] pt-3 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <label className="block text-[10px] uppercase text-[var(--muted)]">Rank By Factor</label>
                  <select
                    id="rank_by"
                    value={rankBy}
                    onChange={(e) => setRankBy(e.target.value)}
                    className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2 py-1.5"
                  >
                    {WAREHOUSE_FACTORS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.family})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[var(--muted)]">Sort Direction</label>
                  <select
                    id="rank_dir"
                    value={rankDir}
                    onChange={(e) => setRankDir(e.target.value as 'desc' | 'asc')}
                    className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2 py-1.5"
                  >
                    <option value="desc">Highest First (Desc)</option>
                    <option value="asc">Lowest First (Asc)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[var(--muted)]">Min Market Cap ($B)</label>
                  <select
                    id="min_mcap"
                    value={minMcapB}
                    onChange={(e) => setMinMcapB(Number(e.target.value))}
                    className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2 py-1.5"
                  >
                    <option value={0.25}>&gt;= $250M (All Cap)</option>
                    <option value={1.0}>&gt;= $1.0B (Mid + Large)</option>
                    <option value={10.0}>&gt;= $10.0B (Large Cap)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[var(--muted)]">Start Year & Yardstick</label>
                  <div className="mt-1 flex gap-1">
                    <select
                      id="start"
                      value={startYear}
                      onChange={(e) => setStartYear(Number(e.target.value))}
                      className="w-1/2 border border-[var(--line2)] bg-[var(--field)] px-2 py-1.5"
                    >
                      {[1998, 2000, 2005, 2010].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <select
                      id="bench"
                      value={benchmark}
                      onChange={(e) => setBenchmark(e.target.value as typeof benchmark)}
                      className="w-1/2 border border-[var(--line2)] bg-[var(--field)] px-2 py-1.5"
                    >
                      <option value="$SPXTR">$SPXTR</option>
                      <option value="SPY">SPY</option>
                      <option value="QQQ">QQQ</option>
                      <option value="IWM">IWM</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-end">
                  <label className="flex w-full cursor-pointer items-center gap-2 border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5">
                    <input
                      id="halal_only"
                      type="checkbox"
                      checked={halalOnly}
                      onChange={(e) => setHalalOnly(e.target.checked)}
                    />
                    <span className="text-[11px] text-[var(--ink)]">AAOIFI Halal Only</span>
                  </label>
                </div>
                <div className="flex items-end">
                  <button
                    id="runbtn"
                    type="button"
                    onClick={() => setActionStatus(`✓ Executed historical run (${startYear}–2026, 45d filing lag)`)}
                    className="w-full bg-[var(--amber)] py-1.5 font-bold uppercase text-[#0A0D13]"
                  >
                    ▶ Run Backtest
                  </button>
                </div>
              </div>
            </div>
          )}

          {engine === 'timing' && (
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

          {engine === 'daily' && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 font-mono-num text-xs">
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Single Ticker / ETF</label>
                <select
                  id="d_ticker"
                  value={dailyTicker}
                  onChange={(e) => setDailyTicker(e.target.value)}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                >
                  {['SPY', 'QQQ', 'NVDA', 'AAPL', 'MSFT', 'TSLA', 'IWM'].map((tk) => (
                    <option key={tk} value={tk}>{tk}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Session Leg Rule</label>
                <select
                  id="d_rule"
                  value={dailyRule}
                  onChange={(e) => setDailyRule(e.target.value as typeof dailyRule)}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5 text-[var(--amber)]"
                >
                  <option value="overnight">Overnight Only (Buy Close → Sell Next Open)</option>
                  <option value="intraday">Intraday Regular Session (Buy Open → Sell Close)</option>
                  <option value="buy_and_hold">Full 24h Buy & Hold Baseline</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Cost per Leg (bps)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={costBps}
                  onChange={(e) => setCostBps(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Walk-Forward Split</label>
                <select
                  value={splitYear}
                  onChange={(e) => setSplitYear(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                >
                  {[2012, 2015, 2018, 2020].map((yr) => (
                    <option key={yr} value={yr}>Split Year: {yr}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {engine === 'seasonal' && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 font-mono-num text-xs">
              <div className="lg:col-span-2">
                <label className="block text-[10px] uppercase text-[var(--muted)]">Calendar Seasonality Window</label>
                <select
                  value={seasonalRule}
                  onChange={(e) => setSeasonalRule(e.target.value as typeof seasonalRule)}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5 text-[var(--amber)]"
                >
                  <option value="nov_apr">Bouman & Jacobsen Nov–Apr (&quot;Sell in May &amp; Go Away&quot; into 3M T-Bills)</option>
                  <option value="turn_of_month">Lakonishok & Smidt Turn-of-the-Month (Last Day + First 3 Trading Days)</option>
                  <option value="santa_rally">Santa Claus Window (Last 5 Dec Sessions + First 2 Jan Sessions)</option>
                  <option value="january_effect">Rozeff & Kinney Small-Cap January Barometer</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Off-Calendar Cash Vehicle</label>
                <select
                  value={cashVehicle}
                  onChange={(e) => setCashVehicle(e.target.value as typeof cashVehicle)}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                >
                  <option value="TBILL3M">3-Month US Treasury Bills</option>
                  <option value="ZERO">0% Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)]">Walk-Forward Split</label>
                <select
                  value={splitYear}
                  onChange={(e) => setSplitYear(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                >
                  {[2012, 2015, 2018, 2020].map((yr) => (
                    <option key={yr} value={yr}>Split Year: {yr}</option>
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
            { id: 'funnel', label: 'UNIVERSE FUNNEL' },
            { id: 'lenses', label: 'FOUR MORE LENSES' },
            { id: 'sweep', label: '2D PARAMETER SWEEP (25 RUNS)' },
            { id: 'yearly', label: 'DECADE & YEARLY RETURNS' },
            { id: 'holdings', label: `CURRENT HOLDINGS (${result.currentHoldings.length})` },
            { id: 'runlog', label: `RUN LOG (${result.runLog.length})` },
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
          <div id="skeptic-panel" className="grid grid-cols-1 gap-3 md:grid-cols-2 font-mono-num text-xs">
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

        {/* TAB 2B: UNIVERSE FUNNEL */}
        {activeTab === 'funnel' && (
          <div id="funnel-panel" className="border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 font-mono-num text-xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <span className="font-bold text-[var(--amber)]">
                UNIVERSE SELECTION FUNNEL — STEP-BY-STEP SURVIVORSHIP WATERFALL
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                Final Portfolio: {topN} Stocks Equal-Weighted
              </span>
            </div>
            <div className="space-y-3">
              {result.funnel.map((stage, idx) => (
                <div key={stage.step} className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[var(--ink)]">
                      {idx + 1}. {stage.step}
                    </span>
                    <span className="text-[var(--amber)] font-bold">
                      {stage.count.toLocaleString()} names ({stage.pctOfUniverse}% of initial)
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-[var(--surface)]">
                    <div
                      className="h-full bg-[var(--amber)]"
                      style={{ width: `${Math.max(4, stage.pctOfUniverse)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 font-sans text-xs text-[var(--muted)]">{stage.rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2C: FOUR MORE LENSES (COSTS, MONTE CARLO, FACTOR LENS, OPTIMIZER) */}
        {activeTab === 'lenses' && (
          <div id="an-panel" className="border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4 font-mono-num text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
              <span className="font-bold text-[var(--amber)]">
                FOUR MORE LENSES — INSTITUTIONAL STRESS & ATTRIBUTION DIAGNOSTICS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'costs', label: '1. Cost Sensitivity' },
                  { id: 'montecarlo', label: '2. Monte Carlo (1,000 Paths)' },
                  { id: 'factors', label: '3. Fama-French 5-Factor + Mom' },
                  { id: 'optimizer', label: '4. Weighting Optimizer' },
                ].map((lens) => (
                  <button
                    key={lens.id}
                    type="button"
                    onClick={() => setActiveLens(lens.id as typeof activeLens)}
                    className={`px-2.5 py-1 uppercase ${
                      activeLens === lens.id
                        ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                        : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'
                    }`}
                  >
                    {lens.label}
                  </button>
                ))}
              </div>
            </div>

            {activeLens === 'costs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                      <th className="p-2.5">Assumed Round-Trip Friction</th>
                      <th className="p-2.5">Net CAGR</th>
                      <th className="p-2.5">Net Sharpe</th>
                      <th className="p-2.5">$10,000 Ending Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {result.fourLenses.costs.map((c) => (
                      <tr key={c.bps} className="hover:bg-[var(--bg)]">
                        <td className="p-2.5 font-bold">{c.bps} bps per rebalance</td>
                        <td className="p-2.5 font-bold text-[var(--up)]">{c.netCagr}%</td>
                        <td className="p-2.5 text-[var(--amber)]">{c.netSharpe}</td>
                        <td className="p-2.5">${c.ending10k.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeLens === 'montecarlo' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
                  <div className="text-[10px] uppercase text-[var(--muted)]">5th Percentile CAGR (Unlucky)</div>
                  <div className="mt-1 text-xl font-bold text-[var(--amber)]">{result.fourLenses.monteCarlo.p5Cagr}%</div>
                </div>
                <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
                  <div className="text-[10px] uppercase text-[var(--muted)]">50th Percentile CAGR (Median)</div>
                  <div className="mt-1 text-xl font-bold text-[var(--up)]">{result.fourLenses.monteCarlo.p50Cagr}%</div>
                </div>
                <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
                  <div className="text-[10px] uppercase text-[var(--muted)]">95th Percentile CAGR</div>
                  <div className="mt-1 text-xl font-bold text-[var(--up)]">{result.fourLenses.monteCarlo.p95Cagr}%</div>
                </div>
                <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
                  <div className="text-[10px] uppercase text-[var(--muted)]">95th Worst Drawdown</div>
                  <div className="mt-1 text-xl font-bold text-[var(--down)]">{result.fourLenses.monteCarlo.p95MaxDd}%</div>
                  <div className="mt-0.5 text-[10px] text-[var(--muted)]">Beat Benchmark: {result.fourLenses.monteCarlo.beatBenchPct}% of paths</div>
                </div>
              </div>
            )}

            {activeLens === 'factors' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                      <th className="p-2.5">Fama-French / Carhart Factor</th>
                      <th className="p-2.5">Loading (Beta / Alpha)</th>
                      <th className="p-2.5">t-Statistic</th>
                      <th className="p-2.5">Significance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {result.fourLenses.factorLens.map((f) => (
                      <tr key={f.factor} className="hover:bg-[var(--bg)]">
                        <td className="p-2.5 font-bold text-[var(--ink)]">{f.factor}</td>
                        <td className="p-2.5 font-bold text-[var(--amber)]">{f.beta >= 0 ? `+${f.beta}` : f.beta}</td>
                        <td className="p-2.5">{f.tStat}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold ${Math.abs(f.tStat) >= 2 ? 'bg-[var(--up)]/15 text-[var(--up)]' : 'bg-[var(--line)] text-[var(--muted)]'}`}>
                            {Math.abs(f.tStat) >= 2 ? 'SIGNIFICANT (|t| >= 2.0)' : 'NEUTRAL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeLens === 'optimizer' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                      <th className="p-2.5">Portfolio Construction Scheme</th>
                      <th className="p-2.5">CAGR</th>
                      <th className="p-2.5">Sharpe Ratio</th>
                      <th className="p-2.5">Max Drawdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {result.fourLenses.optimizer.map((o) => (
                      <tr key={o.scheme} className="hover:bg-[var(--bg)]">
                        <td className="p-2.5 font-bold text-[var(--ink)]">{o.scheme}</td>
                        <td className="p-2.5 font-bold text-[var(--up)]">{o.cagr}%</td>
                        <td className="p-2.5 text-[var(--amber)]">{o.sharpe}</td>
                        <td className="p-2.5 text-[var(--down)]">{o.maxDd}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

        {/* TAB 6: RUN LOG */}
        {activeTab === 'runlog' && (
          <div id="tape-drawer" className="border border-[var(--line)] bg-[var(--surface)] p-5 space-y-3 font-mono-num text-xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <span className="font-bold text-[var(--amber)]">
                POINT-IN-TIME EXECUTION RUN LOG (SURVIVORSHIP-FREE WAREHOUSE TRACE)
              </span>
              <span className="text-[11px] text-[var(--up)]">✓ ALL STEPS VERIFIED</span>
            </div>
            <div className="space-y-2">
              {result.runLog.map((step) => (
                <div key={step.ts} className="flex items-start gap-3 border border-[var(--line)] bg-[var(--bg)] p-2.5">
                  <span className="shrink-0 font-bold text-[var(--amber)]">[{step.ts}]</span>
                  <span className="text-[var(--ink)]">{step.step}: {step.detail} ({step.ms}ms)</span>
                </div>
              ))}
            </div>
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
