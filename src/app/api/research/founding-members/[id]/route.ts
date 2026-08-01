import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const member = await prisma.foundingMember.update({
      where: { id: id },
      data: { tier: body.tier, badge: body.badge, earlyAccess: body.earlyAccess, betaAccess: body.betaAccess, discountPercent: body.discountPercent ? parseFloat(body.discountPercent) : null, freeSubscription: body.freeSubscription, subscriptionMonths: body.subscriptionMonths ? parseInt(body.subscriptionMonths) : null, specialOffers: body.specialOffers, notes: body.notes },
    })
    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update founding member" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  try {
    await prisma.foundingMember.delete({ where: { id: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete founding member" }, { status: 500 })
  }
}
