import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revokeAccountInvitation } from '@/lib/account-admission/invitations';
import { AccountAdmissionError } from '@/lib/account-admission/errors';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
  }
  try {
    const { id } = await context.params;
    const updated = await revokeAccountInvitation(id, user.id);
    return NextResponse.json({ ok: true, invitation: updated });
  } catch (error) {
    if (error instanceof AccountAdmissionError) {
      return NextResponse.json({ ok: false, code: error.code, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ ok: false, error: 'Failed to revoke invitation.' }, { status: 500 });
  }
}
