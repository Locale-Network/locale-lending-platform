import { NextAuthOptions, PagesOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage, generateNonce } from 'siwe';
import prisma from '@prisma/index';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Role } from '@prisma/client';

const NEXTAUTH_URL = process.env.NEXTAUTH_URL as string;
// if (!NEXTAUTH_URL) {
//   throw new Error('NEXTAUTH_URL is not set');
// }

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET as string;
// if (!NEXTAUTH_SECRET) {
//   throw new Error('NEXTAUTH_SECRET is not set');
// }

export const ROLE_REDIRECTS: Record<Role, string> = {
  BORROWER: '/borrower',
  APPROVER: '/approver',
  ADMIN: '/admin',
} as const;

export const authPages: Partial<PagesOptions> = {
  signIn: '/signin',
  signOut: '/signin',
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials, req) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'));
          const nextAuthUrl = new URL(NEXTAUTH_URL);

          const result = await siwe.verify({
            signature: credentials?.signature || '',
            domain: nextAuthUrl.host,
            nonce: generateNonce(),
          });

          if (!result.success) {
            return null;
          }

          const chainAccount = await prisma.chainAccount.findUnique({
            where: {
              address: siwe.address,
            },
          });

          const role = chainAccount?.role || 'BORROWER';

          return {
            id: siwe.address,
            role,
          };
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: authPages,
  secret: NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.address = token.sub;
      session.user.name = token.sub;
      session.user.role = token.role;

      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
