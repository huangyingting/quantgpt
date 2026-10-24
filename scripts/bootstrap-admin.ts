import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { isValidAccountEmail, normalizeAccountEmail } from '../src/lib/account-admission/policy';
import { hashPassword } from '../src/lib/account-admission/passwords';

function parseArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function main() {
  const rawEmail = parseArg('--email') || process.env.BOOTSTRAP_ADMIN_EMAIL || '';
  const password = parseArg('--password') || process.env.BOOTSTRAP_ADMIN_PASSWORD || '';
  const name = (parseArg('--name') || process.env.BOOTSTRAP_ADMIN_NAME || 'QuantGPT Admin').trim();

  if (!isValidAccountEmail(rawEmail)) {
    throw new Error('Provide a valid admin email with --email or BOOTSTRAP_ADMIN_EMAIL.');
  }
  if (!password) {
    throw new Error('Provide an admin password with --password or BOOTSTRAP_ADMIN_PASSWORD.');
  }

  const email = normalizeAccountEmail(rawEmail);
  const passwordHash = await hashPassword(password);
  const now = new Date();
  const handle = `${email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').slice(0, 18)}_admin`;

  const user = await prisma.$transaction(async (tx) => {
    const upserted = await tx.user.upsert({
      where: { email },
      create: {
        email,
        name,
        handle,
        emailVerified: now,
        role: 'ADMIN',
        plan: 'pro',
        passwordHash,
      },
      update: {
        name,
        emailVerified: now,
        role: 'ADMIN',
        plan: 'pro',
        passwordHash,
      },
    });

    await tx.passwordCredential.upsert({
      where: { userId: upserted.id },
      create: {
        userId: upserted.id,
        passwordHash,
        passwordChangedAt: now,
      },
      update: {
        passwordHash,
        passwordChangedAt: now,
        resetTokenHash: null,
        resetExpiresAt: null,
      },
    });

    await tx.auditLog.create({
      data: {
        action: 'ADMIN_BOOTSTRAPPED',
        actorUserId: upserted.id,
        targetEmail: email,
        metadataJson: JSON.stringify({ role: 'ADMIN', plan: 'pro', via: 'cli' }),
      },
    });

    return upserted;
  });

  console.log(`Bootstrapped QuantGPT ADMIN account for ${user.email} (${user.id}).`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
