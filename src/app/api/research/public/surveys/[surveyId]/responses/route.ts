import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ surveyId: string }> }) {
  try {
  const { surveyId } = await params
    const body = await req.json()
    const session = await auth()

    const survey = await prisma.survey.findUnique({ where: { id: surveyId } })
    if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 })

    const response = await prisma.surveyResponse.create({
      data: {
        campaignId: survey.campaignId,
        surveyId: surveyId,
        linkedUserId: session ? (session.user as { id: string }).id : null,
        participantId: body.participantId || null,
        status: "COMPLETED",
        isComplete: true,
        ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
        source: "public",
        timeStarted: body.timeStarted ? new Date(body.timeStarted) : undefined,
        timeCompleted: new Date(),
        duration: body.timeStarted
          ? Math.floor((Date.now() - new Date(body.timeStarted).getTime()) / 1000)
          : undefined,
        metadata: body.metadata,
        answers: {
          create: (body.answers ?? []).map((a: Record<string, unknown>) => ({
            questionId: a.questionId,
            value: a.value ?? null,
            values: a.values ?? [],
            valueNumber: a.valueNumber ?? null,
            valueJson: a.valueJson ?? null,
            timeSpent: a.timeSpent ?? null,
          })),
        },
      },
    })
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Submit response error:", error)
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 })
  }
}
