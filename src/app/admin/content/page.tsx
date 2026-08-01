"use client"

import { Newspaper, BookOpen, FileText, Image } from "lucide-react"

export default function AdminContentPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-surface-900 mb-2">إدارة المحتوى</h1>
      <p className="text-surface-500 mb-8">إدارة الأخبار والمقالات والأدلة الفنية</p>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { icon: Newspaper, label: "الأخبار", desc: "إدارة الأخبار والإعلانات" },
          { icon: BookOpen, label: "المقالات", desc: "المقالات والأدلة الفنية" },
          { icon: FileText, label: "مركز المعرفة", desc: "قاعدة المعرفة والأسئلة الشائعة" },
          { icon: Image, label: "الوسائط", desc: "إدارة الصور والفيديوهات" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-4 p-6 bg-white border rounded-xl hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-flagship-50 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-flagship-600" />
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
