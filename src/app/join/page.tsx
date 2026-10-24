'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('invite') || searchParams.get('token') || searchParams.get('code') || '';

  const [token, setToken] = useState(initialToken);
  const [inviteStatus, setInviteStatus] = useState<{
    status: string;
    email?: string;
    maskedEmail?: string | null;
    role?: string;
    expiresAt?: string | null;
  } | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token.trim()) {
      setInviteStatus(null);
      return;
    }
    let active = true;
    fetch(`/api/invitations/${encodeURIComponent(token.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setInviteStatus(data);
        if (data.email && !email) {
          setEmail(data.email);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          email: email.trim(),
          password,
          name: name.trim(),
          handle: handle.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });
      router.push('/tour');
      router.refresh();
    } catch {
      setError('Failed to redeem invitation.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-12 max-w-lg border border-[var(--line2)] bg-[var(--surface)] p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono-num text-[11px] uppercase tracking-widest text-[var(--amber)]">
          ▲ INVITE-ONLY ADMISSION
        </span>
        <span className="border border-[var(--line2)] bg-[var(--bg)] px-2 py-0.5 font-mono-num text-[10px] text-[var(--muted)]">
          SINGLE-USE CODE REQUIRED
        </span>
      </div>

      <h1 className="mt-2 font-cond text-2xl font-bold uppercase text-[var(--ink)]">
        Redeem Operator Invitation
      </h1>
      <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
        QuantGPT is an invite-only research terminal. Enter your single-use invitation code below to provision your operator account.
      </p>

      {inviteStatus && (
        <div
          className={`mt-4 border p-3 font-mono-num text-xs ${
            inviteStatus.status === 'pending'
              ? 'border-[var(--up)]/50 bg-[var(--up)]/10 text-[var(--up)]'
              : 'border-[var(--down)]/50 bg-[var(--down)]/10 text-[var(--down)]'
          }`}
        >
          {inviteStatus.status === 'pending' ? (
            <div>
              ✓ VALID INVITATION · Bound to <strong>{inviteStatus.email || inviteStatus.maskedEmail}</strong> · Role:{' '}
              <strong>{inviteStatus.role || 'MEMBER'}</strong>
            </div>
          ) : (
            <div>
              ✕ INVITATION STATUS: <strong>{inviteStatus.status.toUpperCase()}</strong>
            </div>
          )}
        </div>
      )}

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
            Single-Use Invitation Code
          </label>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste invitation token..."
            className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-xs text-[var(--amber)] outline-none focus:border-[var(--amber)]"
          />
        </div>

        <div>
          <label className="block font-mono-num text-[11px] uppercase text-[var(--muted)]">
            Invited Email Address
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block font-mono-num text-[11px] uppercase text-[var(--muted)]">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--amber)]"
            />
          </div>
          <div>
            <label className="block font-mono-num text-[11px] uppercase text-[var(--muted)]">
              Operator Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="quant_ada"
              className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-sm text-[var(--ink)] outline-none focus:border-[var(--amber)]"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono-num text-[11px] uppercase text-[var(--muted)]">
            Password (minimum 10 characters)
          </label>
          <input
            type="password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 10 characters"
            className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--amber)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--amber)] py-2.5 font-mono-num text-xs font-bold uppercase tracking-wider text-[#0A0D13] hover:opacity-95 disabled:opacity-50"
        >
          {loading ? 'PROVISIONING OPERATOR DESK...' : 'ACTIVATE INVITATION & CREATE ACCOUNT →'}
        </button>
      </form>

      <div className="mt-6 border-t border-[var(--line)] pt-4 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Already have an operator account?</span>
        <Link href="/signin" className="font-mono-num font-semibold text-[var(--amber)] hover:underline">
          SIGN IN →
        </Link>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 px-4">
        <Suspense fallback={<div className="p-12 text-center font-mono-num text-xs">Loading invite validator...</div>}>
          <JoinForm />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
