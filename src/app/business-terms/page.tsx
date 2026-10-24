import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function BusinessTermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          LEGAL · TEAM & ENTERPRISE DESK TERMS
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase">Business & Team Desk Terms</h1>
        <div className="border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 text-xs leading-relaxed text-[var(--body)]">
          <p>
            These Business Terms govern multi-seat Team Desks (<code className="text-[var(--amber)]">/team</code>), API / MCP connector usage (<code className="text-[var(--amber)]">/api/mcp</code>), and QuantGPT Cloud scheduled execution (<code className="text-[var(--amber)]">/runner</code>).
          </p>
          <p>
            <strong>Data Ownership:</strong> All custom factor formulas, saved Journal findings, Team Board cards, and Python execution scripts created by your organization remain the intellectual property of your organization.
          </p>
          <p>
            <strong>Redistribution Restrictions:</strong> Underlying raw CRSP/Compustat/SEC EDGAR warehouse bars may be queried for internal research and execution but may not be bulk-resold as a standalone data feed.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
