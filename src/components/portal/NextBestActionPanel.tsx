"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import type { NextBestAction } from "@/modules/portal/types/portal-home.types";

const PRIORITY_COLORS: Record<number, string> = {
  1: "border-danger-200 bg-danger-50/60",
  2: "border-amber-200 bg-amber-50/60",
  3: "border-flagship-200 bg-flagship-50/60",
};

export default function NextBestActionPanel({ actions }: { actions: NextBestAction[] }) {
  const { t } = useLanguage();
  if (actions.length === 0) return null;
  return (
    <div>
      <h3 className="font-bold text-surface-900 text-sm mb-2">{t("portalNextBestAction")}</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.titleKey}
            href={action.href}
            className={`flex items-center justify-between gap-3 border bg-white px-3 py-2.5 rounded-none hover:bg-surface-50 transition-colors ${
              PRIORITY_COLORS[action.priority] ?? "border-surface-200"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-5 h-5 shrink-0 flex items-center justify-center text-xs font-bold text-white bg-secondary-500 rounded-full">
                {action.priority}
              </span>
              <span className="text-sm text-surface-800 truncate">{t(action.titleKey)}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {action.count > 0 && (
                <span className="text-xs font-bold text-secondary-600">{action.count}</span>
              )}
              {action.comingSoon && (
                <span className="text-[10px] px-1.5 py-0.5 bg-surface-100 text-surface-500 rounded">
                  {t("portalComingSoon")}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}