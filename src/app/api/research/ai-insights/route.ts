import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const campaignId = searchParams.get("campaignId")
  const insightType = searchParams.get("insightType")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (campaignId) where.campaignId = campaignId
  if (insightType) where.insightType = insightType
  try {
    const [insights, total] = await Promise.all([
      prisma.aiInsight.findMany({
        where, include: { campaign: { select: { id: true, title: true } }, segment: true },
        orderBy: [{ priority: "desc" }, { generatedAt: "desc" }],
        skip: (page - 1) * limit, take: limit,
      }),
      prisma.aiInsight.count({ where }),
    ])
    return NextResponse.json({ insights, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load AI insights" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const insight = await prisma.aiInsight.create({
      data: { insightType: body.insightType, title: body.title, titleAr: body.titleAr, description: body.description, data: body.data, confidence: body.confidence ? parseFloat(body.confidence) : null, sourceModel: body.sourceModel, campaignId: body.campaignId, segmentId: body.segmentId, isReviewed: false, isActionable: body.isActionable ?? false, priority: body.priority ?? 0 },
    })
    return NextResponse.json(insight, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create AI insight" }, { status: 500 })
  }
}
