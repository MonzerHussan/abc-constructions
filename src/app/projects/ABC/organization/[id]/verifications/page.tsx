"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, ChevronLeft, Upload, FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

const VERIFICATION_LEVELS = [
  { level: 0, name: "غير موثق", nameEn: "Unverified", color: "bg-surface-100 text-surface-600" },
  { level: 1, name: "موثق فرديًا", nameEn: "Individual Verified", color: "bg-info-100 text-info-700" },
  { level: 2, name: "موثق تجاريًا", nameEn: "Business Verified", color: "bg-amber-100 text-amber-700" },
  { level: 3, name: "موثق مميز", nameEn: "Premium Verified", color: "bg-success-100 text-success-700" },
]

const DOC_TYPES = {
  INDIVIDUAL: [
    { value: "NATIONAL_ID", label: "الهوية الوطنية" },
    { value: "PASSPORT", label: "جواز السفر" },
    { value: "SELFIE", label: "صورة شخصية" },
    { value: "ADDRESS_PROOF", label: "إثبات عنوان" },
  ],
  BUSINESS: [
    { value: "COMMERCIAL_REGISTER", label: "السجل التجاري" },
    { value: "TAX_CERTIFICATE", label: "شهادة ضريبية" },
    { value: "COMPANY_LICENSE", label: "رخصة تجارية" },
    { value: "BANK_ACCOUNT", label: "حساب بنكي" },
    { value: "AUTHORIZATION_LETTER", label: "خطاب تفويض" },
  ],
  PROFESSIONAL: [
    { value: "PROFESSIONAL_CERT", label: "شهادة مهنية" },
    { value: "ENGINEERING_LICENSE", label: "رخصة هندسية" },
    { value: "CONTRACTOR_CLASSIFICATION", label: "تصنيف مقاولات" },
    { value: "PORTFOLIO", label: "ملف أعمال" },
  ],
}

export default function OrgVerificationsPage() {
  const { id } = useParams()
  const { t, language } = useLanguage()
  const [org, setOrg] = useState<any>(null)
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequest, setShowRequest] = useState(false)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    Promise.all([
      fetch(`/api/organizations/${id}`).then(r => r.ok && r.json()),
      fetch("/api/verifications").then(r => r.ok && r.json()),
    ]).then(([orgData, verData]) => {
      setOrg(orgData)
      setVerifications(verData || [])
      setLoading(false)
    })
  }, [id])

  const handleRequestVerification = async () => {
    const res = await fetch("/api/verifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: id, type: org?.type, level }),
    })
    if (res.ok) {
      setShowRequest(false)
      const verData = await fetch("/api/verifications").then(r => r.json())
      setVerifications(verData)
    }
  }

  if (loading) return <div className="p-8 text-center text-surface-500">{t("loading")}</div>

  const currentLevel = org?.verificationLevel ?? 0
  const currentLevelInfo = VERIFICATION_LEVELS[currentLevel] || VERIFICATION_LEVELS[0]
  const orgVers = verifications.filter((v) => v.organizationId === id)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/projects/ABC/organization/${id}`} className="p-2 hover:bg-surface-100 rounded-lg">
          <ChevronLeft className="w-5 h-5 text-surface-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">التوثيق والتحقق</h1>
          <p className="text-surface-500 text-sm">توثيق المؤسسة ورفع المستندات المطلوبة</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            <div>
              <h2 className="text-lg font-semibold">حالة التوثيق</h2>
              <p className="text-sm text-surface-500">المستوى الحالي لمؤسستك</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentLevelInfo.color}`}>
            {currentLevelInfo.name}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {VERIFICATION_LEVELS.map((vl, i) => (
            <div key={vl.level} className="flex-1">
              <div className={`h-2 rounded-full ${i <= currentLevel ? "bg-amber-500" : "bg-surface-200"}`} />
              <p className={`text-xs mt-1 ${i === currentLevel ? "text-amber-600 font-medium" : "text-surface-400"}`}>
                {vl.name}
              </p>
            </div>
          ))}
        </div>

        {currentLevel < 3 && (
          <button onClick={() => setShowRequest(true)} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">
            طلب توثيق المستوى التالي
          </button>
        )}
      </div>

      {showRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-lg font-bold mb-4">طلب توثيق جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">مستوى التوثيق</label>
                <div className="space-y-2">
                  {VERIFICATION_LEVELS.filter((vl) => vl.level > 0 && vl.level > currentLevel).map((vl) => (
                    <label key={vl.level} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-surface-50">
                      <input
                        type="radio"
                        name="level"
                        checked={level === vl.level}
                        onChange={() => setLevel(vl.level)}
                        className="text-amber-500"
                      />
                      <div>
                        <p className="font-medium text-sm">{vl.name}</p>
                        <p className="text-xs text-surface-500">{vl.nameEn}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-sm text-surface-500 bg-surface-50 p-3 rounded-lg">
                سيتم إرسال طلب التوثيق للمراجعة. المستندات المطلوبة سترفع بعد الموافقة المبدئية.
              </p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowRequest(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm text-surface-700 hover:bg-surface-50">إلغاء</button>
                <button onClick={handleRequestVerification} className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">إرسال الطلب</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {orgVers.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">طلبات التوثيق السابقة</h3>
          </div>
          <div className="divide-y">
            {orgVers.map((v) => (
              <div key={v.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {v.status === "VERIFIED" ? (
                      <CheckCircle className="w-5 h-5 text-success-500" />
                    ) : v.status === "REJECTED" ? (
                      <XCircle className="w-5 h-5 text-danger-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{VERIFICATION_LEVELS[v.level]?.name || `المستوى ${v.level}`}</p>
                      <p className="text-xs text-surface-500">{new Date(v.submittedAt).toLocaleDateString("ar-SA")}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    v.status === "VERIFIED" ? "bg-success-100 text-success-700" :
                    v.status === "REJECTED" ? "bg-danger-100 text-danger-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {v.status === "VERIFIED" ? "مقبول" : v.status === "REJECTED" ? "مرفوض" : "قيد المراجعة"}
                  </span>
                </div>
                {v.notes && <p className="text-sm text-surface-500 bg-surface-50 p-2 rounded">{v.notes}</p>}
                {v.documents?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {v.documents.map((d: any) => (
                      <a key={d.id} href={d.fileUrl} target="_blank" className="flex items-center gap-1 text-xs bg-surface-100 px-2 py-1 rounded hover:bg-amber-50 hover:text-amber-700 transition-colors">
                        <FileText className="w-3 h-3" />
                        {d.fileName}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
