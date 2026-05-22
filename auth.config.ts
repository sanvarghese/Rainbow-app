import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  providers: [], // empty here, credentials added in auth.ts
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profileImage = user.profileImage;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'admin' | 'merchant';
        session.user.profileImage = token.profileImage as string;
      }
      return session;
    },
  },
};