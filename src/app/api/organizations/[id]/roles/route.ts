import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roles = await prisma.role.findMany({
    where: {
      OR: [
        { organizationId: id },
        { organizationId: null, isSystem: true },
      ],
    },
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(roles)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, nameAr, description, permissionKeys } = await req.json()
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

  const org = await prisma.organization.findUnique({
    where: { id },
    select: { type: true },
  })
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 })

  const role = await prisma.role.create({
    data: {
      name,
      nameAr,
      description,
      organizationType: org.type,
      organizationId: id,
      permissions: {
        create: permissionKeys?.map((key: string) => ({ permission: { connect: { key } } })) || [],
      },
    },
    include: { permissions: { include: { permission: true } } },
  })

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "Role",
      entityId: role.id,
      userId: session.user.id,
      organizationId: id,
    },
  })

  return NextResponse.json(role, { status: 201 })
}
