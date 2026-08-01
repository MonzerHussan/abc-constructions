import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const participant = await prisma.researchParticipant.findUnique({
      where: { id: id },
      include: {
        segment: true, linkedUser: true, foundingMember: true,
        responses: { include: { survey: { select: { id: true, title: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
        journeyEvents: { orderBy: { createdAt: "desc" }, take: 20 },
        _count: { select: { responses: true, feedback: true, bugReports: true, npsScores: true, csatScores: true, cesScores: true, featureRequests: true } },
      },
    })
    if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(participant)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load participant" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const participant = await prisma.researchParticipant.update({
      where: { id: id },
      data: { name: body.name, email: body.email, phone: body.phone, company: body.company, jobTitle: body.jobTitle, country: body.country, city: body.city, segmentId: body.segmentId, status: body.status, participantType: body.participantType, tags: body.tags, metadata: body.metadata },
    })
    return NextResponse.json(participant)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update participant" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    await prisma.researchParticipant.delete({ where: { id: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete participant" }, { status: 500 })
  }
}
