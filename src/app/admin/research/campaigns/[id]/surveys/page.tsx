"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowRight, Plus, FileText, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, BarChart3 } from "lucide-react"

interface Survey {
  id: string
  title: string
  description: string
  status: string
  responseCount: number
  createdAt: string
}

export default function CampaignSurveysPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [campaignTitle, setCampaignTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", status: "DRAFT" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/auth/login"); return }
    fetchData()
  }, [session, router])

  async function fetchData() {
    try {
      const [surveysRes, campRes] = await Promise.all([
        fetch(`/api/research/campaigns/${params.id}/surveys`),
        fetch(`/api/research/campaigns/${params.id}`)
      ])
      if (surveysRes.ok) setSurveys(await surveysRes.json())
      if (campRes.ok) { const c = await campRes.json(); setCampaignTitle(c.title) }
    } catch (e) { /* ignore */ } finally { setLoading(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/research/campaigns/${params.id}/surveys`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (res.ok) { setShowForm(false); setForm({ title: "", description: "", status: "DRAFT" }); fetchData() }
    } catch (e) { /* ignore */ } finally { setSubmitting(false) }
  }

  async function deleteSurvey(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الاستبيان؟")) return
    await fetch(`/api/research/campaigns/${params.id}/surveys/${id}`, { method: "DELETE" })
    fetchData()
  }

  if (loading) return <div className="p-8 text-center text-surface-500">جاري التحميل...</div>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/admin/research/campaigns/${params.id}`} className="text-surface-500 hover:text-surface-700"><ArrowRight size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold">استبيانات الحملة</h1>
          {campaignTitle && <p className="text-surface-500 text-sm">{campaignTitle}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-surface-500">إجمالي الاستبيانات: {surveys.length}</p>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-info-600 text-white px-4 py-2 rounded-lg hover:bg-info-700">
          <Plus size={20} /> استبيان جديد
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-xl p-6 mb-6 space-y-4">
          <h3 className="font-bold">استبيان جديد</h3>
          <div>
            <label className="block text-sm font-semibold mb-1">العنوان *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500" placeholder="عنوان الاستبيان" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">الوصف</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500" placeholder="وصف الاستبيان" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="bg-info-600 text-white px-4 py-2 rounded-lg hover:bg-info-700 disabled:opacity-50">{submitting ? "جاري..." : "إنشاء"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-surface-50">إلغاء</button>
          </div>
        </form>
      )}

      {surveys.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <FileText className="mx-auto mb-3" size={48} />
          <p>لا توجد استبيانات في هذه الحملة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-white border rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <FileText className="text-surface-400 mt-1" size={24} />
                <div>
                  <Link href={`/admin/research/campaigns/${params.id}/surveys/${survey.id}`} className="font-bold text-info-600 hover:underline">{survey.title}</Link>
                  {survey.description && <p className="text-surface-500 text-sm mt-1">{survey.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                    <span>{survey.responseCount} ردود</span>
                    <span>تم الإنشاء: {new Date(survey.createdAt).toLocaleDateString("ar-SA")}</span>
                    <span className={`px-2 py-0.5 rounded-full ${survey.status === "PUBLISHED" ? "bg-success-100 text-success-700" : "bg-surface-100 text-surface-600"}`}>
                      {survey.status === "PUBLISHED" ? "منشور" : "مسودة"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/research/campaigns/${params.id}/surveys/${survey.id}`} className="p-2 text-info-600 hover:bg-info-50 rounded-lg"><Eye size={18} /></Link>
                <button onClick={() => deleteSurvey(survey.id)} className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
