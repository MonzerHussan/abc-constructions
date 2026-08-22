"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  Users,
  ClipboardList,
  BadgeCheck,
  Activity,
  MapPin,
  Tag,
} from "lucide-react"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import { RESEARCH_PARTICIPANT_TAG_KEYS } from "@/lib/admin/admin-labels"

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
  city: string
  age: number
  gender: string
  responses: { id: string; campaignTitle: string; surveyTitle: string; completedAt: string }[]
  journeyEvents: { id: string; event: string; details: string; createdAt: string }[]
}

export default function ParticipantDetailPage() {
  const { t, language } = useLanguage()
  const params = useParams()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)

  const locale = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US"

  useEffect(() => {
    fetchParticipant()
  }, [params.id])

  async function fetchParticipant() {
    try {
      const res = await fetch(`/api/research/participants/${params.id}`)
      if (res.ok) setParticipant(await res.json())
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  const tagLabel = (tag: string) => {
    const normalized = tag.toUpperCase()
    const key = RESEARCH_PARTICIPANT_TAG_KEYS[normalized]
    return key ? t(key) : tag
  }

  if (!loading && !participant) {
    return (
      <AdminSurveyShell title={t("researchNavParticipantsTitle")} subtitle={t("researchNavParticipantsDesc")}>
        <div className="text-center text-danger-500 py-8">{t("researchCampaignDetailNotFound")}</div>
      </AdminSurveyShell>
    )
  }

  return (
    <AdminSurveyShell
      title={participant?.name ?? t("researchNavParticipantsTitle")}
      subtitle={t("researchNavParticipantsDesc")}
      loading={loading}
      actions={
        participant ? (
          <Link
            href="/projects/ABC/admin/research/participants"
            className="text-surface-500 hover:text-surface-700 inline-flex items-center"
          >
            <ArrowRight size={20} />
          </Link>
        ) : null
      }
    >
      {participant && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-bold text-lg">{t("profile")}</h2>
                {participant.isFoundingMember && <BadgeCheck className="text-warning-500" size={24} />}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-surface-400" />
                  <span>{participant.email}</span>
                </div>
                {participant.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-surface-400" />
                    <span>{participant.phone}</span>
                  </div>
                )}
                {participant.city && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-surface-400" />
                    <span>{participant.city}</span>
                  </div>
                )}
                {participant.age && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-surface-400" />
                    <span>{participant.age}</span>
                  </div>
                )}
                {participant.gender && (
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-surface-400" />
                    <span>{participant.gender}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-surface-400" />
                  <span>{new Date(participant.createdAt).toLocaleDateString(locale)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-surface-400" />
                  <span>
                    {t("lastUpdated")}:{" "}
                    {participant.lastActive ? new Date(participant.lastActive).toLocaleDateString(locale) : "--"}
                  </span>
                </div>
              </div>
              {participant.tags && participant.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Tag size={16} className="text-surface-400" />
                  {participant.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-info-100 text-info-700 rounded-full text-xs">
                      {tagLabel(tag)}
                    </span>
                  ))}
                  {participant.isFoundingMember && (
                    <span className="px-2.5 py-1 bg-warning-100 text-warning-700 rounded-full text-xs">
                      {t("researchParticipantTagFounding")}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">{t("responses")}</h2>
              {participant.responses.length === 0 ? (
                <p className="text-surface-500 text-sm">{t("noResponses")}</p>
              ) : (
                <div className="space-y-2">
                  {participant.responses.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{r.surveyTitle}</p>
                        <p className="text-xs text-surface-500">{r.campaignTitle}</p>
                      </div>
                      <span className="text-xs text-surface-400">
                        {new Date(r.completedAt).toLocaleDateString(locale)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">{t("researchCampaignDetailStats")}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ClipboardList className="text-flagship-500" size={20} />
                  <div>
                    <p className="text-2xl font-bold">{participant.totalResponses}</p>
                    <p className="text-surface-500 text-sm">{t("totalResponses")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="text-success-500" size={20} />
                  <div>
                    <p className="text-2xl font-bold">{participant.responses.length}</p>
                    <p className="text-surface-500 text-sm">{t("activeCampaigns")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">{t("customerTimeline")}</h2>
              {!participant.journeyEvents || participant.journeyEvents.length === 0 ? (
                <p className="text-surface-500 text-sm">{t("researchAnalyticsNoData")}</p>
              ) : (
                <div className="space-y-3">
                  {participant.journeyEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-info-500 rounded-full mt-2 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{event.event}</p>
                        {event.details && <p className="text-xs text-surface-500">{event.details}</p>}
                        <p className="text-xs text-surface-400 mt-1">
                          {new Date(event.createdAt).toLocaleDateString(locale)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminSurveyShell>
  )
}
