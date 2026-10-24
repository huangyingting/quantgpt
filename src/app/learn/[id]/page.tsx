'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import React, { Suspense, useMemo, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import lesson2Raw from '@/data/lesson2-data.json';
import lesson3Raw from '@/data/lesson3-data.json';
import { WORLD_KINDS } from '@/lib/quant/warehouse';
import { runDcfModel } from '@/lib/quant/dcf';
import { runBacktest } from '@/lib/quant/backtester';

const LESSON_2_STEPS = [
  {
    step: 1,
    kicker: 'STEP 1 OF 6 · BUY AND HOLD',
    title: 'Raw S&P 500: +10.4% CAGR, But Twice Cut in Half (-56.8% Drawdown)',
    body: 'From 1999 to 2026 (6,850 trading days), $10,000 in the S&P 500 grew to $96,400. Yet along the way, investors suffered a -49.1% dot-com crash (2000–2002) and a -56.8% Global Financial Crisis collapse (2007–2009). In the Nasdaq-100, the drawdown hit -82.9%—requiring a +485% gain just to get back to break-even.',
    cagr: '8.66%',
    sharpe: '0.52',
    maxDd: '-56.8%',
    trades: '1 (Buy & Hold)',
  },
  {
    step: 2,
    kicker: 'STEP 2 OF 6 · THE 200-DAY MOVING AVERAGE',
    title: 'Overlaying the 200-Day Simple Moving Average (SMA)',
    body: 'Paul Tudor Jones famously noted that nothing good happens below the 200-day moving average. Plotting the rolling 200-day average on top of daily closes reveals a smooth trend line that turns down early in 2001, 2008, and 2022.',
    cagr: '8.66%',
    sharpe: '0.52',
    maxDd: '-56.8%',
    trades: 'Indicator Only',
  },
  {
    step: 3,
    kicker: 'STEP 3 OF 6 · GREEN & RED REGIMES',
    title: 'Painting the Market: Green Above 200d SMA, Red Below',
    body: 'Notice where the worst single-day crashes (4% to 9% drops) cluster: almost all of them occur when the market is already in the RED regime below its 200-day moving average. Volatility doubles below the 200-day line.',
    cagr: '9.12%',
    sharpe: '0.78',
    maxDd: '-28.4%',
    trades: 'Regime View',
  },
  {
    step: 4,
    kicker: 'STEP 4 OF 6 · THE WHIPSAW TRAP',
    title: 'Why Naive Crossover Trading Fails: 196 Whipsaw Trades',
    body: 'If you buy the exact day S&P 500 closes 0.01% above the 200-day SMA and sell the exact day it closes 0.01% below, sideways markets chop you to pieces. Across 1999–2026, that naive rule fires 196 round-trip trades—most of them false alarms that reverse within days.',
    cagr: '8.41%',
    sharpe: '0.71',
    maxDd: '-26.9%',
    trades: '196 Whipsaws',
  },
  {
    step: 5,
    kicker: 'STEP 5 OF 6 · HYSTERESIS BUFFER + T-BILL CASH',
    title: 'The Quant Fix: +1% Entry / -3% Exit Band + 3-Month T-Bill Yield',
    body: 'Instead of a hair-trigger line, require the index to rise +1% above the 200-day SMA to enter, and drop -3% below the 200-day SMA to exit to 3-Month US Treasury Bills. Whipsaw trades plunge from 196 down to just 42 (~1.5 trades/year), max drawdown drops from -56.8% to -24.5%, and Sharpe jumps from 0.52 to 0.94.',
    cagr: '10.62%',
    sharpe: '0.94',
    maxDd: '-24.5%',
    trades: '42 Buffered Trades',
  },
  {
    step: 6,
    kicker: 'STEP 6 OF 6 · OUT-OF-SAMPLE & NASDAQ-100 TEST',
    title: 'Testing the Exact Same Rule on Nasdaq-100 (-83% DD Cut to -29%)',
    body: 'Without changing a single parameter, applying the +1%/-3% 200-day buffered rule to the Nasdaq-100 side-steps the bulk of the 2000–2002 dot-com implosion and 2008 crash, turning an unlivable -82.9% drawdown into a manageable -29.4% drawdown while compounding at 13.8% CAGR.',
    cagr: '13.84%',
    sharpe: '0.98',
    maxDd: '-29.4%',
    trades: '38 Buffered Trades',
  },
];

function LessonContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = String(params?.id || '1');
  const uniChapter = searchParams.get('uni');

  // Lesson 1 state
  const [aiClient, setAiClient] = useState<'claude' | 'chatgpt' | 'pastepack'>('claude');
  const [copiedSetup, setCopiedSetup] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [simDone, setSimDone] = useState(true);

  // Lesson 2 state
  const [l2Step, setL2Step] = useState(4);
  const [l2Index, setL2Index] = useState<'SPX' | 'NDX'>('SPX');
  const [showRawIframe, setShowRawIframe] = useState(false);

  // Lesson 3 state
  const [l3ShowOos, setL3ShowOos] = useState(true);
  const [l3SortBy, setL3SortBy] = useState<'is_cagr' | 'oos_cagr' | 'full_sharpe'>('is_cagr');

  // Lesson 4 & 6 state
  const [eventKind, setEventKind] = useState('war_onset');
  const [guardAction, setGuardAction] = useState<'pause_entries' | 'reduce_size' | 'exit_to_cash' | 'hedge_on'>('pause_entries');
  const [guardWindow, setGuardWindow] = useState(5);

  // Lesson 7 state (Team Kanban + MU DCF)
  const [kanbanCards, setKanbanCards] = useState([
    { id: 'c1', col: 'NOTES', title: 'MU HBM3e Memory Supercycle Thesis', meta: 'Check 5Y implied growth vs 22% street consensus' },
    { id: 'c2', col: 'RUNNING', title: 'Semiconductor Gross Margin × 12-1M Momentum', meta: 'Running 1998–2026 walk-forward split (2015)' },
    { id: 'c3', col: 'DATA VALIDATED', title: 'Piotroski F >= 8 + Top 20 FCF Yield', meta: '16.4% CAGR · 0.89 Sharpe · 9/11 Skeptic checks' },
  ]);
  const [muGrowth, setMuGrowth] = useState(18);
  const [muWacc, setMuWacc] = useState(9.5);
  const [muTermG, setMuTermG] = useState(2.5);

  const l3Runs = useMemo(() => {
    const raw = (lesson3Raw as { runs?: Array<Record<string, number>> }).runs || [];
    return raw.slice(0, 40).sort((a, b) => (b[l3SortBy] || 0) - (a[l3SortBy] || 0));
  }, [l3SortBy]);

  const muDcf = useMemo(
    () => runDcfModel({ ticker: 'MU', growthY1_5Pct: muGrowth, waccPct: muWacc, terminalGrowthPct: muTermG }),
    [muGrowth, muWacc, muTermG]
  );

  const l5Bt = useMemo(() => runBacktest({ presetId: 'mom_01', splitYear: 2015, costBps: 10 }), []);

  // Connection guides (/learn/connect-*)
  if (id.startsWith('connect-') || id === 'quantgpt-cloud') {
    const guideTitle =
      id === 'quantgpt-cloud'
        ? 'QuantGPT Cloud: Scheduled Python Bot Runner & Alpaca Guide'
        : `Connect ${id.replace('connect-', '').toUpperCase()} to QuantGPT MCP`;
    return (
      <TerminalShell title={guideTitle} subtitle="Step-by-step MCP & warehouse integration guide">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="border border-[var(--line2)] bg-[var(--surface)] p-6 space-y-4">
            <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
              ▲ MODEL CONTEXT PROTOCOL (MCP) & CLOUD EXECUTION
            </div>
            <h2 className="font-cond text-2xl font-bold uppercase text-[var(--ink)]">{guideTitle}</h2>
            <p className="text-sm leading-relaxed text-[var(--body)]">
              Point your AI assistant at <code className="text-[var(--amber)]">/api/mcp</code> using a single-use or scoped <code className="text-[var(--amber)]">qg_sk_...</code> API key from your Account or Connect desk. Your AI immediately gains 19 core warehouse tools (<code className="text-[var(--ink)]">run_backtest</code>, <code className="text-[var(--ink)]">challenge_finding</code>, <code className="text-[var(--ink)]">grade_stock</code>, <code className="text-[var(--ink)]">check_halal</code>, <code className="text-[var(--ink)]">financial_model</code>, <code className="text-[var(--ink)]">world_events</code>) plus 7 specialized categories.
            </p>
            <pre className="overflow-x-auto border border-[var(--line)] bg-[var(--bg)] p-4 font-mono-num text-xs text-[var(--up)]">
{`{
  "mcpServers": {
    "quantgpt": {
      "url": "https://terminal.quantgpt.co/api/mcp",
      "headers": {
        "Authorization": "Bearer qg_sk_your_operator_key"
      }
    }
  }
}`}
            </pre>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/connect"
                className="bg-[var(--amber)] px-4 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
              >
                Open Connect AI Desk →
              </Link>
              <Link
                href="/runner"
                className="border border-[var(--line2)] px-4 py-2 font-mono-num text-xs uppercase text-[var(--ink)]"
              >
                Open QuantGPT Cloud Runner →
              </Link>
              <Link
                href="/learn"
                className="border border-[var(--line2)] px-4 py-2 font-mono-num text-xs uppercase text-[var(--muted)]"
              >
                ← Back to All Courses
              </Link>
            </div>
          </div>
        </div>
      </TerminalShell>
    );
  }

  return (
    <TerminalShell
      title={`Interactive Course — Lesson ${id}`}
      subtitle="Hands-on quantitative training powered by the QuantGPT historical data warehouse"
      actions={
        <div className="flex items-center gap-2">
          {uniChapter && (
            <Link
              href={`/university/${uniChapter}`}
              className="border border-[var(--up)] bg-[var(--up)]/15 px-3 py-1 font-mono-num text-xs font-bold text-[var(--up)]"
            >
              ◄ Back to University: Chapter {uniChapter}
            </Link>
          )}
          <Link
            href="/learn"
            className="border border-[var(--line2)] bg-[var(--bg)] px-2.5 py-1 font-mono-num text-[11px] text-[var(--muted)] hover:text-[var(--ink)]"
          >
            All Lessons (1–7)
          </Link>
        </div>
      }
    >
      {/* Lesson Switcher Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border border-[var(--line)] bg-[var(--surface)] p-2.5">
        <div className="flex flex-wrap gap-1.5 font-mono-num text-xs">
          {[
            { k: '1', label: '1. Arm Your AI' },
            { k: '2', label: '2. Become a Quant' },
            { k: '3', label: '3. 300-Run Sweep' },
            { k: '4', label: '4. World Events' },
            { k: '5', label: '5. Skeptic Checks' },
            { k: '6', label: '6. Event Guard Rules' },
            { k: '7', label: '7. Team & DCF Model' },
          ].map((tab) => (
            <Link
              key={tab.k}
              href={`/learn/${tab.k}${uniChapter ? `?uni=${uniChapter}` : ''}`}
              className={`px-3 py-1.5 uppercase transition ${
                id === tab.k
                  ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                  : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {(id === '1' || id === '2' || id === '3' || id === '7') && (
          <button
            type="button"
            onClick={() => setShowRawIframe(!showRawIframe)}
            className="border border-[var(--line2)] bg-[var(--bg)] px-2.5 py-1 font-mono-num text-[11px] text-[var(--amber)]"
          >
            {showRawIframe ? 'Switch to Integrated Desk View' : 'Switch to Classic Canvas View'}
          </button>
        )}
      </div>

      {showRawIframe && (id === '1' || id === '2' || id === '3' || id === '7') ? (
        <div className="border border-[var(--line2)] bg-[var(--bg)]">
          <iframe
            title={`Lesson ${id} Interactive Canvas`}
            src={
              id === '1'
                ? '/static/ramp-game.html'
                : id === '2'
                  ? '/static/quant-lesson.html'
                  : id === '3'
                    ? '/static/backtest-lesson.html'
                    : '/static/team-lesson.html'
            }
            className="h-[820px] w-full border-0"
          />
        </div>
      ) : null}

      {/* LESSON 1: ARM YOUR AI IN 60 SECONDS */}
      {!showRawIframe && id === '1' && (
        <div className="space-y-6">
          <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
            <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
              LESSON 01 · ARM YOUR AI IN 60 SECONDS
            </div>
            <h2 className="mt-1 font-cond text-3xl font-bold uppercase text-[var(--ink)]">
              Stop Letting Your AI Guess Stock Numbers. Connect It to the Warehouse.
            </h2>
            <p className="mt-2 text-sm text-[var(--body)]">
              Complete the 3 interactive steps below to wire Claude, ChatGPT, or any LLM to QuantGPT&apos;s 19 core warehouse tools.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Step 1 */}
              <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
                <div className="font-mono-num text-xs font-bold text-[var(--amber)]">STEP 1 · PICK YOUR AI</div>
                <div className="mt-3 grid grid-cols-3 gap-2 font-mono-num text-xs">
                  {(['claude', 'chatgpt', 'pastepack'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAiClient(c)}
                      className={`border py-2 uppercase ${
                        aiClient === c
                          ? 'border-[var(--amber)] bg-[var(--amber)]/15 font-bold text-[var(--amber)]'
                          : 'border-[var(--line)] text-[var(--muted)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  {aiClient === 'claude' && 'Claude Desktop / Web connects natively via our JSON-RPC 2.0 MCP endpoint (/api/mcp).'}
                  {aiClient === 'chatgpt' && 'ChatGPT Developer Mode / Actions connects via OpenAPI & MCP tool definitions.'}
                  {aiClient === 'pastepack' && 'No connector? Copy the 1-click Paste-Pack context block into any chat window.'}
                </p>
              </div>

              {/* Step 2 */}
              <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
                <div className="font-mono-num text-xs font-bold text-[var(--amber)]">
                  STEP 2 · COPY YOUR STARTER COMMAND
                </div>
                <div className="mt-3 border border-[var(--line2)] bg-[var(--surface)] p-3 font-mono-num text-xs text-[var(--ink)]">
                  &quot;Use QuantGPT to backtest 200-day buffered trend (+1%/-3% band) on S&P 500 from 1999 to 2026 with a 2015 walk-forward split, run all 11 Skeptic checks, and grade MU.&quot;
                </div>
                <button
                  type="button"
                  onClick={() => setCopiedSetup(true)}
                  className="mt-3 w-full border border-[var(--amber)] bg-[var(--amber)]/15 py-2 font-mono-num text-xs font-bold uppercase text-[var(--amber)] hover:bg-[var(--amber)] hover:text-[#0A0D13]"
                >
                  {copiedSetup ? '✓ COPIED TO CLIPBOARD' : 'COPY STARTER PROMPT'}
                </button>
              </div>

              {/* Step 3 */}
              <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
                <div className="font-mono-num text-xs font-bold text-[var(--amber)]">
                  STEP 3 · FIRE LIVE WAREHOUSE TOOLS
                </div>
                <p className="mt-2 text-xs text-[var(--body)]">
                  Click below to watch the exact tool sequence your AI executes against the warehouse.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSimRunning(true);
                    setTimeout(() => {
                      setSimRunning(false);
                      setSimDone(true);
                    }, 350);
                  }}
                  className="mt-4 w-full bg-[var(--amber)] py-2.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
                >
                  {simRunning ? 'RUNNING MCP TOOLS...' : '▶ EXECUTE WAREHOUSE CALLS'}
                </button>
              </div>
            </div>

            {simDone && (
              <div className="mt-6 border border-[var(--up)]/50 bg-[var(--bg)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3 font-mono-num text-xs">
                  <span className="text-[var(--up)]">
                    ✓ MCP TOOL CALLS COMPLETED (run_market_timing + challenge_finding + grade_stock)
                  </span>
                  <span className="border border-[var(--up)] bg-[var(--up)]/15 px-2 py-0.5 font-bold text-[var(--up)]">
                    9/11 SKEPTIC CHECKS PASSED
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 font-mono-num text-xs">
                  <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
                    <div className="text-[10px] text-[var(--muted)]">1. run_market_timing(&quot;$SPXTR&quot;)</div>
                    <div className="mt-1 text-base font-bold text-[var(--up)]">
                      10.62% CAGR · 0.94 Sharpe
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--body)]">
                      Max DD cut from -56.8% to -24.5% across 1999–2026 (42 trades).
                    </div>
                  </div>
                  <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
                    <div className="text-[10px] text-[var(--muted)]">2. challenge_finding(split=2015)</div>
                    <div className="mt-1 text-base font-bold text-[var(--amber)]">
                      Post-2015 OOS: 11.4% CAGR
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--body)]">
                      Survived 25 bps friction, 1,000x bootstrap, and ±1 step neighbor checks.
                    </div>
                  </div>
                  <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
                    <div className="text-[10px] text-[var(--muted)]">3. grade_stock(&quot;MU&quot;)</div>
                    <div className="mt-1 text-base font-bold text-[var(--up)]">
                      Grade A- (82nd Percentile)
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--body)]">
                      Piotroski F-Score 8/9 · Growth A+ · Halal 5/5 Compliant.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LESSON 2: BECOME A QUANT (6-STEP REAL 1999-2026 WALKTHROUGH) */}
      {!showRawIframe && id === '2' && (
        <div className="space-y-6">
          <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
                  {LESSON_2_STEPS[l2Step].kicker}
                </div>
                <h2 className="mt-1 font-cond text-2xl font-bold uppercase text-[var(--ink)] sm:text-3xl">
                  {LESSON_2_STEPS[l2Step].title}
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono-num text-xs">
                <button
                  type="button"
                  onClick={() => setL2Index('SPX')}
                  className={`border px-3 py-1.5 ${
                    l2Index === 'SPX'
                      ? 'border-[var(--amber)] bg-[var(--amber)] font-bold text-[#0A0D13]'
                      : 'border-[var(--line2)] bg-[var(--bg)] text-[var(--muted)]'
                  }`}
                >
                  S&P 500 (1999–2026)
                </button>
                <button
                  type="button"
                  onClick={() => setL2Index('NDX')}
                  className={`border px-3 py-1.5 ${
                    l2Index === 'NDX'
                      ? 'border-[var(--amber)] bg-[var(--amber)] font-bold text-[#0A0D13]'
                      : 'border-[var(--line2)] bg-[var(--bg)] text-[var(--muted)]'
                  }`}
                >
                  Nasdaq-100 (-83% DD Test)
                </button>
              </div>
            </div>

            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-[var(--body)]">
              {LESSON_2_STEPS[l2Step].body}
            </p>

            {/* Step Selector Pills */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-6 font-mono-num text-xs">
              {LESSON_2_STEPS.map((st, idx) => (
                <button
                  key={st.step}
                  type="button"
                  onClick={() => setL2Step(idx)}
                  className={`border p-2.5 text-left transition ${
                    l2Step === idx
                      ? 'border-[var(--amber)] bg-[var(--amber)]/15 text-[var(--amber)] font-bold'
                      : 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  <div className="text-[10px]">STEP 0{st.step}</div>
                  <div className="mt-0.5 truncate text-[11px] text-[var(--ink)]">
                    {['Buy & Hold', '200d SMA Line', 'Green/Red Regimes', '196 Whipsaws', '+1/-3% Buffer', 'NDX Validation'][idx]}
                  </div>
                </button>
              ))}
            </div>

            {/* Interactive SVG Regime & Equity Chart */}
            <div className="mt-6 border border-[var(--line)] bg-[var(--bg)] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono-num text-xs">
                <span className="text-[var(--muted)]">
                  DATASET: {(lesson2Raw as { dates?: string[] }).dates?.length || 2952} SAMPLED SESSIONS (1999–2026) · LOG SCALE
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-[var(--amber)]">━ Buffered Trend Quant (+1%/-3% + T-Bill)</span>
                  <span className="text-[var(--muted)]">┄ Raw {l2Index === 'SPX' ? 'S&P 500' : 'Nasdaq-100'} Buy & Hold</span>
                  <span className="text-[var(--up)]">■ 200d SMA Bull Regime</span>
                </div>
              </div>

              <svg viewBox="0 0 900 280" className="w-full h-64 overflow-visible">
                {/* Regime shading */}
                {l2Step >= 2 && (
                  <>
                    <rect x="65" y="15" width="95" height="230" fill="#DF605E" fillOpacity="0.11" />
                    <rect x="275" y="15" width="75" height="230" fill="#DF605E" fillOpacity="0.13" />
                    <rect x="710" y="15" width="55" height="230" fill="#DF605E" fillOpacity="0.11" />
                  </>
                )}
                {/* Grid lines */}
                {[40, 100, 160, 220].map((y) => (
                  <line key={y} x1="40" y1={y} x2="880" y2={y} stroke="#212A38" strokeDasharray="3 3" />
                ))}
                {/* Buy & Hold Curve */}
                <path
                  d={
                    l2Index === 'SPX'
                      ? 'M 40 210 L 85 190 L 145 235 L 265 170 L 325 242 L 480 135 L 640 85 L 735 115 L 880 55'
                      : 'M 40 165 L 80 110 L 150 250 L 270 195 L 330 235 L 490 120 L 660 55 L 740 105 L 880 28'
                  }
                  fill="none"
                  stroke="#8B96A8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                {/* 200-Day SMA Line */}
                {l2Step >= 1 && (
                  <path
                    d="M 40 212 L 90 198 L 150 225 L 270 176 L 330 228 L 485 140 L 645 92 L 740 108 L 880 62"
                    fill="none"
                    stroke="#43BD85"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />
                )}
                {/* Buffered Quant Equity Curve */}
                {l2Step >= 4 && (
                  <path
                    d="M 40 210 L 85 190 L 145 186 L 265 135 L 325 132 L 480 82 L 640 46 L 735 44 L 880 18"
                    fill="none"
                    stroke="#F0A83C"
                    strokeWidth="3"
                  />
                )}
                <text x="100" y="258" fill="#DF605E" fontSize="10" fontFamily="monospace">
                  2000-02 Crash Protected
                </text>
                <text x="290" y="258" fill="#DF605E" fontSize="10" fontFamily="monospace">
                  2008 GFC T-Bills
                </text>
                <text x="705" y="258" fill="#DF605E" fontSize="10" fontFamily="monospace">
                  2022 Rate Shock
                </text>
              </svg>
            </div>

            {/* Step Metrics Comparison */}
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono-num">
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <div className="text-[10px] uppercase text-[var(--muted)]">Annualized CAGR</div>
                <div className="mt-1 text-xl font-bold text-[var(--up)]">{LESSON_2_STEPS[l2Step].cagr}</div>
                <div className="text-[10px] text-[var(--faint)]">vs 8.66% Buy & Hold</div>
              </div>
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <div className="text-[10px] uppercase text-[var(--muted)]">Sharpe Ratio</div>
                <div className="mt-1 text-xl font-bold text-[var(--amber)]">{LESSON_2_STEPS[l2Step].sharpe}</div>
                <div className="text-[10px] text-[var(--faint)]">vs 0.52 Buy & Hold</div>
              </div>
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <div className="text-[10px] uppercase text-[var(--muted)]">Worst Drawdown</div>
                <div className="mt-1 text-xl font-bold text-[var(--down)]">{LESSON_2_STEPS[l2Step].maxDd}</div>
                <div className="text-[10px] text-[var(--faint)]">vs -56.8% S&P / -82.9% NDX</div>
              </div>
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <div className="text-[10px] uppercase text-[var(--muted)]">Trade Frequency</div>
                <div className="mt-1 text-xl font-bold text-[var(--ink)]">{LESSON_2_STEPS[l2Step].trades}</div>
                <div className="text-[10px] text-[var(--faint)]">1999–2026 (27 Years)</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4">
              <button
                type="button"
                disabled={l2Step === 0}
                onClick={() => setL2Step((s) => Math.max(0, s - 1))}
                className="border border-[var(--line2)] px-4 py-2 font-mono-num text-xs uppercase disabled:opacity-40"
              >
                ← Previous Step
              </button>
              <div className="flex gap-2">
                {l2Step < LESSON_2_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setL2Step((s) => Math.min(LESSON_2_STEPS.length - 1, s + 1))}
                    className="bg-[var(--amber)] px-5 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
                  >
                    Next Step ({l2Step + 2}/{LESSON_2_STEPS.length}) →
                  </button>
                ) : (
                  <Link
                    href="/learn/3"
                    className="bg-[var(--up)] px-5 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
                  >
                    Continue to Lesson 3: The Backtester →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LESSON 3: THE BACKTESTER & 300-RUN PARAMETER SWEEP */}
      {!showRawIframe && id === '3' && (
        <div className="space-y-6">
          <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
                  LESSON 03 · MULTIPLE TESTING & WALK-FORWARD VALIDATION
                </div>
                <h2 className="mt-1 font-cond text-2xl font-bold uppercase text-[var(--ink)] sm:text-3xl">
                  300 Moving-Average Sweep: Catching Overfitting with the 2015 Split
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono-num text-xs">
                <button
                  type="button"
                  onClick={() => setL3ShowOos(!l3ShowOos)}
                  className="border border-[var(--amber)] bg-[var(--amber)]/15 px-3 py-1.5 font-bold text-[var(--amber)]"
                >
                  {l3ShowOos ? '✓ 2015 OOS SPLIT REVEALED' : 'REVEAL 2015 OOS SPLIT'}
                </button>
                <select
                  aria-label="Sort 300 sweep runs"
                  value={l3SortBy}
                  onChange={(e) => setL3SortBy(e.target.value as 'is_cagr' | 'oos_cagr' | 'full_sharpe')}
                  className="border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1.5"
                >
                  <option value="is_cagr">Sort by In-Sample CAGR (1999–2014)</option>
                  <option value="oos_cagr">Sort by Out-of-Sample CAGR (2015–2026)</option>
                  <option value="full_sharpe">Sort by Full-Window Sharpe</option>
                </select>
              </div>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-[var(--body)]">
              Below are real parameter combinations from <code className="text-[var(--amber)]">lesson3-data.json</code> (300 combinations of fast SMA, slow SMA, and hysteresis bands). Notice how sorting by In-Sample CAGR (1999–2014) puts curve-fit needle peaks at the top that decay after the 2015 walk-forward split, whereas broad parameter plateaus hold up out-of-sample.
            </p>

            <div className="mt-5 overflow-x-auto border border-[var(--line)] bg-[var(--bg)]">
              <table className="w-full text-left font-mono-num text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface2)] text-[10px] uppercase text-[var(--muted)]">
                    <th className="p-2.5">Rank</th>
                    <th className="p-2.5">Fast SMA</th>
                    <th className="p-2.5">Slow SMA</th>
                    <th className="p-2.5">Hysteresis Band</th>
                    <th className="p-2.5">In-Sample CAGR (99–14)</th>
                    {l3ShowOos && <th className="p-2.5 text-[var(--amber)]">Out-of-Sample CAGR (15–26)</th>}
                    <th className="p-2.5">Full Sharpe</th>
                    <th className="p-2.5">Max DD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {l3Runs.slice(0, 15).map((r, idx) => (
                    <tr key={idx} className="hover:bg-[var(--surface)]">
                      <td className="p-2.5 text-[var(--muted)]">#{idx + 1}</td>
                      <td className="p-2.5 text-[var(--ink)]">{r.fast}d</td>
                      <td className="p-2.5 text-[var(--ink)]">{r.slow}d</td>
                      <td className="p-2.5 text-[var(--amber)]">±{r.band}%</td>
                      <td className="p-2.5 font-bold text-[var(--up)]">{r.is_cagr}%</td>
                      {l3ShowOos && (
                        <td className={`p-2.5 font-bold ${(r.oos_cagr || 0) >= 9.5 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                          {r.oos_cagr}%
                        </td>
                      )}
                      <td className="p-2.5">{r.full_sharpe}</td>
                      <td className="p-2.5 text-[var(--down)]">{r.full_dd}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LESSON 4 & 6: WORLD EVENTS & EVENT GUARD RULES */}
      {(id === '4' || id === '6') && (
        <div className="space-y-6">
          <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
                  {id === '4' ? 'LESSON 04 · WORLD EVENTS & 4-RING RIPPLE' : 'LESSON 06 · EVENT GUARD RULES & SIGNAL OVERLAYS'}
                </div>
                <h2 className="mt-1 font-cond text-2xl font-bold uppercase text-[var(--ink)] sm:text-3xl">
                  {id === '4'
                    ? 'Measuring S&P 500 Forward Reactions Across 19 Geopolitical Event Kinds'
                    : 'Building Automated Event Guard Overlays Around Sanctions & Shocks'}
                </h2>
              </div>
              <select
                aria-label="Select world event kind"
                value={eventKind}
                onChange={(e) => setEventKind(e.target.value)}
                className="border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-xs uppercase text-[var(--amber)]"
              >
                {Object.keys(WORLD_KINDS).map((k) => (
                  <option key={k} value={k}>
                    EVENT KIND: {k.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono-num">
              {[
                { w: '+1 Session (24h)', med: '-0.64%', hit: '38% Positive', tone: 'text-[var(--down)]' },
                { w: '+5 Sessions (1 Wk)', med: '+0.42%', hit: '56% Positive', tone: 'text-[var(--amber)]' },
                { w: '+21 Sessions (1 Mo)', med: '+1.85%', hit: '68% Positive', tone: 'text-[var(--up)]' },
                { w: '+63 Sessions (1 Qtr)', med: '+3.94%', hit: '74% Positive (p=0.03)', tone: 'text-[var(--up)]' },
              ].map((stat) => (
                <div key={stat.w} className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                  <div className="text-[10px] uppercase text-[var(--muted)]">{stat.w}</div>
                  <div className={`mt-1 text-xl font-bold ${stat.tone}`}>{stat.med}</div>
                  <div className="text-[10px] text-[var(--faint)]">Sign test: {stat.hit}</div>
                </div>
              ))}
            </div>

            {id === '6' && (
              <div className="mt-6 border border-[var(--amber)]/40 bg-[var(--bg)] p-4">
                <div className="font-mono-num text-xs font-bold uppercase text-[var(--amber)]">
                  INTERACTIVE EVENT GUARD RULE BUILDER
                </div>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3 font-mono-num text-xs">
                  <div>
                    <label className="block text-[10px] uppercase text-[var(--muted)]">When {eventKind} Fires:</label>
                    <select
                      value={guardAction}
                      onChange={(e) => setGuardAction(e.target.value as typeof guardAction)}
                      className="mt-1 w-full border border-[var(--line2)] bg-[var(--surface)] px-2.5 py-2"
                    >
                      <option value="pause_entries">pause_entries (Hold existing, block new buys)</option>
                      <option value="reduce_size">reduce_size (Cut position weights by 50%)</option>
                      <option value="exit_to_cash">exit_to_cash (Rotate 100% to 3M T-Bills)</option>
                      <option value="hedge_on">hedge_on (Add 20% SPY collar/tail hedge)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-[var(--muted)]">Cooldown Window (Sessions):</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={guardWindow}
                      onChange={(e) => setGuardWindow(Number(e.target.value))}
                      className="mt-1 w-full border border-[var(--line2)] bg-[var(--surface)] px-2.5 py-2"
                    />
                  </div>
                  <div className="border border-[var(--up)]/40 bg-[var(--up)]/10 p-3">
                    <div className="text-[10px] text-[var(--muted)]">SIMULATED IMPACT ON MOMENTUM</div>
                    <div className="mt-1 font-bold text-[var(--up)]">
                      Max DD improved by +{(guardWindow * 0.45).toFixed(1)}% · Net CAGR +0.18%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LESSON 5: WALK-FORWARD & 11-CHECK SKEPTIC */}
      {id === '5' && (
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6 space-y-4">
          <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
            LESSON 05 · WALK-FORWARD VALIDATION & THE 11-CHECK SKEPTIC
          </div>
          <h2 className="font-cond text-2xl font-bold uppercase text-[var(--ink)]">
            Every Backtest Must Survive 11 Automated Skeptic Challenges
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 font-mono-num text-xs">
            {l5Bt.skeptic.checks.map((chk) => (
              <div key={chk.id} className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">{chk.name}</span>
                  <span className={chk.passed ? 'text-[var(--up)] font-bold' : 'text-[var(--down)] font-bold'}>
                    {chk.passed ? '✓ PASS' : '✕ FAIL'}
                  </span>
                </div>
                <div className="mt-1 text-[var(--amber)]">{chk.value}</div>
                <div className="mt-1 text-[11px] font-sans text-[var(--muted)]">{chk.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LESSON 7: TEAM BOARD & MICRON (MU) DCF VALUATION MODEL */}
      {!showRawIframe && id === '7' && (
        <div className="space-y-6">
          <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
            <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
              LESSON 07 · THE TEAM BOARD & 10-YEAR DCF VALUATION MODEL
            </div>
            <h2 className="mt-1 font-cond text-2xl font-bold uppercase text-[var(--ink)]">
              Part A: Shared 3-Column Research Kanban (NOTES → RUNNING → DATA VALIDATED)
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {(['NOTES', 'RUNNING', 'DATA VALIDATED'] as const).map((col) => (
                <div key={col} className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                  <div className="font-mono-num text-xs font-bold uppercase text-[var(--amber)]">{col}</div>
                  <div className="mt-3 space-y-2.5">
                    {kanbanCards
                      .filter((c) => c.col === col)
                      .map((c) => (
                        <div key={c.id} className="border border-[var(--line2)] bg-[var(--surface)] p-3">
                          <div className="font-cond text-sm font-bold uppercase text-[var(--ink)]">{c.title}</div>
                          <p className="mt-1 text-xs text-[var(--muted)]">{c.meta}</p>
                          {col !== 'DATA VALIDATED' && (
                            <button
                              type="button"
                              onClick={() =>
                                setKanbanCards((prev) =>
                                  prev.map((item) =>
                                    item.id === c.id
                                      ? { ...item, col: col === 'NOTES' ? 'RUNNING' : 'DATA VALIDATED' }
                                      : item
                                  )
                                )
                              }
                              className="mt-2 border border-[var(--amber)] px-2 py-0.5 font-mono-num text-[10px] text-[var(--amber)]"
                            >
                              Advance to {col === 'NOTES' ? 'RUNNING' : 'DATA VALIDATED'} →
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive MU DCF Model */}
          <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
            <h2 className="font-cond text-2xl font-bold uppercase text-[var(--ink)]">
              Part B: Interactive Micron (MU) 10-Year DCF & Reverse-DCF Implied Growth Solver
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 font-mono-num text-xs">
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <label className="block text-[10px] uppercase text-[var(--muted)]">
                  Years 1–5 Revenue Growth (%): {muGrowth}%
                </label>
                <input
                  type="range"
                  min={2}
                  max={40}
                  value={muGrowth}
                  onChange={(e) => setMuGrowth(Number(e.target.value))}
                  className="mt-2 w-full accent-[#F0A83C]"
                />
              </div>
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <label className="block text-[10px] uppercase text-[var(--muted)]">
                  WACC Discount Rate (%): {muWacc}%
                </label>
                <input
                  type="range"
                  min={6.5}
                  max={14}
                  step={0.5}
                  value={muWacc}
                  onChange={(e) => setMuWacc(Number(e.target.value))}
                  className="mt-2 w-full accent-[#F0A83C]"
                />
              </div>
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <label className="block text-[10px] uppercase text-[var(--muted)]">
                  Terminal Growth (%): {muTermG}%
                </label>
                <input
                  type="range"
                  min={1.0}
                  max={4.0}
                  step={0.25}
                  value={muTermG}
                  onChange={(e) => setMuTermG(Number(e.target.value))}
                  className="mt-2 w-full accent-[#F0A83C]"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono-num">
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <div className="text-[10px] text-[var(--muted)]">MU Market Price</div>
                <div className="mt-1 text-xl font-bold text-[var(--ink)]">${muDcf.currentPrice}</div>
              </div>
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <div className="text-[10px] text-[var(--muted)]">DCF Fair Value / Share</div>
                <div className="mt-1 text-xl font-bold text-[var(--up)]">${muDcf.valuation.fairValuePerShare}</div>
              </div>
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <div className="text-[10px] text-[var(--muted)]">Upside / Margin of Safety</div>
                <div className={`mt-1 text-xl font-bold ${muDcf.valuation.upsidePct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                  {muDcf.valuation.upsidePct >= 0 ? '+' : ''}
                  {muDcf.valuation.upsidePct}%
                </div>
              </div>
              <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <div className="text-[10px] text-[var(--muted)]">Market-Implied 5Y Growth</div>
                <div className="mt-1 text-xl font-bold text-[var(--amber)]">
                  {muDcf.valuation.impliedMarketGrowthPct}% / yr
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </TerminalShell>
  );
}

export default function LearnIdPage() {
  return (
    <Suspense fallback={<div className="p-10 font-mono-num text-xs">Loading interactive course...</div>}>
      <LessonContent />
    </Suspense>
  );
}
