"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  X, Mail, Lock, User2, Phone, Eye, EyeOff, Loader2, ShieldCheck,
} from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

type Tab = "login" | "register"

const REG_ITEM_ROLE: Record<string, string> = {
  "جهة حكومية": "OWNER",
  "مالك مشروع": "OWNER",
  "استشاري": "CONSULTANT",
  "مورد": "SUPPLIER",
  "مقاول": "CONTRACTOR",
  "مقاول فرعي": "SUBCONTRACTOR",
  "إدارة المشاريع والصيانة": "FREELANCER",
  "فرد": "FREELANCER",
}

const NAME_PLACEHOLDER: Record<string, string> = {
  "فرد": "الاسم الكامل",
  "جهة حكومية": "اسم الجهة",
}

export default function AuthModal({
  open,
  initialTab,
  initialRegType,
  onClose,
}: {
  open: boolean
  initialTab: Tab
  initialRegType?: string
  onClose: () => void
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifyNow, setVerifyNow] = useState(false)
  const [regType, setRegType] = useState(initialRegType ?? "")

  useEffect(() => {
    if (open) setRegType(initialRegType ?? "")
  }, [open, initialRegType])
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  })

  if (!open) return null

  const redirectAfterAuth = async () => {
    const fresh = await fetch("/api/auth/session").then((r) => r.json())
    const role = (fresh?.user as { role?: string } | undefined)?.role
    if (verifyNow) {
      router.push("/projects/ABC/verification")
    } else {
      router.push(role === "ADMIN" || role === "SUPER_ADMIN" ? "/projects/ABC/admin" : "/projects/ABC/onboarding")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const check = await fetch("/api/auth/check-credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    })
    if (!check.ok) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
      setLoading(false)
      return
    }
    const data = await check.json()
    if (data.mfaRequired) {
      setLoading(false)
      router.push("/projects/ABC/auth/login?mfa=1")
      return
    }
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    if (result?.error) {
      setError("حدث خطأ في تسجيل الدخول")
      setLoading(false)
    } else {
      await redirectAfterAuth()
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const role = REG_ITEM_ROLE[regType || "فرد"] ?? "FREELANCER"
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (signInResult?.error) {
        setError("تم إنشاء الحساب. الرجاء تسجيل الدخول")
        setLoading(false)
        return
      }
      await redirectAfterAuth()
    } catch {
      setError("حدث خطأ أثناء إنشاء الحساب")
      setLoading(false)
    }
  }

  const switchTab = (next: Tab) => {
    setTab(next)
    setError("")
  }

  const namePlaceholder = regType
    ? NAME_PLACEHOLDER[regType] ?? "اسم الشركة أو المؤسسة"
    : "الاسم الكامل"

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-primary-950/70 backdrop-blur-sm">
      <div className="w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex gap-1 bg-surface-100 p-1 rounded-lg w-full me-3">
            <button
              type="button"
              onClick={() => switchTab("login")}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${
                tab === "login" ? "bg-white text-secondary-700 shadow-sm" : "text-surface-500"
              }`}
            >
              {t("login")}
            </button>
            <button
              type="button"
              onClick={() => switchTab("register")}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${
                tab === "register" ? "bg-white text-secondary-700 shadow-sm" : "text-surface-500"
              }`}
            >
              {t("register")}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
            aria-label="إغلاق"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-3">
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/projects/ABC/onboarding" })}
                className="w-full flex items-center justify-center gap-3 py-2.5 border border-surface-300 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t("googleSignIn")}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-surface-500">{t("orContinueWith")}</span>
                </div>
              </div>

              {error && <div className="bg-danger-50 text-danger-600 text-sm px-4 py-2.5 rounded-xl">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">{t("email")}</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t("login")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-2.5">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/projects/ABC/onboarding" })}
                className="w-full flex items-center justify-center gap-3 py-2.5 border border-surface-300 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t("googleSignIn")}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-surface-500">{t("orContinueWith")}</span>
                </div>
              </div>

              {error && <div className="bg-danger-50 text-danger-600 text-sm px-4 py-2 rounded-xl">{error}</div>}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-surface-700 mb-1">الاسم</label>
                  <div className="relative">
                    <User2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={namePlaceholder}
                      className="w-full pr-9 pl-3 py-2 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-700 mb-1">{t("phone")}</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="05XXXXXXX"
                      className="w-full pr-9 pl-3 py-2 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-700 mb-1">{t("email")}</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@email.com"
                    className="w-full pr-9 pl-3 py-2 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-700 mb-1">{t("password")}</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pr-9 pl-9 py-2 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifyNow}
                  onChange={(e) => setVerifyNow(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-secondary-500 focus:ring-secondary-500"
                />
                <span className="flex items-center gap-1.5 text-sm text-surface-700">
                  <ShieldCheck className="w-4 h-4 text-secondary-500" />
                  التحقق الآن ورفع الإثباتات
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t("createAccount")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}