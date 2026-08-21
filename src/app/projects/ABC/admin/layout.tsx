"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard, Users, Building2, ShieldCheck, FileText,
  DollarSign, Newspaper, Headphones, Clock, Menu, X,
  Briefcase, ShoppingCart, Settings, BarChart3, GraduationCap,
  TreePine, Megaphone, Scale, FlaskConical, Receipt, LogOut,
  ClipboardList, ListChecks, PieChart, BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { platformLoginUrl } from "@/lib/homepage-auth-routes"
import { useLanguage } from "@/lib/LanguageContext"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import type { TranslationKey } from "@/lib/translations"
import { canAccessAdminModule, isPlatformStaffRole, isSuperAdminRole } from "@/lib/auth/platform-admin"

const IDLE_TIMEOUT_MS = (Number(process.env.NEXT_PUBLIC_ADMIN_IDLE_TIMEOUT_MINUTES) || 30) * 60 * 1000

const adminLinks: { href: string; icon: any; tk: TranslationKey; module: string; superAdminOnly?: boolean }[] = [
  { href: "/projects/ABC/admin", icon: LayoutDashboard, tk: "adminDashboard", module: "dashboard" },
  { href: "/projects/ABC/admin/staff", icon: ShieldCheck, tk: "adminStaff", module: "staff", superAdminOnly: true },
  { href: "/projects/ABC/admin/users", icon: Users, tk: "adminUsers", module: "users" },
  { href: "/projects/ABC/admin/organizations", icon: Building2, tk: "adminOrganizations", module: "organizations" },
  { href: "/projects/ABC/admin/verifications", icon: ShieldCheck, tk: "adminVerifications", module: "verifications" },
  { href: "/projects/ABC/admin/tenders", icon: FileText, tk: "adminTenders", module: "tenders" },
  { href: "/projects/ABC/admin/procurement", icon: ShoppingCart, tk: "adminProcurement", module: "procurement" },
  { href: "/projects/ABC/admin/finance", icon: DollarSign, tk: "adminFinance", module: "finance" },
  { href: "/projects/ABC/admin/content", icon: Newspaper, tk: "adminContent", module: "content" },
  { href: "/projects/ABC/admin/homepage", icon: LayoutDashboard, tk: "adminHomepage", module: "homepage" },
  { href: "/projects/ABC/admin/onboarding-content", icon: BookOpen, tk: "adminOnboardingContent", module: "onboarding" },
  { href: "/projects/ABC/admin/surveys", icon: ClipboardList, tk: "adminSurveyManager", module: "surveys" },
  { href: "/projects/ABC/admin/surveys/section-content", icon: BookOpen, tk: "adminSectionContent", module: "surveys" },
  { href: "/projects/ABC/admin/surveys/account-types", icon: ListChecks, tk: "adminAccountSubcategories", module: "surveys" },
  { href: "/projects/ABC/admin/surveys/questions", icon: ListChecks, tk: "adminQuestionBank", module: "surveys" },
  { href: "/projects/ABC/admin/surveys/analytics", icon: PieChart, tk: "adminSurveyAnalytics", module: "surveys" },
  { href: "/projects/ABC/admin/support", icon: Headphones, tk: "adminSupport", module: "support" },
  { href: "/projects/ABC/admin/audit-log", icon: Clock, tk: "adminAuditLog", module: "audit" },
  { href: "/projects/ABC/admin/crm", icon: Users, tk: "adminCrm", module: "crm" },
  { href: "/projects/ABC/admin/research", icon: FlaskConical, tk: "adminResearchLab", module: "research" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sessionUser = session?.user as { id: string; role: string } | undefined
  const staffRole = sessionUser?.role
  const isAdmin = isPlatformStaffRole(staffRole)

  const visibleLinks = adminLinks.filter((link) => {
    if (link.superAdminOnly && !isSuperAdminRole(staffRole)) return false
    return canAccessAdminModule(staffRole, link.module)
  })

  // Auto sign-out after a period of inactivity (no mouse/keyboard/scroll activity)
  const resetIdleTimer = useCallback(() => {
    if (!isAdmin) return
    const timeout = window.setTimeout(() => {
      signOut({ callbackUrl: platformLoginUrl() })
    }, IDLE_TIMEOUT_MS)
    return () => window.clearTimeout(timeout)
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    const events: (keyof WindowEventMap)[] = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"]
    let cleanup: (() => void) | undefined

    const setup = () => {
      cleanup = resetIdleTimer()
    }
    setup()

    const handleActivity = () => {
      cleanup?.()
      cleanup = resetIdleTimer()
    }

    events.forEach((ev) => window.addEventListener(ev, handleActivity))
    return () => {
      cleanup?.()
      events.forEach((ev) => window.removeEventListener(ev, handleActivity))
    }
  }, [isAdmin, resetIdleTimer])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-700 mb-2">{t("adminAccessRequired")}</h2>
          <p className="text-surface-500">{t("adminAccessOnly")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className={cn(
        "fixed lg:sticky top-16 lg:top-16 z-40 w-64 h-[calc(100vh-4rem)] bg-white border-l border-surface-200 overflow-y-auto transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">{t("adminPanel")}</p>
              <p className="text-sm text-surface-600">{t("adminPlatform")}</p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => signOut({ callbackUrl: platformLoginUrl() })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
                aria-label={t("adminLogout")}
                title={t("adminLogout")}
              >
                <LogOut className="w-4 h-4" />
                {t("adminLogout")}
              </button>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== "/projects/ABC/admin" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-amber-50 text-amber-700" : "text-surface-600 hover:bg-surface-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {t(link.tk)}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-16 z-30 bg-white border-b px-4 py-2 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-surface-500 hover:bg-surface-100 rounded-lg">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => signOut({ callbackUrl: platformLoginUrl() })}
              className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
              aria-label={t("adminLogout")}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
