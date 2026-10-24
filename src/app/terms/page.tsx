import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-4">
        <div className="font-mono-num text-xs uppercase text-[var(--amber)]">LEGAL · PUBLISHER EXCLUSION</div>
        <h1 className="font-cond text-4xl font-bold uppercase">Terms of Service</h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          QuantGPT is a financial data publisher and quantitative research software platform operating under the publisher&apos;s exclusion to the Investment Advisers Act of 1940 (15 U.S.C. § 80b-2(a)(11)(D)). All data, backtests, stock grades, Halal screens, DCF valuations, and MCP outputs are impersonal, educational, and non-fiduciary. Past performance does not guarantee future results.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
