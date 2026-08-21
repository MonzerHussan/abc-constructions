"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Plus, Edit, Eye, Trash2, Target, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import AdminSurveyShell, { ADMIN_ACTION_BTN } from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import {
  RESEARCH_CAMPAIGN_STATUS_KEYS,
  RESEARCH_CAMPAIGN_TYPE_KEYS,
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
  createdAt: string
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-surface-100 text-surface-700",
  ACTIVE: "bg-success-100 text-success-700",
  PAUSED: "bg-warning-100 text-warning-700",
  COMPLETED: "bg-info-100 text-info-700",
  CANCELLED: "bg-danger-100 text-danger-700",
}

const statusIcons: Record<string, typeof Clock> = {
  DRAFT: Clock,
  ACTIVE: CheckCircle,
  PAUSED: Clock,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
}

const STATUS_OPTIONS = Object.keys(RESEARCH_CAMPAIGN_STATUS_KEYS)
const TYPE_OPTIONS = Object.keys(RESEARCH_CAMPAIGN_TYPE_KEYS)

export default function CampaignsPage() {
  const { t, language } = useLanguage()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [loading, setLoading] = useState(true)

  const locale = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US"

  useEffect(() => {
    fetchCampaigns()
  }, [search, statusFilter, typeFilter])

  function fetchCampaigns() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    if (typeFilter) params.set("type", typeFilter)
    fetch(`/api/research/campaigns?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setCampaigns(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  async function deleteCampaign(id: string) {
    if (!confirm(t("researchCampaignDeleteConfirm"))) return
    await fetch(`/api/research/campaigns/${id}`, { method: "DELETE" })
    fetchCampaigns()
  }

  const statusLabel = (status: string) => {
    const key = RESEARCH_CAMPAIGN_STATUS_KEYS[status]
    return key ? t(key) : status
  }

  const typeLabel = (type: string) => {
    const key = RESEARCH_CAMPAIGN_TYPE_KEYS[type]
    return key ? t(key) : type
  }

  function getStatusIcon(status: string) {
    const Icon = statusIcons[status] || Clock
    return <Icon size={16} />
  }

  return (
    <AdminSurveyShell
      title={t("researchCampaignsTitle")}
      subtitle={t("researchCampaignsSubtitle")}
      loading={loading}
      actions={
        <Link href="/projects/ABC/admin/research/campaigns/new" className={ADMIN_ACTION_BTN}>
          <Plus size={16} /> {t("researchCampaignsNew")}
        </Link>
      }
    >
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute end-3 top-2.5 text-surface-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("researchCampaignsSearchPlaceholder")}
              className="w-full pe-10 ps-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-info-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500"
          >
            <option value="">{t("researchCampaignsAllStatuses")}</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500"
          >
            <option value="">{t("researchCampaignsAllTypes")}</option>
            {TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!loading && campaigns.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <Target className="mx-auto mb-3" size={48} />
          <p>{t("researchCampaignsEmpty")}</p>
          <Link href="/projects/ABC/admin/research/campaigns/new" className="text-info-600 hover:underline mt-2 inline-block">
            {t("researchCampaignsCreateFirst")}
          </Link>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 border-b">
              <tr>
                <th className="text-right p-4 text-sm font-semibold text-surface-600">{t("researchCampaignsColTitle")}</th>
                <th className="text-right p-4 text-sm font-semibold text-surface-600">{t("researchCampaignsColType")}</th>
                <th className="text-right p-4 text-sm font-semibold text-surface-600">{t("researchCampaignsColStatus")}</th>
                <th className="text-right p-4 text-sm font-semibold text-surface-600">
                  {t("researchCampaignsColParticipants")}
                </th>
                <th className="text-right p-4 text-sm font-semibold text-surface-600">{t("researchCampaignsColDate")}</th>
                <th className="text-center p-4 text-sm font-semibold text-surface-600">{t("researchCampaignsColActions")}</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b last:border-0 hover:bg-surface-50">
                  <td className="p-4">
                    <Link
                      href={`/projects/ABC/admin/research/campaigns/${campaign.id}`}
                      className="font-semibold text-info-600 hover:underline"
                    >
                      {campaign.title}
                    </Link>
                    <p className="text-xs text-surface-500 mt-1 line-clamp-1">{campaign.description}</p>
                  </td>
                  <td className="p-4 text-sm">{typeLabel(campaign.type)}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status] || "bg-surface-100 text-surface-700"}`}
                    >
                      {getStatusIcon(campaign.status)}
                      {statusLabel(campaign.status)}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {campaign.currentParticipants} / {campaign.targetParticipants}
                  </td>
                  <td className="p-4 text-sm text-surface-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(campaign.startDate).toLocaleDateString(locale)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/projects/ABC/admin/research/campaigns/${campaign.id}`}
                        className="p-1.5 text-info-600 hover:bg-info-50 rounded-lg"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/projects/ABC/admin/research/campaigns/${campaign.id}/edit`}
                        className="p-1.5 text-success-600 hover:bg-success-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteCampaign(campaign.id)}
                        className="p-1.5 text-danger-600 hover:bg-danger-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSurveyShell>
  )
}
