"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  CheckCircle2,
  Activity,
  ClipboardList,
  AlertTriangle,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import {
  SurveyAnalytics,
  fetchSurveyAnalytics,
} from "@/lib/admin/survey-api";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import AdminSurveyShell from "@/components/admin/AdminSurveyShell";
import { useLanguage } from "@/lib/LanguageContext";

function replaceParams(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{{${key}}}`, String(value)),
    template,
  );
}

export default function SurveyAnalyticsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<SurveyAnalytics | null>(null);
  const [isRemote, setIsRemote] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { analytics, isRemote: remote } = await fetchSurveyAnalytics();
    setData(analytics);
    setIsRemote(remote);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!loading && !data) {
    return (
      <AdminSurveyShell title={t("surveyAnalyticsTitle")} subtitle={t("surveyAnalyticsSubtitle")}>
        <EmptyState
          icon={<BarChart3 className="w-7 h-7" />}
          title={t("surveyAnalyticsLoadFailedTitle")}
          description={t("surveyAnalyticsLoadFailedDesc")}
        />
      </AdminSurveyShell>
    );
  }

  const hasData = data ? data.totalUsers > 0 || data.categoryDistribution.length > 0 : false;

  return (
    <AdminSurveyShell
      title={t("surveyAnalyticsTitle")}
      subtitle={t("surveyAnalyticsSubtitle")}
      loading={loading}
      actions={
        <button
          type="button"
          onClick={load}
          className="text-sm text-info-600 hover:text-info-700 flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          {t("surveyAnalyticsRefresh")}
        </button>
      }
    >
      {data && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant={isRemote ? "success" : "warning"}>
              {isRemote === null
                ? t("surveyAnalyticsBadgeChecking")
                : isRemote
                  ? t("surveyAnalyticsBadgeLiveApi")
                  : t("surveyAnalyticsBadgeWaitingForApi")}
            </Badge>
          </div>

          {!isRemote && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {t("surveyAnalyticsBackendWarning")}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t("surveyAnalyticsStatRegisteredUsers")}
              value={data.totalUsers}
              icon={<Users className="w-5 h-5" />}
              color="bg-info-100 text-info-600"
            />
            <StatCard
              title={t("surveyAnalyticsStatCompleted")}
              value={data.totalCompleted}
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="bg-success-100 text-success-600"
            />
            <StatCard
              title={t("surveyAnalyticsStatCompletionRate")}
              value={`${data.completionRate}%`}
              icon={<Activity className="w-5 h-5" />}
              color="bg-amber-100 text-amber-600"
            />
            <StatCard
              title={t("surveyAnalyticsStatAvgCategories")}
              value={data.averageCategoriesPerUser}
              icon={<ListChecks className="w-5 h-5" />}
              color="bg-teal-100 text-teal-600"
            />
          </div>

          {!hasData ? (
            <EmptyState
              icon={<ClipboardList className="w-7 h-7" />}
              title={t("surveyAnalyticsEmptyTitle")}
              description={t("surveyAnalyticsEmptyDesc")}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("surveyAnalyticsCategoryDistributionTitle")}</CardTitle>
                  <span className="text-xs text-surface-500">
                    {replaceParams(t("surveyAnalyticsSubcategoriesSelectedTotal"), {
                      n: data.totalSubcategoriesSelected,
                    })}
                  </span>
                </CardHeader>
                <CardBody className="space-y-4">
                  {data.categoryDistribution.length === 0 ? (
                    <p className="text-sm text-surface-500">{t("surveyAnalyticsNoData")}</p>
                  ) : (
                    data.categoryDistribution.map((cat) => (
                      <div key={cat.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-surface-700">{cat.labelAr}</span>
                          <span className="text-surface-500">
                            {cat.count} ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-200 rounded-full h-2.5">
                          <div
                            className="bg-teal-500 h-2.5 rounded-full transition-all"
                            style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("surveyAnalyticsTopSubcategoriesTitle")}</CardTitle>
                </CardHeader>
                <CardBody>
                  {data.topSubcategories.length === 0 ? (
                    <p className="text-sm text-surface-500">{t("surveyAnalyticsNoData")}</p>
                  ) : (
                    <div className="space-y-3">
                      {data.topSubcategories.map((sub, idx) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-lg border border-surface-200 px-3 py-2"
                        >
                          <span className="flex items-center gap-2 text-sm">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-600">
                              {idx + 1}
                            </span>
                            {sub.labelAr}
                            <span className="text-xs text-surface-400" dir="ltr">
                              {sub.labelEn}
                            </span>
                          </span>
                          <Badge variant="success">{sub.count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      )}
    </AdminSurveyShell>
  );
}
