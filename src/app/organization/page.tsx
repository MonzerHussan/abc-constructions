"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building2, Plus, Users, ChevronRight, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { useSession } from "next-auth/react"

const ORG_TYPES = [
  { value: "PROJECT_OWNER", label: "مالك مشروع", labelEn: "Project Owner" },
  { value: "CONSULTANT", label: "استشاري", labelEn: "Consultant" },
  { value: "MAIN_CONTRACTOR", label: "مقاول رئيسي", labelEn: "Main Contractor" },
  { value: "SUBCONTRACTOR", label: "مقاول فرعي", labelEn: "Subcontractor" },
  { value: "WORKSHOP", label: "ورشة / مصنع", labelEn: "Workshop / Fabricator" },
  { value: "FREELANCER", label: "مستقل", labelEn: "Freelancer" },
  { value: "SUPPLIER", label: "مورد", labelEn: "Supplier" },
]

export default function OrganizationPage() {
  const { t, language } = useLanguage()
  const { data: session } = useSession()
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: "", nameAr: "", type: "PROJECT_OWNER" })

  const fetchOrgs = async () => {
    const res = await fetch("/api/organizations")
    if (res.ok) setOrgs(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchOrgs() }, [])

  const handleCreate = async () => {
    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowCreate(false)
      setForm({ name: "", nameAr: "", type: "PROJECT_OWNER" })
      fetchOrgs()
    }
  }

  const getTypeName = (type: string) => {
    const t = ORG_TYPES.find((o) => o.value === type)
    return language === "ar" ? t?.label : language === "ur" ? t?.label : t?.labelEn
  }

  if (loading) return <div className="p-8 text-center text-surface-500">{t("loading")}</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t("myOrganization")}</h1>
          <p className="text-surface-500 mt-1">إدارة المؤسسات والشركات التابعة لك</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إنشاء مؤسسة
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-lg font-bold mb-4">إنشاء مؤسسة جديدة</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">اسم المؤسسة (عربي)</label>
                <input value={form.nameAr || ""} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="مثال: شركة أبني للتطوير العقاري" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">اسم المؤسسة (إنجليزي)</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Example: ABC Development Co." />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">نوع المؤسسة</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {ORG_TYPES.map((ot) => (
                    <option key={ot.value} value={ot.value}>{language === "ar" ? ot.label : ot.labelEn}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm text-surface-700 hover:bg-surface-50">إلغاء</button>
                <button onClick={handleCreate} className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">إنشاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {orgs.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-surface-200 rounded-2xl">
          <Building2 className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">لا توجد مؤسسات بعد</h3>
          <p className="text-surface-500 mb-6">أنشئ مؤسستك الأولى لتبدأ بإدارة فريقك وصلاحياتك</p>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors">
            <Plus className="w-5 h-5" />
            إنشاء مؤسسة
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/organization/${org.id}`}
              className="flex items-center justify-between p-5 bg-white border rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">{language === "ar" ? (org.nameAr || org.name) : org.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                    <span className="px-2 py-0.5 bg-surface-100 rounded text-xs">{getTypeName(org.type)}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {org._count.users}
                    </span>
                    {org.isVerified && (
                      <span className="flex items-center gap-1 text-success-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        موثق
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
