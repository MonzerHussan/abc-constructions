"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ClipboardList, Users, Calendar, ArrowLeft } from "lucide-react"
import { getCampaignTypeMeta, getCampaignStatusMeta } from "@/lib/research/constants"

interface PublicCampaign {
  id: string; title: string; titleAr: string | null; description: string | null
  slug: string; campaignType: string; status: string
  startDate: string | null; endDate: string | null; isFeatured: boolean
  _count: { surveys: number; responses: number }
  segments: { segment: { name: string } }[]
}

export default function PublicResearchPage() {
  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/research/public/campaigns").then(r => r.json()).then(d => { setCampaigns(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-info-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="min-h-screen bg-surface-50" dir="rtl">
      <div className="bg-gradient-to-br from-info-600 to-flagship-700 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">????? ????? ABC</h1>
          <p className="text-xl text-info-100 max-w-2xl mx-auto">???? ????? ????? ????? ???????</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto py-12 px-6">
        {campaigns.length === 0 ? (
          <div className="text-center py-20 text-surface-500">
            <ClipboardList className="mx-auto h-16 w-16 mb-4 opacity-50" />
            <p className="text-xl">?? ???? ????? ????? ??????</p><p className="mt-2">?????? ??????? ??????? ??????</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.map(c => {
              const tm = getCampaignTypeMeta(c.campaignType); const sm = getCampaignStatusMeta(c.status)
              return (
                <Link key={c.id} href={"/projects/ABC/research/" + c.slug} className="bg-white rounded-xl border hover:shadow-lg transition p-6 group">
                  <div className="flex items-start justify-between mb-4">
                    <span className={"text-xs px-3 py-1 rounded-full bg-" + tm.color + "-100 text-" + tm.color + "-700"}>{tm.label}</span>
                    <span className="text-xs text-surface-400">{sm.label}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{c.titleAr || c.title}</h3>
                  <p className="text-surface-500 text-sm mb-4 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-4 text-xs text-surface-400">
                    <span className="flex items-center gap-1"><Calendar size={14} />{c.startDate ? new Date(c.startDate).toLocaleDateString("ar-SA") : "?????"}</span>
                    <span className="flex items-center gap-1"><Users size={14} />{c._count.responses} ?????</span>
                    <span className="flex items-center gap-1"><ClipboardList size={14} />{c._count.surveys} ???????</span>
                  </div>
                  <div className="mt-4 flex items-center text-info-600 text-sm font-medium group-hover:gap-2 transition-all">???????? <ArrowLeft size={16} className="mr-1" /></div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
