"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  FileText,
  Package,
  Store,
  Building2,
  Briefcase,
  GraduationCap,
  Menu,
  X,
  Bell,
  MessageSquare,
  User,
  Search,
  LogOut,
  ChevronDown,
  Truck,
  ShoppingCart,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  FileText,
  Package,
  Store,
  Building2,
  Briefcase,
  GraduationCap,
  Truck,
  ShoppingCart,
};

const navLabelKeys: Partial<Record<string, TranslationKey>> = {
  "/": "navHome",
  "/projects/ABC/tenders/projects": "navProjectTenders",
  "/projects/ABC/tenders/materials": "navMaterialTenders",
  "/projects/ABC/marketplace": "navMarketplace",
  "/projects/ABC/projects": "navProjects",
  "/projects/ABC/jobs": "navJobs",
  "/projects/ABC/training": "navTraining",
  "/projects/ABC/delivery": "navDelivery",
  "/projects/ABC/procurement": "navProcurement",
  "/projects/ABC/research": "navResearch",
};

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isLoggedIn = status === "authenticated";

  return (
    <nav className="bg-white border-b border-surface-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt={t("appName")}
                width={40}
                height={40}
                priority
                className="w-10 h-10"
              />
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-surface-900">{t("appName")}</span>
                <span className="text-xs block text-accent-500 -mt-1">
                  {t("appFullName")}
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.slice(1).map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary-50 text-secondary-600"
                        : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {t(navLabelKeys[item.href] ?? (item.label as TranslationKey))}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg">
              <Search className="w-5 h-5" />
            </button>

            {/* Language Switcher — 3 options (ar/en/ur) */}
            <LanguageSwitcher />

            {isLoggedIn ? (
              <>
                <button className="relative p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 end-1 w-2 h-2 bg-danger-500 rounded-full" />
                </button>
                <button className="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-100"
                  >
                    <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
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
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <User className="w-4 h-4" />
                        {t("profile")}
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <Building2 className="w-4 h-4" />
                        {t("dashboard")}
                      </Link>
                      <Link
                        href="/projects/ABC/organization"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <Building2 className="w-4 h-4" />
                        {t("myOrganization")}
                      </Link>
                      <Link
                        href="/projects/ABC/verification"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {t("verification")}
                      </Link>
                      <Link
                        href="/projects/ABC/settings/mfa"
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
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary-50 text-secondary-600"
                      : "text-surface-600 hover:bg-surface-100"
                  )}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {t(navLabelKeys[item.href] ?? (item.label as TranslationKey))}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
