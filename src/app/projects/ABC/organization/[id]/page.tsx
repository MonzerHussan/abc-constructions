"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Building2, Users, Shield, Settings, ArrowRight, ChevronRight } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { useSession } from "next-auth/react"

export default function OrgDetailPage() {
  const { id } = useParams()
  const { t, language } = useLanguage()
  const { data: session } = useSession()
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/organizations/${id}`).then(r => r.ok && r.json()).then(setOrg).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center text-surface-500">{t("loading")}</div>
  if (!org) return <div className="p-8 text-center text-surface-500">{t("noResults")}</div>

  const tabs = [
    { href: `/projects/ABC/organization/${id}/members`, icon: Users, label: "الأعضاء", desc: "إدارة أعضاء الفريق والصلاحيات" },
    { href: `/projects/ABC/organization/${id}/roles`, icon: Shield, label: "الأدوار", desc: "إدارة الأدوار والصلاحيات" },
    { href: `/projects/ABC/organization/${id}/verifications`, icon: Settings, label: "التوثيق", desc: "توثيق المؤسسة والمستندات" },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-100 rounded-2xl flex items-center justify-center">
          <Building2 className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{language === "ar" ? (org.nameAr || org.name) : org.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
            <span className="px-2 py-0.5 bg-surface-100 rounded">{org.type}</span>
            <span>{org._count.users} أعضاء</span>
            {org.isVerified && <span className="text-success-600">موثق</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center justify-between p-6 bg-white border rounded-xl hover:shadow-md hover:border-amber-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">{tab.label}</h3>
                  <p className="text-sm text-surface-500">{tab.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-400" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
