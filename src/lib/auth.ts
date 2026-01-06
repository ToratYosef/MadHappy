import { type NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { prisma } from './db';
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const envAdminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
        const envAdminPassword = process.env.ADMIN_PASSWORD ?? 'password123';

        if (credentials.email === envAdminEmail && credentials.password === envAdminPassword) {
          return {
            id: 'env-admin',
            email: envAdminEmail,
            name: envAdminEmail,
            role: 'ADMIN'
          };
        }

        const adminRecord = await prisma.adminUser.findUnique({
          where: { email: credentials.email }
        });

        if (!adminRecord) return null;

        return {
          id: adminRecord.id,
          email: adminRecord.email,
          name: adminRecord.email,
          role: adminRecord.role
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role || 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login'
  }
};

export const getAuthSession = () => getServerSession(authOptions);
