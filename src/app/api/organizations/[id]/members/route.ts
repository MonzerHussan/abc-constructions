import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const members = await prisma.userOrganization.findMany({
    where: { organizationId: id },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true, phone: true, role: true, isVerified: true } },
      role: true,
    },
    orderBy: { joinedAt: "asc" },
  })

  return NextResponse.json(members)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { email, roleId, title } = await req.json()
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const existing = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: id } },
  })
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 })

  const member = await prisma.userOrganization.create({
    data: { userId: user.id, organizationId: id, roleId, title },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } }, role: true },
  })

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "UserOrganization",
      entityId: member.id,
      userId: session.user.id,
      organizationId: id,
      details: { invitedUser: user.email },
    },
  })

  return NextResponse.json(member, { status: 201 })
}
