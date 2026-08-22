"use client"

import { useState, useEffect } from "react"
import { Search, Building2, ShieldCheck, Users, Inbox } from "lucide-react"
import Link from "next/link"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import { isPlatformStaffRole } from "@/lib/auth/platform-admin"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import type { TranslationKey } from "@/lib/translations"

const TYPE_TKEYS: Record<string, TranslationKey> = {
  PROJECT_OWNER: "roleOwner",
  CONSULTANT: "roleConsultant",
  MAIN_CONTRACTOR: "roleContractor",
  SUBCONTRACTOR: "roleSubcontractor",
  WORKSHOP: "roleWorkshop",
  FREELANCER: "roleFreelancer",
  SUPPLIER: "roleSupplier",
  PLATFORM_ADMIN: "roleAdmin",
}

export default function AdminOrganizationsPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const router = useRouter()
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!session) return
    if (!isPlatformStaffRole((session.user as { id: string; role: string }).role)) { router.push("/projects/ABC?login=1"); return }
    fetch("/api/organizations").then(r => r.ok ? r.json() : []).then((data) => {
      setOrgs(data || [])
      setLoading(false)
    })
  }, [session, router])

  const filtered = orgs.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.nameAr?.includes(search)
  )

  return (
    <AdminSurveyShell
      title={t("adminOrganizations")}
      subtitle={t("orgCount").replace("{{count}}", String(orgs.length))}
      loading={loading}
    >
      <div className="relative mb-4 max-w-md">
        <Search className="absolute right-3 top-2.5 w-4 h-4 text-surface-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-surface-300 rounded-none px-3 py-2 pr-9 text-sm"
          placeholder={t("orgSearchPlaceholder")}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border border-surface-200 bg-surface-50/80 px-4 py-12 text-center rounded-none">
          <Inbox className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">{t("noResults")}</p>
        </div>
      ) : (
        <div className="bg-white border border-surface-200 rounded-none overflow-hidden">
          <div className="divide-y">
            {filtered.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 hover:bg-surface-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-100 rounded-none flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">{org.nameAr || org.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs bg-surface-100 px-2 py-0.5 rounded">
                        {TYPE_TKEYS[org.type] ? t(TYPE_TKEYS[org.type]) : org.type}
                      </span>
                      <span className="text-xs text-surface-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {org._count?.users || 0}
                      </span>
                      {org.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-success-500" />
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/projects/ABC/admin/organizations/${org.id}`}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  {t("orgView")}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminSurveyShell>
  )
}
