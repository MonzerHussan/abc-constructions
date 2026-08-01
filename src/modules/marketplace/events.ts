import { buildEventName } from '@/modules/shared/events/types';

export const MarketplaceEvents = {
  ProductSearch: buildEventName('Marketplace', 'Product', 'Search'),
  CompareExecuted: buildEventName('Marketplace', 'Compare', 'Executed'),
  ReviewSubmitted: buildEventName('Marketplace', 'Review', 'Submitted'),
  ReviewUpdated: buildEventName('Marketplace', 'Review', 'Updated'),
  ReviewDeleted: buildEventName('Marketplace', 'Review', 'Deleted'),
  FavoriteProductAdded: buildEventName('Marketplace', 'Favorite', 'ProductAdded'),
  FavoriteProductRemoved: buildEventName('Marketplace', 'Favorite', 'ProductRemoved'),
  FavoriteSupplierAdded: buildEventName('Marketplace', 'Favorite', 'SupplierAdded'),
  FavoriteSupplierRemoved: buildEventName('Marketplace', 'Favorite', 'SupplierRemoved'),
  RFQInitiated: buildEventName('Marketplace', 'RFQ', 'Initiated'),
  SupplierMatch: buildEventName('Marketplace', 'Supplier', 'Match'),
} as const;
