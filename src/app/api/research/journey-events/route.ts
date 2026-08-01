import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const participantId = searchParams.get("participantId")
  const eventType = searchParams.get("eventType")
  const limit = parseInt(searchParams.get("limit") ?? "50")
  const where: Record<string, unknown> = {}
  if (participantId) where.participantId = participantId
  if (eventType) where.eventType = eventType
  try {
    const events = await prisma.customerJourneyEvent.findMany({
      where, include: { participant: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" }, take: limit,
    })
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load journey events" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const event = await prisma.customerJourneyEvent.create({
      data: { participantId: body.participantId, linkedUserId: body.linkedUserId, eventType: body.eventType, eventData: body.eventData, source: body.source },
    })
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create journey event" }, { status: 500 })
  }
}
