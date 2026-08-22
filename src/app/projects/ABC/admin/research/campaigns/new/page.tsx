"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Save } from "lucide-react"
import Link from "next/link"
import AdminSurveyShell, { ADMIN_ACTION_BTN, ADMIN_ACTION_BTN_SECONDARY } from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import {
  RESEARCH_CAMPAIGN_STATUS_KEYS,
  RESEARCH_CAMPAIGN_TYPE_KEYS,
} from "@/lib/admin/admin-labels"

const TYPE_OPTIONS = Object.keys(RESEARCH_CAMPAIGN_TYPE_KEYS)
const INITIAL_STATUS_OPTIONS = ["DRAFT", "ACTIVE"]

export default function NewCampaignPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "SURVEY",
    status: "DRAFT",
    targetParticipants: 100,
    startDate: "",
    endDate: "",
    instructions: "",
    reward: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === "targetParticipants" ? parseInt(value) || 0 : value }))
  }

  const statusLabel = (status: string) => {
    const key = RESEARCH_CAMPAIGN_STATUS_KEYS[status]
    return key ? t(key) : status
  }

  const typeLabel = (type: string) => {
    const key = RESEARCH_CAMPAIGN_TYPE_KEYS[type]
    return key ? t(key) : type
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.startDate || !form.endDate) {
      setError(t("researchCampaignFormRequiredFieldsError"))
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/research/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || t("researchCampaignCreateFailed"))
      }
      router.push("/projects/ABC/admin/research/campaigns")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminSurveyShell
      title={t("researchCampaignNewTitle")}
      actions={
        <Link href="/projects/ABC/admin/research/campaigns" className="text-surface-500 hover:text-surface-700">
          <ArrowRight size={20} />
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-5 max-w-3xl">
        {error && <div className="bg-danger-50 text-danger-600 p-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-semibold mb-1">{t("researchCampaignFormTitle")}</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500"
            placeholder={t("researchCampaignFormTitlePlaceholder")}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">{t("researchCampaignFormDescription")}</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500"
            placeholder={t("researchCampaignFormDescriptionPlaceholder")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">{t("researchCampaignFormType")}</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500"
            >
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {typeLabel(type)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t("researchCampaignFormInitialStatus")}</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500"
            >
              {INITIAL_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">{t("researchCampaignFormTargetParticipants")}</label>
            <input
              type="number"
              name="targetParticipants"
              value={form.targetParticipants}
              onChange={handleChange}
              min={1}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t("researchCampaignFormStartDate")}</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t("researchCampaignFormEndDate")}</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">{t("researchCampaignFormInstructions")}</label>
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500"
            placeholder={t("researchCampaignFormInstructionsPlaceholder")}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">{t("researchCampaignFormReward")}</label>
          <input
            type="text"
            name="reward"
            value={form.reward}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-info-500"
            placeholder={t("researchCampaignFormRewardPlaceholder")}
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <button type="submit" disabled={submitting} className={ADMIN_ACTION_BTN}>
            <Save size={16} /> {submitting ? t("researchSaving") : t("researchCampaignSave")}
          </button>
          <Link href="/projects/ABC/admin/research/campaigns" className={ADMIN_ACTION_BTN_SECONDARY}>
            {t("researchCancel")}
          </Link>
        </div>
      </form>
    </AdminSurveyShell>
  )
}
