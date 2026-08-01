import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const note = await prisma.crmNote.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    })
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(note)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load note" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const note = await prisma.crmNote.update({
      where: { id },
      data: { content: body.content, pinned: body.pinned, leadId: body.leadId, contactId: body.contactId, opportunityId: body.opportunityId },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(note)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    await prisma.crmNote.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
