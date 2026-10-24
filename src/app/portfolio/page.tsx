'use client';

import React, { useMemo, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { gradeStock } from '@/lib/quant/grader';

export default function PortfolioBuilderPage() {
  const [holdings, setHoldings] = useState([
    { ticker: 'NVDA', weightPct: 20 },
    { ticker: 'MU', weightPct: 15 },
    { ticker: 'MSFT', weightPct: 15 },
    { ticker: 'AAPL', weightPct: 15 },
    { ticker: 'AVGO', weightPct: 15 },
    { ticker: 'LLY', weightPct: 10 },
    { ticker: 'COST', weightPct: 10 },
  ]);
  const [newTicker, setNewTicker] = useState('');

  const audited = useMemo(
    () =>
      holdings.map((h) => ({
        ...h,
        grade: gradeStock(h.ticker),
      })),
    [holdings]
  );

  const totalWeight = holdings.reduce((s, h) => s + h.weightPct, 0);
  const halalCompliantWeight = audited
    .filter((a) => a.grade.halal.status === 'HALAL')
    .reduce((s, a) => s + a.weightPct, 0);

  return (
    <TerminalShell
      title="Portfolio Builder & Factor Exposure Desk"
      subtitle="Construct custom multi-stock portfolios, audit weighted Piotroski F-Score, and verify AAOIFI Halal compliance"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono-num">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] text-[var(--muted)]">HOLDINGS COUNT</div>
            <div className="mt-1 text-2xl font-bold text-[var(--ink)]">{holdings.length} Positions</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] text-[var(--muted)]">TOTAL WEIGHT</div>
            <div className="mt-1 text-2xl font-bold text-[var(--amber)]">{totalWeight}%</div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] text-[var(--muted)]">AVG PIOTROSKI F</div>
            <div className="mt-1 text-2xl font-bold text-[var(--up)]">
              {(
                audited.reduce((s, a) => s + a.grade.accountingScores.piotroskiF, 0) /
                Math.max(1, audited.length)
              ).toFixed(1)}{' '}
              / 9
            </div>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="text-[10px] text-[var(--muted)]">HALAL COMPLIANT WEIGHT</div>
            <div className="mt-1 text-2xl font-bold text-[var(--up)]">{halalCompliantWeight}%</div>
          </div>
        </div>

        <div className="border border-[var(--line2)] bg-[var(--surface)] p-4">
          <div className="mb-3 flex gap-2 font-mono-num text-xs">
            <input
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              placeholder="Add ticker (e.g., META, GOOGL)..."
              className="border border-[var(--line2)] bg-[var(--field)] px-3 py-1.5 uppercase text-[var(--ink)]"
            />
            <button
              type="button"
              onClick={() => {
                if (!newTicker.trim()) return;
                setHoldings((prev) => [...prev, { ticker: newTicker.trim(), weightPct: 10 }]);
                setNewTicker('');
              }}
              className="bg-[var(--amber)] px-4 py-1.5 font-bold uppercase text-[#0A0D13]"
            >
              + Add Position
            </button>
          </div>

          <table className="w-full text-left font-mono-num text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[10px] uppercase text-[var(--muted)]">
                <th className="p-2.5">Ticker</th>
                <th className="p-2.5">Name</th>
                <th className="p-2.5">Sector</th>
                <th className="p-2.5">Weight (%)</th>
                <th className="p-2.5">Composite Grade</th>
                <th className="p-2.5">Piotroski F</th>
                <th className="p-2.5">AAOIFI Halal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {audited.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-bold text-[var(--amber)]">{item.ticker}</td>
                  <td className="p-2.5">{item.grade.name}</td>
                  <td className="p-2.5 text-[var(--muted)]">{item.grade.sector}</td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      value={item.weightPct}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setHoldings((prev) =>
                          prev.map((p, i) => (i === idx ? { ...p, weightPct: val } : p))
                        );
                      }}
                      className="w-16 border border-[var(--line2)] bg-[var(--field)] px-2 py-1"
                    />
                  </td>
                  <td className="p-2.5 font-bold text-[var(--up)]">{item.grade.compositeGrade}</td>
                  <td className="p-2.5">{item.grade.accountingScores.piotroskiF}/9</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold ${
                        item.grade.halal.status === 'HALAL'
                          ? 'bg-[var(--up)]/15 text-[var(--up)]'
                          : 'bg-[var(--down)]/15 text-[var(--down)]'
                      }`}
                    >
                      {item.grade.halal.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TerminalShell>
  );
}
