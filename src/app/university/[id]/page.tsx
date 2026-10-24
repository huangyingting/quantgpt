'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { TerminalShell } from '@/components/TerminalShell';
import { getUniversityChapter, UNIVERSITY_CHAPTERS } from '@/lib/quant/university';

export default function UniversityChapterPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id || 'S1');
  const chapter = getUniversityChapter(id);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  if (!chapter) {
    return (
      <TerminalShell title="Chapter Not Found">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-6">
          <p className="text-sm text-[var(--muted)]">No University chapter matched {id}.</p>
          <Link href="/university" className="mt-4 inline-block font-mono-num text-xs text-[var(--amber)]">
            ← Back to QuantGPT University
          </Link>
        </div>
      </TerminalShell>
    );
  }

  const score = chapter.quiz.reduce(
    (acc, q, idx) => acc + (answers[idx] === q.correctIndex ? 1 : 0),
    0
  );

  async function handleSubmitQuiz() {
    setSubmitted(true);
    const completed = score >= 2;
    try {
      const existing = JSON.parse(localStorage.getItem('qg_uni_done') || '{}');
      if (completed) {
        existing[chapter!.id] = true;
        localStorage.setItem('qg_uni_done', JSON.stringify(existing));
      }
      await fetch('/api/university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: chapter!.id,
          quizScore: score,
          completed,
        }),
      });
      setSavedNotice(
        completed
          ? `✓ Chapter ${chapter!.id} marked MASTERED (${score}/3 correct)`
          : `Scored ${score}/3 — review explanations below and retry to earn Mastery (2/3 required).`
      );
    } catch {
      // ignore
    }
  }

  const currentIdx = UNIVERSITY_CHAPTERS.findIndex((c) => c.id === chapter.id);
  const nextChapter = UNIVERSITY_CHAPTERS[currentIdx + 1];

  return (
    <TerminalShell
      title={`University Chapter ${chapter.id}: ${chapter.title}`}
      subtitle={`${chapter.track === 'SCHOOL' ? 'Quant School' : 'Grad School'} · ${chapter.subtitle}`}
      actions={
        <Link
          href="/university"
          className="border border-[var(--line2)] bg-[var(--bg)] px-2.5 py-1 font-mono-num text-[11px] text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← All 10 Chapters
        </Link>
      }
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Chapter Header & Interactive Lab CTA */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono-num text-xs font-bold uppercase text-[var(--amber)]">
                CHAPTER {chapter.id} · {chapter.track} TRACK
              </span>
              <h2 className="mt-1 font-cond text-3xl font-bold uppercase text-[var(--ink)]">
                {chapter.title}
              </h2>
            </div>
            <Link
              href={chapter.linkedLessonHref}
              className="bg-[var(--amber)] px-4 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
            >
              ▶ Launch Interactive Lab →
            </Link>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--body)]">{chapter.summary}</p>

          {/* Key Takeaways */}
          <div className="mt-5 border border-[var(--line)] bg-[var(--bg)] p-4">
            <div className="font-mono-num text-xs font-bold uppercase text-[var(--amber)]">
              KEY EMPIRICAL TAKEAWAYS
            </div>
            <ul className="mt-2.5 space-y-2 text-xs text-[var(--body)]">
              {chapter.keyTakeaways.map((kt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono-num text-[var(--up)]">0{i + 1}.</span>
                  <span>{kt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Content */}
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--body)]">
            {chapter.content.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* 3-Question Mastery Quiz */}
        <div className="border border-[var(--line2)] bg-[var(--surface)] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono-num text-xs uppercase text-[var(--amber)]">
                CHAPTER {chapter.id} MASTERY CHECK
              </div>
              <h3 className="font-cond text-2xl font-bold uppercase text-[var(--ink)]">
                3-Question Empirical Verification Quiz
              </h3>
            </div>
            {submitted && (
              <span className="border border-[var(--up)] bg-[var(--up)]/15 px-3 py-1 font-mono-num text-xs font-bold text-[var(--up)]">
                SCORE: {score} / {chapter.quiz.length}
              </span>
            )}
          </div>

          {chapter.quiz.map((q, qIdx) => (
            <div key={qIdx} className="border border-[var(--line)] bg-[var(--bg)] p-4">
              <div className="font-mono-num text-xs font-bold text-[var(--ink)]">
                Q{qIdx + 1}. {q.question}
              </div>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oIdx) => {
                  const picked = answers[qIdx] === oIdx;
                  const isRight = q.correctIndex === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                      className={`flex w-full items-center justify-between border px-3.5 py-2.5 text-left font-mono-num text-xs transition ${
                        submitted
                          ? isRight
                            ? 'border-[var(--up)] bg-[var(--up)]/15 text-[var(--up)] font-bold'
                            : picked
                              ? 'border-[var(--down)] bg-[var(--down)]/15 text-[var(--down)]'
                              : 'border-[var(--line)] text-[var(--muted)]'
                          : picked
                            ? 'border-[var(--amber)] bg-[var(--amber)]/15 text-[var(--amber)] font-bold'
                            : 'border-[var(--line)] text-[var(--body)] hover:border-[var(--line2)]'
                      }`}
                    >
                      <span>{opt}</span>
                      {submitted && isRight && <span>✓ CORRECT</span>}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className="mt-3 border-t border-[var(--line)] pt-2.5 text-xs text-[var(--muted)]">
                  <strong className="text-[var(--amber)]">Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}

          {savedNotice && (
            <div className="border border-[var(--up)] bg-[var(--up)]/10 p-3 font-mono-num text-xs text-[var(--up)]">
              {savedNotice}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmitQuiz}
              className="bg-[var(--amber)] px-5 py-2.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
            >
              Submit Mastery Quiz →
            </button>

            {nextChapter && (
              <Link
                href={`/university/${nextChapter.id}`}
                className="border border-[var(--line2)] bg-[var(--bg)] px-4 py-2 font-mono-num text-xs uppercase text-[var(--ink)] hover:border-[var(--amber)]"
              >
                Next: Chapter {nextChapter.id} ({nextChapter.title}) →
              </Link>
            )}
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}
