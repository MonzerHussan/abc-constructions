import type { Adapter, AdapterUser } from "next-auth/adapters"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { PrismaClient } from "@/generated/prisma/client"

type DbUser = {
  id: string
  email: string
  name: string
  avatar: string | null
  emailVerified: Date | null
}

function toAdapterUser(user: DbUser): AdapterUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    image: user.avatar,
  }
}

/** Maps NextAuth `image` to Prisma User.avatar (schema has no `image` column). */
export function AbcPrismaAdapter(prisma: PrismaClient): Adapter {
  const base = PrismaAdapter(prisma) as Adapter

  return {
    ...base,
    async createUser(data) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name ?? "",
          emailVerified: data.emailVerified,
          avatar: data.image ?? undefined,
        },
      })
      return toAdapterUser(user)
    },
    async updateUser(data) {
      const user = await prisma.user.update({
        where: { id: data.id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.emailVerified !== undefined ? { emailVerified: data.emailVerified } : {}),
          ...(data.image !== undefined ? { avatar: data.image } : {}),
        },
      })
      return toAdapterUser(user)
    },
    async getUser(id) {
      const user = await prisma.user.findUnique({ where: { id } })
      return user ? toAdapterUser(user) : null
    },
    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({ where: { email } })
      return user ? toAdapterUser(user) : null
    },
    async getUserByAccount(providerAccount) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: providerAccount.provider,
            providerAccountId: providerAccount.providerAccountId,
          },
        },
        include: { user: true },
      })
      return account?.user ? toAdapterUser(account.user) : null
    },
  }
}
