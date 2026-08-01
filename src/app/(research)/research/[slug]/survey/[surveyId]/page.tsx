"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CheckCircle, ArrowLeft, ArrowRight, Send } from "lucide-react"

interface Question {
  id: string; title: string; titleAr: string | null; description: string | null
  questionType: string; isRequired: boolean
  options: { id: string; label: string; value: string }[]
  lowLabel: string | null; highLabel: string | null
  lowValue: number | null; highValue: number | null
}

interface Section { id: string; title: string; titleAr: string | null; questions: Question[] }

interface SurveyData {
  id: string; title: string; titleAr: string | null
  campaign: { id: string; slug: string; title: string }
  sections: Section[]
}

export default function SurveyPage() {
  const params = useParams(); const router = useRouter(); const { data: session } = useSession()
  const surveyId = params.surveyId as string; const slug = params.slug as string
  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string | string[] | number | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [participantId, setParticipantId] = useState<string | null>(null)

  useEffect(() => { fetch("/api/research/surveys/" + surveyId).then(r => r.json()).then(d => { setSurvey(d); setLoading(false) }).catch(() => setLoading(false)) }, [surveyId])

  const handleAnswer = (qId: string, value: string | string[] | number | null) => setAnswers(prev => ({ ...prev, [qId]: value }))

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      let pid = participantId
      if (!pid && !session) {
        const g = await (await fetch("/api/research/public/participants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "???", source: "survey" }) })).json()
        pid = g.id; setParticipantId(pid)
      }
      await fetch("/api/research/public/surveys/" + surveyId + "/responses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([qId, v]) => ({ questionId: qId, value: Array.isArray(v) ? null : String(v ?? ""), values: Array.isArray(v) ? v : [], valueNumber: typeof v === "number" ? v : null })),
          participantId: pid, metadata: { source: "web" }
        })
      }); setSubmitted(true)
    } catch (err) { console.error(err) } finally { setSubmitting(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-info-600 border-t-transparent rounded-full" /></div>
  if (!survey) return <div className="min-h-screen flex items-center justify-center text-surface-500"><p>????????? ??? ?????</p></div>
  if (submitted) return <div className="min-h-screen flex items-center justify-center bg-surface-50" dir="rtl"><div className="text-center max-w-md mx-auto p-8"><CheckCircle className="mx-auto h-16 w-16 text-success-500 mb-4" /><h2 className="text-2xl font-bold mb-2">????? ????????!</h2><p className="text-surface-500 mb-6">{survey.campaign?.title || "?? ?????? ??????? ?????"}</p><button onClick={() => router.push("/research/" + slug)} className="text-info-600 underline">?????? ??????</button></div></div>

  const questions = survey.sections?.[currentSection]?.questions ?? []
  const total = survey.sections?.flatMap(s => s.questions).length ?? 0
  const answered = Object.keys(answers).length

  const renderQ = (q: Question) => {
    const v = answers[q.id]
    switch (q.questionType) {
      case "TEXT": case "EMAIL": case "PHONE":
        return <input type={q.questionType === "EMAIL" ? "email" : q.questionType === "PHONE" ? "tel" : "text"} value={(v as string) || ""} onChange={e => handleAnswer(q.id, e.target.value)} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-info-500 outline-none" placeholder="???? ??????..." />
      case "TEXTAREA":
        return <textarea value={(v as string) || ""} onChange={e => handleAnswer(q.id, e.target.value)} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-info-500 outline-none min-h-[100px]" placeholder="???? ??????..." />
      case "SINGLE_CHOICE": case "DROPDOWN":
        return <div className="space-y-2">{q.options.map(o => <label key={o.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-surface-50"><input type="radio" name={q.id} value={o.value} checked={v === o.value} onChange={e => handleAnswer(q.id, e.target.value)} className="accent-info-600" />{o.label}</label>)}</div>
      case "MULTIPLE_CHOICE":
        return <div className="space-y-2">{q.options.map(o => <label key={o.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-surface-50"><input type="checkbox" value={o.value} checked={Array.isArray(v) && v.includes(o.value)} onChange={e => { const cur = Array.isArray(v) ? [...v] : []; if (e.target.checked) cur.push(o.value); else { const i = cur.indexOf(o.value); if (i > -1) cur.splice(i, 1) } handleAnswer(q.id, cur) }} className="accent-info-600" />{o.label}</label>)}</div>
      case "LINEAR_SCALE":
        const lo = q.lowValue ?? 1, hi = q.highValue ?? 5
        return <div className="space-y-2"><div className="flex justify-between text-sm text-surface-500 mb-2"><span>{q.lowLabel || lo}</span><span>{q.highLabel || hi}</span></div><div className="flex gap-2 justify-center">{Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map(n => <button key={n} type="button" onClick={() => handleAnswer(q.id, n)} className={"w-10 h-10 rounded-full border text-sm font-medium transition " + (v === n ? "bg-info-600 text-white border-info-600" : "hover:bg-surface-100")}>{n}</button>)}</div></div>
      case "RATING":
        return <div className="flex gap-2 justify-center">{[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => handleAnswer(q.id, s)} className={"text-3xl transition " + ((v as number) >= s ? "text-warning-400" : "text-surface-300")}>?</button>)}</div>
      case "YES_NO":
        return <div className="flex gap-4 justify-center">{["???","??"].map(o => <button key={o} type="button" onClick={() => handleAnswer(q.id, o)} className={"px-8 py-3 rounded-lg border font-medium transition " + (v === o ? "bg-info-600 text-white border-info-600" : "hover:bg-surface-100")}>{o}</button>)}</div>
      case "NET_PROMOTER_SCORE":
        return <div className="space-y-2"><div className="flex justify-between text-xs text-surface-500 mb-2"><span>??? ????? ?????</span><span>????? ????</span></div><div className="flex gap-1 justify-center">{Array.from({ length: 11 }, (_, i) => i).map(n => <button key={n} type="button" onClick={() => handleAnswer(q.id, n)} className={"w-9 h-10 rounded text-xs font-medium border transition " + (v === n ? n >= 9 ? "bg-success-600 text-white border-success-600" : n >= 7 ? "bg-warning-500 text-white border-warning-500" : "bg-danger-500 text-white border-danger-500" : "hover:bg-surface-100")}>{n}</button>)}</div></div>
      case "DATE":
        return <input type="date" value={(v as string) || ""} onChange={e => handleAnswer(q.id, e.target.value)} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-info-500 outline-none" />
      default:
        return <input type="text" value={(v as string) || ""} onChange={e => handleAnswer(q.id, e.target.value)} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-info-500 outline-none" placeholder="??????..." />
    }
  }

  return (
    <div className="min-h-screen bg-surface-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-2"><h1 className="text-xl font-bold">{survey.titleAr || survey.title}</h1><span className="text-sm text-surface-400">{answered}/{total}</span></div>
          <div className="w-full bg-surface-200 rounded-full h-2"><div className="bg-info-600 h-2 rounded-full transition-all" style={{ width: total > 0 ? (answered / total) * 100 + "%" : "0%" }} /></div>
        </div>
        <form onSubmit={e => { e.preventDefault(); handleSubmit() }}>
          <div className="bg-white rounded-xl border p-6 mb-6">
            {survey.sections?.[currentSection]?.title && <h2 className="font-bold text-lg mb-6">{survey.sections[currentSection].titleAr || survey.sections[currentSection].title}</h2>}
            <div className="space-y-8">{questions.map(q => <div key={q.id}><label className="block font-medium mb-3">{q.titleAr || q.title}{q.isRequired && <span className="text-danger-500 mr-1">*</span>}</label>{q.description && <p className="text-sm text-surface-500 mb-3">{q.description}</p>}{renderQ(q)}</div>)}</div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setCurrentSection(p => Math.max(0, p - 1))} disabled={currentSection === 0} className="flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50"><ArrowRight size={18} /> ??????</button>
            {currentSection < (survey.sections?.length ?? 1) - 1 ? (
              <button type="button" onClick={() => setCurrentSection(p => Math.min((survey.sections?.length ?? 1) - 1, p + 1))} className="flex items-center gap-2 px-6 py-2 bg-info-600 text-white rounded-lg hover:bg-info-700">?????? <ArrowLeft size={18} /></button>
            ) : (
              <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 disabled:opacity-50">{submitting ? "???? ???????..." : "?????"} <Send size={18} /></button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
