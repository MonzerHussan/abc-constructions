"use client"

import { useEffect, useState } from "react"
import {
  MessageSquare,
  Search,
  Star,
  Flag,
  AlertTriangle,
  ThumbsUp,
} from "lucide-react"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import {
  RESEARCH_FEEDBACK_TYPE_KEYS,
  RESEARCH_FEEDBACK_STATUS_KEYS,
} from "@/lib/admin/admin-labels"

interface Feedback {
  id: string
  type: string
  subject: string
  message: string
  rating: number
  status: string
  userName: string
  userEmail: string
  page: string
  createdAt: string
}

const typeIcons: Record<string, typeof MessageSquare> = {
  BUG: AlertTriangle,
  FEEDBACK: MessageSquare,
  COMPLAINT: Flag,
  SUGGESTION: ThumbsUp,
  PRAISE: ThumbsUp,
}

const statusColors: Record<string, string> = {
  NEW: "bg-info-100 text-info-700",
  READ: "bg-surface-100 text-surface-700",
  IN_PROGRESS: "bg-warning-100 text-warning-700",
  RESOLVED: "bg-success-100 text-success-700",
  CLOSED: "bg-danger-100 text-danger-700",
}

const FEEDBACK_TYPE_OPTIONS = Object.keys(RESEARCH_FEEDBACK_TYPE_KEYS)
const FEEDBACK_STATUS_OPTIONS = Object.keys(RESEARCH_FEEDBACK_STATUS_KEYS)

export default function FeedbackPage() {
  const { t, language } = useLanguage()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)

  const locale = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US"

  useEffect(() => {
    fetchFeedback()
  }, [search, typeFilter, statusFilter])

  function fetchFeedback() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (typeFilter) params.set("type", typeFilter)
    if (statusFilter) params.set("status", statusFilter)
    fetch(`/api/research/feedback?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setFeedback(d.feedback || d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/research/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchFeedback()
  }

  const typeLabel = (type: string) => {
    const key = RESEARCH_FEEDBACK_TYPE_KEYS[type]
    return key ? t(key) : type
  }

  const statusLabel = (status: string) => {
    const key = RESEARCH_FEEDBACK_STATUS_KEYS[status]
    return key ? t(key) : status
  }

  return (
    <AdminSurveyShell
      title={t("researchNavFeedbackTitle")}
      subtitle={t("researchNavFeedbackDesc")}
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
            {FEEDBACK_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500"
          >
            <option value="">{t("researchCampaignsAllStatuses")}</option>
            {FEEDBACK_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!loading && feedback.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <MessageSquare className="mx-auto mb-3" size={48} />
          <p>{t("researchAnalyticsNoData")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => {
            const TypeIcon = typeIcons[item.type] || MessageSquare
            return (
              <div key={item.id} className="bg-white border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${item.type === "BUG" ? "bg-danger-100" : item.type === "COMPLAINT" ? "bg-amber-100" : item.type === "PRAISE" ? "bg-success-100" : "bg-info-100"}`}
                  >
                    <TypeIcon
                      size={20}
                      className={
                        item.type === "BUG"
                          ? "text-danger-600"
                          : item.type === "COMPLAINT"
                            ? "text-amber-600"
                            : item.type === "PRAISE"
                              ? "text-success-600"
                              : "text-info-600"
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${item.type === "BUG" ? "bg-danger-100 text-danger-700" : item.type === "COMPLAINT" ? "bg-amber-100 text-amber-700" : item.type === "PRAISE" ? "bg-success-100 text-success-700" : "bg-info-100 text-info-700"}`}
                      >
                        {typeLabel(item.type)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${statusColors[item.status] || "bg-surface-100"}`}>
                        {statusLabel(item.status)}
                      </span>
                      {item.rating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-warning-500">
                          <Star size={12} fill="currentColor" />
                          {item.rating}
                        </span>
                      )}
                    </div>
                    {item.subject && <h3 className="font-bold mb-1">{item.subject}</h3>}
                    <p className="text-surface-600 text-sm mb-2">{item.message}</p>
                    <div className="flex items-center gap-4 text-xs text-surface-500 flex-wrap">
                      <span>{item.userName || item.userEmail}</span>
                      {item.page && <span>{item.page}</span>}
                      <span>{new Date(item.createdAt).toLocaleDateString(locale)}</span>
                    </div>
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-info-500"
                  >
                    {FEEDBACK_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminSurveyShell>
  )
}
