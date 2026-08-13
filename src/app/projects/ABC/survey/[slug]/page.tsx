"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Send, CheckCircle, Star } from "lucide-react"

interface OptData { id: string; value: string; label: string }
interface QData { id: string; title: string; isRequired: boolean; questionType: string; options: OptData[]; lowValue: number; highValue: number; lowLabel: string; highLabel: string }
interface SecData { id: string; title: string; description: string; questions: QData[] }

export default function PublicSurveyPage() {
  const { slug } = useParams()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [participantInfo, setParticipantInfo] = useState({
    name: "", email: "", phone: "", company: "",
  })
  const [answers, setAnswers] = useState<Record<string, any>>({})

function isQuestionApplicable(q: QData) { return true }

  useEffect(() => {
    fetch(`/api/public/campaigns/${slug}`)
      .then((r) => r.ok && r.json())
      .then(setCampaign)
      .finally(() => setLoading(false))
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const survey = campaign?.surveys?.[0]
    if (!survey) return

    const newErrors: Record<string, boolean> = {}
    survey.sections?.forEach((section: any) => {
      section.questions?.forEach((q: any) => {
        if (q.isRequired && !answers[q.id]) {
          newErrors[q.id] = true
        }
      })
    })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)

    const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value: typeof value === "string" ? value : null,
      values: Array.isArray(value) ? value : [],
      valueNumber: typeof value === "number" ? value : null,
    }))

    try {
      const res = await fetch("/api/public/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          surveyId: survey.id,
          source: "public",
          participant: {
            name: participantInfo.name || undefined,
            email: participantInfo.email || undefined,
            phone: participantInfo.phone || undefined,
            company: participantInfo.company || undefined,
          },
          answers: formattedAnswers,
        }),
      })
      if (res.ok) setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-pulse text-surface-400">جاري التحميل...</div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">
            {campaign?.thankYouMessage || "شكراً لمشاركتك!"}
          </h2>
          <p className="text-surface-600">تم تسجيل مشاركتك بنجاح. نحن نقدر وقتك ومساهمتك.</p>
        </div>
      </div>
    )
  }

  if (!campaign || !campaign.surveys?.[0]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <p className="text-surface-500">لا توجد استبيانات متاحة حالياً</p>
      </div>
    )
  }

  const survey = campaign.surveys[0]

  return (
    <div className="min-h-screen bg-surface-50 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {campaign.welcomeMessage && (
          <div className="bg-white rounded-xl border p-6 mb-6 text-center">
            <p className="text-surface-700 text-lg">{campaign.welcomeMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-medium text-surface-900 mb-4">معلومات المشارك</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={participantInfo.name}
              onChange={(e) => setParticipantInfo({ ...participantInfo, name: e.target.value })}
              placeholder="الاسم"
              className="px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
            <input
              type="email"
              value={participantInfo.email}
              onChange={(e) => setParticipantInfo({ ...participantInfo, email: e.target.value })}
              placeholder="البريد الإلكتروني"
              className="px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
            <input
              type="tel"
              value={participantInfo.phone}
              onChange={(e) => setParticipantInfo({ ...participantInfo, phone: e.target.value })}
              placeholder="رقم الجوال"
              className="px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
            <input
              type="text"
              value={participantInfo.company}
              onChange={(e) => setParticipantInfo({ ...participantInfo, company: e.target.value })}
              placeholder="الشركة (اختياري)"
              className="px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.sections?.map((section: SecData) => (
            <div key={section.id} className="bg-white rounded-xl border p-6">
              {section.title && (
                <h3 className="font-semibold text-surface-900 mb-4 text-lg">{section.title}</h3>
              )}
              {section.description && (
                <p className="text-sm text-surface-500 mb-4">{section.description}</p>
              )}

              <div className="space-y-6">
                {section.questions?.map((question: QData) => {
                  const hasError = errors[question.id]
                  return (
                    <div key={question.id}>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        {question.title}
                        {question.isRequired && <span className="text-danger-500 mr-1">*</span>}
                      </label>

                      {question.questionType === "TEXT" && (
                        <input
                          type="text"
                          value={answers[question.id] || ""}
                          onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${hasError ? "border-danger-400" : "border-surface-300"}`}
                        />
                      )}

                      {question.questionType === "TEXTAREA" && (
                        <textarea
                          value={answers[question.id] || ""}
                          onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${hasError ? "border-danger-400" : "border-surface-300"}`}
                        />
                      )}

                      {question.questionType === "EMAIL" && (
                        <input
                          type="email"
                          value={answers[question.id] || ""}
                          onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${hasError ? "border-danger-400" : "border-surface-300"}`}
                          dir="ltr"
                        />
                      )}

                      {question.questionType === "PHONE" && (
                        <input
                          type="tel"
                          value={answers[question.id] || ""}
                          onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${hasError ? "border-danger-400" : "border-surface-300"}`}
                          dir="ltr"
                        />
                      )}

                      {question.questionType === "DATE" && (
                        <input
                          type="date"
                          value={answers[question.id] || ""}
                          onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${hasError ? "border-danger-400" : "border-surface-300"}`}
                        />
                      )}

                      {question.questionType === "SINGLE_CHOICE" && (
                        <div className="space-y-2">
                          {question.options?.map((opt: OptData) => (
                            <label key={opt.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-surface-50">
                              <input
                                type="radio"
                                name={`q_${question.id}`}
                                value={opt.value}
                                onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                                className="text-amber-600 focus:ring-amber-500"
                              />
                              <span className="text-sm">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.questionType === "MULTIPLE_CHOICE" && (
                        <div className="space-y-2">
                          {question.options?.map((opt: OptData) => (
                            <label key={opt.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-surface-50">
                              <input
                                type="checkbox"
                                value={opt.value}
                                onChange={(e) => {
                                  const current: string[] = answers[question.id] || []
                                  const updated = e.target.checked
                                    ? [...current, opt.value]
                                    : current.filter((v: string) => v !== opt.value)
                                  setAnswers({ ...answers, [question.id]: updated })
                                }}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span className="text-sm">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.questionType === "DROPDOWN" && (
                        <select
                          value={answers[question.id] || ""}
                          onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white ${hasError ? "border-danger-400" : "border-surface-300"}`}
                        >
                          <option value="">-- اختر --</option>
                          {question.options?.map((opt: OptData) => (
                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {(question.questionType === "LINEAR_SCALE") && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-1">
                            {(question.lowValue || 0) > 0 && (
                              <span className="text-xs text-surface-500">{question.lowLabel || question.lowValue || 0}</span>
                            )}
                            <div className="flex gap-1.5">
                              {Array.from({ length: (question.highValue || 10) - (question.lowValue || 0) + 1 }, (_, i) => {
                                const val = (question.lowValue || 0) + i
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setAnswers({ ...answers, [question.id]: val })}
                                    className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                                      answers[question.id] === val
                                        ? "bg-amber-600 text-white"
                                        : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                                    }`}
                                  >
                                    {val}
                                  </button>
                                )
                              })}
                            </div>
                            {question.highLabel && (
                              <span className="text-xs text-surface-500">{question.highLabel}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {question.questionType === "RATING" && (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setAnswers({ ...answers, [question.id]: star })}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                (answers[question.id] || 0) >= star
                                  ? "bg-amber-100 text-amber-600"
                                  : "bg-surface-100 text-surface-400"
                              }`}
                            >
                              <Star className={`w-5 h-5 ${(answers[question.id] || 0) >= star ? "fill-amber-500 text-amber-500" : ""}`} />
                            </button>
                          ))}
                        </div>
                      )}

                      {question.questionType === "YES_NO" && (
                        <div className="flex gap-3">
                          {["نعم", "لا"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAnswers({ ...answers, [question.id]: opt })}
                              className={`px-6 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                answers[question.id] === opt
                                  ? "bg-amber-600 text-white border-amber-600"
                                  : "bg-white text-surface-700 border-surface-300 hover:border-amber-300"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {question.questionType === "NET_PROMOTER_SCORE" && (
                        <div>
                          <div className="flex gap-1 justify-between mb-2">
                            {Array.from({ length: 11 }, (_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setAnswers({ ...answers, [question.id]: i })}
                                className={`w-8 h-10 rounded text-xs font-medium transition-colors ${
                                  answers[question.id] === i
                                    ? i >= 9 ? "bg-success-600 text-white"
                                      : i >= 7 ? "bg-warning-500 text-white"
                                      : "bg-danger-500 text-white"
                                    : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                                }`}
                              >
                                {i}
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-between text-xs text-surface-500 px-1">
                            <span>غير محتمل</span>
                            <span>محتمل جداً</span>
                          </div>
                        </div>
                      )}

                      {question.questionType === "CSAT" && (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAnswers({ ...answers, [question.id]: val })}
                              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                answers[question.id] === val
                                  ? "bg-amber-600 text-white"
                                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      )}

                      {question.questionType === "CES" && (
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAnswers({ ...answers, [question.id]: val })}
                              className={`w-9 h-10 rounded-lg text-xs font-medium transition-colors ${
                                answers[question.id] === val
                                  ? "bg-amber-600 text-white"
                                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      )}

                      {hasError && (
                        <p className="text-xs text-danger-500 mt-1">هذا الحقل مطلوب</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? "جاري الإرسال..." : "إرسال المشاركة"}
          </button>
        </form>
      </div>
    </div>
  )
}
