"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Smartphone, Copy, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

export default function MFAPage() {
  const { data: session, update } = useSession()
  const [step, setStep] = useState<"menu" | "setup" | "verify" | "disable">("menu")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const isMfaEnabled = (session?.user as any)?.mfaEnabled

  const startSetup = async () => {
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/mfa/setup", { method: "POST" })
    if (!res.ok) { setError("فشل في بدء الإعداد"); setLoading(false); return }
    const data = await res.json()
    setQrCode(data.qrCode)
    setSecret(data.secret)
    setBackupCodes(data.backupCodes)
    setStep("setup")
    setLoading(false)
  }

  const verifySetup = async () => {
    if (!token) return
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
    if (!res.ok) { setError("الرمز غير صحيح، حاول مرة أخرى"); setLoading(false); return }
    setMessage("تم تفعيل المصادقة الثنائية بنجاح")
    setStep("menu")
    update()
    setLoading(false)
  }

  const startDisable = () => {
    setToken("")
    setError("")
    setStep("disable")
  }

  const confirmDisable = async () => {
    if (!token) return
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/mfa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
    if (!res.ok) { setError("الرمز غير صحيح"); setLoading(false); return }
    setMessage("تم تعطيل المصادقة الثنائية")
    setStep("menu")
    update()
    setLoading(false)
  }

  const copyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 3000)
      return () => clearTimeout(t)
    }
  }, [message])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-flagship-100 to-flagship-100 rounded-2xl flex items-center justify-center">
          <Smartphone className="w-7 h-7 text-flagship-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">المصادقة الثنائية (MFA)</h1>
          <p className="text-surface-500">حماية إضافية لحسابك عبر تطبيق المصادقة</p>
        </div>
      </div>

      {message && (
        <div className="mb-6 flex items-center gap-2 bg-success-50 border border-success-200 rounded-xl px-4 py-3 text-sm text-success-700">
          <CheckCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      {step === "menu" && (
        <div className="bg-white border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-surface-900">حالة المصادقة الثنائية</p>
              <p className="text-sm text-surface-500">استخدم تطبيق Google Authenticator أو أي تطبيق TOTP</p>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${isMfaEnabled ? "bg-success-100 text-success-700" : "bg-surface-100 text-surface-500"}`}>
              {isMfaEnabled ? "مفعلة" : "غير مفعلة"}
            </span>
          </div>
          <div className="flex gap-3">
            {isMfaEnabled ? (
              <button onClick={startDisable} className="px-4 py-2 bg-danger-50 text-danger-600 rounded-lg text-sm font-medium hover:bg-danger-100 transition-colors">
                تعطيل المصادقة الثنائية
              </button>
            ) : (
              <button onClick={startSetup} disabled={loading} className="px-4 py-2 bg-flagship-600 text-white rounded-lg text-sm font-medium hover:bg-flagship-700 transition-colors disabled:opacity-50">
                {loading ? "جاري التحميل..." : "تفعيل المصادقة الثنائية"}
              </button>
            )}
          </div>
        </div>
      )}

      {step === "setup" && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6 text-center">
            <p className="text-sm font-medium text-surface-700 mb-4">امسح رمز QR باستخدام تطبيق المصادقة</p>
            {qrCode && <img src={qrCode} alt="MFA QR Code" className="mx-auto w-48 h-48" />}
            <div className="mt-4">
              <p className="text-xs text-surface-400 mb-1">أو أدخل المفتاح يدويًا:</p>
              <code className="text-xs bg-surface-100 px-3 py-1.5 rounded font-mono">{secret}</code>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">رموز الاستعادة</p>
                <p className="text-xs text-amber-700 mt-1">احفظ هذه الرموز في مكان آمن. يمكنك استخدامها مرة واحدة لكل منها إذا فقدت الوصول إلى تطبيق المصادقة.</p>
                <div className="mt-3 bg-white rounded-lg p-3 font-mono text-xs text-surface-700 space-y-1">
                  {backupCodes.map((code, i) => <p key={i}>{code}</p>)}
                </div>
                <button onClick={copyCodes} className="mt-2 flex items-center gap-1 text-xs text-flagship-600 hover:text-flagship-800">
                  {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "تم النسخ" : "نسخ الرموز"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <p className="text-sm font-medium text-surface-700 mb-3">تأكيد التفعيل</p>
            <p className="text-xs text-surface-500 mb-3">أدخل الرقم المكون من 6 أرقام من تطبيق المصادقة</p>
            <div className="flex gap-3">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="flex-1 border rounded-lg px-3 py-2 text-lg text-center font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
              <button
                onClick={verifySetup}
                disabled={token.length !== 6 || loading}
                className="px-6 py-2 bg-flagship-600 text-white rounded-lg text-sm font-medium hover:bg-flagship-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد"}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-danger-500">{error}</p>}
          </div>
        </div>
      )}

      {step === "disable" && (
        <div className="bg-white border rounded-xl p-6">
          <p className="text-sm font-medium text-surface-700 mb-3">تعطيل المصادقة الثنائية</p>
          <p className="text-xs text-surface-500 mb-3">أدخل رمزًا من تطبيق المصادقة لتأكيد التعطيل</p>
          <div className="flex gap-3">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="flex-1 border rounded-lg px-3 py-2 text-lg text-center font-mono tracking-widest"
              placeholder="000000"
              maxLength={6}
            />
            <button
              onClick={confirmDisable}
              disabled={token.length !== 6 || loading}
              className="px-6 py-2 bg-danger-600 text-white rounded-lg text-sm font-medium hover:bg-danger-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تعطيل"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-danger-500">{error}</p>}
        </div>
      )}
    </div>
  )
}
