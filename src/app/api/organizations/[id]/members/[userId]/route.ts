import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { roleId, title, isActive } = await req.json()
  const member = await prisma.userOrganization.update({
    where: { userId_organizationId: { userId, organizationId: id } },
    data: { roleId, title, isActive },
    include: { user: { select: { id: true, name: true, email: true } }, role: true },
  })

  await prisma.auditLog.create({
    data: {
      action: isActive === false ? "DEACTIVATE" : "UPDATE",
      entity: "UserOrganization",
      entityId: member.id,
      userId: session.user.id,
      organizationId: id,
    },
  })

  return NextResponse.json(member)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId, organizationId: id } },
  })
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (member.isPrimary) return NextResponse.json({ error: "Cannot remove primary owner" }, { status: 400 })

  await prisma.userOrganization.delete({
    where: { userId_organizationId: { userId, organizationId: id } },
  })

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      entity: "UserOrganization",
      entityId: member.id,
      userId: session.user.id,
      organizationId: id,
    },
  })

  return NextResponse.json({ success: true })
}
