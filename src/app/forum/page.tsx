'use client';

import React, { useEffect, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { FORUM_BADGES, FORUM_CATEGORIES } from '@/lib/quant/warehouse';

export default function ForumPage() {
  const [posts, setPosts] = useState<Array<Record<string, unknown>>>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(FORUM_CATEGORIES[0].name);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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

  const filteredPosts =
    selectedCategory === 'ALL'
      ? posts
      : posts.filter((p) => String(p.category).toLowerCase() === selectedCategory.toLowerCase());

  return (
    <TerminalShell
      title="Operator Research Forum"
      subtitle="Peer-reviewed strategy threads, walk-forward failure post-mortems, and earned credential badges"
    >
      <div className="space-y-6">
        {/* 9 Official Earned Forum Badges */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-4">
          <div className="mb-2 font-mono-num text-[10px] uppercase tracking-wider text-[var(--amber)]">
            EARNED OPERATOR CREDENTIAL BADGES ({FORUM_BADGES.length} TIERS)
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-9 font-mono-num text-xs">
            {FORUM_BADGES.map((b) => (
              <div key={b.id} className="border border-[var(--line)] bg-[var(--bg)] p-2.5" title={b.desc}>
                <div className="font-bold text-[var(--amber)]">
                  [{b.icon}] {b.label}
                </div>
                <div className="mt-1 font-sans text-[10px] text-[var(--muted)] line-clamp-2">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 9 Official Forum Category Pills */}
        <div className="flex flex-wrap gap-1.5 font-mono-num text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 uppercase ${
              selectedCategory === 'ALL'
                ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]'
            }`}
          >
            All Categories ({posts.length})
          </button>
          {FORUM_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1 uppercase ${
                selectedCategory === c.name
                  ? 'bg-[var(--amber)] font-bold text-[#0A0D13]'
                  : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]'
              }`}
              title={c.desc}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            {filteredPosts.map((p, idx) => (
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
                {FORUM_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
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
      </div>
    </TerminalShell>
  );
}
