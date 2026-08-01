import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (priority) where.priority = priority
  try {
    const [requests, total] = await Promise.all([
      prisma.featureRequest.findMany({
        where,
        include: { campaign: { select: { id: true, title: true } }, participant: { select: { id: true, name: true, email: true } }, linkedUser: { select: { id: true, name: true, email: true } }, _count: { select: { votes: true } }, votes: { take: 10, orderBy: { createdAt: "desc" } } },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.featureRequest.count({ where }),
    ])
    return NextResponse.json({ requests, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load feature requests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const request = await prisma.featureRequest.create({
      data: { title: body.title, description: body.description, category: body.category ?? "NEW_FEATURE", campaignId: body.campaignId, participantId: body.participantId, linkedUserId: body.linkedUserId, metadata: body.metadata },
    })
    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create feature request" }, { status: 500 })
  }
}
