"use client"

import { useState, useEffect } from "react"
import { Search, User, Mail, Shield, MoreVertical, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

const ROLES_LABELS: Record<string, string> = {
  OWNER: "مالك مشروع", CONSULTANT: "استشاري", MAIN_CONTRACTOR: "مقاول رئيسي",
  SUBCONTRACTOR: "مقاول فرعي", WORKSHOP: "ورشة", FREELANCER: "مستقل",
  SUPPLIER: "مورد", ADMIN: "مدير المنصة",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/verifications").then(r => r.ok && r.json()).then(data => {
      const uniqueUsers = new Map()
      ;(data || []).forEach((v: any) => {
        if (!uniqueUsers.has(v.user.id)) {
          uniqueUsers.set(v.user.id, { ...v.user, verificationStatus: v.status })
        }
      })
      setUsers(Array.from(uniqueUsers.values()))
      setLoading(false)
    })
  }, [])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="p-8 text-center text-surface-500">جاري التحميل...</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">إدارة المستخدمين</h1>
        <p className="text-surface-500 mt-1">{users.length} مستخدم</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-2.5 w-4 h-4 text-surface-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 pr-9 text-sm"
          placeholder="بحث باسم أو بريد..."
        />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="divide-y">
          {filtered.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4 hover:bg-surface-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-surface-900">{u.name}</p>
                  <p className="text-sm text-surface-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(u as { id: string; role: string }).role && (
                  <span className="text-xs bg-surface-100 px-2 py-0.5 rounded">
                    {ROLES_LABELS[(u as { id: string; role: string }).role] || (u as { id: string; role: string }).role}
                  </span>
                )}
                {u.verificationStatus === "VERIFIED" ? (
                  <CheckCircle className="w-5 h-5 text-success-500" />
                ) : u.verificationStatus ? (
                  <XCircle className="w-5 h-5 text-surface-300" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
