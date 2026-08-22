"use client"

import { useEffect, useState } from "react"
import {
  Brain,
  Search,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  AlertTriangle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import { RESEARCH_AI_INSIGHT_TYPE_KEYS } from "@/lib/admin/admin-labels"

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

const TYPE_ICONS: Record<string, typeof TrendingUp> = {
  TREND: TrendingUp,
  SENTIMENT: ThumbsUp,
  PATTERN: Users,
  OPPORTUNITY: Target,
  SUGGESTION: Lightbulb,
  ALERT: AlertTriangle,
}

const TYPE_COLORS: Record<string, string> = {
  TREND: "bg-info-100 text-info-700",
  SENTIMENT: "bg-success-100 text-success-700",
  PATTERN: "bg-flagship-100 text-flagship-700",
  OPPORTUNITY: "bg-amber-100 text-amber-700",
  SUGGESTION: "bg-warning-100 text-warning-700",
  ALERT: "bg-danger-100 text-danger-700",
}

const AI_TYPE_OPTIONS = Object.keys(RESEARCH_AI_INSIGHT_TYPE_KEYS)

export default function AIInsightsPage() {
  const { t, language } = useLanguage()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [loading, setLoading] = useState(true)

  const locale = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US"

  useEffect(() => {
    fetchInsights()
  }, [search, typeFilter])

  function fetchInsights() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (typeFilter) params.set("type", typeFilter)
    fetch(`/api/research/ai-insights?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setInsights(d.insights || d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  async function markActionable(id: string, actionable: boolean) {
    await fetch(`/api/research/ai-insights/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActionable: actionable }),
    })
    fetchInsights()
  }

  const typeLabel = (type: string) => {
    const key = RESEARCH_AI_INSIGHT_TYPE_KEYS[type]
    return key ? t(key) : type
  }

  return (
    <AdminSurveyShell
      title={t("researchNavAiInsightsTitle")}
      subtitle={t("researchNavAiInsightsDesc")}
      loading={loading}
    >
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute end-3 top-2.5 text-surface-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("verificationSearchPlaceholder")}
              className="w-full pe-10 ps-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-info-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500"
          >
            <option value="">{t("researchCampaignsAllTypes")}</option>
            {AI_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!loading && insights.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <Brain className="mx-auto mb-3" size={48} />
          <p>{t("researchAnalyticsNoData")}</p>
          <p className="text-sm mt-1">{t("researchNavAiInsightsDesc")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const TypeIcon = TYPE_ICONS[insight.type] || TrendingUp
            const color = TYPE_COLORS[insight.type] || TYPE_COLORS.TREND
            return (
              <div key={insight.id} className="bg-white border rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg ${color.split(" ")[0]}`}>
                    <TypeIcon size={22} className={color.split(" ")[1]} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                        {typeLabel(insight.type)}
                      </span>
                      {insight.isActionable && (
                        <span className="px-2 py-0.5 bg-success-100 text-success-700 rounded text-xs">
                          {t("earlyAccess")}
                        </span>
                      )}
                      <span className="text-xs text-surface-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(insight.createdAt).toLocaleDateString(locale)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{insight.title}</h3>
                    <p className="text-surface-600 text-sm mb-3">{insight.summary}</p>

                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div className="bg-info-50 border border-info-100 rounded-lg p-3 mb-3">
                        <p className="text-sm font-semibold text-info-800 mb-2">{t("recommendations")}:</p>
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

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4 text-xs text-surface-500">
                        <span>
                          {t("insight")}: {insight.confidence}%
                        </span>
                        {insight.relatedCampaign && (
                          <span>
                            {t("campaign")}: <span className="text-info-600">{insight.relatedCampaign}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => markActionable(insight.id, !insight.isActionable)}
                          className={`p-1.5 rounded-lg ${insight.isActionable ? "text-success-600 hover:bg-success-50" : "text-surface-400 hover:bg-surface-100"}`}
                        >
                          {insight.isActionable ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
                        </button>
                        <button type="button" className="p-1.5 text-surface-400 hover:bg-surface-100 rounded-lg">
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminSurveyShell>
  )
}
