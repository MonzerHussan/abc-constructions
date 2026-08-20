"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { MessageSquare, Search, Filter, Star, Flag, CheckCircle, XCircle, Clock, AlertTriangle, ThumbsUp, ThumbsDown } from "lucide-react"

interface Feedback {
  id: string
  type: string
  subject: string
  message: string
  rating: number
  status: string
  userName: string
  userEmail: string
  page: string
  createdAt: string
}

const typeIcons: Record<string, any> = {
  BUG: AlertTriangle,
  FEEDBACK: MessageSquare,
  COMPLAINT: Flag,
  SUGGESTION: ThumbsUp,
  PRAISE: ThumbsUp,
}

const typeLabels: Record<string, string> = {
  BUG: "خطأ", FEEDBACK: "ملاحظة", COMPLAINT: "شكوى", SUGGESTION: "اقتراح", PRAISE: "إشادة",
}

const statusColors: Record<string, string> = {
  NEW: "bg-info-100 text-info-700",
  READ: "bg-surface-100 text-surface-700",
  IN_PROGRESS: "bg-warning-100 text-warning-700",
  RESOLVED: "bg-success-100 text-success-700",
  CLOSED: "bg-danger-100 text-danger-700",
}

export default function FeedbackPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC?login=1"); return }
    fetchFeedback()
  }, [session, router, search, typeFilter, statusFilter])

  function fetchFeedback() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (typeFilter) params.set("type", typeFilter)
    if (statusFilter) params.set("status", statusFilter)
    fetch(`/api/research/feedback?${params}`)
      .then(r => r.json())
      .then(d => { setFeedback(d.feedback || d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/research/feedback/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    fetchFeedback()
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">الملاحظات</h1>
        <p className="text-surface-500 mt-1">ملاحظات المستخدمين وتقارير الأخطاء والشكاوى</p>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-2.5 text-surface-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-info-500" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500">
            <option value="">جميع الأنواع</option>
            <option value="BUG">خطأ</option>
            <option value="FEEDBACK">ملاحظة</option>
            <option value="COMPLAINT">شكوى</option>
            <option value="SUGGESTION">اقتراح</option>
            <option value="PRAISE">إشادة</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500">
            <option value="">جميع الحالات</option>
            <option value="NEW">جديد</option>
            <option value="READ">مقروء</option>
            <option value="IN_PROGRESS">قيد المعالجة</option>
            <option value="RESOLVED">تم الحل</option>
            <option value="CLOSED">مغلق</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">جاري التحميل...</div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <MessageSquare className="mx-auto mb-3" size={48} />
          <p>لا توجد ملاحظات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => {
            const TypeIcon = typeIcons[item.type] || MessageSquare
            return (
              <div key={item.id} className="bg-white border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${item.type === "BUG" ? "bg-danger-100" : item.type === "COMPLAINT" ? "bg-amber-100" : item.type === "PRAISE" ? "bg-success-100" : "bg-info-100"}`}>
                    <TypeIcon size={20} className={item.type === "BUG" ? "text-danger-600" : item.type === "COMPLAINT" ? "text-amber-600" : item.type === "PRAISE" ? "text-success-600" : "text-info-600"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.type === "BUG" ? "bg-danger-100 text-danger-700" : item.type === "COMPLAINT" ? "bg-amber-100 text-amber-700" : item.type === "PRAISE" ? "bg-success-100 text-success-700" : "bg-info-100 text-info-700"}`}>{typeLabels[item.type] || item.type}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${statusColors[item.status] || "bg-surface-100"}`}>{item.status === "NEW" ? "جديد" : item.status === "READ" ? "مقروء" : item.status === "IN_PROGRESS" ? "قيد المعالجة" : item.status === "RESOLVED" ? "تم الحل" : "مغلق"}</span>
                      {item.rating > 0 && <span className="flex items-center gap-1 text-xs text-warning-500"><Star size={12} fill="currentColor" />{item.rating}</span>}
                    </div>
                    {item.subject && <h3 className="font-bold mb-1">{item.subject}</h3>}
                    <p className="text-surface-600 text-sm mb-2">{item.message}</p>
                    <div className="flex items-center gap-4 text-xs text-surface-500">
                      <span>بواسطة: {item.userName || item.userEmail}</span>
                      {item.page && <span>الصفحة: {item.page}</span>}
                      <span>{new Date(item.createdAt).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>
                  <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-info-500">
                    <option value="NEW">جديد</option>
                    <option value="READ">مقروء</option>
                    <option value="IN_PROGRESS">قيد المعالجة</option>
                    <option value="RESOLVED">تم الحل</option>
                    <option value="CLOSED">مغلق</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
