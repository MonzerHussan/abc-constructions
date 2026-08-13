"use client"

import { Headphones, MessageSquare, Ticket, Phone } from "lucide-react"

export default function AdminSupportPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-surface-900 mb-2">خدمة العملاء</h1>
      <p className="text-surface-500 mb-8">الدعم الفني والشكاوى ومتابعة التذاكر</p>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { icon: Ticket, label: "التذاكر", desc: "إدارة تذاكر الدعم", count: "0 مفتوحة" },
          { icon: MessageSquare, label: "المحادثات المباشرة", desc: "Chat مع العملاء", count: "0 نشطة" },
          { icon: Phone, label: "طلبات الاتصال", desc: "معاودة الاتصال", count: "0 معلقة" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center justify-between p-6 bg-white border rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-danger-50 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-danger-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">{item.label}</h3>
                  <p className="text-sm text-surface-500">{item.desc}</p>
                </div>
              </div>
              <span className="text-xs bg-surface-100 px-2 py-1 rounded">{item.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
