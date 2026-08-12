"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Search, ChevronRight, Clock, CheckCircle, XCircle, Truck, FileText } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { PO_STATUSES } from "@/lib/constants"

export default function PurchaseOrdersPage() {
  const { t, language } = useLanguage()
  const [data, setData] = useState<any>({ items: [], pagination: { total: 0, page: 1, totalPages: 0 } })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set("status", statusFilter)
    params.set("page", String(page))
    params.set("limit", "10")
    const res = await fetch(`/api/purchase-orders?${params}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [page, statusFilter])

  const getStatusBadge = (status: string) => {
    const s = PO_STATUSES[status as keyof typeof PO_STATUSES]
    if (!s) return <span className="px-2 py-0.5 rounded text-xs bg-surface-100 text-surface-700">{status}</span>
    return <span className={`px-2 py-0.5 rounded text-xs ${s.color}`}>{language === "ar" ? s.label : s.labelEn}</span>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t("purchaseOrders")}</h1>
          <p className="text-surface-500 text-sm mt-1">{language === "ar" ? `إجمالي ${data.pagination.total} أمر` : `Total ${data.pagination.total} orders`}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input placeholder={language === "ar" ? "بحث عن أمر شراء..." : "Search POs..."} className="w-full pr-10 pl-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-flagship-200 outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">{language === "ar" ? "كل الحالات" : "All Statuses"}</option>
          {Object.entries(PO_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{language === "ar" ? val.label : val.labelEn}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">{t("loading")}</div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-2xl">
          <ShoppingCart className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">{language === "ar" ? "لا توجد أوامر شراء" : "No Purchase Orders"}</h3>
          <p className="text-surface-500 mb-6">{language === "ar" ? "لم يتم إنشاء أي أمر شراء بعد" : "No purchase orders have been created yet"}</p>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-50 border-b text-xs font-semibold text-surface-500 uppercase tracking-wider">
              <div className="col-span-2">{t("poNumber")}</div>
              <div className="col-span-3">{language === "ar" ? "المورد" : "Supplier"}</div>
              <div className="col-span-2">{t("poStatus")}</div>
              <div className="col-span-2">{t("poTotal")}</div>
              <div className="col-span-3">{t("date")}</div>
            </div>
            {data.items.map((po: any) => (
              <div key={po.id} className="block md:grid md:grid-cols-12 gap-4 px-6 py-4 border-b hover:bg-surface-50 transition-colors">
                <div className="col-span-2 flex items-center"><span className="text-sm font-mono font-medium text-surface-900">{po.poNumber}</span></div>
                <div className="col-span-3 flex items-center text-sm text-surface-700">{po.supplier?.name || po.supplier?.companyName || "—"}</div>
                <div className="col-span-2 flex items-center">{getStatusBadge(po.status)}</div>
                <div className="col-span-2 flex items-center text-sm font-medium text-surface-900">{po.totalAmount?.toFixed(2)} {t("currency")}</div>
                <div className="col-span-3 flex items-center text-sm text-surface-500">{new Date(po.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-surface-500">{language === "ar" ? `صفحة ${data.pagination.page} من ${data.pagination.totalPages}` : `Page ${data.pagination.page} of ${data.pagination.totalPages}`}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-surface-50">{language === "ar" ? "السابق" : "Previous"}</button>
                <button onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))} disabled={page >= data.pagination.totalPages} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-surface-50">{language === "ar" ? "التالي" : "Next"}</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
