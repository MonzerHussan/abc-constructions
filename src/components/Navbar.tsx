"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  FileText,
  Package,
  Store,
  Building2,
  Briefcase,
  GraduationCap,
  Truck,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AbcLogo from "@/components/AbcLogo";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { HEADER_LOGOUT_BUTTON } from "@/lib/header-control-styles";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Package,
  Store,
  Building2,
  Briefcase,
  GraduationCap,
  Truck,
};

interface NavMenu {
  key: string;
  labelKey: TranslationKey;
  items: { href: string; labelKey: TranslationKey }[];
}

const MENUS: NavMenu[] = [
  {
    key: "bids",
    labelKey: "navBids",
    items: [
      { href: "/projects/ABC/tenders/projects", labelKey: "navProjectTenders" },
      { href: "/projects/ABC/tenders/materials", labelKey: "navMaterialTenders" },
    ],
  },
  {
    key: "market",
    labelKey: "navMarketplaceTitle",
    items: [
      { href: "/projects/ABC/marketplace", labelKey: "navMarketplace" },
      { href: "/projects/ABC/projects", labelKey: "navProjects" },
      { href: "/projects/ABC/delivery", labelKey: "navDelivery" },
    ],
  },
  {
    key: "community",
    labelKey: "navCommunity",
    items: [
      { href: "/projects/ABC/training", labelKey: "navTraining" },
      { href: "/projects/ABC/jobs", labelKey: "navJobs" },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActiveItem = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href);

  return (
    <nav className="bg-white border-b border-surface-200 sticky top-0 z-50" ref={menuRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <AbcLogo
                background="light"
                alt="ABC"
                width={64}
                height={64}
                priority
                className="w-16 h-16"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {MENUS.map((menu) => {
                const active = menu.items.some((it) => isActiveItem(it.href));
                const open = openMenu === menu.key;
                return (
                  <div key={menu.key} className="relative">
                    <button
                      onClick={() => setOpenMenu(open ? null : menu.key)}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                        active || open
                          ? "text-amber-600"
                          : "text-surface-700 hover:text-amber-600 hover:bg-surface-50"
                      )}
                      aria-expanded={open}
                    >
                      {t(menu.labelKey)}
                      <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
                    </button>
                    {open && (
                      <div className="absolute top-full start-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-surface-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-surface-100 mb-1">
                          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide">
                            {t(menu.labelKey)}
                          </p>
                        </div>
                        {menu.items.map((item) => {
                          const Icon = iconMap[item.labelKey] ?? FileText;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setOpenMenu(null)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                                isActiveItem(item.href)
                                  ? "text-amber-600 bg-amber-50"
                                  : "text-surface-700 hover:bg-surface-50"
                              )}
                            >
                              <Icon className="w-4 h-4 text-surface-400" />
                              {t(item.labelKey)}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <LanguageSwitcher />
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/projects/ABC" })}
                className={HEADER_LOGOUT_BUTTON}
                aria-label={t("logout")}
                title={t("logout")}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t("logout")}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/projects/ABC?login=1"
                  className="px-2.5 py-1.5 text-sm font-semibold text-surface-700 hover:text-secondary-600 rounded-none"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/projects/ABC?register=1"
                  className="px-2.5 py-1.5 text-sm font-semibold bg-secondary-500 text-white rounded-none hover:bg-secondary-600 transition-colors"
                >
                  {t("register")}
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-4">
            {MENUS.map((menu) => (
              <div key={menu.key}>
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wide mb-2 px-3">
                  {t(menu.labelKey)}
                </p>
                <div className="space-y-1">
                  {menu.items.map((item) => {
                    const Icon = iconMap[item.labelKey] ?? FileText;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActiveItem(item.href)
                            ? "bg-amber-50 text-amber-600"
                            : "text-surface-600 hover:bg-surface-100"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {t(item.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
