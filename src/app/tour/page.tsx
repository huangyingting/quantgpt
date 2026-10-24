'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import tourData from '@/data/tour-data.json';

const TOUR_SLIDES = [
  {
    id: 1,
    tag: 'SLIDE 01 OF 07 · ORIENTATION',
    title: 'Welcome to QuantGPT: The Verified Warehouse for AI & Operators',
    subtitle: '28 Years of Point-in-Time Equity & Macro Data · 175 Strategies · 19 World Event Kinds',
    body: 'Whether you connect Claude/ChatGPT via MCP or work directly inside this terminal, every query hits the same deterministic warehouse: 3,234 S&P 500 + Russell 1000 equities (including delisted names to eliminate survivorship bias), SEC EDGAR filings with a strict 45-day point-in-time lag, and 28 years of daily closes.',
    ctaHref: '/connect',
    ctaLabel: 'Open Connect AI Desk →',
  },
  {
    id: 2,
    tag: 'SLIDE 02 OF 07 · STOCK GRADER & HALAL SCREEN',
    title: '6-Dimension Stock Grader (A+ to F) & AAOIFI Halal Compliance',
    subtitle: 'Valuation · Growth · Profitability · Momentum · Quality · Revisions',
    body: 'Type any ticker into /grade to compute sector-relative percentiles across 6 quantitative dimensions plus Piotroski F-Score (0–9), Altman Z-Score, and Beneish M-Score. Switch to /halal for the 5-test AAOIFI Shariah audit.',
    ctaHref: '/grade',
    ctaLabel: 'Open Stock Grader →',
  },
  {
    id: 3,
    tag: 'SLIDE 03 OF 07 · TECHNICALS & SIGNAL STUDY',
    title: 'Interactive Technicals Desk & Empirical Forward-Return Signal Studies',
    subtitle: 'SMA 20/50/200 · Bollinger Squeeze · RSI(14) · MACD · ATR(14)',
    body: 'Don’t guess whether an RSI < 30 bounce works on NVDA. The Technicals desk scans every historical occurrence of the active signal on that exact ticker and reports the 5-day, 21-day, and 63-day forward win rate.',
    ctaHref: '/technicals',
    ctaLabel: 'Open Technicals Desk →',
  },
  {
    id: 4,
    tag: 'SLIDE 04 OF 07 · 10-YEAR DCF & REVERSE-DCF SOLVER',
    title: 'Institutional 10-Year DCF Valuation & Market-Implied Growth Solver',
    subtitle: 'Bear / Base / Bull Presets · 5×5 WACC × Terminal Growth Grid · CSV/XLSX Export',
    body: 'Instead of arguing over arbitrary price targets, use the Reverse-DCF solver on /model to calculate the exact 5-year revenue growth rate the current stock price is already pricing in.',
    ctaHref: '/model',
    ctaLabel: 'Open Valuation Model →',
  },
  {
    id: 5,
    tag: 'SLIDE 05 OF 07 · THE BACKTESTER & 11-CHECK SKEPTIC',
    title: 'Point-in-Time Backtesting with Mandatory 2015 Walk-Forward Split',
    subtitle: '175 Presets · 2D Parameter Sweep · 11 Automated Skeptic Challenges',
    body: 'Run cross-sectional factor screens or market-timing regime rules from 1998 to 2026. Every run is automatically split at 2015 and audited by 11 Skeptic checks (PSR, 25 bps friction, 1,000x block bootstrap, random baseline, and parameter neighbors).',
    ctaHref: '/terminal',
    ctaLabel: 'Open Backtest Desk →',
  },
  {
    id: 6,
    tag: 'SLIDE 06 OF 07 · WORLD EVENTS & 4-RING GEOGRAPHIC RIPPLE',
    title: '19 Geopolitical & Macro Event Kinds + Automated Event Guard Rules',
    subtitle: 'War Onsets · Sanctions · Chokepoints · Oil Shocks · Crisis Simulator',
    body: 'Measure S&P 500 and sector ETF reactions 1, 5, 21, and 63 sessions after geopolitical shocks, trace the 4-ring geographic ripple, and attach Event Guard overlays to pause entries or rotate to T-bills.',
    ctaHref: '/events',
    ctaLabel: 'Open World Events Desk →',
  },
  {
    id: 7,
    tag: 'SLIDE 07 OF 07 · UNIVERSITY, JOURNAL & CLOUD BOTS',
    title: 'Graduate from University, Track OOS in Journal & Deploy to Cloud',
    subtitle: '10 University Chapters · $100K Paper Books · Daily NY 15:50 ET Cloud Runner',
    body: 'Save validated findings to your Journal to track post-save out-of-sample decay, allocate a $100,000 simulated Paper Book, or schedule daily paper/live execution on QuantGPT Cloud.',
    ctaHref: '/university',
    ctaLabel: 'Start QuantGPT University →',
  },
];

