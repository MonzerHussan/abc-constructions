import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const contact = await prisma.crmContact.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, email: true } }, linkedUser: { select: { id: true, name: true, email: true } } },
    })
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(contact)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load contact" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const contact = await prisma.crmContact.update({
      where: { id },
      data: { firstName: body.firstName, lastName: body.lastName, email: body.email, phone: body.phone, jobTitle: body.jobTitle, company: body.company, linkedUserId: body.linkedUserId, ownerId: body.ownerId, source: body.source, tags: body.tags, notes: body.notes, avatar: body.avatar, isActive: body.isActive },
      include: { owner: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(contact)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    await prisma.crmContact.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}
