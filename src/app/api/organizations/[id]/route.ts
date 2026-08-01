import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const org = await prisma.organization.findFirst({
    where: {
      id,
      users: { some: { userId: session.user.id } },
    },
    include: {
      _count: { select: { users: true } },
    },
  })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(org)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await prisma.userOrganization.findFirst({
    where: { userId: session.user.id, organizationId: id, isActive: true },
  })
  if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const data = await req.json()
  const org = await prisma.organization.update({ where: { id }, data })

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "Organization",
      entityId: id,
      userId: session.user.id,
      organizationId: id,
    },
  })

  return NextResponse.json(org)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await prisma.userOrganization.findFirst({
    where: { userId: session.user.id, organizationId: id, isPrimary: true },
  })
  if (!membership) return NextResponse.json({ error: "Only primary owner can delete" }, { status: 403 })

  await prisma.organization.update({ where: { id }, data: { isActive: false } })

  await prisma.auditLog.create({
    data: {
      action: "DEACTIVATE",
      entity: "Organization",
      entityId: id,
      userId: session.user.id,
      organizationId: id,
    },
  })

  return NextResponse.json({ success: true })
}
