"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Lightbulb, Search, Filter, ThumbsUp, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, ArrowUpDown } from "lucide-react"

interface FeatureRequest {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  votes: number
  commentsCount: number
  userName: string
  createdAt: string
}

const statusStyles: Record<string, { label: string; icon: any; color: string }> = {
  PENDING: { label: "قيد المراجعة", icon: Clock, color: "bg-warning-100 text-warning-700" },
  UNDER_REVIEW: { label: "قيد الدراسة", icon: AlertCircle, color: "bg-info-100 text-info-700" },
  PLANNED: { label: "مخطط له", icon: Clock, color: "bg-flagship-100 text-flagship-700" },
  IN_PROGRESS: { label: "قيد التطوير", icon: AlertCircle, color: "bg-flagship-100 text-flagship-700" },
  COMPLETED: { label: "تم التنفيذ", icon: CheckCircle, color: "bg-success-100 text-success-700" },
  REJECTED: { label: "مرفوض", icon: XCircle, color: "bg-danger-100 text-danger-700" },
}

export default function FeatureRequestsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<FeatureRequest[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    if ((session.user as { id: string; role: string }).role !== "ADMIN") { router.push("/projects/ABC/auth/login"); return }
    fetchRequests()
  }, [session, router, search, statusFilter, priorityFilter])

  function fetchRequests() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    if (priorityFilter) params.set("priority", priorityFilter)
    fetch(`/api/research/feature-requests?${params}`)
      .then(r => r.json())
      .then(d => { setRequests(d.requests || d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/research/feature-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    fetchRequests()
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">طلبات الميزات</h1>
        <p className="text-surface-500 mt-1">إدارة وترتيب أولويات طلبات الميزات المقدمة من المستخدمين</p>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-2.5 text-surface-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-info-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500">
            <option value="">جميع الحالات</option>
            <option value="PENDING">قيد المراجعة</option>
            <option value="UNDER_REVIEW">قيد الدراسة</option>
            <option value="PLANNED">مخطط له</option>
            <option value="IN_PROGRESS">قيد التطوير</option>
            <option value="COMPLETED">تم التنفيذ</option>
            <option value="REJECTED">مرفوض</option>
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-info-500">
            <option value="">جميع الأولويات</option>
            <option value="CRITICAL">حرجة</option>
            <option value="HIGH">عالية</option>
            <option value="MEDIUM">متوسطة</option>
            <option value="LOW">منخفضة</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">جاري التحميل...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-surface-500">
          <Lightbulb className="mx-auto mb-3" size={48} />
          <p>لا توجد طلبات ميزات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const st = statusStyles[req.status] || statusStyles.PENDING
            const StatusIcon = st.icon
            return (
              <div key={req.id} className="bg-white border rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{req.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                        <StatusIcon size={12} className="inline mr-1" />{st.label}
                      </span>
                      {req.priority === "CRITICAL" && <span className="px-2 py-0.5 bg-danger-100 text-danger-700 rounded text-xs">حرجة</span>}
                      {req.priority === "HIGH" && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">عالية</span>}
                      {req.priority === "MEDIUM" && <span className="px-2 py-0.5 bg-info-100 text-info-700 rounded text-xs">متوسطة</span>}
                      {req.priority === "LOW" && <span className="px-2 py-0.5 bg-surface-100 text-surface-700 rounded text-xs">منخفضة</span>}
                    </div>
                    <p className="text-surface-600 text-sm mb-2">{req.description}</p>
                    <div className="flex items-center gap-4 text-xs text-surface-500">
                      <span className="flex items-center gap-1"><ThumbsUp size={14} /> {req.votes} صوت</span>
                      <span className="flex items-center gap-1"><MessageSquare size={14} /> {req.commentsCount} تعليق</span>
                      <span>بواسطة: {req.userName}</span>
                      <span>{new Date(req.createdAt).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>
                  <div className="mr-4">
                    <select value={req.status} onChange={e => updateStatus(req.id, e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-info-500">
                      <option value="PENDING">قيد المراجعة</option>
                      <option value="UNDER_REVIEW">قيد الدراسة</option>
                      <option value="PLANNED">مخطط له</option>
                      <option value="IN_PROGRESS">قيد التطوير</option>
                      <option value="COMPLETED">تم التنفيذ</option>
                      <option value="REJECTED">مرفوض</option>
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
