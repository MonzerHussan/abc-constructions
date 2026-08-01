"use client"

import { DollarSign, CreditCard, Receipt, TrendingUp } from "lucide-react"

export default function AdminFinancePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-surface-900 mb-2">الإدارة المالية</h1>
      <p className="text-surface-500 mb-8">إدارة الاشتراكات والفواتير والعمولات</p>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: CreditCard, label: "الاشتراكات", desc: "إدارة خطط الاشتراك", color: "bg-emerald-50 text-emerald-600" },
          { icon: Receipt, label: "الفواتير", desc: "الفواتير الصادرة والواردة", color: "bg-info-50 text-info-600" },
          { icon: TrendingUp, label: "التقارير المالية", desc: "مؤشرات الأداء المالي", color: "bg-flagship-50 text-flagship-600" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-4 p-6 bg-white border rounded-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">{item.label}</h3>
                <p className="text-sm text-surface-500">{item.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
