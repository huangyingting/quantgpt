import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-4">
        <div className="font-mono-num text-xs uppercase text-[var(--amber)]">LEGAL · DATA PRIVACY</div>
        <h1 className="font-cond text-4xl font-bold uppercase">Privacy Policy</h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          QuantGPT stores only the minimum account, invitation audit, and research journal state required to operate your terminal desk. You can export your entire account archive as JSON at any time via <code className="text-[var(--amber)]">/api/account/export</code>.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
