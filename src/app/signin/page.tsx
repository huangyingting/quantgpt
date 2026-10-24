'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || searchParams.get('callbackUrl') || '/terminal';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError('Invalid operator email or password.');
      } else {
        router.push(nextUrl);
        router.refresh();
      }
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-14 max-w-md border border-[var(--line2)] bg-[var(--surface)] p-6 sm:p-8">
      <div className="font-mono-num text-[11px] uppercase tracking-widest text-[var(--amber)]">
        ▲ QUANTGPT TERMINAL ACCESS
      </div>
      <h1 className="mt-1 font-cond text-2xl font-bold uppercase text-[var(--ink)]">
        Sign In to Your Desk
      </h1>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Authenticate with your operator credentials. New accounts require a single-use invitation code.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-4 border border-[var(--down)]/60 bg-[var(--down)]/10 px-3 py-2 font-mono-num text-xs text-[var(--down)]"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block font-mono-num text-[11px] uppercase text-[var(--muted)]">
            Operator Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@domain.com"
            className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--amber)]"
          />
        </div>

        <div>
          <label className="block font-mono-num text-[11px] uppercase text-[var(--muted)]">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--amber)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--amber)] py-2.5 font-mono-num text-xs font-bold uppercase tracking-wider text-[#0A0D13] hover:opacity-95 disabled:opacity-50"
        >
          {loading ? 'AUTHENTICATING...' : 'SIGN IN TO TERMINAL →'}
        </button>
      </form>

      <div className="mt-6 border-t border-[var(--line)] pt-4 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Have an invitation code?</span>
        <Link href="/join" className="font-mono-num font-semibold text-[var(--amber)] hover:underline">
          REDEEM INVITE →
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 px-4">
        <Suspense fallback={<div className="p-12 text-center font-mono-num text-xs">Loading terminal auth...</div>}>
          <SignInForm />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
