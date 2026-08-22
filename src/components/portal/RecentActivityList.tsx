"use client";

import { useLanguage } from "@/lib/LanguageContext";
import type { PortalRecentActivity } from "@/modules/portal/types/portal-home.types";

export default function RecentActivityList({ items }: { items: PortalRecentActivity[] }) {
  const { t } = useLanguage();
  return (
    <div>
      <h3 className="font-bold text-surface-900 text-sm mb-2">{t("portalRecentActivity")}</h3>
      {items.length === 0 ? (
        <div className="border border-dashed border-surface-300 bg-surface-50/40 px-4 py-6 text-center rounded-none">
          <p className="text-xs text-surface-500">{t("portalRecentEmpty")}</p>
        </div>
      ) : (
        <div className="border border-surface-200 rounded-none divide-y divide-surface-100">
          {items.map((item) => (
            <div key={item.id} className="px-4 py-2.5 text-sm text-surface-700">
              {t(item.titleKey)}
              <span className="text-[10px] text-surface-400 block">{item.at}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}