import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
    })
    if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load lead" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const lead = await prisma.lead.update({
      where: { id },
      data: { firstName: body.firstName, lastName: body.lastName, email: body.email, phone: body.phone, company: body.company, jobTitle: body.jobTitle, source: body.source, status: body.status, score: body.score, tags: body.tags, notes: body.notes, assignedToId: body.assignedToId },
      include: { assignedTo: { select: { id: true, name: true, email: true } }, createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    await prisma.lead.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}
