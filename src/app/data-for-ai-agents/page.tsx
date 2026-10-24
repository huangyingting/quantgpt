import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function DataForAiAgentsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          ▲ FINANCIAL INFRASTRUCTURE FOR AI AGENTS
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase sm:text-5xl">
          Deterministic Financial Compute for Autonomous Agents & Copilots
        </h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          Give any LLM agent structured JSON-RPC access to 28 years of daily equity bars, SEC EDGAR fundamentals, 175 factor strategies, and 19 geopolitical event kinds via <code className="text-[var(--amber)]">/api/mcp</code>.
        </p>
        <Link
          href="/connect"
          className="inline-block bg-[var(--amber)] px-5 py-2.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
        >
          Issue Agent API Key →
        </Link>
      </main>
      <PublicFooter />
    </div>
  );
}
