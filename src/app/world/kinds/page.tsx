'use client';

import Link from 'next/link';
import React from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { WORLD_KINDS } from '@/lib/quant/warehouse';

export default function WorldKindsIndexPage() {
  const kinds = Object.keys(WORLD_KINDS);
  return (
    <TerminalShell
      title="World Event Taxonomy — 19 Empirical Event Kinds"
      subtitle="Browse all 19 geopolitical, monetary, and commodity shock classifications in the QuantGPT warehouse"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kinds.map((k) => {
          const item = (WORLD_KINDS[k] || {}) as { title?: string; description?: string; count?: number };
          return (
            <Link
              key={k}
              href={`/world/kind/${k}`}
              className="flex flex-col justify-between border border-[var(--line)] bg-[var(--surface)] p-5 hover:border-[var(--amber)]"
            >
              <div>
                <div className="font-mono-num text-xs font-bold uppercase text-[var(--amber)]">
                  {k.replace(/_/g, ' ')}
                </div>
                <h3 className="mt-1 font-cond text-xl font-bold uppercase text-[var(--ink)]">
                  {item.title || k.replace(/_/g, ' ')}
                </h3>
                <p className="mt-2 text-xs text-[var(--body)]">
                  {item.description || 'Historical event dates, 4-ring geographic ripple, and S&P 500 forward reactions.'}
                </p>
              </div>
              <div className="mt-4 border-t border-[var(--line)] pt-2.5 font-mono-num text-xs text-[var(--amber)]">
                Open Event Study →
              </div>
            </Link>
          );
        })}
      </div>
    </TerminalShell>
  );
}
