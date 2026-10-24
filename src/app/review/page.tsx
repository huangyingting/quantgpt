'use client';

import React, { useMemo, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { batchGradeStocks } from '@/lib/quant/grader';

export default function PortfolioReviewPage() {
  const [input, setInput] = useState('NVDA, MU, AAPL, MSFT, JPM, XOM');
  const grades = useMemo(
    () =>
      batchGradeStocks(
        input
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      ),
    [input]
  );

  return (
    <TerminalShell
      title="5-Factor Portfolio Checkup & Concentration Audit"
      subtitle="Diagnose factor tilts, weak Piotroski holdings, valuation stretch, and Shariah compliance across your holdings"
    >
      <div className="space-y-6">
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-4 font-mono-num text-xs">
          <label className="block text-[var(--amber)] font-bold">ENTER YOUR CURRENT PORTFOLIO TICKERS:</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            className="mt-2 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-[var(--ink)]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 font-mono-num text-xs">
          {grades.map((g) => (
            <div key={g.ticker} className="border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[var(--amber)]">{g.ticker}</span>
                <span className="bg-[var(--up)]/15 px-2 py-0.5 font-bold text-[var(--up)]">
                  Grade {g.compositeGrade}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-[var(--body)]">
                <div>Valuation: {g.dimensions.valuation.grade} · Growth: {g.dimensions.growth.grade}</div>
                <div>Quality: {g.dimensions.quality.grade} · Momentum: {g.dimensions.momentum.grade}</div>
                <div>Piotroski F-Score: {g.accountingScores.piotroskiF}/9 · Halal: {g.halal.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TerminalShell>
  );
}
