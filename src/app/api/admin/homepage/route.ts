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

const CONTENT_FIELDS = {
  introTitle: true,
  introTitleEn: true,
  introTitleUr: true,
  introBody: true,
  introBodyEn: true,
  introBodyUr: true,
  visionTitle: true,
  visionTitleEn: true,
  visionTitleUr: true,
  visionBody: true,
  visionBodyEn: true,
  visionBodyUr: true,
  primaryCtaLabel: true,
  primaryCtaLabelEn: true,
  primaryCtaLabelUr: true,
  primaryCtaHref: true,
  secondaryCtaLabel: true,
  secondaryCtaLabelEn: true,
  secondaryCtaLabelUr: true,
  secondaryCtaHref: true,
  leftBlockType: true,
  leftBlockTitle: true,
  leftBlockTitleEn: true,
  leftBlockTitleUr: true,
  leftBlockBody: true,
  leftBlockBodyEn: true,
  leftBlockBodyUr: true,
  leftBlockImageUrl: true,
  leftBlockVideoUrl: true,
  leftBlockPosterUrl: true,
  leftBlockLinkUrl: true,
  leftBlockEnabled: true,
  showHighlights: true,
  highlightsTitle: true,
  highlightsTitleEn: true,
  highlightsTitleUr: true,
  showStats: true,
  stat1Value: true,
  stat1Label: true,
  stat1LabelEn: true,
  stat1LabelUr: true,
  stat2Value: true,
  stat2Label: true,
  stat2LabelEn: true,
  stat2LabelUr: true,
  stat3Value: true,
  stat3Label: true,
  stat3LabelEn: true,
  stat3LabelUr: true,
  stat4Value: true,
  stat4Label: true,
  stat4LabelEn: true,
  stat4LabelUr: true,
  showVideosSection: true,
  videosSectionTitle: true,
  videosSectionTitleEn: true,
  videosSectionTitleUr: true,
  showFooter: true,
  footerAbout: true,
  footerAboutEn: true,
  footerAboutUr: true,
  footerEmail: true,
  footerPhone: true,
  footerAddress: true,
  footerAddressEn: true,
  footerAddressUr: true,
  isActive: true,
}

export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const [content, slides, videos, ads, zones] = await Promise.all([
    prisma.homepageContent.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.carouselSlide.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.videoSection.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.ad.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.homepageZone.findMany({ orderBy: { sortOrder: "asc" } }),
  ])

  return NextResponse.json({ content, slides, videos, ads, zones })
}

export async function PUT(req: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const body = await req.json()
  const existing = await prisma.homepageContent.findFirst({ orderBy: { createdAt: "desc" } })

  const data: Record<string, unknown> = {}
  for (const key of Object.keys(CONTENT_FIELDS)) {
    if (key in body) data[key] = body[key]
  }

  let content
  if (existing) {
    content = await prisma.homepageContent.update({ where: { id: existing.id }, data })
  } else {
    const defaults = {
      introTitle: "منصة ABC الشاملة",
      introBody: "منصة شاملة لقطاع الإنشاءات والمقاولات",
      visionTitle: "رؤيتنا",
      visionBody: "تحويل قطاع الإنشاءات رقمياً",
      ...data,
    }
    content = await prisma.homepageContent.create({ data: defaults })
  }

  return NextResponse.json(content)
}
