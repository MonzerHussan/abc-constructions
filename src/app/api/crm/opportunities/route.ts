import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get("stage")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (stage) where.stage = stage
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { companyName: { contains: search, mode: "insensitive" } },
    ]
  }
  try {
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        include: { owner: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.opportunity.count({ where }),
    ])
    return NextResponse.json({ opportunities, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load opportunities" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    if (!body.name || !body.organizationId) return NextResponse.json({ error: "Name and organization are required" }, { status: 400 })
    const opportunity = await prisma.opportunity.create({
      data: { name: body.name, amount: body.amount ?? 0, currency: body.currency ?? "SAR", stage: body.stage, probability: body.probability ?? 0, expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null, actualCloseDate: body.actualCloseDate ? new Date(body.actualCloseDate) : null, source: body.source, notes: body.notes, tags: body.tags ?? [], leadId: body.leadId, contactId: body.contactId, companyName: body.companyName, organizationId: body.organizationId, ownerId: body.ownerId, createdById: session.user.id },
      include: { owner: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(opportunity, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 })
  }
}
