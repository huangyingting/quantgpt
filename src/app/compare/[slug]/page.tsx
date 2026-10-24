import Link from 'next/link';
import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default async function CompareSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = slug.replace(/quantgpt-vs-/i, '').replace(/-/g, ' ').toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          ▲ ARCHITECTURAL COMPARISON · QUANTGPT VS. {label}
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase sm:text-5xl">
          QuantGPT vs. {label}: Point-in-Time Backtesting, 11-Check Skeptic & Native MCP
        </h1>
        <div className="overflow-x-auto border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full text-left font-mono-num text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                <th className="p-3">Capability</th>
                <th className="p-3 text-[var(--amber)]">QuantGPT</th>
                <th className="p-3">{label}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              <tr>
                <td className="p-3 font-bold">Survivorship-Bias-Free Universe (Delisted Retained)</td>
                <td className="p-3 text-[var(--up)] font-bold">✓ 3,234 Tickers (1998–2026)</td>
                <td className="p-3 text-[var(--muted)]">Partial / Current Index Only</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">Mandatory 2015 Out-of-Sample Walk-Forward Split</td>
                <td className="p-3 text-[var(--up)] font-bold">✓ Built into Every Run</td>
                <td className="p-3 text-[var(--muted)]">Manual / None</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">11-Check Automated Skeptic Suite (PSR, Bootstrap)</td>
                <td className="p-3 text-[var(--up)] font-bold">✓ Automatic on All 175 Presets</td>
                <td className="p-3 text-[var(--muted)]">Not Included</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">Native Model Context Protocol (MCP) for Claude/ChatGPT</td>
                <td className="p-3 text-[var(--up)] font-bold">✓ 19 Core Tools (/api/mcp)</td>
                <td className="p-3 text-[var(--muted)]">No Native MCP</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">AAOIFI 5-Test Halal Compliance Screen</td>
                <td className="p-3 text-[var(--up)] font-bold">✓ Included (/halal)</td>
                <td className="p-3 text-[var(--muted)]">Not Included</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Link
          href="/terminal"
          className="inline-block bg-[var(--amber)] px-5 py-2.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
        >
          Open QuantGPT Terminal →
        </Link>
      </main>
      <PublicFooter />
    </div>
  );
}
