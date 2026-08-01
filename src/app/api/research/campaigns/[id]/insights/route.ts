import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const insights = await prisma.aiInsight.findMany({
      where: { campaignId: id },
      include: { segment: true },
      orderBy: [{ priority: "desc" }, { generatedAt: "desc" }],
    })
    return NextResponse.json(insights)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load insights" }, { status: 500 })
  }
}
