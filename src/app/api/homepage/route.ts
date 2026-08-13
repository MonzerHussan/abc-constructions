import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getHomepageData } from "@/lib/homepage";
import { DEFAULT_LOCALE, getDir, isSupportedLocale, LOCALE_COOKIE } from "@/lib/i18n";

export async function GET() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;

  const data = await getHomepageData(locale);
  return NextResponse.json({
    data,
    locale,
    dir: getDir(locale),
  });
}
