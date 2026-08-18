import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 } as const
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN"))
    return { error: "Forbidden", status: 403 } as const
  return { user }
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { id } = await params
  const body = await req.json()

  const allowed = [
    "type", "title", "titleEn", "titleUr", "subtitle", "subtitleEn", "subtitleUr",
    "body", "bodyEn", "bodyUr", "imageUrl", "videoUrl", "posterUrl",
    "linkUrl", "animation", "sortOrder", "isActive",
  ]
  const data: Record<string, unknown> = {}
  for (const key of allowed) if (key in body) data[key] = body[key]

  try {
    const ad = await prisma.ad.update({ where: { id }, data })
    return NextResponse.json(ad)
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const { id } = await params
  try {
    await prisma.ad.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
