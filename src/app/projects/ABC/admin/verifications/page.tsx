"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, CheckCircle, XCircle, Search, FileText, User, Building2 } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { isPlatformStaffRole } from "@/lib/auth/platform-admin"

export default function AdminVerificationsPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const router = useRouter()
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    if (!session) return
    if (!isPlatformStaffRole((session.user as { id: string; role: string }).role)) { router.push("/projects/ABC?login=1"); return }
    fetch("/api/admin/verifications").then(r => r.ok ? r.json() : []).then((d) => {
      setVerifications(d || [])
      setLoading(false)
    })
  }, [session, router])

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

  const statusLabel = (status: string) => {
    if (status === "VERIFIED") return t("verified")
    if (status === "REJECTED") return t("rejected")
    if (status === "PENDING") return t("underReview")
    return status
  }
  const statusColor = (status: string) => {
    if (status === "VERIFIED") return "bg-success-100 text-success-700"
    if (status === "REJECTED") return "bg-danger-100 text-danger-700"
    if (status === "PENDING") return "bg-amber-100 text-amber-700"
    return "bg-surface-100 text-surface-700"
  }

  return (
    <AdminSurveyShell
      title={t("adminVerificationBoard")}
      subtitle={t("verificationsCount").replace("{{count}}", String(verifications.length))}
      loading={loading}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-surface-200 rounded-none overflow-hidden">
          <div className="px-4 py-3 border-b bg-surface-50">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-surface-400" />
              <input className="w-full border border-surface-200 rounded-none px-3 py-2 pr-9 text-sm" placeholder={t("verificationSearchPlaceholder")} />
            </div>
          </div>
          {verifications.length === 0 ? (
            <div className="p-12 text-center text-surface-500">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-surface-300" />
              {t("verificationsCount").replace("{{count}}", "0")}
            </div>
          ) : (
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
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColor(v.status)}`}>
                      {statusLabel(v.status)}
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
                    {t("verificationLevel").replace("{{level}}", String(v.level))} · {new Date(v.submittedAt).toLocaleDateString()}
                  </p>
                  {v.documents?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {v.documents.map((d: any) => (
                        <span key={d.id} className={`text-xs px-2 py-0.5 rounded ${
                          d.status === "VERIFIED" ? "bg-success-50 text-success-600" :
                          d.status === "REJECTED" ? "bg-danger-50 text-danger-600" : "bg-surface-100 text-surface-600"
                        }`}>
                          {d.docType}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-surface-200 rounded-none p-6">
          {selected ? (
            <>
              <h3 className="font-semibold text-lg mb-1">{selected.user.name}</h3>
              <p className="text-sm text-surface-500 mb-4">{selected.user.email}</p>

              {selected.organization && (
                <div className="mb-4 p-3 bg-surface-50 rounded-none">
                  <p className="text-sm font-medium">{selected.organization.name}</p>
                  <p className="text-xs text-surface-500">{selected.organization.type}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-medium mb-2">{t("verificationDocsLabel").replace("{{count}}", String(selected.documents?.length || 0))}</p>
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
                <label className="block text-sm font-medium mb-1">{t("verificationReviewNotes")}</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full border border-surface-300 rounded-none px-3 py-2 text-sm"
                  rows={3}
                  placeholder={t("verificationReviewNotesPlaceholder")}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleReview(selected.id, "REJECTED")}
                  className="flex-1 flex items-center justify-center gap-1 px-4 py-2 border border-danger-200 text-danger-600 rounded-none text-sm hover:bg-danger-50"
                >
                  <XCircle className="w-4 h-4" />
                  {t("verificationReject")}
                </button>
                <button
                  onClick={() => handleReview(selected.id, "VERIFIED")}
                  className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-success-500 text-white rounded-none text-sm hover:bg-success-600"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t("verificationApprove")}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-surface-400 py-8">
              <ShieldCheck className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">{t("verificationSelectPrompt")}</p>
            </div>
          )}
        </div>
      </div>
    </AdminSurveyShell>
  )
}
