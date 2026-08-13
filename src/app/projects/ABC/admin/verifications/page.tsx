"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, CheckCircle, XCircle, Clock, Search, FileText, User, Building2 } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { useSession } from "next-auth/react"

export default function AdminVerificationsPage() {
  const { t, language } = useLanguage()
  const { data: session } = useSession()
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    fetch("/api/admin/verifications").then(r => r.ok && r.json()).then((d) => {
      setVerifications(d || [])
      setLoading(false)
    })
  }, [])

  const handleReview = async (id: string, status: string) => {
    const res = await fetch("/api/admin/verifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, notes: reviewNotes }),
    })
    if (res.ok) {
      setSelected(null)
      setReviewNotes("")
      const data = await fetch("/api/admin/verifications").then(r => r.json())
      setVerifications(data)
    }
  }

  if (session?.user && !["ADMIN", "SUPER_ADMIN"].includes((session.user as { id: string; role: string }).role)) {
    return <div className="p-8 text-center text-surface-500">صلاحية الوصول مطلوبة</div>
  }

  if (loading) return <div className="p-8 text-center text-surface-500">{t("loading")}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-100 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">لوحة مراجعة التوثيق</h1>
          <p className="text-surface-500">{verifications.length} طلب توثيق</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b bg-surface-50">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-surface-400" />
              <input className="w-full border rounded-lg px-3 py-2 pr-9 text-sm" placeholder="بحث..." />
            </div>
          </div>
          <div className="divide-y max-h-[70vh] overflow-y-auto">
            {verifications.map((v) => (
              <div
                key={v.id}
                onClick={() => { setSelected(v); setReviewNotes("") }}
                className={`p-4 cursor-pointer hover:bg-surface-50 ${selected?.id === v.id ? "bg-amber-50" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-surface-400" />
                    <p className="font-medium text-sm">{v.user.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    v.status === "VERIFIED" ? "bg-success-100 text-success-700" :
                    v.status === "REJECTED" ? "bg-danger-100 text-danger-700" :
                    v.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-surface-100"
                  }`}>
                    {v.status === "VERIFIED" ? "مقبول" : v.status === "REJECTED" ? "مرفوض" : v.status === "PENDING" ? "قيد المراجعة" : v.status}
                  </span>
                </div>
                <p className="text-xs text-surface-500">{v.user.email}</p>
                {v.organization && (
                  <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {v.organization.name}
                  </p>
                )}
                <p className="text-xs text-surface-400 mt-1">
                  المستوى {v.level} · {new Date(v.submittedAt).toLocaleDateString("ar-SA")}
                </p>
                {v.documents?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {v.documents.map((d: any) => (
                      <span key={d.id} className={`text-xs px-2 py-0.5 rounded ${
                        d.status === "VERIFIED" ? "bg-success-50 text-success-600" :
                        d.status === "REJECTED" ? "bg-danger-50 text-danger-600" : "bg-surface-100"
                      }`}>
                        {d.docType}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          {selected ? (
            <>
              <h3 className="font-semibold text-lg mb-1">{selected.user.name}</h3>
              <p className="text-sm text-surface-500 mb-4">{selected.user.email}</p>

              {selected.organization && (
                <div className="mb-4 p-3 bg-surface-50 rounded-lg">
                  <p className="text-sm font-medium">{selected.organization.name}</p>
                  <p className="text-xs text-surface-500">{selected.organization.type}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-medium mb-2">المستندات ({selected.documents?.length || 0})</p>
                {selected.documents?.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-surface-400" />
                      <span className="text-sm">{d.fileName}</span>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      d.status === "VERIFIED" ? "bg-success-100 text-success-700" :
                      d.status === "REJECTED" ? "bg-danger-100 text-danger-700" : "bg-amber-100 text-amber-700"
                    }`}>{d.status}</span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">ملاحظات المراجعة</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="أضف ملاحظات..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleReview(selected.id, "REJECTED")}
                  className="flex-1 flex items-center justify-center gap-1 px-4 py-2 border border-danger-200 text-danger-600 rounded-lg text-sm hover:bg-danger-50"
                >
                  <XCircle className="w-4 h-4" />
                  رفض
                </button>
                <button
                  onClick={() => handleReview(selected.id, "VERIFIED")}
                  className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-success-500 text-white rounded-lg text-sm hover:bg-success-600"
                >
                  <CheckCircle className="w-4 h-4" />
                  اعتماد
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-surface-400 py-8">
              <ShieldCheck className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">اختر طلب توثيق للمراجعة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
