import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidRole } from '@/lib/account-admission/policy';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== 'ADMIN') return null;
  return user as { id: string; role: string };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      handle: true,
      role: true,
      plan: true,
      totpEnabled: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
  }
  const body = await request.json();
  const userId = String(body.userId || '');
  const role = String(body.role || '');

  if (!userId || !isValidRole(role)) {
    return NextResponse.json({ error: 'Valid userId and role (ADMIN, PRO, MEMBER) required.' }, { status: 400 });
  }

  const plan = role === 'ADMIN' || role === 'PRO' ? 'pro' : 'member';
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role, plan },
  });

  await prisma.auditLog.create({
    data: {
      action: 'USER_ROLE_UPDATED',
      actorUserId: admin.id,
      targetEmail: updated.email,
      metadataJson: JSON.stringify({ newRole: role, newPlan: plan }),
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}
