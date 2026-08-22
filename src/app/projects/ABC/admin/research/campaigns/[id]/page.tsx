"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Edit,
  Trash2,
  Users,
  ClipboardList,
  Plus,
  Calendar,
  CheckCircle,
  Pause,
  Play,
} from "lucide-react"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import {
  RESEARCH_CAMPAIGN_STATUS_KEYS,
  RESEARCH_CAMPAIGN_TYPE_KEYS,
  RESEARCH_SURVEY_STATUS_KEYS,
} from "@/lib/admin/admin-labels"

interface Campaign {
  id: string
  title: string
  description: string
  type: string
  status: string
  targetParticipants: number
  currentParticipants: number
  startDate: string
  endDate: string
  instructions: string
  reward: string
  createdAt: string
  surveys: { id: string; title: string; responseCount: number; status: string }[]
}

function replaceParams(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{{${key}}}`, String(value)),
    template,
  )
}

export default function CampaignDetailPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  const locale = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US"

  useEffect(() => {
    fetchCampaign()
  }, [params.id])

  async function fetchCampaign() {
    try {
      const res = await fetch(`/api/research/campaigns/${params.id}`)
      const d = await res.json()
      setCampaign(d)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(status: string) {
    await fetch(`/api/research/campaigns/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchCampaign()
  }

  async function deleteCampaign() {
    if (!confirm(t("researchCampaignDeleteConfirm"))) return
    await fetch(`/api/research/campaigns/${params.id}`, { method: "DELETE" })
    router.push("/projects/ABC/admin/research/campaigns")
  }

  const statusLabel = (status: string) => {
    const key = RESEARCH_CAMPAIGN_STATUS_KEYS[status]
    return key ? t(key) : status
  }

  const typeLabel = (type: string) => {
    const key = RESEARCH_CAMPAIGN_TYPE_KEYS[type]
    return key ? t(key) : type
  }

  const surveyStatusLabel = (status: string) => {
    const key = RESEARCH_SURVEY_STATUS_KEYS[status]
    return key ? t(key) : status
  }

  if (!loading && !campaign) {
    return (
      <AdminSurveyShell title={t("researchCampaignsTitle")} subtitle={t("researchCampaignsSubtitle")}>
        <div className="text-center text-danger-500 py-8">{t("researchCampaignDetailNotFound")}</div>
      </AdminSurveyShell>
    )
  }

  const progress =
    campaign && campaign.targetParticipants > 0
      ? Math.round((campaign.currentParticipants / campaign.targetParticipants) * 100)
      : 0

  return (
    <AdminSurveyShell
      title={campaign?.title ?? t("researchCampaignsTitle")}
      subtitle={campaign ? statusLabel(campaign.status) : undefined}
      loading={loading}
      actions={
        campaign ? (
          <Link href="/projects/ABC/admin/research/campaigns" className="text-surface-500 hover:text-surface-700">
            <ArrowRight size={20} />
          </Link>
        ) : null
      }
    >
      {campaign && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">{t("researchCampaignDetailInfo")}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-surface-500">{t("researchCampaignDetailFieldType")}:</span>{" "}
                  <span className="font-semibold">{typeLabel(campaign.type)}</span>
                </div>
                <div>
                  <span className="text-surface-500">{t("researchCampaignDetailFieldCreatedAt")}:</span>{" "}
                  <span className="font-semibold">{new Date(campaign.createdAt).toLocaleDateString(locale)}</span>
                </div>
                <div>
                  <span className="text-surface-500">{t("researchCampaignDetailFieldStartDate")}:</span>{" "}
                  <span className="font-semibold">{new Date(campaign.startDate).toLocaleDateString(locale)}</span>
                </div>
                <div>
                  <span className="text-surface-500">{t("researchCampaignDetailFieldEndDate")}:</span>{" "}
                  <span className="font-semibold">{new Date(campaign.endDate).toLocaleDateString(locale)}</span>
                </div>
                {campaign.reward && (
                  <div className="col-span-2">
                    <span className="text-surface-500">{t("researchCampaignDetailFieldReward")}:</span>{" "}
                    <span className="font-semibold">{campaign.reward}</span>
                  </div>
                )}
              </div>
              {campaign.description && <p className="mt-4 text-surface-600 text-sm">{campaign.description}</p>}
              {campaign.instructions && (
                <div className="mt-4">
                  <span className="text-surface-500 text-sm">{t("researchCampaignDetailFieldInstructions")}:</span>
                  <p className="text-surface-600 text-sm mt-1">{campaign.instructions}</p>
                </div>
              )}
            </div>

            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">{t("researchCampaignDetailSurveys")}</h2>
                <Link
                  href={`/projects/ABC/admin/research/campaigns/${campaign.id}/surveys`}
                  className="flex items-center gap-1 text-info-600 text-sm hover:underline"
                >
                  <Plus size={16} /> {t("researchCampaignDetailAddSurvey")}
                </Link>
              </div>
              {campaign.surveys.length === 0 ? (
                <p className="text-surface-500 text-sm text-center py-6">{t("researchCampaignDetailNoSurveys")}</p>
              ) : (
                <div className="space-y-2">
                  {campaign.surveys.map((survey) => (
                    <Link
                      key={survey.id}
                      href={`/projects/ABC/admin/research/campaigns/${campaign.id}/surveys/${survey.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-surface-50"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList size={18} className="text-surface-400" />
                        <span className="font-medium">{survey.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-surface-500">
                        <span>{replaceParams(t("researchSurveyResponses"), { n: survey.responseCount })}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${survey.status === "PUBLISHED" ? "bg-success-100 text-success-700" : "bg-surface-100 text-surface-600"}`}
                        >
                          {surveyStatusLabel(survey.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">{t("researchCampaignDetailStats")}</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("researchCampaignDetailParticipants")}</span>
                    <span>
                      {campaign.currentParticipants} / {campaign.targetParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div className="bg-info-600 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="text-flagship-500" size={18} />
                  <span>{replaceParams(t("researchCampaignDetailParticipantCount"), { n: campaign.currentParticipants })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ClipboardList className="text-flagship-500" size={18} />
                  <span>{replaceParams(t("researchCampaignDetailSurveyCount"), { n: campaign.surveys.length })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="text-amber-500" size={18} />
                  <span>
                    {replaceParams(t("researchCampaignDetailFromDate"), {
                      date: new Date(campaign.startDate).toLocaleDateString(locale),
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">{t("researchCampaignDetailActions")}</h2>
              <div className="space-y-2">
                {campaign.status === "DRAFT" && (
                  <button
                    type="button"
                    onClick={() => updateStatus("ACTIVE")}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 text-sm"
                  >
                    <Play size={16} /> {t("researchCampaignActionActivate")}
                  </button>
                )}
                {campaign.status === "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => updateStatus("PAUSED")}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 text-sm"
                  >
                    <Pause size={16} /> {t("researchCampaignActionPause")}
                  </button>
                )}
                {campaign.status === "PAUSED" && (
                  <button
                    type="button"
                    onClick={() => updateStatus("ACTIVE")}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 text-sm"
                  >
                    <Play size={16} /> {t("researchCampaignActionResume")}
                  </button>
                )}
                {(campaign.status === "ACTIVE" || campaign.status === "PAUSED") && (
                  <button
                    type="button"
                    onClick={() => updateStatus("COMPLETED")}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-info-600 text-white rounded-lg hover:bg-info-700 text-sm"
                  >
                    <CheckCircle size={16} /> {t("researchCampaignActionComplete")}
                  </button>
                )}
                <Link
                  href={`/projects/ABC/admin/research/campaigns/${campaign.id}/edit`}
                  className="w-full flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-surface-50 text-sm"
                >
                  <Edit size={16} /> {t("researchCampaignActionEdit")}
                </Link>
                <button
                  type="button"
                  onClick={deleteCampaign}
                  className="w-full flex items-center gap-2 px-4 py-2 border border-danger-200 text-danger-600 rounded-lg hover:bg-danger-50 text-sm"
                >
                  <Trash2 size={16} /> {t("researchCampaignActionDelete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSurveyShell>
  )
}
