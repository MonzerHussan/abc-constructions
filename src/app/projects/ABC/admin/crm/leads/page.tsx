"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Edit, Trash2, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { StatusBadge } from "@/components/ui"
import { getLeadSourceMeta, getLeadStatusMeta } from "@/lib/crm/constants"

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  source: string
  status: string
  score: number
  createdAt: string
  assignedTo?: { id: string; name: string | null; email: string | null } | null
}

export default function LeadsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 20

  useEffect(() => {
    if (!session) return
    const user = session.user as { id: string; role: string };
    if (user?.role !== "ADMIN") { router.push("/projects/ABC/auth/login"); return }
    fetchLeads()
  }, [session, router, page, statusFilter, sourceFilter])

  function fetchLeads() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    if (sourceFilter) params.set("source", sourceFilter)
    params.set("page", String(page))
    params.set("limit", String(limit))
    fetch(`/api/crm/leads?${params}`)
      .then(r => r.json())
      .then(d => { setLeads(d.leads ?? []); setTotalPages(d.totalPages ?? 1); setLoading(false) })
      .catch(() => setLoading(false))
  }

  async function deleteLead(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا العميل المحتمل؟")) return
    await fetch(`/api/crm/leads/${id}`, { method: "DELETE" })
    fetchLeads()
  }

  function handleSearch() { setPage(1); fetchLeads() }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">العملاء المحتملين</h1>
          <p className="text-surface-500 mt-1">إدارة ومتابعة العملاء المحتملين</p>
        </div>
        <Link href="/projects/ABC/admin/crm/leads/new" className="flex items-center gap-2 bg-info-600 text-white px-4 py-2 rounded-lg hover:bg-info-700">
          <Plus size={20} /> إضافة عميل محتمل
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="بحث بالاسم أو البريد الإلكتروني أو الشركة..."
            className="w-full pr-10 pl-4 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">كل الحالات</option>
          {["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "DISQUALIFIED"].map(s => (
            <option key={s} value={s}>{getLeadStatusMeta(s).label}</option>
          ))}
        </select>
        <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }} className="border border-surface-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">كل المصادر</option>
          {["WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "EMAIL_CAMPAIGN", "EVENT", "COLD_CALL", "PARTNER", "TENDER_PORTAL", "OTHER"].map(s => (
            <option key={s} value={s}>{getLeadSourceMeta(s).label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-surface-500">جاري التحميل...</div>
      ) : leads.length === 0 ? (
        <div className="p-8 text-center text-surface-500">لا يوجد عملاء محتملون</div>
      ) : (
        <>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b">
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">الاسم</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">البريد الإلكتروني</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">الشركة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">المصدر</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">الحالة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">التقييم</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-surface-600">التاريخ</th>
                  <th className="px-4 py-3 text-sm font-medium text-surface-600">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-medium">{lead.firstName} {lead.lastName}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{lead.email || "--"}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{lead.company || "--"}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge label={getLeadSourceMeta(lead.source).label} color={getLeadSourceMeta(lead.source).color} /></td>
                    <td className="px-4 py-3 text-sm"><StatusBadge label={getLeadStatusMeta(lead.status).label} color={getLeadStatusMeta(lead.status).color} /></td>
                    <td className="px-4 py-3 text-sm">{lead.score}</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{new Date(lead.createdAt).toLocaleDateString("ar-SA")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <Link href={`/projects/ABC/admin/crm/leads/${lead.id}`} className="p-1.5 text-info-600 hover:bg-info-50 rounded-lg"><Edit size={16} /></Link>
                        <button onClick={() => deleteLead(lead.id)} className="p-1.5 text-danger-600 hover:bg-danger-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
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
