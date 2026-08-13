"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, Target, CalendarCheck, FileText, Plus, TrendingUp, Activity } from "lucide-react"

interface CrmStats {
  totalLeads: number
  totalContacts: number
  totalOpportunities: number
  totalActivities: number
  openTasks: number
  upcomingMeetings: number
}

export default function AdminCrmPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<CrmStats>({ totalLeads: 0, totalContacts: 0, totalOpportunities: 0, totalActivities: 0, openTasks: 0, upcomingMeetings: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC/auth/login"); return }
    Promise.all([
      fetch("/api/crm/leads?limit=1").then(r => r.json()),
      fetch("/api/crm/contacts?limit=1").then(r => r.json()),
      fetch("/api/crm/opportunities?limit=1").then(r => r.json()),
      fetch("/api/crm/activities?limit=1").then(r => r.json()),
      fetch("/api/crm/tasks?status=IN_PROGRESS&limit=1").then(r => r.json()),
      fetch("/api/crm/meetings?limit=1").then(r => r.json()),
    ]).then(([leads, contacts, opportunities, activities, tasks, meetings]) => {
      setStats({
        totalLeads: leads.total ?? 0,
        totalContacts: contacts.total ?? 0,
        totalOpportunities: opportunities.total ?? 0,
        totalActivities: activities.total ?? 0,
        openTasks: tasks.total ?? 0,
        upcomingMeetings: meetings.total ?? 0,
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [session, router])

  if (loading) return <div className="p-8 text-center text-surface-500">جاري التحميل...</div>

  const cards = [
    { label: "إجمالي العملاء المحتملين", value: stats.totalLeads, icon: Users, color: "bg-info-500", href: "/projects/ABC/admin/crm/leads" },
    { label: "جهات الاتصال", value: stats.totalContacts, icon: Users, color: "bg-success-500", href: "/projects/ABC/admin/crm/contacts" },
    { label: "الفرص", value: stats.totalOpportunities, icon: Target, color: "bg-flagship-500", href: "/projects/ABC/admin/crm/opportunities" },
    { label: "النشاطات", value: stats.totalActivities, icon: Activity, color: "bg-flagship-500", href: "/projects/ABC/admin/crm/activities" },
    { label: "المهام المفتوحة", value: stats.openTasks, icon: CalendarCheck, color: "bg-amber-500", href: "/projects/ABC/admin/crm/tasks" },
    { label: "الاجتماعات القادمة", value: stats.upcomingMeetings, icon: TrendingUp, color: "bg-teal-500", href: "/projects/ABC/admin/crm/meetings" },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">CRM</h1>
          <p className="text-surface-500 mt-1">إدارة العلاقات مع العملاء</p>
        </div>
        <Link href="/projects/ABC/admin/crm/leads/new" className="flex items-center gap-2 bg-info-600 text-white px-4 py-2 rounded-lg hover:bg-info-700">
          <Plus size={20} /> عميل محتمل جديد
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="bg-white border rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition">
            <div className={`${card.color} p-3 rounded-lg text-white`}><card.icon size={24} /></div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-surface-500 text-sm">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/projects/ABC/admin/crm/leads" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <Users className="text-info-600 mb-3" size={32} />
          <h3 className="font-bold text-lg mb-2">العملاء المحتملين</h3>
          <p className="text-surface-500 text-sm">إدارة ومتابعة العملاء المحتملين وتحويلهم إلى جهات اتصال</p>
        </Link>
        <Link href="/projects/ABC/admin/crm/contacts" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <Users className="text-success-600 mb-3" size={32} />
          <h3 className="font-bold text-lg mb-2">جهات الاتصال</h3>
          <p className="text-surface-500 text-sm">قاعدة بيانات جهات الاتصال والعملاء</p>
        </Link>
        <Link href="/projects/ABC/admin/crm/opportunities" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <Target className="text-flagship-600 mb-3" size={32} />
          <h3 className="font-bold text-lg mb-2">الفرص</h3>
          <p className="text-surface-500 text-sm">تتبع صفقات وفرص البيع عبر مراحل التقدم</p>
        </Link>
      </div>
    </div>
  )
}
