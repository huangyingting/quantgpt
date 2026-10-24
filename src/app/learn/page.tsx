'use client';

import Link from 'next/link';
import React from 'react';
import { TerminalShell } from '@/components/TerminalShell';

const PLAYABLE_LESSONS = [
  {
    id: '1',
    num: 'LESSON 01',
    title: 'Arm Your AI in 60 Seconds',
    duration: '3 min interactive game',
    tag: 'MCP + AI SETUP',
    desc: 'Pick Claude, ChatGPT, or Paste-Pack, copy the setup prompt, and watch your AI call run_backtest, challenge_finding, and grade_stock on the warehouse.',
  },
  {
    id: '2',
    num: 'LESSON 02',
    title: 'Become a Quant: Trend, Whipsaws & Hysteresis Buffers',
    duration: '8 min interactive walkthrough',
    tag: '1999–2026 S&P & NDX',
    desc: 'Step through 6 stages on 6,850 real trading days: raw buy-and-hold (-56% DD), 200-day SMA, green/red regimes, 196 naive whipsaw trades, and the +1%/-3% buffered quant rule (42 trades + T-bill yield).',
  },
  {
    id: '3',
    num: 'LESSON 03',
    title: 'The Backtester: 300-Run Parameter Sweep & Overfitting',
    duration: '9 min interactive lab',
    tag: '300-VARIANT SWEEP',
    desc: 'Sort 300 moving-average combinations, watch the #1 in-sample winner collapse after the 2015 walk-forward split, and run the Skeptic checks.',
  },
  {
    id: '4',
    num: 'LESSON 04',
    title: 'World Events: Geopolitical Shocks & 4-Ring Ripple',
    duration: '7 min interactive study',
    tag: '19 EVENT KINDS',
    desc: 'Measure S&P 500 1, 5, 21, and 63-session forward returns after war onsets, sanctions, and oil shocks with binomial sign tests and 4-ring geographic ripple.',
  },
  {
    id: '5',
    num: 'LESSON 05',
    title: 'Walk-Forward Validation & The 11-Check Skeptic',
    duration: '6 min interactive lab',
    tag: 'ROBUSTNESS AUDIT',
    desc: 'Stress-test any strategy against Probabilistic Sharpe Ratio (PSR), 25 bps slippage, 1,000x block bootstrap, random-book baselines, and parameter neighbors.',
  },
  {
    id: '6',
    num: 'LESSON 06',
    title: 'Event Guard Rules & Signal Overlays',
    duration: '7 min interactive builder',
    tag: 'SANCTION GUARD',
    desc: 'Configure custom event rules (pause_entries, reduce_size, exit_to_cash, hedge_on) around sanction or rate events and compare baseline vs guarded drawdowns.',
  },
  {
    id: '7',
    num: 'LESSON 07',
    title: 'The Team Board & 10-Year DCF Valuation Model',
    duration: '8 min interactive workshop',
    tag: 'KANBAN + MU DCF',
    desc: 'Move hypotheses across NOTES → RUNNING → DATA VALIDATED and model Micron (MU) with Bear/Base/Bull cases, reverse-DCF implied growth, and a 5×5 sensitivity matrix.',
  },
];

const GUIDES_AND_TOOLS = [
  { href: '/learn/become-a-quant', title: 'Become a Quant (Public Visual Edition)', tag: 'VISUAL ESSAY' },
  { href: '/learn/headline-check', title: 'The Headline Check (Return Track Auditor)', tag: 'INTERACTIVE TOOL' },
  { href: '/learn/verdict', title: 'The Findings System (DATA VALIDATED / TRADE-OFF / NO EDGE)', tag: 'METHODOLOGY' },
  { href: '/learn/resources', title: '91 Academic Quant Papers & Practitioner Books', tag: '91 SOURCES' },
  { href: '/learn/quantgpt-cloud', title: 'QuantGPT Cloud Runner & Alpaca Execution Guide', tag: 'CLOUD BOTS' },
  { href: '/learn/connect-claude', title: 'Connect Claude Desktop & Web via MCP', tag: 'CLAUDE GUIDE' },
  { href: '/learn/connect-chatgpt', title: 'Connect ChatGPT Actions & Developer Mode', tag: 'CHATGPT GUIDE' },
  { href: '/learn/connect-gemini', title: 'Connect Google Gemini & AI Studio', tag: 'GEMINI GUIDE' },
  { href: '/learn/connect-cursor', title: 'Connect Cursor IDE to QuantGPT MCP', tag: 'CURSOR GUIDE' },
  { href: '/learn/connect-ai-to-stock-data', title: 'How to Connect Any AI Agent to Point-in-Time Stock Data', tag: 'ARCHITECTURE' },
];

