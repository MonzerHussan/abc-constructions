import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const surveys = await prisma.survey.findMany({
      where: { campaignId: id },
      include: { _count: { select: { responses: true, sections: true } }, sections: { include: { _count: { select: { questions: true } } }, orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(surveys)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load surveys" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const last = await prisma.survey.findFirst({ where: { campaignId: id }, orderBy: { sortOrder: "desc" } })
    const survey = await prisma.survey.create({
      data: { title: body.title, titleAr: body.titleAr, description: body.description, campaignId: id, sortOrder: (last?.sortOrder ?? -1) + 1, timeEstimate: body.timeEstimate ? parseInt(body.timeEstimate) : undefined },
    })
    return NextResponse.json(survey, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
  }
}
