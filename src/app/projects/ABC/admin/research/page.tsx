"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { BarChart3, Users, ClipboardList, Star, Lightbulb, MessageSquare, TrendingUp, Brain, Plus, Target, Activity } from "lucide-react"

interface AnalyticsData {
  totalCampaigns: number
  activeCampaigns: number
  totalParticipants: number
  totalResponses: number
  totalFoundingMembers: number
  totalFeatureRequests: number
  totalFeedback: number
  totalNpsScores: number
  npsScore: number | null
}

export default function AdminResearchPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") {
      router.push("/projects/ABC?login=1")
      return
    }
    fetch("/api/research/analytics")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [session, router])

  if (loading) return <div className="p-8 text-center text-surface-500">جاري التحميل...</div>
  if (!data) return <div className="p-8 text-center text-danger-500">فشل تحميل البيانات</div>

  const cards = [
    { label: "إجمالي الحملات", value: data.totalCampaigns, icon: Target, color: "bg-info-500" },
    { label: "الحملات النشطة", value: data.activeCampaigns, icon: Activity, color: "bg-success-500" },
    { label: "المشاركون", value: data.totalParticipants, icon: Users, color: "bg-flagship-500" },
    { label: "الاستجابات", value: data.totalResponses, icon: ClipboardList, color: "bg-flagship-500" },
    { label: "الأعضاء المؤسسون", value: data.totalFoundingMembers, icon: Star, color: "bg-warning-500" },
    { label: "طلبات الميزات", value: data.totalFeatureRequests, icon: Lightbulb, color: "bg-amber-500" },
    { label: "الملاحظات", value: data.totalFeedback, icon: MessageSquare, color: "bg-danger-500" },
    { label: "NPS", value: data.npsScore !== null ? `${data.npsScore}` : "--", icon: TrendingUp, color: "bg-teal-500" },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">مختبر أبحاث ABC</h1>
          <p className="text-surface-500 mt-1">منصة أبحاث السوق وتحليل العملاء</p>
        </div>
        <Link href="/projects/ABC/admin/research/campaigns/new" className="flex items-center gap-2 bg-info-600 text-white px-4 py-2 rounded-lg hover:bg-info-700">
          <Plus size={20} /> حملة جديدة
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border rounded-xl p-5 flex items-center gap-4">
            <div className={`${card.color} p-3 rounded-lg text-white`}><card.icon size={24} /></div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-surface-500 text-sm">{card.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/projects/ABC/admin/research/campaigns" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <Target className="text-info-600 mb-3" size={32} />
          <h3 className="font-bold text-lg mb-2">إدارة الحملات</h3>
          <p className="text-surface-500 text-sm">إنشاء وإدارة حملات أبحاث السوق والاستبيانات</p>
        </Link>
        <Link href="/projects/ABC/admin/research/participants" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <Users className="text-flagship-600 mb-3" size={32} />
          <h3 className="font-bold text-lg mb-2">المشاركون</h3>
          <p className="text-surface-500 text-sm">عرض وإدارة جميع المشاركين في الأبحاث</p>
        </Link>
        <Link href="/projects/ABC/admin/research/founding-members" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <Star className="text-warning-600 mb-3" size={32} />
          <h3 className="font-bold text-lg mb-2">الأعضاء المؤسسون</h3>
          <p className="text-surface-500 text-sm">برنامج Founding Members - الأعضاء المميزين</p>
        </Link>
        <Link href="/projects/ABC/admin/research/feature-requests" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <Lightbulb className="text-amber-600 mb-3" size={32} />
          <h3 className="font-bold text-lg mb-2">طلبات الميزات</h3>
          <p className="text-surface-500 text-sm">إدارة وترتيب أولويات طلبات الميزات المقدمة</p>
        </Link>
        <Link href="/projects/ABC/admin/research/feedback" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <MessageSquare className="text-danger-600 mb-3" size={32} />
          <h3 className="font-bold text-lg mb-2">الملاحظات</h3>
          <p className="text-surface-500 text-sm">عرض ملاحظات المستخدمين وتقارير الأخطاء</p>
        </Link>
        <Link href="/projects/ABC/admin/research/analytics" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <BarChart3 className="text-success-600 mb-3" size={32} />
          <h3 className="font-bold text-lg mb-2">التحليلات</h3>
          <p className="text-surface-500 text-sm">تحليلات متقدمة وتقارير عن جميع الحملات</p>
        </Link>
        <Link href="/projects/ABC/admin/research/ai-insights" className="bg-white border rounded-xl p-6 hover:shadow-md transition">
          <Brain className="text-flagship-600 mb-3" size={32} />
          <h3 className="font-bold text-lg mb-2">تحليلات الذكاء الاصطناعي</h3>
          <p className="text-surface-500 text-sm">رؤى وتوصيات من تحليل البيانات تلقائياً</p>
        </Link>
      </div>
    </div>
  )
}
