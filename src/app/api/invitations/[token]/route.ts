import { NextResponse } from 'next/server';
import { inspectAccountInvitation } from '@/lib/account-admission/invitations';

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const view = await inspectAccountInvitation(decodeURIComponent(token));
  return NextResponse.json(view);
}
