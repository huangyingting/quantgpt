import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function DpaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-4">
        <div className="font-mono-num text-xs uppercase text-[var(--amber)]">LEGAL · GDPR / CCPA</div>
        <h1 className="font-cond text-4xl font-bold uppercase">Data Processing Addendum (DPA)</h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          This Data Processing Addendum governs the processing of operator account data in compliance with GDPR Article 28 and CCPA requirements.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
