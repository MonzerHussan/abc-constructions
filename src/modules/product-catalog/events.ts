import { buildEventName } from '@/modules/shared/events/types';

export const ProductCatalogEvents = {
  ProductCreated: buildEventName('ProductCatalog', 'Product', 'Created'),
  ProductUpdated: buildEventName('ProductCatalog', 'Product', 'Updated'),
  ProductPublished: buildEventName('ProductCatalog', 'Product', 'Published'),
  ProductArchived: buildEventName('ProductCatalog', 'Product', 'Archived'),
  VariantCreated: buildEventName('ProductCatalog', 'Variant', 'Created'),
  VariantUpdated: buildEventName('ProductCatalog', 'Variant', 'Updated'),
  OfferingCreated: buildEventName('ProductCatalog', 'Offering', 'Created'),
  OfferingUpdated: buildEventName('ProductCatalog', 'Offering', 'Updated'),
  OfferingPriceChanged: buildEventName('ProductCatalog', 'Offering', 'PriceChanged'),
  OfferingDiscontinued: buildEventName('ProductCatalog', 'Offering', 'Discontinued'),
  SpecificationAdded: buildEventName('ProductCatalog', 'Specification', 'Added'),
  DataSheetUploaded: buildEventName('ProductCatalog', 'DataSheet', 'Uploaded'),
  SafetySheetUploaded: buildEventName('ProductCatalog', 'SafetySheet', 'Uploaded'),
  ImageUploaded: buildEventName('ProductCatalog', 'Image', 'Uploaded'),
} as const;
