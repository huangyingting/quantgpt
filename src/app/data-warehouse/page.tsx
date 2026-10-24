import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function DataWarehousePublicPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          ▲ POINT-IN-TIME QUANTITATIVE DATA WAREHOUSE
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase sm:text-5xl">
          3,234 US Equities · 45-Day SEC EDGAR Lag · Delisted Names Retained
        </h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          Retail backtesters overstate returns by 2% to 4% per year because they test only today&apos;s S&P 500 survivors and use restated annual reports before they were publicly filed. QuantGPT enforces historical index membership and a strict 45-day filing lag.
        </p>
        <div className="flex gap-3 pt-2 font-mono-num text-xs">
          <Link
            href="/verify"
            className="bg-[var(--amber)] px-4 py-2 font-bold uppercase text-[#0A0D13]"
          >
            Verify Single Bar (/verify) →
          </Link>
          <Link
            href="/status"
            className="border border-[var(--line2)] px-4 py-2 uppercase text-[var(--ink)]"
          >
            Warehouse Telemetry (/status) →
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
