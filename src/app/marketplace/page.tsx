"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchFilter from "@/components/SearchFilter";
import { Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Store,
  Heart,
  MapPin,
  Star,
  ShoppingCart,
  Plus,
  Eye,
  Package,
} from "lucide-react";
import { useState } from "react";

const mockProducts = [
  {
    id: "1",
    name: "أسمنت بورتلاندي عالي الجودة",
    description: "أسمنت بورتلاندي من إنتاج مصنع الشرقية - شهادة مطابقة سعودية",
    category: "أسمنت",
    price: 350,
    unit: "طن",
    minQuantity: 10,
    images: [],
    inStock: true,
    location: "الرياض",
    user: { name: "شركة البناء للمواد", rating: 4.8, reviews: 124 },
    isFavorited: false,
  },
  {
    id: "2",
    name: "حديد تسليم بيتون 16 ملم",
    description: "حديد تسليم بيتون بجودة عالية مطابق للمواصفات السعودية",
    category: "حديد",
    price: 2900,
    unit: "طن",
    minQuantity: 5,
    images: [],
    inStock: true,
    location: "جدة",
    user: { name: "مؤسسة الحديد العربي", rating: 4.6, reviews: 89 },
    isFavorited: true,
  },
  {
    id: "3",
    name: "بلاط سيراميك بورسلان - مطابخ",
    description: "بلاط سيراميك بورسلان مقاوم للحرارة مناسب للمطابخ والحمامات",
    category: "بلاط",
    price: 85,
    unit: "م²",
    minQuantity: 50,
    images: [],
    inStock: true,
    location: "الدمام",
    user: { name: "عالم السيراميك", rating: 4.9, reviews: 203 },
    isFavorited: false,
  },
  {
    id: "4",
    name: "دهانات جوتن - ألوان متنوعة",
    description: "دهانات داخلية وخارجية من جوتن - تغطية ممتازة ومقاومة للعوامل الجوية",
    category: "دهانات",
    price: 220,
    unit: "جالون",
    minQuantity: 5,
    images: [],
    inStock: true,
    location: "الرياض",
    user: { name: "محلات الدهانات المتحدة", rating: 4.5, reviews: 67 },
    isFavorited: false,
  },
  {
    id: "5",
    name: "أنابيب PVC - مقاسات متنوعة",
    description: "أنابيب PVC للمياه والصرف - جميع المقاسات من 20 إلى 200 ملم",
    category: "أنابيب",
    price: 15,
    unit: "متر",
    minQuantity: 100,
    images: [],
    inStock: true,
    location: "الظهران",
    user: { name: "شركة الأنابيب الحديثة", rating: 4.7, reviews: 156 },
    isFavorited: false,
  },
  {
    id: "6",
    name: "زجاج مقوّى 10 ملم",
    description: "زجاج مقوّى للأماكن التجارية والسكنية - قطع بأحجام مخصصة",
    category: "زجاج",
    price: 120,
    unit: "م²",
    minQuantity: 10,
    images: [],
    inStock: false,
    location: "جدة",
    user: { name: "مصنع الزجاج السعودي", rating: 4.4, reviews: 45 },
    isFavorited: false,
  },
];

export default function MarketplacePage() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: t("navMarketplace") }]} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <Store className="w-7 h-7 text-amber-600" />
              {t("marketplaceTitle")}
            </h1>
            <p className="text-surface-600 mt-1">
              {t("marketplaceDescription")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  viewMode === "grid"
                    ? "bg-white shadow text-surface-900"
                    : "text-surface-500"
                }`}
              >
                {t("gridView")}
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  viewMode === "list"
                    ? "bg-white shadow text-surface-900"
                    : "text-surface-500"
                }`}
              >
                {t("listView")}
              </button>
            </div>
            <Link
              href="/marketplace/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t("addProduct")}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-surface-500">{t("totalProducts")}</p>
            </div>
            <p className="text-2xl font-bold text-surface-900 mt-1">524</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-success-600" />
              <p className="text-sm text-surface-500">{t("activeSuppliers2")}</p>
            </div>
            <p className="text-2xl font-bold text-surface-900 mt-1">128</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-warning-500" />
              <p className="text-sm text-surface-500">{t("avgRating")}</p>
            </div>
            <p className="text-2xl font-bold text-surface-900 mt-1">4.6</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-info-600" />
              <p className="text-sm text-surface-500">{t("todayOrders")}</p>
            </div>
            <p className="text-2xl font-bold text-surface-900 mt-1">32</p>
          </Card>
        </div>

        <SearchFilter
          placeholder={t("search")}
          categories={CATEGORIES}
        />

        {/* Products Grid */}
        <div className={`mt-6 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}`}>
          {mockProducts.map((product) => (
            <Card key={product.id} hover className={viewMode === "grid" ? "" : "p-4"}>
              {viewMode === "grid" ? (
                <>
                  <div className="h-48 bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center relative">
                    <Package className="w-16 h-16 text-surface-300" />
                    {!product.inStock && (
                      <div className="absolute top-3 right-3 bg-danger-500 text-white text-xs px-2 py-1 rounded-full">
                        {t("outOfStock")}
                      </div>
                    )}
                    <button
                      className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center ${
                        product.isFavorited
                          ? "bg-danger-50 text-danger-500"
                          : "bg-white/80 text-surface-400 hover:text-danger-500"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          product.isFavorited ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-surface-500">
                        <Star className="w-3 h-3 fill-warning-400 text-warning-400" />
                        {product.user.rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-surface-900 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-surface-600 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl font-bold text-amber-600">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-sm text-surface-500 mr-1">
                          {t("currency")}/{product.unit}
                        </span>
                      </div>
                      <span className="text-xs text-surface-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {product.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-surface-500">
                        {t("minOrder")}: {product.minQuantity} {product.unit}
                      </span>
                      <Link
                        href={`/marketplace/${product.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600"
                      >
                        <Eye className="w-3 h-3" />
                        {t("viewDetails")}
                      </Link>
                    </div>
                    <div className="border-t mt-3 pt-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-surface-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {product.user.name[0]}
                      </div>
                      <span className="text-xs text-surface-600">
                        {product.user.name}
                      </span>
                      <span className="text-xs text-surface-400">
                        ({product.user.reviews} {t("reviews")})
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-surface-300" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-surface-900">{product.name}</h3>
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-sm text-surface-600 line-clamp-1">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="font-bold text-amber-600">
                        {formatCurrency(product.price)} {t("currency")}/{product.unit}
                      </span>
                      <span className="text-surface-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {product.location}
                      </span>
                      <span className="flex items-center gap-1 text-surface-500">
                        <Star className="w-3 h-3 fill-warning-400 text-warning-400" />
                        {product.user.rating}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/marketplace/${product.id}`}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600"
                  >
                    {t("viewDetails")}
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
