import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';

export type OfferingStatusType = 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK' | 'COMING_SOON';
export type OfferingTransition = 'discontinue' | 'restock' | 'activate' | 'markComingSoon';

const OFFERING_TRANSITIONS: TransitionMap = {
  ACTIVE: { discontinue: 'DISCONTINUED', markComingSoon: 'COMING_SOON' },
  DISCONTINUED: { activate: 'ACTIVE' },
  OUT_OF_STOCK: { restock: 'ACTIVE', discontinue: 'DISCONTINUED' },
  COMING_SOON: { activate: 'ACTIVE', discontinue: 'DISCONTINUED' },
};

export class OfferingStateMachine extends BaseStateMachine {
  constructor(status: string = 'ACTIVE') { super(status, OFFERING_TRANSITIONS); }

  transition(transition: string): string {
    try { return super.transition(transition); }
    catch { throw new Error(ProductCatalogErrors.OFFERING_INVALID_TRANSITION); }
  }
}

export function getAllowedOfferingTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(OFFERING_TRANSITIONS, status);
}

export function canTransitionOffering(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(OFFERING_TRANSITIONS, from, action);
}

workflowEngine.register('Offering', OfferingStateMachine, OFFERING_TRANSITIONS);
