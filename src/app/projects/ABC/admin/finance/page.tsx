"use client"

import { CreditCard, Receipt, TrendingUp } from "lucide-react"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import type { TranslationKey } from "@/lib/translations"

export default function AdminFinancePage() {
  const { t } = useLanguage()
  const cards: { icon: typeof Receipt; labelKey: TranslationKey; descKey: TranslationKey; color: string }[] = [
    { icon: CreditCard, labelKey: "financeSubscriptions", descKey: "financeSubscriptionsDesc", color: "bg-emerald-50 text-emerald-600" },
    { icon: Receipt, labelKey: "financeInvoices", descKey: "financeInvoicesDesc", color: "bg-info-50 text-info-600" },
    { icon: TrendingUp, labelKey: "financeReports", descKey: "financeReportsDesc", color: "bg-flagship-50 text-flagship-600" },
  ]
  return (
    <AdminSurveyShell title={t("adminFinance")} subtitle={t("adminFinanceSubtitle")}>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.labelKey} className="flex items-center gap-4 p-5 bg-white border border-surface-200 rounded-none hover:border-secondary-300 transition-colors">
              <div className={`w-12 h-12 rounded-none flex items-center justify-center ${item.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">{t(item.labelKey)}</h3>
                <p className="text-sm text-surface-500">{t(item.descKey)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </AdminSurveyShell>
  )
}