import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const orgs = await prisma.organization.findMany({
    where: { users: { some: { userId: session.user.id } } },
    include: {
      users: {
        where: { userId: session.user.id },
        include: { role: true },
      },
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orgs)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, nameAr, type } = await req.json()
  if (!name || !type) return NextResponse.json({ error: "name and type required" }, { status: 400 })

  const org = await prisma.organization.create({
    data: { name, nameAr, type },
  })

  await prisma.userOrganization.create({
    data: {
      userId: session.user.id,
      organizationId: org.id,
      title: "Owner",
      isPrimary: true,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "Organization",
      entityId: org.id,
      userId: session.user.id,
      organizationId: org.id,
    },
  })

  return NextResponse.json(org, { status: 201 })
}
