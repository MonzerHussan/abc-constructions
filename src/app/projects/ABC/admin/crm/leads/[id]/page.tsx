"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Save } from "lucide-react"
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/crm/constants"
import { isPlatformStaffRole } from "@/lib/auth/platform-admin"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import type { TranslationKey } from "@/lib/translations"

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

export default function LeadEditPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", company: "",
    jobTitle: "", source: "WEBSITE", status: "NEW", score: 0,
    notes: "", tags: "", assignedToId: "",
  })

  useEffect(() => {
    if (!session) return
    if (!isPlatformStaffRole((session.user as { id: string; role: string }).role)) { router.push("/projects/ABC?login=1"); return }
    if (params?.id) {
      fetch(`/api/crm/leads/${params.id}`)
        .then(r => { if (!r.ok) throw new Error("Not found"); return r.json() })
        .then(d => setForm({
          firstName: d.firstName || "", lastName: d.lastName || "", email: d.email || "",
          phone: d.phone || "", company: d.company || "", jobTitle: d.jobTitle || "",
          source: d.source || "WEBSITE", status: d.status || "NEW", score: d.score || 0,
          notes: d.notes || "", tags: (d.tags || []).join(", "), assignedToId: d.assignedToId || "",
        }))
        .catch(() => { setError(t("crmNotFoundLead")); router.push("/projects/ABC/admin/crm/leads") })
    }
  }, [session, router, params?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const body = {
        firstName: form.firstName, lastName: form.lastName, email: form.email || undefined,
        phone: form.phone || undefined, company: form.company || undefined,
        jobTitle: form.jobTitle || undefined, source: form.source, status: form.status,
        score: form.score, notes: form.notes || undefined,
        tags: form.tags ? form.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
        assignedToId: form.assignedToId || undefined,
      }
const res = await fetch(`/api/crm/leads/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ? data.error : t("crmSaveError"))
        return
      }
      router.push("/projects/ABC/admin/crm/leads")
      router.refresh()
    } catch {
      setError(t("crmSaveError"))
    } finally { setSaving(false) }
  }

  const inputCls = "w-full border border-surface-300 rounded-none px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
  const labelCls = "block text-sm font-medium text-surface-700 mb-1"

  return (
    <AdminSurveyShell
      title={t("crmLeadEditTitle")}
      subtitle={t("crmLeadsDesc")}
      actions={
        <Link href="/projects/ABC/admin/crm/leads" className="inline-flex items-center gap-2 text-surface-600 hover:text-surface-900 text-sm font-medium">
          <ArrowRight size={16} /> {t("back")}
        </Link>
      }
    >
      {error && <div className="mb-4 border border-danger-200 bg-danger-50 text-danger-600 px-4 py-3 text-sm rounded-none">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white border border-surface-200 rounded-none p-6 space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("crmFirstNameLabel")}</label>
            <input type="text" required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t("crmLastNameLabel")}</label>
            <input type="text" required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("crmEmailLabel")}</label>
            <input type="email" dir="ltr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t("crmPhoneLabel")}</label>
            <input type="text" dir="ltr" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("crmCompanyLabel")}</label>
            <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t("crmJobTitleLabel")}</label>
            <input type="text" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>{t("crmSourceLabel")}</label>
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className={inputCls}>
              {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{t(SOURCE_TKEYS[s.value] ?? "srcOther")}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("crmStatusLabel")}</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
              {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{t(STATUS_TKEYS[s.value] ?? "stNew")}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("crmScoreLabel")}</label>
            <input type="number" min={0} max={100} value={form.score} onChange={e => setForm(f => ({ ...f, score: parseInt(e.target.value) || 0 }))} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>{t("crmTagsLabel")}</label>
          <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder={t("crmTagsPlaceholder")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t("crmNotesLabel")}</label>
          <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-secondary-500 text-white px-6 py-2.5 text-sm font-semibold hover:bg-secondary-600 disabled:opacity-50 rounded-none">
            <Save size={18} /> {saving ? t("saving") : t("save")}
          </button>
          <Link href="/projects/ABC/admin/crm/leads" className="px-6 py-2.5 border border-surface-300 rounded-none text-surface-700 hover:bg-surface-50 text-sm">
            {t("cancel")}
          </Link>
        </div>
      </form>
    </AdminSurveyShell>
  )
}
