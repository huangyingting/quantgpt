import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function Transmission001Page() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          ▲ TRANSMISSION 001 · FOUNDING OPERATOR DISPATCH
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase sm:text-5xl">
          Why Language Models Need a Point-in-Time Financial Warehouse
        </h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          Large language models are extraordinary reasoning engines, but they are terrible databases. When you ask an ungrounded LLM for a stock&apos;s Piotroski F-Score or a 28-year moving-average backtest, it guesses. When you wire that same LLM to QuantGPT&apos;s point-in-time warehouse via MCP, it becomes an institutional research desk.
        </p>
        <Link
          href="/learn/1"
          className="inline-block bg-[var(--amber)] px-5 py-2.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
        >
          Play Lesson 1: Arm Your AI in 60 Seconds →
        </Link>
      </main>
      <PublicFooter />
    </div>
  );
}
