import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { loadEnvConfig } from "@next/env"
import { prisma } from "@/lib/prisma"
import { AbcPrismaAdapter } from "@/lib/auth-prisma-adapter"
import bcrypt from "bcryptjs"
import { verifySync } from "otplib"
import { authConfig } from "@/auth.config"
import { rateLimit } from "@/lib/rate-limit"
import { isGoogleOAuthConfigured } from "@/lib/google-oauth"
import { GOOGLE_ONBOARDING_CALLBACK } from "@/lib/auth/role-selection"

loadEnvConfig(process.cwd())

const LOGIN_LIMIT = 15
const LOGIN_WINDOW_MS = 15 * 60 * 1000

async function loadUserAuthFlags(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, roleConfirmed: true },
  })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: AbcPrismaAdapter(prisma),
  providers: [
    ...(isGoogleOAuthConfigured()
      ? [Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          issuer: "https://accounts.google.com",
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
        }
      },
    }),
  ],
  events: {
    async linkAccount({ user, account }) {
      if (account.provider === "google" && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roleConfirmed: false },
        })
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.roleConfirmed = (user as { roleConfirmed?: boolean }).roleConfirmed ?? false
      }

      if ((trigger === "update" || token.roleConfirmed === undefined) && token.id) {
        const dbUser = await loadUserAuthFlags(token.id as string)
        if (dbUser) {
          token.role = dbUser.role
          token.roleConfirmed = dbUser.roleConfirmed
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { id: string; role?: unknown; roleConfirmed?: boolean }).role = token.role
        ;(session.user as { roleConfirmed?: boolean }).roleConfirmed = Boolean(token.roleConfirmed)
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      try {
        if (new URL(url).origin === baseUrl) return url
      } catch {
        return `${baseUrl}${GOOGLE_ONBOARDING_CALLBACK}`
      }
      return `${baseUrl}${GOOGLE_ONBOARDING_CALLBACK}`
    },
  },
})
