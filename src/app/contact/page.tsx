import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          ▲ OPERATOR SUPPORT & INSTITUTIONAL INQUIRIES
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase">Contact QuantGPT</h1>
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6 font-mono-num text-xs space-y-3">
          <div>
            <span className="text-[var(--muted)]">Operator Desk & Invitations:</span>{' '}
            <strong className="text-[var(--amber)]">desk@quantgpt.co</strong>
          </div>
          <div>
            <span className="text-[var(--muted)]">Security & Vulnerability Disclosure:</span>{' '}
            <strong className="text-[var(--ink)]">security@quantgpt.co</strong>
          </div>
          <div>
            <span className="text-[var(--muted)]">Data Warehouse Audit & Corrections:</span>{' '}
            <strong className="text-[var(--ink)]">warehouse@quantgpt.co</strong>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
