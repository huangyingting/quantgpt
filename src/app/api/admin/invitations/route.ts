import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAccountInvitation, listAccountInvitations } from '@/lib/account-admission/invitations';
import { AccountAdmissionError } from '@/lib/account-admission/errors';

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== 'ADMIN') {
    return null;
  }
  return user as { id: string; role: string };
}

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
  }
  const invitations = await listAccountInvitations();
  return NextResponse.json({ invitations });
}

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const grant = await createAccountInvitation({
      email: String(body.email || ''),
      role: body.role || 'MEMBER',
      expiresInDays: body.expiresInDays ? Number(body.expiresInDays) : 7,
      invitedById: admin.id,
    });
    return NextResponse.json({
      ok: true,
      invitation: grant.invitation,
      token: grant.token,
      invitePath: grant.invitePath,
    });
  } catch (error) {
    if (error instanceof AccountAdmissionError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ ok: false, error: 'Failed to create invitation.' }, { status: 500 });
  }
}
