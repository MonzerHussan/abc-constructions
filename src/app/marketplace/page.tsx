"use client";

import { useEffect, useState, useCallback } from "react";
import { Package, Store, Star, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/marketplace/ProductCard";
import ProductFilters from "@/components/marketplace/ProductFilters";
import { Button, Skeleton, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/cart";
import {
  searchProducts,
  getMarketplaceCategories,
  type MarketplaceProduct,
  type MarketplaceCategory,
  type ProductSearchFilters,
  type PaginationMeta,
} from "@/lib/marketplace";

export default function MarketplacePage() {
  const { t } = useLanguage();
  const { toggleCart, totalItems } = useCart();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductSearchFilters>({
    page: 1,
    limit: 12,
    sortBy: "relevance",
    sortOrder: "asc",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchProducts(filters);
      if (res.success) {
        setProducts(res.data);
        setPagination(res.pagination || null);
      } else {
        setError(t("errorLoadingProducts"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorLoadingProducts"));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await getMarketplaceCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch {
      // ignore category errors
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <Store className="w-7 h-7 text-brand-500" />
              {t("marketplaceTitle")}
            </h1>
            <p className="text-surface-600 mt-1">{t("marketplaceDescription")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "grid" ? "bg-white shadow text-surface-900" : "text-surface-500"
                }`}
              >
                {t("gridView")}
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "list" ? "bg-white shadow text-surface-900" : "text-surface-500"
                }`}
              >
                {t("listView")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-brand-500" />
              <span className="text-sm text-surface-500">{t("totalProducts")}</span>
            </div>
            <p className="text-2xl font-bold text-surface-900">
              {pagination ? pagination.total.toLocaleString() : "—"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-5 h-5 text-success-600" />
              <span className="text-sm text-surface-500">{t("activeSuppliers2")}</span>
            </div>
            <p className="text-2xl font-bold text-surface-900">{t("comingSoon")}</p>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-warning-500" />
              <span className="text-sm text-surface-500">{t("avgRating")}</span>
            </div>
            <p className="text-2xl font-bold text-surface-900">4.6</p>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-info-600" />
              <span className="text-sm text-surface-500">{t("todayOrders")}</span>
            </div>
            <p className="text-2xl font-bold text-surface-900">{totalItems}</p>
          </div>
        </div>

        <ProductFilters
          filters={filters}
          categories={categories}
          onChange={setFilters}
          totalResults={pagination?.total}
        />

        {error && (
          <div className="mt-6 p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-center gap-3 text-danger-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">{t("errorLoadingProducts")}</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={loadProducts} className="ms-auto">
              {t("retry")}
            </Button>
          </div>
        )}

        <div
          className={`mt-6 ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }`}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} variant={viewMode} />
              ))}
        </div>

        {!loading && products.length === 0 && !error && (
          <div className="mt-12 text-center py-12 bg-white rounded-xl border border-surface-200">
            <Package className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-900">{t("noProductsFound")}</h3>
            <p className="text-surface-500 mt-1">{t("tryAdjustingFilters")}</p>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            >
              {t("previous")}
            </Button>
            <Badge variant="neutral">
              {t("page")} {pagination.page} {t("of")} {pagination.totalPages}
            </Badge>
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              {t("next")}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
