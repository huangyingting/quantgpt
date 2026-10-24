'use client';

import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function BecomeAQuantPublicPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
              ▲ INTERACTIVE VISUAL COURSE · REAL 1999–2026 S&P 500 & NASDAQ-100 SERIES
            </div>
            <h1 className="font-cond text-3xl font-bold uppercase text-[var(--ink)]">
              Become a Quant: From -56% Drawdowns to Buffered Trend Rules
            </h1>
          </div>
          <div className="flex gap-2 font-mono-num text-xs">
            <Link
              href="/learn/2"
              className="border border-[var(--line2)] bg-[var(--surface)] px-3 py-1.5 text-[var(--ink)] hover:border-[var(--amber)]"
            >
              Open in Terminal View
            </Link>
            <Link
              href="/terminal?engine=timing"
              className="bg-[var(--amber)] px-3.5 py-1.5 font-bold uppercase text-[#0A0D13]"
            >
              Run in Backtester →
            </Link>
          </div>
        </div>

        <div className="border border-[var(--line2)] bg-[var(--surface)]">
          <iframe
            title="Become a Quant Interactive Walkthrough"
            src="/static/quant-lesson.html"
            className="h-[840px] w-full border-0"
          />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
