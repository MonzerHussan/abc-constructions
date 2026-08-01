"use client"

import { FileText, Construction, Package } from "lucide-react"
import Link from "next/link"

export default function AdminTendersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-surface-900 mb-2">إدارة المناقصات</h1>
      <p className="text-surface-500 mb-8">مراجعة واعتماد وإدارة المناقصات على المنصة</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/tenders/projects" className="flex items-center gap-4 p-6 bg-white border rounded-xl hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <Construction className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">مناقصات المشاريع</h3>
            <p className="text-sm text-surface-500">مراجعة وإدارة مناقصات تنفيذ المشاريع</p>
          </div>
        </Link>
        <Link href="/tenders/materials" className="flex items-center gap-4 p-6 bg-white border rounded-xl hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">مناقصات المواد</h3>
            <p className="text-sm text-surface-500">إدارة مناقصات شراء المواد</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
