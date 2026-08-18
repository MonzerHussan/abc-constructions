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

export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })
  const ads = await prisma.ad.findMany({ orderBy: { sortOrder: "asc" } })
  return NextResponse.json(ads)
}

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await req.json()
  if (!body.title) return NextResponse.json({ error: "title required" }, { status: 400 })

  const ad = await prisma.ad.create({
    data: {
      type: body.type ?? "image",
      title: body.title,
      titleEn: body.titleEn ?? null,
      titleUr: body.titleUr ?? null,
      subtitle: body.subtitle ?? null,
      subtitleEn: body.subtitleEn ?? null,
      subtitleUr: body.subtitleUr ?? null,
      body: body.body ?? null,
      bodyEn: body.bodyEn ?? null,
      bodyUr: body.bodyUr ?? null,
      imageUrl: body.imageUrl ?? "",
      videoUrl: body.videoUrl ?? null,
      posterUrl: body.posterUrl ?? null,
      linkUrl: body.linkUrl ?? null,
      animation: body.animation ?? "fade",
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(ad, { status: 201 })
}
