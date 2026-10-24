import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function SubprocessorsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-4">
        <div className="font-mono-num text-xs uppercase text-[var(--amber)]">LEGAL · INFRASTRUCTURE</div>
        <h1 className="font-cond text-4xl font-bold uppercase">Subprocessors</h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          QuantGPT runs self-contained on SQLite (local development) or PostgreSQL (production) with zero third-party advertising trackers. Optional brokerage execution connects directly to Alpaca Markets LLC using operator-supplied keys.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
