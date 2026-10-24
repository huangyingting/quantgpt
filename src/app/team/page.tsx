'use client';

import React, { useEffect, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';

export default function TeamBoardPage() {
  const [cards, setCards] = useState<Array<Record<string, unknown>>>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    fetch('/api/team')
      .then((r) => r.json())
      .then((d) => {
        if (d.board?.cards) setCards(d.board.cards);
      })
      .catch(() => {});
  }, []);

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        column: 'NOTES',
        title: newTitle,
        notes: newNotes,
      }),
    });
    const d = await res.json();
    if (d.card) {
      setCards((prev) => [...prev, d.card]);
      setNewTitle('');
      setNewNotes('');
    }
  }

  async function moveCard(id: string, nextCol: string) {
    await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'move', cardId: id, column: nextCol }),
    });
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, column: nextCol } : c)));
  }

  return (
    <TerminalShell
      title="Shared Team Research Kanban Board"
      subtitle="Collaborate across NOTES → RUNNING → DATA VALIDATED research pipelines"
    >
      <div className="space-y-6">
        <form onSubmit={handleAddCard} className="flex flex-wrap gap-2 border border-[var(--line2)] bg-[var(--surface)] p-4 font-mono-num text-xs">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New hypothesis card title..."
            className="flex-1 border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-[var(--ink)]"
          />
          <input
            type="text"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Target factor / ticker / split year notes..."
            className="flex-1 border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-[var(--ink)]"
          />
          <button
            type="submit"
            className="bg-[var(--amber)] px-4 py-2 font-bold uppercase text-[#0A0D13]"
          >
            + Add Hypothesis Card
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(['NOTES', 'RUNNING', 'DATA VALIDATED'] as const).map((col) => (
            <div key={col} className="border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="border-b border-[var(--line)] pb-2 font-mono-num text-xs font-bold uppercase text-[var(--amber)]">
                {col} ({cards.filter((c) => c.column === col).length})
              </div>
              <div className="mt-3 space-y-3">
                {cards
                  .filter((c) => c.column === col)
                  .map((c, idx) => (
                    <div key={String(c.id || idx)} className="border border-[var(--line2)] bg-[var(--bg)] p-3.5">
                      <div className="font-cond text-base font-bold uppercase text-[var(--ink)]">
                        {String(c.title)}
                      </div>
                      <p className="mt-1 text-xs text-[var(--body)]">{String(c.notes || '')}</p>
                      <div className="mt-3 flex gap-1.5 font-mono-num text-[10px]">
                        {col !== 'NOTES' && (
                          <button
                            type="button"
                            onClick={() => moveCard(String(c.id), 'NOTES')}
                            className="border border-[var(--line)] px-2 py-0.5 text-[var(--muted)]"
                          >
                            ← NOTES
                          </button>
                        )}
                        {col !== 'RUNNING' && (
                          <button
                            type="button"
                            onClick={() => moveCard(String(c.id), 'RUNNING')}
                            className="border border-[var(--amber)] px-2 py-0.5 text-[var(--amber)]"
                          >
                            RUNNING
                          </button>
                        )}
                        {col !== 'DATA VALIDATED' && (
                          <button
                            type="button"
                            onClick={() => moveCard(String(c.id), 'DATA VALIDATED')}
                            className="border border-[var(--up)] px-2 py-0.5 text-[var(--up)]"
                          >
                            VALIDATED →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TerminalShell>
  );
}
