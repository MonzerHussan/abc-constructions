import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const participants = await prisma.campaignParticipant.findMany({
      where: { campaignId: id },
      include: { participant: { include: { segment: true, linkedUser: { select: { id: true, name: true, email: true } } } } },
      orderBy: { joinedAt: "desc" },
    })
    return NextResponse.json(participants)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load participants" }, { status: 500 })
  }
}
