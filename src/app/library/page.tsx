'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';
import { STRATEGIES } from '@/lib/quant/warehouse';

const SOURCES = ['all', 'paper', 'book', 'practitioner', 'letters', 'industry'];
const TYPES = [
  'all',
  'momentum',
  'value',
  'quality',
  'event',
  'seasonality',
  'technical',
  'growth',
  'fundamental',
  'special-situations',
  'flow',
  'volatility',
  'macro',
  'allocation',
];

export default function StrategyLibraryPage() {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [onlyRunnable, setOnlyRunnable] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>('mom_01');

  const filtered = useMemo(() => {
    return STRATEGIES.filter((s) => {
      if (onlyRunnable && !s.runnable) return false;
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      if (sourceFilter !== 'all' && !s.tags?.includes(sourceFilter)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.thesis.toLowerCase().includes(q) ||
          s.src.toLowerCase().includes(q) ||
          s.criteria.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, sourceFilter, typeFilter, onlyRunnable]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="border-b border-[var(--line)] pb-6">
          <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
            ▲ QUANTGPT STRATEGY LIBRARY · {STRATEGIES.length} DOCUMENTED EDGES
          </div>
          <h1 className="mt-1 font-cond text-3xl font-bold uppercase sm:text-5xl">
            175 Documented Trading Strategies — Tested on Real Warehouse Data
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--body)]">
            Every classic paper (Jegadeesh & Titman, Piotroski, Novy-Marx, Fama-French, Moskowitz), investor letter (Buffett, Graham, Greenblatt, Lynch, O&apos;Neil), and market-timing anomaly—cataloged with exact rules, citations, and 1-click execution in the Terminal Backtester.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 space-y-3 border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 175 strategies by name, author (Piotroski, Novy-Marx), factor, or rule..."
                className="w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-xs text-[var(--ink)] outline-none focus:border-[var(--amber)]"
              />
            </div>

            <div>
              <select
                aria-label="Filter by category type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-xs uppercase text-[var(--ink)]"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    TYPE: {t.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-2">
              <select
                aria-label="Filter by source"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="flex-1 border border-[var(--line2)] bg-[var(--field)] px-2.5 py-2 font-mono-num text-xs uppercase text-[var(--ink)]"
              >
                {SOURCES.map((src) => (
                  <option key={src} value={src}>
                    SOURCE: {src.toUpperCase()}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 font-mono-num text-xs text-[var(--amber)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyRunnable}
                  onChange={(e) => setOnlyRunnable(e.target.checked)}
                />
                RUNNABLE ONLY
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--line)] pt-2 font-mono-num text-[11px] text-[var(--muted)]">
            <span>
              Showing <strong className="text-[var(--ink)]">{filtered.length}</strong> of {STRATEGIES.length} documented strategies
            </span>
            <Link href="/library/piotroski-f-score" className="text-[var(--amber)] hover:underline">
              Featured Deep-Dive: Piotroski F-Score →
            </Link>
          </div>
        </div>

        {/* Strategy Cards Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const expanded = expandedId === s.id;
            return (
              <div
                key={s.id}
                className="flex flex-col justify-between border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--line2)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono-num text-[10px]">
                    <span className="uppercase text-[var(--amber)]">
                      {s.id} · {s.type}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 font-bold ${
                        s.runnable
                          ? 'bg-[var(--up)]/15 text-[var(--up)]'
                          : 'bg-[var(--surface2)] text-[var(--muted)]'
                      }`}
                    >
                      {s.runnable ? '● RUNNABLE IN TERMINAL' : 'DOCUMENTED'}
                    </span>
                  </div>

                  <h2 className="mt-2 font-cond text-lg font-bold uppercase text-[var(--ink)]">
                    {s.star ? '★ ' : ''}
                    {s.name}
                  </h2>

                  <div className="mt-1 font-mono-num text-[11px] text-[var(--muted)]">
                    {s.src} ({s.year})
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-[var(--body)]">{s.thesis}</p>

                  {expanded && (
                    <div className="mt-3 space-y-2 border-t border-[var(--line)] pt-3 font-mono-num text-[11px]">
                      <div>
                        <span className="text-[var(--muted)]">CRITERIA: </span>
                        <span className="text-[var(--ink)]">{s.criteria}</span>
                      </div>
                      <div>
                        <span className="text-[var(--muted)]">EMPIRICAL RESULT: </span>
                        <span className="text-[var(--up)]">{s.result}</span>
                      </div>
                      {s.run_gap && (
                        <div>
                          <span className="text-[var(--muted)]">APPROXIMATION NOTE: </span>
                          <span className="text-[var(--amber)]">{s.run_gap}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3 font-mono-num text-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : s.id)}
                    className="text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    {expanded ? 'HIDE CRITERIA ▲' : 'SOURCE & CRITERIA ▼'}
                  </button>

                  <Link
                    href={`/terminal?preset=${encodeURIComponent(s.id)}`}
                    className="bg-[var(--amber)] px-3 py-1 font-bold uppercase text-[#0A0D13] hover:opacity-90"
                  >
                    RUN IT →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
