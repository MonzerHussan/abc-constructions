"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { X, Mail, Lock, ShieldCheck, Smartphone } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { GOOGLE_ONBOARDING_CALLBACK } from "@/lib/auth/role-selection"

import type { TranslationKey } from "@/lib/translations"

type LoginInlineProps = {
  dir: "rtl" | "ltr"
  onClose: () => void
  onOpenRegister?: (role: string, label: string, categoryKey: TranslationKey) => void
}

export default function LoginInline({ dir, onClose, onOpenRegister }: LoginInlineProps) {
  const { t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [totp, setTotp] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const check = await fetch("/api/auth/check-credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    })

    if (!check.ok) {
      setError(t("invalidCredentials"))
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
      email: form.email,
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      setError(t("loginFailed"))
      setLoading(false)
    } else {
      onClose()
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      totp,
      redirect: false,
    })

    if (result?.error) {
      setError(t("invalidMfaCode"))
      setLoading(false)
    } else {
      onClose()
    }
  }

  const inputCls =
    "w-full rounded-none border border-surface-300 px-2 py-1.5 text-[11px] focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 outline-none transition"

  return (
    <div
      dir={dir}
      className="w-full overflow-hidden bg-white border border-surface-200 shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2 border-b border-surface-100 px-3 py-2" dir="ltr">
        <div className="flex items-center gap-2 min-w-0">
          <Image
            src="/logo.png"
            alt={t("appName")}
            width={120}
            height={40}
            priority
            className="h-9 w-auto max-w-[120px] object-contain object-left"
          />
          <div className="min-w-0 border-s border-surface-200 ps-2">
            <h3 className="text-[10px] font-bold text-surface-900 leading-tight">{t("loginTitle")}</h3>
            <p className="text-[9px] text-surface-500 truncate">{t("loginSubtitle")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-none p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors shrink-0"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-2.5 space-y-2.5">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: GOOGLE_ONBOARDING_CALLBACK })}
          className="w-full flex items-center justify-center gap-2 py-1.5 border border-surface-300 rounded-none text-[10px] font-medium text-surface-700 hover:bg-surface-50 transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          <div className="relative flex justify-center text-[9px]">
            <span className="bg-white px-2 text-surface-500">{t("orContinueWith")}</span>
          </div>
        </div>

        {mfaRequired ? (
          <form onSubmit={handleMfaSubmit} className="space-y-2">
            {error && (
              <div className="bg-danger-50 text-danger-600 text-[10px] rounded-none px-3 py-1.5">{error}</div>
            )}
            <div>
              <label className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-surface-700">
                <ShieldCheck className="w-3 h-3 text-secondary-500" />
                {t("mfaCode")}
              </label>
              <div className="relative">
                <Smartphone className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className={inputCls + " ps-8 pe-2 text-center font-mono tracking-widest"}
                  autoFocus
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setMfaRequired(false); setTotp("") }}
                className="py-1.5 text-[10px] text-surface-600 border border-surface-300 hover:bg-surface-50"
              >
                {t("back")}
              </button>
              <button
                type="submit"
                disabled={totp.length !== 6 || loading}
                className="py-1.5 text-[10px] font-bold text-white bg-secondary-500 hover:bg-secondary-600 disabled:opacity-50"
              >
                {loading ? t("loading") : t("mfaVerify")}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            {error && (
              <div className="bg-danger-50 text-danger-600 text-[10px] rounded-none px-3 py-1.5">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-surface-700">{t("email")}</label>
                <div className="relative">
                  <Mail className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    dir="ltr"
                    className={inputCls + " ps-8 pe-2 text-start"}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[10px] font-medium text-surface-700">{t("password")}</label>
                <div className="relative">
                  <Lock className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={inputCls + " ps-8 pe-12"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-secondary-600 hover:text-secondary-700"
                  >
                    {showPassword ? t("hide") : t("show")}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <Link
                href="/projects/ABC/auth/forgot-password"
                className="text-[9px] font-semibold text-secondary-600 hover:text-secondary-700"
              >
                {t("forgotPassword")}
              </Link>
              <div className="flex items-center gap-2">
                {onOpenRegister && (
                  <button
                    type="button"
                    onClick={() => onOpenRegister("OWNER", t("accountCategoryOwner"), "accountCategoryOwner")}
                    className="text-[9px] font-semibold text-surface-600 hover:text-secondary-600"
                  >
                    {t("createAccount")}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-2.5 py-1 text-[9px] font-bold text-white bg-secondary-500 hover:bg-secondary-600 disabled:opacity-50"
                >
                  {loading ? t("loading") : t("login")}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
