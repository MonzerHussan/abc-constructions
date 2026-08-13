"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { StatusBadge } from "@/components/ui"
import { getOpportunityStageMeta } from "@/lib/crm/constants"

interface Opportunity {
  id: string
  name: string
  amount: number
  currency: string
  stage: string
  probability: number
  companyName: string | null
  source: string
  expectedCloseDate: string | null
  createdAt: string
}

export default function OpportunitiesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 20

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC/auth/login"); return }
    fetchOpportunities()
  }, [session, router, page, stageFilter])

  function fetchOpportunities() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (stageFilter) params.set("stage", stageFilter)
    params.set("page", String(page))
    params.set("limit", String(limit))
    fetch(`/api/crm/opportunities?${params}`)
      .then(r => r.json())
      .then(d => { setOpportunities(d.opportunities ?? []); setTotalPages(d.totalPages ?? 1); setLoading(false) })
      .catch(() => setLoading(false))
  }

  function handleSearch() { setPage(1); fetchOpportunities() }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">الفرص</h1>
          <p className="text-surface-500 mt-1">تتبع صفقات وفرص البيع</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="بحث باسم الفرصة أو الشركة..."
            className="w-full pr-10 pl-4 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
        </div>
        <select value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setPage(1) }} className="border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">كل المراحل</option>
          {["DISCOVERY", "QUALIFICATION", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"].map(s => (
            <option key={s} value={s}>{getOpportunityStageMeta(s).label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-surface-500">جاري التحميل...</div>
      ) : opportunities.length === 0 ? (
        <div className="p-8 text-center text-surface-500">لا توجد فرص</div>
      ) : (
        <>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b">
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">اسم الفرصة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">الشركة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">المبلغ</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">المرحلة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">الاحتمالية</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">تاريخ الإغلاق</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-medium">{o.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{o.companyName || "--"}</td>
                    <td className="px-4 py-3 text-sm">{o.amount.toLocaleString()} {o.currency}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge label={getOpportunityStageMeta(o.stage).label} color={getOpportunityStageMeta(o.stage).color} /></td>
                    <td className="px-4 py-3 text-sm">{o.probability}%</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{o.expectedCloseDate ? new Date(o.expectedCloseDate).toLocaleDateString("ar-SA") : "--"}</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{new Date(o.createdAt).toLocaleDateString("ar-SA")}</td>
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
