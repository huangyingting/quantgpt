'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { UNIVERSITY_CHAPTERS } from '@/lib/quant/university';

export default function UniversityHubPage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('qg_uni_done') || '{}');
      setCompleted(local);
    } catch {
      // ignore
    }
    fetch('/api/university')
      .then((r) => r.json())
      .then((d) => {
        if (d.progress) {
          const map: Record<string, boolean> = {};
          for (const p of d.progress) {
            if (p.completed) map[p.chapterId] = true;
          }
          setCompleted((prev) => ({ ...prev, ...map }));
        }
      })
      .catch(() => {});
  }, []);

  const schoolChapters = UNIVERSITY_CHAPTERS.filter((c) => c.track === 'SCHOOL');
  const gradChapters = UNIVERSITY_CHAPTERS.filter((c) => c.track === 'GRAD');
  const doneCount = Object.values(completed).filter(Boolean).length;

  return (
    <TerminalShell
      title="QuantGPT University — 10-Chapter Quantitative Curriculum"
      subtitle="Master evidence-based investing across Quant School (S1–S5) and Grad School (G1–G5)"
    >
      <div className="space-y-8">
        {/* Progress Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border border-[var(--line2)] bg-[var(--surface)] p-5">
          <div>
            <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
              ▲ STRUCTURED CURRICULUM · THEORY + INTERACTIVE LESSON + 3-QUESTION MASTERY QUIZ
            </div>
            <h2 className="mt-1 font-cond text-2xl font-bold uppercase text-[var(--ink)]">
              Your University Progress: {doneCount} / {UNIVERSITY_CHAPTERS.length} Chapters Mastered
            </h2>
            <p className="mt-1 text-xs text-[var(--body)]">
              Each chapter pairs a concise empirical briefing with a hands-on lab (/learn/1–7) and a 3-question mastery check.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <div className="flex justify-between font-mono-num text-xs">
              <span className="text-[var(--muted)]">Completion</span>
              <span className="font-bold text-[var(--up)]">
                {Math.round((doneCount / UNIVERSITY_CHAPTERS.length) * 100)}%
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full bg-[var(--bg)] border border-[var(--line)]">
              <div
                className="h-full bg-[var(--up)] transition-all"
                style={{ width: `${(doneCount / UNIVERSITY_CHAPTERS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Track 1: Quant School (S1 - S5) */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono-num text-xs uppercase tracking-wider text-[var(--amber)]">
              TRACK I · QUANT SCHOOL (S1–S5) — FOUNDATIONS OF EMPIRICAL INVESTING
            </div>
            <span className="font-mono-num text-xs text-[var(--muted)]">5 Chapters</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schoolChapters.map((ch) => {
              const isDone = Boolean(completed[ch.id]);
              return (
                <Link
                  key={ch.id}
                  href={`/university/${ch.id}`}
                  className={`flex flex-col justify-between border bg-[var(--surface)] p-5 transition hover:border-[var(--amber)] ${
                    isDone ? 'border-[var(--up)]/60' : 'border-[var(--line)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono-num text-xs">
                      <span className="font-bold text-[var(--amber)]">CHAPTER {ch.id}</span>
                      {isDone ? (
                        <span className="bg-[var(--up)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--up)]">
                          ✓ MASTERED
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--muted)]">{ch.readingMinutes} min + Quiz</span>
                      )}
                    </div>
                    <h3 className="mt-2 font-cond text-xl font-bold uppercase text-[var(--ink)]">
                      {ch.title}
                    </h3>
                    <div className="mt-0.5 font-mono-num text-[11px] text-[var(--muted)]">{ch.subtitle}</div>
                    <p className="mt-2.5 text-xs leading-relaxed text-[var(--body)]">{ch.summary}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3 font-mono-num text-xs">
                    <span className="text-[var(--amber)]">Open Chapter & Quiz →</span>
                    <span className="text-[var(--muted)]">{ch.linkedLessonHref}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Track 2: Grad School (G1 - G5) */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono-num text-xs uppercase tracking-wider text-[var(--amber)]">
              TRACK II · GRAD SCHOOL (G1–G5) — MULTIPLE TESTING, FACTORS & SHARIAH / DCF MODELS
            </div>
            <span className="font-mono-num text-xs text-[var(--muted)]">5 Chapters</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gradChapters.map((ch) => {
              const isDone = Boolean(completed[ch.id]);
              return (
                <Link
                  key={ch.id}
                  href={`/university/${ch.id}`}
                  className={`flex flex-col justify-between border bg-[var(--surface)] p-5 transition hover:border-[var(--amber)] ${
                    isDone ? 'border-[var(--up)]/60' : 'border-[var(--line)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono-num text-xs">
                      <span className="font-bold text-[var(--amber)]">CHAPTER {ch.id}</span>
                      {isDone ? (
                        <span className="bg-[var(--up)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--up)]">
                          ✓ MASTERED
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--muted)]">{ch.readingMinutes} min + Quiz</span>
                      )}
                    </div>
                    <h3 className="mt-2 font-cond text-xl font-bold uppercase text-[var(--ink)]">
                      {ch.title}
                    </h3>
                    <div className="mt-0.5 font-mono-num text-[11px] text-[var(--muted)]">{ch.subtitle}</div>
                    <p className="mt-2.5 text-xs leading-relaxed text-[var(--body)]">{ch.summary}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3 font-mono-num text-xs">
                    <span className="text-[var(--amber)]">Open Chapter & Quiz →</span>
                    <span className="text-[var(--muted)]">{ch.linkedLessonHref}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </TerminalShell>
  );
}
