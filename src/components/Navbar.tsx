"use client";

import Link from "next/link";
import Image from "next/image";
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
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Truck,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setUserMenuOpen(false);
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
              <Image
                src="/logo.png"
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

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {isLoggedIn ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-100"
                  >
                    <div className="w-9 h-9 bg-secondary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-secondary-600" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-surface-500 hidden sm:block" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute end-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-surface-100 py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium text-sm">{session?.user?.name || "مستخدم"}</p>
                        <p className="text-xs text-surface-500">{session?.user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <User className="w-4 h-4" />
                        {t("profile")}
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <Building2 className="w-4 h-4" />
                        {t("dashboard")}
                      </Link>
                      <Link
                        href="/projects/ABC/organization"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <Building2 className="w-4 h-4" />
                        {t("myOrganization")}
                      </Link>
                      <Link
                        href="/projects/ABC/verification"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {t("verification")}
                      </Link>
                      <Link
                        href="/projects/ABC/settings/mfa"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <Smartphone className="w-4 h-4" />
                        MFA
                      </Link>
                      <hr className="my-1" />
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 w-full">
                        <LogOut className="w-4 h-4" />
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/projects/ABC/auth/login"
                  className="px-4 py-2 text-sm font-medium text-surface-700 hover:text-surface-900"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/projects/ABC/auth/register"
                  className="px-4 py-2 text-sm font-medium bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
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
