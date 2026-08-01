"use client"

import { useState, useEffect } from "react"
import { FileSpreadsheet, Search, Filter, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { QUOTATION_STATUSES } from "@/lib/constants"

export default function QuotationsPage() {
  const { t, language } = useLanguage()
  const [data, setData] = useState<any>({ items: [] })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set("status", statusFilter)
    const res = await fetch(`/api/quotations?${params}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [statusFilter])

  const getStatusBadge = (status: string) => {
    const s = QUOTATION_STATUSES[status as keyof typeof QUOTATION_STATUSES]
    if (!s) return <span className="px-2 py-0.5 rounded text-xs bg-surface-100 text-surface-700">{status}</span>
    return <span className={`px-2 py-0.5 rounded text-xs ${s.color}`}>{language === "ar" ? s.label : s.labelEn}</span>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t("quotations")}</h1>
          <p className="text-surface-500 text-sm mt-1">
            {language === "ar" ? `إجمالي ${data.items.length} عرض` : `Total ${data.items.length} quotations`}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input placeholder={language === "ar" ? "بحث عن عرض سعر..." : "Search quotations..."} className="w-full pr-10 pl-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-flagship-200 outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">{language === "ar" ? "كل الحالات" : "All Statuses"}</option>
          {Object.entries(QUOTATION_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{language === "ar" ? val.label : val.labelEn}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">{t("loading")}</div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-2xl">
          <FileSpreadsheet className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">{language === "ar" ? "لا توجد عروض أسعار" : "No Quotations"}</h3>
          <p className="text-surface-500">{language === "ar" ? "لم يتم تقديم أي عروض أسعار بعد" : "No quotations have been submitted yet"}</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-50 border-b text-xs font-semibold text-surface-500 uppercase tracking-wider">
            <div className="col-span-3">{language === "ar" ? "الرقم المرجعي" : "Reference"}</div>
            <div className="col-span-2">{t("supplier")}</div>
            <div className="col-span-2">{t("quotationStatus")}</div>
            <div className="col-span-2">{t("quotationTotal")}</div>
            <div className="col-span-3">{t("date")}</div>
          </div>
          {data.items.map((q: any) => (
            <div key={q.id} className="block md:grid md:grid-cols-12 gap-4 px-6 py-4 border-b hover:bg-surface-50 transition-colors">
              <div className="col-span-3 flex items-center">
                <span className="text-sm font-mono font-medium text-surface-900">{q.referenceNumber}</span>
              </div>
              <div className="col-span-2 flex items-center text-sm text-surface-700">
                {q.supplier?.name || q.supplier?.companyName || "—"}
              </div>
              <div className="col-span-2 flex items-center">{getStatusBadge(q.status)}</div>
              <div className="col-span-2 flex items-center text-sm font-medium text-surface-900">
                {q.grandTotal?.toFixed(2)} {t("currency")}
              </div>
              <div className="col-span-3 flex items-center text-sm text-surface-500">
                {new Date(q.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
