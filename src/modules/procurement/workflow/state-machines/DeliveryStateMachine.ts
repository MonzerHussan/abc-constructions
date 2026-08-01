import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export type DeliveryStatus = 'SCHEDULED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
export type DeliveryTransition = 'dispatch' | 'markInTransit' | 'arrive' | 'receive' | 'complete' | 'cancel';

const DELIVERY_TRANSITIONS: TransitionMap = {
  SCHEDULED: { dispatch: 'DISPATCHED', cancel: 'CANCELLED' },
  DISPATCHED: { markInTransit: 'IN_TRANSIT', cancel: 'CANCELLED' },
  IN_TRANSIT: { arrive: 'ARRIVED', cancel: 'CANCELLED' },
  ARRIVED: { receive: 'PARTIALLY_RECEIVED', complete: 'COMPLETED' },
  PARTIALLY_RECEIVED: { receive: 'PARTIALLY_RECEIVED', complete: 'COMPLETED' },
  COMPLETED: {},
  CANCELLED: {},
};

export class DeliveryStateMachine extends BaseStateMachine {
  constructor(status: string = 'SCHEDULED') {
    super(status, DELIVERY_TRANSITIONS);
  }

  transition(transition: string): string {
    try {
      return super.transition(transition);
    } catch {
      throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_INVALID_TRANSITION);
    }
  }
}

export function getAllowedDeliveryTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(DELIVERY_TRANSITIONS, status);
}

export function canTransitionDelivery(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(DELIVERY_TRANSITIONS, from, action);
}

workflowEngine.register('Delivery', DeliveryStateMachine, DELIVERY_TRANSITIONS);
