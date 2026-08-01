"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Send, Clock, CheckCircle, XCircle, Users, FileSpreadsheet } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { RFQ_STATUSES } from "@/lib/constants"

export default function RFQsPage() {
  const { t, language } = useLanguage()
  const [data, setData] = useState<any>({ items: [], pagination: { total: 0, page: 1, totalPages: 0 } })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    params.set("page", String(page))
    params.set("limit", "10")
    const res = await fetch("/api/rfqs?" + params.toString())
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData() }

  const getStatusBadge = (status: string) => {
    const s = RFQ_STATUSES[status as keyof typeof RFQ_STATUSES]
    if (!s) return <span className="px-2 py-0.5 rounded text-xs bg-surface-100 text-surface-700">{status}</span>
    const color = s.color
    return <span className={"px-2 py-0.5 rounded text-xs " + color}>{language === "ar" ? s.label : s.labelEn}</span>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t("rfqs")}</h1>
          <p className="text-surface-500 text-sm mt-1">
            {language === "ar" ? "إجمالي " + data.pagination.total + " طلب" : "Total " + data.pagination.total + " RFQs"}
          </p>
        </div>
        <Link href="/procurement/rfqs/new" className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm">
          <Plus className="w-4 h-4" />
          {t("createRfq")}
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={language === "ar" ? "بحث عن طلب..." : "Search RFQs..."} className="w-full pr-10 pl-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-info-200 outline-none" />
          </div>
          <button type="submit" className="px-4 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm hover:bg-surface-200"><Search className="w-4 h-4" /></button>
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">{language === "ar" ? "كل الحالات" : "All Statuses"}</option>
          {Object.entries(RFQ_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{language === "ar" ? val.label : val.labelEn}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">{t("loading")}</div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-2xl">
          <Send className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">{language === "ar" ? "لا توجد طلبات عروض أسعار" : "No RFQs"}</h3>
          <p className="text-surface-500 mb-6">{language === "ar" ? "ابدأ بإنشاء أول طلب عرض سعر" : "Create your first RFQ"}</p>
          <Link href="/procurement/rfqs/new" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600"><Plus className="w-5 h-5" />{t("createRfq")}</Link>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-50 border-b text-xs font-semibold text-surface-500 uppercase tracking-wider">
              <div className="col-span-3">{t("rfqTitle")}</div>
              <div className="col-span-2">{t("rfqReference")}</div>
              <div className="col-span-2">{t("rfqStatus")}</div>
              <div className="col-span-2">{t("rfqDeadline")}</div>
              <div className="col-span-3">{language === "ar" ? "الردود" : "Responses"}</div>
            </div>
            {data.items.map((rfq: any) => (
              <div key={rfq.id} className="block md:grid md:grid-cols-12 gap-4 px-6 py-4 border-b hover:bg-surface-50 transition-colors">
                <div className="col-span-3 flex items-center">
                  <span className="text-sm font-medium text-surface-900 truncate">{rfq.title}</span>
                </div>
                <div className="col-span-2 hidden md:flex items-center">
                  <span className="text-sm text-surface-700 font-mono">{rfq.referenceNumber}</span>
                </div>
                <div className="col-span-2 hidden md:flex items-center">{getStatusBadge(rfq.status)}</div>
                <div className="col-span-2 hidden md:flex items-center text-sm text-surface-500">
                  {rfq.deadlineDate ? new Date(rfq.deadlineDate).toLocaleDateString() : "-"}
                </div>
                <div className="col-span-3 hidden md:flex items-center gap-4 text-sm text-surface-500">
                  <span><Users className="w-3.5 h-3.5 inline mr-1" />{rfq._count?.suppliers || 0}</span>
                  <span><FileSpreadsheet className="w-3.5 h-3.5 inline mr-1" />{rfq._count?.quotations || 0}</span>
                </div>
                <div className="flex md:hidden items-center gap-2 mt-2">
                  {getStatusBadge(rfq.status)}
                  <span className="text-xs text-surface-400 mr-auto">{rfq.referenceNumber}</span>
                </div>
              </div>
            ))}
          </div>
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-surface-500">
                {language === "ar"
                  ? "صفحة " + data.pagination.page + " من " + data.pagination.totalPages
                  : "Page " + data.pagination.page + " of " + data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-surface-50">
                  {language === "ar" ? "السابق" : "Previous"}
                </button>
                <button onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))} disabled={page >= data.pagination.totalPages} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-surface-50">
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
