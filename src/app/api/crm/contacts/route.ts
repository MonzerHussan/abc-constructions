import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
    ]
  }
  try {
    const [contacts, total] = await Promise.all([
      prisma.crmContact.findMany({
        where,
        include: { owner: { select: { id: true, name: true, email: true } }, linkedUser: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.crmContact.count({ where }),
    ])
    return NextResponse.json({ contacts, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load contacts" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    if (!body.firstName || !body.lastName || !body.organizationId) return NextResponse.json({ error: "First name, last name, and organization are required" }, { status: 400 })
    const contact = await prisma.crmContact.create({
      data: { firstName: body.firstName, lastName: body.lastName, email: body.email, phone: body.phone, jobTitle: body.jobTitle, company: body.company, organizationId: body.organizationId, linkedUserId: body.linkedUserId, ownerId: body.ownerId, source: body.source, tags: body.tags ?? [], notes: body.notes, avatar: body.avatar, isActive: body.isActive ?? true },
      include: { owner: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
  }
}
