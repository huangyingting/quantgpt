import { Prisma, type AccountInvitation } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AccountAdmissionError } from './errors';
import { isValidAccountEmail, isValidRole, normalizeAccountEmail } from './policy';
import { hashPassword } from './passwords';
import { createOpaqueToken, hashOpaqueToken } from './tokens';

const DEFAULT_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type CreateAccountInvitationInput = {
  email: string;
  role?: 'ADMIN' | 'PRO' | 'MEMBER';
  invitedById?: string;
  expiresInDays?: number;
  expiresAt?: Date;
};

export type AccountInvitationGrant = {
  invitation: AccountInvitation;
  token: string;
  invitePath: string;
};

export type PublicInvitationView = {
  id: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired' | 'invalid';
  maskedEmail: string | null;
  email?: string;
  role?: string;
  expiresAt: Date | null;
};

export function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'*'.repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}

function computeExpiry(now: Date, expiresAt?: Date, expiresInDays?: number): Date {
  if (expiresAt) {
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= now || expiresAt.getTime() > now.getTime() + 90 * 86400000) {
      throw new AccountAdmissionError(400, 'invalid_expiry', 'Invitation expiry must be between now and 90 days.');
    }
    return expiresAt;
  }
  const days = expiresInDays ?? 7;
  if (days < 1 || days > 90) {
    throw new AccountAdmissionError(400, 'invalid_expiry', 'Invitation expiry days must be between 1 and 90.');
  }
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function expirePendingInvitations(now = new Date()): Promise<number> {
  const res = await prisma.accountInvitation.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lte: now },
    },
    data: {
      status: 'EXPIRED',
      activeForEmail: null,
    },
  });
  return res.count;
}

export async function createAccountInvitation(
  input: CreateAccountInvitationInput
): Promise<AccountInvitationGrant> {
  if (!isValidAccountEmail(input.email)) {
    throw new AccountAdmissionError(400, 'invalid_email', 'Enter a valid email address.');
  }
  const normalizedEmail = normalizeAccountEmail(input.email);
  const role = input.role && isValidRole(input.role) ? input.role : 'MEMBER';
  const now = new Date();
  const expiresAt = computeExpiry(now, input.expiresAt, input.expiresInDays ?? (DEFAULT_INVITATION_TTL_MS / 86400000));
  const token = createOpaqueToken();
  const tokenHash = hashOpaqueToken(token);

  await expirePendingInvitations(now);

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existingUser) {
    throw new AccountAdmissionError(409, 'already_member', 'A QuantGPT account already exists for this email.');
  }

  // Revoke any existing pending invitations for this email before issuing a fresh single-use code
  await prisma.accountInvitation.updateMany({
    where: {
      normalizedEmail,
      status: 'PENDING',
    },
    data: {
      status: 'REVOKED',
      revokedAt: now,
      activeForEmail: null,
    },
  });

  const invitation = await prisma.accountInvitation.create({
    data: {
      email: input.email.trim(),
      normalizedEmail,
      activeForEmail: normalizedEmail,
      role,
      tokenHash,
      status: 'PENDING',
      invitedById: input.invitedById || null,
      expiresAt,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'INVITATION_CREATED',
      actorUserId: input.invitedById || null,
      targetEmail: normalizedEmail,
      invitationId: invitation.id,
      metadataJson: JSON.stringify({ role, expiresAt: expiresAt.toISOString() }),
    },
  });

  return {
    invitation,
    token,
    invitePath: `/join?invite=${encodeURIComponent(token)}`,
  };
}

export async function inspectAccountInvitation(
  token: string,
  now = new Date()
): Promise<PublicInvitationView> {
  if (!token || !token.trim()) {
    return { id: '', status: 'invalid', maskedEmail: null, expiresAt: null };
  }
  const tokenHash = hashOpaqueToken(token);
  const invitation = await prisma.accountInvitation.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
    },
  });

  if (!invitation) {
    return { id: '', status: 'invalid', maskedEmail: null, expiresAt: null };
  }

  if (invitation.status === 'PENDING' && invitation.expiresAt <= now) {
    await prisma.accountInvitation.updateMany({
      where: { id: invitation.id, status: 'PENDING' },
      data: { status: 'EXPIRED', activeForEmail: null },
    });
    return {
      id: invitation.id,
      status: 'expired',
      maskedEmail: maskEmail(invitation.email),
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    };
  }

  return {
    id: invitation.id,
    status: invitation.status.toLowerCase() as PublicInvitationView['status'],
    maskedEmail: maskEmail(invitation.email),
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
  };
}

