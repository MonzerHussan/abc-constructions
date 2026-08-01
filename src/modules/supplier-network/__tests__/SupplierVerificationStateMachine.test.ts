import { describe, it, expect } from 'vitest';
import { SupplierVerificationStateMachine, getAllowedVerificationTransitions, canTransitionVerification } from '@/modules/supplier-network/workflow/state-machines/SupplierVerificationStateMachine';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';

describe('SupplierVerificationStateMachine', () => {
  describe('UNVERIFIED state', () => {
    it('should allow submitBasic only', () => {
      const sm = new SupplierVerificationStateMachine('UNVERIFIED');
      expect(sm.can('submitBasic')).toBe(true);
      expect(sm.can('verify')).toBe(false);
      expect(sm.can('elevateTrusted')).toBe(false);
      expect(sm.can('elevateFlagship')).toBe(false);
      expect(sm.can('downgrade')).toBe(false);
      expect(sm.can('suspend')).toBe(false);
    });

    it('should transition to BASIC on submitBasic', () => {
      const sm = new SupplierVerificationStateMachine('UNVERIFIED');
      expect(sm.transition('submitBasic')).toBe('BASIC');
    });
  });

  describe('BASIC state', () => {
    it('should allow verify and downgrade', () => {
      const sm = new SupplierVerificationStateMachine('BASIC');
      expect(sm.can('verify')).toBe(true);
      expect(sm.can('downgrade')).toBe(true);
    });

    it('should not allow submitBasic, elevateTrusted, elevateFlagship, or suspend', () => {
      const sm = new SupplierVerificationStateMachine('BASIC');
      expect(sm.can('submitBasic')).toBe(false);
      expect(sm.can('elevateTrusted')).toBe(false);
      expect(sm.can('elevateFlagship')).toBe(false);
      expect(sm.can('suspend')).toBe(false);
    });

    it('should transition to VERIFIED on verify', () => {
      const sm = new SupplierVerificationStateMachine('BASIC');
      expect(sm.transition('verify')).toBe('VERIFIED');
    });

    it('should transition to UNVERIFIED on downgrade', () => {
      const sm = new SupplierVerificationStateMachine('BASIC');
      expect(sm.transition('downgrade')).toBe('UNVERIFIED');
    });
  });

  describe('VERIFIED state', () => {
    it('should allow elevateTrusted, downgrade, and suspend', () => {
      const sm = new SupplierVerificationStateMachine('VERIFIED');
      expect(sm.can('elevateTrusted')).toBe(true);
      expect(sm.can('downgrade')).toBe(true);
      expect(sm.can('suspend')).toBe(true);
    });

    it('should transition to TRUSTED on elevateTrusted', () => {
      const sm = new SupplierVerificationStateMachine('VERIFIED');
      expect(sm.transition('elevateTrusted')).toBe('TRUSTED');
    });

    it('should transition to BASIC on downgrade', () => {
      const sm = new SupplierVerificationStateMachine('VERIFIED');
      expect(sm.transition('downgrade')).toBe('BASIC');
    });

    it('should transition to UNVERIFIED on suspend', () => {
      const sm = new SupplierVerificationStateMachine('VERIFIED');
      expect(sm.transition('suspend')).toBe('UNVERIFIED');
    });
  });

  describe('TRUSTED state', () => {
    it('should allow elevateFlagship, downgrade, and suspend', () => {
      const sm = new SupplierVerificationStateMachine('TRUSTED');
      expect(sm.can('elevateFlagship')).toBe(true);
      expect(sm.can('downgrade')).toBe(true);
      expect(sm.can('suspend')).toBe(true);
    });

    it('should transition to FLAGSHIP on elevateFlagship', () => {
      const sm = new SupplierVerificationStateMachine('TRUSTED');
      expect(sm.transition('elevateFlagship')).toBe('FLAGSHIP');
    });

    it('should transition to VERIFIED on downgrade', () => {
      const sm = new SupplierVerificationStateMachine('TRUSTED');
      expect(sm.transition('downgrade')).toBe('VERIFIED');
    });
  });

  describe('FLAGSHIP state', () => {
    it('should allow downgrade and suspend', () => {
      const sm = new SupplierVerificationStateMachine('FLAGSHIP');
      expect(sm.can('downgrade')).toBe(true);
      expect(sm.can('suspend')).toBe(true);
    });

    it('should transition to TRUSTED on downgrade', () => {
      const sm = new SupplierVerificationStateMachine('FLAGSHIP');
      expect(sm.transition('downgrade')).toBe('TRUSTED');
    });

    it('should transition to UNVERIFIED on suspend', () => {
      const sm = new SupplierVerificationStateMachine('FLAGSHIP');
      expect(sm.transition('suspend')).toBe('UNVERIFIED');
    });
  });

  describe('invalid transitions', () => {
    it('should throw SUPPLIER_PROFILE_INVALID_TRANSITION', () => {
      const sm = new SupplierVerificationStateMachine('UNVERIFIED');
      expect(() => sm.transition('verify')).toThrow(SupplierNetworkErrors.SUPPLIER_PROFILE_INVALID_TRANSITION);
    });

    it('should throw on invalid initial state transition', () => {
      const sm = new SupplierVerificationStateMachine('BASIC');
      expect(() => sm.transition('submitBasic')).toThrow(SupplierNetworkErrors.SUPPLIER_PROFILE_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for UNVERIFIED', () => {
      expect(getAllowedVerificationTransitions('UNVERIFIED')).toEqual(['submitBasic']);
    });

    it('should list allowed transitions for VERIFIED', () => {
      expect(getAllowedVerificationTransitions('VERIFIED')).toEqual(['elevateTrusted', 'downgrade', 'suspend']);
    });

    it('should return empty for unknown state', () => {
      expect(getAllowedVerificationTransitions('UNKNOWN')).toEqual([]);
    });

    it('should check transition validity', () => {
      expect(canTransitionVerification('UNVERIFIED', 'submitBasic')).toBe(true);
      expect(canTransitionVerification('UNVERIFIED', 'verify')).toBe(false);
      expect(canTransitionVerification('VERIFIED', 'elevateTrusted')).toBe(true);
      expect(canTransitionVerification('FLAGSHIP', 'downgrade')).toBe(true);
    });
  });
});
