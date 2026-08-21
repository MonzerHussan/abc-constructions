import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isPlatformStaffRole } from "@/lib/auth/platform-admin"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || !isPlatformStaffRole(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      country: true,
      city: true,
      companyName: true,
      companyType: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      emailVerified: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // A user is "onboarded" when they have an entity-registry Profile
  // (same check used by /api/v1/entity-registry/me).
  const profiles = await prisma.profile.findMany({
    where: { userId: { in: users.map((u) => u.id) } },
    select: { userId: true },
  })
  const onboardedIds = new Set(profiles.map((p) => p.userId).filter(Boolean))

  return NextResponse.json(
    users.map((u) => ({ ...u, onboarded: onboardedIds.has(u.id) }))
  )
}