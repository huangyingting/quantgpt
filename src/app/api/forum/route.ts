import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  const posts = await prisma.forumPost.findMany({
    where: category && category !== 'all' ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; handle?: string; name?: string; role?: string } | undefined;
  const body = await request.json();

  if (body.postId && body.replyBody) {
    const reply = await prisma.forumReply.create({
      data: {
        postId: String(body.postId),
        userId: user?.id || null,
        authorHandle: user?.handle || user?.name || String(body.authorHandle || 'operator_desk'),
        body: String(body.replyBody).trim(),
      },
    });
    return NextResponse.json({ ok: true, reply });
  }

  const post = await prisma.forumPost.create({
    data: {
      userId: user?.id || null,
      authorHandle: user?.handle || user?.name || String(body.authorHandle || 'operator_desk'),
      authorRole: user?.role || 'MEMBER',
      category: String(body.category || 'studies'),
      title: String(body.title || 'Untitled Research Note').trim(),
      body: String(body.body || '').trim(),
      studyPayloadJson: body.studyPayload ? JSON.stringify(body.studyPayload) : null,
    },
    include: { replies: true },
  });

  return NextResponse.json({ ok: true, post });
}
