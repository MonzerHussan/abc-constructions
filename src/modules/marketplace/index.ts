export { MarketplaceService } from '@/modules/marketplace/services/MarketplaceService';

export {
  marketplaceSearchQuerySchema, categoryNavigationQuerySchema,
  compareProductsSchema, compareProductsQuerySchema, compareSuppliersQuerySchema,
  addFavoriteProductSchema, addFavoriteSupplierSchema, favoriteListQuerySchema,
  createProductReviewSchema, updateProductReviewSchema,
  createSupplierReviewSchema, updateSupplierReviewSchema, reviewListQuerySchema,
  createRfqFromMarketplaceSchema, supplierMatchQuerySchema,
} from '@/modules/marketplace/validators/marketplace-schemas';
export type {
  MarketplaceSearchQuery, CategoryNavigationQuery, CompareProductsInput,
  AddFavoriteProductInput, AddFavoriteSupplierInput, FavoriteListQuery,
  CreateProductReviewInput, UpdateProductReviewInput, CreateSupplierReviewInput, UpdateSupplierReviewInput,
  ReviewListQuery, CreateRfqFromMarketplaceInput, SupplierMatchQuery,
} from '@/modules/marketplace/validators/marketplace-schemas';

export { MarketplaceEvents } from '@/modules/marketplace/events';

import { MarketplaceService } from '@/modules/marketplace/services/MarketplaceService';
export const marketplaceService = new MarketplaceService();
