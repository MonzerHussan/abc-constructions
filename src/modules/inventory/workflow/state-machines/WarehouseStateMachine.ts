import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';

export type WarehouseStatusType = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'CLOSED';
export type WarehouseTransition = 'activate' | 'deactivate' | 'maintenance' | 'close' | 'reopen';

const WAREHOUSE_TRANSITIONS: TransitionMap = {
  ACTIVE: { deactivate: 'INACTIVE', maintenance: 'MAINTENANCE', close: 'CLOSED' },
  INACTIVE: { activate: 'ACTIVE', close: 'CLOSED' },
  MAINTENANCE: { activate: 'ACTIVE', close: 'CLOSED' },
  CLOSED: {},
};

export class WarehouseStateMachine extends BaseStateMachine {
  constructor(status: string = 'ACTIVE') { super(status, WAREHOUSE_TRANSITIONS); }

  transition(transition: string): string {
    try { return super.transition(transition); }
    catch { throw new Error(InventoryErrors.WAREHOUSE_INVALID_TRANSITION); }
  }
}

export function getAllowedWarehouseTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(WAREHOUSE_TRANSITIONS, status);
}

export function canTransitionWarehouse(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(WAREHOUSE_TRANSITIONS, from, action);
}

workflowEngine.register('Warehouse', WarehouseStateMachine, WAREHOUSE_TRANSITIONS);
