"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, FileText, Send, Receipt, TrendingUp, AlertCircle, CheckCircle, Clock, Plus, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

export default function ProcurementDashboard() {
  const { t, language } = useLanguage()
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/purchase-requests?limit=1").then(r => r.ok ? r.json() : { pagination: { total: 0 } }),
      fetch("/api/purchase-requests?status=PENDING_APPROVAL&limit=1").then(r => r.ok ? r.json() : { pagination: { total: 0 } }),
      fetch("/api/rfqs?limit=1").then(r => r.ok ? r.json() : { pagination: { total: 0 } }),
      fetch("/api/purchase-orders?limit=1").then(r => r.ok ? r.json() : { pagination: { total: 0 } }),
      fetch("/api/invoices?status=PENDING&limit=1").then(r => r.ok ? r.json() : { pagination: { total: 0 } }),
    ]).then(([prs, pendingPRs, rfqs, pos, pendingInvoices]) => {
      setStats({
        totalPRs: prs.pagination?.total || 0,
        pendingPRs: pendingPRs.pagination?.total || 0,
        totalRFQs: rfqs.pagination?.total || 0,
        totalPOs: pos.pagination?.total || 0,
        pendingInvoices: pendingInvoices.pagination?.total || 0,
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const cards = [
    { label: t("totalPRs"), value: stats.totalPRs ?? "—", icon: FileText, href: "/procurement/purchase-requests", color: "bg-info-50 text-info-600" },
    { label: t("pendingPRs"), value: stats.pendingPRs ?? "—", icon: AlertCircle, href: "/procurement/purchase-requests?status=PENDING_APPROVAL", color: "bg-amber-50 text-amber-600" },
    { label: t("activeRFQs"), value: stats.totalRFQs ?? "—", icon: Send, href: "/procurement/rfqs", color: "bg-success-50 text-success-600" },
    { label: t("totalPOs"), value: stats.totalPOs ?? "—", icon: ShoppingCart, href: "/procurement/purchase-orders", color: "bg-flagship-50 text-flagship-600" },
    { label: t("pendingInvoices"), value: stats.pendingInvoices ?? "—", icon: Receipt, href: "/procurement/invoices", color: "bg-danger-50 text-danger-600" },
  ]

  if (loading) return <div className="p-8 text-center text-surface-500">{t("loading")}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t("procurementDashboard")}</h1>
          <p className="text-surface-500 mt-1">
            {language === "ar" ? "إدارة المشتريات والموردين" : language === "ur" ? "خریداری اور سپلائرز کا انتظام" : "Procurement & Supplier Management"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/procurement/purchase-requests/new" className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            {t("createPurchaseRequest")}
          </Link>
          <Link href="/procurement/rfqs/new" className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-900 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            {t("createRfq")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href} className="bg-white border rounded-xl p-4 hover:shadow-md hover:border-amber-200 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-surface-900">{card.value}</p>
              <p className="text-xs text-surface-500 mt-1">{card.label}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-surface-900">
              {language === "ar" ? "إجراءات سريعة" : language === "ur" ? "فوری اقدامات" : "Quick Actions"}
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { href: "/procurement/purchase-requests/new", label: language === "ar" ? "إنشاء طلب شراء جديد" : "Create Purchase Request", icon: FileText },
              { href: "/procurement/rfqs/new", label: language === "ar" ? "إرسال طلب عرض سعر" : "Send RFQ", icon: Send },
              { href: "/procurement/purchase-orders", label: language === "ar" ? "عرض أوامر الشراء" : "View Purchase Orders", icon: ShoppingCart },
              { href: "/procurement/invoices", label: language === "ar" ? "إدارة الفواتير" : "Manage Invoices", icon: Receipt },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-surface-600" />
                    </div>
                    <span className="text-sm font-medium text-surface-700">{item.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-surface-400" />
                </Link>
              )
            })}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-surface-900">
              {language === "ar" ? "سير عمل المشتريات" : language === "ur" ? "خریداری کا ورک فلو" : "Procurement Workflow"}
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { step: "1", label: language === "ar" ? "طلب شراء" : "Purchase Request", desc: language === "ar" ? "تقديم طلب شراء المواد" : "Submit material request" },
              { step: "2", label: language === "ar" ? "عروض أسعار" : "RFQ & Quotations", desc: language === "ar" ? "طلب واستلام عروض الأسعار" : "Request and receive quotes" },
              { step: "3", label: language === "ar" ? "أمر شراء" : "Purchase Order", desc: language === "ar" ? "إصدار أمر الشراء" : "Issue purchase order" },
              { step: "4", label: language === "ar" ? "استلام ودفع" : "Receipt & Payment", desc: language === "ar" ? "استلام البضائع ودفع الفواتير" : "Receive goods & pay invoices" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-sm text-surface-900">{item.label}</p>
                  <p className="text-xs text-surface-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
