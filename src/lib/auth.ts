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

loadEnvConfig(process.cwd())

const LOGIN_LIMIT = 15
const LOGIN_WINDOW_MS = 15 * 60 * 1000

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: AbcPrismaAdapter(prisma),
  providers: [
    ...(isGoogleOAuthConfigured()
      ? [Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { id: string; role?: unknown }).role = token.role
      }
      return session
    },
  },
})
