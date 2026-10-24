'use client';

import React from 'react';
import { TerminalShell } from '@/components/TerminalShell';

const RELEASES = [
  {
    date: '2026-04-18',
    tag: 'v2.9 · INVITE-ONLY ADMISSION & DUAL PRISMA',
    title: 'Single-Use Expiring Operator Invitations, Audit Logging & Admin Console',
    notes: 'Added cryptographic SHA-256 invitation tokens, role-based admission (USER/ADMIN), instant revocation, and full SQLite + PostgreSQL Prisma 7 support.',
  },
  {
    date: '2026-04-10',
    tag: 'v2.8 · QUANTGPT UNIVERSITY',
    title: '10-Chapter Quant School (S1–S5) & Grad School (G1–G5) with Mastery Quizzes',
    notes: 'Interactive curriculum pairing empirical theory with playable /learn/1..7 labs and persistent mastery quizzes.',
  },
  {
    date: '2026-03-28',
    tag: 'v2.7 · WORLD EVENTS & 4-RING RIPPLE',
    title: '19 Geopolitical Event Kinds, 15 Oil Shocks & Automated Event Guard Rules',
    notes: 'Added forward 1, 5, 21, and 63-session S&P 500 reaction distributions and automated strategy guard rules.',
  },
  {
    date: '2026-03-12',
    tag: 'v2.6 · AAOIFI HALAL SCREENER & 10Y DCF',
    title: '5-Test Islamic Finance Screen & Reverse-DCF Implied Growth Solver',
    notes: 'Integrated point-in-time AAOIFI compliance screening and 10-year DCF models with 5×5 sensitivity matrices.',
  },
];

export default function WhatsNewPage() {
  return (
    <TerminalShell
      title="What's New — Terminal Changelog & Releases"
      subtitle="Continuous shipping log across the QuantGPT data warehouse, MCP server, and research desks"
    >
      <div className="mx-auto max-w-4xl space-y-4">
        {RELEASES.map((r) => (
          <div key={r.date} className="border border-[var(--line2)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between font-mono-num text-xs">
              <span className="font-bold text-[var(--amber)]">{r.tag}</span>
              <span className="text-[var(--muted)]">{r.date}</span>
            </div>
            <h3 className="mt-2 font-cond text-2xl font-bold uppercase text-[var(--ink)]">{r.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--body)]">{r.notes}</p>
          </div>
        ))}
      </div>
    </TerminalShell>
  );
}
