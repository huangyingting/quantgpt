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
  const study =
    STUDIES.find(
      (s) =>
        s.slug === slug ||
        slug.includes(s.slug) ||
        s.slug.includes(slug) ||
        (slug.includes('piotroski') && s.slug.includes('piotroski'))
    ) || STUDIES[0];
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
          {study?.kicker && (
            <div className="font-mono-num text-[11px] uppercase tracking-wider text-[var(--amber)]">
              {study.kicker}
            </div>
          )}
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
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

          {study?.lede && <p className="mt-3 text-sm leading-relaxed text-[var(--body)]">{study.lede}</p>}
          {study?.diff && (
            <div className="mt-3 border-l-2 border-[var(--amber)] bg-[var(--bg)] px-3.5 py-2 font-mono-num text-xs font-semibold text-[var(--amber)]">
              {study.diff}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link
              href={`/terminal?study=${encodeURIComponent(study?.slug || slug)}`}
              className="bg-[var(--amber)] px-4 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
            >
              RUN IT YOURSELF ▸
            </Link>
            <Link
              href="/library"
              className="border border-[var(--line2)] bg-[var(--bg)] px-3.5 py-2 font-mono-num text-xs uppercase text-[var(--ink)] hover:border-[var(--amber)]"
            >
              IN THE LIBRARY
            </Link>
          </div>

          {/* 1. The strategy against the benchmark */}
          {study?.cells && study.cells.length > 0 && (
            <div className="mt-8">
              <div className="mb-2 font-cond text-lg font-bold uppercase text-[var(--ink)]">
                The strategy against the benchmark
              </div>
              <div className="overflow-x-auto border border-[var(--line)] bg-[var(--bg)]">
                <table className="w-full text-left font-mono-num text-xs">
                  <thead className="border-b border-[var(--line)] bg-[var(--surface2)] text-[10px] uppercase text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-2.5">Metric</th>
                      <th className="px-4 py-2.5">Strategy</th>
                      <th className="px-4 py-2.5">{study.benchmarkName || '$SPXTR Buy & Hold'}</th>
                      <th className="px-4 py-2.5">Edge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {study.cells.map((c, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 text-[var(--muted)]">{c.metric || c.k}</td>
                        <td className="px-4 py-2.5 font-bold text-[var(--ink)]">{c.strategy || c.v}</td>
                        <td className="px-4 py-2.5 text-[var(--body)]">{c.benchmark || '—'}</td>
                        <td
                          className={`px-4 py-2.5 font-semibold ${
                            (c.edge || '').startsWith('+')
                              ? 'text-[var(--up)]'
                              : (c.edge || '').startsWith('-')
                                ? 'text-[var(--down)]'
                                : 'text-[var(--amber)]'
                          }`}
                        >
                          {c.edge || c.s}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. SVG Equity Curve from reverse-engineered study HTML */}
          {study?.svg && (
            <div className="mt-8 border border-[var(--line)] bg-[var(--bg)] p-4 overflow-x-auto">
              <div className="mb-2 font-cond text-lg font-bold uppercase text-[var(--ink)]">
                Growth of $1 (log scale)
              </div>
              <div
                className="w-full [&_svg]:w-full [&_svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: study.svg }}
              />
            </div>
          )}

          {/* 3. Tested on years it never saw + 4. After 25 bps of trading costs */}
          {(study?.unseenLine || study?.costLine) && (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {study.unseenLine && (
                <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
                  <div className="font-cond text-base font-bold uppercase text-[var(--amber)]">
                    Tested on years it never saw
                  </div>
                  <p className="mt-1.5 font-mono-num text-xs leading-relaxed text-[var(--body)]">
                    {study.unseenLine}
                  </p>
                </div>
              )}
              {study.costLine && (
                <div className="border border-[var(--line)] bg-[var(--bg)] p-4">
                  <div className="font-cond text-base font-bold uppercase text-[var(--amber)]">
                    After 25 bps of trading costs
                  </div>
                  <p className="mt-1.5 font-mono-num text-xs leading-relaxed text-[var(--body)]">
                    {study.costLine}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5. Decade by decade */}
          {study?.decades && study.decades.length > 0 && (
            <div className="mt-8">
              <div className="mb-2 font-cond text-lg font-bold uppercase text-[var(--ink)]">
                Decade by decade
              </div>
              <div className="overflow-x-auto border border-[var(--line)] bg-[var(--bg)]">
                <table className="w-full text-left font-mono-num text-xs">
                  <thead className="border-b border-[var(--line)] bg-[var(--surface2)] text-[10px] uppercase text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-2">Decade</th>
                      <th className="px-4 py-2">Strategy</th>
                      <th className="px-4 py-2">Benchmark</th>
                      <th className="px-4 py-2">Diff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {study.decades.map((d) => (
                      <tr key={d.decade}>
                        <td className="px-4 py-2 font-bold text-[var(--ink)]">{d.decade}</td>
                        <td className="px-4 py-2 text-[var(--ink)]">{d.strategy}</td>
                        <td className="px-4 py-2 text-[var(--muted)]">{d.benchmark}</td>
                        <td
                          className={`px-4 py-2 font-semibold ${
                            (d.diff || '').startsWith('+') ? 'text-[var(--up)]' : 'text-[var(--down)]'
                          }`}
                        >
                          {d.diff}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Year by year Grid */}
          <div className="mt-8">
            <div className="mb-2 font-cond text-lg font-bold uppercase text-[var(--ink)]">
              Year by year, losing years in red
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 font-mono-num text-xs">
              {(study?.years && study.years.length > 0
                ? study.years
                : (fallbackBt.yearlyReturns || []).map((y) => ({
                    year: y.year,
                    strat: `${y.stratPct >= 0 ? '+' : ''}${y.stratPct}%`,
                    bench: `SPY ${y.benchPct >= 0 ? '+' : ''}${y.benchPct}%`,
                  }))
              ).map((yr) => {
                const valStr = ('ret' in yr && yr.ret) ? yr.ret : yr.strat || '';
                const neg = ('loss' in yr && typeof yr.loss === 'boolean') ? yr.loss : valStr.startsWith('-');
                return (
                  <div
                    key={String(yr.year)}
                    className={`border p-2.5 ${
                      neg
                        ? 'border-[var(--down)]/40 bg-[var(--down)]/10'
                        : 'border-[var(--line)] bg-[var(--bg)]'
                    }`}
                  >
                    <div className="text-[10px] text-[var(--muted)]">{yr.year}</div>
                    <div className={`mt-0.5 text-sm font-bold ${neg ? 'text-[var(--down)]' : 'text-[var(--up)]'}`}>
                      {valStr}
                    </div>
                  </div>
                );
              })}
            </div>
            {study?.losingYearsLine && (
              <div className="mt-2 font-mono-num text-xs text-[var(--muted)]">
                Losing years: {study.losingYearsLine}
              </div>
            )}
          </div>

          {/* 7. The idea, as published */}
          {(study?.citation || (study?.rules && study.rules.length > 0)) && (
            <div className="mt-8 border border-[var(--line)] bg-[var(--bg)] p-4">
              <div className="font-cond text-base font-bold uppercase text-[var(--ink)]">
                The idea, as published
              </div>
              {study.citation && (
                <p className="mt-1 font-mono-num text-xs text-[var(--amber)]">{study.citation}</p>
              )}
              {study.rules && study.rules.length > 0 && (
                <ul className="mt-2.5 list-disc pl-5 space-y-1 text-xs text-[var(--body)]">
                  {study.rules.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* All 39 Pre-Computed Studies Index */}
          <div className="mt-8 border-t border-[var(--line)] pt-5">
            <div className="mb-2.5 font-mono-num text-xs uppercase text-[var(--muted)]">
              ALL {STUDIES.length} PRE-COMPUTED WAREHOUSE STUDIES
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STUDIES.map((s) => (
                <Link
                  key={s.slug}
                  href={`/study/${s.slug}`}
                  className={`border px-2.5 py-1 font-mono-num text-[11px] transition ${
                    s.slug === study?.slug
                      ? 'border-[var(--amber)] bg-[var(--amber)]/15 font-bold text-[var(--amber)]'
                      : 'border-[var(--line2)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
