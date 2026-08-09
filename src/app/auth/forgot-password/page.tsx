"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ArrowRight, KeyRound, Loader2, Mail } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

const data = await res.json().catch(() => ({}))
      setSent(true)
      // في بيئة التطوير فقط يظهر رابط مباشر لتسهيل الاختبار
      if (data.resetUrl) setDevResetUrl(data.resetUrl)
    } catch {
      setError("حدث خطأ أثناء إرسال الطلب")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image src="/logo.png" alt={t("appName")} width={40} height={40} priority className="w-10 h-10" />
              <span className="text-xl font-bold text-surface-900">{t("appName")}</span>
            </Link>
            <h1 className="text-2xl font-bold text-surface-900">نسيت كلمة المرور؟</h1>
            <p className="text-surface-600 mt-1">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور</p>
          </div>

          {sent || devResetUrl ? (
            <div className="bg-success-50 border border-success-200 text-success-700 text-sm px-4 py-3 rounded-xl space-y-3">
              <p>تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني إن كان الحساب مسجلاً.</p>
              {devResetUrl && (
                <div>
                  <p className="mb-1 font-medium">رابط للتجربة (بيئة التطوير):</p>
                  <Link
                    href={devResetUrl}
                    className="block break-all text-secondary-600 font-bold hover:text-secondary-700"
                  >
                    {devResetUrl}
                  </Link>
                </div>
              )}
              <Link href="/auth/login" className="block text-secondary-600 font-bold hover:text-secondary-700">
                العودة إلى تسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-danger-50 text-danger-600 text-sm px-4 py-2.5 rounded-xl">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">{t("email")}</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="w-full pr-10 pl-4 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                  <span className="flex items-center justify-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    إرسال رابط إعادة التعيين
                  </span>
                )}
              </button>
            </form>
          )}

          <p className="text-center mt-6 text-sm text-surface-600">
            تذكرت كلمة المرور؟{" "}
            <Link href="/auth/login" className="text-secondary-600 font-bold hover:text-secondary-700">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="text-center text-white flex items-center gap-3">
          <KeyRound className="w-10 h-10" />
          <div className="text-right">
            <h2 className="text-3xl font-bold mb-2">استعادة حسابك</h2>
            <p className="text-white/80">استعد وصولك بأمان خلال دقائق</p>
          </div>
        </div>
      </div>
    </div>
  )
}