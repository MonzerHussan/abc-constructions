import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const section = await prisma.surveySection.findUnique({ where: { id: body.sectionId } })
    if (!section || section.surveyId !== id) return NextResponse.json({ error: "Section not found" }, { status: 404 })
    const last = await prisma.surveyQuestion.findFirst({ where: { sectionId: body.sectionId }, orderBy: { sortOrder: "desc" } })
    const question = await prisma.surveyQuestion.create({
      data: { title: body.title, titleAr: body.titleAr, description: body.description, questionType: body.questionType, sectionId: body.sectionId, sortOrder: (last?.sortOrder ?? -1) + 1, isRequired: body.isRequired ?? true, hasOtherOption: body.hasOtherOption ?? false, randomizeOptions: body.randomizeOptions ?? false, maxSelections: body.maxSelections ? parseInt(body.maxSelections) : null, minSelections: body.minSelections ? parseInt(body.minSelections) : null, lowLabel: body.lowLabel, highLabel: body.highLabel, lowValue: body.lowValue ? parseInt(body.lowValue) : null, highValue: body.highValue ? parseInt(body.highValue) : null, stepValue: body.stepValue ? parseInt(body.stepValue) : null, validationRules: body.validationRules, metadata: body.metadata },
    })
    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
