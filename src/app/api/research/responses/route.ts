import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const campaignId = searchParams.get("campaignId")
  const surveyId = searchParams.get("surveyId")
  const status = searchParams.get("status")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const where: Record<string, unknown> = {}
  if (campaignId) where.campaignId = campaignId
  if (surveyId) where.surveyId = surveyId
  if (status) where.status = status
  try {
    const [responses, total] = await Promise.all([
      prisma.surveyResponse.findMany({
        where,
        include: { campaign: { select: { id: true, title: true } }, survey: { select: { id: true, title: true } }, participant: { select: { id: true, name: true, email: true } }, linkedUser: { select: { id: true, name: true, email: true } }, answers: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.surveyResponse.count({ where }),
    ])
    return NextResponse.json({ responses, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load responses" }, { status: 500 })
  }
}
