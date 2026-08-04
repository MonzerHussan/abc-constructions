export interface MarketplaceSupplier {
  id: string;
  companyName: string;
  companyNameAr?: string;
  verificationLevel: string;
  verificationStatus: string;
  avgRating: number;
  totalRatings: number;
  country?: string;
  city?: string;
  onTimeDeliveryRate?: number;
  performanceScore?: number;
}

export interface MarketplaceStockItem {
  availableQty: number;
  reservedQty: number;
  warehouse: {
    id: string;
    name: string;
    city?: string;
  } | null;
}

export interface MarketplaceOffering {
  id: string;
  productId: string;
  supplierId: string;
  supplierSku?: string;
  price: number;
  currency: string;
  minOrderQty: number;
  maxOrderQty?: number;
  leadTimeDays?: number;
  availability: string;
  isAuthorized: boolean;
  supplier: MarketplaceSupplier;
  stock: MarketplaceStockItem[];
}

export interface MarketplaceProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface MarketplaceProduct {
  id: string;
  sku: string;
  name: string;
  nameAr?: string;
  nameUr?: string;
  description?: string;
  descriptionAr?: string;
  descriptionUr?: string;
  status: string;
  isActive: boolean;
  brand?: { id: string; name: string; nameAr?: string } | null;
  category?: { id: string; name: string; nameAr?: string } | null;
  subcategory?: { id: string; name: string; nameAr?: string } | null;
  unit?: { id: string; name: string; nameAr?: string; symbol: string } | null;
  images: MarketplaceProductImage[];
  offerings: MarketplaceOffering[];
  reviews: unknown[];
  _count?: { reviews: number };
}

export interface MarketplaceProductDetail extends MarketplaceProduct {
  manufacturer: { id: string; name: string } | null;
  variants: {
    id: string;
    name: string;
    sku: string;
    price?: number;
    attributes?: Record<string, unknown>;
    isActive: boolean;
  }[];
  specifications: {
    id: string;
    name: string;
    nameAr?: string;
    value: string;
    valueAr?: string;
  }[];
  dataSheets: { id: string; title: string; fileUrl: string; language: string }[];
  safetySheets: { id: string; title: string; fileUrl: string; language: string }[];
  inStock: boolean;
  totalAvailableQty: number;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  icon?: string;
  subcategories?: {
    id: string;
    name: string;
    nameAr?: string;
    slug: string;
  }[];
  _count?: { productMasterProducts: number };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
}

export interface ProductSearchFilters {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  verificationLevel?: string;
  minRating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CartItem {
  offeringId: string;
  productId: string;
  productName: string;
  productNameAr?: string;
  supplierId: string;
  supplierName: string;
  price: number;
  currency: string;
  unit: string;
  quantity: number;
  minOrderQty: number;
  imageUrl?: string;
}
