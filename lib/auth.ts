import { getServerSession, type NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
  }

  interface Session {
    user?: {
      id?: string | null;
      email?: string | null;
      name?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      if (user?.email) token.email = user.email;
      if (user?.name) token.name = user.name;
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      if (token?.id) session.user.id = token.id;
      if (token?.email) session.user.email = token.email;
      if (token?.name) session.user.name = token.name;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    session,
  };
}
