import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function EulaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          LEGAL · END USER LICENSE AGREEMENT
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase">End User License Agreement (EULA)</h1>
        <div className="border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 text-xs leading-relaxed text-[var(--body)]">
          <p>
            Subject to valid invite-only registration and account standing, QuantGPT grants you a revocable, non-exclusive license to access the QuantGPT Terminal, MCP Server, and Quantitative Warehouse.
          </p>
          <p>
            Automated trading scripts executed through QuantGPT Cloud (<code className="text-[var(--amber)]">/runner</code>) run at the operator&apos;s sole risk and responsibility. Always verify order sizing on an Alpaca paper account before enabling live execution.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
