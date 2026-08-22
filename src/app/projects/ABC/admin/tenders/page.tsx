"use client"

import { FileText, Construction, Package } from "lucide-react"
import Link from "next/link"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"

export default function AdminTendersPage() {
  const { t } = useLanguage()
  return (
    <AdminSurveyShell title={t("adminTenders")} subtitle={t("adminTendersSubtitle")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/projects/ABC/tenders/projects" className="flex items-center gap-4 p-6 bg-white border border-surface-200 rounded-none hover:border-secondary-300 transition-colors">
          <div className="w-12 h-12 bg-amber-50 rounded-none flex items-center justify-center">
            <Construction className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">{t("modProjectTenders")}</h3>
            <p className="text-sm text-surface-500">{t("modProjectTendersDesc")}</p>
          </div>
        </Link>
        <Link href="/projects/ABC/tenders/materials" className="flex items-center gap-4 p-6 bg-white border border-surface-200 rounded-none hover:border-secondary-300 transition-colors">
          <div className="w-12 h-12 bg-amber-50 rounded-none flex items-center justify-center">
            <Package className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">{t("modMaterialTenders")}</h3>
            <p className="text-sm text-surface-500">{t("modMaterialTendersDesc")}</p>
          </div>
        </Link>
      </div>
    </AdminSurveyShell>
  )
}