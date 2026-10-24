import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function VerdictMethodologyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 space-y-8">
        <div>
          <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
            ▲ QUANTGPT METHODOLOGY · ZERO MARKETING SPIN
          </div>
          <h1 className="mt-1 font-cond text-4xl font-bold uppercase sm:text-5xl">
            The Findings System: DATA VALIDATED · TRADE-OFF · NO EDGE
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--body)]">
            Every strategy in the QuantGPT Library and every custom backtest in the Terminal is graded by a deterministic mathematical rule comparing the strategy against its benchmark both across the full window (1998–2026) and after the held-out 2015 walk-forward split.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="border border-[var(--up)] bg-[var(--surface)] p-5">
            <span className="inline-block bg-[var(--up)]/15 px-2.5 py-1 font-mono-num text-xs font-bold text-[var(--up)]">
              DATA VALIDATED
            </span>
            <h2 className="mt-3 font-cond text-xl font-bold uppercase">Beats on Both Return & Sharpe + Holds Post-2015</h2>
            <p className="mt-2 text-xs leading-relaxed text-[var(--body)]">
              Assigned only when the strategy beats its benchmark on <strong>both annualized CAGR and Sharpe ratio</strong> across the full window AND does not fall behind on both metrics in the post-2015 out-of-sample split.
            </p>
          </div>

          <div className="border border-[var(--amber)] bg-[var(--surface)] p-5">
            <span className="inline-block bg-[var(--amber)]/15 px-2.5 py-1 font-mono-num text-xs font-bold text-[var(--amber)]">
              TRADE-OFF
            </span>
            <h2 className="mt-3 font-cond text-xl font-bold uppercase">Higher Sharpe / Shallower Drawdown OR Higher Return with Higher Vol</h2>
            <p className="mt-2 text-xs leading-relaxed text-[var(--body)]">
              Assigned when a strategy improves one dimension at the expense of another—for example, 200-day trend rules that cut max drawdown from -56.8% to -24.5% (0.94 Sharpe) while trailing slightly in roaring bull years.
            </p>
          </div>

          <div className="border border-[var(--down)] bg-[var(--surface)] p-5">
            <span className="inline-block bg-[var(--down)]/15 px-2.5 py-1 font-mono-num text-xs font-bold text-[var(--down)]">
              NO EDGE
            </span>
            <h2 className="mt-3 font-cond text-xl font-bold uppercase">Trails Benchmark After Friction & OOS Split</h2>
            <p className="mt-2 text-xs leading-relaxed text-[var(--body)]">
              Assigned when the strategy trails buy-and-hold on both CAGR and Sharpe after realistic trading costs, or when an in-sample winner collapses out-of-sample. We publish NO EDGE studies openly so you don&apos;t trade them.
            </p>
          </div>
        </div>

        <div className="border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="font-cond text-2xl font-bold uppercase text-[var(--amber)]">
            Try the Findings System Live
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/terminal"
              className="bg-[var(--amber)] px-4 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
            >
              Open Terminal Backtester →
            </Link>
            <Link
              href="/library"
              className="border border-[var(--line2)] px-4 py-2 font-mono-num text-xs uppercase text-[var(--ink)]"
            >
              Browse 175 Strategies →
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
