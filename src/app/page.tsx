"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import HomepageCarousel from "@/components/homepage/HomepageCarousel";
import { HomepageVideoGroup } from "@/components/homepage/VideoCard";
import AdsBanner from "@/components/homepage/AdsBanner";
import { useLanguage } from "@/lib/LanguageContext";
import { HOMEPAGE_DEFAULTS, type HomepageData } from "@/lib/homepage-defaults";

export default function HomePage() {
  const { t, dir, language } = useLanguage();
  const [data, setData] = useState<HomepageData>(HOMEPAGE_DEFAULTS);

  useEffect(() => {
    fetch(`/api/homepage`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.data) setData(res.data);
      })
      .catch(() => {});
  }, []);

  const c = data.content;
  const L = language;

  const introTitle = L === "en" ? c.introTitleEn : L === "ur" ? c.introTitleUr : c.introTitle;
  const introBody = L === "en" ? c.introBodyEn : L === "ur" ? c.introBodyUr : c.introBody;
  const visionTitle = L === "en" ? c.visionTitleEn : L === "ur" ? c.visionTitleUr : c.visionTitle;
  const visionBody = L === "en" ? c.visionBodyEn : L === "ur" ? c.visionBodyUr : c.visionBody;
  const primaryCta = L === "en" ? c.primaryCtaLabelEn : L === "ur" ? c.primaryCtaLabelUr : c.primaryCtaLabel;
  const secondaryCta = L === "en" ? c.secondaryCtaLabelEn : L === "ur" ? c.secondaryCtaLabelUr : c.secondaryCtaLabel;

  return (
    <div className="min-h-screen bg-surface-50" dir={dir}>
      <Navbar />

      {/* Section 1+2: Intro/Vision (left) + Promo videos (right) */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary-50 to-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                ABC
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-surface-900 leading-tight">
                {introTitle}
              </h1>
              <p className="text-lg text-surface-600 leading-relaxed">{introBody}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={c.primaryCtaHref}
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
                >
                  {primaryCta}
                </Link>
                <Link
                  href={c.secondaryCtaHref}
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-white border border-surface-200 text-surface-800 rounded-xl font-medium hover:border-amber-300 hover:text-amber-600 transition-colors"
                >
                  {secondaryCta}
                </Link>
              </div>

              <div className="pt-4 border-t border-surface-200">
                <h3 className="text-lg font-bold text-primary-600 mb-2">{visionTitle}</h3>
                <p className="text-surface-600 leading-relaxed">{visionBody}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <HomepageVideoGroup videos={data.videos} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Middle carousel slideshow */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-500">
              {language === "en" ? "Platform Highlights" : language === "ur" ? "پلیٹ فارم کی جھلکیاں" : "أبرز ما في المنصة"}
            </h2>
          </div>
          <HomepageCarousel slides={data.slides} dir={dir} />
        </div>
      </section>

      {/* Section 4: Stats strip */}
      <section className="py-10 bg-white border-y border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-amber-600">2,500+</p>
              <p className="text-sm text-surface-600">{language === "en" ? "Completed projects" : "مشروع مكتمل"}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">1,800+</p>
              <p className="text-sm text-surface-600">{language === "en" ? "Verified contractors" : "مقاول موثّق"}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">10,000+</p>
              <p className="text-sm text-surface-600">{language === "en" ? "Materials" : "منتج متوفر"}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">3,200+</p>
              <p className="text-sm text-surface-600">{language === "en" ? "Awarded bids" : "مناقصة منجزة"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Full-width dynamic ads */}
      <AdsBanner ads={data.ads} />

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="ABC" width={64} height={64} className="w-16 h-16" />
              </div>
              <p className="text-sm">
                {t("appDescription")}
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("services")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/tenders/projects" className="hover:text-white">
                    {t("modProjectTenders")}
                  </Link>
                </li>
                <li>
                  <Link href="/tenders/materials" className="hover:text-white">
                    {t("modMaterialTenders")}
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace" className="hover:text-white">
                    {t("modMarketplace")}
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-white">
                    {t("modJobs")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("about")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white">
                    {t("about")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    {t("contact")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    {t("terms")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    {t("privacy")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("contact")}</h4>
              <ul className="space-y-2 text-sm">
                <li>info@abc-constructions.com</li>
                <li>+966 50 000 0000</li>
                <li>{language === "en" ? "Riyadh, Saudi Arabia" : "الرياض، المملكة العربية السعودية"}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-surface-800 mt-8 pt-8 text-center text-sm">
            <p>© 2026 ABC - {t("appFullName")}. {t("allRights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
