import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; roleId: string }> }) {
  const { id, roleId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, nameAr, description, permissionKeys } = await req.json()

  const role = await prisma.role.findFirst({
    where: { id: roleId, organizationId: id },
  })
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (role.isSystem) return NextResponse.json({ error: "Cannot edit system role" }, { status: 400 })

  await prisma.rolePermission.deleteMany({ where: { roleId } })

  const updated = await prisma.role.update({
    where: { id: roleId },
    data: {
      name,
      nameAr,
      description,
      permissions: {
        create: permissionKeys?.map((key: string) => ({ permission: { connect: { key } } })) || [],
      },
    },
    include: { permissions: { include: { permission: true } } },
  })

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "Role",
      entityId: roleId,
      userId: session.user.id,
      organizationId: id,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; roleId: string }> }) {
  const { id, roleId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = await prisma.role.findFirst({
    where: { id: roleId, organizationId: id },
  })
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (role.isSystem) return NextResponse.json({ error: "Cannot delete system role" }, { status: 400 })

  await prisma.userOrganization.updateMany({
    where: { roleId },
    data: { roleId: null },
  })
  await prisma.rolePermission.deleteMany({ where: { roleId } })
  await prisma.role.delete({ where: { id: roleId } })

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      entity: "Role",
      entityId: roleId,
      userId: session.user.id,
      organizationId: id,
    },
  })

  return NextResponse.json({ success: true })
}
