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
  const videos = await prisma.videoSection.findMany({ orderBy: { sortOrder: "asc" } })
  return NextResponse.json(videos)
}

export async function POST(req: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await req.json()
  if (!body.title || !body.videoUrl)
    return NextResponse.json({ error: "title and videoUrl required" }, { status: 400 })

  const video = await prisma.videoSection.create({
    data: {
      title: body.title,
      titleEn: body.titleEn ?? null,
      titleUr: body.titleUr ?? null,
      description: body.description ?? null,
      descriptionEn: body.descriptionEn ?? null,
      descriptionUr: body.descriptionUr ?? null,
      videoUrl: body.videoUrl,
      posterUrl: body.posterUrl ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(video, { status: 201 })
}
