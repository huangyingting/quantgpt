'use client';

import React, { useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'QuantGPT Warehouse Agent ready. I have direct tool access to 175 strategy backtests, 3,234 point-in-time equities, 6-dimension Stock Grader, AAOIFI Halal compliance, 10-year DCF models, and 19 World Event kinds.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(promptText?: string) {
    const q = (promptText ?? input).trim();
    if (!q) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || 'Completed.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TerminalShell
      title="Ask AI — Warehouse Research Copilot"
      subtitle="Grounded quantitative assistant executing real backtests, stock grades, Halal checks, and DCF valuations"
    >
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap gap-2 font-mono-num text-xs">
          {[
            'Grade NVDA and check AAOIFI Halal compliance',
            'Run 10-year DCF model on MU with implied growth rate',
            'Backtest 12-1M Momentum with 2015 walk-forward split',
            'Show S&P 500 forward returns after war_onset events',
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleSend(preset)}
              className="border border-[var(--line2)] bg-[var(--surface)] px-3 py-1.5 text-[var(--amber)] hover:border-[var(--amber)]"
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="h-[460px] overflow-y-auto border border-[var(--line2)] bg-[var(--surface)] p-5 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`border p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'ml-12 border-[var(--amber)]/50 bg-[var(--amber)]/10 text-[var(--ink)]'
                  : 'mr-12 border-[var(--line)] bg-[var(--bg)] text-[var(--body)] font-mono-num'
              }`}
            >
              <div className="mb-1 text-[10px] uppercase text-[var(--muted)]">
                {m.role === 'user' ? 'OPERATOR' : 'QUANTGPT WAREHOUSE AGENT'}
              </div>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="font-mono-num text-xs text-[var(--amber)]">
              Executing warehouse tools...
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any ticker (NVDA, MU, AAPL), strategy preset, DCF model, or world event..."
            className="flex-1 border border-[var(--line2)] bg-[var(--field)] px-4 py-2.5 font-mono-num text-xs text-[var(--ink)] outline-none focus:border-[var(--amber)]"
          />
          <button
            type="submit"
            className="bg-[var(--amber)] px-6 py-2.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
          >
            Run Query →
          </button>
        </form>
      </div>
    </TerminalShell>
  );
}
