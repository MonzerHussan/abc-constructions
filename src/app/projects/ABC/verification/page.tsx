"use client"

import { useState, useEffect, useRef } from "react"
import { ShieldCheck, CheckCircle, XCircle, Clock, Upload, FileText, User, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { useSession } from "next-auth/react"

const DOC_TYPES = [
  { value: "NATIONAL_ID", label: "الهوية الوطنية", labelEn: "National ID" },
  { value: "PASSPORT", label: "جواز السفر", labelEn: "Passport" },
  { value: "SELFIE", label: "صورة شخصية", labelEn: "Selfie" },
  { value: "ADDRESS_PROOF", label: "إثبات عنوان", labelEn: "Address Proof" },
  { value: "PROFESSIONAL_CERT", label: "شهادة مهنية", labelEn: "Professional Cert" },
  { value: "PORTFOLIO", label: "ملف أعمال", labelEn: "Portfolio" },
]

export default function VerificationPage() {
  const { t, language } = useLanguage()
  const { data: session } = useSession()
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedVerId, setSelectedVerId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [docType, setDocType] = useState("NATIONAL_ID")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/verifications").then(r => r.ok && r.json()).then((d) => {
      setVerifications(d || [])
      setLoading(false)
    })
  }, [])

  const handleNewVerification = async () => {
    const res = await fetch("/api/verifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: 1 }),
    })
    if (res.ok) {
      const data = await res.json()
      setSelectedVerId(data.id)
      const verData = await fetch("/api/verifications").then(r => r.json())
      setVerifications(verData)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedVerId) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
    if (!uploadRes.ok) { setUploading(false); return }
    const { url, fileName } = await uploadRes.json()

    const docRes = await fetch(`/api/verifications/${selectedVerId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docType, fileName: fileName || file.name, fileUrl: url }),
    })

    setUploading(false)
    if (docRes.ok) {
      setDocType("NATIONAL_ID")
      const verData = await fetch("/api/verifications").then(r => r.json())
      setVerifications(verData)
    }
  }

  if (loading) return <div className="p-8 text-center text-surface-500">{t("loading")}</div>

  const currentVer = verifications[0]
  const statusIcon = currentVer?.status === "VERIFIED" ? CheckCircle :
    currentVer?.status === "REJECTED" ? XCircle : Clock
  const StatusIcon = statusIcon

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-100 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t("verification")}</h1>
          <p className="text-surface-500">توثيق حسابك الشخصي ورفع المستندات</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-surface-900">{session?.user?.name}</p>
              <p className="text-sm text-surface-500">{session?.user?.email}</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
            currentVer?.status === "VERIFIED" ? "bg-success-100 text-success-700" :
            currentVer?.status === "REJECTED" ? "bg-danger-100 text-danger-700" :
            currentVer ? "bg-amber-100 text-amber-700" : "bg-surface-100 text-surface-600"
          }`}>
            <StatusIcon className="w-4 h-4" />
            {currentVer?.status === "VERIFIED" ? "موثق" :
             currentVer?.status === "REJECTED" ? "مرفوض" :
             currentVer ? "قيد المراجعة" : "غير موثق"}
          </span>
        </div>
        {!currentVer && (
          <button onClick={handleNewVerification} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">
            بدء التوثيق
          </button>
        )}
      </div>

      {currentVer && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">المستندات المرفوعة</h3>
            {currentVer.status !== "VERIFIED" && (
              <button onClick={() => { setSelectedVerId(currentVer.id); setShowUpload(!showUpload) }} className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700">
                <Upload className="w-4 h-4" />
                رفع مستند
              </button>
            )}
          </div>

          {showUpload && selectedVerId === currentVer.id && (
            <div className="p-4 bg-surface-50 border-b">
              <div className="mb-3">
                <label className="block text-xs font-medium text-surface-700 mb-1">نوع المستند</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {DOC_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>{language === "ar" ? dt.label : dt.labelEn}</option>
                  ))}
                </select>
              </div>
              <div className="border-2 border-dashed border-surface-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-surface-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الرفع...
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-surface-400 mx-auto mb-2" />
                    <p className="text-sm text-surface-600">اختر ملفًا للرفع</p>
                    <p className="text-xs text-surface-400 mt-1">JPEG, PNG, PDF — حد أقصى 10MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleFileUpload} disabled={uploading} />
              </div>
            </div>
          )}

          <div className="divide-y">
            {currentVer.documents?.length === 0 ? (
              <div className="p-6 text-center text-surface-400">
                <FileText className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">لم يتم رفع أي مستندات بعد</p>
              </div>
            ) : (
              currentVer.documents?.map((doc: { id: string; fileUrl: string; fileName: string; docType: string; status: string }) => (
                <div key={doc.id} className="flex items-center justify-between p-4">
                  <a href={doc.fileUrl} target="_blank" className="flex items-center gap-3 hover:bg-surface-50 rounded-lg p-1 -m-1">
                    <FileText className="w-5 h-5 text-surface-400" />
                    <div>
                      <p className="text-sm font-medium text-surface-900">{doc.fileName}</p>
                      <p className="text-xs text-surface-500">{DOC_TYPES.find(dt => dt.value === doc.docType)?.label || doc.docType}</p>
                    </div>
                  </a>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    doc.status === "VERIFIED" ? "bg-success-100 text-success-700" :
                    doc.status === "REJECTED" ? "bg-danger-100 text-danger-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {doc.status === "VERIFIED" ? "مقبول" : doc.status === "REJECTED" ? "مرفوض" : "قيد المراجعة"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h4 className="font-semibold text-amber-800 mb-2">المستويات المتاحة</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• المستوى 1: توثيق فردي - الهوية أو جواز السفر + صورة شخصية</li>
          <li>• المستوى 2: توثيق تجاري - السجل التجاري + الرخصة + الشهادة الضريبية</li>
          <li>• المستوى 3: توثيق مميز - مراجعة يدوية + اعتماد رسمي</li>
        </ul>
      </div>
    </div>
  )
}
