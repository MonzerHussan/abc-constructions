"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowRight, Save } from "lucide-react"
import Link from "next/link"

export default function EditCampaignPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "SURVEY",
    status: "DRAFT",
    targetParticipants: 100,
    startDate: "",
    endDate: "",
    instructions: "",
    reward: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC/auth/login"); return }
    fetchCampaign()
  }, [session, router])

  async function fetchCampaign() {
    try {
      const res = await fetch(`/api/research/campaigns/${params.id}`)
      const d = await res.json()
      setForm({ title: d.title, description: d.description || "", type: d.type, status: d.status, targetParticipants: d.targetParticipants, startDate: d.startDate?.split("T")[0] || "", endDate: d.endDate?.split("T")[0] || "", instructions: d.instructions || "", reward: d.reward || "" })
    } catch (e) { setError("فشل تحميل بيانات الحملة") } finally { setLoading(false) }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === "targetParticipants" ? parseInt(value) || 0 : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.startDate || !form.endDate) { setError("يرجى ملء جميع الحقول المطلوبة"); return }
    setSubmitting(true); setError("")
    try {
      const res = await fetch(`/api/research/campaigns/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "فشل تحديث الحملة") }
      router.push(`/projects/ABC/admin/research/campaigns/${params.id}`)
    } catch (err) { const message = err instanceof Error ? err.message : String(err); setError(message) } finally { setSubmitting(false) }
  }

  if (loading) return <div className="p-8 text-center text-surface-500">جاري التحميل...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/projects/ABC/admin/research/campaigns/${params.id}`} className="text-surface-500 hover:text-surface-700"><ArrowRight size={20} /></Link>
        <h1 className="text-2xl font-bold">تعديل الحملة</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-5">
        {error && <div className="bg-danger-50 text-danger-600 p-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-semibold mb-1">عنوان الحملة *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">الوصف</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">النوع *</label>
            <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500">
              <option value="SURVEY">استبيان</option>
              <option value="INTERVIEW">مقابلة</option>
              <option value="FOCUS_GROUP">مجموعة نقاش</option>
              <option value="USABILITY_TEST">اختبار قابلية استخدام</option>
              <option value="BETA_TEST">اختبار تجريبي</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">الحالة</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500">
              <option value="DRAFT">مسودة</option>
              <option value="ACTIVE">نشطة</option>
              <option value="PAUSED">موقفة</option>
              <option value="COMPLETED">مكتملة</option>
              <option value="CANCELLED">ملغية</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">المستهدف من المشاركين *</label>
            <input type="number" name="targetParticipants" value={form.targetParticipants} onChange={handleChange} min={1} className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">تاريخ البداية *</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">تاريخ النهاية *</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">تعليمات المشاركين</label>
          <textarea name="instructions" value={form.instructions} onChange={handleChange} rows={3} className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">المكافأة</label>
          <input type="text" name="reward" value={form.reward} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500" />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-info-600 text-white px-6 py-2.5 rounded-lg hover:bg-info-700 disabled:opacity-50">
            <Save size={20} /> {submitting ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
          <Link href={`/projects/ABC/admin/research/campaigns/${params.id}`} className="px-6 py-2.5 border rounded-lg hover:bg-surface-50">إلغاء</Link>
        </div>
      </form>
    </div>
  )
}
