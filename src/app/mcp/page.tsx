import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function McpPublicPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          ▲ MODEL CONTEXT PROTOCOL (MCP) · JSON-RPC 2.0
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase sm:text-5xl">
          19 Core Quantitative Tools + 7 Specialized Categories for Claude, ChatGPT & Cursor
        </h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          Instead of letting your LLM hallucinate financial ratios from stale training weights, point it at <code className="text-[var(--amber)]">/api/mcp</code>. Every tool call executes deterministically against our 28-year point-in-time warehouse.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 font-mono-num text-xs">
          {[
            'run_backtest (175 presets, 1998–2026)',
            'run_market_timing (200d SMA + Hysteresis)',
            'challenge_finding (11-Check Skeptic Suite)',
            'grade_stock (6 Dimensions + Piotroski F)',
            'check_halal (AAOIFI 5-Test Compliance)',
            'financial_model (10Y DCF + Reverse-DCF)',
            'world_events (19 Event Kinds + 4-Ring Ripple)',
            'verify_bar (SHA-256 Point-in-Time Proof)',
            'run_parameter_sweep (5×5 Plateau Grid)',
          ].map((tool) => (
            <div key={tool} className="border border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--ink)]">
              <span className="text-[var(--up)]">●</span> {tool}
            </div>
          ))}
        </div>
        <div className="pt-4">
          <Link
            href="/connect"
            className="bg-[var(--amber)] px-5 py-2.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
          >
            Open Connect AI Desk →
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
