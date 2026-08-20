import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlatformAccountType } from "@/generated/prisma/client";
import { isPlatformAccountType } from "@/lib/account-types";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 } as const;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return { error: "Forbidden", status: 403 } as const;
  }
  return { user };
}

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const rows = await prisma.onboardingSideContent.findMany({
    orderBy: { accountType: "asc" },
  });
  return NextResponse.json(rows);
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();
  const accountType = body.accountType as string;
  if (!isPlatformAccountType(accountType)) {
    return NextResponse.json({ error: "Invalid accountType" }, { status: 400 });
  }

  const row = await prisma.onboardingSideContent.upsert({
    where: { accountType: accountType as PlatformAccountType },
    create: {
      accountType: accountType as PlatformAccountType,
      type: body.type ?? "mixed",
      title: body.title ?? "",
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
      isActive: body.isActive ?? true,
    },
    update: {
      type: body.type ?? "mixed",
      title: body.title ?? "",
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
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(row);
}
