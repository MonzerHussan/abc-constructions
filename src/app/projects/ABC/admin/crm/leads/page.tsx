"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Inbox } from "lucide-react"
import { StatusBadge } from "@/components/ui"
import { getLeadSourceMeta, getLeadStatusMeta } from "@/lib/crm/constants"
import { isPlatformStaffRole } from "@/lib/auth/platform-admin"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import type { TranslationKey } from "@/lib/translations"

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

const SOURCE_TKEYS: Record<string, TranslationKey> = {
  WEBSITE: "srcWebsite",
  REFERRAL: "srcReferral",
  SOCIAL_MEDIA: "srcSocialMedia",
  EMAIL_CAMPAIGN: "srcEmailCampaign",
  EVENT: "srcEvent",
  COLD_CALL: "srcColdCall",
  PARTNER: "srcPartner",
  TRADE_SHOW: "srcTradeShow",
  TENDER_PORTAL: "srcTenderPortal",
  OTHER: "srcOther",
}

const STATUS_TKEYS: Record<string, TranslationKey> = {
  NEW: "stNew",
  CONTACTED: "stContacted",
  QUALIFIED: "stQualified",
  PROPOSAL: "stProposal",
  NEGOTIATION: "stNegotiation",
  WON: "stWon",
  LOST: "stLost",
  DISQUALIFIED: "stDisqualified",
}

export default function LeadsPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleteMsg, setDeleteMsg] = useState("")
  const limit = 20

  useEffect(() => {
    if (!session) return
    const user = session.user as { id: string; role: string };
    if (!isPlatformStaffRole(user?.role)) { router.push("/projects/ABC?login=1"); return }
    fetchLeads()
  }, [session, router, page, statusFilter, sourceFilter]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!window.confirm(t("crmConfirmDeleteLead"))) return
    const res = await fetch(`/api/crm/leads/${id}`, { method: "DELETE" })
    if (res.ok) fetchLeads()
    else setDeleteMsg(t("crmSaveError"))
  }

  function handleSearch() { setPage(1); fetchLeads() }

  const showCount = `${leads.length} ${t("crmStatLeads")}`

  return (
    <AdminSurveyShell
      title={t("crmLeadsTitle")}
      subtitle={t("crmLeadsDesc")}
      loading={loading}
      actions={
        <Link
          href="/projects/ABC/admin/crm/leads/new"
          className="inline-flex items-center gap-2 bg-secondary-500 text-white px-4 py-2 text-sm font-semibold hover:bg-secondary-600 rounded-none"
        >
          <Plus size={18} />
          {t("crmNewLead")}
        </Link>
      }
    >
      {deleteMsg && (
        <div className="mb-4 border border-danger-200 bg-danger-50 text-danger-600 px-4 py-3 text-sm rounded-none">
          {deleteMsg}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("crmSearchLeads")}
            className="w-full pr-9 pl-4 py-2.5 border border-surface-300 rounded-none text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="border border-surface-300 rounded-none px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary-500">
          <option value="">{t("crmAllStatuses")}</option>
          {Object.keys(STATUS_TKEYS).map(s => (
            <option key={s} value={s}>{t(STATUS_TKEYS[s])}</option>
          ))}
        </select>
        <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }} className="border border-surface-300 rounded-none px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary-500">
          <option value="">{t("crmAllSources")}</option>
          {Object.keys(SOURCE_TKEYS).map(s => (
            <option key={s} value={s}>{t(SOURCE_TKEYS[s])}</option>
          ))}
        </select>
      </div>

      <div className="mb-3 text-sm text-surface-500">{showCount}</div>

      {leads.length === 0 ? (
        <div className="border border-surface-200 bg-surface-50/80 px-4 py-12 text-center rounded-none">
          <Inbox className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 mb-4">{t("crmNoLeads")}</p>
          <Link
            href="/projects/ABC/admin/crm/leads/new"
            className="inline-flex items-center gap-2 bg-secondary-500 text-white px-4 py-2 text-sm font-semibold hover:bg-secondary-600 rounded-none"
          >
            <Plus size={16} />
            {t("crmNewLead")}
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white border border-surface-200 rounded-none overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b">
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColFirstName")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColEmail")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColCompany")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColSource")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColStatus")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColScore")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColDate")}</th>
                  <th className="px-4 py-3 text-sm font-medium text-surface-600">{t("crmColActions")}</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-medium">{lead.firstName} {lead.lastName}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{lead.email || "--"}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{lead.company || "--"}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge label={t(SOURCE_TKEYS[lead.source] ?? "srcOther")} color={getLeadSourceMeta(lead.source).color} /></td>
                    <td className="px-4 py-3 text-sm"><StatusBadge label={t(STATUS_TKEYS[lead.status] ?? "stNew")} color={getLeadStatusMeta(lead.status).color} /></td>
                    <td className="px-4 py-3 text-sm">{lead.score}</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/projects/ABC/admin/crm/leads/${lead.id}`} className="p-1.5 text-info-600 hover:bg-info-50 rounded-none"><Edit size={16} /></Link>
                        <button onClick={() => deleteLead(lead.id)} className="p-1.5 text-danger-600 hover:bg-danger-50 rounded-none"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 border border-surface-300 rounded-none disabled:opacity-30"><ChevronRight size={18} /></button>
              <span className="text-sm text-surface-600">{t("crmPageOf").replace("{{page}}", String(page)).replace("{{total}}", String(totalPages))}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 border border-surface-300 rounded-none disabled:opacity-30"><ChevronLeft size={18} /></button>
            </div>
          )}
        </>
      )}
    </AdminSurveyShell>
  )
}
