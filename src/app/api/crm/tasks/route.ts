import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const leadId = searchParams.get("leadId")
  const contactId = searchParams.get("contactId")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (priority) where.priority = priority
  if (leadId) where.leadId = leadId
  if (contactId) where.contactId = contactId
  try {
    const [tasks, total] = await Promise.all([
      prisma.crmTask.findMany({
        where,
        include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.crmTask.count({ where }),
    ])
    return NextResponse.json({ tasks, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    if (!body.subject || !body.organizationId) return NextResponse.json({ error: "Subject and organization are required" }, { status: 400 })
    const task = await prisma.crmTask.create({
      data: { subject: body.subject, description: body.description, status: body.status, priority: body.priority, dueDate: body.dueDate ? new Date(body.dueDate) : null, completedAt: body.completedAt ? new Date(body.completedAt) : null, organizationId: body.organizationId, assignedToId: body.assignedToId, createdById: session.user.id, leadId: body.leadId, contactId: body.contactId, opportunityId: body.opportunityId },
      include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
