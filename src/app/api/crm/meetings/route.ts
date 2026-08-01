import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const leadId = searchParams.get("leadId")
  const contactId = searchParams.get("contactId")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (leadId) where.leadId = leadId
  if (contactId) where.contactId = contactId
  try {
    const [meetings, total] = await Promise.all([
      prisma.crmMeeting.findMany({
        where,
        include: { organizer: { select: { id: true, name: true, email: true } } },
        orderBy: { startTime: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.crmMeeting.count({ where }),
    ])
    return NextResponse.json({ meetings, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load meetings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    if (!body.title || !body.startTime || !body.organizationId) return NextResponse.json({ error: "Title, start time, and organization are required" }, { status: 400 })
    const meeting = await prisma.crmMeeting.create({
      data: { title: body.title, description: body.description, startTime: new Date(body.startTime), endTime: body.endTime ? new Date(body.endTime) : null, location: body.location, meetingLink: body.meetingLink, status: body.status ?? "SCHEDULED", outcome: body.outcome, organizationId: body.organizationId, organizerId: body.organizerId ?? session.user.id, leadId: body.leadId, contactId: body.contactId, opportunityId: body.opportunityId },
      include: { organizer: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(meeting, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 })
  }
}
