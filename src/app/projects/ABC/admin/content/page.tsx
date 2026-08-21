"use client"

import { Newspaper, BookOpen, FileText, Image as ImageIcon } from "lucide-react"
import AdminSurveyShell from "@/components/admin/AdminSurveyShell"
import { useLanguage } from "@/lib/LanguageContext"
import type { TranslationKey } from "@/lib/translations"

export default function AdminContentPage() {
  const { t } = useLanguage()
  const cards: { icon: typeof FileText; labelKey: TranslationKey; descKey: TranslationKey }[] = [
    { icon: Newspaper, labelKey: "contentNews", descKey: "contentNewsDesc" },
    { icon: BookOpen, labelKey: "contentArticles", descKey: "contentArticlesDesc" },
    { icon: FileText, labelKey: "contentKnowledge", descKey: "contentKnowledgeDesc" },
    { icon: ImageIcon, labelKey: "contentMedia", descKey: "contentMediaDesc" },
  ]
  return (
    <AdminSurveyShell title={t("adminContent")} subtitle={t("adminContentSubtitle")}>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.labelKey} className="flex items-center gap-4 p-5 bg-white border border-surface-200 rounded-none hover:border-secondary-300 transition-colors">
              <div className="w-12 h-12 bg-flagship-50 rounded-none flex items-center justify-center">
                <Icon className="w-6 h-6 text-flagship-600" />
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