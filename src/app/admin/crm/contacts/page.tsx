"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { StatusBadge } from "@/components/ui"
import { getLeadSourceMeta } from "@/lib/crm/constants"

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  source: string
  isActive: boolean
  createdAt: string
}

export default function ContactsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 20

  useEffect(() => {
    if (!session) return
    const user = session.user as { id: string; role: string };
    if (user?.role !== "ADMIN") { router.push("/auth/login"); return }
    fetchContacts()
  }, [session, router, page])

  function fetchContacts() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    params.set("page", String(page))
    params.set("limit", String(limit))
    fetch(`/api/crm/contacts?${params}`)
      .then(r => r.json())
      .then(d => { setContacts(d.contacts ?? []); setTotalPages(d.totalPages ?? 1); setLoading(false) })
      .catch(() => setLoading(false))
  }

  function handleSearch() { setPage(1); fetchContacts() }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">جهات الاتصال</h1>
          <p className="text-surface-500 mt-1">قاعدة بيانات جهات الاتصال والعملاء</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            className="w-full pr-10 pl-4 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-surface-500">جاري التحميل...</div>
      ) : contacts.length === 0 ? (
        <div className="p-8 text-center text-surface-500">لا توجد جهات اتصال</div>
      ) : (
        <>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b">
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">الاسم</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">البريد الإلكتروني</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">الجوال</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">الشركة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">المصدر</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">الحالة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-medium">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{c.email || "--"}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{c.phone || "--"}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{c.company || "--"}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge label={getLeadSourceMeta(c.source).label} color={getLeadSourceMeta(c.source).color} /></td>
                    <td className="px-4 py-3 text-sm">{c.isActive ? <StatusBadge label="نشط" color="bg-success-100 text-success-700" /> : <StatusBadge label="غير نشط" color="bg-surface-100 text-surface-700" />}</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{new Date(c.createdAt).toLocaleDateString("ar-SA")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 border rounded-lg disabled:opacity-30"><ChevronRight size={18} /></button>
              <span className="text-sm text-surface-600">صفحة {page} من {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 border rounded-lg disabled:opacity-30"><ChevronLeft size={18} /></button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
