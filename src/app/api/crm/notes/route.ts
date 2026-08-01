import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const leadId = searchParams.get("leadId")
  const contactId = searchParams.get("contactId")
  const opportunityId = searchParams.get("opportunityId")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (leadId) where.leadId = leadId
  if (contactId) where.contactId = contactId
  if (opportunityId) where.opportunityId = opportunityId
  try {
    const [notes, total] = await Promise.all([
      prisma.crmNote.findMany({
        where,
        include: { createdBy: { select: { id: true, name: true, email: true } } },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.crmNote.count({ where }),
    ])
    return NextResponse.json({ notes, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    if (!body.content || !body.organizationId) return NextResponse.json({ error: "Content and organization are required" }, { status: 400 })
    const note = await prisma.crmNote.create({
      data: { content: body.content, pinned: body.pinned ?? false, organizationId: body.organizationId, createdById: session.user.id, leadId: body.leadId, contactId: body.contactId, opportunityId: body.opportunityId },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
