"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Search, Plus, Edit, Eye, Trash2, Target, Filter, Calendar, CheckCircle, XCircle, Clock, ArrowUpDown } from "lucide-react"

interface Campaign {
  id: string
  title: string
  description: string
  type: string
  status: string
  targetParticipants: number
  currentParticipants: number
  startDate: string
  endDate: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-surface-100 text-surface-700",
  ACTIVE: "bg-success-100 text-success-700",
  PAUSED: "bg-warning-100 text-warning-700",
  COMPLETED: "bg-info-100 text-info-700",
  CANCELLED: "bg-danger-100 text-danger-700",
}

const statusIcons: Record<string, any> = {
  DRAFT: Clock,
  ACTIVE: CheckCircle,
  PAUSED: Clock,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
}

export default function CampaignsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC/auth/login"); return }
    fetchCampaigns()
  }, [session, router])

  function fetchCampaigns() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    if (typeFilter) params.set("type", typeFilter)
    fetch(`/api/research/campaigns?${params}`)
      .then(r => r.json())
      .then(d => { setCampaigns(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchCampaigns() }, [search, statusFilter, typeFilter])

  async function deleteCampaign(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الحملة؟")) return
    await fetch(`/api/research/campaigns/${id}`, { method: "DELETE" })
    fetchCampaigns()
  }

  function getStatusIcon(status: string) { const Icon = statusIcons[status] || Clock; return <Icon size={16} /> }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة الحملات</h1>
          <p className="text-surface-500 mt-1">جميع حملات أبحاث السوق والاستبيانات</p>
        </div>
        <Link href="/projects/ABC/admin/research/campaigns/new" className="flex items-center gap-2 bg-info-600 text-white px-4 py-2 rounded-lg hover:bg-info-700">
          <Plus size={20} /> حملة جديدة
        </Link>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-2.5 text-surface-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن حملة..." className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-info-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500">
            <option value="">جميع الحالات</option>
            <option value="DRAFT">مسودة</option>
            <option value="ACTIVE">نشطة</option>
            <option value="PAUSED">موقفة</option>
            <option value="COMPLETED">مكتملة</option>
            <option value="CANCELLED">ملغية</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500">
            <option value="">جميع الأنواع</option>
            <option value="SURVEY">استبيان</option>
            <option value="INTERVIEW">مقابلة</option>
            <option value="FOCUS_GROUP">مجموعة نقاش</option>
            <option value="USABILITY_TEST">اختبار قابلية استخدام</option>
            <option value="BETA_TEST">اختبار تجريبي</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">جاري التحميل...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <Target className="mx-auto mb-3" size={48} />
          <p>لا توجد حملات حالياً</p>
          <Link href="/projects/ABC/admin/research/campaigns/new" className="text-info-600 hover:underline mt-2 inline-block">إنشاء أول حملة</Link>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 border-b">
              <tr>
                <th className="text-right p-4 text-sm font-semibold text-surface-600">العنوان</th>
                <th className="text-right p-4 text-sm font-semibold text-surface-600">النوع</th>
                <th className="text-right p-4 text-sm font-semibold text-surface-600">الحالة</th>
                <th className="text-right p-4 text-sm font-semibold text-surface-600">المشاركون</th>
                <th className="text-right p-4 text-sm font-semibold text-surface-600">التاريخ</th>
                <th className="text-center p-4 text-sm font-semibold text-surface-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b last:border-0 hover:bg-surface-50">
                  <td className="p-4">
                    <Link href={`/projects/ABC/admin/research/campaigns/${campaign.id}`} className="font-semibold text-info-600 hover:underline">
                      {campaign.title}
                    </Link>
                    <p className="text-xs text-surface-500 mt-1 line-clamp-1">{campaign.description}</p>
                  </td>
                  <td className="p-4 text-sm">{campaign.type === "SURVEY" ? "استبيان" : campaign.type === "INTERVIEW" ? "مقابلة" : campaign.type === "FOCUS_GROUP" ? "مجموعة نقاش" : campaign.type === "USABILITY_TEST" ? "اختبار قابلية استخدام" : campaign.type === "BETA_TEST" ? "اختبار تجريبي" : campaign.type}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status] || "bg-surface-100 text-surface-700"}`}>
                      {getStatusIcon(campaign.status)}
                      {campaign.status === "DRAFT" ? "مسودة" : campaign.status === "ACTIVE" ? "نشطة" : campaign.status === "PAUSED" ? "موقفة" : campaign.status === "COMPLETED" ? "مكتملة" : "ملغية"}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{campaign.currentParticipants} / {campaign.targetParticipants}</td>
                  <td className="p-4 text-sm text-surface-500">
                    <div className="flex items-center gap-1"><Calendar size={14} />{new Date(campaign.startDate).toLocaleDateString("ar-SA")}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/projects/ABC/admin/research/campaigns/${campaign.id}`} className="p-1.5 text-info-600 hover:bg-info-50 rounded-lg"><Eye size={18} /></Link>
                      <Link href={`/projects/ABC/admin/research/campaigns/${campaign.id}/edit`} className="p-1.5 text-success-600 hover:bg-success-50 rounded-lg"><Edit size={18} /></Link>
                      <button onClick={() => deleteCampaign(campaign.id)} className="p-1.5 text-danger-600 hover:bg-danger-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
