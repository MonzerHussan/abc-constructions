"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users, Building2, ShieldCheck, FileText, DollarSign,
  Newspaper, Headphones, Clock, Briefcase, ShoppingCart,
  BarChart3, Megaphone, Scale, TreePine, GraduationCap,
  Settings, Activity,
} from "lucide-react"

const departments = [
  {
    title: "إدارة المستخدمين",
    titleEn: "User Administration",
    icon: Users,
    href: "/projects/ABC/admin/users",
    color: "bg-info-50 text-info-600",
    desc: "إدارة الحسابات والتوثيق والامتثال",
  },
  {
    title: "إدارة المؤسسات",
    titleEn: "Organization Management",
    icon: Building2,
    href: "/projects/ABC/admin/organizations",
    color: "bg-flagship-50 text-flagship-600",
    desc: "مراجعة واعتماد الشركات والمقاولين",
  },
  {
    title: "التوثيق والتحقق",
    titleEn: "Verification & KYC",
    icon: ShieldCheck,
    href: "/projects/ABC/admin/verifications",
    color: "bg-success-50 text-success-600",
    desc: "مراجعة طلبات التوثيق والمستندات",
  },
  {
    title: "إدارة المناقصات",
    titleEn: "Tender Management",
    icon: FileText,
    href: "/projects/ABC/admin/tenders",
    color: "bg-amber-50 text-amber-600",
    desc: "مراجعة ومكافحة المناقصات الوهمية",
  },
  {
    title: "الإدارة المالية",
    titleEn: "Financial Management",
    icon: DollarSign,
    href: "/projects/ABC/admin/finance",
    color: "bg-emerald-50 text-emerald-600",
    desc: "الاشتراكات والفواتير والعمولات",
  },
  {
    title: "إدارة المحتوى",
    titleEn: "Content Management",
    icon: Newspaper,
    href: "/projects/ABC/admin/content",
    color: "bg-flagship-50 text-flagship-600",
    desc: "الأخبار والمقالات والأدلة الفنية",
  },
  {
    title: "خدمة العملاء",
    titleEn: "Customer Service",
    icon: Headphones,
    href: "/projects/ABC/admin/support",
    color: "bg-danger-50 text-danger-600",
    desc: "الدعم الفني والشكاوى والتذاكر",
  },
  {
    title: "سجل التدقيق",
    titleEn: "Audit Log",
    icon: Clock,
    href: "/projects/ABC/admin/audit-log",
    color: "bg-surface-50 text-surface-600",
    desc: "سجل العمليات الحساسة غير القابل للتعديل",
  },
  {
    title: "إدارة المشتريات",
    titleEn: "Procurement Management",
    icon: ShoppingCart,
    href: "/projects/ABC/admin/procurement",
    color: "bg-info-50 text-info-600",
    desc: "طلبات الشراء، عروض الأسعار، أوامر الشراء والفواتير",
  },
  {
    title: "إدارة المقاولين",
    titleEn: "Contractor Management",
    icon: Briefcase,
    href: "/projects/ABC/admin/organizations",
    color: "bg-amber-50 text-amber-600",
    desc: "تصنيف وتقييم المقاولين",
  },
  {
    title: "التحليلات والتقارير",
    titleEn: "Analytics & BI",
    icon: BarChart3,
    href: "#",
    color: "bg-teal-50 text-teal-600",
    desc: "مؤشرات الأداء وتقارير السوق",
  },
  {
    title: "الأمن والامتثال",
    titleEn: "Security & Compliance",
    icon: Scale,
    href: "#",
    color: "bg-danger-50 text-danger-600",
    desc: "مكافحة الاحتيال والأمان السيبراني",
  },
  {
    title: "إدارة الإعلانات",
    titleEn: "Advertising",
    icon: Megaphone,
    href: "#",
    color: "bg-danger-50 text-danger-600",
    desc: "المساحات الإعلانية والحملات",
  },
  {
    title: "إدارة الجودة",
    titleEn: "Quality Management",
    icon: Activity,
    href: "#",
    color: "bg-warning-50 text-warning-600",
    desc: "مراجعة جودة البيانات والحسابات",
  },
  {
    title: "التسويق",
    titleEn: "Marketing",
    icon: Megaphone,
    href: "#",
    color: "bg-flagship-50 text-flagship-600",
    desc: "التسويق الرقمي والتواصل الاجتماعي",
  },
  {
    title: "الإدارة القانونية",
    titleEn: "Legal",
    icon: Scale,
    href: "#",
    color: "bg-surface-50 text-surface-600",
    desc: "العقود وشروط الاستخدام والنزاعات",
  },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/verifications").then(r => r.ok ? r.json() : []),
      fetch("/api/organizations").then(r => r.ok ? r.json() : []),
    ]).then(([verifications, orgs]) => {
      setStats({
        pendingVerifications: verifications.filter((v: any) => v.status === "PENDING").length,
        totalVerifications: verifications.length,
        organizations: orgs.length,
      })
    })
  }, [])

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">لوحة إدارة المنصة</h1>
        <p className="text-surface-500 mt-1">Platform Administration Dashboard</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-bold text-surface-900">{stats.pendingVerifications ?? "—"}</p>
          <p className="text-sm text-surface-500">طلبات توثيق معلقة</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-bold text-surface-900">{stats.totalVerifications ?? "—"}</p>
          <p className="text-sm text-surface-500">إجمالي طلبات التوثيق</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-bold text-surface-900">{stats.organizations ?? "—"}</p>
          <p className="text-sm text-surface-500">المؤسسات المسجلة</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-2xl font-bold text-surface-900">—</p>
          <p className="text-sm text-surface-500">المستخدمين النشطين</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {departments.map((dept) => {
          const Icon = dept.icon
          return (
            <Link
              key={dept.title}
              href={dept.href}
              className="flex items-start gap-4 p-5 bg-white border rounded-xl hover:shadow-md hover:border-amber-200 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dept.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-surface-900 text-sm">{dept.title}</h3>
                <p className="text-xs text-surface-400 mt-0.5">{dept.titleEn}</p>
                <p className="text-xs text-surface-500 mt-1">{dept.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
