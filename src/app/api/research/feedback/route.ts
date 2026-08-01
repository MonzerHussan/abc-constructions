import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  try {
    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        include: { participant: { select: { id: true, name: true, email: true } }, linkedUser: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.feedback.count(),
    ])
    return NextResponse.json({ feedback, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load feedback" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const feedback = await prisma.feedback.create({
      data: { content: body.content, category: body.category, participantId: body.participantId, linkedUserId: body.linkedUserId, source: body.source, isPublic: body.isPublic ?? false, metadata: body.metadata },
    })
    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 })
  }
}
