import { redirect } from 'next/navigation';

export default async function AcceptInviteRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; invite?: string }>;
}) {
  const sp = await searchParams;
  const tok = sp.token || sp.invite || '';
  redirect(tok ? `/join?invite=${encodeURIComponent(tok)}` : '/join');
}
