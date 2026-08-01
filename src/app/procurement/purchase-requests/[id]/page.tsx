"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowRight, FileText, CheckCircle, XCircle, Clock, AlertCircle, User, Building2, MapPin, Calendar, Tag } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { PR_STATUSES, PR_PRIORITIES } from "@/lib/constants"

export default function PurchaseRequestDetailPage() {
  const { t, language } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const [pr, setPr] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [showReject, setShowReject] = useState(false)

  useEffect(() => {
    fetch(`/api/purchase-requests/${params.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setPr(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleApprove = async () => {
    setActionLoading(true)
    const res = await fetch(`/api/purchase-requests/${params.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "APPROVE" }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPr(updated)
    }
    setActionLoading(false)
  }

  const handleReject = async () => {
    setActionLoading(true)
    const res = await fetch(`/api/purchase-requests/${params.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REJECT", reason: rejectReason }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPr(updated)
      setShowReject(false)
    }
    setActionLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const s = PR_STATUSES[status as keyof typeof PR_STATUSES]
    if (!s) return <span className="px-2 py-1 rounded text-xs bg-surface-100 text-surface-700">{status}</span>
    return <span className={`px-2 py-1 rounded text-xs font-medium ${s.color}`}>{language === "ar" ? s.label : s.labelEn}</span>
  }

  const getPriorityBadge = (priority: string) => {
    const p = PR_PRIORITIES[priority as keyof typeof PR_PRIORITIES]
    if (!p) return null
    return <span className={`px-2 py-1 rounded text-xs font-medium ${p.color}`}>{language === "ar" ? p.label : p.labelEn}</span>
  }

  if (loading) return <div className="p-8 text-center text-surface-500">{t("loading")}</div>
  if (!pr) return <div className="p-8 text-center text-surface-500">{t("noResults")}</div>

  const canApprove = pr.status === "DRAFT" || pr.status === "PENDING_APPROVAL"

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-100 rounded-lg">
          <ArrowRight className="w-5 h-5 text-surface-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900">{pr.title}</h1>
            {getStatusBadge(pr.status)}
            {getPriorityBadge(pr.priority)}
          </div>
          <p className="text-surface-500 text-sm mt-1">
            {language === "ar" ? `تم الإنشاء في ${new Date(pr.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}` : `Created on ${new Date(pr.createdAt).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold text-surface-900 mb-4">{language === "ar" ? "تفاصيل الطلب" : "Request Details"}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-surface-500">{t("prCategory")}</p>
                <p className="font-medium text-surface-900">{pr.category}</p>
              </div>
              {pr.expectedDelivery && (
                <div>
                  <p className="text-surface-500">{t("expectedDelivery")}</p>
                  <p className="font-medium text-surface-900">{new Date(pr.expectedDelivery).toLocaleDateString()}</p>
                </div>
              )}
              {pr.deliveryLocation && (
                <div>
                  <p className="text-surface-500">{t("deliveryLocation")}</p>
                  <p className="font-medium text-surface-900">{pr.deliveryLocation}</p>
                </div>
              )}
              <div>
                <p className="text-surface-500">{language === "ar" ? "طلب بواسطة" : "Requested by"}</p>
                <p className="font-medium text-surface-900">{pr.requestedBy?.name || pr.requestedBy?.companyName || "—"}</p>
              </div>
            </div>
            {pr.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-surface-500 text-sm mb-1">{t("description")}</p>
                <p className="text-surface-900 text-sm">{pr.description}</p>
              </div>
            )}
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold text-surface-900 mb-4">{t("prItems")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-surface-500 text-xs">
                    <th className="text-right pb-2 font-medium">{language === "ar" ? "المادة" : "Material"}</th>
                    <th className="text-right pb-2 font-medium">{t("prItemQuantity")}</th>
                    <th className="text-right pb-2 font-medium">{t("prItemUnit")}</th>
                    <th className="text-right pb-2 font-medium">{t("prItemEstPrice")}</th>
                    <th className="text-right pb-2 font-medium">{t("prItemTotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pr.items?.map((item: any, i: number) => (
                    <tr key={item.id || i} className="border-b last:border-0">
                      <td className="py-3">
                        <p className="font-medium text-surface-900">{item.materialName}</p>
                        {item.description && <p className="text-xs text-surface-500">{item.description}</p>}
                      </td>
                      <td className="py-3 text-surface-700">{item.quantity}</td>
                      <td className="py-3 text-surface-700">{item.unit}</td>
                      <td className="py-3 text-surface-700">{item.estimatedPrice?.toFixed(2) || "—"}</td>
                      <td className="py-3 font-medium text-surface-900">{item.total?.toFixed(2) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-sm text-surface-500">{language === "ar" ? "الإجمالي التقديري" : "Estimated Total"}</span>
              <span className="text-lg font-bold text-surface-900">
                {pr.items?.reduce((sum: number, i: Record<string, unknown>) => sum + (Number(i.total) || 0), 0).toFixed(2)} {t("currency")}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold text-surface-900 mb-4">{language === "ar" ? "الإجراءات" : "Actions"}</h2>
            {pr.status === "PENDING_APPROVAL" && (
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-success-500 text-white rounded-lg text-sm hover:bg-success-600 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {language === "ar" ? "اعتماد الطلب" : "Approve"}
                </button>
                <button
                  onClick={() => setShowReject(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-danger-300 text-danger-600 rounded-lg text-sm hover:bg-danger-50 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  {language === "ar" ? "رفض الطلب" : "Reject"}
                </button>
              </div>
            )}
            {pr.status === "DRAFT" && (
              <p className="text-sm text-surface-500 text-center py-4">
                {language === "ar" ? "الطلب في حالة مسودة" : "Request is in draft status"}
              </p>
            )}
            {(pr.status === "APPROVED" || pr.status === "REJECTED" || pr.status === "ORDERED") && (
              <div className="text-center py-4">
                {pr.status === "APPROVED" && <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-2" />}
                {pr.status === "REJECTED" && <XCircle className="w-12 h-12 text-danger-500 mx-auto mb-2" />}
                {pr.status === "ORDERED" && <AlertCircle className="w-12 h-12 text-info-500 mx-auto mb-2" />}
                <p className="text-sm text-surface-500">
                  {language === "ar"
                    ? `تم ${pr.status === "APPROVED" ? "اعتماد" : pr.status === "REJECTED" ? "رفض" : "طلب"} هذا الطلب`
                    : `This request has been ${pr.status.toLowerCase()}`}
                </p>
              </div>
            )}
          </div>

          {pr.approvedBy && (
            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-semibold text-surface-900 mb-3">{language === "ar" ? "المعتمد" : "Approved By"}</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-surface-500" />
                </div>
                <div>
                  <p className="font-medium text-sm text-surface-900">{pr.approvedBy.name}</p>
                  <p className="text-xs text-surface-500">{pr.approvedBy.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showReject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-surface-900 mb-4">
              {language === "ar" ? "سبب الرفض" : "Rejection Reason"}
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-amber-200 outline-none"
              placeholder={language === "ar" ? "اكتب سبب الرفض..." : "Enter rejection reason..."}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowReject(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm text-surface-700 hover:bg-surface-50">
                {t("cancel")}
              </button>
              <button onClick={handleReject} disabled={actionLoading} className="flex-1 px-4 py-2 bg-danger-500 text-white rounded-lg text-sm hover:bg-danger-600 disabled:opacity-50">
                {language === "ar" ? "تأكيد الرفض" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
