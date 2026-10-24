import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function SecurityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-4">
        <div className="font-mono-num text-xs uppercase text-[var(--amber)]">SECURITY · INVITE-ONLY ADMISSION</div>
        <h1 className="font-cond text-4xl font-bold uppercase">Security Architecture</h1>
        <p className="text-sm leading-relaxed text-[var(--body)]">
          Account registration is strictly invite-only. Invitation tokens and personal MCP API keys are hashed with SHA-256 prior to storage, passwords are hashed with bcrypt, and every invitation issuance, acceptance, and revocation is recorded in an immutable audit log.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
