import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
    })
    if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(opportunity)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load opportunity" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: { name: body.name, amount: body.amount, currency: body.currency, stage: body.stage, probability: body.probability, expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null, actualCloseDate: body.actualCloseDate ? new Date(body.actualCloseDate) : null, source: body.source, notes: body.notes, tags: body.tags, leadId: body.leadId, contactId: body.contactId, companyName: body.companyName, ownerId: body.ownerId },
      include: { owner: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(opportunity)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    await prisma.opportunity.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete opportunity" }, { status: 500 })
  }
}
