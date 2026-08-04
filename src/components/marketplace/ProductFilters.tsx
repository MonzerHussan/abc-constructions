"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input, Select, Button, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/LanguageContext";
import type { ProductSearchFilters } from "@/lib/marketplace";
import type { MarketplaceCategory } from "@/lib/marketplace";

interface ProductFiltersProps {
  filters: ProductSearchFilters;
  categories: MarketplaceCategory[];
  onChange: (filters: ProductSearchFilters) => void;
  totalResults?: number;
}

export default function ProductFilters({
  filters,
  categories,
  onChange,
  totalResults,
}: ProductFiltersProps) {
  const { t, language } = useLanguage();

  const update = (patch: Partial<ProductSearchFilters>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  const activeFiltersCount = [
    filters.categoryId,
    filters.subcategoryId,
    filters.inStockOnly,
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
    filters.minRating !== undefined,
    filters.verificationLevel,
  ].filter(Boolean).length;

  const reset = () => {
    onChange({
      search: "",
      categoryId: undefined,
      subcategoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStockOnly: false,
      minRating: undefined,
      verificationLevel: undefined,
      sortBy: "relevance",
      sortOrder: "asc",
      page: 1,
    });
  };

  const selectedCategory = categories.find((c) => c.id === filters.categoryId);

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <Input
            placeholder={t("searchProductsPlaceholder")}
            value={filters.search || ""}
            onChange={(e) => update({ search: e.target.value })}
            className="ps-9"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Select
            value={filters.categoryId || ""}
            onChange={(e) => update({ categoryId: e.target.value || undefined, subcategoryId: undefined })}
            className="w-44"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {language === "ar" && cat.nameAr ? cat.nameAr : cat.name}
              </option>
            ))}
          </Select>
          {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
            <Select
              value={filters.subcategoryId || ""}
              onChange={(e) => update({ subcategoryId: e.target.value || undefined })}
              className="w-44"
            >
              <option value="">{t("allSubcategories")}</option>
              {selectedCategory.subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {language === "ar" && sub.nameAr ? sub.nameAr : sub.name}
                </option>
              ))}
            </Select>
          )}
          <Select
            value={`${filters.sortBy || "relevance"}-${filters.sortOrder || "asc"}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-") as [string, "asc" | "desc"];
              update({ sortBy, sortOrder });
            }}
            className="w-48"
          >
            <option value="relevance-asc">{t("sortRelevance")}</option>
            <option value="price-asc">{t("sortPriceAsc")}</option>
            <option value="price-desc">{t("sortPriceDesc")}</option>
            <option value="rating-desc">{t("sortRating")}</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-surface-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.inStockOnly}
            onChange={(e) => update({ inStockOnly: e.target.checked })}
            className="rounded border-surface-300 text-brand-500 focus:ring-brand-500"
          />
          {t("inStockOnly")}
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-surface-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.minRating}
            onChange={(e) => update({ minRating: e.target.checked ? 4 : undefined })}
            className="rounded border-surface-300 text-brand-500 focus:ring-brand-500"
          />
          {t("topRatedOnly")}
        </label>
        <div className="flex items-center gap-2 ms-auto">
          <span className="text-sm text-surface-500">
            {totalResults !== undefined ? `${formatNumber(totalResults)} ${t("results")}` : ""}
          </span>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <X className="w-4 h-4" />
              {t("resetFilters")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
