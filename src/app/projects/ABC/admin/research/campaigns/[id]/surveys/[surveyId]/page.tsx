"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowRight, FileText, Users, BarChart3, CheckCircle, XCircle, Clock, Plus, GripVertical, Trash2, Edit, Save } from "lucide-react"

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

export default function SurveyDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC?login=1"); return }
    fetchSurvey()
  }, [session, router])

  async function fetchSurvey() {
    try {
      const res = await fetch(`/api/research/campaigns/${params.id}/surveys/${params.surveyId}`)
      if (res.ok) setSurvey(await res.json())
    } catch (e) { /* ignore */ } finally { setLoading(false) }
  }

  async function publishSurvey() {
    await fetch(`/api/research/campaigns/${params.id}/surveys/${params.surveyId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PUBLISHED" }) })
    fetchSurvey()
  }

  if (loading) return <div className="p-8 text-center text-surface-500">جاري التحميل...</div>
  if (!survey) return <div className="p-8 text-center text-danger-500">الاستبيان غير موجود</div>

  const totalQuestions = survey.sections.reduce((sum, s) => sum + s.questions.length, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/projects/ABC/admin/research/campaigns/${params.id}/surveys`} className="text-surface-500 hover:text-surface-700"><ArrowRight size={20} /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{survey.title}</h1>
          {survey.description && <p className="text-surface-500 text-sm">{survey.description}</p>}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${survey.status === "PUBLISHED" ? "bg-success-100 text-success-700" : "bg-surface-100 text-surface-700"}`}>
          {survey.status === "PUBLISHED" ? "منشور" : "مسودة"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border rounded-xl p-5 flex items-center gap-3">
          <FileText className="text-info-500" size={24} />
          <div><p className="text-2xl font-bold">{survey.sections.length}</p><p className="text-surface-500 text-sm">الأقسام</p></div>
        </div>
        <div className="bg-white border rounded-xl p-5 flex items-center gap-3">
          <BarChart3 className="text-flagship-500" size={24} />
          <div><p className="text-2xl font-bold">{totalQuestions}</p><p className="text-surface-500 text-sm">الأسئلة</p></div>
        </div>
        <div className="bg-white border rounded-xl p-5 flex items-center gap-3">
          <Users className="text-flagship-500" size={24} />
          <div><p className="text-2xl font-bold">{survey.responseCount}</p><p className="text-surface-500 text-sm">الردود</p></div>
        </div>
      </div>

      {survey.status === "DRAFT" && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-warning-800 text-sm">هذا الاستبيان غير منشور بعد. انشره ليتمكن المشاركون من الوصول إليه.</p>
          <button onClick={publishSurvey} className="bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 text-sm flex items-center gap-2"><CheckCircle size={16} /> نشر الاستبيان</button>
        </div>
      )}

      <div className="space-y-6">
        {survey.sections.length === 0 ? (
          <div className="text-center py-12 text-surface-500 bg-white border rounded-xl">
            <FileText className="mx-auto mb-3" size={48} />
            <p>لا توجد أقسام في هذا الاستبيان</p>
            <button className="mt-3 text-info-600 hover:underline text-sm">إضافة قسم</button>
          </div>
        ) : (
          survey.sections.map((section) => (
            <div key={section.id} className="bg-white border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{section.title}</h3>
                  {section.description && <p className="text-surface-500 text-sm">{section.description}</p>}
                </div>
                <span className="text-xs text-surface-400">{section.questions.length} أسئلة</span>
              </div>
              {section.questions.length === 0 ? (
                <p className="text-surface-400 text-sm text-center py-4">لا توجد أسئلة في هذا القسم</p>
              ) : (
                <div className="space-y-2">
                  {section.questions.map((question, idx) => (
                    <div key={question.id} className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
                      <span className="text-surface-400 text-sm mt-0.5">{idx + 1}.</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{question.text}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-surface-500">{question.type === "TEXT" ? "نص" : question.type === "MULTIPLE_CHOICE" ? "اختيار متعدد" : question.type === "SINGLE_CHOICE" ? "اختيار واحد" : question.type === "RATING" ? "تقييم" : question.type === "YES_NO" ? "نعم/لا" : question.type}</span>
                          {question.required && <span className="text-xs text-danger-500">* مطلوب</span>}
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
    </div>
  )
}