export default function LearnShelfPage() {
  return (
    <TerminalShell
      title="Playable Quant Courses & Learn Shelf"
      subtitle="7 interactive hands-on lessons, 10 University chapters, return-series tools, and 91 academic papers"
    >
      <div className="space-y-8">
        {/* Top Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border border-[var(--amber)]/40 bg-[var(--surface)] p-5">
          <div>
            <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
              ▲ START HERE · INTERACTIVE CURRICULUM
            </div>
            <h2 className="mt-1 font-cond text-2xl font-bold uppercase text-[var(--ink)]">
              Learn Quantitative Research by Running Real Warehouse Data
            </h2>
            <p className="mt-1 text-xs text-[var(--body)]">
              Every lesson below runs live in your browser on authentic historical series—no slideshows or static videos.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/tour"
              className="border border-[var(--line2)] bg-[var(--bg)] px-4 py-2 font-mono-num text-xs uppercase text-[var(--ink)] hover:border-[var(--amber)]"
            >
              7-Slide Product Tour
            </Link>
            <Link
              href="/university"
              className="bg-[var(--amber)] px-4 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
            >
              Open University (10 Chapters + Quizzes) →
            </Link>
          </div>
        </div>

        {/* 7 Playable Lessons */}
        <section>
          <div className="mb-3 font-mono-num text-xs uppercase tracking-wider text-[var(--amber)]">
            PLAYABLE INTERACTIVE LESSONS (/learn/1 — /learn/7)
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PLAYABLE_LESSONS.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/learn/${lesson.id}`}
                className="group flex flex-col justify-between border border-[var(--line)] bg-[var(--surface)] p-5 transition hover:border-[var(--amber)]"
              >
                <div>
                  <div className="flex items-center justify-between font-mono-num text-[10px]">
                    <span className="font-bold text-[var(--amber)]">{lesson.num}</span>
                    <span className="border border-[var(--line2)] bg-[var(--bg)] px-2 py-0.5 text-[var(--muted)]">
                      {lesson.tag}
                    </span>
                  </div>
                  <h3 className="mt-2.5 font-cond text-xl font-bold uppercase text-[var(--ink)] group-hover:text-[var(--amber)]">
                    {lesson.title}
                  </h3>
                  <div className="mt-1 font-mono-num text-[11px] text-[var(--muted)]">{lesson.duration}</div>
                  <p className="mt-2.5 text-xs leading-relaxed text-[var(--body)]">{lesson.desc}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-3 font-mono-num text-xs">
                  <span className="font-bold text-[var(--amber)]">PLAY INTERACTIVE LESSON →</span>
                  <span className="text-[var(--muted)]">/learn/{lesson.id}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Public Interactive Tools & Guides */}
        <section>
          <div className="mb-3 font-mono-num text-xs uppercase tracking-wider text-[var(--amber)]">
            TOOLS, METHODOLOGY & AI CONNECTION GUIDES
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES_AND_TOOLS.map((g) => (
              <Link
                key={g.href}
                href={g.href}
                className="flex items-center justify-between border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 hover:border-[var(--amber)]"
              >
                <div>
                  <div className="font-mono-num text-[10px] text-[var(--amber)]">{g.tag}</div>
                  <div className="mt-0.5 font-cond text-base font-bold uppercase text-[var(--ink)]">
                    {g.title}
                  </div>
                </div>
                <span className="font-mono-num text-xs text-[var(--muted)]">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </TerminalShell>
  );
}
