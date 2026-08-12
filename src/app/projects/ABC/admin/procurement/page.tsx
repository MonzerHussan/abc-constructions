"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, FileText, Send, Receipt, TrendingUp, DollarSign, Package, Users } from "lucide-react"

export default function AdminProcurementPage() {
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

  const cards = [
    { label: "طلبات الشراء", labelEn: "Purchase Requests", value: stats.totalPRs, icon: FileText, color: "bg-info-50 text-info-600", href: "/projects/ABC/procurement/purchase-requests" },
    { label: "بانتظار الموافقة", labelEn: "Pending Approval", value: stats.pendingPRs, icon: Send, color: "bg-amber-50 text-amber-600", href: "/projects/ABC/procurement/purchase-requests?status=PENDING_APPROVAL" },
    { label: "طلبات عروض الأسعار", labelEn: "RFQs", value: stats.totalRFQs, icon: Package, color: "bg-success-50 text-success-600", href: "/projects/ABC/procurement/rfqs" },
    { label: "أوامر الشراء", labelEn: "Purchase Orders", value: stats.totalPOs, icon: ShoppingCart, color: "bg-flagship-50 text-flagship-600", href: "/projects/ABC/procurement/purchase-orders" },
    { label: "فواتير معلقة", labelEn: "Pending Invoices", value: stats.pendingInvoices, icon: Receipt, color: "bg-danger-50 text-danger-600", href: "/projects/ABC/procurement/invoices" },
    { label: "إجمالي الإنفاق", labelEn: "Total Spend", value: `${stats.totalSpend?.toFixed(0) || 0} ريال`, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">إدارة المشتريات</h1>
        <p className="text-surface-500 mt-1">Procurement Administration Panel</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white border rounded-xl p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-surface-900">{card.value}</p>
              <p className="text-xs text-surface-500 mt-1">{card.label}</p>
              <p className="text-[10px] text-surface-400">{card.labelEn}</p>
            </div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/projects/ABC/procurement/purchase-requests" className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-info-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-info-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">إدارة طلبات الشراء</h3>
              <p className="text-sm text-surface-500">عرض ومراجعة واعتماد طلبات الشراء</p>
            </div>
          </div>
          <div className="text-sm text-surface-600">
            {stats.pendingPRs > 0
              ? `يوجد ${stats.pendingPRs} طلب بانتظار الموافقة`
              : "جميع الطلبات تمت معالجتها"}
          </div>
        </Link>

        <Link href="/projects/ABC/procurement/rfqs" className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">عروض الأسعار</h3>
              <p className="text-sm text-surface-500">متابعة طلبات عروض الأسعار والردود</p>
            </div>
          </div>
          <div className="text-sm text-surface-600">
            {stats.totalRFQs > 0
              ? `إجمالي ${stats.totalRFQs} طلب عرض سعر`
              : "لا توجد طلبات عروض أسعار"}
          </div>
        </Link>
      </div>
    </div>
  )
}
