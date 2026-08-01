import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const leadId = searchParams.get("leadId")
  const contactId = searchParams.get("contactId")
  const opportunityId = searchParams.get("opportunityId")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (leadId) where.leadId = leadId
  if (contactId) where.contactId = contactId
  if (opportunityId) where.opportunityId = opportunityId
  try {
    const [activities, total] = await Promise.all([
      prisma.crmActivity.findMany({
        where,
        include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.crmActivity.count({ where }),
    ])
    return NextResponse.json({ activities, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load activities" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    if (!body.type || !body.subject || !body.organizationId) return NextResponse.json({ error: "Type, subject, and organization are required" }, { status: 400 })
    const activity = await prisma.crmActivity.create({
      data: { type: body.type, subject: body.subject, description: body.description, outcome: body.outcome, scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null, completedAt: body.completedAt ? new Date(body.completedAt) : null, durationMinutes: body.durationMinutes, organizationId: body.organizationId, assignedToId: body.assignedToId, createdById: session.user.id, leadId: body.leadId, contactId: body.contactId, opportunityId: body.opportunityId },
      include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
  }
}
