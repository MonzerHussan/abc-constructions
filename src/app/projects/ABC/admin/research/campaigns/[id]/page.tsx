"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowRight, Edit, Trash2, Users, ClipboardList, Plus, BarChart3, Calendar, Target, CheckCircle, XCircle, Clock, Send, Pause, Play } from "lucide-react"

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
  instructions: string
  reward: string
  createdAt: string
  surveys: { id: string; title: string; responseCount: number; status: string }[]
}

const statusColors: Record<string, string> = { DRAFT: "bg-surface-100 text-surface-700", ACTIVE: "bg-success-100 text-success-700", PAUSED: "bg-warning-100 text-warning-700", COMPLETED: "bg-info-100 text-info-700", CANCELLED: "bg-danger-100 text-danger-700" }

export default function CampaignDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC/auth/login"); return }
    fetchCampaign()
  }, [session, router])

  async function fetchCampaign() {
    try {
      const res = await fetch(`/api/research/campaigns/${params.id}`)
      const d = await res.json()
      setCampaign(d)
    } catch (e) { /* ignore */ } finally { setLoading(false) }
  }

  async function updateStatus(status: string) {
    await fetch(`/api/research/campaigns/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    fetchCampaign()
  }

  async function deleteCampaign() {
    if (!confirm("هل أنت متأكد من حذف هذه الحملة؟")) return
    await fetch(`/api/research/campaigns/${params.id}`, { method: "DELETE" })
    router.push("/projects/ABC/admin/research/campaigns")
  }

  if (loading) return <div className="p-8 text-center text-surface-500">جاري التحميل...</div>
  if (!campaign) return <div className="p-8 text-center text-danger-500">الحملة غير موجودة</div>

  const progress = campaign.targetParticipants > 0 ? Math.round((campaign.currentParticipants / campaign.targetParticipants) * 100) : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/projects/ABC/admin/research/campaigns" className="text-surface-500 hover:text-surface-700"><ArrowRight size={20} /></Link>
        <h1 className="text-2xl font-bold">{campaign.title}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status] || "bg-surface-100"}`}>
          {campaign.status === "DRAFT" ? "مسودة" : campaign.status === "ACTIVE" ? "نشطة" : campaign.status === "PAUSED" ? "موقفة" : campaign.status === "COMPLETED" ? "مكتملة" : "ملغية"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">معلومات الحملة</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-surface-500">النوع:</span> <span className="font-semibold">{campaign.type === "SURVEY" ? "استبيان" : campaign.type === "INTERVIEW" ? "مقابلة" : campaign.type === "FOCUS_GROUP" ? "مجموعة نقاش" : campaign.type === "USABILITY_TEST" ? "اختبار قابلية استخدام" : campaign.type === "BETA_TEST" ? "اختبار تجريبي" : campaign.type}</span></div>
              <div><span className="text-surface-500">تاريخ الإنشاء:</span> <span className="font-semibold">{new Date(campaign.createdAt).toLocaleDateString("ar-SA")}</span></div>
              <div><span className="text-surface-500">تاريخ البداية:</span> <span className="font-semibold">{new Date(campaign.startDate).toLocaleDateString("ar-SA")}</span></div>
              <div><span className="text-surface-500">تاريخ النهاية:</span> <span className="font-semibold">{new Date(campaign.endDate).toLocaleDateString("ar-SA")}</span></div>
              {campaign.reward && <div className="col-span-2"><span className="text-surface-500">المكافأة:</span> <span className="font-semibold">{campaign.reward}</span></div>}
            </div>
            {campaign.description && <p className="mt-4 text-surface-600 text-sm">{campaign.description}</p>}
            {campaign.instructions && <div className="mt-4"><span className="text-surface-500 text-sm">تعليمات:</span><p className="text-surface-600 text-sm mt-1">{campaign.instructions}</p></div>}
          </div>

          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">الاستبيانات</h2>
              <Link href={`/projects/ABC/admin/research/campaigns/${campaign.id}/surveys`} className="flex items-center gap-1 text-info-600 text-sm hover:underline"><Plus size={16} /> إضافة استبيان</Link>
            </div>
            {campaign.surveys.length === 0 ? (
              <p className="text-surface-500 text-sm text-center py-6">لا توجد استبيانات بعد</p>
            ) : (
              <div className="space-y-2">
                {campaign.surveys.map((survey) => (
                  <Link key={survey.id} href={`/projects/ABC/admin/research/campaigns/${campaign.id}/surveys/${survey.id}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-surface-50">
                    <div className="flex items-center gap-3">
                      <ClipboardList size={18} className="text-surface-400" />
                      <span className="font-medium">{survey.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-surface-500">
                      <span>{survey.responseCount} ردود</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${survey.status === "PUBLISHED" ? "bg-success-100 text-success-700" : "bg-surface-100 text-surface-600"}`}>{survey.status === "PUBLISHED" ? "منشور" : "مسودة"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">الإحصائيات</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1"><span>المشاركون</span><span>{campaign.currentParticipants} / {campaign.targetParticipants}</span></div>
                <div className="w-full bg-surface-200 rounded-full h-2"><div className="bg-info-600 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div></div>
              </div>
              <div className="flex items-center gap-3 text-sm"><Users className="text-flagship-500" size={18} /><span>{campaign.currentParticipants} مشارك</span></div>
              <div className="flex items-center gap-3 text-sm"><ClipboardList className="text-flagship-500" size={18} /><span>{campaign.surveys.length} استبيان</span></div>
              <div className="flex items-center gap-3 text-sm"><Calendar className="text-amber-500" size={18} /><span>من {new Date(campaign.startDate).toLocaleDateString("ar-SA")}</span></div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">الإجراءات</h2>
            <div className="space-y-2">
              {campaign.status === "DRAFT" && (
                <button onClick={() => updateStatus("ACTIVE")} className="w-full flex items-center gap-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 text-sm"><Play size={16} /> تفعيل الحملة</button>
              )}
              {campaign.status === "ACTIVE" && (
                <button onClick={() => updateStatus("PAUSED")} className="w-full flex items-center gap-2 px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 text-sm"><Pause size={16} /> إيقاف الحملة مؤقتاً</button>
              )}
              {campaign.status === "PAUSED" && (
                <button onClick={() => updateStatus("ACTIVE")} className="w-full flex items-center gap-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 text-sm"><Play size={16} /> استئناف الحملة</button>
              )}
              {(campaign.status === "ACTIVE" || campaign.status === "PAUSED") && (
                <button onClick={() => updateStatus("COMPLETED")} className="w-full flex items-center gap-2 px-4 py-2 bg-info-600 text-white rounded-lg hover:bg-info-700 text-sm"><CheckCircle size={16} /> إنهاء الحملة</button>
              )}
              <Link href={`/projects/ABC/admin/research/campaigns/${campaign.id}/edit`} className="w-full flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-surface-50 text-sm"><Edit size={16} /> تعديل الحملة</Link>
              <button onClick={deleteCampaign} className="w-full flex items-center gap-2 px-4 py-2 border border-danger-200 text-danger-600 rounded-lg hover:bg-danger-50 text-sm"><Trash2 size={16} /> حذف الحملة</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
