import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const existing = body.email
      ? await prisma.researchParticipant.findFirst({ where: { email: body.email } })
      : null
    if (existing) return NextResponse.json(existing)

    const participant = await prisma.researchParticipant.create({
      data: {
        email: body.email,
        phone: body.phone,
        name: body.name,
        company: body.company,
        jobTitle: body.jobTitle,
        country: body.country,
        city: body.city,
        status: "ACTIVE",
        participantType: "GUEST",
        consentGiven: body.consentGiven ?? true,
        consentDate: body.consentGiven ? new Date() : null,
        source: "public",
        metadata: body.metadata,
      },
    })
    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    console.error("Create participant error:", error)
    return NextResponse.json({ error: "Failed to create participant" }, { status: 500 })
  }
}
