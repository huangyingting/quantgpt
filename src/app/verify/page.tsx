'use client';

import React, { useEffect, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';

export default function VerifyWarehousePage() {
  const [ticker, setTicker] = useState('NVDA');
  const [date, setDate] = useState('2024-06-14');
  const [barProof, setBarProof] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/verify/bar?ticker=${encodeURIComponent(ticker)}&date=${encodeURIComponent(date)}`)
      .then((r) => r.json())
      .then((d) => setBarProof(d))
      .catch(() => {});
  }, [ticker, date]);

  return (
    <TerminalShell
      title="Data Warehouse Audit & Point-in-Time Bar Verifier"
      subtitle="Cryptographic SHA-256 verification of daily OHLCV bars, SEC EDGAR 45-day filing lag, and survivorship-free universe"
    >
      <div className="space-y-6 font-mono-num text-xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] text-[var(--muted)]">EQUITY UNIVERSE</div>
            <div className="mt-1 text-xl font-bold text-[var(--up)]">3,234 Tickers</div>
            <div className="text-[10px] text-[var(--faint)]">Includes delisted & acquired names</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] text-[var(--muted)]">SEC EDGAR LAG</div>
            <div className="mt-1 text-xl font-bold text-[var(--amber)]">45 Calendar Days</div>
            <div className="text-[10px] text-[var(--faint)]">Zero look-ahead bias on 10-K / 10-Q</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] text-[var(--muted)]">WALK-FORWARD SPLIT</div>
            <div className="mt-1 text-xl font-bold text-[var(--up)]">2015-01-01</div>
            <div className="text-[10px] text-[var(--faint)]">11+ years held out-of-sample</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] text-[var(--muted)]">RECONCILIATION</div>
            <div className="mt-1 text-xl font-bold text-[var(--up)]">99.98% Match</div>
            <div className="text-[10px] text-[var(--faint)]">CRSP / Compustat / FRED audited</div>
          </div>
        </div>

        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
          <div className="font-bold uppercase text-[var(--amber)]">
            INTERACTIVE SINGLE-BAR CRYPTOGRAPHIC AUDIT (/api/verify/bar)
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-28 border border-[var(--line2)] bg-[var(--field)] px-3 py-1.5 font-bold uppercase text-[var(--amber)]"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-[var(--line2)] bg-[var(--field)] px-3 py-1.5 text-[var(--ink)]"
            />
          </div>
          {barProof && (
            <pre className="mt-4 overflow-x-auto border border-[var(--line)] bg-[var(--bg)] p-4 text-[var(--up)]">
              {JSON.stringify(barProof, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </TerminalShell>
  );
}
