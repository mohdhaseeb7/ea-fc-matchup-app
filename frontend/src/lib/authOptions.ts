import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ea-fc-matchup-backend.onrender.com';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const isGoogleConfigured = googleClientId && googleClientSecret && !googleClientId.includes('dummy');

const providers: any[] = [
  CredentialsProvider({
    name: 'Email Credentials',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'gamer@fc26.com' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;

      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password || 'demo-password',
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

      // Instant demo authentication fallback
      return {
        id: '1',
        name: credentials.email.split('@')[0] || 'FC Player',
        email: credentials.email,
        image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(credentials.email)}`,
      };
    },
  }),
];

if (isGoogleConfigured) {
  providers.unshift(
    GoogleProvider({
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'ea_fc26_fc27_secret_key_9d235f4a26b249a09b0359756615894c',
};
