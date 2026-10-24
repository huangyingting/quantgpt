import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function RefundsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-4">
        <div className="font-mono-num text-xs uppercase text-[var(--amber)]">LEGAL · BILLING & REFUNDS</div>
        <h1 className="font-cond text-4xl font-bold uppercase">Refund Policy</h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          All public courses, strategy library pages, and warehouse verification tools are free to inspect before subscribing. Paid Pro and Desk memberships may be canceled at any time from <code className="text-[var(--amber)]">/account</code>.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
