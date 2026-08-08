"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard, Users, Building2, ShieldCheck, FileText,
  DollarSign, Newspaper, Headphones, Clock, Menu, X,
  Briefcase, ShoppingCart, Settings, BarChart3, GraduationCap,
  TreePine, Megaphone, Scale, FlaskConical, Receipt,
  ClipboardList, PieChart,
} from "lucide-react"
import { cn } from "@/lib/utils"

const adminLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "المستخدمين", labelEn: "Users" },
  { href: "/admin/organizations", icon: Building2, label: "المؤسسات", labelEn: "Organizations" },
  { href: "/admin/verifications", icon: ShieldCheck, label: "التوثيق", labelEn: "Verifications" },
  { href: "/admin/tenders", icon: FileText, label: "المناقصات", labelEn: "Tenders" },
  { href: "/admin/procurement", icon: ShoppingCart, label: "المشتريات", labelEn: "Procurement" },
  { href: "/admin/finance", icon: DollarSign, label: "المالية", labelEn: "Finance" },
  { href: "/admin/content", icon: Newspaper, label: "المحتوى", labelEn: "Content" },
  { href: "/admin/support", icon: Headphones, label: "خدمة العملاء", labelEn: "Support" },
  { href: "/admin/audit-log", icon: Clock, label: "سجل التدقيق", labelEn: "Audit Log" },
  { href: "/admin/crm", icon: Users, label: "CRM", labelEn: "CRM" },
  { href: "/admin/research", icon: FlaskConical, label: "مختبر الأبحاث", labelEn: "Research Lab" },
  { href: "/admin/surveys", icon: ClipboardList, label: "اختبار الإعداد", labelEn: "Surveys" },
  { href: "/admin/surveys/analytics", icon: PieChart, label: "تحليلات اختبار الإعداد", labelEn: "Survey Analytics" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sessionUser = session?.user as { id: string; role: string } | undefined
  const isAdmin = sessionUser && (sessionUser.role === "ADMIN" || sessionUser.role === "SUPER_ADMIN")

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
          <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">الإدارة</p>
          <p className="text-sm text-surface-600">منصة ABC</p>
        </div>
        <nav className="p-3 space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
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
        <div className="lg:hidden sticky top-16 z-30 bg-white border-b px-4 py-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-surface-500 hover:bg-surface-100 rounded-lg">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
