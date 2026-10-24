'use client';

import React, { useEffect, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';

export default function ForumPage() {
  const [posts, setPosts] = useState<Array<Record<string, unknown>>>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Research Findings');

  useEffect(() => {
    fetch('/api/forum')
      .then((r) => r.json())
      .then((d) => {
        if (d.posts) setPosts(d.posts);
      })
      .catch(() => {});
  }, []);

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const res = await fetch('/api/forum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, category }),
    });
    const d = await res.json();
    if (d.post) {
      setPosts((prev) => [d.post, ...prev]);
      setTitle('');
      setBody('');
    }
  }

  return (
    <TerminalShell
      title="Operator Research Forum"
      subtitle="Peer-reviewed strategy threads, walk-forward failure post-mortems, and MCP workflow recipes"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          {posts.map((p, idx) => (
            <div key={String(p.id || idx)} className="border border-[var(--line2)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between font-mono-num text-xs">
                <span className="text-[var(--amber)] uppercase">{String(p.category)}</span>
                <span className="text-[var(--muted)]">
                  By {String(p.authorHandle)} · ▲ {Number(p.upvotes || 1)}
                </span>
              </div>
              <h3 className="mt-2 font-cond text-xl font-bold uppercase text-[var(--ink)]">
                {String(p.title)}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--body)]">{String(p.body)}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 border border-[var(--line2)] bg-[var(--surface)] p-5 h-fit">
          <div className="font-mono-num text-xs font-bold uppercase text-[var(--amber)]">
            PUBLISH RESEARCH NOTE
          </div>
          <form onSubmit={handleCreatePost} className="mt-3 space-y-3 font-mono-num text-xs">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2"
            >
              <option value="Research Findings">Research Findings</option>
              <option value="Skeptic Audit">Skeptic Audit</option>
              <option value="World Events">World Events</option>
              <option value="MCP Prompts">MCP Prompts</option>
            </select>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Thread title..."
              className="w-full border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-[var(--ink)]"
            />
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share walk-forward results, preset IDs, or Skeptic findings..."
              className="w-full border border-[var(--line2)] bg-[var(--field)] p-3 text-[var(--ink)]"
            />
            <button
              type="submit"
              className="w-full bg-[var(--amber)] py-2 font-bold uppercase text-[#0A0D13]"
            >
              Post to Forum →
            </button>
          </form>
        </div>
      </div>
    </TerminalShell>
  );
}
