import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const campaign = await prisma.researchCampaign.findUnique({
      where: { id: id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        segments: { include: { segment: true } },
        surveys: { include: { sections: { include: { questions: { include: { options: true }, orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
        _count: { select: { surveys: true, responses: true, featureRequests: true, aiInsights: true } },
      },
    })
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(campaign)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load campaign" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const campaign = await prisma.researchCampaign.update({
      where: { id: id },
      data: { title: body.title, titleAr: body.titleAr, description: body.description, descriptionAr: body.descriptionAr, status: body.status, coverImage: body.coverImage, welcomeMessage: body.welcomeMessage, thankYouMessage: body.thankYouMessage, isPublic: body.isPublic, isFeatured: body.isFeatured },
    })
    return NextResponse.json(campaign)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    await prisma.researchCampaign.delete({ where: { id: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 })
  }
}
