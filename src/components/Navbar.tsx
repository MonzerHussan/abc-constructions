"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  FileText,
  Package,
  Store,
  Building2,
  Briefcase,
  GraduationCap,
  Truck,
};

const navLabelKeys: Record<string, string> = {
  "/": "navHome",
  "/tenders/projects": "navProjectTenders",
  "/tenders/materials": "navMaterialTenders",
  "/marketplace": "navMarketplace",
  "/projects": "navProjects",
  "/jobs": "navJobs",
  "/training": "navTraining",
  "/delivery": "navDelivery",
};

export default function Navbar() {
  const pathname = usePathname();
  const { language, t, toggleLanguage, langLabel } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isLoggedIn = false;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">{t("appName")}</span>
                <span className="text-xs block text-gray-500 -mt-1">
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
                        ? "bg-amber-50 text-amber-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {t(navLabelKeys[item.href] as any || item.label)}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Search className="w-5 h-5" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title={language === "ar" ? "Switch to English" : language === "en" ? "اردو میں تبدیل کریں" : "التبديل إلى العربية"}
            >
              <Globe className="w-4 h-4" />
              <span>{langLabel}</span>
            </button>

            {isLoggedIn ? (
              <>
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-amber-600" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium text-sm">محمد أحمد</p>
                        <p className="text-xs text-gray-500">{t("roleContractor")}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" />
                        {t("profile")}
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Building2 className="w-4 h-4" />
                        {t("dashboard")}
                      </Link>
                      <hr className="my-1" />
                      <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
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
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  {t("register")}
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
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
                      ? "bg-amber-50 text-amber-700"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {t(navLabelKeys[item.href] as any || item.label)}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
