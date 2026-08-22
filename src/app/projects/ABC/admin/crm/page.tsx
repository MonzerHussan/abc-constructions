"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, Target, Plus } from "lucide-react";
import AdminSurveyShell from "@/components/admin/AdminSurveyShell";
import { useLanguage } from "@/lib/LanguageContext";
import { isPlatformStaffRole } from "@/lib/auth/platform-admin";
import type { TranslationKey } from "@/lib/translations";

interface CrmStats {
  totalLeads: number;
  totalContacts: number;
  totalOpportunities: number;
  totalActivities: number;
  openTasks: number;
  upcomingMeetings: number;
}

export default function AdminCrmPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<CrmStats>({
    totalLeads: 0,
    totalContacts: 0,
    totalOpportunities: 0,
    totalActivities: 0,
    openTasks: 0,
    upcomingMeetings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session) return;
    if (!isPlatformStaffRole(role)) {
      router.push("/projects/ABC?login=1");
      return;
    }

    Promise.all([
      fetch("/api/crm/leads?limit=1").then((r) => r.json()),
      fetch("/api/crm/contacts?limit=1").then((r) => r.json()),
      fetch("/api/crm/opportunities?limit=1").then((r) => r.json()),
      fetch("/api/crm/activities?limit=1").then((r) => r.json()),
      fetch("/api/crm/tasks?status=IN_PROGRESS&limit=1").then((r) => r.json()),
      fetch("/api/crm/meetings?limit=1").then((r) => r.json()),
    ])
      .then(([leads, contacts, opportunities, activities, tasks, meetings]) => {
        setStats({
          totalLeads: leads.total ?? 0,
          totalContacts: contacts.total ?? 0,
          totalOpportunities: opportunities.total ?? 0,
          totalActivities: activities.total ?? 0,
          openTasks: tasks.total ?? 0,
          upcomingMeetings: meetings.total ?? 0,
        });
        setLoading(false);
      })
      .catch(() => {
        setLoadError(t("crmLoadError"));
        setLoading(false);
      });
  }, [session, router, t]);

const statCards: {
    labelKey: TranslationKey;
    value: number;
    icon: typeof Users;
    color: string;
    href: string;
  }[] = [
    { labelKey: "crmStatLeads", value: stats.totalLeads, icon: Users, color: "bg-info-500", href: "/projects/ABC/admin/crm/leads" },
    { labelKey: "crmStatContacts", value: stats.totalContacts, icon: Users, color: "bg-success-500", href: "/projects/ABC/admin/crm/contacts" },
    { labelKey: "crmStatOpportunities", value: stats.totalOpportunities, icon: Target, color: "bg-flagship-500", href: "/projects/ABC/admin/crm/opportunities" },
  ];

  const featureCards: { titleKey: TranslationKey; descKey: TranslationKey; href: string; icon: typeof Users; color: string }[] = [
    { titleKey: "crmLeadsTitle", descKey: "crmLeadsDesc", href: "/projects/ABC/admin/crm/leads", icon: Users, color: "text-info-600" },
    { titleKey: "crmContactsTitle", descKey: "crmContactsDesc", href: "/projects/ABC/admin/crm/contacts", icon: Users, color: "text-success-600" },
    { titleKey: "crmOpportunitiesTitle", descKey: "crmOpportunitiesDesc", href: "/projects/ABC/admin/crm/opportunities", icon: Target, color: "text-flagship-600" },
  ];

  const isEmpty = Object.values(stats).every((v) => v === 0);

  return (
    <AdminSurveyShell
      title={t("adminCrm")}
      subtitle={t("crmSubtitle")}
      loading={loading}
      actions={
        <Link
          href="/projects/ABC/admin/crm/leads/new"
          className="inline-flex items-center gap-2 bg-secondary-500 text-white px-4 py-2 text-sm font-semibold hover:bg-secondary-600 rounded-none"
        >
          <Plus size={18} />
          {t("crmNewLead")}
        </Link>
      }
    >
      {loadError ? (
        <p className="text-sm text-danger-600 mb-4">{loadError}</p>
      ) : null}

      {isEmpty && !loadError ? (
        <div className="mb-6 border border-surface-200 bg-surface-50/80 px-4 py-3 text-sm text-surface-600 rounded-none">
          {t("crmEmptyHint")}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {statCards.map((card) => (
          <Link
            key={card.labelKey}
            href={card.href}
            className="bg-white border border-surface-200 rounded-none p-4 flex items-center gap-4 hover:border-secondary-300 transition-colors"
          >
            <div className={`${card.color} p-3 rounded-none text-white shrink-0`}>
              <card.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-surface-900">{card.value}</p>
              <p className="text-surface-500 text-sm">{t(card.labelKey)}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {featureCards.map((card) => (
          <Link
            key={card.titleKey}
            href={card.href}
            className="bg-white border border-surface-200 rounded-none p-5 hover:border-secondary-300 transition-colors"
          >
            <card.icon className={`${card.color} mb-3`} size={28} />
            <h3 className="font-bold text-lg mb-2 text-surface-900">{t(card.titleKey)}</h3>
            <p className="text-surface-500 text-sm">{t(card.descKey)}</p>
          </Link>
        ))}
      </div>
    </AdminSurveyShell>
  );
}

