import { NextResponse } from 'next/server';
import { acceptInvitationAndRegisterUser } from '@/lib/account-admission/invitations';
import { AccountAdmissionError } from '@/lib/account-admission/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await acceptInvitationAndRegisterUser({
      token: String(body.token || body.invite || ''),
      email: String(body.email || ''),
      password: String(body.password || ''),
      name: body.name ? String(body.name) : undefined,
      handle: body.handle ? String(body.handle) : undefined,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (error) {
    if (error instanceof AccountAdmissionError) {
      return NextResponse.json(
        { ok: false, code: error.code, error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { ok: false, error: 'Failed to complete invite registration.' },
      { status: 500 }
    );
  }
}
