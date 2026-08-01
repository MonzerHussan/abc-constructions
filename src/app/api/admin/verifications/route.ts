import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const verifications = await prisma.verification.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      organization: { select: { id: true, name: true, type: true } },
      documents: true,
    },
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
  })

  return NextResponse.json(verifications)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id, status, notes } = await req.json()
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })

  const verification = await prisma.verification.update({
    where: { id },
    data: { status, notes, reviewedBy: session.user.id, reviewedAt: new Date() },
    include: { user: { select: { id: true } } },
  })

  if (status === "VERIFIED") {
    const level = verification.level
    if (level >= 1) {
      await prisma.user.update({ where: { id: verification.userId }, data: { isVerified: true } })
    }
    if (verification.organizationId && level >= 2) {
      await prisma.organization.update({ where: { id: verification.organizationId }, data: { isVerified: true, verificationLevel: level } })
    }
  }

  await prisma.auditLog.create({
    data: {
      action: status === "VERIFIED" ? "VERIFY" : status === "REJECTED" ? "REJECT" : "UPDATE",
      entity: "Verification",
      entityId: id,
      userId: session.user.id,
      details: { status, notes },
    },
  })

  return NextResponse.json(verification)
}
