"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react"
import { StatusBadge } from "@/components/ui"
import { getOpportunityStageMeta } from "@/lib/crm/constants"
import { isPlatformStaffRole } from "@/lib/auth/platform-admin"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import type { TranslationKey } from "@/lib/translations"

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

const STAGE_TKEYS: Record<string, TranslationKey> = {
  DISCOVERY: "opDiscovery",
  QUALIFICATION: "opQualification",
  PROPOSAL: "opProposal",
  NEGOTIATION: "opNegotiation",
  CLOSED_WON: "opClosedWon",
  CLOSED_LOST: "opClosedLost",
}

export default function OpportunitiesPage() {
  const { t } = useLanguage()
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
    if (!isPlatformStaffRole((session.user as { id: string; role: string }).role)) { router.push("/projects/ABC?login=1"); return }
    fetchOpportunities()
  }, [session, router, page, stageFilter]) // eslint-disable-line react-hooks/exhaustive-deps

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
    <AdminSurveyShell
      title={t("crmOpportunitiesTitle")}
      subtitle={t("crmOpportunitiesDesc")}
      loading={loading}
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("crmSearchOpportunities")}
            className="w-full pr-9 pl-4 py-2.5 border border-surface-300 rounded-none text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
          />
        </div>
        <select value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setPage(1) }} className="border border-surface-300 rounded-none px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary-500">
          <option value="">{t("crmAllStages")}</option>
          {Object.keys(STAGE_TKEYS).map(s => (
            <option key={s} value={s}>{t(STAGE_TKEYS[s])}</option>
          ))}
        </select>
      </div>

      {opportunities.length === 0 ? (
        <div className="border border-surface-200 bg-surface-50/80 px-4 py-12 text-center rounded-none">
          <Inbox className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">{t("crmNoOpportunities")}</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-surface-200 rounded-none overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b">
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColOpportunity")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColCompany")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColAmount")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColStage")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColProbability")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColCloseDate")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColDate")}</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-medium">{o.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{o.companyName || "--"}</td>
                    <td className="px-4 py-3 text-sm">{o.amount.toLocaleString()} {o.currency}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge label={t(STAGE_TKEYS[o.stage] ?? "opDiscovery")} color={getOpportunityStageMeta(o.stage).color} /></td>
                    <td className="px-4 py-3 text-sm">{o.probability}%</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{o.expectedCloseDate ? new Date(o.expectedCloseDate).toLocaleDateString() : "--"}</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{new Date(o.createdAt).toLocaleDateString()}</td>
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
