import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const segments = await prisma.researchSegment.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
    return NextResponse.json(segments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load segments" }, { status: 500 })
  }
}
