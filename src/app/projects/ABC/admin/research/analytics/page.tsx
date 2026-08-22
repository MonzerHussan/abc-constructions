"use client"

import { useEffect, useState } from "react"
import { Target, Download, ClipboardList, Users, Activity } from "lucide-react"
import AdminSurveyShell, { ADMIN_ACTION_BTN_SECONDARY } from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import {
  RESEARCH_CAMPAIGN_STATUS_KEYS,
  RESEARCH_CAMPAIGN_TYPE_KEYS,
} from "@/lib/admin/admin-labels"

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
  const { t } = useLanguage()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [period, setPeriod] = useState("30")

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  async function fetchAnalytics() {
    setLoading(true)
    setLoadFailed(false)
    try {
      const res = await fetch(`/api/research/analytics?period=${period}`)
      if (res.ok) {
        setData(await res.json())
      } else {
        setLoadFailed(true)
      }
    } catch {
      setLoadFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const statusLabel = (status: string) => {
    const key = RESEARCH_CAMPAIGN_STATUS_KEYS[status]
    return key ? t(key) : status
  }

  const typeLabel = (type: string) => {
    const key = RESEARCH_CAMPAIGN_TYPE_KEYS[type]
    return key ? t(key) : type
  }

  const periodOptions = [
    { value: "7", labelKey: "researchAnalyticsPeriod7" as const },
    { value: "30", labelKey: "researchAnalyticsPeriod30" as const },
    { value: "90", labelKey: "researchAnalyticsPeriod90" as const },
    { value: "365", labelKey: "researchAnalyticsPeriod365" as const },
  ]

  return (
    <AdminSurveyShell
      title={t("researchAnalyticsTitle")}
      subtitle={t("researchAnalyticsSubtitle")}
      loading={loading}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-none px-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-info-500"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
          <button type="button" className={ADMIN_ACTION_BTN_SECONDARY}>
            <Download size={14} /> {t("researchAnalyticsExport")}
          </button>
        </div>
      }
    >
      {loadFailed || !data ? (
        <div className="text-center text-danger-500 py-8">{t("researchAnalyticsLoadFailed")}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-info-100 p-2 rounded-lg">
                  <Target className="text-info-600" size={20} />
                </div>
                <span className="text-sm text-surface-500">{t("researchAnalyticsStatTotalCampaigns")}</span>
              </div>
              <p className="text-3xl font-bold">{data.totalCampaigns}</p>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-success-100 p-2 rounded-lg">
                  <ClipboardList className="text-success-600" size={20} />
                </div>
                <span className="text-sm text-surface-500">{t("researchAnalyticsStatResponses")}</span>
              </div>
              <p className="text-3xl font-bold">{data.totalResponses}</p>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-flagship-100 p-2 rounded-lg">
                  <Users className="text-flagship-600" size={20} />
                </div>
                <span className="text-sm text-surface-500">{t("researchAnalyticsStatParticipants")}</span>
              </div>
              <p className="text-3xl font-bold">{data.totalParticipants}</p>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <Activity className="text-teal-600" size={20} />
                </div>
                <span className="text-sm text-surface-500">{t("researchAnalyticsStatResponseRate")}</span>
              </div>
              <p className="text-3xl font-bold">{data.averageResponseRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">{t("researchAnalyticsCampaignsByStatus")}</h2>
              <div className="space-y-3">
                {data.campaignsByStatus.length === 0 ? (
                  <p className="text-surface-500 text-sm">{t("researchAnalyticsNoData")}</p>
                ) : (
                  data.campaignsByStatus.map((item) => {
                    const total = data.campaignsByStatus.reduce((sum, s) => sum + s.count, 0)
                    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                    return (
                      <div key={item.status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{statusLabel(item.status)}</span>
                          <span>
                            {item.count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-200 rounded-full h-2">
                          <div className="bg-info-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">{t("researchAnalyticsCampaignsByType")}</h2>
              <div className="space-y-3">
                {data.campaignsByType.length === 0 ? (
                  <p className="text-surface-500 text-sm">{t("researchAnalyticsNoData")}</p>
                ) : (
                  data.campaignsByType.map((item) => {
                    const total = data.campaignsByType.reduce((sum, s) => sum + s.count, 0)
                    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                    return (
                      <div key={item.type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{typeLabel(item.type)}</span>
                          <span>
                            {item.count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-200 rounded-full h-2">
                          <div className="bg-success-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6 mb-8">
            <h2 className="font-bold text-lg mb-4">{t("researchAnalyticsTopCampaigns")}</h2>
            {data.topCampaigns.length === 0 ? (
              <p className="text-surface-500 text-sm">{t("researchAnalyticsNoData")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-50 border-b">
                    <tr>
                      <th className="text-right p-3 text-sm font-semibold text-surface-600">
                        {t("researchAnalyticsColCampaign")}
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-surface-600">
                        {t("researchAnalyticsColResponses")}
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-surface-600">
                        {t("researchAnalyticsColTarget")}
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-surface-600">
                        {t("researchAnalyticsStatResponseRate")}
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-surface-600">
                        {t("researchAnalyticsColProgressBar")}
                      </th>
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
                            <div
                              className="bg-info-600 h-2 rounded-full"
                              style={{ width: `${Math.min(c.responseRate, 100)}%` }}
                            />
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
              <h2 className="font-bold text-lg mb-4">{t("researchAnalyticsNpsTitle")}</h2>
              <div className="flex items-center gap-6">
                <div
                  className={`text-5xl font-bold ${data.npsScore >= 50 ? "text-success-600" : data.npsScore >= 0 ? "text-warning-600" : "text-danger-600"}`}
                >
                  {data.npsScore}
                </div>
                <div>
                  <p className="text-surface-600 text-sm">{t("researchAnalyticsNpsDesc")}</p>
                  <p className="text-xs text-surface-500 mt-1">
                    {data.npsScore >= 50
                      ? t("researchAnalyticsNpsExcellent")
                      : data.npsScore >= 0
                        ? t("researchAnalyticsNpsGood")
                        : t("researchAnalyticsNpsNeedsImprovement")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminSurveyShell>
  )
}