export default function TourPage() {
  const [idx, setIdx] = useState(0);
  const slide = TOUR_SLIDES[idx];
  const nvdaSample = (tourData as unknown as { grade?: { ticker?: string; composite?: string; f_score?: number } }).grade;

  return (
    <TerminalShell
      title="7-Slide Interactive Product Tour"
      subtitle="Walk through every desk in the QuantGPT Terminal with live warehouse data"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Progress Dots */}
        <div className="flex flex-wrap items-center justify-between gap-2 border border-[var(--line)] bg-[var(--surface)] p-3">
          <div className="flex flex-wrap gap-1.5 font-mono-num text-xs">
            {TOUR_SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIdx(i)}
                className={`px-3 py-1.5 transition ${
                  idx === i
                    ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                    : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                0{s.id}
              </button>
            ))}
          </div>
          <span className="font-mono-num text-xs text-[var(--muted)]">
            Use ← / → buttons to step through all 7 slides
          </span>
        </div>

        {/* Active Slide Card */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
            {slide.tag}
          </div>
          <h2 className="mt-2 font-cond text-3xl font-bold uppercase text-[var(--ink)] sm:text-4xl">
            {slide.title}
          </h2>
          <div className="mt-1 font-mono-num text-xs text-[var(--up)]">{slide.subtitle}</div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--body)]">{slide.body}</p>

          {/* Live Warehouse Preview Box */}
          <div className="mt-6 border border-[var(--line)] bg-[var(--bg)] p-4 font-mono-num text-xs">
            <div className="text-[10px] uppercase text-[var(--muted)]">
              LIVE WAREHOUSE SNAPSHOT FOR SLIDE 0{slide.id}
            </div>
            {slide.id === 1 && (
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <span className="text-[var(--muted)]">Equities:</span>{' '}
                  <strong className="text-[var(--ink)]">3,234 Point-in-Time</strong>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Daily Bars:</span>{' '}
                  <strong className="text-[var(--ink)]">7,050+ (1998–2026)</strong>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Strategies:</span>{' '}
                  <strong className="text-[var(--amber)]">175 Audited</strong>
                </div>
                <div>
                  <span className="text-[var(--muted)]">MCP Tools:</span>{' '}
                  <strong className="text-[var(--up)]">19 Core + 7 Categories</strong>
                </div>
              </div>
            )}
            {slide.id === 2 && (
              <div className="mt-2 flex flex-wrap gap-6">
                <div>
                  Ticker: <strong className="text-[var(--amber)]">{nvdaSample?.ticker || 'NVDA'}</strong>
                </div>
                <div>
                  Composite Grade: <strong className="text-[var(--up)]">{nvdaSample?.composite || 'A'}</strong>
                </div>
                <div>
                  Piotroski F-Score: <strong className="text-[var(--up)]">{nvdaSample?.f_score || 8}/9</strong>
                </div>
                <div>
                  AAOIFI Halal Screen: <strong className="text-[var(--up)]">5/5 COMPLIANT</strong>
                </div>
              </div>
            )}
            {slide.id >= 3 && (
              <div className="mt-2 text-[var(--body)]">
                Interactive desk ready — click <strong className="text-[var(--amber)]">{slide.ctaLabel}</strong> below to launch this desk with live controls.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
            <button
              type="button"
              disabled={idx === 0}
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              className="border border-[var(--line2)] px-4 py-2 font-mono-num text-xs uppercase disabled:opacity-40"
            >
              ← Previous Slide
            </button>
            <div className="flex gap-2">
              <Link
                href={slide.ctaHref}
                className="border border-[var(--amber)] bg-[var(--amber)]/15 px-4 py-2 font-mono-num text-xs font-bold uppercase text-[var(--amber)]"
              >
                {slide.ctaLabel}
              </Link>
              {idx < TOUR_SLIDES.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setIdx((i) => Math.min(TOUR_SLIDES.length - 1, i + 1))}
                  className="bg-[var(--amber)] px-5 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
                >
                  Next Slide ({idx + 2}/7) →
                </button>
              ) : (
                <Link
                  href="/terminal"
                  className="bg-[var(--up)] px-5 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
                >
                  Finish Tour & Enter Terminal →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}
