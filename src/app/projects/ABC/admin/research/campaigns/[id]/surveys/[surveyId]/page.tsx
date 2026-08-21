"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, FileText, Users, BarChart3, CheckCircle } from "lucide-react"
import AdminSurveyShell, { ADMIN_ACTION_BTN } from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import {
  RESEARCH_SURVEY_STATUS_KEYS,
  RESEARCH_SURVEY_QUESTION_TYPE_KEYS,
} from "@/lib/admin/admin-labels"

interface SurveySection {
  id: string
  title: string
  description: string
  order: number
  questions: SurveyQuestion[]
}

interface SurveyQuestion {
  id: string
  text: string
  type: string
  required: boolean
  order: number
  options: string[]
}

interface Survey {
  id: string
  title: string
  description: string
  status: string
  responseCount: number
  createdAt: string
  sections: SurveySection[]
}

function replaceParams(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{{${key}}}`, String(value)),
    template,
  )
}

export default function SurveyDetailPage() {
  const { t } = useLanguage()
  const params = useParams()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSurvey()
  }, [params.id, params.surveyId])

  async function fetchSurvey() {
    try {
      const res = await fetch(`/api/research/campaigns/${params.id}/surveys/${params.surveyId}`)
      if (res.ok) setSurvey(await res.json())
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  async function publishSurvey() {
    await fetch(`/api/research/campaigns/${params.id}/surveys/${params.surveyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PUBLISHED" }),
    })
    fetchSurvey()
  }

  const surveyStatusLabel = (status: string) => {
    const key = RESEARCH_SURVEY_STATUS_KEYS[status]
    return key ? t(key) : status
  }

  const questionTypeLabel = (type: string) => {
    const key = RESEARCH_SURVEY_QUESTION_TYPE_KEYS[type]
    return key ? t(key) : type
  }

  if (!loading && !survey) {
    return (
      <AdminSurveyShell title={t("researchCampaignSurveysTitle")}>
        <div className="text-center text-danger-500 py-8">{t("researchSurveyDetailNotFound")}</div>
      </AdminSurveyShell>
    )
  }

  const totalQuestions = survey?.sections.reduce((sum, s) => sum + s.questions.length, 0) ?? 0

  return (
    <AdminSurveyShell
      title={survey?.title ?? t("researchCampaignSurveysTitle")}
      subtitle={survey?.description}
      loading={loading}
      actions={
        survey ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/ABC/admin/research/campaigns/${params.id}/surveys`}
              className="text-surface-500 hover:text-surface-700"
            >
              <ArrowRight size={20} />
            </Link>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${survey.status === "PUBLISHED" ? "bg-success-100 text-success-700" : "bg-surface-100 text-surface-700"}`}
            >
              {surveyStatusLabel(survey.status)}
            </span>
          </div>
        ) : null
      }
    >
      {survey && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 max-w-5xl">
            <div className="bg-white border rounded-xl p-5 flex items-center gap-3">
              <FileText className="text-info-500" size={24} />
              <div>
                <p className="text-2xl font-bold">{survey.sections.length}</p>
                <p className="text-surface-500 text-sm">{t("researchSurveyDetailSections")}</p>
              </div>
            </div>
            <div className="bg-white border rounded-xl p-5 flex items-center gap-3">
              <BarChart3 className="text-flagship-500" size={24} />
              <div>
                <p className="text-2xl font-bold">{totalQuestions}</p>
                <p className="text-surface-500 text-sm">{t("researchSurveyDetailQuestions")}</p>
              </div>
            </div>
            <div className="bg-white border rounded-xl p-5 flex items-center gap-3">
              <Users className="text-flagship-500" size={24} />
              <div>
                <p className="text-2xl font-bold">{survey.responseCount}</p>
                <p className="text-surface-500 text-sm">{t("researchSurveyDetailResponses")}</p>
              </div>
            </div>
          </div>

          {survey.status === "DRAFT" && (
            <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4 flex-wrap max-w-5xl">
              <p className="text-warning-800 text-sm">{t("researchSurveyDetailUnpublishedWarning")}</p>
              <button type="button" onClick={publishSurvey} className={ADMIN_ACTION_BTN}>
                <CheckCircle size={16} /> {t("researchSurveyDetailPublish")}
              </button>
            </div>
          )}

          <div className="space-y-6 max-w-5xl">
            {survey.sections.length === 0 ? (
              <div className="text-center py-12 text-surface-500 bg-white border rounded-xl">
                <FileText className="mx-auto mb-3" size={48} />
                <p>{t("researchSurveyDetailNoSections")}</p>
                <button type="button" className="mt-3 text-info-600 hover:underline text-sm">
                  {t("researchSurveyDetailAddSection")}
                </button>
              </div>
            ) : (
              survey.sections.map((section) => (
                <div key={section.id} className="bg-white border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{section.title}</h3>
                      {section.description && <p className="text-surface-500 text-sm">{section.description}</p>}
                    </div>
                    <span className="text-xs text-surface-400">
                      {replaceParams(t("researchSurveyDetailQuestionCount"), { n: section.questions.length })}
                    </span>
                  </div>
                  {section.questions.length === 0 ? (
                    <p className="text-surface-400 text-sm text-center py-4">{t("researchSurveyDetailNoQuestions")}</p>
                  ) : (
                    <div className="space-y-2">
                      {section.questions.map((question, idx) => (
                        <div key={question.id} className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
                          <span className="text-surface-400 text-sm mt-0.5">{idx + 1}.</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{question.text}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-surface-500">{questionTypeLabel(question.type)}</span>
                              {question.required && (
                                <span className="text-xs text-danger-500">{t("researchSurveyQuestionRequired")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </AdminSurveyShell>
  )
}
