import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from './src/lib/mongodb';
import User from './src/models/User';
import { authConfig } from './auth.config';
// import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profileImage: user.profileImage,
        };
      },
    }),
  ],
});