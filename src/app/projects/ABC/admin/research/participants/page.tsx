"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Search, Users, Filter, Mail, Calendar, ChevronLeft, ChevronRight, Eye, BadgeCheck } from "lucide-react"

interface Participant {
  id: string
  name: string
  email: string
  phone: string
  totalResponses: number
  lastActive: string
  createdAt: string
  isFoundingMember: boolean
  tags: string[]
}

export default function ParticipantsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [tagFilter, setTagFilter] = useState("")

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC?login=1"); return }
    fetchParticipants()
  }, [session, router, page, search, tagFilter])

  function fetchParticipants() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (search) params.set("search", search)
    if (tagFilter) params.set("tag", tagFilter)
    fetch(`/api/research/participants?${params}`)
      .then(r => r.json())
      .then(d => { setParticipants(d.participants || d); setTotalPages(d.totalPages || 1); setLoading(false) })
      .catch(() => setLoading(false))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">المشاركون</h1>
        <p className="text-surface-500 mt-1">جميع المشاركين في أبحاث السوق</p>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-2.5 text-surface-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد..." className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-info-500" />
          </div>
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500">
            <option value="">جميع التصنيفات</option>
            <option value="founding">عضو مؤسس</option>
            <option value="vip">VIP</option>
            <option value="active">نشط</option>
            <option value="new">جديد</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">جاري التحميل...</div>
      ) : participants.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <Users className="mx-auto mb-3" size={48} />
          <p>لا يوجد مشاركون حالياً</p>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-50 border-b">
                <tr>
                  <th className="text-right p-4 text-sm font-semibold text-surface-600">الاسم</th>
                  <th className="text-right p-4 text-sm font-semibold text-surface-600">البريد</th>
                  <th className="text-right p-4 text-sm font-semibold text-surface-600">الردود</th>
                  <th className="text-right p-4 text-sm font-semibold text-surface-600">آخر نشاط</th>
                  <th className="text-right p-4 text-sm font-semibold text-surface-600">التصنيف</th>
                  <th className="text-center p-4 text-sm font-semibold text-surface-600"></th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-surface-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{p.name}</span>
                        {p.isFoundingMember && <BadgeCheck size={16} className="text-warning-500" />}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-surface-600">{p.email}</td>
                    <td className="p-4 text-sm">{p.totalResponses}</td>
                    <td className="p-4 text-sm text-surface-500">{p.lastActive ? new Date(p.lastActive).toLocaleDateString("ar-SA") : "--"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.isFoundingMember && <span className="px-2 py-0.5 bg-warning-100 text-warning-700 rounded-full text-xs">مؤسس</span>}
                        {p.tags?.map(tag => <span key={tag} className="px-2 py-0.5 bg-info-100 text-info-700 rounded-full text-xs">{tag}</span>)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Link href={`/projects/ABC/admin/research/participants/${p.id}`} className="p-1.5 text-info-600 hover:bg-info-50 rounded-lg inline-block"><Eye size={18} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded-lg disabled:opacity-30"><ChevronRight size={18} /></button>
              <span className="text-sm text-surface-500">صفحة {page} من {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border rounded-lg disabled:opacity-30"><ChevronLeft size={18} /></button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
