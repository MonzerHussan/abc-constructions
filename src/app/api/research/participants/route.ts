import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const search = searchParams.get("search")
  const segmentId = searchParams.get("segmentId")
  const status = searchParams.get("status")
  const where: Record<string, unknown> = {}
  if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }]
  if (segmentId) where.segmentId = segmentId
  if (status) where.status = status
  try {
    const [participants, total] = await Promise.all([
      prisma.researchParticipant.findMany({
        where,
        include: { segment: true, linkedUser: { select: { id: true, name: true, email: true } }, foundingMember: true, _count: { select: { responses: true, feedback: true, npsScores: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.researchParticipant.count({ where }),
    ])
    return NextResponse.json({ participants, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load participants" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const participant = await prisma.researchParticipant.create({
      data: {
        email: body.email, phone: body.phone, name: body.name, company: body.company,
        jobTitle: body.jobTitle, country: body.country, city: body.city,
        segmentId: body.segmentId, linkedUserId: (session.user as { id: string }).id,
        status: "ACTIVE", participantType: body.participantType ?? "REGISTERED",
        consentGiven: body.consentGiven ?? true, source: body.source ?? "admin", metadata: body.metadata,
      },
    })
    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create participant" }, { status: 500 })
  }
}
