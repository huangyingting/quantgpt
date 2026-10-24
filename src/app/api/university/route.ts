import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UNIVERSITY_CHAPTERS } from '@/lib/quant/university';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const progressRows = userId
    ? await prisma.universityProgress.findMany({ where: { userId } })
    : [];

  const progressMap = Object.fromEntries(progressRows.map((r) => [r.chapterId, r]));

  return NextResponse.json({
    chapters: UNIVERSITY_CHAPTERS.map((ch) => ({
      ...ch,
      progress: progressMap[ch.id] || {
        chapterId: ch.id,
        lessonPlayed: false,
        actionDone: false,
        quizPassed: false,
        quizScore: 0,
      },
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const body = await request.json();

  const chapterId = String(body.chapterId || 'S1');
  const lessonPlayed = body.lessonPlayed !== undefined ? Boolean(body.lessonPlayed) : undefined;
  const actionDone = body.actionDone !== undefined ? Boolean(body.actionDone) : undefined;
  const quizScore = body.quizScore !== undefined ? Number(body.quizScore) : undefined;
  const quizPassed = quizScore !== undefined ? quizScore >= 2 : undefined;

  if (!userId) {
    return NextResponse.json({
      ok: true,
      progress: {
        chapterId,
        lessonPlayed: lessonPlayed ?? true,
        actionDone: actionDone ?? true,
        quizPassed: quizPassed ?? true,
        quizScore: quizScore ?? 3,
      },
    });
  }

  const existing = await prisma.universityProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  });

  const updated = await prisma.universityProgress.upsert({
    where: { userId_chapterId: { userId, chapterId } },
    create: {
      userId,
      chapterId,
      lessonPlayed: lessonPlayed ?? false,
      actionDone: actionDone ?? false,
      quizPassed: quizPassed ?? false,
      quizScore: quizScore ?? 0,
    },
    update: {
      lessonPlayed: lessonPlayed ?? existing?.lessonPlayed ?? false,
      actionDone: actionDone ?? existing?.actionDone ?? false,
      quizPassed: quizPassed ?? existing?.quizPassed ?? false,
      quizScore: quizScore ?? existing?.quizScore ?? 0,
    },
  });

  return NextResponse.json({ ok: true, progress: updated });
}
