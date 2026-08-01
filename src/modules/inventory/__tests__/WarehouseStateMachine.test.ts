import { describe, it, expect } from 'vitest';
import { WarehouseStateMachine, getAllowedWarehouseTransitions, canTransitionWarehouse } from '@/modules/inventory/workflow/state-machines/WarehouseStateMachine';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';

describe('WarehouseStateMachine', () => {
  describe('ACTIVE state', () => {
    it('should allow deactivate, maintenance, and close', () => {
      const sm = new WarehouseStateMachine('ACTIVE');
      expect(sm.can('deactivate')).toBe(true);
      expect(sm.can('maintenance')).toBe(true);
      expect(sm.can('close')).toBe(true);
    });

    it('should not allow activate or reopen', () => {
      const sm = new WarehouseStateMachine('ACTIVE');
      expect(sm.can('activate')).toBe(false);
      expect(sm.can('reopen')).toBe(false);
    });

    it('should transition to INACTIVE on deactivate', () => {
      const sm = new WarehouseStateMachine('ACTIVE');
      expect(sm.transition('deactivate')).toBe('INACTIVE');
    });

    it('should transition to MAINTENANCE on maintenance', () => {
      const sm = new WarehouseStateMachine('ACTIVE');
      expect(sm.transition('maintenance')).toBe('MAINTENANCE');
    });

    it('should transition to CLOSED on close', () => {
      const sm = new WarehouseStateMachine('ACTIVE');
      expect(sm.transition('close')).toBe('CLOSED');
    });
  });

  describe('INACTIVE state', () => {
    it('should allow activate and close', () => {
      const sm = new WarehouseStateMachine('INACTIVE');
      expect(sm.can('activate')).toBe(true);
      expect(sm.can('close')).toBe(true);
    });

    it('should not allow maintenance or reopen', () => {
      const sm = new WarehouseStateMachine('INACTIVE');
      expect(sm.can('maintenance')).toBe(false);
      expect(sm.can('reopen')).toBe(false);
    });

    it('should transition to ACTIVE on activate', () => {
      const sm = new WarehouseStateMachine('INACTIVE');
      expect(sm.transition('activate')).toBe('ACTIVE');
    });

    it('should transition to CLOSED on close', () => {
      const sm = new WarehouseStateMachine('INACTIVE');
      expect(sm.transition('close')).toBe('CLOSED');
    });
  });

  describe('MAINTENANCE state', () => {
    it('should allow activate and close', () => {
      const sm = new WarehouseStateMachine('MAINTENANCE');
      expect(sm.can('activate')).toBe(true);
      expect(sm.can('close')).toBe(true);
    });

    it('should transition to ACTIVE on activate', () => {
      const sm = new WarehouseStateMachine('MAINTENANCE');
      expect(sm.transition('activate')).toBe('ACTIVE');
    });
  });

  describe('CLOSED state', () => {
    it('should allow no transitions', () => {
      const sm = new WarehouseStateMachine('CLOSED');
      expect(sm.can('activate')).toBe(false);
      expect(sm.can('deactivate')).toBe(false);
      expect(sm.can('maintenance')).toBe(false);
      expect(sm.can('reopen')).toBe(false);
    });

    it('should throw on any transition', () => {
      const sm = new WarehouseStateMachine('CLOSED');
      expect(() => sm.transition('activate')).toThrow(InventoryErrors.WAREHOUSE_INVALID_TRANSITION);
    });
  });

  describe('invalid transitions', () => {
    it('should throw WAREHOUSE_INVALID_TRANSITION on invalid action', () => {
      const sm = new WarehouseStateMachine('ACTIVE');
      expect(() => sm.transition('activate')).toThrow(InventoryErrors.WAREHOUSE_INVALID_TRANSITION);
    });

    it('should throw on unknown state', () => {
      const sm = new WarehouseStateMachine('UNKNOWN');
      expect(() => sm.transition('activate')).toThrow(InventoryErrors.WAREHOUSE_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for ACTIVE', () => {
      expect(getAllowedWarehouseTransitions('ACTIVE')).toEqual(['deactivate', 'maintenance', 'close']);
    });

    it('should list allowed transitions for INACTIVE', () => {
      expect(getAllowedWarehouseTransitions('INACTIVE')).toEqual(['activate', 'close']);
    });

    it('should list allowed transitions for CLOSED', () => {
      expect(getAllowedWarehouseTransitions('CLOSED')).toEqual([]);
    });

    it('should return empty for unknown state', () => {
      expect(getAllowedWarehouseTransitions('UNKNOWN')).toEqual([]);
    });

    it('should check transition validity', () => {
      expect(canTransitionWarehouse('ACTIVE', 'deactivate')).toBe(true);
      expect(canTransitionWarehouse('ACTIVE', 'activate')).toBe(false);
      expect(canTransitionWarehouse('INACTIVE', 'activate')).toBe(true);
      expect(canTransitionWarehouse('MAINTENANCE', 'close')).toBe(true);
    });
  });
});
