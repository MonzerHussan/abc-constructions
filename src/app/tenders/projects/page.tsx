"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchFilter from "@/components/SearchFilter";
import { StatusBadge, Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORIES } from "@/lib/constants";
import { formatDate, formatCurrency, timeAgo } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import {
  FileText,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Plus,
  Eye,
} from "lucide-react";

const mockTenders = [
  {
    id: "1",
    title: "بناء فيلا سكنية - حي الملقا",
    description: "بناء فيلا سكنية مساحة 450 متر مربع، نظام كتريني مع حديقة وموقف سيارات",
    category: "البناء العام",
    location: "الرياض - حي الملقا",
    budgetMin: 500000,
    budgetMax: 750000,
    deadline: "2026-08-15",
    requirements: "خبرة لا تقل عن 10 سنوات، سجل تجاري ساري",
    status: "OPEN",
    bidsCount: 12,
    user: { name: "م. عبدالله الراشد", company: "شركة الراشد للتطوير", role: "OWNER" },
    createdAt: "2026-07-25",
  },
  {
    id: "2",
    title: "ترميم مبنى إداري - العليا",
    description: "ترميم شامل لمبنى إداري من 5 طوابق يشمل التشطيبات الداخلية والخارجية",
    category: "التشطيبات",
    location: "الرياض - حي العليا",
    budgetMin: 300000,
    budgetMax: 450000,
    deadline: "2026-09-01",
    requirements: "مقاول معتمد من هيئة البناء",
    status: "OPEN",
    bidsCount: 8,
    user: { name: "محمد العتيبي", company: "مؤسسة العتيبي للمقاولات", role: "CONSULTANT" },
    createdAt: "2026-07-24",
  },
  {
    id: "3",
    title: "إنشاء مستودع صناعي",
    description: "بناء مستودع صناعي بمساحة 2000 متر مربع مع مكاتب إدارية",
    category: "البنية التحتية",
    location: "الدمام - المنطقة الصناعية",
    budgetMin: 1200000,
    budgetMax: 1800000,
    deadline: "2026-10-01",
    requirements: "خبرة في المشاريع الصناعية",
    status: "OPEN",
    bidsCount: 5,
    user: { name: "خالد الشمري", company: "شركة الشمري الصناعية", role: "OWNER" },
    createdAt: "2026-07-23",
  },
  {
    id: "4",
    title: "صيانة دورية لمجمع سكني",
    description: "عقد صيانة سنوي لمجمع سكني يضم 50 وحدة سكنية",
    category: "الصيانة",
    location: "جدة - حي الروضة",
    budgetMin: 80000,
    budgetMax: 120000,
    deadline: "2026-08-30",
    requirements: "فريق صيانة متخصص",
    status: "OPEN",
    bidsCount: 15,
    user: { name: "سالم القحطاني", company: "إدارة مجمع الواحة", role: "OWNER" },
    createdAt: "2026-07-22",
  },
];

export default function ProjectTendersPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: t("tendersTitle"), href: "/tenders" },
            { label: t("tendersTitle") },
          ]}
        />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-amber-600" />
              {t("tendersTitle")}
            </h1>
            <p className="text-surface-600 mt-1">
              {t("tendersDescription")}
            </p>
          </div>
          <Link
            href="/tenders/projects/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t("addTender")}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-surface-500">{t("openTenders")}</p>
            <p className="text-2xl font-bold text-success-600">42</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-surface-500">{t("totalBids")}</p>
            <p className="text-2xl font-bold text-info-600">186</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-surface-500">{t("awardedTenders")}</p>
            <p className="text-2xl font-bold text-flagship-600">28</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-surface-500">{t("projectOwners")}</p>
            <p className="text-2xl font-bold text-amber-600">95</p>
          </Card>
        </div>

        <SearchFilter
          placeholder={t("tendersTitle")}
          categories={CATEGORIES}
        />

        {/* Tenders List */}
        <div className="space-y-4 mt-6">
          {mockTenders.map((tender) => (
            <Card key={tender.id} hover className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-surface-900">
                      {tender.title}
                    </h3>
                    <StatusBadge
                      label={t("open")}
                      color="bg-success-100 text-success-800"
                    />
                    <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full">
                      {tender.category}
                    </span>
                  </div>
                  <p className="text-sm text-surface-600 mb-3">
                    {tender.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tender.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(tender.budgetMin!)} -{" "}
                      {formatCurrency(tender.budgetMax!)} {t("currency")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {t("deadline")}: {formatDate(tender.deadline)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tender.bidsCount} {t("bids")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <span className="text-surface-500">{t("publishedBy")}</span>
                    <span className="font-medium text-surface-700">
                      {tender.user.name}
                    </span>
                    <span className="text-surface-400">|</span>
                    <span className="text-surface-500">{tender.user.company}</span>
                    <span className="text-surface-400">|</span>
                    <span className="text-surface-400">{timeAgo(tender.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:min-w-[140px]">
                  <Link
                    href={`/tenders/projects/${tender.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {t("description")}
                  </Link>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-surface-300 text-surface-700 rounded-xl text-sm font-medium hover:bg-surface-50 transition-colors">
                    {t("submitBid")}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
