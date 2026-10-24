import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';
import { STRATEGIES } from '@/lib/quant/warehouse';
import { runBacktest } from '@/lib/quant/backtester';

export default async function LibrarySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strategy =
    STRATEGIES.find(
      (s) =>
        s.id.toLowerCase() === slug.toLowerCase() ||
        s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
    ) ||
    STRATEGIES.find((s) => s.name.toLowerCase().includes('piotroski')) ||
    STRATEGIES[0];

  const bt = runBacktest({ presetId: strategy.id, splitYear: 2015, costBps: 10 });

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
          <Link href="/library" className="hover:underline">
            ← BACK TO 175 STRATEGY LIBRARY
          </Link>
        </div>

        <h1 className="mt-3 font-cond text-3xl font-bold uppercase sm:text-5xl">
          {strategy.name} ({strategy.year})
        </h1>
        <p className="mt-2 font-mono-num text-xs text-[var(--muted)]">
          Primary Citation: {strategy.src} · Category: {strategy.type.toUpperCase()}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4 font-mono-num">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] uppercase text-[var(--muted)]">Finding Verdict</div>
            <div className="mt-1 text-lg font-bold text-[var(--up)]">{bt.finding}</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] uppercase text-[var(--muted)]">Net CAGR (1998–2026)</div>
            <div className="mt-1 text-lg font-bold text-[var(--ink)]">
              {bt.metrics.cagr}% <span className="text-xs text-[var(--muted)]">vs {bt.metrics.benchCagr}%</span>
            </div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] uppercase text-[var(--muted)]">Sharpe Ratio</div>
            <div className="mt-1 text-lg font-bold text-[var(--amber)]">
              {bt.metrics.sharpe} <span className="text-xs text-[var(--muted)]">vs {bt.metrics.benchSharpe}</span>
            </div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] uppercase text-[var(--muted)]">Post-2015 OOS CAGR</div>
            <div className="mt-1 text-lg font-bold text-[var(--up)]">{bt.metrics.outOfSampleCagr}%</div>
          </div>
        </div>

        <div className="mt-6 border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
          <h2 className="font-cond text-xl font-bold uppercase text-[var(--amber)]">Economic Thesis</h2>
          <p className="text-sm leading-relaxed text-[var(--body)]">{strategy.thesis}</p>

          <h2 className="font-cond text-xl font-bold uppercase text-[var(--amber)]">Exact Warehouse Rule</h2>
          <div className="border border-[var(--line2)] bg-[var(--bg)] p-3 font-mono-num text-xs text-[var(--ink)]">
            {strategy.criteria}
          </div>

          <h2 className="font-cond text-xl font-bold uppercase text-[var(--amber)]">Published & Warehouse Result</h2>
          <p className="font-mono-num text-xs text-[var(--up)]">{strategy.result}</p>

          <div className="pt-4">
            <Link
              href={`/terminal?preset=${encodeURIComponent(strategy.id)}`}
              className="inline-block bg-[var(--amber)] px-5 py-2.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
            >
              Run & Customize in Terminal Backtester →
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
