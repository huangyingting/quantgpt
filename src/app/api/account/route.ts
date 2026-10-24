import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createOpaqueToken, hashOpaqueToken } from '@/lib/account-admission/tokens';
import { hashPassword, verifyPassword } from '@/lib/account-admission/passwords';

export async function GET() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string; email?: string } | undefined;

  if (!sessionUser?.id) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      mcpKeys: [],
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      mcpKeys: {
        where: { revokedAt: null },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, mcpKeys: [] });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      avatar: user.avatar,
      role: user.role,
      plan: user.plan,
      uiMode: user.uiMode,
      theme: user.theme,
      totpEnabled: user.totpEnabled,
      badges: JSON.parse(user.badgesJson || '["founding"]'),
      tape: JSON.parse(user.tapeJson || '["SPY","QQQ","NVDA","AAPL","MSFT","MU"]'),
      defaults: JSON.parse(user.defaultsJson || '{"bench":"$SPXTR","startYear":1998,"splitYear":2015,"costBps":10}'),
    },
    mcpKeys: user.mcpKeys,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string; email?: string } | undefined;
  const body = await request.json();

  if (!sessionUser?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (body.action === 'create_mcp_key') {
    const raw = `qg_sk_${createOpaqueToken().slice(0, 28)}`;
    const keyHash = hashOpaqueToken(raw);
    const keyPrefix = `${raw.slice(0, 12)}...${raw.slice(-4)}`;
    const label = String(body.label || 'Claude / Cursor MCP Key').slice(0, 48);

    const created = await prisma.mcpApiKey.create({
      data: {
        userId: sessionUser.id,
        label,
        keyPrefix,
        keyHash,
        categoriesJson: JSON.stringify(['core', 'backtest', 'grader', 'events']),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'MCP_KEY_ISSUED',
        actorUserId: sessionUser.id,
        targetEmail: sessionUser.email,
        metadataJson: JSON.stringify({ keyId: created.id, label, keyPrefix }),
      },
    });

    return NextResponse.json({ ok: true, key: created, rawKey: raw });
  }

  if (body.action === 'revoke_mcp_key' && body.keyId) {
    await prisma.mcpApiKey.updateMany({
      where: { id: String(body.keyId), userId: sessionUser.id },
      data: { revokedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        action: 'MCP_KEY_REVOKED',
        actorUserId: sessionUser.id,
        targetEmail: sessionUser.email,
        metadataJson: JSON.stringify({ keyId: body.keyId }),
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'change_password') {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { passwordCredential: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const valid = await verifyPassword(
      String(body.currentPassword || ''),
      user.passwordCredential?.passwordHash || user.passwordHash
    );
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }
    const newHash = await hashPassword(String(body.newPassword || ''));
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        passwordCredential: {
          upsert: {
            create: { passwordHash: newHash },
            update: { passwordHash: newHash, passwordChangedAt: new Date() },
          },
        },
      },
    });
    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_CHANGED',
        actorUserId: user.id,
        targetEmail: user.email,
      },
    });
    return NextResponse.json({ ok: true });
  }

  const updated = await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      name: body.name !== undefined ? String(body.name) : undefined,
      handle: body.handle !== undefined ? String(body.handle) : undefined,
      avatar: body.avatar !== undefined ? String(body.avatar) : undefined,
      uiMode: body.uiMode !== undefined ? String(body.uiMode) : undefined,
      theme: body.theme !== undefined ? String(body.theme) : undefined,
      totpEnabled: body.totpEnabled !== undefined ? Boolean(body.totpEnabled) : undefined,
      tapeJson: body.tape ? JSON.stringify(body.tape) : undefined,
      defaultsJson: body.defaults ? JSON.stringify(body.defaults) : undefined,
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}
