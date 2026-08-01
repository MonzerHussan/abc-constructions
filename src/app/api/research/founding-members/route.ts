import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const members = await prisma.foundingMember.findMany({
      include: { participant: { include: { segment: true, linkedUser: { select: { id: true, name: true, email: true } } } } },
      orderBy: { joinedAt: "desc" },
    })
    return NextResponse.json(members)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load founding members" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const member = await prisma.foundingMember.create({
      data: { participantId: body.participantId, tier: body.tier ?? "INSIDER", badge: body.badge, earlyAccess: body.earlyAccess ?? false, betaAccess: body.betaAccess ?? false, discountPercent: body.discountPercent ? parseFloat(body.discountPercent) : null, freeSubscription: body.freeSubscription ?? false, subscriptionMonths: body.subscriptionMonths ? parseInt(body.subscriptionMonths) : null, specialOffers: body.specialOffers, notes: body.notes },
      include: { participant: true },
    })
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create founding member" }, { status: 500 })
  }
}
