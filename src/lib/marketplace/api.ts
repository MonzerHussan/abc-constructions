import type {
  MarketplaceProduct,
  MarketplaceProductImage,
  MarketplaceProductDetail,
  MarketplaceCategory,
  PaginatedResponse,
  ProductSearchFilters,
} from "./types";

function toQuery(filters: ProductSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.subcategoryId) params.set("subcategoryId", filters.subcategoryId);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.inStockOnly) params.set("inStockOnly", "true");
  if (filters.verificationLevel) params.set("verificationLevel", filters.verificationLevel);
  if (filters.minRating !== undefined) params.set("minRating", String(filters.minRating));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  return params.toString();
}

async function handleResponse<T>(res: Response): Promise<PaginatedResponse<T>> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function searchProducts(
  filters: ProductSearchFilters = {}
): Promise<PaginatedResponse<MarketplaceProduct[]>> {
  const query = toQuery(filters);
  const res = await fetch(`/api/v1/marketplace/products?${query}`, {
    cache: "no-store",
  });
  return handleResponse<MarketplaceProduct[]>(res);
}

export async function getProductDetails(
  id: string
): Promise<PaginatedResponse<MarketplaceProductDetail>> {
  const res = await fetch(`/api/v1/marketplace/products/${id}`, {
    cache: "no-store",
  });
  return handleResponse<MarketplaceProductDetail>(res);
}

export async function getMarketplaceCategories(): Promise<PaginatedResponse<MarketplaceCategory[]>> {
  const res = await fetch("/api/v1/marketplace/categories?includeCounts=true", {
    cache: "no-store",
  });
  return handleResponse<MarketplaceCategory[]>(res);
}

export function getPrimaryImage(product?: { images?: MarketplaceProductImage[] }): string | undefined {
  return product?.images?.find((img) => img.isPrimary)?.url || product?.images?.[0]?.url;
}

export function getBestPrice(product?: { offerings?: { price: number; currency: string }[] }): { price: number; currency: string } | null {
  if (!product?.offerings?.length) return null;
  const sorted = [...product.offerings].sort((a, b) => a.price - b.price);
  return { price: sorted[0].price, currency: sorted[0].currency };
}

export function getTotalAvailableStock(product?: { offerings?: { stock?: { availableQty: number }[] }[] }): number {
  return (
    product?.offerings?.reduce(
      (sum, o) => sum + (o.stock?.reduce((s, st) => s + (st.availableQty ?? 0), 0) ?? 0),
      0
    ) ?? 0
  );
}
