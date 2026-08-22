"use client"

import { useState, useEffect } from "react"
import { Search, User, Mail, CheckCircle, XCircle } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import type { TranslationKey } from "@/lib/translations"

const ROLE_TKEYS: Record<string, TranslationKey> = {
  OWNER: "roleOwner",
  CONSULTANT: "roleConsultant",
  CONTRACTOR: "roleContractor",
  SUBCONTRACTOR: "roleSubcontractor",
  WORKSHOP: "roleWorkshop",
  FREELANCER: "roleFreelancer",
  SUPPLIER: "roleSupplier",
  TRADER: "roleTrader",
  INDIVIDUAL: "roleIndividual",
  COMPANY: "roleCompany",
  ENTITY: "roleEntity",
  ADMIN: "roleAdmin",
  SUPER_ADMIN: "roleSuperAdmin",
  CONTENT_ADMIN: "roleContentAdmin",
  FINANCE_ADMIN: "roleFinanceAdmin",
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
  SUPER_ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
  CONTENT_ADMIN: "bg-violet-50 text-violet-700 border-violet-200",
  FINANCE_ADMIN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  OWNER: "bg-info-50 text-info-700 border-info-200",
  CONSULTANT: "bg-surface-100 text-surface-700 border-surface-200",
  CONTRACTOR: "bg-success-50 text-success-700 border-success-200",
  SUBCONTRACTOR: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WORKSHOP: "bg-surface-100 text-surface-700 border-surface-200",
  FREELANCER: "bg-surface-100 text-surface-700 border-surface-200",
  SUPPLIER: "bg-info-50 text-info-700 border-info-200",
  TRADER: "bg-surface-100 text-surface-700 border-surface-200",
  INDIVIDUAL: "bg-surface-100 text-surface-700 border-surface-200",
  COMPANY: "bg-surface-100 text-surface-700 border-surface-200",
  ENTITY: "bg-surface-100 text-surface-700 border-surface-200",
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  country: string | null
  city: string | null
  companyName: string | null
  companyType: string | null
  isVerified: boolean
  isActive: boolean
  onboarded: boolean
  createdAt: string
  emailVerified: string | null
}

export default function AdminUsersPage() {
  const { t, language } = useLanguage()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setUsers(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <div className="p-8 text-center text-surface-500">{t("loading")}</div>

  return (
    <AdminSurveyShell
      title={t("adminUsersTitle")}
      subtitle={t("userCount").replace("{{count}}", String(users.length))}
    >
      <div className="relative mb-4">
        <Search className="absolute right-3 top-2.5 w-4 h-4 text-surface-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 pr-9 text-sm"
          placeholder={t("searchByNameEmail")}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-surface-500">
          {t("noUsersFound")}
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="divide-y">
            {filtered.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 hover:bg-surface-50 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-surface-900 truncate">{u.name}</p>
                    <p className="text-sm text-surface-500 flex items-center gap-1 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      {u.email}
                    </p>
                    <p className="text-xs text-surface-400 truncate">
                      {[u.country, u.city].filter(Boolean).join(language === "en" ? ", " : "، ") || "—"}{" "}
                      {u.companyName ? `• ${u.companyName}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {u.role && (
                    <span className={`text-xs px-2 py-0.5 rounded border ${ROLE_COLORS[u.role] || "bg-surface-100 text-surface-700 border-surface-200"}`}>
                      {ROLE_TKEYS[u.role] ? t(ROLE_TKEYS[u.role]) : u.role}
                    </span>
                  )}
                  <span className="text-xs text-surface-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      u.isActive ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-600"
                    }`}
                  >
                    {u.isActive ? t("userActive") : t("userDisabled")}
                  </span>
                  {u.onboarded ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-info-50 text-info-700">
                      {t("onboardedCompleted")}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-surface-100 text-surface-500">
                      {t("onboardedPending")}
                    </span>
                  )}
                  {u.isVerified ? (
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-surface-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminSurveyShell>
  )
}