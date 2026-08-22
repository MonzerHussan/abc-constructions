"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import type { PortalQuickAction } from "@/modules/portal/types/portal-home.types";

export default function QuickActionsRow({ actions }: { actions: PortalQuickAction[] }) {
  const { t } = useLanguage();
  return (
    <div>
      <h3 className="font-bold text-surface-900 text-sm mb-2">{t("portalQuickActions")}</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) =>
          action.comingSoon ? (
            <button
              key={action.id}
              disabled
              className="px-3 py-2.5 text-xs font-semibold bg-surface-50 text-surface-400 border border-surface-200 rounded-none text-start"
              title={t("portalComingSoon")}
            >
              {t(action.labelKey)}
              <span className="block text-[10px] font-normal">
                {t("portalComingSoon")}
              </span>
            </button>
          ) : (
            <Link
              key={action.id}
              href={action.href}
              className="px-3 py-2.5 text-xs font-semibold bg-white text-surface-700 border border-surface-300 rounded-none hover:bg-secondary-50 hover:border-secondary-400 hover:text-secondary-700 transition-colors"
            >
              {t(action.labelKey)}
            </Link>
          )
        )}
      </div>
    </div>
  );
}