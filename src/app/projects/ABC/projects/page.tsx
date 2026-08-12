"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchFilter from "@/components/SearchFilter";
import { StatusBadge, Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORIES, PROJECT_STATUS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import ProjectMap from "@/components/ProjectMap";
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Ruler,
  Plus,
  Heart,
  Map as MapIcon,
  List,
} from "lucide-react";
import { useState } from "react";

const mockProjects = [
  {
    id: "1",
    title: "مجمع الواحة السكني",
    description:
      "مجمع سكني فاخر يضم 30 وحدة سكنية بتصميم عصري مع مرافق ترفيهية ومواقف سيارات تحت الأرض",
    category: "البناء العام",
    location: "الرياض - حي النرجس",
    clientName: "شركة المدار العقارية",
    budget: 15000000,
    area: "12,000 م²",
    startDate: "2024-01-15",
    endDate: "2025-12-01",
    images: [],
    status: "COMPLETED",
    highlights: "جائزة أفضل مشروع سكني 2025",
    user: { name: "م. فهد الحربي", company: "شركة الحربي للمقاولات", role: "CONTRACTOR" },
    likes: 245,
    views: 1820,
    lat: 24.7743,
    lng: 46.6861,
  },
  {
    id: "2",
    title: "برج الأعمال المركزي",
    description:
      "برج إداري من 25 طابق بتصميم زجاجي عصري في قلب المملكة العربية السعودية",
    category: "الأبراج والمباني العالية",
    location: "الرياض - حي العليا",
    clientName: "هيئة تطوير الرياض",
    budget: 85000000,
    area: "45,000 م²",
    startDate: "2023-06-01",
    endDate: "2026-03-01",
    images: [],
    status: "IN_PROGRESS",
    highlights: "أكبر برج إداري في المنطقة",
    user: { name: "م. ناصر السبيعي", company: "مجموعة السبيعي الإنشائية", role: "CONTRACTOR" },
    likes: 520,
    views: 3400,
    lat: 24.7311,
    lng: 46.6559,
  },
  {
    id: "3",
    title: "مستشفى الملك فهد التخصصي",
    description:
      "مستشفى تخصصي بسعة 200 سرير بأحدث المعدات الطبية والتقنيات الحديثة",
    category: "البنية التحتية",
    location: "جدة - حي الأندلس",
    clientName: "وزارة الصحة",
    budget: 120000000,
    area: "35,000 م²",
    startDate: "2024-03-01",
    endDate: null,
    images: [],
    status: "IN_PROGRESS",
    highlights: "مشروع حكومي استراتيجي",
    user: { name: "م. عبدالرحمن الدوسري", company: "شركة الدوسري للمقاولات", role: "CONTRACTOR" },
    likes: 380,
    views: 2800,
    lat: 21.5433,
    lng: 39.1728,
  },
  {
    id: "4",
    title: "مجمع واحة التسوق",
    description:
      "مجمع تجاري عصري يضم 120 محل تجاري وسوبر ماركت ومساحات ترفيهية",
    category: "البناء العام",
    location: "الدمام - حي الفيصلية",
    clientName: "مجموعة الراجحي العقارية",
    budget: 45000000,
    area: "28,000 م²",
    startDate: "2025-01-01",
    endDate: null,
    images: [],
    status: "PLANNING",
    highlights: null,
    user: { name: "م. سلطان المطيري", company: "شركة المطيري للتطوير", role: "CONTRACTOR" },
    likes: 156,
    views: 980,
    lat: 26.4207,
    lng: 50.0888,
  },
];

export default function ProjectsPage() {
  const { t, language } = useLanguage();
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: t("projectsTitle") }]} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-flagship-600" />
              {t("projectsTitle")}
            </h1>
            <p className="text-surface-600 mt-1">
              {t("projectsDescription")}
            </p>
          </div>
          <Link
            href="/projects/ABC/projects/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-flagship-500 text-white rounded-xl font-medium hover:bg-flagship-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t("addProject")}
          </Link>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filterStatus === "all"
                ? "bg-flagship-500 text-white"
                : "bg-white text-surface-600 border border-surface-200 hover:bg-surface-50"
            }`}
          >
            {t("active")}
          </button>
          {Object.entries(PROJECT_STATUS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filterStatus === key
                  ? "bg-flagship-500 text-white"
                  : "bg-white text-surface-600 border border-surface-200 hover:bg-surface-50"
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>

        <SearchFilter
          placeholder={t("projectsTitle")}
          categories={CATEGORIES}
        />

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-4 mt-4">
          <p className="text-sm text-surface-500">
            {viewMode === "grid"
              ? language === "ar"
                ? `عرض ${mockProjects.length} مشروع`
                : language === "en"
                ? `Showing ${mockProjects.length} projects`
                : `${mockProjects.length} منصوبے دکھا رہا ہے`
              : ""}
          </p>
          <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white shadow-sm text-flagship-600" : "text-surface-500 hover:text-surface-700"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "map" ? "bg-white shadow-sm text-flagship-600" : "text-surface-500 hover:text-surface-700"
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map View */}
        {viewMode === "map" && (
          <div className="mb-6">
            <ProjectMap
              projects={mockProjects.map((p) => ({
                id: p.id,
                title: p.title,
                location: p.location,
                lat: p.lat,
                lng: p.lng,
                status: p.status,
              }))}
              height="500px"
            />
          </div>
        )}

        {/* Projects Grid */}
        {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {mockProjects.map((project) => (
            <Card key={project.id} hover className="overflow-hidden">
              <div className="h-56 bg-gradient-to-br from-flagship-50 to-flagship-100 flex items-center justify-center relative">
                <Building2 className="w-20 h-20 text-flagship-200" />
                <div className="absolute top-3 right-3">
                  <StatusBadge
                    label={PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS].label}
                    color={PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS].color}
                  />
                </div>
                {project.highlights && (
                  <div className="absolute bottom-3 right-3 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {project.highlights}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-flagship-600 bg-flagship-50 px-2 py-0.5 rounded-full">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-surface-600 line-clamp-2 mb-3">
                  {project.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-surface-500 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </span>
                  {project.area && (
                    <span className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      {project.area}
                    </span>
                  )}
                  {project.budget && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(project.budget)} {t("currency")}
                    </span>
                  )}
                  {project.endDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(project.endDate)}
                    </span>
                  )}
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-flagship-100 rounded-full flex items-center justify-center text-sm font-medium text-flagship-700">
                      {project.user.name[3]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        {project.user.name}
                      </p>
                      <p className="text-xs text-surface-500">{project.user.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-surface-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {project.likes}
                    </span>
                    <span>{project.views} {t("views")}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
