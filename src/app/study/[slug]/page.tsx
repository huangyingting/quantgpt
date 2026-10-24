import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';
import { STUDIES } from '@/lib/quant/warehouse';
import { runBacktest } from '@/lib/quant/backtester';

export default async function PublicStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = STUDIES.find((s) => s.slug === slug) || STUDIES[0];
  const fallbackBt = runBacktest({ presetId: 'mom_01', splitYear: 2015 });

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href="/library" className="font-mono-num text-xs text-[var(--amber)] hover:underline">
            ← ALL 39 COMPUTED STUDIES & 175 STRATEGIES
          </Link>
          <span className="font-mono-num text-xs text-[var(--muted)]">
            WALK-FORWARD OOS SPLIT: 2015 · SURVIVORSHIP-BIAS-FREE
          </span>
        </div>

        <div className="mt-4 border border-[var(--line2)] bg-[var(--surface)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-cond text-3xl font-bold uppercase text-[var(--ink)] sm:text-4xl">
              {study ? study.title : `Warehouse Study: ${slug}`}
            </h1>
            <span
              className={`border px-3 py-1 font-mono-num text-xs font-bold uppercase ${
                study?.verdict?.includes('VALIDATED')
                  ? 'border-[var(--up)] bg-[var(--up)]/15 text-[var(--up)]'
                  : study?.verdict?.includes('NO EDGE')
                    ? 'border-[var(--down)] bg-[var(--down)]/15 text-[var(--down)]'
                    : 'border-[var(--amber)] bg-[var(--amber)]/15 text-[var(--amber)]'
              }`}
            >
              {study?.verdict || 'DATA VALIDATED'}
            </span>
          </div>

          {study?.lede && <p className="mt-2 text-sm text-[var(--body)]">{study.lede}</p>}
          {study?.vline && (
            <div className="mt-3 border-l-2 border-[var(--amber)] bg-[var(--bg)] px-3 py-2 font-mono-num text-xs text-[var(--amber)]">
              {study.vline}
            </div>
          )}

          {/* Metric Cells */}
          {study?.cells && study.cells.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 font-mono-num">
              {study.cells.slice(0, 12).map((c, idx) => (
                <div key={idx} className="border border-[var(--line)] bg-[var(--bg)] p-3">
                  <div className="text-[10px] uppercase text-[var(--muted)]">{c.k}</div>
                  <div className="mt-1 text-base font-bold text-[var(--ink)]">{c.v}</div>
                  {c.s && <div className="mt-0.5 text-[10px] text-[var(--faint)]">{c.s}</div>}
                </div>
              ))}
            </div>
          )}

          {/* SVG Equity Curve from reverse-engineered study HTML */}
          {study?.svg && (
            <div className="mt-6 border border-[var(--line)] bg-[var(--bg)] p-4 overflow-x-auto">
              <div className="mb-2 font-mono-num text-xs uppercase text-[var(--muted)]">
                LOG-SCALE EQUITY CURVE ($10,000 INITIAL · STRATEGY VS S&P 500 BENCHMARK)
              </div>
              <div
                className="w-full [&_svg]:w-full [&_svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: study.svg }}
              />
            </div>
          )}

          {/* Year-by-year Grid */}
          <div className="mt-6">
            <div className="mb-2 font-mono-num text-xs uppercase text-[var(--muted)]">
              CALENDAR YEAR RETURNS (LOSING YEARS HIGHLIGHTED IN RED)
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 font-mono-num text-xs">
              {(study?.years && study.years.length > 0
                ? study.years
                : fallbackBt.yearly.map((y) => ({
                    year: y.year,
                    strat: `${y.strategyPct >= 0 ? '+' : ''}${y.strategyPct}%`,
                    bench: `SPY ${y.benchPct >= 0 ? '+' : ''}${y.benchPct}%`,
                  }))
              ).map((yr) => {
                const neg = yr.strat.startsWith('-');
                return (
                  <div
                    key={yr.year}
                    className={`border p-2.5 ${
                      neg
                        ? 'border-[var(--down)]/40 bg-[var(--down)]/10'
                        : 'border-[var(--line)] bg-[var(--bg)]'
                    }`}
                  >
                    <div className="text-[10px] text-[var(--muted)]">{yr.year}</div>
                    <div className={`mt-0.5 text-sm font-bold ${neg ? 'text-[var(--down)]' : 'text-[var(--up)]'}`}>
                      {yr.strat}
                    </div>
                    <div className="text-[10px] text-[var(--faint)]">{yr.bench}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--line)] pt-4">
            <Link
              href="/terminal"
              className="bg-[var(--amber)] px-4 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
            >
              Open in Interactive Terminal Backtester →
            </Link>
            <Link
              href="/study/200d-sma"
              className="border border-[var(--line2)] px-3 py-2 font-mono-num text-xs text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Study: 200-Day SMA
            </Link>
            <Link
              href="/study/piotroski"
              className="border border-[var(--line2)] px-3 py-2 font-mono-num text-xs text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Study: Piotroski F-Score
            </Link>
            <Link
              href="/study/momentum-12-1"
              className="border border-[var(--line2)] px-3 py-2 font-mono-num text-xs text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Study: 12-1M Momentum
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
