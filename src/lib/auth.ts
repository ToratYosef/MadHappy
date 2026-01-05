import { type NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL || '';
        const adminPassword = process.env.ADMIN_PASSWORD || '';

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          return {
            id: '1',
            email: credentials.email,
            name: 'Admin User',
            role: 'ADMIN'
          };
        }

        return null;
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
