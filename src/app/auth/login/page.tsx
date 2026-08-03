"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, Smartphone, ArrowLeft, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [totp, setTotp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mfaRequired, setMfaRequired] = useState(false)

  // Redirect authenticated users to onboarding to complete their profile
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/onboarding")
    }
  }, [status, router])

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary-500" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const check = await fetch("/api/auth/check-credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!check.ok) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
      setLoading(false)
      return
    }

    const data = await check.json()
    if (data.mfaRequired) {
      setMfaRequired(true)
      setLoading(false)
      return
    }

    const result = await signIn("credentials", {
      email, password, redirect: false,
    })

    if (result?.error) {
      setError("حدث خطأ في تسجيل الدخول")
      setLoading(false)
    } else {
      router.push("/onboarding")
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email, password, totp, redirect: false,
    })

    if (result?.error) {
      setError("رمز المصادقة غير صحيح")
      setLoading(false)
    } else {
      router.push("/onboarding")
    }
  }

  if (mfaRequired) {
    return (
      <div className="min-h-screen bg-surface-50 flex">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <Image src="/logo.png" alt={t("appName")} width={40} height={40} priority className="w-10 h-10" />
                <span className="text-xl font-bold text-surface-900">{t("appName")}</span>
              </Link>
              <h1 className="text-2xl font-bold text-surface-900">المصادقة الثنائية</h1>
              <p className="text-surface-600 mt-1">أدخل الرقم المكون من 6 أرقام من تطبيق المصادقة</p>
            </div>

            <form onSubmit={handleMfaSubmit} className="space-y-5">
              {error && <div className="bg-danger-50 text-danger-600 text-sm px-4 py-2.5 rounded-xl">{error}</div>}
              <div>
                <div className="relative">
                  <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input
                    value={totp}
                    onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full pr-10 pl-4 py-2.5 border border-surface-300 rounded-xl text-lg text-center font-mono tracking-widest focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={totp.length !== 6 || loading}
                className="w-full py-2.5 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "تسجيل الدخول"}
              </button>
              <button
                type="button"
                onClick={() => { setMfaRequired(false); setTotp("") }}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-surface-500 hover:text-surface-700"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة
              </button>
            </form>
          </div>
        </div>
        <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
          <div className="text-center text-white">
                <Image src="/logo.png" alt={t("appName")} width={80} height={80} priority className="w-20 h-20 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">{t("appName")}</h2>
            <p className="text-lg text-white/80 mb-2">{t("appFullName")}</p>
            <p className="text-white/60 max-w-sm">{t("appDescription")}</p>
          </div>
        </div>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-surface-900">{t("loginTitle")}</h1>
            <p className="text-surface-600 mt-1">{t("loginSubtitle")}</p>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-surface-300 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t("googleSignIn")}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-50 px-3 text-surface-500">{t("orContinueWith")}</span>
            </div>
          </div>

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
                  className="w-full pr-10 pl-4 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">{t("password")}</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-10 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors disabled:opacity-50"
            >
              {loading ? t("loading") : t("login")}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-surface-600">
            {t("noAccount")}{" "}
            <Link href="/auth/register" className="text-secondary-600 font-bold hover:text-secondary-700">
              {t("createAccount")}
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="text-center text-white">
          <Image src="/logo.png" alt={t("appName")} width={80} height={80} priority className="w-20 h-20 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">{t("appName")}</h2>
          <p className="text-lg text-white/80 mb-2">{t("appFullName")}</p>
          <p className="text-white/60 max-w-sm">{t("appDescription")}</p>
        </div>
      </div>
    </div>
  )
}
