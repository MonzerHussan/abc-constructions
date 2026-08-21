"use client";

import { Info } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

/** Shown when user selects Supplier or Trader — reduces misclassification per coverage-gaps spec. */
export default function SupplierTraderHint() {
  const { t } = useLanguage();

  return (
    <div className="rounded-none border border-amber-200 bg-amber-50/80 px-2.5 py-2 text-[10px] leading-relaxed text-amber-900">
      <p className="font-bold flex items-center gap-1 mb-1">
        <Info className="w-3 h-3 shrink-0" />
        {t("supplierVsTraderTitle")}
      </p>
      <ul className="space-y-0.5 list-none ps-0">
        <li>
          <span className="font-semibold">{t("accountCategorySupplier")}:</span> {t("supplierVsTraderSupplierLine")}
        </li>
        <li>
          <span className="font-semibold">{t("accountCategoryTrader")}:</span> {t("supplierVsTraderTraderLine")}
        </li>
      </ul>
      <p className="mt-1 text-amber-800/90">{t("supplierVsTraderHint")}</p>
    </div>
  );
}
