"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Plus, FileText, Trash2, Eye } from "lucide-react"
import AdminSurveyShell, { ADMIN_ACTION_BTN, ADMIN_ACTION_BTN_SECONDARY } from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import { RESEARCH_SURVEY_STATUS_KEYS } from "@/lib/admin/admin-labels"

interface Survey {
  id: string
  title: string
  description: string
  status: string
  responseCount: number
  createdAt: string
}

function replaceParams(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{{${key}}}`, String(value)),
    template,
  )
}

export default function CampaignSurveysPage() {
  const { t, language } = useLanguage()
  const params = useParams()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [campaignTitle, setCampaignTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", status: "DRAFT" })
  const [submitting, setSubmitting] = useState(false)

  const locale = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US"

  useEffect(() => {
    fetchData()
  }, [params.id])

  async function fetchData() {
    try {
      const [surveysRes, campRes] = await Promise.all([
        fetch(`/api/research/campaigns/${params.id}/surveys`),
        fetch(`/api/research/campaigns/${params.id}`),
      ])
      if (surveysRes.ok) setSurveys(await surveysRes.json())
      if (campRes.ok) {
        const c = await campRes.json()
        setCampaignTitle(c.title)
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/research/campaigns/${params.id}/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ title: "", description: "", status: "DRAFT" })
        fetchData()
      }
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteSurvey(id: string) {
    if (!confirm(t("researchSurveyDeleteConfirm"))) return
    await fetch(`/api/research/campaigns/${params.id}/surveys/${id}`, { method: "DELETE" })
    fetchData()
  }

  const surveyStatusLabel = (status: string) => {
    const key = RESEARCH_SURVEY_STATUS_KEYS[status]
    return key ? t(key) : status
  }

  return (
    <AdminSurveyShell
      title={t("researchCampaignSurveysTitle")}
      subtitle={campaignTitle || undefined}
      loading={loading}
      actions={
        <div className="flex items-center gap-2">
          <Link href={`/projects/ABC/admin/research/campaigns/${params.id}`} className="text-surface-500 hover:text-surface-700">
            <ArrowRight size={20} />
          </Link>
          <button type="button" onClick={() => setShowForm(!showForm)} className={ADMIN_ACTION_BTN}>
            <Plus size={16} /> {t("researchCampaignSurveysNew")}
          </button>
        </div>
      }
    >
      <p className="text-surface-500 mb-6">{replaceParams(t("researchCampaignSurveysTotal"), { n: surveys.length })}</p>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-6 mb-6 space-y-4 max-w-3xl">
          <h3 className="font-bold">{t("researchCampaignSurveysNew")}</h3>
          <div>
            <label className="block text-sm font-semibold mb-1">{t("researchSurveyFormTitle")}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500"
              placeholder={t("researchSurveyFormTitlePlaceholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t("researchSurveyFormDescription")}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500"
              placeholder={t("researchSurveyFormDescriptionPlaceholder")}
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className={ADMIN_ACTION_BTN}>
              {submitting ? t("researchSurveyCreating") : t("researchSurveyCreate")}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className={ADMIN_ACTION_BTN_SECONDARY}>
              {t("researchCancel")}
            </button>
          </div>
        </form>
      )}

      {!loading && surveys.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <FileText className="mx-auto mb-3" size={48} />
          <p>{t("researchCampaignSurveysEmpty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-white border rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <FileText className="text-surface-400 mt-1 shrink-0" size={24} />
                <div className="min-w-0">
                  <Link
                    href={`/projects/ABC/admin/research/campaigns/${params.id}/surveys/${survey.id}`}
                    className="font-bold text-info-600 hover:underline"
                  >
                    {survey.title}
                  </Link>
                  {survey.description && <p className="text-surface-500 text-sm mt-1">{survey.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-surface-500 flex-wrap">
                    <span>{replaceParams(t("researchSurveyResponses"), { n: survey.responseCount })}</span>
                    <span>
                      {replaceParams(t("researchSurveyCreatedAt"), {
                        date: new Date(survey.createdAt).toLocaleDateString(locale),
                      })}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${survey.status === "PUBLISHED" ? "bg-success-100 text-success-700" : "bg-surface-100 text-surface-600"}`}
                    >
                      {surveyStatusLabel(survey.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/projects/ABC/admin/research/campaigns/${params.id}/surveys/${survey.id}`}
                  className="p-2 text-info-600 hover:bg-info-50 rounded-lg"
                >
                  <Eye size={18} />
                </Link>
                <button
                  type="button"
                  onClick={() => deleteSurvey(survey.id)}
                  className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminSurveyShell>
  )
}
