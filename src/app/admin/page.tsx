'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { TerminalShell } from '@/components/TerminalShell';

type InvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  handle: string | null;
  role: string;
  plan: string;
  createdAt: string;
};

type AuditRow = {
  id: string;
  action: string;
  targetEmail: string | null;
  metadataJson: string | null;
  createdAt: string;
  actor?: { email: string; name: string | null } | null;
};

export default function AdminConsolePage() {
  const { data: session, status } = useSession();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'PRO' | 'ADMIN'>('MEMBER');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [createdGrant, setCreatedGrant] = useState<{ token: string; invitePath: string; email: string } | null>(null);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    try {
      const [invRes, usrRes, logRes] = await Promise.all([
        fetch('/api/admin/invitations'),
        fetch('/api/admin/users'),
        fetch('/api/admin/audit-logs'),
      ]);
      if (invRes.ok) {
        const d = await invRes.json();
        setInvitations(d.invitations || []);
      }
      if (usrRes.ok) {
        const d = await usrRes.json();
        setUsers(d.users || []);
      }
      if (logRes.ok) {
        const d = await logRes.json();
        setLogs(d.logs || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAll();
    }
  }, [user?.role]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreatedGrant(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, expiresInDays }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not issue invitation.');
      } else {
        setCreatedGrant({
          token: data.token,
          invitePath: data.invitePath,
          email,
        });
        setEmail('');
        await loadAll();
      }
    } catch {
      setError('Failed to issue invitation.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    await fetch(`/api/admin/invitations/${id}/revoke`, { method: 'POST' });
    await loadAll();
  };

  const handleRoleChange = async (userId: string, nextRole: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: nextRole }),
    });
    await loadAll();
  };

  if (status === 'loading') {
    return (
      <TerminalShell title="Admin Invite & Governance Console" subtitle="Loading session...">
        <div className="p-8 font-mono-num text-xs text-[var(--muted)]">Checking administrator session...</div>
      </TerminalShell>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <TerminalShell
        title="Admin Invite & Governance Console"
        subtitle="Restricted to ADMIN operators provisioned via npm run bootstrap:admin"
      >
        <div className="mx-auto max-w-xl border border-[var(--down)]/50 bg-[var(--surface)] p-6">
          <div className="font-mono-num text-xs font-bold uppercase text-[var(--down)]">
            403 · ADMIN AUTHORIZATION REQUIRED
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--body)]">
            Only administrators can issue or revoke single-use account invitations, modify user roles, or inspect the security audit log.
          </p>
          <div className="mt-4 border border-[var(--line)] bg-[var(--bg)] p-3 font-mono-num text-[11px] text-[var(--amber)]">
            $ npm run bootstrap:admin -- --email admin@quantgpt.co --password &quot;...&quot;
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href="/signin?next=/admin"
              className="bg-[var(--amber)] px-4 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
            >
              Sign In as Admin →
            </Link>
          </div>
        </div>
      </TerminalShell>
    );
  }

  return (
    <TerminalShell
      title="Admin Invite & Governance Console"
      subtitle="Issue single-use expiring invitation codes, revoke access, manage RBAC roles, and audit security events"
    >
      <div className="space-y-6">
        {/* Issue Invite Form */}
        <section className="border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div className="font-mono-num text-[11px] uppercase tracking-wider text-[var(--amber)]">
            ISSUE SINGLE-USE ACCOUNT INVITATION
          </div>
          <form onSubmit={handleCreateInvite} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="block font-mono-num text-[10px] uppercase text-[var(--muted)]">
                Recipient Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@fund.com"
                className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--amber)]"
              />
            </div>

            <div>
              <label className="block font-mono-num text-[10px] uppercase text-[var(--muted)]">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'MEMBER' | 'PRO' | 'ADMIN')}
                className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-xs text-[var(--ink)]"
              >
                <option value="MEMBER">MEMBER (Standard)</option>
                <option value="PRO">PRO (Cloud + DCF XLSX)</option>
                <option value="ADMIN">ADMIN (Full Governance)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono-num text-[10px] uppercase text-[var(--muted)]">
                Expires In (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-xs text-[var(--ink)]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--amber)] py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13] hover:opacity-90"
              >
                {loading ? 'ISSUING...' : '+ GENERATE INVITE'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-3 border border-[var(--down)]/50 bg-[var(--down)]/10 p-2.5 font-mono-num text-xs text-[var(--down)]">
              {error}
            </div>
          )}

          {createdGrant && (
            <div className="mt-4 border border-[var(--up)]/60 bg-[var(--up)]/10 p-4">
              <div className="font-mono-num text-xs font-bold text-[var(--up)]">
                ✓ ONE-TIME INVITATION ISSUED FOR {createdGrant.email.toUpperCase()}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 font-mono-num text-xs">
                <div className="border border-[var(--line2)] bg-[var(--bg)] p-2">
                  <span className="text-[var(--muted)]">Raw Token: </span>
                  <span data-testid="issued-invite-token" className="text-[var(--amber)] select-all">
                    {createdGrant.token}
                  </span>
                </div>
                <div className="border border-[var(--line2)] bg-[var(--bg)] p-2">
                  <span className="text-[var(--muted)]">Invite Link: </span>
                  <Link href={createdGrant.invitePath} className="text-[var(--up)] underline select-all">
                    {createdGrant.invitePath}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Active & Historical Invitations */}
        <section className="border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="font-mono-num text-[11px] uppercase tracking-wider text-[var(--amber)]">
            INVITATION LEDGER ({invitations.length})
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono-num text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] text-[10px] uppercase text-[var(--muted)]">
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Expires</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2.5 pr-3 text-[var(--ink)]">{inv.email}</td>
                    <td className="py-2.5 pr-3 text-[var(--amber)]">{inv.role}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold ${
                          inv.status === 'PENDING'
                            ? 'bg-[var(--amber)]/15 text-[var(--amber)]'
                            : inv.status === 'ACCEPTED'
                              ? 'bg-[var(--up)]/15 text-[var(--up)]'
                              : 'bg-[var(--down)]/15 text-[var(--down)]'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-[var(--muted)]">
                      {new Date(inv.expiresAt).toISOString().slice(0, 10)}
                    </td>
                    <td className="py-2.5 text-right">
                      {inv.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(inv.id)}
                          className="border border-[var(--down)]/50 px-2 py-0.5 text-[10px] text-[var(--down)] hover:bg-[var(--down)] hover:text-white"
                        >
                          REVOKE
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {invitations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-[var(--muted)]">
                      No invitations issued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Registered Users & RBAC */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="font-mono-num text-[11px] uppercase tracking-wider text-[var(--amber)]">
              OPERATOR ACCOUNTS & ROLES ({users.length})
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left font-mono-num text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[10px] uppercase text-[var(--muted)]">
                    <th className="py-2">Email / Handle</th>
                    <th className="py-2">Role</th>
                    <th className="py-2 text-right">Update Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-2">
                        <div className="text-[var(--ink)]">{u.email}</div>
                        <div className="text-[10px] text-[var(--muted)]">@{u.handle || 'operator'}</div>
                      </td>
                      <td className="py-2 text-[var(--amber)]">{u.role}</td>
                      <td className="py-2 text-right">
                        <select
                          aria-label={`Role for ${u.email}`}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="border border-[var(--line2)] bg-[var(--bg)] px-2 py-1 text-[11px]"
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="PRO">PRO</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Security Audit Log */}
          <section className="border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="font-mono-num text-[11px] uppercase tracking-wider text-[var(--amber)]">
              SECURITY & ADMISSION AUDIT LOG ({logs.length})
            </div>
            <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-[var(--line)] font-mono-num text-xs">
              {logs.map((log) => (
                <div key={log.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--amber)]">{log.action}</span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--body)]">
                    Target: {log.targetEmail || 'system'} · Actor: {log.actor?.email || 'CLI'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </TerminalShell>
  );
}
