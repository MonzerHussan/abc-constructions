"use client"

import { useEffect, useState } from "react"
import {
  Lightbulb,
  Search,
  ThumbsUp,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import {
  RESEARCH_FEATURE_STATUS_KEYS,
  RESEARCH_FEATURE_PRIORITY_KEYS,
} from "@/lib/admin/admin-labels"

interface FeatureRequest {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  votes: number
  commentsCount: number
  userName: string
  createdAt: string
}

const STATUS_ICONS: Record<string, typeof Clock> = {
  PENDING: Clock,
  UNDER_REVIEW: AlertCircle,
  PLANNED: Clock,
  IN_PROGRESS: AlertCircle,
  COMPLETED: CheckCircle,
  REJECTED: XCircle,
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-warning-100 text-warning-700",
  UNDER_REVIEW: "bg-info-100 text-info-700",
  PLANNED: "bg-flagship-100 text-flagship-700",
  IN_PROGRESS: "bg-flagship-100 text-flagship-700",
  COMPLETED: "bg-success-100 text-success-700",
  REJECTED: "bg-danger-100 text-danger-700",
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-danger-100 text-danger-700",
  HIGH: "bg-amber-100 text-amber-700",
  MEDIUM: "bg-info-100 text-info-700",
  LOW: "bg-surface-100 text-surface-700",
}

const FEATURE_STATUS_OPTIONS = Object.keys(RESEARCH_FEATURE_STATUS_KEYS)
const FEATURE_PRIORITY_OPTIONS = Object.keys(RESEARCH_FEATURE_PRIORITY_KEYS)

export default function FeatureRequestsPage() {
  const { t, language } = useLanguage()
  const [requests, setRequests] = useState<FeatureRequest[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [loading, setLoading] = useState(true)

  const locale = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US"

  useEffect(() => {
    fetchRequests()
  }, [search, statusFilter, priorityFilter])

  function fetchRequests() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    if (priorityFilter) params.set("priority", priorityFilter)
    fetch(`/api/research/feature-requests?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setRequests(d.requests || d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/research/feature-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchRequests()
  }

  const statusLabel = (status: string) => {
    const key = RESEARCH_FEATURE_STATUS_KEYS[status]
    return key ? t(key) : status
  }

  const priorityLabel = (priority: string) => {
    const key = RESEARCH_FEATURE_PRIORITY_KEYS[priority]
    return key ? t(key) : priority
  }

  return (
    <AdminSurveyShell
      title={t("researchNavFeatureRequestsTitle")}
      subtitle={t("researchNavFeatureRequestsDesc")}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500"
          >
            <option value="">{t("researchCampaignsAllStatuses")}</option>
            {FEATURE_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500"
          >
            <option value="">{t("researchCampaignsAllTypes")}</option>
            {FEATURE_PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabel(priority)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!loading && requests.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <Lightbulb className="mx-auto mb-3" size={48} />
          <p>{t("researchAnalyticsNoData")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const StatusIcon = STATUS_ICONS[req.status] || Clock
            const statusColor = STATUS_COLORS[req.status] || STATUS_COLORS.PENDING
            return (
              <div key={req.id} className="bg-white border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold">{req.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                        <StatusIcon size={12} className="inline me-1" />
                        {statusLabel(req.status)}
                      </span>
                      {req.priority && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${PRIORITY_COLORS[req.priority] || "bg-surface-100 text-surface-700"}`}
                        >
                          {priorityLabel(req.priority)}
                        </span>
                      )}
                    </div>
                    <p className="text-surface-600 text-sm mb-2">{req.description}</p>
                    <div className="flex items-center gap-4 text-xs text-surface-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={14} /> {req.votes} {t("votes")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={14} /> {req.commentsCount}
                      </span>
                      <span>{req.userName}</span>
                      <span>{new Date(req.createdAt).toLocaleDateString(locale)}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <select
                      value={req.status}
                      onChange={(e) => updateStatus(req.id, e.target.value)}
                      className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-info-500"
                    >
                      {FEATURE_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
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
