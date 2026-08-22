import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { crmBridgeService } from "@/modules/crm"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const source = searchParams.get("source")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (source) where.source = source
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
    ]
  }
  try {
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ])
    return NextResponse.json({ leads, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load leads" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    if (!body.firstName || !body.lastName) return NextResponse.json({ error: "First and last name are required" }, { status: 400 })
    // Resolve the organization from the creator's memberships (never the
    // client-supplied "default" placeholder). Falls back to the ABC platform org.
    const organizationId =
      body.organizationId && body.organizationId !== "default"
        ? body.organizationId
        : await crmBridgeService.resolveOrganizationId(session.user.id)
    const lead = await prisma.lead.create({
      data: { firstName: body.firstName, lastName: body.lastName, email: body.email, phone: body.phone, company: body.company, jobTitle: body.jobTitle, source: body.source, status: body.status, score: body.score ?? 0, tags: body.tags ?? [], notes: body.notes, organizationId, assignedToId: body.assignedToId, createdById: session.user.id },
      include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create lead" },
      { status: 500 }
    )
  }
}