export async function revokeAccountInvitation(
  id: string,
  actorUserId?: string
): Promise<AccountInvitation> {
  const now = new Date();
  const invitation = await prisma.accountInvitation.findUnique({ where: { id } });
  if (!invitation) {
    throw new AccountAdmissionError(404, 'not_found', 'Invitation not found.');
  }
  if (invitation.status === 'REVOKED') {
    return invitation;
  }
  if (invitation.status !== 'PENDING') {
    throw new AccountAdmissionError(409, 'invalid_transition', 'Only a pending invitation can be revoked.');
  }

  const updated = await prisma.accountInvitation.update({
    where: { id },
    data: {
      status: 'REVOKED',
      revokedAt: now,
      activeForEmail: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'INVITATION_REVOKED',
      actorUserId: actorUserId || null,
      targetEmail: invitation.normalizedEmail,
      invitationId: invitation.id,
      metadataJson: JSON.stringify({ previousStatus: invitation.status }),
    },
  });

  return updated;
}

export async function acceptInvitationAndRegisterUser(input: {
  token: string;
  email: string;
  password: string;
  name?: string;
  handle?: string;
}) {
  if (!input.token || !input.token.trim()) {
    throw new AccountAdmissionError(403, 'invite_required', 'QuantGPT registration is invite-only. Provide a valid invitation code.');
  }
  if (!isValidAccountEmail(input.email)) {
    throw new AccountAdmissionError(400, 'invalid_email', 'Enter a valid email address.');
  }

  const normalizedEmail = normalizeAccountEmail(input.email);
  const passwordHash = await hashPassword(input.password);
  const tokenHash = hashOpaqueToken(input.token);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const invitation = await tx.accountInvitation.findUnique({
      where: { tokenHash },
    });

    if (!invitation) {
      throw new AccountAdmissionError(403, 'invalid_invite', 'Invitation code is invalid or was not found.');
    }

    if (invitation.status === 'REVOKED') {
      throw new AccountAdmissionError(403, 'invite_revoked', 'This invitation has been revoked by an administrator.');
    }

    if (invitation.status === 'ACCEPTED') {
      throw new AccountAdmissionError(403, 'invite_used', 'This single-use invitation has already been redeemed.');
    }

    if (invitation.status === 'EXPIRED' || invitation.expiresAt <= now) {
      await tx.accountInvitation.updateMany({
        where: { id: invitation.id, status: 'PENDING' },
        data: { status: 'EXPIRED', activeForEmail: null },
      });
      throw new AccountAdmissionError(403, 'invite_expired', 'This invitation has expired.');
    }

    if (invitation.normalizedEmail !== normalizedEmail) {
      throw new AccountAdmissionError(
        403,
        'email_mismatch',
        `This invitation is bound to ${maskEmail(invitation.email)} and cannot be used for ${normalizedEmail}.`
      );
    }

    const existingUser = await tx.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existingUser) {
      throw new AccountAdmissionError(409, 'already_member', 'An account already exists for this email.');
    }

    const rawHandle = (input.handle || normalizedEmail.split('@')[0] || 'operator')
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .slice(0, 20);
    const uniqueSuffix = Math.floor(100 + Math.random() * 900);
    const handle = `${rawHandle}_${uniqueSuffix}`;

    const plan = invitation.role === 'PRO' || invitation.role === 'ADMIN' ? 'pro' : 'member';

    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        emailVerified: now,
        name: input.name?.trim() || rawHandle,
        handle,
        passwordHash,
        role: invitation.role,
        plan,
        passwordCredential: {
          create: {
            passwordHash,
          },
        },
      },
    });

    const claimed = await tx.accountInvitation.updateMany({
      where: {
        id: invitation.id,
        status: 'PENDING',
      },
      data: {
        status: 'ACCEPTED',
        acceptedAt: now,
        acceptedById: user.id,
        activeForEmail: null,
      },
    });

    if (claimed.count !== 1) {
      throw new AccountAdmissionError(409, 'invite_race', 'Invitation could not be claimed.');
    }

    await tx.auditLog.create({
      data: {
        action: 'INVITATION_ACCEPTED',
        actorUserId: user.id,
        targetEmail: normalizedEmail,
        invitationId: invitation.id,
        metadataJson: JSON.stringify({ role: user.role, plan: user.plan }),
      },
    });

    return user;
  });
}

export async function listAccountInvitations() {
  await expirePendingInvitations();
  return prisma.accountInvitation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      invitedBy: { select: { id: true, name: true, email: true } },
      acceptedBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

// Convenience aliases for tests and internal callers
export const createInvitation = createAccountInvitation;
export const inspectInvitationToken = inspectAccountInvitation;
export const revokeInvitation = revokeAccountInvitation;
export const acceptInvitationAndRegister = acceptInvitationAndRegisterUser;
