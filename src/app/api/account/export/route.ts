import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({
      exported_at: new Date().toISOString(),
      account: { mode: 'guest_preview' },
      saved_studies: [],
      portfolios: [],
      cloud_bots: [],
      university_progress: [],
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      savedStudies: true,
      portfolios: true,
      cloudBots: true,
      universityProgress: true,
      eventRules: true,
    },
  });

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    account: {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      handle: user?.handle,
      role: user?.role,
      plan: user?.plan,
      uiMode: user?.uiMode,
      theme: user?.theme,
      createdAt: user?.createdAt,
    },
    saved_studies: user?.savedStudies || [],
    portfolios: user?.portfolios || [],
    cloud_bots: user?.cloudBots || [],
    university_progress: user?.universityProgress || [],
    event_rules: user?.eventRules || [],
  });
}
