"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ClipboardList, Users, Calendar, ArrowLeft, Clock } from "lucide-react"
import { getCampaignTypeMeta } from "@/lib/research/constants"

interface CampaignDetail {
  id: string; title: string; titleAr: string | null; description: string | null; slug: string
  campaignType: string; status: string; startDate: string | null; endDate: string | null
  welcomeMessage: string | null; isFeatured: boolean
  _count: { surveys: number; responses: number }
  surveys: { id: string; title: string; titleAr: string | null; description: string | null; timeEstimate: number | null }[]
  segments: { segment: { id: string; name: string } }[]
}

export default function CampaignDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/research/public/campaigns").then(r => r.json()).then((d: CampaignDetail[]) => {
      setCampaign(d.find(c => c.slug === slug) ?? null); setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-info-600 border-t-transparent rounded-full" /></div>
  if (!campaign) return <div className="min-h-screen flex items-center justify-center text-surface-500"><div className="text-center"><ClipboardList className="mx-auto h-16 w-16 mb-4 opacity-50" /><p className="text-xl">?????? ??? ??????</p><Link href="/projects/ABC/research" className="text-info-600 mt-4 inline-block">?????? ???????</Link></div></div>

  const typeMeta = getCampaignTypeMeta(campaign.campaignType)

  return (
    <div className="min-h-screen bg-surface-50" dir="rtl">
      <div className="bg-gradient-to-br from-info-600 to-flagship-700 text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <Link href="/projects/ABC/research" className="flex items-center gap-2 text-info-200 hover:text-white mb-6"><ArrowLeft size={20} /> ?????? ???????</Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-white/20">{typeMeta.label}</span>
            {campaign.isFeatured && <span className="text-xs px-3 py-1 rounded-full bg-warning-400 text-warning-900">?????</span>}
          </div>
          <h1 className="text-3xl font-bold mb-4">{campaign.titleAr || campaign.title}</h1>
          <p className="text-lg text-info-100 max-w-3xl">{campaign.description}</p>
          <div className="flex flex-wrap gap-6 mt-6 text-info-100">
            <span className="flex items-center gap-2"><Calendar size={18} />{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString("ar-SA") : "?????"}</span>
            <span className="flex items-center gap-2"><Users size={18} />{campaign._count.responses} ?????</span>
            <span className="flex items-center gap-2"><ClipboardList size={18} />{campaign._count.surveys} ???????</span>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {campaign.welcomeMessage && <div className="bg-info-50 border border-info-200 rounded-xl p-6 mb-8"><p className="text-info-800">{campaign.welcomeMessage}</p></div>}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-6">???????????</h2>
          {campaign.surveys && campaign.surveys.length > 0 ? (
            <div className="space-y-4">
              {campaign.surveys.map(s => (
                <Link key={s.id} href={"/projects/ABC/research/" + campaign.slug + "/projects/ABC/survey/" + s.id} className="block bg-white border rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div><h3 className="font-bold text-lg mb-1">{s.titleAr || s.title}</h3>{s.description && <p className="text-surface-500 text-sm">{s.description}</p>}</div>
                    <span className="flex items-center gap-1 text-info-600 text-sm">???? <ArrowLeft size={16} /></span>
                  </div>
                  {s.timeEstimate && <div className="mt-3 flex items-center gap-1 text-surface-400 text-xs"><Clock size={14} /> ????? ???????: {s.timeEstimate} ?????</div>}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-surface-500 bg-white rounded-xl border"><ClipboardList className="mx-auto h-12 w-12 mb-3 opacity-50" /><p>?? ???? ????????? ????? ??????</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
