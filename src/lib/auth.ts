import { PrismaAdapter } from '@auth/prisma-adapter';
import type { AuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) return null;
        if (user.isBanned) throw new Error('This account has been suspended.');

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
  async signIn({ user }) {
    if (!user.id) {
      return false;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        isBanned: true,
      },
    });

    if (!dbUser) {
      return false;
    }

    if (dbUser.isBanned) {
      return false;
    }

    return true;
  },

  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
    }

    if (token.email && !token.id) {
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
        select: { id: true },
      });

      if (dbUser) {
        token.id = dbUser.id;
      }
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user && token.id) {
      (session.user as { id: string }).id = token.id as string;
    }

    return session;
  },
},
};
