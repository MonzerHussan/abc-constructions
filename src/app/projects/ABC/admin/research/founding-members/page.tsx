"use client"

import { useEffect, useState } from "react"
import { Star, Search, Calendar, Crown, Shield, Gem, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import { RESEARCH_TIER_KEYS } from "@/lib/admin/admin-labels"

interface FoundingMember {
  id: string
  name: string
  email: string
  tier: string
  joinedAt: string
  totalResponses: number
  benefits: string[]
  isActive: boolean
}

const TIER_ICONS: Record<string, typeof Crown> = {
  PLATINUM: Crown,
  GOLD: Shield,
  SILVER: Gem,
  BRONZE: Star,
}

const TIER_COLORS: Record<string, string> = {
  PLATINUM: "text-surface-400",
  GOLD: "text-warning-500",
  SILVER: "text-surface-500",
  BRONZE: "text-amber-500",
}

const TIER_OPTIONS = Object.keys(RESEARCH_TIER_KEYS)

function replaceParams(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{{${key}}}`, String(value)),
    template,
  )
}

export default function FoundingMembersPage() {
  const { t, language } = useLanguage()
  const [members, setMembers] = useState<FoundingMember[]>([])
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const locale = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US"

  useEffect(() => {
    fetchMembers()
  }, [page, search, tierFilter])

  function fetchMembers() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (search) params.set("search", search)
    if (tierFilter) params.set("tier", tierFilter)
    fetch(`/api/research/founding-members?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members || d)
        setTotalPages(d.totalPages || 1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const tierLabel = (tier: string) => {
    const key = RESEARCH_TIER_KEYS[tier]
    return key ? t(key) : tier
  }

  return (
    <AdminSurveyShell
      title={t("researchNavFoundingMembersTitle")}
      subtitle={t("researchNavFoundingMembersDesc")}
      loading={loading}
    >
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute end-3 top-2.5 text-surface-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("verificationSearchPlaceholder")}
              className="w-full pe-10 ps-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-info-500"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500"
          >
            <option value="">{t("researchCampaignsAllTypes")}</option>
            {TIER_OPTIONS.map((tier) => (
              <option key={tier} value={tier}>
                {tierLabel(tier)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!loading && members.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <Star className="mx-auto mb-3" size={48} />
          <p>{t("noParticipants")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const TierIcon = TIER_ICONS[member.tier] || Star
              const tierColor = TIER_COLORS[member.tier] || TIER_COLORS.BRONZE
              return (
                <div key={member.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{member.name}</h3>
                        {member.isActive ? (
                          <span className="w-2 h-2 bg-success-500 rounded-full" />
                        ) : (
                          <span className="w-2 h-2 bg-surface-300 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-surface-500">{member.email}</p>
                    </div>
                    <TierIcon className={tierColor} size={24} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tierColor} bg-surface-100`}>
                      {tierLabel(member.tier)}
                    </span>
                    <span className="text-xs text-surface-400">
                      {replaceParams(t("researchSurveyResponses"), { n: member.totalResponses })}
                    </span>
                  </div>
                  {member.benefits && member.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {member.benefits.map((b, i) => (
                        <span key={i} className="px-2 py-0.5 bg-success-50 text-success-700 rounded text-xs">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(member.joinedAt).toLocaleDateString(locale)}
                    </span>
                    <Link
                      href={`/projects/ABC/admin/research/participants/${member.id}`}
                      className="text-info-600 hover:underline"
                    >
                      {t("orgView")}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded-lg disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-sm text-surface-500">
                {replaceParams(t("researchPaginationPageOf"), { current: page, total: totalPages })}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded-lg disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </AdminSurveyShell>
  )
}
