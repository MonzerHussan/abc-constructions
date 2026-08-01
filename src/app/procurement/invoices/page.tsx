"use client"

import { useState, useEffect } from "react"
import { Receipt, Search, Filter, CheckCircle, Clock, XCircle, AlertCircle, DollarSign } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { INVOICE_STATUSES } from "@/lib/constants"

export default function InvoicesPage() {
  const { t, language } = useLanguage()
  const [data, setData] = useState<any>({ items: [] })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set("status", statusFilter)
    const res = await fetch(`/api/invoices?${params}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [statusFilter])

  const getStatusBadge = (status: string) => {
    const s = INVOICE_STATUSES[status as keyof typeof INVOICE_STATUSES]
    if (!s) return <span className="px-2 py-0.5 rounded text-xs bg-surface-100 text-surface-700">{status}</span>
    return <span className={`px-2 py-0.5 rounded text-xs ${s.color}`}>{language === "ar" ? s.label : s.labelEn}</span>
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "PAID": return <CheckCircle className="w-4 h-4 text-success-500" />
      case "PENDING": return <Clock className="w-4 h-4 text-surface-500" />
      case "DISPUTED": return <AlertCircle className="w-4 h-4 text-danger-500" />
      case "VERIFIED": return <CheckCircle className="w-4 h-4 text-flagship-500" />
      case "APPROVED": return <DollarSign className="w-4 h-4 text-success-500" />
      default: return <Receipt className="w-4 h-4 text-surface-400" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t("invoices")}</h1>
          <p className="text-surface-500 text-sm mt-1">
            {language === "ar" ? `إجمالي ${data.items.length} فاتورة` : `Total ${data.items.length} invoices`}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            placeholder={language === "ar" ? "بحث عن فاتورة..." : "Search invoices..."}
            className="w-full pr-10 pl-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-amber-200 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">{language === "ar" ? "كل الحالات" : "All Statuses"}</option>
          {Object.entries(INVOICE_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{language === "ar" ? val.label : val.labelEn}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">{t("loading")}</div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-2xl">
          <Receipt className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">
            {language === "ar" ? "لا توجد فواتير" : "No Invoices"}
          </h3>
          <p className="text-surface-500 mb-6">
            {language === "ar" ? "لم يتم إضافة أي فواتير بعد" : "No invoices have been added yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-50 border-b text-xs font-semibold text-surface-500 uppercase tracking-wider">
            <div className="col-span-2">{t("invoiceNumber")}</div>
            <div className="col-span-2">{t("supplier")}</div>
            <div className="col-span-2">{t("invoiceStatus")}</div>
            <div className="col-span-2">{t("invoiceAmount")}</div>
            <div className="col-span-2">{t("invoiceDueDate")}</div>
            <div className="col-span-2">{language === "ar" ? "أمر الشراء" : "PO"}</div>
          </div>
          {data.items.map((inv: any) => (
            <div key={inv.id} className="block md:grid md:grid-cols-12 gap-4 px-6 py-4 border-b hover:bg-surface-50 transition-colors">
              <div className="col-span-2 flex items-center gap-2">
                <span className="hidden md:block">{statusIcon(inv.status)}</span>
                <span className="text-sm font-mono font-medium text-surface-900">{inv.invoiceNumber}</span>
              </div>
              <div className="col-span-2 flex items-center text-sm text-surface-700">
                {inv.supplier?.name || inv.supplier?.companyName || "—"}
              </div>
              <div className="col-span-2 flex items-center">
                {getStatusBadge(inv.status)}
              </div>
              <div className="col-span-2 flex items-center text-sm font-medium text-surface-900">
                {inv.totalAmount?.toFixed(2)} {t("currency")}
              </div>
              <div className="col-span-2 flex items-center text-sm text-surface-500">
                {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
              </div>
              <div className="col-span-2 flex items-center text-sm text-surface-500">
                {inv.purchaseOrder?.poNumber || "—"}
              </div>
              <div className="flex md:hidden items-center gap-2 mt-2">
                {getStatusBadge(inv.status)}
                <span className="text-xs text-surface-400 mr-auto">{inv.totalAmount?.toFixed(2)} {t("currency")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
