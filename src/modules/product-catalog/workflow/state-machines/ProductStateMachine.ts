import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';

export type ProductStatusType = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ProductTransition = 'publish' | 'archive' | 'draft';

const PRODUCT_TRANSITIONS: TransitionMap = {
  DRAFT: { publish: 'PUBLISHED', archive: 'ARCHIVED' },
  PUBLISHED: { archive: 'ARCHIVED', draft: 'DRAFT' },
  ARCHIVED: { draft: 'DRAFT' },
};

export class ProductStateMachine extends BaseStateMachine {
  constructor(status: string = 'DRAFT') { super(status, PRODUCT_TRANSITIONS); }

  transition(transition: string): string {
    try { return super.transition(transition); }
    catch { throw new Error(ProductCatalogErrors.PRODUCT_INVALID_TRANSITION); }
  }
}

export function getAllowedProductTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(PRODUCT_TRANSITIONS, status);
}

export function canTransitionProduct(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(PRODUCT_TRANSITIONS, from, action);
}

workflowEngine.register('Product', ProductStateMachine, PRODUCT_TRANSITIONS);
