"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

function ResetPasswordForm() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const email = searchParams.get("email") ?? ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Ø±Ø§Ø¨Ø· Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªØ¹ÙŠÙŠÙ† ØºÙŠØ± ØµØ§Ù„Ø­ Ø£Ùˆ Ù…ÙÙ‚ÙˆØ¯")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 8) {
      setError("ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù† ØªØªÙƒÙˆÙ† Ù…Ù† 8 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("ÙƒÙ„Ù…ØªØ§ Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± Ù…ØªØ·Ø§Ø¨Ù‚ØªÙŠÙ†")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.message ?? "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªØ¹ÙŠÙŠÙ†")
      } else {
        setDone(true)
      }
    } catch {
      setError("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªØ¹ÙŠÙŠÙ†")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-success-50 border border-success-200 text-success-700 text-sm px-4 py-3 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">ØªÙ… ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø¨Ù†Ø¬Ø§Ø­</span>
        </div>
        <p>ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¢Ù† ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©.</p>
        <Link href="/projects/ABC/auth/login" className="block text-secondary-600 font-bold hover:text-secondary-700">
          Ø§Ù„Ø°Ù‡Ø§Ø¨ Ø¥Ù„Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-danger-50 text-danger-600 text-sm px-4 py-2.5 rounded-xl">{error}</div>}
      {email && (
        <div className="bg-surface-100 text-surface-700 text-sm px-4 py-2.5 rounded-xl">
          Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù„Ù€ <b>{email}</b>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">{t("password")}</label>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-1.5">ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</label>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            className="w-full pr-10 pl-10 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !token}
        className="w-full py-2.5 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
          <span className="flex items-center justify-center gap-2">
            <KeyRound className="w-4 h-4" />
            ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±
          </span>
        )}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/projects/ABC" className="flex items-center gap-2 mb-6">
              <Image src="/logo.png" alt={t("appName")} width={40} height={40} priority className="w-10 h-10" />
              <span className="text-xl font-bold text-surface-900">{t("appName")}</span>
            </Link>
            <h1 className="text-2xl font-bold text-surface-900">Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</h1>
            <p className="text-surface-600 mt-1">Ø£Ø¯Ø®Ù„ ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø¬Ø¯ÙŠØ¯Ø© Ù„Ø­Ø³Ø§Ø¨Ùƒ</p>
          </div>

          <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin mx-auto text-secondary-500" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="text-center text-white flex max-col gap-2 items-center">
          <KeyRound className="w-10 h-10" />
          <div className="text-right">
            <h2 className="text-3xl font-bold mb-2">Ø§Ø³ØªØ¹Ø§Ø¯Ø© ÙˆØµÙˆÙ„Ùƒ</h2>
            <p className="text-white/80">ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø¬Ø¯ÙŠØ¯Ø©ØŒ Ø­Ù…Ø§ÙŠØ© Ø£Ù‚ÙˆÙ‰</p>
          </div>
        </div>
      </div>
    </div>
  )
}
