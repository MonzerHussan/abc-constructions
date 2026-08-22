"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import type { PlatformAccountType } from "@/lib/account-types";
import type { PublicSectionContent } from "@/modules/onboarding-survey";
import { LOGO_WHITE_PILLARS } from "@/lib/brand-logo";
import { isUsableMediaUrl } from "@/lib/utils";

interface SideContent {
  type: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  imageUrl: string;
  videoUrl: string | null;
  posterUrl: string | null;
  linkUrl: string | null;
}

interface OnboardingSidePanelProps {
  accountType: PlatformAccountType | "";
  sectionContent?: PublicSectionContent | null;
}

function SectionContentBlock({ content }: { content: PublicSectionContent }) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-4">
      {isUsableMediaUrl(content.imageUrl) && (
        <div className="relative aspect-[4/3] w-full max-w-md mx-auto overflow-hidden border border-white/15">
          <Image src={content.imageUrl!} alt={content.title ?? ""} fill className="object-cover" unoptimized />
        </div>
      )}
      {isUsableMediaUrl(content.videoUrl) && !isUsableMediaUrl(content.imageUrl) && (
        <video
          src={content.videoUrl!}
          poster={isUsableMediaUrl(content.posterUrl) ? content.posterUrl! : undefined}
          controls
          className="w-full max-w-md mx-auto border border-white/15"
        />
      )}
      {content.title && <h2 className="text-xl font-bold leading-snug">{content.title}</h2>}
      {content.body && (
        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{content.body}</p>
      )}
      {content.linkUrl && content.title && (
        <Link
          href={content.linkUrl}
          className="inline-flex w-fit px-4 py-2 text-xs font-bold bg-secondary-500 hover:bg-secondary-600 transition-colors"
        >
          {content.title}
        </Link>
      )}
    </div>
  );
}

export function OnboardingSidePanel({ accountType, sectionContent }: OnboardingSidePanelProps) {
  const { language } = useLanguage();
  const [content, setContent] = useState<SideContent | null>(null);

  useEffect(() => {
    if (!accountType) return;
    fetch(`/api/v1/onboarding/side-content?accountType=${accountType}&lang=${language}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => setContent(res?.data ?? null))
      .catch(() => setContent(null));
  }, [accountType, language]);

  const hasSectionContent =
    sectionContent &&
    (sectionContent.title || sectionContent.body || sectionContent.imageUrl || sectionContent.videoUrl);

  return (
    <div className="relative hidden lg:flex flex-col min-h-full gradient-hero text-white p-6 overflow-hidden">
      <div className="mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_WHITE_PILLARS} alt="ABC" className="h-12 w-auto" />
      </div>

      {hasSectionContent ? (
        <SectionContentBlock content={sectionContent} />
      ) : content ? (
        <div className="flex-1 flex flex-col justify-center gap-4">
          {isUsableMediaUrl(content.imageUrl) && (
            <div className="relative aspect-[4/3] w-full max-w-md mx-auto overflow-hidden border border-white/15">
              <Image src={content.imageUrl} alt={content.title} fill className="object-cover" unoptimized />
            </div>
          )}
          {isUsableMediaUrl(content.videoUrl) && !isUsableMediaUrl(content.imageUrl) && (
            <video
              src={content.videoUrl!}
              poster={isUsableMediaUrl(content.posterUrl) ? content.posterUrl! : undefined}
              controls
              className="w-full max-w-md mx-auto border border-white/15"
            />
          )}
          {content.title && <h2 className="text-xl font-bold leading-snug">{content.title}</h2>}
          {content.subtitle && <p className="text-sm text-white/80">{content.subtitle}</p>}
          {content.body && (
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{content.body}</p>
          )}
          {content.linkUrl && (
            <Link
              href={content.linkUrl}
              className="inline-flex w-fit px-4 py-2 text-xs font-bold bg-secondary-500 hover:bg-secondary-600 transition-colors"
            >
              {content.title}
            </Link>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="text-sm text-white/60 max-w-xs">
            {language === "ar"
              ? "محتوى إرشادي لكل قسم — يُدار من لوحة الأدmin"
              : language === "en"
                ? "Section guidance content — managed in admin"
                : "سیکشن رہنمائی — admin سے"}
          </p>
        </div>
      )}
    </div>
  );
}
