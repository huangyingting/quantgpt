import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function DisclosuresPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          REGULATORY & RESEARCH DISCLOSURES
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase">Financial & Hypothetical Performance Disclosures</h1>
        <div className="border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 text-xs leading-relaxed text-[var(--body)]">
          <p>
            <strong>Not Investment Advice:</strong> QuantGPT is a software research platform and point-in-time financial data warehouse. Nothing on QuantGPT constitutes personalized investment advice, a solicitation, or an offer to buy or sell any security.
          </p>
          <p>
            <strong>Hypothetical Backtested Performance Limitations:</strong> Backtested performance results have many inherent limitations. Unlike an actual performance record, simulated results do not represent actual trading. Even with our 45-day SEC filing lag, survivorship-bias-free delisted security coverage, and out-of-sample walk-forward splits, past performance does not guarantee future results.
          </p>
          <p>
            <strong>AAOIFI Shariah Screening Notice:</strong> The Halal Screen applies the quantitative ratios of AAOIFI Shariah Standard No. 21 mechanically to SEC 10-K/10-Q filings. It is an automated ratio screen, not a fatwa from a Shariah supervisory board.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
