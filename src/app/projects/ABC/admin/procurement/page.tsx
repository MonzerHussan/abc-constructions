"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart, FileText, Send, Receipt, DollarSign, Package } from "lucide-react"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import type { TranslationKey } from "@/lib/translations"

export default function AdminProcurementPage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    Promise.all([
      fetch("/api/purchase-requests?limit=1").then(r => r.ok ? r.json() : { pagination: { total: 0 } }),
      fetch("/api/purchase-requests?status=PENDING_APPROVAL&limit=1").then(r => r.ok ? r.json() : { pagination: { total: 0 } }),
      fetch("/api/rfqs?limit=1").then(r => r.ok ? r.json() : { pagination: { total: 0 } }),
      fetch("/api/purchase-orders?limit=1").then(r => r.ok ? r.json() : { pagination: { total: 0 } }),
      fetch("/api/invoices?status=PENDING&limit=1").then(r => r.ok ? r.json() : { items: [] }),
      fetch("/api/invoices?status=PAID&limit=1").then(r => r.ok ? r.json() : { items: [] }),
    ]).then(([prs, pendingPRs, rfqs, pos, pendingInvs, paidInvs]) => {
      const totalPaid = paidInvs.items?.reduce((sum: number, i: Record<string, unknown>) => sum + (Number(i.totalAmount) || 0), 0) || 0
      setStats({
        totalPRs: prs.pagination?.total || 0,
        pendingPRs: pendingPRs.pagination?.total || 0,
        totalRFQs: rfqs.pagination?.total || 0,
        totalPOs: pos.pagination?.total || 0,
        pendingInvoices: pendingInvs.items?.length || 0,
        totalSpend: totalPaid,
      })
    })
  }, [])

  const cards: {
    labelKey: TranslationKey
    value: string | number
    icon: typeof FileText
    color: string
    href: string
  }[] = [
    { labelKey: "totalPRs", value: stats.totalPRs, icon: FileText, color: "bg-info-50 text-info-600", href: "/projects/ABC/procurement/purchase-requests" },
    { labelKey: "pendingPRs", value: stats.pendingPRs, icon: Send, color: "bg-amber-50 text-amber-600", href: "/projects/ABC/procurement/purchase-requests?status=PENDING_APPROVAL" },
    { labelKey: "activeRFQs", value: stats.totalRFQs, icon: Package, color: "bg-success-50 text-success-600", href: "/projects/ABC/procurement/rfqs" },
    { labelKey: "totalPOs", value: stats.totalPOs, icon: ShoppingCart, color: "bg-flagship-50 text-flagship-600", href: "/projects/ABC/procurement/purchase-orders" },
    { labelKey: "pendingInvoices", value: stats.pendingInvoices, icon: Receipt, color: "bg-danger-50 text-danger-600", href: "/projects/ABC/procurement/invoices" },
    { labelKey: "monthlySpend", value: `${stats.totalSpend?.toFixed(0) || 0} ${t("currency")}`, icon: DollarSign, color: "bg-emerald-50 text-emerald-600", href: "/projects/ABC/procurement/invoices" },
  ]

  return (
    <AdminSurveyShell title={t("procurementDashboard")} subtitle={t("procurementSubtitle")}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.labelKey} href={card.href} className="bg-surface-50/60 border border-surface-200 rounded-none p-4 hover:border-secondary-300 transition-colors">
              <div className={`w-10 h-10 rounded-none flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-surface-900">{card.value}</p>
              <p className="text-xs text-surface-500 mt-1">{t(card.labelKey)}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/projects/ABC/procurement/purchase-requests" className="bg-white border border-surface-200 rounded-none p-5 hover:border-secondary-300 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-info-50 rounded-none flex items-center justify-center">
              <FileText className="w-5 h-5 text-info-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">{t("purchaseRequests")}</h3>
              <p className="text-sm text-surface-500">{t("prSubtitle")}</p>
            </div>
          </div>
          <div className="text-sm text-surface-600">
            {stats.pendingPRs > 0
              ? `${stats.pendingPRs} ${t("pendingPRs")}`
              : t("prAllProcessed")}
          </div>
        </Link>

        <Link href="/projects/ABC/procurement/rfqs" className="bg-white border border-surface-200 rounded-none p-5 hover:border-secondary-300 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-success-50 rounded-none flex items-center justify-center">
              <Send className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">{t("rfqs")}</h3>
              <p className="text-sm text-surface-500">{t("procurementWorkflow")}</p>
            </div>
          </div>
          <div className="text-sm text-surface-600">
            {stats.totalRFQs > 0
              ? `${stats.totalRFQs} ${t("activeRFQs")}`
              : t("noPurchaseRequests")}
          </div>
        </Link>
      </div>
    </AdminSurveyShell>
  )
}