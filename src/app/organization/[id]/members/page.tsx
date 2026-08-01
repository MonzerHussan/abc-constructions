"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { User, Mail, Plus, Trash2, ChevronLeft } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import Link from "next/link"

export default function MembersPage() {
  const { id } = useParams()
  const { t, language } = useLanguage()
  const [members, setMembers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: "", roleId: "", title: "" })

  const fetchData = async () => {
    const [mRes, rRes] = await Promise.all([
      fetch(`/api/organizations/${id}/members`),
      fetch(`/api/organizations/${id}/roles`),
    ])
    if (mRes.ok) setMembers(await mRes.json())
    if (rRes.ok) setRoles(await rRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const handleInvite = async () => {
    const res = await fetch(`/api/organizations/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteForm),
    })
    if (res.ok) {
      setShowInvite(false)
      setInviteForm({ email: "", roleId: "", title: "" })
      fetchData()
    }
  }

  const handleRemove = async (userId: string) => {
    if (!confirm("تأكيد إزالة العضو؟")) return
    const res = await fetch(`/api/organizations/${id}/members/${userId}`, { method: "DELETE" })
    if (res.ok) fetchData()
  }

  const handleRoleChange = async (userId: string, roleId: string) => {
    await fetch(`/api/organizations/${id}/members/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId: roleId || null }),
    })
    fetchData()
  }

  if (loading) return <div className="p-8 text-center text-surface-500">{t("loading")}</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/organization/${id}`} className="p-2 hover:bg-surface-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-surface-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">إدارة الأعضاء</h1>
            <p className="text-surface-500 text-sm">{members.length} أعضاء</p>
          </div>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
          <Plus className="w-4 h-4" />
          دعوة عضو
        </button>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-lg font-bold mb-4">دعوة عضو جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">البريد الإلكتروني</label>
                <input value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">المسمى الوظيفي</label>
                <input value={inviteForm.title} onChange={(e) => setInviteForm({ ...inviteForm, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="مثال: مدير مشاريع" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">الدور</label>
                <select value={inviteForm.roleId} onChange={(e) => setInviteForm({ ...inviteForm, roleId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">بدون دور</option>
                  {roles.filter(r => !r.organizationId || r.organizationId === id).map((r) => (
                    <option key={r.id} value={r.id}>{r.nameAr || r.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowInvite(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm text-surface-700 hover:bg-surface-50">إلغاء</button>
                <button onClick={handleInvite} className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">دعوة</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="divide-y">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-4 hover:bg-surface-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-surface-900">{m.user.name}</p>
                  <p className="text-sm text-surface-500">{m.user.email}</p>
                  {m.title && <p className="text-xs text-surface-400">{m.title}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={m.roleId || ""}
                  onChange={(e) => handleRoleChange(m.user.id, e.target.value)}
                  className="text-sm border rounded-lg px-2 py-1"
                  disabled={m.isPrimary}
                >
                  <option value="">بدون دور</option>
                  {roles.filter(r => !r.organizationId || r.organizationId === id).map((r) => (
                    <option key={r.id} value={r.id}>{r.nameAr || r.name}</option>
                  ))}
                </select>
                {!m.isPrimary && (
                  <button onClick={() => handleRemove(m.user.id)} className="p-2 text-danger-500 hover:bg-danger-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {m.isPrimary && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">المالك</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
