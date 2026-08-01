import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const response = await prisma.surveyResponse.findUnique({
      where: { id: id },
      include: { campaign: true, survey: { include: { sections: { include: { questions: { include: { options: true } } } } } }, participant: true, linkedUser: { select: { id: true, name: true, email: true } }, answers: { include: { question: true } } },
    })
    if (!response) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load response" }, { status: 500 })
  }
}
