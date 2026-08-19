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
  ClipboardList, ListChecks, PieChart,
} from "lucide-react"
import { cn } from "@/lib/utils"

const IDLE_TIMEOUT_MS = (Number(process.env.NEXT_PUBLIC_ADMIN_IDLE_TIMEOUT_MINUTES) || 30) * 60 * 1000

const adminLinks = [
  { href: "/projects/ABC/admin", icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard" },
  { href: "/projects/ABC/admin/users", icon: Users, label: "المستخدمين", labelEn: "Users" },
  { href: "/projects/ABC/admin/organizations", icon: Building2, label: "المؤسسات", labelEn: "Organizations" },
  { href: "/projects/ABC/admin/verifications", icon: ShieldCheck, label: "التوثيق", labelEn: "Verifications" },
  { href: "/projects/ABC/admin/tenders", icon: FileText, label: "المناقصات", labelEn: "Tenders" },
  { href: "/projects/ABC/admin/procurement", icon: ShoppingCart, label: "المشتريات", labelEn: "Procurement" },
  { href: "/projects/ABC/admin/finance", icon: DollarSign, label: "المالية", labelEn: "Finance" },
{ href: "/projects/ABC/admin/content", icon: Newspaper, label: "المحتوى", labelEn: "Content" },
  { href: "/projects/ABC/admin/homepage", icon: LayoutDashboard, label: "Homepage" },
  { href: "/projects/ABC/admin/surveys", icon: ClipboardList, label: "Survey Manager" },
  { href: "/projects/ABC/admin/surveys/account-types", icon: ListChecks, label: "Account Subcategories" },
  { href: "/projects/ABC/admin/surveys/questions", icon: ListChecks, label: "Question Bank" },
  { href: "/projects/ABC/admin/surveys/analytics", icon: PieChart, label: "Survey Analytics" },
  { href: "/projects/ABC/admin/support", icon: Headphones, label: "خدمة العملاء", labelEn: "Support" },
  { href: "/projects/ABC/admin/audit-log", icon: Clock, label: "سجل التدقيق", labelEn: "Audit Log" },
  { href: "/projects/ABC/admin/crm", icon: Users, label: "CRM", labelEn: "CRM" },
  { href: "/projects/ABC/admin/research", icon: FlaskConical, label: "مختبر الأبحاث", labelEn: "Research Lab" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sessionUser = session?.user as { id: string; role: string } | undefined
  const isAdmin = sessionUser && (sessionUser.role === "ADMIN" || sessionUser.role === "SUPER_ADMIN")

  // Auto sign-out after a period of inactivity (no mouse/keyboard/scroll activity)
  const resetIdleTimer = useCallback(() => {
    if (!isAdmin) return
    const timeout = window.setTimeout(() => {
      signOut({ callbackUrl: "/projects/ABC/auth/login" })
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
          <h2 className="text-xl font-bold text-surface-700 mb-2">صلاحية وصول مطلوبة</h2>
          <p className="text-surface-500">هذه الصفحة مخصصة لإدارة المنصة فقط</p>
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
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">الإدارة</p>
              <p className="text-sm text-surface-600">منصة ABC</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/projects/ABC/auth/login" })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
              aria-label="تسجيل الخروج"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {adminLinks.map((link) => {
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
                {link.label}
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
          <button
            onClick={() => signOut({ callbackUrl: "/projects/ABC/auth/login" })}
            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
