import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const meeting = await prisma.crmMeeting.findUnique({
      where: { id },
      include: { organizer: { select: { id: true, name: true, email: true } } },
    })
    if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(meeting)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load meeting" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const meeting = await prisma.crmMeeting.update({
      where: { id },
      data: { title: body.title, description: body.description, startTime: body.startTime ? new Date(body.startTime) : undefined, endTime: body.endTime ? new Date(body.endTime) : undefined, location: body.location, meetingLink: body.meetingLink, status: body.status, outcome: body.outcome, organizerId: body.organizerId, leadId: body.leadId, contactId: body.contactId, opportunityId: body.opportunityId },
      include: { organizer: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(meeting)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    await prisma.crmMeeting.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 })
  }
}
