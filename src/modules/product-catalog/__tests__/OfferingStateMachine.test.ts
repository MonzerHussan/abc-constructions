import { describe, it, expect } from 'vitest';
import { OfferingStateMachine, getAllowedOfferingTransitions, canTransitionOffering } from '@/modules/product-catalog/workflow/state-machines/OfferingStateMachine';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';

describe('OfferingStateMachine', () => {
  describe('ACTIVE state', () => {
    it('should allow discontinue and markComingSoon', () => {
      const sm = new OfferingStateMachine('ACTIVE');
      expect(sm.can('discontinue')).toBe(true);
      expect(sm.can('markComingSoon')).toBe(true);
    });

    it('should not allow restock or activate', () => {
      const sm = new OfferingStateMachine('ACTIVE');
      expect(sm.can('restock')).toBe(false);
      expect(sm.can('activate')).toBe(false);
    });
  });

  describe('DISCONTINUED state', () => {
    it('should allow activate only', () => {
      const sm = new OfferingStateMachine('DISCONTINUED');
      expect(sm.can('activate')).toBe(true);
      expect(sm.can('discontinue')).toBe(false);
      expect(sm.can('restock')).toBe(false);
    });
  });

  describe('OUT_OF_STOCK state', () => {
    it('should allow restock and discontinue', () => {
      const sm = new OfferingStateMachine('OUT_OF_STOCK');
      expect(sm.can('restock')).toBe(true);
      expect(sm.can('discontinue')).toBe(true);
    });
  });

  describe('COMING_SOON state', () => {
    it('should allow activate and discontinue', () => {
      const sm = new OfferingStateMachine('COMING_SOON');
      expect(sm.can('activate')).toBe(true);
      expect(sm.can('discontinue')).toBe(true);
    });
  });

  describe('invalid transitions', () => {
    it('should throw OFFERING_INVALID_TRANSITION', () => {
      const sm = new OfferingStateMachine('ACTIVE');
      expect(() => sm.transition('restock')).toThrow(ProductCatalogErrors.OFFERING_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions', () => {
      expect(getAllowedOfferingTransitions('ACTIVE')).toEqual(['discontinue', 'markComingSoon']);
      expect(getAllowedOfferingTransitions('DISCONTINUED')).toEqual(['activate']);
      expect(getAllowedOfferingTransitions('OUT_OF_STOCK')).toEqual(['restock', 'discontinue']);
      expect(getAllowedOfferingTransitions('COMING_SOON')).toEqual(['activate', 'discontinue']);
    });

    it('should check transition validity', () => {
      expect(canTransitionOffering('ACTIVE', 'discontinue')).toBe(true);
      expect(canTransitionOffering('DISCONTINUED', 'activate')).toBe(true);
      expect(canTransitionOffering('ACTIVE', 'activate')).toBe(false);
    });
  });
});
