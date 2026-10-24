import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { normalizeAccountEmail } from './account-admission/policy';
import { verifyPassword } from './account-admission/passwords';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 14 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const normalizedEmail = normalizeAccountEmail(credentials.email);
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { passwordCredential: true },
        });
        if (!user) return null;

        const storedHash = user.passwordCredential?.passwordHash || user.passwordHash;
        const isValid = await verifyPassword(credentials.password, storedHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.handle || user.email.split('@')[0],
          role: user.role,
          plan: user.plan,
          handle: user.handle,
          uiMode: user.uiMode,
          theme: user.theme,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.id = u.id as string;
        token.role = (u.role as string) || 'MEMBER';
        token.plan = (u.plan as string) || 'member';
        token.handle = (u.handle as string) || '';
        token.uiMode = (u.uiMode as string) || 'all';
        token.theme = (u.theme as string) || 'night';
      }
      if (trigger === 'update' && session) {
        if (session.role) token.role = session.role;
        if (session.plan) token.plan = session.plan;
        if (session.uiMode) token.uiMode = session.uiMode;
        if (session.theme) token.theme = session.theme;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        Object.assign(session.user, {
          id: token.id as string,
          role: (token.role as string) || 'MEMBER',
          plan: (token.plan as string) || 'member',
          handle: (token.handle as string) || '',
          uiMode: (token.uiMode as string) || 'all',
          theme: (token.theme as string) || 'night',
        });
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'quantgpt-dev-secret-change-in-production-9f8e7d6c5b4a3210',
};
