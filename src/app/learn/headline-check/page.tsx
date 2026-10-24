'use client';

import React, { useMemo, useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';
import { analyzeHeadlineCheck, SAMPLE_HEADLINE_TRACKS } from '@/lib/quant/headline-check';

export default function HeadlineCheckPage() {
  const [rawInput, setRawInput] = useState(SAMPLE_HEADLINE_TRACKS.dotcom_hero.text);
  const [annualFeePct, setAnnualFeePct] = useState(1.0);
  const [slippagePct, setSlippagePct] = useState(0.35);
  const [taxDragPct, setTaxDragPct] = useState(0.8);

  const report = useMemo(
    () => analyzeHeadlineCheck(rawInput, { annualFeePct, slippagePct, taxDragPct }),
    [rawInput, annualFeePct, slippagePct, taxDragPct]
  );

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="border-b border-[var(--line)] pb-5">
          <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
            ▲ QUANTGPT INTERACTIVE AUDITOR · LOSS-FIRST RETURN ANALYSIS
          </div>
          <h1 className="mt-1 font-cond text-3xl font-bold uppercase sm:text-5xl">
            The Headline Check: Look Past the Since-Inception CAGR
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--body)]">
            Every pitch deck leads with a single 25-year CAGR. Paste any yearly or monthly return track below (or load a sample) to expose the worst drawdown, longest underwater stretch, rolling 36-month windows, and net return after fees, slippage, and taxes.
          </p>
        </div>

        {/* Sample Presets + Input Box */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-3 border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="font-mono-num text-xs font-bold uppercase text-[var(--amber)]">
              1. LOAD SAMPLE TRACK OR PASTE RETURNS
            </div>
            <div className="flex flex-wrap gap-1.5 font-mono-num text-[11px]">
              {Object.entries(SAMPLE_HEADLINE_TRACKS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRawInput(item.text)}
                  className="border border-[var(--line2)] bg-[var(--bg)] px-2.5 py-1 text-[var(--ink)] hover:border-[var(--amber)]"
                >
                  {item.label.split('(')[0]}
                </button>
              ))}
            </div>
            <textarea
              rows={8}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full border border-[var(--line2)] bg-[var(--field)] p-3 font-mono-num text-xs text-[var(--ink)] outline-none focus:border-[var(--amber)]"
            />
            <div className="grid grid-cols-3 gap-2 font-mono-num text-xs">
              <div>
                <label className="block text-[10px] text-[var(--muted)]">Fee (%/yr)</label>
                <input
                  type="number"
                  step={0.1}
                  value={annualFeePct}
                  onChange={(e) => setAnnualFeePct(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--muted)]">Slippage (%/yr)</label>
                <input
                  type="number"
                  step={0.1}
                  value={slippagePct}
                  onChange={(e) => setSlippagePct(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--muted)]">Tax Drag (%/yr)</label>
                <input
                  type="number"
                  step={0.1}
                  value={taxDragPct}
                  onChange={(e) => setTaxDragPct(Number(e.target.value))}
                  className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-2 py-1"
                />
              </div>
            </div>
          </div>

          {/* Loss-First Audit Output */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-[var(--down)]/40 bg-[var(--surface)] p-4">
              <div className="font-mono-num text-xs font-bold uppercase text-[var(--down)]">
                2. LOSS-FIRST REALITY CHECK (WHAT HURTS BEFORE YOU EARN THE CAGR)
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 font-mono-num">
                <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
                  <div className="text-[10px] text-[var(--muted)]">MAX DRAWDOWN</div>
                  <div className="mt-1 text-2xl font-bold text-[var(--down)]">
                    {report.lossFirst.maxDrawdownPct}%
                  </div>
                  <div className="text-[10px] text-[var(--faint)]">{report.lossFirst.maxDrawdownWindow}</div>
                </div>
                <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
                  <div className="text-[10px] text-[var(--muted)]">LONGEST UNDERWATER</div>
                  <div className="mt-1 text-2xl font-bold text-[var(--amber)]">
                    {report.lossFirst.longestUnderwaterMonths} mos
                  </div>
                  <div className="text-[10px] text-[var(--faint)]">
                    ({(report.lossFirst.longestUnderwaterMonths / 12).toFixed(1)} years below peak)
                  </div>
                </div>
                <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
                  <div className="text-[10px] text-[var(--muted)]">WORST CALENDAR YEAR</div>
                  <div className="mt-1 text-2xl font-bold text-[var(--down)]">
                    {report.lossFirst.worstCalendarYear.retPct}%
                  </div>
                  <div className="text-[10px] text-[var(--faint)]">Year {report.lossFirst.worstCalendarYear.year}</div>
                </div>
              </div>
            </div>

            <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="font-mono-num text-xs font-bold uppercase text-[var(--amber)]">
                3. ROLLING 36-MONTH WINDOWS & NET-OF-FRICTION CAGR
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono-num">
                <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
                  <div className="text-[10px] text-[var(--muted)]">GROSS CAGR</div>
                  <div className="mt-1 text-lg font-bold text-[var(--ink)]">{report.returnStats.cagrPct}%</div>
                </div>
                <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
                  <div className="text-[10px] text-[var(--muted)]">NET AFTER FEE/TAX</div>
                  <div className="mt-1 text-lg font-bold text-[var(--amber)]">
                    {report.returnStats.netCagrAfterFeeSlipTaxPct}%
                  </div>
                </div>
                <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
                  <div className="text-[10px] text-[var(--muted)]">36M POSITIVE WINDOWS</div>
                  <div className="mt-1 text-lg font-bold text-[var(--up)]">
                    {report.rollingWindows.win36mPositivePct}%
                  </div>
                </div>
                <div className="border border-[var(--line)] bg-[var(--bg)] p-3">
                  <div className="text-[10px] text-[var(--muted)]">WORST 3Y ROLLING CAGR</div>
                  <div className="mt-1 text-lg font-bold text-[var(--down)]">
                    {report.rollingWindows.worst36mCagrPct}%/yr
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Years Grid */}
        <div className="mt-6 border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="font-mono-num text-xs font-bold uppercase text-[var(--muted)]">
            YEAR-BY-YEAR RETURN TABLE ({report.yearsCount} YEARS)
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-9 font-mono-num text-xs">
            {report.calendarYears.map((y) => (
              <div
                key={y.year}
                className={`border p-2.5 ${
                  y.retPct < 0
                    ? 'border-[var(--down)]/40 bg-[var(--down)]/10 text-[var(--down)]'
                    : 'border-[var(--line)] bg-[var(--bg)] text-[var(--up)]'
                }`}
              >
                <div className="text-[10px] text-[var(--muted)]">{y.year}</div>
                <div className="mt-0.5 font-bold">
                  {y.retPct >= 0 ? '+' : ''}
                  {y.retPct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
