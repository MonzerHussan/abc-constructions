"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Brain, Search, Filter, TrendingUp, Users, Target, Lightbulb, AlertTriangle, Clock, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"

interface AIInsight {
  id: string
  title: string
  summary: string
  type: string
  confidence: number
  relatedCampaign: string
  relatedCampaignId: string
  createdAt: string
  isActionable: boolean
  recommendations: string[]
}

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  TREND: { label: "اتجاه", icon: TrendingUp, color: "bg-info-100 text-info-700" },
  SENTIMENT: { label: "تحليل مشاعر", icon: ThumbsUp, color: "bg-success-100 text-success-700" },
  PATTERN: { label: "نمط سلوكي", icon: Users, color: "bg-flagship-100 text-flagship-700" },
  OPPORTUNITY: { label: "فرصة", icon: Target, color: "bg-amber-100 text-amber-700" },
  SUGGESTION: { label: "اقتراح", icon: Lightbulb, color: "bg-warning-100 text-warning-700" },
  ALERT: { label: "تنبيه", icon: AlertTriangle, color: "bg-danger-100 text-danger-700" },
}

export default function AIInsightsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC?login=1"); return }
    fetchInsights()
  }, [session, router, search, typeFilter])

  function fetchInsights() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (typeFilter) params.set("type", typeFilter)
    fetch(`/api/research/ai-insights?${params}`)
      .then(r => r.json())
      .then(d => { setInsights(d.insights || d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  async function markActionable(id: string, actionable: boolean) {
    await fetch(`/api/research/ai-insights/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActionable: actionable }) })
    fetchInsights()
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">تحليلات الذكاء الاصطناعي</h1>
          <Brain className="text-flagship-600" size={24} />
        </div>
        <p className="text-surface-500 mt-1">رؤى وتوصيات من تحليل البيانات تلقائياً باستخدام الذكاء الاصطناعي</p>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-2.5 text-surface-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في الرؤى..." className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-info-500" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500">
            <option value="">جميع الأنواع</option>
            <option value="TREND">اتجاه</option>
            <option value="SENTIMENT">تحليل مشاعر</option>
            <option value="PATTERN">نمط سلوكي</option>
            <option value="OPPORTUNITY">فرصة</option>
            <option value="SUGGESTION">اقتراح</option>
            <option value="ALERT">تنبيه</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">جاري التحميل...</div>
      ) : insights.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <Brain className="mx-auto mb-3" size={48} />
          <p>لا توجد رؤى حالياً</p>
          <p className="text-sm mt-1">ستظهر الرؤى والتوصيات هنا بعد تحليل بيانات الحملات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const config = typeConfig[insight.type] || typeConfig.TREND
            const TypeIcon = config.icon
            return (
              <div key={insight.id} className="bg-white border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg ${config.color.split(" ")[0]}`}>
                    <TypeIcon size={22} className={config.color.split(" ")[1]} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>
                      {insight.isActionable && <span className="px-2 py-0.5 bg-success-100 text-success-700 rounded text-xs">قابل للتنفيذ</span>}
                      <span className="text-xs text-surface-400 flex items-center gap-1"><Clock size={12} /> {new Date(insight.createdAt).toLocaleDateString("ar-SA")}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{insight.title}</h3>
                    <p className="text-surface-600 text-sm mb-3">{insight.summary}</p>

                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div className="bg-info-50 border border-info-100 rounded-lg p-3 mb-3">
                        <p className="text-sm font-semibold text-info-800 mb-2">التوصيات:</p>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-info-700 flex items-start gap-2">
                              <Lightbulb size={14} className="mt-0.5 shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-surface-500">
                        <span>مستوى الثقة: {insight.confidence}%</span>
                        {insight.relatedCampaign && <span>الحملة: <span className="text-info-600">{insight.relatedCampaign}</span></span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => markActionable(insight.id, !insight.isActionable)} className={`p-1.5 rounded-lg ${insight.isActionable ? "text-success-600 hover:bg-success-50" : "text-surface-400 hover:bg-surface-100"}`}>
                          {insight.isActionable ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
                        </button>
                        <button className="p-1.5 text-surface-400 hover:bg-surface-100 rounded-lg"><MessageSquare size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
