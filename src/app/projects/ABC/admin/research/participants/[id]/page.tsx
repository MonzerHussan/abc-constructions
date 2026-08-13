"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowRight, Mail, Phone, Calendar, Users, ClipboardList, BadgeCheck, Activity, MapPin, Clock, Tag } from "lucide-react"

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
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC/auth/login"); return }
    fetchParticipant()
  }, [session, router])

  async function fetchParticipant() {
    try {
      const res = await fetch(`/api/research/participants/${params.id}`)
      if (res.ok) setParticipant(await res.json())
    } catch (e) { /* ignore */ } finally { setLoading(false) }
  }

  if (loading) return <div className="p-8 text-center text-surface-500">جاري التحميل...</div>
  if (!participant) return <div className="p-8 text-center text-danger-500">المشارك غير موجود</div>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/projects/ABC/admin/research/participants" className="text-surface-500 hover:text-surface-700"><ArrowRight size={20} /></Link>
        <h1 className="text-2xl font-bold">{participant.name}</h1>
        {participant.isFoundingMember && <BadgeCheck className="text-warning-500" size={24} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">المعلومات الشخصية</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2"><Mail size={16} className="text-surface-400" /><span>{participant.email}</span></div>
              {participant.phone && <div className="flex items-center gap-2"><Phone size={16} className="text-surface-400" /><span>{participant.phone}</span></div>}
              {participant.city && <div className="flex items-center gap-2"><MapPin size={16} className="text-surface-400" /><span>{participant.city}</span></div>}
              {participant.age && <div className="flex items-center gap-2"><Calendar size={16} className="text-surface-400" /><span>{participant.age} سنة</span></div>}
              {participant.gender && <div className="flex items-center gap-2"><Users size={16} className="text-surface-400" /><span>{participant.gender === "MALE" ? "ذكر" : participant.gender === "FEMALE" ? "أنثى" : participant.gender}</span></div>}
              <div className="flex items-center gap-2"><Calendar size={16} className="text-surface-400" /><span>انضم: {new Date(participant.createdAt).toLocaleDateString("ar-SA")}</span></div>
              <div className="flex items-center gap-2"><Activity size={16} className="text-surface-400" /><span>آخر نشاط: {participant.lastActive ? new Date(participant.lastActive).toLocaleDateString("ar-SA") : "--"}</span></div>
            </div>
            {participant.tags && participant.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <Tag size={16} className="text-surface-400" />
                {participant.tags.map(tag => <span key={tag} className="px-2.5 py-1 bg-info-100 text-info-700 rounded-full text-xs">{tag}</span>)}
                {participant.isFoundingMember && <span className="px-2.5 py-1 bg-warning-100 text-warning-700 rounded-full text-xs">عضو مؤسس</span>}
              </div>
            )}
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">سجل الردود</h2>
            {participant.responses.length === 0 ? (
              <p className="text-surface-500 text-sm">لا توجد ردود سابقة</p>
            ) : (
              <div className="space-y-2">
                {participant.responses.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{r.surveyTitle}</p>
                      <p className="text-xs text-surface-500">{r.campaignTitle}</p>
                    </div>
                    <span className="text-xs text-surface-400">{new Date(r.completedAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">الإحصائيات</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><ClipboardList className="text-flagship-500" size={20} /><div><p className="text-2xl font-bold">{participant.totalResponses}</p><p className="text-surface-500 text-sm">إجمالي الردود</p></div></div>
              <div className="flex items-center gap-3"><Activity className="text-success-500" size={20} /><div><p className="text-2xl font-bold">{participant.responses.length}</p><p className="text-surface-500 text-sm">آخر الحملات</p></div></div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">أحداث الرحلة</h2>
            {(!participant.journeyEvents || participant.journeyEvents.length === 0) ? (
              <p className="text-surface-500 text-sm">لا توجد أحداث</p>
            ) : (
              <div className="space-y-3">
                {participant.journeyEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-info-500 rounded-full mt-2 shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm">{event.event}</p>
                      {event.details && <p className="text-xs text-surface-500">{event.details}</p>}
                      <p className="text-xs text-surface-400 mt-1">{new Date(event.createdAt).toLocaleDateString("ar-SA")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
