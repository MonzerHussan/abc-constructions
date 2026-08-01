import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const campaigns = await prisma.researchCampaign.findMany({
      where: { isPublic: true, status: "ACTIVE" },
      include: {
        _count: { select: { surveys: true, responses: true } },
        segments: { include: { segment: true } },
        surveys: { select: { id: true, title: true, titleAr: true, description: true, timeEstimate: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Public campaigns error:", error)
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 })
  }
}
