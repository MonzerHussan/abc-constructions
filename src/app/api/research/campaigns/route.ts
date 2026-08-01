import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const type = searchParams.get("type")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (type) where.campaignType = type
  if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { titleEn: { contains: search, mode: "insensitive" } }]
  try {
    const [campaigns, total] = await Promise.all([
      prisma.researchCampaign.findMany({
        where,
        include: { _count: { select: { surveys: true, responses: true, featureRequests: true, aiInsights: true } }, createdBy: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.researchCampaign.count({ where }),
    ])
    return NextResponse.json({ campaigns, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error("Campaigns list error:", error)
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const campaign = await prisma.researchCampaign.create({
      data: {
        title: body.title,
        titleEn: body.titleEn,
        titleAr: body.titleAr,
        description: body.description,
        descriptionAr: body.descriptionAr,
        campaignType: body.campaignType,
        slug: body.slug,
        coverImage: body.coverImage,
        welcomeMessage: body.welcomeMessage,
        thankYouMessage: body.thankYouMessage,
        allowGuestParticipation: body.allowGuestParticipation ?? true,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        maxResponses: body.maxResponses ? parseInt(body.maxResponses) : undefined,
        targetResponses: body.targetResponses ? parseInt(body.targetResponses) : undefined,
        isPublic: body.isPublic ?? false,
        isFeatured: body.isFeatured ?? false,
        metadata: body.metadata,
        createdBy: { connect: { id: (session.user as { id: string }).id } },
      },
    })
    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error("Campaign create error:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}
