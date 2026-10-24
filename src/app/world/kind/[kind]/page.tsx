'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { WORLD_KINDS } from '@/lib/quant/warehouse';

export default function WorldKindDetailPage() {
  const params = useParams<{ kind: string }>();
  const kind = String(params?.kind || 'war_onset');
  const data = (WORLD_KINDS[kind] || {}) as Record<string, unknown>;

  return (
    <TerminalShell
      title={`Event Kind Study: ${kind.toUpperCase()}`}
      subtitle="Historical event catalog, binomial sign test, and S&P 500 1/5/21/63-session reaction distribution"
      actions={
        <Link
          href="/world/kinds"
          className="border border-[var(--line2)] bg-[var(--bg)] px-3 py-1 font-mono-num text-xs text-[var(--muted)]"
        >
          ← All 19 Event Kinds
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
          <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
            WAREHOUSE EVENT TAXONOMY · /world/kind/{kind}
          </div>
          <h2 className="mt-1 font-cond text-3xl font-bold uppercase text-[var(--ink)]">
            {String(data.title || kind.replace(/_/g, ' '))}
          </h2>
          <p className="mt-2 text-sm text-[var(--body)]">
            {String(
              data.description ||
                'Point-in-time empirical event study measuring US equity and commodity reactions across 1, 5, 21, and 63 trading sessions.'
            )}
          </p>
          <pre className="mt-5 max-h-96 overflow-auto border border-[var(--line)] bg-[var(--bg)] p-4 font-mono-num text-xs text-[var(--body)]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </TerminalShell>
  );
}
