import { PrismaAdapter } from '@auth/prisma-adapter';
import { type Adapter } from 'next-auth/adapters';
import GoogleProvider from 'next-auth/providers/google';
import { type NextAuthOptions, getServerSession } from 'next-auth';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;
      const allowlist = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      const adminUser = await prisma.adminUser.findUnique({ where: { email: user.email } });
      const isAdminEmail = allowlist.includes(user.email);
      if (!adminUser && !isAdminEmail) {
        return false;
      }
      if (user.email && isAdminEmail) {
        await prisma.adminUser.upsert({
          where: { email: user.email },
          update: {},
          create: { email: user.email }
        });
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.email = user.email;
      }
      return session;
    }
  },
  session: { strategy: 'database' },
  pages: {
    signIn: '/admin/login'
  }
};

export const getAuthSession = () => getServerSession(authOptions);
