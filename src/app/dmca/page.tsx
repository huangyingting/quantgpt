import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function DmcaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          LEGAL · COPYRIGHT & DMCA POLICY
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase">Copyright & Academic Citations</h1>
        <div className="border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 text-xs leading-relaxed text-[var(--body)]">
          <p>
            All 175 strategies in the QuantGPT Strategy Library cite their original academic papers, books, or shareholder letters (including Jegadeesh & Titman, Piotroski, Novy-Marx, Greenblatt, Fama & French, and Antonacci). Our implementations are independent clean-room statistical reproductions tested on our own point-in-time database.
          </p>
          <p>
            For Digital Millennium Copyright Act (DMCA) notices regarding user-submitted content in the Operator Forum (<code className="text-[var(--amber)]">/forum</code>), contact <code className="text-[var(--amber)]">legal@quantgpt.co</code>.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
