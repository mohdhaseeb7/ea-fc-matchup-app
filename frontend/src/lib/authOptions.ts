import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ea-fc-matchup-backend.onrender.com';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
    }),
    CredentialsProvider({
      name: 'Email Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'gamer@fc26.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (res.ok) {
            const user = await res.json();
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              image: user.avatarUrl,
            };
          }
        } catch (e) {
          console.error('Auth login error:', e);
        }

        // Fallback demo user for instant login
        return {
          id: '1',
          name: credentials.email.split('@')[0] || 'FC Player',
          email: credentials.email,
          image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(credentials.email)}`,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'ea_fc26_fc27_secret_key_9d235f4a26b249a09b0359756615894c',
};
