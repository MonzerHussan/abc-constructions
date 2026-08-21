"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Users,
  ClipboardList,
  Star,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Brain,
  Plus,
  Target,
  Activity,
} from "lucide-react"
import AdminSurveyShell, { ADMIN_ACTION_BTN } from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import type { TranslationKey } from "@/lib/translations"

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
  const { t } = useLanguage()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    fetch("/api/research/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setLoadFailed(true)
        setLoading(false)
      })
  }, [])

  const statCards: { labelKey: TranslationKey; value: string | number; icon: typeof Target; color: string }[] =
    data
      ? [
          { labelKey: "researchStatTotalCampaigns", value: data.totalCampaigns, icon: Target, color: "bg-info-500" },
          { labelKey: "researchStatActiveCampaigns", value: data.activeCampaigns, icon: Activity, color: "bg-success-500" },
          { labelKey: "researchStatParticipants", value: data.totalParticipants, icon: Users, color: "bg-flagship-500" },
          { labelKey: "researchStatResponses", value: data.totalResponses, icon: ClipboardList, color: "bg-flagship-500" },
          { labelKey: "researchStatFoundingMembers", value: data.totalFoundingMembers, icon: Star, color: "bg-warning-500" },
          { labelKey: "researchStatFeatureRequests", value: data.totalFeatureRequests, icon: Lightbulb, color: "bg-amber-500" },
          { labelKey: "researchStatFeedback", value: data.totalFeedback, icon: MessageSquare, color: "bg-danger-500" },
          {
            labelKey: "researchStatNps",
            value: data.npsScore !== null ? `${data.npsScore}` : "--",
            icon: TrendingUp,
            color: "bg-teal-500",
          },
        ]
      : []

  const navCards: {
    href: string
    titleKey: TranslationKey
    descKey: TranslationKey
    icon: typeof Target
    color: string
  }[] = [
    {
      href: "/projects/ABC/admin/research/campaigns",
      titleKey: "researchNavCampaignsTitle",
      descKey: "researchNavCampaignsDesc",
      icon: Target,
      color: "text-info-600",
    },
    {
      href: "/projects/ABC/admin/research/participants",
      titleKey: "researchNavParticipantsTitle",
      descKey: "researchNavParticipantsDesc",
      icon: Users,
      color: "text-flagship-600",
    },
    {
      href: "/projects/ABC/admin/research/founding-members",
      titleKey: "researchNavFoundingMembersTitle",
      descKey: "researchNavFoundingMembersDesc",
      icon: Star,
      color: "text-warning-600",
    },
    {
      href: "/projects/ABC/admin/research/feature-requests",
      titleKey: "researchNavFeatureRequestsTitle",
      descKey: "researchNavFeatureRequestsDesc",
      icon: Lightbulb,
      color: "text-amber-600",
    },
    {
      href: "/projects/ABC/admin/research/feedback",
      titleKey: "researchNavFeedbackTitle",
      descKey: "researchNavFeedbackDesc",
      icon: MessageSquare,
      color: "text-danger-600",
    },
    {
      href: "/projects/ABC/admin/research/analytics",
      titleKey: "researchNavAnalyticsTitle",
      descKey: "researchNavAnalyticsDesc",
      icon: BarChart3,
      color: "text-success-600",
    },
    {
      href: "/projects/ABC/admin/research/ai-insights",
      titleKey: "researchNavAiInsightsTitle",
      descKey: "researchNavAiInsightsDesc",
      icon: Brain,
      color: "text-flagship-600",
    },
  ]

  return (
    <AdminSurveyShell
      title={t("researchDashboardTitle")}
      subtitle={t("researchDashboardSubtitle")}
      loading={loading}
      actions={
        <Link href="/projects/ABC/admin/research/campaigns/new" className={ADMIN_ACTION_BTN}>
          <Plus size={16} /> {t("researchNewCampaign")}
        </Link>
      }
    >
      {loadFailed || !data ? (
        <div className="text-center text-danger-500 py-8">{t("researchLoadFailed")}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.labelKey} className="bg-white border rounded-xl p-5 flex items-center gap-4">
                  <div className={`${card.color} p-3 rounded-lg text-white`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-surface-500 text-sm">{t(card.labelKey)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navCards.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white border rounded-xl p-6 hover:shadow-md transition"
                >
                  <Icon className={`${item.color} mb-3`} size={32} />
                  <h3 className="font-bold text-lg mb-2">{t(item.titleKey)}</h3>
                  <p className="text-surface-500 text-sm">{t(item.descKey)}</p>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </AdminSurveyShell>
  )
}
