import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/modules/shared/utils/response-envelope";
import { ErrorCodes } from "@/modules/shared/utils/error-codes";
import { isPlatformAccountType } from "@/lib/account-types";

function localized(
  row: {
    title: string;
    titleEn: string | null;
    titleUr: string | null;
    subtitle: string | null;
    subtitleEn: string | null;
    subtitleUr: string | null;
    body: string | null;
    bodyEn: string | null;
    bodyUr: string | null;
  },
  lang: string,
) {
  const isEn = lang.startsWith("en");
  const isUr = lang.startsWith("ur");
  return {
    title: (isEn ? row.titleEn : isUr ? row.titleUr : row.title) ?? row.title,
    subtitle: (isEn ? row.subtitleEn : isUr ? row.subtitleUr : row.subtitle) ?? row.subtitle,
    body: (isEn ? row.bodyEn : isUr ? row.bodyUr : row.body) ?? row.body,
  };
}

/** Public read: onboarding side panel content for an account type. */
export async function GET(request: NextRequest) {
  const accountType = request.nextUrl.searchParams.get("accountType") ?? "";
  if (!isPlatformAccountType(accountType)) {
    return NextResponse.json(error(ErrorCodes.VALIDATION_ERROR, "Invalid accountType"), { status: 422 });
  }

  const lang = request.nextUrl.searchParams.get("lang") ?? "ar";
  const row = await prisma.onboardingSideContent.findUnique({
    where: { accountType },
  });

  if (!row || !row.isActive) {
    return NextResponse.json(success(null));
  }

  const text = localized(row, lang);
  return NextResponse.json(
    success({
      accountType: row.accountType,
      type: row.type,
      ...text,
      imageUrl: row.imageUrl,
      videoUrl: row.videoUrl,
      posterUrl: row.posterUrl,
      linkUrl: row.linkUrl,
    }),
  );
}
