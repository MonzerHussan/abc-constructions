"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  CheckCircle2,
  Activity,
  ClipboardList,
  Loader2,
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

export default function SurveyAnalyticsPage() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-surface-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        جاري تحميل التحليلات...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<BarChart3 className="w-7 h-7" />}
          title="تعذّر تحميل التحليلات"
          description="لم نتمكن من جلب إحصائيات الاستبيان."
        />
      </div>
    );
  }

  const hasData = data.totalUsers > 0 || data.categoryDistribution.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">تحليلات الاستبيان</h1>
              <p className="text-surface-500 text-sm">توزيع الفئات ومعدل الإكمال</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant={isRemote ? "success" : "warning"}>
              {isRemote === null
                ? "جارٍ التحقق..."
                : isRemote
                  ? "بيانات مباشرة من الـ API"
                  : "لا توجد بيانات بعد — بانتظار API المبرمج 6"}
            </Badge>
          </div>
        </div>
      </div>

      {!isRemote && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          إحصاءات الاستبيان تتطلب الـ backend (`GET /api/v1/survey-config/analytics`). بمجرد بنائه ستعرض هذه الصفحة الأرقام الفعلية تلقائياً.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="المستخدمون المسجلون"
          value={data.totalUsers}
          icon={<Users className="w-5 h-5" />}
          color="bg-info-100 text-info-600"
        />
        <StatCard
          title="أكملوا الاستبيان"
          value={data.totalCompleted}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="bg-success-100 text-success-600"
        />
        <StatCard
          title="معدل الإكمال"
          value={`${data.completionRate}%`}
          icon={<Activity className="w-5 h-5" />}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="متوسط الفئات لكل مستخدم"
          value={data.averageCategoriesPerUser}
          icon={<ListChecks className="w-5 h-5" />}
          color="bg-teal-100 text-teal-600"
        />
      </div>

      {!hasData ? (
        <EmptyState
          icon={<ClipboardList className="w-7 h-7" />}
          title="لا توجد بيانات استبيان بعد"
          description="ستظهر هنا إحصائيات توزيع الفئات ومعدل الإكمال بمجرد تسجيل أولى الردود وربط الـ backend."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الفئات المختارة</CardTitle>
              <span className="text-xs text-surface-500">
                {data.totalSubcategoriesSelected} فئة فرعية مختارة إجمالاً
              </span>
            </CardHeader>
            <CardBody className="space-y-4">
              {data.categoryDistribution.length === 0 ? (
                <p className="text-sm text-surface-500">لا توجد بيانات.</p>
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
              <CardTitle>أكثر الفئات الفرعية اختياراً</CardTitle>
            </CardHeader>
            <CardBody>
              {data.topSubcategories.length === 0 ? (
                <p className="text-sm text-surface-500">لا توجد بيانات.</p>
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

      <div className="flex justify-end">
        <button
          onClick={load}
          className="text-sm text-info-600 hover:text-info-700 flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث البيانات
        </button>
      </div>
    </div>
  );
}
