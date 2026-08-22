"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import type { PortalKpi } from "@/modules/portal/types/portal-home.types";

export default function KpiRow({ kpis }: { kpis: PortalKpi[] }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi) => {
        const inner = (
          <div className="bg-white border border-surface-200 rounded-none p-4 h-full hover:border-secondary-300 transition-colors">
            <p className="text-2xl font-bold text-surface-900">
              {kpi.status === "no_data" || kpi.value === null ? "—" : kpi.value}
            </p>
            <p className="text-xs text-surface-500 mt-1">{t(kpi.labelKey)}</p>
            {kpi.status === "no_data" && (
              <p className="text-[10px] text-surface-400 mt-1">{t("portalNoData")}</p>
            )}
          </div>
        );
        return kpi.href ? (
          <Link key={kpi.id} href={kpi.href} className="block h-full">
            {inner}
          </Link>
        ) : (
          <div key={kpi.id}>{inner}</div>
        );
      })}
    </div>
  );
}