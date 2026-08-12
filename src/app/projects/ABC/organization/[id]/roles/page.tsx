"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Shield, Plus, Edit3, Trash2, ChevronLeft, Users } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

export default function RolesPage() {
  const { id } = useParams()
  const { t, language } = useLanguage()
  const [roles, setRoles] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: "", nameAr: "", description: "", permissionKeys: [] as string[] })

  const fetchData = async () => {
    const [rRes, pRes] = await Promise.all([
      fetch(`/api/organizations/${id}/roles`),
      fetch("/api/permissions"),
    ])
    if (rRes.ok) setRoles(await rRes.json())
    if (pRes.ok) setPermissions(await pRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", nameAr: "", description: "", permissionKeys: [] })
    setShowForm(true)
  }

  const openEdit = (role: any) => {
    setEditing(role)
    setForm({
      name: role.name,
      nameAr: role.nameAr || "",
      description: role.description || "",
      permissionKeys: role.permissions?.map((rp: any) => rp.permission.key) || [],
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    const url = editing
      ? `/api/organizations/${id}/roles/${editing.id}`
      : `/api/organizations/${id}/roles`
    const method = editing ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setEditing(null)
      fetchData()
    }
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm("تأكيد حذف الدور؟")) return
    const res = await fetch(`/api/organizations/${id}/roles/${roleId}`, { method: "DELETE" })
    if (res.ok) fetchData()
  }

  const togglePermission = (key: string) => {
    setForm((prev) => ({
      ...prev,
      permissionKeys: prev.permissionKeys.includes(key)
        ? prev.permissionKeys.filter((k) => k !== key)
        : [...prev.permissionKeys, key],
    }))
  }

  const groupedPermissions = permissions.reduce((acc: any, p: any) => {
    if (!acc[p.module]) acc[p.module] = []
    acc[p.module].push(p)
    return acc
  }, {} as Record<string, any[]>)

  if (loading) return <div className="p-8 text-center text-surface-500">{t("loading")}</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/projects/ABC/organization/${id}`} className="p-2 hover:bg-surface-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-surface-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">إدارة الأدوار والصلاحيات</h1>
            <p className="text-surface-500 text-sm">{roles.length} دور</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
          <Plus className="w-4 h-4" />
          دور جديد
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editing ? "تعديل دور" : "دور جديد"}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">الاسم (عربي)</label>
                  <input value={form.nameAr || ""} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="مدير مشاريع" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">الاسم (إنجليزي)</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Project Manager" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-3">الصلاحيات</label>
                <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {Object.entries(groupedPermissions).map(([module, perms]: [string, any]) => (
                    <div key={module}>
                      <p className="text-xs font-bold text-surface-500 uppercase mb-1">{module}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(perms as any[]).map((p) => (
                          <label key={p.key} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={form.permissionKeys.includes(p.key)}
                              onChange={() => togglePermission(p.key)}
                              className="rounded border-surface-300"
                            />
                            {language === "ar" ? (p.nameAr || p.name) : p.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm text-surface-700 hover:bg-surface-50">إلغاء</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">
                  {editing ? "حفظ التعديلات" : "إنشاء"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-flagship-50 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-flagship-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">{language === "ar" ? (role.nameAr || role.name) : role.name}</h3>
                  {role.description && <p className="text-xs text-surface-500">{role.description}</p>}
                </div>
              </div>
              {role.isSystem && <span className="text-xs bg-surface-100 px-2 py-0.5 rounded">نظام</span>}
            </div>

            {role.permissions?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {role.permissions.slice(0, 5).map((rp: any) => (
                  <span key={rp.permission.key} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                    {rp.permission.nameAr || rp.permission.name}
                  </span>
                ))}
                {role.permissions.length > 5 && (
                  <span className="text-xs text-surface-400">+{role.permissions.length - 5}</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-xs text-surface-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {role._count.users} مستخدم
              </span>
              {!role.isSystem && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(role)} className="p-1.5 text-surface-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(role.id)} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
