import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const activity = await prisma.crmActivity.findUnique({
      where: { id },
      include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
    })
    if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(activity)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const activity = await prisma.crmActivity.update({
      where: { id },
      data: { type: body.type, subject: body.subject, description: body.description, outcome: body.outcome, scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null, completedAt: body.completedAt ? new Date(body.completedAt) : null, durationMinutes: body.durationMinutes, assignedToId: body.assignedToId, leadId: body.leadId, contactId: body.contactId, opportunityId: body.opportunityId },
      include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(activity)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    await prisma.crmActivity.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 })
  }
}
