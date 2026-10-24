import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function IsQuantGptLegitPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          ▲ RADICAL EMPIRICAL TRANSPARENCY
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase sm:text-5xl">
          Is QuantGPT Legit? Why We Publish Our Losing Backtests (`NO EDGE`)
        </h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          Most quant platforms hide strategies that fail out-of-sample. In our 175-strategy library, <strong>62 strategies are openly labeled NO EDGE</strong> because they failed after our 2015 walk-forward split or after 10 bps trading friction. Every bar is verifiable at <code className="text-[var(--amber)]">/verify</code>.
        </p>
        <div className="flex gap-3 font-mono-num text-xs">
          <Link
            href="/library"
            className="bg-[var(--amber)] px-4 py-2 font-bold uppercase text-[#0A0D13]"
          >
            Inspect All 175 Strategies (Including 62 NO EDGE) →
          </Link>
          <Link
            href="/verify"
            className="border border-[var(--line2)] px-4 py-2 uppercase text-[var(--ink)]"
          >
            Verify Warehouse Data →
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
