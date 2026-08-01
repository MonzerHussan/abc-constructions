"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Plus, Search, FileText, ChevronRight, Filter, AlertCircle, CheckCircle, Clock, XCircle, ArrowUpDown } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { PR_STATUSES, PR_PRIORITIES } from "@/lib/constants"

export default function PurchaseRequestsPage() {
  return <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center text-surface-500">Loading...</div>}><PurchaseRequestsContent /></Suspense>
}

function PurchaseRequestsContent() {
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>({ items: [], pagination: { total: 0, page: 1, totalPages: 0 } })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "")
  const [page, setPage] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    params.set("page", String(page))
    params.set("limit", "10")
    const res = await fetch(`/api/purchase-requests?${params}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData() }

  const getStatusBadge = (status: string) => {
    const s = PR_STATUSES[status as keyof typeof PR_STATUSES]
    if (!s) return <span className="px-2 py-0.5 rounded text-xs bg-surface-100 text-surface-700">{status}</span>
    return <span className={`px-2 py-0.5 rounded text-xs ${s.color}`}>{language === "ar" ? s.label : s.labelEn}</span>
  }

  const getPriorityBadge = (priority: string) => {
    const p = PR_PRIORITIES[priority as keyof typeof PR_PRIORITIES]
    if (!p) return null
    return <span className={`px-2 py-0.5 rounded text-xs ${p.color}`}>{language === "ar" ? p.label : p.labelEn}</span>
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle className="w-4 h-4 text-success-500" />
      case "REJECTED": return <XCircle className="w-4 h-4 text-danger-500" />
      case "PENDING_APPROVAL": return <Clock className="w-4 h-4 text-amber-500" />
      case "ORDERED": return <AlertCircle className="w-4 h-4 text-info-500" />
      default: return <FileText className="w-4 h-4 text-surface-400" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t("purchaseRequests")}</h1>
          <p className="text-surface-500 text-sm mt-1">
            {language === "ar" ? `إجمالي ${data.pagination.total} طلب` : `Total ${data.pagination.total} requests`}
          </p>
        </div>
        <Link
          href="/procurement/purchase-requests/new"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          {t("createPurchaseRequest")}
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === "ar" ? "بحث عن طلب..." : "Search requests..."}
              className="w-full pr-10 pl-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm hover:bg-surface-200">
            <Search className="w-4 h-4" />
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">{language === "ar" ? "كل الحالات" : "All Statuses"}</option>
          {Object.entries(PR_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{language === "ar" ? val.label : val.labelEn}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">{t("loading")}</div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-2xl">
          <FileText className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">
            {language === "ar" ? "لا توجد طلبات شراء" : "No Purchase Requests"}
          </h3>
          <p className="text-surface-500 mb-6">
            {language === "ar" ? "ابدأ بإنشاء أول طلب شراء" : "Create your first purchase request"}
          </p>
          <Link href="/procurement/purchase-requests/new" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600">
            <Plus className="w-5 h-5" />
            {t("createPurchaseRequest")}
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-50 border-b text-xs font-semibold text-surface-500 uppercase tracking-wider">
              <div className="col-span-4 flex items-center gap-1"><FileText className="w-3 h-3" />{t("prTitle")}</div>
              <div className="col-span-2">{t("prCategory")}</div>
              <div className="col-span-2">{t("prPriority")}</div>
              <div className="col-span-2">{t("prStatus")}</div>
              <div className="col-span-2">{t("date")}</div>
            </div>
            {data.items.map((pr: any) => (
              <Link key={pr.id} href={`/procurement/purchase-requests/${pr.id}`} className="block md:grid md:grid-cols-12 gap-4 px-6 py-4 border-b hover:bg-surface-50 transition-colors">
                <div className="col-span-4 flex items-start gap-3">
                  <div className="hidden md:block mt-0.5">{statusIcon(pr.status)}</div>
                  <div className="min-w-0">
                    <p className="font-medium text-surface-900 text-sm truncate">{pr.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {pr.requestedBy?.name || pr.requestedBy?.companyName || ""}
                      <span className="mx-1">·</span>
                      {pr.items?.length || 0} {language === "ar" ? "بند" : "items"}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 hidden md:flex items-center">
                  <span className="text-sm text-surface-700">{pr.category}</span>
                </div>
                <div className="col-span-2 hidden md:flex items-center">
                  {getPriorityBadge(pr.priority)}
                </div>
                <div className="col-span-2 hidden md:flex items-center">
                  {getStatusBadge(pr.status)}
                </div>
                <div className="col-span-2 hidden md:flex items-center text-sm text-surface-500">
                  {new Date(pr.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                </div>
                <div className="flex md:hidden items-center gap-2 mt-2">
                  {getPriorityBadge(pr.priority)}
                  {getStatusBadge(pr.status)}
                  <span className="text-xs text-surface-400 mr-auto">{new Date(pr.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-surface-500">
                {language === "ar"
                  ? `صفحة ${data.pagination.page} من ${data.pagination.totalPages}`
                  : `Page ${data.pagination.page} of ${data.pagination.totalPages}`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-surface-50"
                >
                  {language === "ar" ? "السابق" : "Previous"}
                </button>
                <button
                  onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                  disabled={page >= data.pagination.totalPages}
                  className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-surface-50"
                >
                  {language === "ar" ? "التالي" : "Next"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
