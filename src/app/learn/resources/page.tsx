'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';
import { RESOURCES } from '@/lib/quant/warehouse';

export default function ResourcesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const s = new Set<string>(['all']);
    for (const r of RESOURCES) {
      if (r.category) s.add(r.category);
    }
    return Array.from(s);
  }, []);

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      if (category !== 'all' && r.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          (r.authors || '').toLowerCase().includes(q) ||
          (r.summary || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, category]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="border-b border-[var(--line)] pb-6">
          <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
            ▲ QUANTGPT READING ROOM · {RESOURCES.length} ACADEMIC PAPERS & BOOKS
          </div>
          <h1 className="mt-1 font-cond text-3xl font-bold uppercase sm:text-5xl">
            91 Foundational Quant Papers, Books & Investor Letters
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--body)]">
            Every strategy in our warehouse traces back to peer-reviewed empirical finance literature or audited practitioner letters. Search by author, anomaly, or publication year.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border border-[var(--line)] bg-[var(--surface)] p-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 91 papers & books (Fama, Piotroski, Jegadeesh, Asness, López de Prado)..."
            className="flex-1 border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-xs text-[var(--ink)] outline-none focus:border-[var(--amber)]"
          />
          <select
            aria-label="Filter papers by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-mono-num text-xs uppercase text-[var(--ink)]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                CATEGORY: {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => (
            <div key={idx} className="flex flex-col justify-between border border-[var(--line)] bg-[var(--surface)] p-4">
              <div>
                <div className="flex items-center justify-between font-mono-num text-[10px] uppercase">
                  <span className="text-[var(--amber)]">{item.category || 'Paper'}</span>
                  <span className="text-[var(--muted)]">{item.year}</span>
                </div>
                <h2 className="mt-2 font-cond text-lg font-bold uppercase text-[var(--ink)]">{item.title}</h2>
                <div className="mt-1 font-mono-num text-[11px] text-[var(--muted)]">{item.authors}</div>
                <p className="mt-2 text-xs leading-relaxed text-[var(--body)]">{item.summary}</p>
              </div>
              <div className="mt-4 border-t border-[var(--line)] pt-3 flex items-center justify-between font-mono-num text-xs">
                <Link href="/library" className="text-[var(--amber)] hover:underline">
                  View Matching Strategy →
                </Link>
                <Link href="/terminal" className="text-[var(--muted)] hover:text-[var(--ink)]">
                  Test in Terminal →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
