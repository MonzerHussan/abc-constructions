"use client";

import { useLanguage } from "@/lib/LanguageContext";
import type {
  PortalActivation,
  PortalActivationDimension,
} from "@/modules/portal/types/portal-home.types";

function DimensionRow({ dim }: { dim: PortalActivationDimension }) {
  const { t } = useLanguage();
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-surface-700">
          {t(dim.labelKey)}
        </span>
        <span className="text-xs text-surface-500">{dim.percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-surface-100 rounded-none overflow-hidden">
        <div
          className="h-full bg-secondary-500 transition-all"
          style={{ width: `${dim.percent}%` }}
        />
      </div>
      <p className="text-[10px] text-surface-400 mt-0.5">{t(dim.nextStepKey)}</p>
    </div>
  );
}

export default function ActivationBar({ activation }: { activation: PortalActivation }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white border border-surface-200 rounded-none p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-surface-900 text-sm">{t("portalActivationScore")}</h3>
        <span className="text-lg font-bold text-secondary-600">{activation.overall}%</span>
      </div>
      <div className="space-y-3">
        {activation.dimensions.map((d) => (
          <DimensionRow key={d.id} dim={d} />
        ))}
      </div>
    </div>
  );
}