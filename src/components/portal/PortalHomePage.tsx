"use client";

import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/LanguageContext";
import { usePortalHome } from "@/components/portal/hooks/usePortalHome";
import PortalHeader from "@/components/portal/PortalHeader";
import ActivationBar from "@/components/portal/ActivationBar";
import KpiRow from "@/components/portal/KpiRow";
import NextBestActionPanel from "@/components/portal/NextBestActionPanel";
import QuickActionsRow from "@/components/portal/QuickActionsRow";
import RecentActivityList from "@/components/portal/RecentActivityList";

export default function PortalHomePage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const { data, loading, error, reload } = usePortalHome("CONTRACTOR");

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-surface-500 text-sm">
        <Loader2 className="w-5 h-5 text-secondary-500 animate-spin ltr:ml-2 rtl:mr-2" />
        {t("loading")}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-surface-500 mb-3">{t("portalLoadError")}</p>
          <button
            onClick={reload}
            className="px-4 py-2 bg-secondary-500 text-white text-[11px] font-bold hover:bg-secondary-600 rounded-none"
          >
            {t("portalRetry")}
          </button>
        </div>
      </div>
    );
  }

  const name = (session?.user as { name?: string } | undefined)?.name ?? "";
  const welcome = t("portalContractorWelcome").replace("{name}", name).replace("{{name}}", name);

  return (
    <div className="w-full overflow-hidden bg-white border border-surface-200 shadow-2xl">
      <div className="px-4 py-4 space-y-4">
        <PortalHeader
          title={t("portalContractorTitle")}
          welcome={welcome}
          organization={data.organization}
        />
        <ActivationBar activation={data.activation} />
        <KpiRow kpis={data.kpis} />
        <div className="grid lg:grid-cols-2 gap-4">
          <NextBestActionPanel actions={data.nextBestActions} />
          <QuickActionsRow actions={data.quickActions} />
        </div>
        <RecentActivityList items={data.recentActivity} />
        {data.recommendations.length === 0 && (
          <p className="text-xs text-surface-400">
            {t("portalRecommendations")}: {t("portalComingSoon")}
          </p>
        )}
      </div>
    </div>
  );
}