"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Star, Search, Mail, Calendar, BadgeCheck, Crown, Shield, Gem, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import Link from "next/link"

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

const tierConfig: Record<string, { label: string; icon: any; color: string }> = {
  PLATINUM: { label: "بلاتيني", icon: Crown, color: "text-surface-400" },
  GOLD: { label: "ذهبي", icon: Shield, color: "text-warning-500" },
  SILVER: { label: "فضي", icon: Gem, color: "text-surface-500" },
  BRONZE: { label: "برونزي", icon: Star, color: "text-amber-500" },
}

export default function FoundingMembersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<FoundingMember[]>([])
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC/auth/login"); return }
    fetchMembers()
  }, [session, router, page, search, tierFilter])

  function fetchMembers() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (search) params.set("search", search)
    if (tierFilter) params.set("tier", tierFilter)
    fetch(`/api/research/founding-members?${params}`)
      .then(r => r.json())
      .then(d => { setMembers(d.members || d); setTotalPages(d.totalPages || 1); setLoading(false) })
      .catch(() => setLoading(false))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">الأعضاء المؤسسون</h1>
          <BadgeCheck className="text-warning-500" size={24} />
        </div>
        <p className="text-surface-500 mt-1">برنامج Founding Members - الأعضاء المميزين</p>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-2.5 text-surface-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن عضو..." className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-info-500" />
          </div>
          <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500">
            <option value="">جميع المستويات</option>
            <option value="PLATINUM">بلاتيني</option>
            <option value="GOLD">ذهبي</option>
            <option value="SILVER">فضي</option>
            <option value="BRONZE">برونزي</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">جاري التحميل...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <Star className="mx-auto mb-3" size={48} />
          <p>لا يوجد أعضاء مؤسسون حالياً</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const tier = tierConfig[member.tier] || tierConfig.BRONZE
              const TierIcon = tier.icon
              return (
                <div key={member.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{member.name}</h3>
                        {member.isActive ? <span className="w-2 h-2 bg-success-500 rounded-full"></span> : <span className="w-2 h-2 bg-surface-300 rounded-full"></span>}
                      </div>
                      <p className="text-sm text-surface-500">{member.email}</p>
                    </div>
                    <TierIcon className={tier.color} size={24} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tier.color} bg-surface-100`}>{tier.label}</span>
                    <span className="text-xs text-surface-400">{member.totalResponses} ردود</span>
                  </div>
                  {member.benefits && member.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {member.benefits.map((b, i) => <span key={i} className="px-2 py-0.5 bg-success-50 text-success-700 rounded text-xs">{b}</span>)}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> انضم: {new Date(member.joinedAt).toLocaleDateString("ar-SA")}</span>
                    <Link href={`/projects/ABC/admin/research/participants/${member.id}`} className="text-info-600 hover:underline">عرض الملف</Link>
                  </div>
                </div>
              )
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded-lg disabled:opacity-30"><ChevronRight size={18} /></button>
              <span className="text-sm text-surface-500">صفحة {page} من {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border rounded-lg disabled:opacity-30"><ChevronLeft size={18} /></button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
