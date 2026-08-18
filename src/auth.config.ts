import type { NextAuthConfig } from "next-auth";

// Edge-safe auth configuration (no Prisma / no Node-only modules).
// Used by middleware (Edge runtime). The full auth (providers + adapter)
// lives in `src/lib/auth.ts` (Node runtime).
export const authConfig = {
  providers: [], // providers are added in the full auth (src/lib/auth.ts) for the Node runtime
  pages: {
    signIn: "/projects/ABC/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
        token.roleConfirmed = (user as { roleConfirmed?: boolean }).roleConfirmed ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { id: string; role?: unknown; roleConfirmed?: boolean }).role = token.role;
        (session.user as { roleConfirmed?: boolean }).roleConfirmed = Boolean(token.roleConfirmed);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
