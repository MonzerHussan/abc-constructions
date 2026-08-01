import { describe, it, expect } from 'vitest';
import { DeliveryStateMachine, getAllowedDeliveryTransitions, canTransitionDelivery } from '@/modules/procurement/workflow/state-machines/DeliveryStateMachine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

describe('DeliveryStateMachine', () => {
  describe('SCHEDULED state', () => {
    it('should allow dispatch and cancel', () => {
      const sm = new DeliveryStateMachine('SCHEDULED');
      expect(sm.can('dispatch')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to DISPATCHED on dispatch', () => {
      const sm = new DeliveryStateMachine('SCHEDULED');
      expect(sm.transition('dispatch')).toBe('DISPATCHED');
      expect(sm.status).toBe('DISPATCHED');
    });

    it('should transition to CANCELLED on cancel', () => {
      const sm = new DeliveryStateMachine('SCHEDULED');
      expect(sm.transition('cancel')).toBe('CANCELLED');
    });

    it('should not allow markInTransit, arrive, receive, or complete', () => {
      const sm = new DeliveryStateMachine('SCHEDULED');
      expect(sm.can('markInTransit')).toBe(false);
      expect(sm.can('arrive')).toBe(false);
      expect(sm.can('receive')).toBe(false);
      expect(sm.can('complete')).toBe(false);
    });
  });

  describe('DISPATCHED state', () => {
    it('should allow markInTransit and cancel', () => {
      const sm = new DeliveryStateMachine('DISPATCHED');
      expect(sm.can('markInTransit')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to IN_TRANSIT on markInTransit', () => {
      const sm = new DeliveryStateMachine('DISPATCHED');
      expect(sm.transition('markInTransit')).toBe('IN_TRANSIT');
    });

    it('should not allow dispatch, arrive, receive, or complete', () => {
      const sm = new DeliveryStateMachine('DISPATCHED');
      expect(sm.can('dispatch')).toBe(false);
      expect(sm.can('arrive')).toBe(false);
      expect(sm.can('receive')).toBe(false);
      expect(sm.can('complete')).toBe(false);
    });
  });

  describe('IN_TRANSIT state', () => {
    it('should allow arrive and cancel', () => {
      const sm = new DeliveryStateMachine('IN_TRANSIT');
      expect(sm.can('arrive')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to ARRIVED on arrive', () => {
      const sm = new DeliveryStateMachine('IN_TRANSIT');
      expect(sm.transition('arrive')).toBe('ARRIVED');
    });

    it('should not allow dispatch, markInTransit, receive, or complete', () => {
      const sm = new DeliveryStateMachine('IN_TRANSIT');
      expect(sm.can('dispatch')).toBe(false);
      expect(sm.can('markInTransit')).toBe(false);
      expect(sm.can('receive')).toBe(false);
      expect(sm.can('complete')).toBe(false);
    });
  });

  describe('ARRIVED state', () => {
    it('should allow receive and complete', () => {
      const sm = new DeliveryStateMachine('ARRIVED');
      expect(sm.can('receive')).toBe(true);
      expect(sm.can('complete')).toBe(true);
    });

    it('should transition to PARTIALLY_RECEIVED on receive', () => {
      const sm = new DeliveryStateMachine('ARRIVED');
      expect(sm.transition('receive')).toBe('PARTIALLY_RECEIVED');
    });

    it('should transition to COMPLETED on complete', () => {
      const sm = new DeliveryStateMachine('ARRIVED');
      expect(sm.transition('complete')).toBe('COMPLETED');
    });

    it('should not allow dispatch, markInTransit, arrive, or cancel', () => {
      const sm = new DeliveryStateMachine('ARRIVED');
      expect(sm.can('dispatch')).toBe(false);
      expect(sm.can('markInTransit')).toBe(false);
      expect(sm.can('arrive')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('PARTIALLY_RECEIVED state', () => {
    it('should allow receive and complete', () => {
      const sm = new DeliveryStateMachine('PARTIALLY_RECEIVED');
      expect(sm.can('receive')).toBe(true);
      expect(sm.can('complete')).toBe(true);
    });

    it('should transition to COMPLETED on complete', () => {
      const sm = new DeliveryStateMachine('PARTIALLY_RECEIVED');
      expect(sm.transition('complete')).toBe('COMPLETED');
    });

    it('should not allow dispatch, markInTransit, arrive, or cancel', () => {
      const sm = new DeliveryStateMachine('PARTIALLY_RECEIVED');
      expect(sm.can('dispatch')).toBe(false);
      expect(sm.can('markInTransit')).toBe(false);
      expect(sm.can('arrive')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('COMPLETED state', () => {
    it('should not allow any transition', () => {
      const sm = new DeliveryStateMachine('COMPLETED');
      expect(sm.can('dispatch')).toBe(false);
      expect(sm.can('markInTransit')).toBe(false);
      expect(sm.can('arrive')).toBe(false);
      expect(sm.can('receive')).toBe(false);
      expect(sm.can('complete')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('CANCELLED state', () => {
    it('should not allow any transition', () => {
      const sm = new DeliveryStateMachine('CANCELLED');
      expect(sm.can('dispatch')).toBe(false);
      expect(sm.can('markInTransit')).toBe(false);
      expect(sm.can('arrive')).toBe(false);
      expect(sm.can('receive')).toBe(false);
      expect(sm.can('complete')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('invalid transitions', () => {
    it('should throw INVALID_TRANSITION on invalid transition', () => {
      const sm = new DeliveryStateMachine('SCHEDULED');
      expect(() => sm.transition('complete')).toThrow(ErrorCodes.PROCUREMENT_DELIVERY_INVALID_TRANSITION);
    });

    it('should throw INVALID_TRANSITION for terminal state transition', () => {
      const sm = new DeliveryStateMachine('COMPLETED');
      expect(() => sm.transition('dispatch')).toThrow(ErrorCodes.PROCUREMENT_DELIVERY_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for SCHEDULED', () => {
      expect(getAllowedDeliveryTransitions('SCHEDULED')).toEqual(['dispatch', 'cancel']);
    });

    it('should list allowed transitions for DISPATCHED', () => {
      expect(getAllowedDeliveryTransitions('DISPATCHED')).toEqual(['markInTransit', 'cancel']);
    });

    it('should list allowed transitions for IN_TRANSIT', () => {
      expect(getAllowedDeliveryTransitions('IN_TRANSIT')).toEqual(['arrive', 'cancel']);
    });

    it('should list allowed transitions for ARRIVED', () => {
      expect(getAllowedDeliveryTransitions('ARRIVED')).toEqual(['receive', 'complete']);
    });

    it('should list allowed transitions for PARTIALLY_RECEIVED', () => {
      expect(getAllowedDeliveryTransitions('PARTIALLY_RECEIVED')).toEqual(['receive', 'complete']);
    });

    it('should return empty array for COMPLETED', () => {
      expect(getAllowedDeliveryTransitions('COMPLETED')).toEqual([]);
    });

    it('should return empty array for CANCELLED', () => {
      expect(getAllowedDeliveryTransitions('CANCELLED')).toEqual([]);
    });

    it('should check if transition is valid with static method', () => {
      expect(canTransitionDelivery('SCHEDULED', 'dispatch')).toBe(true);
      expect(canTransitionDelivery('SCHEDULED', 'complete')).toBe(false);
      expect(canTransitionDelivery('DISPATCHED', 'markInTransit')).toBe(true);
      expect(canTransitionDelivery('IN_TRANSIT', 'arrive')).toBe(true);
      expect(canTransitionDelivery('ARRIVED', 'receive')).toBe(true);
      expect(canTransitionDelivery('ARRIVED', 'complete')).toBe(true);
    });
  });
});
