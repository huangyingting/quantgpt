'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
          <div className="font-mono-num text-xs uppercase tracking-wider text-[var(--amber)]">
            OPERATOR SECURITY · PASSWORD RESET
          </div>
          <h1 className="mt-1 font-cond text-2xl font-bold uppercase">Reset Operator Password</h1>
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            Enter your registered operator email to request a password reset link or contact your desk administrator.
          </p>

          {sent ? (
            <div className="mt-4 border border-[var(--up)]/40 bg-[var(--up)]/10 p-3 font-mono-num text-xs text-[var(--up)]">
              If an active operator account matches {email}, a reset dispatch has been queued.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="block font-mono-num text-[10px] uppercase text-[var(--muted)]">
                  Operator Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@desk.co"
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-xs text-[var(--ink)] outline-none focus:border-[var(--amber)]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[var(--amber)] py-2.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
              >
                Send Reset Instructions
              </button>
            </form>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3 font-mono-num text-xs text-[var(--muted)]">
            <Link href="/signin" className="text-[var(--amber)] hover:underline">
              ← Back to Sign In
            </Link>
            <Link href="/join" className="hover:text-[var(--ink)]">
              Redeem Invite →
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
