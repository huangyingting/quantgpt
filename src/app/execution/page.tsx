import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function ExecutionPublicPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          ▲ QUANTGPT CLOUD RUNNER & ALPACA EXECUTION
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase sm:text-5xl">
          Daily 15:50 America/New_York Scheduled Bots with SHA-256 Code Versioning
        </h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          Take any validated strategy from the Terminal Desk into a $100,000 simulated Paper Book or schedule daily execution on QuantGPT Cloud with your own Alpaca paper/live keys.
        </p>
        <Link
          href="/runner"
          className="inline-block bg-[var(--amber)] px-5 py-2.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
        >
          Open QuantGPT Cloud Runner →
        </Link>
      </main>
      <PublicFooter />
    </div>
  );
}
