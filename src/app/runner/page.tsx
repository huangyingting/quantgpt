'use client';

import React, { useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';

const DEFAULT_BOT_CODE = `# QuantGPT Cloud Bot — Daily 15:50 America/New_York Execution
from quantgpt_sdk import Warehouse, AlpacaBroker

def rebalance(ctx):
    # 1. Check 200-Day SMA Buffered Trend (+1% / -3% band) on $SPXTR
    regime = Warehouse.market_regime("$SPXTR", sma=200, enter_band=0.01, exit_band=-0.03)
    if regime.state == "RED_DEFENSIVE":
        return AlpacaBroker.target_weights({"SGOV": 1.0})  # 100% 3-Month US T-Bills

    # 2. Screen Top 20 Cross-Sectional 12-1M Momentum + Piotroski F >= 7
    picks = Warehouse.screen(universe="SP500", factor="mom_12_1", min_piotroski=7, top_n=20)
    weights = {ticker: 1.0 / len(picks) for ticker in picks}
    return AlpacaBroker.target_weights(weights)
`;

export default function CloudRunnerPage() {
  const [botName, setBotName] = useState('Buffered 200d Trend + Top 20 Momentum');
  const [mode, setMode] = useState<'PAPER' | 'LIVE'>('PAPER');
  const [scheduleCron, setScheduleCron] = useState('50 15 * * 1-5');
  const [code, setCode] = useState(DEFAULT_BOT_CODE);
  const [attestationAccepted, setAttestationAccepted] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [versionSha, setVersionSha] = useState('94a21c8e4b10');

  async function handleDeployBot() {
    if (mode === 'LIVE' && !attestationAccepted) {
      setStatusMsg('✕ Live trading requires signing the self-directed risk attestation.');
      return;
    }
    const res = await fetch('/api/runner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: botName,
        mode,
        scheduleCron,
        code,
        liveAttested: attestationAccepted,
      }),
    });
    const data = await res.json();
    if (data.bot?.versionSha) setVersionSha(data.bot.versionSha);
    setStatusMsg(`✓ Bot deployed (${mode}) · Version SHA ${data.bot?.versionSha || versionSha} · Scheduled 15:50 America/New_York`);
  }

  return (
    <TerminalShell
      title="QuantGPT Cloud — Scheduled Python Bot Runner & Alpaca Execution"
      subtitle="Deploy version-hashed Python bots on a daily 15:50 America/New_York schedule with paper & live Alpaca routing"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 font-mono-num text-xs">
        <div className="lg:col-span-7 space-y-4 border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase text-[var(--amber)]">PYTHON STRATEGY BOT SOURCE</span>
            <span className="text-[var(--muted)]">SHA-256: {versionSha}</span>
          </div>
          <input
            type="text"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 font-bold text-[var(--ink)]"
          />
          <textarea
            rows={14}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-[var(--line2)] bg-[var(--bg)] p-3 font-mono-num text-xs text-[var(--up)] outline-none focus:border-[var(--amber)]"
          />
        </div>

        <div className="lg:col-span-5 space-y-4 border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div className="font-bold uppercase text-[var(--amber)]">EXECUTION & SCHEDULE CONFIG</div>
          <div>
            <label className="block text-[10px] text-[var(--muted)]">EXECUTION MODE</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['PAPER', 'LIVE'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`border py-2 font-bold ${
                    mode === m
                      ? 'border-[var(--amber)] bg-[var(--amber)] text-[#0A0D13]'
                      : 'border-[var(--line)] text-[var(--muted)]'
                  }`}
                >
                  ALPACA {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[var(--muted)]">
              NYSE / AMERICA/NEW_YORK CRON SCHEDULE
            </label>
            <input
              type="text"
              value={scheduleCron}
              onChange={(e) => setScheduleCron(e.target.value)}
              className="mt-1 w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-[var(--ink)]"
            />
            <div className="mt-1 text-[10px] text-[var(--faint)]">
              Default: 50 15 * * 1-5 (15:50 ET, 10 minutes before NYSE closing bell)
            </div>
          </div>

          <label className="flex items-start gap-2 border border-[var(--line)] bg-[var(--bg)] p-3 text-[11px] text-[var(--body)]">
            <input
              type="checkbox"
              checked={attestationAccepted}
              onChange={(e) => setAttestationAccepted(e.target.checked)}
              className="mt-0.5 accent-[#F0A83C]"
            />
            <span>
              I attest that this bot executes self-directed orders in my own brokerage account and that QuantGPT is a software publisher, not an investment adviser.
            </span>
          </label>

          {statusMsg && (
            <div className="border border-[var(--up)] bg-[var(--up)]/10 p-3 text-[var(--up)]">
              {statusMsg}
            </div>
          )}

          <button
            type="button"
            onClick={handleDeployBot}
            className="w-full bg-[var(--amber)] py-2.5 font-bold uppercase text-[#0A0D13]"
          >
            ▶ Commit & Schedule Cloud Bot
          </button>
        </div>
      </div>
    </TerminalShell>
  );
}
