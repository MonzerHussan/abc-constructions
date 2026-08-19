import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { verifySync } from "otplib"
import { authConfig } from "@/auth.config"
import { rateLimit } from "@/lib/rate-limit"
import { GOOGLE_ONBOARDING_CALLBACK } from "@/lib/auth/role-selection"

const LOGIN_LIMIT = 15
const LOGIN_WINDOW_MS = 15 * 60 * 1000

async function loadUserAuthFlags(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, roleConfirmed: true, emailVerified: true, phone: true },
  })
  return user
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
          allowDangerousEmailAccountLinking: false,
        })]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "TOTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string

        const rl = rateLimit({ key: `login:${email}`, limit: LOGIN_LIMIT, windowMs: LOGIN_WINDOW_MS })
        if (!rl.ok) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) return null

        if (!user.isActive) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        if (user.mfaEnabled) {
          const totp = credentials.totp as string
          if (!totp) return null
          try {
            const verified = verifySync({ token: totp, secret: user.mfaSecret! })
            if (!verified) return null
          } catch {
            return null
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          roleConfirmed: user.roleConfirmed,
        }
      },
    }),
  ],
  pages: {
    signIn: "/projects/ABC/auth/login",
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roleConfirmed: false },
        });
      }
    },
  },
  callbacks: {
    async signIn({ account }) {
      // Google OAuth allowed; roleConfirmed=false keeps user in onboarding until set-role
      if (account?.provider === "google") return true
      return true
    },
    async jwt({ token, user, trigger, account }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.id = user.id
        token.roleConfirmed = (user as { roleConfirmed?: boolean }).roleConfirmed ?? false
      }

      // Fresh Google sign-in: ensure JWT reflects unconfirmed role until onboarding step 1
      if (account?.provider === "google" && user?.id) {
        const dbUser = await loadUserAuthFlags(user.id)
        if (dbUser) {
          token.role = dbUser.role
          token.roleConfirmed = dbUser.roleConfirmed
          token.emailVerified = dbUser.emailVerified ? true : false
        }
      }

      if (trigger === "update" && token.id) {
        const dbUser = await loadUserAuthFlags(token.id as string)
        if (dbUser) {
          token.role = dbUser.role
          token.roleConfirmed = dbUser.roleConfirmed
          token.emailVerified = dbUser.emailVerified ? true : false
        }
      }

      if (token.id && token.roleConfirmed === undefined) {
        const dbUser = await loadUserAuthFlags(token.id as string)
        if (dbUser) {
          token.role = dbUser.role
          token.roleConfirmed = dbUser.roleConfirmed
          token.emailVerified = dbUser.emailVerified ? true : false
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as unknown as { id: string; role?: unknown; roleConfirmed?: boolean; isEmailVerified?: boolean }).role = token.role
        ;(session.user as unknown as { roleConfirmed?: boolean }).roleConfirmed = Boolean(token.roleConfirmed)
        ;(session.user as unknown as { isEmailVerified?: boolean }).isEmailVerified = Boolean(token.emailVerified)
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // After Google OAuth, always land on onboarding unless caller supplied an allowed path
      if (url.includes("source=google") || url.includes("/onboarding")) {
        if (url.startsWith("/")) return `${baseUrl}${url}`
        return url
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`
      try {
        if (new URL(url).origin === baseUrl) return url
      } catch {
        /* ignore malformed callback URLs */
      }
      return `${baseUrl}${GOOGLE_ONBOARDING_CALLBACK}`
    },
  },
})
