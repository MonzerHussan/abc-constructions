"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut } from "lucide-react";
import AbcLogo from "@/components/AbcLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import {
  HEADER_CONTROL,
  HEADER_LOGOUT_BUTTON,
} from "@/lib/header-control-styles";
import { cn } from "@/lib/utils";

const NAV_GROUPS: {
  key: string;
  labelKey: TranslationKey;
  items: { href: string; labelKey: TranslationKey }[];
}[] = [
  {
    key: "bids",
    labelKey: "navBids",
    items: [
      { href: "/projects/ABC/tenders/projects", labelKey: "headProjects" },
      { href: "/projects/ABC/tenders/materials", labelKey: "headMaterials" },
      { href: "/projects/ABC/delivery", labelKey: "headDelivery" },
      { href: "/projects/ABC/marketplace", labelKey: "headProducts" },
    ],
  },
  {
    key: "market",
    labelKey: "navMarketplaceTitle",
    items: [
      { href: "/projects/ABC/projects", labelKey: "headProjects" },
      { href: "/projects/ABC/marketplace", labelKey: "headMaterials" },
      { href: "/projects/ABC/delivery", labelKey: "headDelivery" },
      { href: "/projects/ABC/marketplace", labelKey: "headProducts" },
    ],
  },
  {
    key: "community",
    labelKey: "navCommunity",
    items: [
      { href: "/projects/ABC/jobs", labelKey: "headJobs" },
      { href: "/projects/ABC/training", labelKey: "headTraining" },
    ],
  },
];

export default function PlatformHeader() {
  const { t, dir } = useLanguage();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const loggedIn = status === "authenticated";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      ref={ref}
      className="sticky top-0 z-30 flex items-center justify-between gap-2 bg-white/95 backdrop-blur border-b border-surface-200 px-3 py-1.5 shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/projects/ABC/projects"
          className="shrink-0 rounded-none p-0.5 hover:opacity-90 transition-opacity"
          aria-label={t("home")}
        >
          <AbcLogo background="light" width={56} height={24} className="h-6 w-auto object-contain" />
        </Link>
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_GROUPS.map((g) => (
            <div key={g.key} className="relative">
              <button
                type="button"
                onClick={() => setOpen(open === g.key ? null : g.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-none",
                  HEADER_CONTROL,
                  "text-surface-700 hover:text-secondary-600 hover:bg-secondary-50",
                )}
                aria-expanded={open === g.key}
              >
                {t(g.labelKey)}
                <ChevronDown
                  className={cn("w-3.5 h-3.5 transition-transform", open === g.key && "rotate-180")}
                />
              </button>
              {open === g.key && (
                <div
                  dir={dir}
                  className="absolute top-full start-0 mt-1 w-56 bg-white rounded-none shadow-lg border border-surface-200 py-1 z-50"
                >
                  {g.items.map((item) => (
                    <Link
                      key={`${g.key}-${item.labelKey}`}
                      href={item.href}
                      onClick={() => setOpen(null)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors",
                        pathname === item.href || pathname.startsWith(`${item.href}/`)
                          ? "text-secondary-700 bg-secondary-50"
                          : "text-surface-700 hover:bg-surface-50",
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 shrink-0" />
                      {t(item.labelKey)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <LanguageSwitcher />
        {loggedIn && (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/projects/ABC" })}
            className={HEADER_LOGOUT_BUTTON}
            aria-label={t("logout")}
            title={t("logout")}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {t("logout")}
          </button>
        )}
        {loggedIn && session?.user?.name && (
          <span className="hidden lg:inline text-xs font-semibold text-surface-500 truncate max-w-[120px]">
            {session.user.name}
          </span>
        )}
      </div>
    </header>
  );
}
