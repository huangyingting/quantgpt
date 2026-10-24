'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';
import { STRATEGIES, STUDIES } from '@/lib/quant/warehouse';

const FEATURED_STRATEGIES = STRATEGIES.slice(0, 8);
const STUDY_LIST = Object.values(STUDIES).slice(0, 8);

export default function LandingPage() {
  const [activeDemoTab, setActiveDemoTab] = useState<'backtest' | 'grader' | 'mcp'>('backtest');
  const [selectedPreset, setSelectedPreset] = useState(FEATURED_STRATEGIES[0]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-[var(--line)] bg-gradient-to-b from-[var(--surface)] to-[var(--bg)] px-4 py-14 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="inline-flex items-center gap-2 border border-[var(--amber)]/40 bg-[var(--amber)]/10 px-3 py-1 font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
              <span>▲ THE DATA AND TRADING PLATFORM FOR AI</span>
              <span>·</span>
              <span>97.4M BARS · 175 STRATEGIES · 19 WORLD EVENT KINDS</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <h1 className="font-cond text-4xl font-bold uppercase leading-tight tracking-tight text-[var(--ink)] sm:text-6xl">
                  Trading is war.{' '}
                  <span className="text-[var(--amber)]">Arm your AI with data.</span>
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--body)] sm:text-lg">
                  Raw AI assistants guess stock prices and hallucinate backtests. QuantGPT connects Claude, ChatGPT, Gemini, and Cursor—or your own browser—to a survivorship-bias-free US market data warehouse, a 175-strategy library, a 2015 walk-forward split, and an 11-check Skeptic engine.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href="/terminal"
                    className="bg-[var(--amber)] px-5 py-3 font-mono-num text-xs font-bold uppercase tracking-wider text-[#0A0D13] hover:opacity-90"
                  >
                    Launch Research Terminal →
                  </Link>
                  <Link
                    href="/tour"
                    className="border border-[var(--line2)] bg-[var(--surface)] px-5 py-3 font-mono-num text-xs font-semibold uppercase tracking-wider text-[var(--ink)] hover:border-[var(--amber)]"
                  >
                    Play 7-Slide Interactive Tour
                  </Link>
                  <Link
                    href="/learn/2"
                    className="border border-[var(--line2)] bg-[var(--bg)] px-4 py-3 font-mono-num text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--amber)]"
                  >
                    Play &quot;Become a Quant&quot; Course →
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-4 font-mono-num">
                  <div>
                    <div className="text-2xl font-bold text-[var(--amber)]">175</div>
                    <div className="text-[11px] uppercase text-[var(--muted)]">Documented Edges</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--up)]">2015</div>
                    <div className="text-[11px] uppercase text-[var(--muted)]">Walk-Forward OOS Split</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--ink)]">11 Checks</div>
                    <div className="text-[11px] uppercase text-[var(--muted)]">Skeptic Validation</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--ink)]">Zero Custody</div>
                    <div className="text-[11px] uppercase text-[var(--muted)]">Your Keys, Your Broker</div>
                  </div>
                </div>
              </div>

              {/* Interactive Live Desk Preview */}
              <div className="lg:col-span-5 border border-[var(--line2)] bg-[var(--surface)] p-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                  <div className="flex gap-1.5 font-mono-num text-[11px]">
                    <button
                      type="button"
                      onClick={() => setActiveDemoTab('backtest')}
                      className={`px-2.5 py-1 uppercase ${
                        activeDemoTab === 'backtest'
                          ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                          : 'bg-[var(--bg)] text-[var(--muted)]'
                      }`}
                    >
                      Backtester
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDemoTab('grader')}
                      className={`px-2.5 py-1 uppercase ${
                        activeDemoTab === 'grader'
                          ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                          : 'bg-[var(--bg)] text-[var(--muted)]'
                      }`}
                    >
                      Stock Grader
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDemoTab('mcp')}
                      className={`px-2.5 py-1 uppercase ${
                        activeDemoTab === 'mcp'
                          ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                          : 'bg-[var(--bg)] text-[var(--muted)]'
                      }`}
                    >
                      MCP AI Wire
                    </button>
                  </div>
                  <span className="font-mono-num text-[10px] text-[var(--up)]">● LIVE WAREHOUSE</span>
                </div>

                {activeDemoTab === 'backtest' && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-num text-[11px] text-[var(--muted)]">PRESET STRATEGY</span>
                      <select
                        aria-label="Select preset strategy"
                        value={selectedPreset.id}
                        onChange={(e) => {
                          const found = FEATURED_STRATEGIES.find((s) => s.id === e.target.value);
                          if (found) setSelectedPreset(found);
                        }}
                        className="border border-[var(--line2)] bg-[var(--field)] px-2.5 py-1 font-mono-num text-xs text-[var(--ink)]"
                      >
                        {FEATURED_STRATEGIES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.year})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-cond text-base font-bold uppercase text-[var(--ink)]">
                          {selectedPreset.name}
                        </span>
                        <span className="border border-[var(--up)] bg-[var(--up)]/15 px-2 py-0.5 font-mono-num text-[10px] font-bold text-[var(--up)]">
                          DATA VALIDATED
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[var(--body)]">{selectedPreset.thesis}</p>
                      <div className="mt-2 border-t border-[var(--line)] pt-2 font-mono-num text-[11px] text-[var(--amber)]">
                        Rule: {selectedPreset.criteria}
                      </div>
                      <div className="mt-1 font-mono-num text-xs text-[var(--up)]">
                        Result: {selectedPreset.result}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={`/terminal?preset=${selectedPreset.id}`}
                        className="bg-[var(--amber)] px-3.5 py-1.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
                      >
                        Run Full Backtest & Skeptic →
                      </Link>
                      <Link href="/library" className="font-mono-num text-xs text-[var(--muted)] hover:text-[var(--ink)]">
                        Browse all 175 →
                      </Link>
                    </div>
                  </div>
                )}

                {activeDemoTab === 'grader' && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between border border-[var(--line)] bg-[var(--bg)] p-3">
                      <div>
                        <div className="font-mono-num text-xs text-[var(--amber)]">MU · MICRON TECHNOLOGY</div>
                        <div className="font-cond text-lg font-bold text-[var(--ink)]">$108.40 (+1.85%)</div>
                      </div>
                      <div className="text-right">
                        <div className="font-cond text-3xl font-bold text-[var(--up)]">A-</div>
                        <div className="font-mono-num text-[10px] text-[var(--muted)]">82nd Percentile</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 font-mono-num text-xs">
                      {[
                        { d: 'Momentum', g: 'A', p: '88th' },
                        { d: 'Value', g: 'B+', p: '74th' },
                        { d: 'Quality', g: 'A-', p: '81st' },
                        { d: 'Growth', g: 'A+', p: '94th' },
                        { d: 'Earnings', g: 'A', p: '89th' },
                        { d: 'Halal (AAOIFI)', g: '5/5', p: 'PASS' },
                      ].map((item) => (
                        <div key={item.d} className="border border-[var(--line)] bg-[var(--bg)] p-2">
                          <div className="text-[10px] text-[var(--muted)]">{item.d}</div>
                          <div className="mt-0.5 text-sm font-bold text-[var(--up)]">
                            {item.g} <span className="text-[10px] font-normal text-[var(--muted)]">({item.p})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/grade?ticker=MU"
                      className="inline-block bg-[var(--amber)] px-3.5 py-1.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
                    >
                      Open Stock Grader & Halal Screen →
                    </Link>
                  </div>
                )}

                {activeDemoTab === 'mcp' && (
                  <div className="mt-4 space-y-3 font-mono-num text-xs">
                    <div className="border border-[var(--line)] bg-[var(--bg)] p-3 text-[11px] leading-relaxed text-[var(--body)]">
                      <div className="text-[var(--amber)]"># Connect Claude / ChatGPT / Cursor to /api/mcp</div>
                      <div className="mt-1 text-[var(--up)]">
                        &gt; run_backtest(presetId=&quot;mom_01&quot;, splitYear=2015, costBps=10)
                      </div>
                      <div className="mt-1 text-[var(--ink)]">
                        Finding: DATA VALIDATED · 15.8% CAGR vs 10.4% $SPXTR · 9/11 Skeptic checks passed.
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/connect"
                        className="bg-[var(--amber)] px-3.5 py-1.5 text-xs font-bold uppercase text-[#0A0D13]"
                      >
                        Connect Your AI →
                      </Link>
                      <Link
                        href="/learn/1"
                        className="border border-[var(--line2)] px-3.5 py-1.5 text-xs uppercase text-[var(--ink)]"
                      >
                        Play 60s Setup Game →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Playable Courses & Interactive Tools Shelf */}
        <section className="border-b border-[var(--line)] px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
                  PLAYABLE QUANT CURRICULUM & UNIVERSITY
                </div>
                <h2 className="mt-1 font-cond text-3xl font-bold uppercase text-[var(--ink)]">
                  7 Interactive Courses + 10 University Chapters
                </h2>
              </div>
              <Link href="/learn" className="font-mono-num text-xs text-[var(--amber)] hover:underline">
                OPEN FULL COURSE SHELF →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  num: 'LESSON 01',
                  title: 'Arm Your AI in 60 Seconds',
                  desc: 'Pick Claude, ChatGPT, or Paste-Pack, copy the setup prompt, and watch real warehouse tools fire.',
                  href: '/learn/1',
                  tag: 'INTERACTIVE GAME',
                },
                {
                  num: 'LESSON 02',
                  title: 'Become a Quant (1999–2026)',
                  desc: 'Step through 27 years of daily S&P 500 & Nasdaq-100 data: 200-day SMA, 196 whipsaws vs 42 buffered trades.',
                  href: '/learn/2',
                  tag: '226 KB REAL SERIES',
                },
                {
                  num: 'LESSON 03',
                  title: 'The Backtester & 300-Run Sweep',
                  desc: 'Explore a 300-parameter moving-average sweep, see why #1 fails post-2015, and run 5 Skeptic checks.',
                  href: '/learn/3',
                  tag: '300-RUN SWEEP',
                },
                {
                  num: 'LESSON 04',
                  title: 'World Events & 4-Ring Ripple',
                  desc: 'Study war onsets, sanctions, and oil shocks with 1/5/21/63-session S&P 500 forward reaction distributions.',
                  href: '/learn/4',
                  tag: '19 EVENT KINDS',
                },
                {
                  num: 'LESSON 06',
                  title: 'Event Guard Rules & Signals',
                  desc: 'Test how pausing new entries N sessions around sanctions or rate shocks changes strategy drawdowns.',
                  href: '/learn/6',
                  tag: 'RULE BUILDER',
                },
                {
                  num: 'LESSON 07',
                  title: 'Team Board & DCF Valuation',
                  desc: 'Move hypotheses from NOTES to DATA VALIDATED and stress-test Micron (MU) in a 10-year DCF model.',
                  href: '/learn/7',
                  tag: 'KANBAN + DCF',
                },
                {
                  num: 'PUBLIC TOOL',
                  title: 'The Headline Check',
                  desc: 'Paste any yearly or monthly return track to expose worst drawdowns, underwater stretches, and rolling 36M windows.',
                  href: '/learn/headline-check',
                  tag: 'LOSS-FIRST AUDIT',
                },
                {
                  num: 'UNIVERSITY',
                  title: 'QuantGPT University (S1–S5, G1–G5)',
                  desc: '10 structured chapters across Specialist and Generalist tracks with interactive mastery quizzes.',
                  href: '/university',
                  tag: '10 CHAPTERS',
                },
              ].map((course) => (
                <Link
                  key={course.href}
                  href={course.href}
                  className="group flex flex-col justify-between border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--amber)]"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono-num text-[10px]">
                      <span className="text-[var(--amber)]">{course.num}</span>
                      <span className="border border-[var(--line2)] px-1.5 py-0.5 text-[var(--muted)]">
                        {course.tag}
                      </span>
                    </div>
                    <h3 className="mt-2 font-cond text-lg font-bold uppercase text-[var(--ink)] group-hover:text-[var(--amber)]">
                      {course.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--body)]">{course.desc}</p>
                  </div>
                  <div className="mt-4 font-mono-num text-xs font-semibold text-[var(--amber)]">
                    Launch Course →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Computed Studies Showcase */}
        <section className="border-b border-[var(--line)] bg-[var(--surface)]/50 px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
                  39 PUBLIC COMPUTED WAREHOUSE STUDIES
                </div>
                <h2 className="mt-1 font-cond text-3xl font-bold uppercase text-[var(--ink)]">
                  Every Claim Backed by an Auditable Study Page
                </h2>
              </div>
              <Link href="/library" className="font-mono-num text-xs text-[var(--amber)] hover:underline">
                EXPLORE ALL 175 STRATEGIES & 39 STUDIES →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {STUDY_LIST.map((st) => (
                <Link
                  key={st.slug}
                  href={`/study/${st.slug}`}
                  className="border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--amber)]"
                >
                  <div className="flex items-center justify-between font-mono-num text-[10px]">
                    <span className="text-[var(--muted)]">/study/{st.slug}</span>
                    <span
                      className={`px-1.5 py-0.5 font-bold ${
                        st.verdict.includes('VALIDATED')
                          ? 'bg-[var(--up)]/15 text-[var(--up)]'
                          : st.verdict.includes('NO EDGE')
                            ? 'bg-[var(--down)]/15 text-[var(--down)]'
                            : 'bg-[var(--amber)]/15 text-[var(--amber)]'
                      }`}
                    >
                      {st.verdict}
                    </span>
                  </div>
                  <h3 className="mt-2 font-cond text-base font-bold uppercase text-[var(--ink)]">
                    {st.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{st.vline || st.lede}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing & Invite-Only Admission */}
        <section className="px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
                TRANSPARENT OPERATOR TIERS · INVITE-ONLY ADMISSION
              </div>
              <h2 className="mt-1 font-cond text-3xl font-bold uppercase text-[var(--ink)]">
                Built for Serious Individual Quants & Research Desks
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  tier: 'QUANTGPT MEMBER',
                  price: '$49',
                  cadence: '/month ($470/yr)',
                  role: 'MEMBER',
                  features: [
                    'Full US Equities Point-in-Time Warehouse (1998–2026)',
                    'All 175 Library Strategies & Custom 8-Factor Screener',
                    'Walk-Forward OOS Split & 11-Check Skeptic Engine',
                    '6-Dimension Stock Grader + AAOIFI Halal Screen',
                    'MCP Connector for Claude, ChatGPT, Gemini & Cursor (3 keys, 500 calls/day)',
                    'Findings Journal, $100K Paper Books & University (10 Chapters)',
                  ],
                },
                {
                  tier: 'QUANTGPT PRO',
                  price: '$149',
                  cadence: '/month ($1,430/yr)',
                  role: 'PRO',
                  highlight: true,
                  features: [
                    'Everything in QuantGPT Member',
                    'QuantGPT Cloud Bot Runner (up to 5 scheduled Python bots on NY cron)',
                    'Connect your own Alpaca Paper or Live API keys with version-hash attestation',
                    '10-Year DCF Valuation Model with live .xlsx formula export',
                    'Prediction Markets vs Warehouse Base-Rate Board (/pm)',
                    '5 MCP API Keys & 1,500 tool calls/day + Pro Forum Rooms',
                  ],
                },
                {
                  tier: 'QUANTGPT BUSINESS / DESK',
                  price: '$1,499',
                  cadence: '/month (Multi-Seat)',
                  role: 'ADMIN / TEAM',
                  features: [
                    'Shared 3-Seat Team Kanban Board (NOTES → RUNNING → DATA VALIDATED)',
                    'Admin Invite & Governance Console (/admin) with Single-Use Expiring Codes',
                    'Role-Based Access Control (ADMIN, PRO, MEMBER) & Security Audit Log',
                    'Dedicated Warehouse Query Throughput & Priority Support',
                    'Full JSON Account & Compliance Export (/api/account/export)',
                  ],
                },
              ].map((plan) => (
                <div
                  key={plan.tier}
                  className={`flex flex-col justify-between border p-6 ${
                    plan.highlight
                      ? 'border-[var(--amber)] bg-[var(--surface2)]'
                      : 'border-[var(--line)] bg-[var(--surface)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono-num text-xs">
                      <span className="font-bold text-[var(--amber)]">{plan.tier}</span>
                      <span className="border border-[var(--line2)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                        {plan.role}
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="font-cond text-4xl font-bold text-[var(--ink)]">{plan.price}</span>
                      <span className="font-mono-num text-xs text-[var(--muted)]">{plan.cadence}</span>
                    </div>
                    <ul className="mt-5 space-y-2.5 text-xs text-[var(--body)]">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="text-[var(--up)]">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--line)]">
                    <Link
                      href="/join"
                      className={`block w-full py-2.5 text-center font-mono-num text-xs font-bold uppercase ${
                        plan.highlight
                          ? 'bg-[var(--amber)] text-[#0A0D13]'
                          : 'border border-[var(--line2)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--amber)]'
                      }`}
                    >
                      Redeem Invitation Code →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
