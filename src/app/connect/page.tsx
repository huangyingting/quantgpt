'use client';

import React, { useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';

export default function ConnectAiPage() {
  const [clientTab, setClientTab] = useState<'claude' | 'chatgpt' | 'cursor' | 'pastepack'>('claude');
  const [generatedKey, setGeneratedKey] = useState('qg_sk_live_98f4a21c7e3b0019c4d2');
  const [copied, setCopied] = useState(false);

  async function handleGenerateKey() {
    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_api_key', label: 'MCP Connector Key' }),
      });
      const data = await res.json();
      if (data.rawKey) setGeneratedKey(data.rawKey);
      else setGeneratedKey(`qg_sk_${Math.random().toString(36).slice(2, 18)}`);
    } catch {
      setGeneratedKey(`qg_sk_${Math.random().toString(36).slice(2, 18)}`);
    }
  }

  return (
    <TerminalShell
      title="Connect AI — Model Context Protocol (MCP) & Paste-Pack"
      subtitle="Wire Claude, ChatGPT, Cursor, or Gemini directly to QuantGPT's 19 core warehouse tools (/api/mcp)"
    >
      <div className="space-y-6">
        {/* API Key Issuer */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
                STEP 1 · YOUR PERSONAL MCP BEARER KEY
              </div>
              <h2 className="mt-1 font-cond text-2xl font-bold uppercase text-[var(--ink)]">
                JSON-RPC 2.0 MCP Server Endpoint: /api/mcp
              </h2>
            </div>
            <button
              type="button"
              onClick={handleGenerateKey}
              className="bg-[var(--amber)] px-4 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
            >
              + Issue New API Key
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-[var(--line)] bg-[var(--bg)] p-3 font-mono-num text-xs">
            <span className="text-[var(--up)]">{generatedKey}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(generatedKey);
                setCopied(true);
              }}
              className="border border-[var(--line2)] px-3 py-1 text-[var(--amber)]"
            >
              {copied ? '✓ COPIED' : 'COPY KEY'}
            </button>
          </div>
        </div>

        {/* Client Configuration Tabs */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-3 font-mono-num text-xs">
            {(['claude', 'chatgpt', 'cursor', 'pastepack'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setClientTab(t)}
                className={`px-4 py-1.5 uppercase ${
                  clientTab === t
                    ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                    : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <pre className="mt-4 overflow-x-auto border border-[var(--line)] bg-[var(--bg)] p-4 font-mono-num text-xs text-[var(--up)]">
            {clientTab === 'pastepack'
              ? `=== QUANTGPT PASTE-PACK CONTEXT ===
Warehouse: 3,234 US Equities (1998-2026 Point-in-Time), 45-Day EDGAR Lag
Benchmarks: S&P 500 Buy & Hold (8.66% CAGR, 0.52 Sharpe, -56.8% Max DD)
200d Buffered Trend (+1%/-3% + 3M T-Bills): 10.62% CAGR, 0.94 Sharpe, -24.5% Max DD
Full Paste-Pack URL: /pastepack.txt`
              : `{
  "mcpServers": {
    "quantgpt": {
      "url": "http://localhost:3000/api/mcp",
      "headers": {
        "Authorization": "Bearer ${generatedKey}"
      }
    }
  }
}`}
          </pre>
        </div>
      </div>
    </TerminalShell>
  );
}
