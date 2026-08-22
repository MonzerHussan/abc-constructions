"use client"

import { Headphones, MessageSquare, Ticket, Phone } from "lucide-react"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import type { TranslationKey } from "@/lib/translations"

export default function AdminSupportPage() {
  const { t } = useLanguage()
  const cards: { icon: typeof Ticket; labelKey: TranslationKey; descKey: TranslationKey }[] = [
    { icon: Ticket, labelKey: "supportTickets", descKey: "supportTicketsDesc" },
    { icon: MessageSquare, labelKey: "supportChats", descKey: "supportChatsDesc" },
    { icon: Phone, labelKey: "supportCallback", descKey: "supportCallbackDesc" },
  ]

  return (
    <AdminSurveyShell title={t("adminSupport")} subtitle={t("adminSupportSubtitle")}>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.labelKey} className="flex items-center justify-between p-5 bg-white border border-surface-200 rounded-none hover:border-secondary-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-danger-50 rounded-none flex items-center justify-center">
                  <Icon className="w-6 h-6 text-danger-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">{t(item.labelKey)}</h3>
                  <p className="text-sm text-surface-500">{t(item.descKey)}</p>
                </div>
              </div>
              <span className="text-xs bg-surface-100 px-2 py-1 rounded">0</span>
            </div>
          )
        })}
      </div>
    </AdminSurveyShell>
  )
}