"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  FileText,
  Package,
  Store,
  Building,
  Building2,
  Briefcase,
  GraduationCap,
  ArrowLeft,
  TrendingUp,
  Shield,
  Zap,
  Star,
  Truck,
  HardHat,
  Handshake,
  Wrench,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  const modules = [
    {
      icon: FileText,
      title: t("modProjectTenders"),
      description: t("modProjectTendersDesc"),
      href: "/tenders/projects",
      color: "from-primary-500 to-primary-600",
      stat: "120+ مناقصة نشطة",
    },
    {
      icon: Package,
      title: t("modMaterialTenders"),
      description: t("modMaterialTendersDesc"),
      href: "/tenders/materials",
      color: "from-primary-400 to-primary-500",
      stat: "85+ طلب شراء",
    },
    {
      icon: Store,
      title: t("modMarketplace"),
      description: t("modMarketplaceDesc"),
      href: "/marketplace",
      color: "from-secondary-500 to-secondary-600",
      stat: "500+ منتج متاح",
    },
    {
      icon: Building,
      title: t("modProjects"),
      description: t("modProjectsDesc"),
      href: "/projects",
      color: "from-primary-500 to-primary-700",
      stat: "200+ مشروع معروض",
    },
    {
      icon: Briefcase,
      title: t("modJobs"),
      description: t("modJobsDesc"),
      href: "/jobs",
      color: "from-accent-500 to-accent-600",
      stat: "60+ فرصة عمل",
    },
    {
      icon: Truck,
      title: t("modDelivery"),
      description: t("modDeliveryDesc"),
      href: "/delivery",
      color: "from-secondary-400 to-secondary-500",
      stat: "45+ سائق متاح",
    },
    {
      icon: GraduationCap,
      title: t("modTraining"),
      description: t("modTrainingDesc"),
      href: "/training",
      color: "from-primary-600 to-primary-700",
      stat: "45+ دورة تدريبية",
    },
  ];

  const stats = [
    { label: t("completedProjects"), value: "2,500+", icon: Building2 },
    { label: t("verifiedContractors"), value: "1,800+", icon: Shield },
    { label: t("buildingMaterials"), value: "10,000+", icon: Package },
    { label: t("completedTenders"), value: "3,200+", icon: TrendingUp },
  ];

  const roles = [
    { name: t("roleOwner"), desc: "إدارة المشاريع والمناقصات", icon: Building },
    { name: t("roleConsultant"), desc: "المتابعة والإشراف الفني", icon: FileText },
    { name: t("roleContractor"), desc: "تنفيذ الأعمال الإنشائية", icon: HardHat },
    { name: t("roleSubcontractor"), desc: "الأعمال المتخصصة", icon: Wrench },
    { name: t("roleWorkshop"), desc: "الأعمال اليدوية المتخصصة", icon: Wrench },
    { name: t("roleFreelancer"), desc: "الخدماتFreelance", icon: Briefcase },
    { name: t("roleSupplier"), desc: "توريد مواد البناء", icon: Handshake },
    { name: t("roleTrader"), desc: "بيع وتجارة مواد البناء", icon: Store },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-accent-400" />
              <span className="text-sm text-white/90">{t("appDescription")}</span>
            </div>
            <h1 className="headline text-white mb-6">
              {t("heroTitle")}
              <br />
              {t("heroSubtitle")}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {t("heroDescription")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="px-8 py-3.5 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors text-lg"
              >
                {t("startNow")}
              </Link>
              <Link
                href="/tenders/projects"
                className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/20 transition-colors text-lg flex items-center gap-2"
              >
                {t("browseTenders")}
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-secondary-600" />
                </div>
                <p className="text-3xl font-bold text-primary-500">{stat.value}</p>
                <p className="text-sm text-surface-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-500 mb-4">
              {t("servicesTitle")}
            </h2>
            <p className="text-surface-600 max-w-xl mx-auto text-lg">
              {t("servicesDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <Link key={mod.href} href={mod.href}>
                <div className="bg-white rounded-2xl border border-surface-200 p-6 card-hover h-full">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4`}
                  >
                    <mod.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 mb-2">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-surface-600 mb-4">{mod.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary-600 bg-secondary-50 px-2.5 py-1 rounded-full">
                      {mod.stat}
                    </span>
                    <ArrowLeft className="w-5 h-5 text-surface-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 mb-4">
              {t("forEveryoneTitle")}
            </h2>
            <p className="text-surface-600">
              {t("forEveryoneDescription")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roles.map((role) => {
              const RoleIcon = role.icon;
              return (
                <div
                  key={role.name}
                  className="bg-white rounded-xl border border-surface-200 p-4 text-center card-hover"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <RoleIcon className="w-6 h-6 text-primary-500" />
                  </div>
                  <h4 className="font-bold text-surface-900 text-sm mb-1">{role.name}</h4>
                  <p className="text-xs text-surface-500">{role.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-hero rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t("joinTitle")}
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                {t("joinDescription")}
              </p>
              <Link
                href="/auth/register"
                className="inline-flex px-8 py-3.5 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors text-lg"
              >
                {t("createFreeAccount")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt={t("appName")} width={48} height={48} className="w-12 h-12" />
                <div>
                  <span className="text-xl font-bold text-white">{t("appName")}</span>
                  <span className="text-xs block text-accent-500">
                    {t("appFullName")}
                  </span>
                </div>
              </div>
              <p className="text-sm">
                {t("appDescription")}
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("services")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/tenders/projects" className="hover:text-white">
                    {t("modProjectTenders")}
                  </Link>
                </li>
                <li>
                  <Link href="/tenders/materials" className="hover:text-white">
                    {t("modMaterialTenders")}
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace" className="hover:text-white">
                    {t("modMarketplace")}
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-white">
                    {t("modJobs")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("about")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white">
                    {t("about")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    {t("contact")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    {t("terms")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    {t("privacy")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("contact")}</h4>
              <ul className="space-y-2 text-sm">
                <li>info@abc-constructions.com</li>
                <li>+966 50 000 0000</li>
                <li>الرياض، المملكة العربية السعودية</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-surface-800 mt-8 pt-8 text-center text-sm">
            <p>© 2026 {t("appName")} - {t("appFullName")}. {t("allRights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
