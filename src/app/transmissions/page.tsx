import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function TransmissionsIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          QUANTGPT TRANSMISSIONS · EMPIRICAL FIELD DISPATCHES
        </div>
        <h1 className="mt-2 font-cond text-4xl font-bold uppercase text-[var(--ink)] sm:text-5xl">
          Transmissions from the Warehouse
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--body)]">
          Long-form empirical studies where we take a popular market headline, geopolitical shock, or trading rule and test it against decades of point-in-time market history.
        </p>

        <div className="mt-8 grid gap-6">
          <article className="border border-[var(--line2)] bg-[var(--surface)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono-num text-xs text-[var(--amber)]">
              <span>TRANSMISSION #001 · GEOPOLITICAL BASE RATES</span>
              <span>49 HISTORICAL EVENTS · 1973–2026</span>
            </div>
            <h2 className="mt-2 font-cond text-2xl font-bold uppercase text-[var(--ink)]">
              <Link href="/transmissions/oil-shocks" className="hover:text-[var(--amber)]">
                Oil Shocks & Equity Returns: What Happened After All 49 Crude Spikes Since 1973
              </Link>
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[var(--body)]">
              Every time crude oil spikes or a shipping chokepoint is threatened, television pundits predict an immediate stock market crash. We pulled all 49 oil shocks since the October 1973 OAPEC embargo and measured what the S&P 500, WTI crude, energy stocks, and airlines actually did 1, 5, 21, 63, and 252 trading days later.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/transmissions/oil-shocks"
                className="bg-[var(--amber)] px-4 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
              >
                Read Transmission #001 →
              </Link>
              <a
                href="/events/oil-shocks.csv"
                className="border border-[var(--line2)] bg-[var(--bg)] px-3.5 py-2 font-mono-num text-xs uppercase text-[var(--ink)] hover:border-[var(--amber)]"
              >
                Download 49-Event CSV
              </a>
            </div>
          </article>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
