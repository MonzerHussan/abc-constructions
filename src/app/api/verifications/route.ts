import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const verifications = await prisma.verification.findMany({
    where: { userId: session.user.id },
    include: {
      documents: true,
      organization: { select: { id: true, name: true } },
    },
    orderBy: { submittedAt: "desc" },
  })

  return NextResponse.json(verifications)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { organizationId, type, level } = await req.json()

  const verification = await prisma.verification.create({
    data: {
      userId: session.user.id,
      organizationId: organizationId || null,
      type: type || null,
      level: level ?? 0,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "Verification",
      entityId: verification.id,
      userId: session.user.id,
      organizationId: organizationId,
      details: { level, type },
    },
  })

  return NextResponse.json(verification, { status: 201 })
}
