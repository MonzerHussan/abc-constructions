"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { BarChart3, TrendingUp, Users, ClipboardList, Target, Download, Calendar, Filter, PieChart, Activity } from "lucide-react"

interface AnalyticsData {
  campaignsByStatus: { status: string; count: number }[]
  campaignsByType: { type: string; count: number }[]
  responsesOverTime: { date: string; count: number }[]
  topCampaigns: { id: string; title: string; responseRate: number; responses: number; target: number }[]
  participantGrowth: { date: string; count: number }[]
  totalCampaigns: number
  totalResponses: number
  totalParticipants: number
  averageResponseRate: number
  npsScore: number | null
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/auth/login"); return }
    fetchAnalytics()
  }, [session, router, period])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const res = await fetch(`/api/research/analytics?period=${period}`)
      if (res.ok) setData(await res.json())
    } catch (e) { /* ignore */ } finally { setLoading(false) }
  }

  if (loading) return <div className="p-8 text-center text-surface-500">جاري التحميل...</div>
  if (!data) return <div className="p-8 text-center text-danger-500">فشل تحميل التحليلات</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">التحليلات</h1>
          <p className="text-surface-500 mt-1">تحليلات متقدمة وتقارير عن جميع الحملات</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-info-500">
            <option value="7">آخر 7 أيام</option>
            <option value="30">آخر 30 يوم</option>
            <option value="90">آخر 3 أشهر</option>
            <option value="365">آخر سنة</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-surface-50 text-sm"><Download size={16} /> تصدير</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-info-100 p-2 rounded-lg"><Target className="text-info-600" size={20} /></div>
            <span className="text-sm text-surface-500">إجمالي الحملات</span>
          </div>
          <p className="text-3xl font-bold">{data.totalCampaigns}</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-success-100 p-2 rounded-lg"><ClipboardList className="text-success-600" size={20} /></div>
            <span className="text-sm text-surface-500">إجمالي الردود</span>
          </div>
          <p className="text-3xl font-bold">{data.totalResponses}</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-flagship-100 p-2 rounded-lg"><Users className="text-flagship-600" size={20} /></div>
            <span className="text-sm text-surface-500">المشاركون</span>
          </div>
          <p className="text-3xl font-bold">{data.totalParticipants}</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-100 p-2 rounded-lg"><Activity className="text-teal-600" size={20} /></div>
            <span className="text-sm text-surface-500">معدل الاستجابة</span>
          </div>
          <p className="text-3xl font-bold">{data.averageResponseRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4">الحملات حسب الحالة</h2>
          <div className="space-y-3">
            {data.campaignsByStatus.length === 0 ? (
              <p className="text-surface-500 text-sm">لا توجد بيانات</p>
            ) : (
              data.campaignsByStatus.map((item) => {
                const total = data.campaignsByStatus.reduce((sum, s) => sum + s.count, 0)
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.status === "DRAFT" ? "مسودة" : item.status === "ACTIVE" ? "نشطة" : item.status === "PAUSED" ? "موقفة" : item.status === "COMPLETED" ? "مكتملة" : "ملغية"}</span>
                      <span>{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-surface-200 rounded-full h-2">
                      <div className="bg-info-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4">الحملات حسب النوع</h2>
          <div className="space-y-3">
            {data.campaignsByType.length === 0 ? (
              <p className="text-surface-500 text-sm">لا توجد بيانات</p>
            ) : (
              data.campaignsByType.map((item) => {
                const total = data.campaignsByType.reduce((sum, s) => sum + s.count, 0)
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                return (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.type === "SURVEY" ? "استبيان" : item.type === "INTERVIEW" ? "مقابلة" : item.type === "FOCUS_GROUP" ? "مجموعة نقاش" : item.type}</span>
                      <span>{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-surface-200 rounded-full h-2">
                      <div className="bg-success-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 mb-8">
        <h2 className="font-bold text-lg mb-4">أفضل الحملات أداءً</h2>
        {data.topCampaigns.length === 0 ? (
          <p className="text-surface-500 text-sm">لا توجد بيانات</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b">
                <tr>
                  <th className="text-right p-3 text-sm font-semibold text-surface-600">الحملة</th>
                  <th className="text-right p-3 text-sm font-semibold text-surface-600">الردود</th>
                  <th className="text-right p-3 text-sm font-semibold text-surface-600">المستهدف</th>
                  <th className="text-right p-3 text-sm font-semibold text-surface-600">معدل الاستجابة</th>
                  <th className="text-right p-3 text-sm font-semibold text-surface-600">الشريط التقدمي</th>
                </tr>
              </thead>
              <tbody>
                {data.topCampaigns.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="p-3 font-medium text-sm">{c.title}</td>
                    <td className="p-3 text-sm">{c.responses}</td>
                    <td className="p-3 text-sm">{c.target}</td>
                    <td className="p-3 text-sm font-semibold text-success-600">{c.responseRate}%</td>
                    <td className="p-3">
                      <div className="w-32 bg-surface-200 rounded-full h-2">
                        <div className="bg-info-600 h-2 rounded-full" style={{ width: `${Math.min(c.responseRate, 100)}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.npsScore !== null && (
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4">صافي نقاط المروجين (NPS)</h2>
          <div className="flex items-center gap-6">
            <div className={`text-5xl font-bold ${data.npsScore >= 50 ? "text-success-600" : data.npsScore >= 0 ? "text-warning-600" : "text-danger-600"}`}>{data.npsScore}</div>
            <div>
              <p className="text-surface-600 text-sm">يقيس NPS ولاء العملاء واستعدادهم لتوصية الآخرين بالمنتج</p>
              <p className="text-xs text-surface-500 mt-1">
                {data.npsScore >= 50 ? "أداء ممتاز" : data.npsScore >= 0 ? "أداء جيد" : "يحتاج تحسين"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
