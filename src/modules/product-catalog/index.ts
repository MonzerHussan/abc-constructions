export { ProductCatalogService } from '@/modules/product-catalog/services/ProductCatalogService';

export {
  createProductSchema, updateProductSchema, productListQuerySchema,
  createVariantSchema, updateVariantSchema,
  addSpecificationSchema, updateSpecificationSchema,
  uploadDataSheetSchema, uploadSafetySheetSchema, uploadImageSchema,
  createOfferingSchema, updateOfferingSchema, offeringListQuerySchema,
  createUnitSchema,
} from '@/modules/product-catalog/validators/product-catalog-schemas';
export type {
  CreateProductInput, UpdateProductInput, ProductListQuery,
  CreateVariantInput, UpdateVariantInput,
  AddSpecificationInput, UpdateSpecificationInput,
  UploadDataSheetInput, UploadSafetySheetInput, UploadImageInput,
  CreateOfferingInput, UpdateOfferingInput, OfferingListQuery,
  CreateUnitInput,
} from '@/modules/product-catalog/validators/product-catalog-schemas';

export { ProductCatalogEvents } from '@/modules/product-catalog/events';

export {
  ProductStateMachine,
  getAllowedProductTransitions,
  canTransitionProduct,
} from '@/modules/product-catalog/workflow/state-machines/ProductStateMachine';
export type { ProductStatusType, ProductTransition } from '@/modules/product-catalog/workflow/state-machines/ProductStateMachine';

export {
  OfferingStateMachine,
  getAllowedOfferingTransitions,
  canTransitionOffering,
} from '@/modules/product-catalog/workflow/state-machines/OfferingStateMachine';
export type { OfferingStatusType, OfferingTransition } from '@/modules/product-catalog/workflow/state-machines/OfferingStateMachine';

import { ProductCatalogService } from '@/modules/product-catalog/services/ProductCatalogService';
export const productCatalogService = new ProductCatalogService();
