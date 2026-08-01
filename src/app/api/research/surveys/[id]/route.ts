import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  try {
    const survey = await prisma.survey.findUnique({
      where: { id: id },
      include: {
        campaign: { select: { id: true, title: true, slug: true } },
        sections: {
          include: {
            questions: {
              include: { options: true },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { responses: true } },
      },
    })
    if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(survey)
  } catch (error) {
    console.error("Survey get error:", error)
    return NextResponse.json({ error: "Failed to load survey" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const survey = await prisma.survey.update({
      where: { id: id },
      data: {
        title: body.title,
        titleAr: body.titleAr,
        description: body.description,
        isActive: body.isActive,
        timeEstimate: body.timeEstimate ? parseInt(body.timeEstimate) : null,
      },
    })
    return NextResponse.json(survey)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update survey" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    await prisma.survey.delete({ where: { id: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete survey" }, { status: 500 })
  }
}
