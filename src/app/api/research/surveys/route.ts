import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const campaignId = searchParams.get("campaignId")
  const where: Record<string, unknown> = {}
  if (campaignId) where.campaignId = campaignId
  try {
    const surveys = await prisma.survey.findMany({
      where,
      include: { _count: { select: { responses: true, sections: true } }, sections: { include: { _count: { select: { questions: true } } } } },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(surveys)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load surveys" }, { status: 500 })
  }
}
