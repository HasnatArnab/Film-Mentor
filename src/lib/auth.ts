import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Name only",
      credentials: {
        name: { label: "Your Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.name) return null;
        const name = credentials.name.trim();
        if (!name) return null;

        let user = await prisma.user.findFirst({
          where: { name, email: null },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { name },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
