import { CoreErrors } from '@/modules/shared/errors/core.errors';
import { ProcurementErrors } from '@/modules/shared/errors/procurement.errors';
import { TendersErrors } from '@/modules/shared/errors/tenders.errors';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';
import { WorkflowErrors } from '@/modules/shared/errors/workflow.errors';
import { StorageErrors } from '@/modules/shared/errors/storage.errors';
import { AiErrors } from '@/modules/shared/errors/ai.errors';
import { GeneralErrors } from '@/modules/shared/errors/general.errors';
import { QualityErrors } from '@/modules/shared/errors/quality.errors';
import { FinancialErrors } from '@/modules/shared/errors/financial.errors';
import { InvoicingErrors } from '@/modules/shared/errors/invoicing.errors';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { EntityRegistryErrors } from '@/modules/shared/errors/entity-registry.errors';
import { SurveyErrors } from '@/modules/shared/errors/survey.errors';

export { CoreErrors };
export { ProcurementErrors };
export { TendersErrors };
export { MarketplaceErrors };
export { WorkflowErrors };
export { StorageErrors };
export { AiErrors };
export { GeneralErrors };
export { QualityErrors };
export { FinancialErrors };
export { InvoicingErrors };
export { SupplierNetworkErrors };
export { ProductCatalogErrors };
export { EntityRegistryErrors };
export { SurveyErrors };

export const ErrorCodes = {
  ...CoreErrors,
  ...ProcurementErrors,
  ...TendersErrors,
  ...MarketplaceErrors,
  ...WorkflowErrors,
  ...StorageErrors,
  ...AiErrors,
  ...GeneralErrors,
  ...QualityErrors,
  ...FinancialErrors,
  ...InvoicingErrors,
  ...SupplierNetworkErrors,
  ...ProductCatalogErrors,
  ...EntityRegistryErrors,
  ...SurveyErrors,
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
