// app/api/auth/[...nextauth]/route.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      backendToken: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    backendToken: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        try {
          const baseURL =
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3010/api";
          const res = await fetch(`${baseURL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Invalid credentials.");
          }

          const user = await res.json();

          // You must return a user object with at least an `id` field
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: user.token,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error("Authentication failed.");
        }
      },
    }),
  ],

  // 👇 JWT is used for session handling
  session: {
    strategy: "jwt",
  },

  // 👇 Add custom fields to JWT
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.backendToken = user.token;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose custom token fields in session
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.backendToken = token.backendToken;
      return session;
    },
  },

  pages: {
    signIn: "/login", // custom login page
  },

  secret: process.env.NEXTAUTH_SECRET || "1234579",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
