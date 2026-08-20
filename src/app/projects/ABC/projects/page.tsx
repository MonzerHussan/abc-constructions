"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Building2,
  FileText,
  Package,
  Briefcase,
  GraduationCap,
  ArrowLeft,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import PlatformHeader from "@/components/platform/PlatformHeader";
import { useLanguage } from "@/lib/LanguageContext";
import type { UserRole } from "@/lib/navigation/types";
import { cn } from "@/lib/utils";

const ROLE_DASHBOARD_COPY: Record<
  string,
  { titleKey: "roleSubcontractor" | "roleContractor" | "roleConsultant" | "roleOwner"; subtitleKey: "subDashboardSubtitle" }
> = {
  SUBCONTRACTOR: { titleKey: "roleSubcontractor", subtitleKey: "subDashboardSubtitle" },
  WORKSHOP: { titleKey: "roleSubcontractor", subtitleKey: "subDashboardSubtitle" },
  CONTRACTOR: { titleKey: "roleContractor", subtitleKey: "subDashboardSubtitle" },
  CONSULTANT: { titleKey: "roleConsultant", subtitleKey: "subDashboardSubtitle" },
  OWNER: { titleKey: "roleOwner", subtitleKey: "subDashboardSubtitle" },
};

const QUICK_LINKS = [
  { href: "/projects/ABC/tenders/projects", labelKey: "navProjectTenders" as const, icon: FileText },
  { href: "/projects/ABC/tenders/materials", labelKey: "navMaterialTenders" as const, icon: ClipboardList },
  { href: "/projects/ABC/marketplace", labelKey: "navMarketplace" as const, icon: Package },
  { href: "/projects/ABC/jobs", labelKey: "navJobs" as const, icon: Briefcase },
  { href: "/projects/ABC/training", labelKey: "navTraining" as const, icon: GraduationCap },
  { href: "/projects/ABC/organization", labelKey: "myOrganization" as const, icon: Building2 },
];

export default function ProjectsPage() {
  const { t, dir } = useLanguage();
  const { data: session } = useSession();
  const role = (session?.user as { role?: UserRole } | undefined)?.role ?? "SUBCONTRACTOR";
  const copy = ROLE_DASHBOARD_COPY[role] ?? ROLE_DASHBOARD_COPY.SUBCONTRACTOR;
  const name = session?.user?.name || session?.user?.email || "";

  return (
    <div dir={dir} className="min-h-screen bg-surface-100">
      <PlatformHeader />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        <section className="rounded-none border border-surface-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary-600 mb-1">
            {t("dashboard")}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900">
            {t(copy.titleKey)}
          </h1>
          <p className="text-sm text-surface-600 mt-1">
            {t("obWelcomeUser")}
            {name ? `، ${name}` : ""}
          </p>
          <p className="text-sm text-surface-500 mt-2">{t(copy.subtitleKey)}</p>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { label: t("subStatActiveTenders"), value: "12", icon: FileText },
            { label: t("subStatMyProjects"), value: "4", icon: Building2 },
            { label: t("subStatQuotes"), value: "7", icon: TrendingUp },
            { label: t("subStatMessages"), value: "3", icon: Package },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-none border border-surface-200 bg-white p-3 shadow-sm"
            >
              <stat.icon className="w-4 h-4 text-secondary-600 mb-2" />
              <p className="text-lg font-bold text-surface-900">{stat.value}</p>
              <p className="text-xs font-semibold text-surface-500">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-none border border-surface-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-surface-900 mb-3">{t("subQuickActions")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href + link.labelKey}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-none border border-surface-200 px-3 py-2.5",
                  "text-sm font-semibold text-surface-700 hover:border-secondary-400 hover:bg-secondary-50 hover:text-secondary-700 transition-colors",
                )}
              >
                <link.icon className="w-4 h-4 shrink-0 text-secondary-600" />
                <span className="leading-tight">{t(link.labelKey)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-none border border-surface-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-surface-900">{t("subRecentTenders")}</h2>
            <Link
              href="/projects/ABC/tenders/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-secondary-700 hover:text-secondary-800"
            >
              {t("viewAll")}
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>
          <ul className="divide-y divide-surface-100">
            {[
              { title: "تشطيبات داخلية — برج الأعمال", status: t("active") },
              { title: "أعمال كهرباء — مجمع الواحة", status: t("active") },
              { title: "دهانات واجهات — مستشفى الملك فهد", status: t("pending") },
            ].map((item) => (
              <li key={item.title} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm font-medium text-surface-800">{item.title}</span>
                <span className="text-xs font-semibold text-secondary-700 bg-secondary-50 px-2 py-0.5 rounded-none border border-secondary-100">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
