import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';

export type VerificationStatus = 'UNVERIFIED' | 'BASIC' | 'VERIFIED' | 'TRUSTED' | 'FLAGSHIP';
export type VerificationTransition = 'submitBasic' | 'verify' | 'elevateTrusted' | 'elevateFlagship' | 'downgrade' | 'suspend';

const VERIFICATION_TRANSITIONS: TransitionMap = {
  UNVERIFIED: { submitBasic: 'BASIC' },
  BASIC: { verify: 'VERIFIED', downgrade: 'UNVERIFIED' },
  VERIFIED: { elevateTrusted: 'TRUSTED', downgrade: 'BASIC', suspend: 'UNVERIFIED' },
  TRUSTED: { elevateFlagship: 'FLAGSHIP', downgrade: 'VERIFIED', suspend: 'UNVERIFIED' },
  FLAGSHIP: { downgrade: 'TRUSTED', suspend: 'UNVERIFIED' },
};

export class SupplierVerificationStateMachine extends BaseStateMachine {
  constructor(status: string = 'UNVERIFIED') { super(status, VERIFICATION_TRANSITIONS); }

  transition(transition: string): string {
    try { return super.transition(transition); }
    catch { throw new Error(SupplierNetworkErrors.SUPPLIER_PROFILE_INVALID_TRANSITION); }
  }
}

export function getAllowedVerificationTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(VERIFICATION_TRANSITIONS, status);
}

export function canTransitionVerification(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(VERIFICATION_TRANSITIONS, from, action);
}

workflowEngine.register('SupplierVerification', SupplierVerificationStateMachine, VERIFICATION_TRANSITIONS);
