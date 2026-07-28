"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchFilter from "@/components/SearchFilter";
import { StatusBadge, Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { MATERIAL_TYPES } from "@/lib/constants";
import { formatDate, timeAgo } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Package,
  MapPin,
  Truck,
  Users,
  Plus,
  Eye,
  Scale,
} from "lucide-react";

const mockTenders = [
  {
    id: "1",
    title: "شراء أسمنت بورتلاندي - 500 طن",
    description: "الشراء بكميات كبيرة من الأسمنت البورتلاندي للمشاريع الجارية",
    materialType: "أسمنت",
    quantity: "500 طن",
    unit: "طن",
    deliveryDate: "2026-08-10",
    location: "الرياض",
    budgetMax: 175000,
    status: "OPEN",
    bidsCount: 8,
    user: { name: "مؤسسة ابن خلدون", role: "CONTRACTOR" },
    createdAt: "2026-07-26",
  },
  {
    id: "2",
    title: "حديد تسليح - 200 طن",
    description: "شراء حديد تسليم بيتون بقطر 12-20 ملم لمشروع سكني",
    materialType: "حديد",
    quantity: "200 طن",
    unit: "طن",
    deliveryDate: "2026-08-15",
    location: "جدة",
    budgetMax: 580000,
    status: "OPEN",
    bidsCount: 12,
    user: { name: "شركة الإنشاءات الحديثة", role: "CONTRACTOR" },
    createdAt: "2026-07-25",
  },
  {
    id: "3",
    title: "بلاط سيراميك - 3000 متر مربع",
    description: "شراء بلاط سيراميك لتشطيبات 40 وحدة سكنية",
    materialType: "بلاط",
    quantity: "3000 متر مربع",
    unit: "م²",
    deliveryDate: "2026-08-20",
    location: "الدمام",
    budgetMax: 90000,
    status: "OPEN",
    bidsCount: 6,
    user: { name: "م. سعيد الدوسري", role: "CONTRACTOR" },
    createdAt: "2026-07-24",
  },
  {
    id: "4",
    title: "كابلات كهربائية - شراء متنوع",
    description: "شراء مجموعة متنوعة من الكابلات الكهربائية للمشروع",
    materialType: "كابلات",
    quantity: "10,000 متر",
    unit: "م",
    deliveryDate: "2026-08-25",
    location: "الظهران",
    budgetMax: 45000,
    status: "OPEN",
    bidsCount: 9,
    user: { name: "شركة الكهرباء الحديثة", role: "CONTRACTOR" },
    createdAt: "2026-07-23",
  },
];

export default function MaterialTendersPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: t("tendersTitle"), href: "/tenders" },
            { label: t("materialTendersTitle") },
          ]}
        />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-7 h-7 text-green-600" />
              {t("materialTendersTitle")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("materialTendersDescription")}
            </p>
          </div>
          <Link
            href="/tenders/materials/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t("purchaseRequest")}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-500">{t("activeRequests")}</p>
            <p className="text-2xl font-bold text-green-600">35</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">{t("submittedBids")}</p>
            <p className="text-2xl font-bold text-blue-600">142</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">{t("estimatedSavings")}</p>
            <p className="text-2xl font-bold text-amber-600">15%</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">{t("activeSuppliers")}</p>
            <p className="text-2xl font-bold text-purple-600">68</p>
          </Card>
        </div>

        <SearchFilter
          placeholder={t("materialTendersTitle")}
          categories={MATERIAL_TYPES}
        />

        {/* Tenders List */}
        <div className="space-y-4 mt-6">
          {mockTenders.map((tender) => (
            <Card key={tender.id} hover className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {tender.title}
                    </h3>
                    <StatusBadge
                      label={t("open")}
                      color="bg-green-100 text-green-800"
                    />
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {tender.materialType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {tender.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Scale className="w-4 h-4" />
                      {t("quantity")}: {tender.quantity}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tender.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      {t("deliveryDate")}: {formatDate(tender.deliveryDate!)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tender.bidsCount} {t("bids")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <span className="text-gray-500">{t("publishedBy")}</span>
                    <span className="font-medium text-gray-700">
                      {tender.user.name}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-400">{timeAgo(tender.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:min-w-[140px]">
                  <Link
                    href={`/tenders/materials/${tender.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {t("description")}
                  </Link>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    {t("submitPriceBid")}
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
