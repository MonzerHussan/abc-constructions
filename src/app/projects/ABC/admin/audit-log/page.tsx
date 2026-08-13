"use client"

import { useState, useEffect } from "react"
import { Clock, Search, User, Building2, FileText, ChevronLeft, ChevronRight, Loader2, ShieldCheck, Globe, Smartphone } from "lucide-react"

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "تسجيل دخول", LOGOUT: "تسجيل خروج",
  CREATE: "إنشاء", UPDATE: "تحديث", DELETE: "حذف",
  APPROVE: "اعتماد", REJECT: "رفض",
  VERIFY: "توثيق", SUSPEND: "تعليق",
  ACTIVATE: "تفعيل", DEACTIVATE: "إلغاء تفعيل",
  ASSIGN_ROLE: "تعيين دور", REVOKE_ROLE: "سحب دور",
  SUBMIT_BID: "تقديم عرض", AWARD_TENDER: "منح عطاء",
  MAKE_PAYMENT: "دفع", APPROVE_PAYMENT: "اعتماد دفعة",
  UPLOAD_DOCUMENT: "رفع مستند",
  CREATE_CAMPAIGN: "إنشاء حملة", PUBLISH_CAMPAIGN: "نشر حملة",
  SEND_INVITATION: "إرسال دعوة", EXPORT_DATA: "تصدير بيانات",
  GENERATE_INSIGHT: "توليد تحليل",
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "text-info-600 bg-info-50", LOGOUT: "text-surface-600 bg-surface-50",
  CREATE: "text-success-600 bg-success-50", UPDATE: "text-amber-600 bg-amber-50",
  DELETE: "text-danger-600 bg-danger-50",
  APPROVE: "text-emerald-600 bg-emerald-50", REJECT: "text-danger-600 bg-danger-50",
  VERIFY: "text-flagship-600 bg-flagship-50", SUSPEND: "text-amber-600 bg-amber-50",
  ACTIVATE: "text-teal-600 bg-teal-50", DEACTIVATE: "text-surface-600 bg-surface-50",
  ASSIGN_ROLE: "text-flagship-600 bg-flagship-50", REVOKE_ROLE: "text-danger-600 bg-danger-50",
  SUBMIT_BID: "text-info-600 bg-info-50", AWARD_TENDER: "text-warning-600 bg-warning-50",
  MAKE_PAYMENT: "text-warning-600 bg-warning-50", APPROVE_PAYMENT: "text-emerald-600 bg-emerald-50",
  UPLOAD_DOCUMENT: "text-info-600 bg-info-50",
  CREATE_CAMPAIGN: "text-flagship-600 bg-flagship-50", PUBLISH_CAMPAIGN: "text-flagship-600 bg-flagship-50",
  SEND_INVITATION: "text-info-600 bg-info-50", EXPORT_DATA: "text-surface-600 bg-surface-100",
  GENERATE_INSIGHT: "text-flagship-600 bg-flagship-50",
}

const ACTION_OPTIONS = Object.keys(ACTION_LABELS)

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<any>(null)
  const limit = 25

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(limit), offset: String((page - 1) * limit) })
    if (action) params.set("action", action)
    if (search) params.set("userId", search)

    fetch(`/api/admin/audit-log?${params}`)
      .then(r => r.ok ? r.json() : { logs: [], total: 0 })
      .then(d => {
        setLogs(d.logs || [])
        setTotal(d.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [action, search, page])

  const totalPages = Math.ceil(total / limit)

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return "الآن"
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} د`
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} س`
    return d.toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const entityLabel = (entity: string) => {
    const map: Record<string, string> = {
      User: "مستخدم", Organization: "مؤسسة", Project: "مشروع",
      ProjectTender: "مناقصة مشروع", MaterialTender: "مناقصة مواد",
      Bid: "عرض", Job: "وظيفة", Course: "دورة",
      Verification: "توثيق", Payment: "دفعة", Invoice: "فاتورة",
      PurchaseOrder: "أمر شراء", PurchaseRequest: "طلب شراء",
      Role: "دور", Permission: "صلاحية",
      Campaign: "حملة", Survey: "استبيان",
    }
    return map[entity] || entity
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-surface-100 to-surface-100 rounded-2xl flex items-center justify-center">
          <Clock className="w-7 h-7 text-surface-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">سجل التدقيق</h1>
          <p className="text-surface-500">سجل العمليات الحساسة غير القابل للتعديل — {total} عملية</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full border rounded-lg px-3 py-2 pr-9 text-sm"
            placeholder="بحث برقم المستخدم..."
          />
        </div>
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1) }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">جميع الإجراءات</option>
          {ACTION_OPTIONS.map((key) => (
            <option key={key} value={key}>{ACTION_LABELS[key]}</option>
          ))}
        </select>
        <span className="text-xs text-surface-400 bg-surface-50 px-2 py-1 rounded">
          {total} نتيجة
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-surface-400" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-surface-300" />
          <p className="text-surface-500">لا توجد سجلات مطابقة</p>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="divide-y">
              {logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelected(selected?.id === log.id ? null : log)}
                  className={`p-4 cursor-pointer hover:bg-surface-50 transition-colors ${selected?.id === log.id ? "bg-surface-50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${ACTION_COLORS[log.action] || "text-surface-600 bg-surface-100"}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                      <span className="text-xs text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded">
                        {entityLabel(log.entity)}
                      </span>
                      {log.organization && (
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {log.organization.name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-surface-400">{formatDate(log.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-surface-600">
                    {log.user ? (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-surface-400" />
                        {log.user.name || log.user.email}
                      </span>
                    ) : (
                      <span className="text-surface-400">—</span>
                    )}
                    {log.entityId && (
                      <span className="text-xs text-surface-400 font-mono">
                        #{log.entityId.slice(0, 8)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-surface-400">
                      <Globe className="w-3 h-3" />
                      {log.ip || "—"}
                    </span>
                  </div>

                  {selected?.id === log.id && (
                    <div className="mt-3 pt-3 border-t text-sm space-y-2">
                      {log.details && (
                        <div>
                          <p className="text-xs font-medium text-surface-500 mb-1">التفاصيل</p>
                          <pre className="text-xs bg-surface-50 p-2 rounded overflow-x-auto text-surface-700">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.userAgent && (
                        <div className="flex items-center gap-1 text-xs text-surface-400">
                          <Smartphone className="w-3 h-3" />
                          {log.userAgent}
                        </div>
                      )}
                      <p className="text-xs text-surface-400 font-mono">ID: {log.id}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border hover:bg-surface-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 3, totalPages - 6))
                const p = start + i
                if (p > totalPages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm rounded-lg ${page === p ? "bg-amber-50 text-amber-700 font-medium" : "hover:bg-surface-50"}`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border hover:bg-surface-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
