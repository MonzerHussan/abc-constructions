"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react"
import { StatusBadge } from "@/components/ui"
import { getLeadSourceMeta } from "@/lib/crm/constants"
import { isPlatformStaffRole } from "@/lib/auth/platform-admin"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import type { TranslationKey } from "@/lib/translations"

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

export default function ContactsPage() {
  const { t } = useLanguage()
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
    if (!isPlatformStaffRole(user?.role)) { router.push("/projects/ABC?login=1"); return }
    fetchContacts()
  }, [session, router, page]) // eslint-disable-line react-hooks/exhaustive-deps

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
    <AdminSurveyShell
      title={t("crmContactsTitle")}
      subtitle={t("crmContactsDesc")}
      loading={loading}
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("crmSearchContacts")}
            className="w-full pr-9 pl-4 py-2.5 border border-surface-300 rounded-none text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
          />
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="border border-surface-200 bg-surface-50/80 px-4 py-12 text-center rounded-none">
          <Inbox className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">{t("crmNoContacts")}</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-surface-200 rounded-none overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b">
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColFirstName")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColEmail")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColPhone")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColCompany")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColSource")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColActive")}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">{t("crmColDate")}</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-medium">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{c.email || "--"}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{c.phone || "--"}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{c.company || "--"}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge label={t(SOURCE_TKEYS[c.source] ?? "srcOther")} color={getLeadSourceMeta(c.source).color} /></td>
                    <td className="px-4 py-3 text-sm">{c.isActive ? <StatusBadge label={t("crmActive")} color="bg-success-100 text-success-700" /> : <StatusBadge label={t("crmInactive")} color="bg-surface-100 text-surface-700" />}</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{new Date(c.createdAt).toLocaleDateString()}</td>
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
