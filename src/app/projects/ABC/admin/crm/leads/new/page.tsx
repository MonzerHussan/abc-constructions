"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Save } from "lucide-react"
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/crm/constants"

export default function LeadFormPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const isEdit = !!params?.id
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", company: "",
    jobTitle: "", source: "WEBSITE", status: "NEW", score: 0,
    notes: "", tags: "", assignedToId: "",
  })

  useEffect(() => {
    if (!session) return
    const user = session.user as { id: string; role: string };
    if (user?.role !== "ADMIN") { router.push("/projects/ABC/auth/login"); return }
    if (isEdit && params?.id) {
      fetch(`/api/crm/leads/${params.id}`)
        .then(r => r.json())
        .then(d => setForm({
          firstName: d.firstName || "", lastName: d.lastName || "", email: d.email || "",
          phone: d.phone || "", company: d.company || "", jobTitle: d.jobTitle || "",
          source: d.source || "WEBSITE", status: d.status || "NEW", score: d.score || 0,
          notes: d.notes || "", tags: (d.tags || []).join(", "), assignedToId: d.assignedToId || "",
        }))
        .catch(() => setError("فشل تحميل البيانات"))
    }
  }, [session, router, isEdit, params?.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const body = {
        firstName: form.firstName, lastName: form.lastName, email: form.email || undefined,
        phone: form.phone || undefined, company: form.company || undefined,
        jobTitle: form.jobTitle || undefined, source: form.source, status: form.status,
        score: form.score, notes: form.notes || undefined,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        assignedToId: form.assignedToId || undefined, organizationId: "default",
      }
      if (isEdit && params?.id) {
        await fetch(`/api/crm/leads/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      } else {
        await fetch("/api/crm/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      }
      router.push("/projects/ABC/admin/crm/leads")
      router.refresh()
    } catch {
      setError("فشل حفظ البيانات")
    } finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/projects/ABC/admin/crm/leads" className="flex items-center gap-2 text-surface-600 hover:text-surface-900 mb-4"><ArrowRight size={18} /> العودة</Link>
        <h1 className="text-2xl font-bold">{isEdit ? "تعديل عميل محتمل" : "إضافة عميل محتمل"}</h1>
      </div>
      {error && <div className="bg-danger-50 text-danger-600 p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">الاسم الأول *</label>
            <input type="text" required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">اسم العائلة *</label>
            <input type="text" required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الجوال</label>
            <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">الشركة</label>
            <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المسمى الوظيفي</label>
            <input type="text" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">المصدر</label>
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500">
              {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500">
              {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التقييم (0-100)</label>
            <input type="number" min={0} max={100} value={form.score} onChange={e => setForm(f => ({ ...f, score: parseInt(e.target.value) || 0 }))} className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الوسوم (مفصولة بفواصل)</label>
          <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="tag1, tag2, tag3" className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ملاحظات</label>
          <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-info-600 text-white px-6 py-2.5 rounded-xl hover:bg-info-700 disabled:opacity-50"><Save size={18} /> {saving ? "جاري الحفظ..." : "حفظ"}</button>
          <Link href="/projects/ABC/admin/crm/leads" className="px-6 py-2.5 border border-surface-300 rounded-xl text-surface-700 hover:bg-surface-50">إلغاء</Link>
        </div>
      </form>
    </div>
  )
}
