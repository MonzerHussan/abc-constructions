"use client"

import { useState, useEffect } from "react"
import { Search, Building2, ShieldCheck, Users, MoreVertical, ChevronLeft } from "lucide-react"
import Link from "next/link"

const ORG_TYPES: Record<string, string> = {
  PROJECT_OWNER: "مالك مشروع", CONSULTANT: "استشاري",
  MAIN_CONTRACTOR: "مقاول رئيسي", SUBCONTRACTOR: "مقاول فرعي",
  WORKSHOP: "ورشة", FREELANCER: "مستقل",
  SUPPLIER: "مورد", PLATFORM_ADMIN: "إدارة المنصة",
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/organizations").then(r => r.ok && r.json()).then(data => {
      setOrgs(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = orgs.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    (o.nameAr?.includes(search))
  )

  if (loading) return <div className="p-8 text-center text-surface-500">جاري التحميل...</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">إدارة المؤسسات</h1>
        <p className="text-surface-500 mt-1">{orgs.length} مؤسسة مسجلة</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-2.5 w-4 h-4 text-surface-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 pr-9 text-sm"
          placeholder="بحث باسم المؤسسة..."
        />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="divide-y">
          {filtered.map((org) => (
            <div key={org.id} className="flex items-center justify-between p-4 hover:bg-surface-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-surface-900">{org.nameAr || org.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-surface-100 px-2 py-0.5 rounded">{ORG_TYPES[org.type] || org.type}</span>
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {org._count?.users || 0}
                    </span>
                    {org.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-success-500" />
                    )}
                  </div>
                </div>
              </div>
              <Link
                href={`/projects/ABC/admin/organizations/${org.id}`}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                عرض
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
