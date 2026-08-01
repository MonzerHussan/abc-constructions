import { describe, it, expect } from 'vitest';
import { ProductStateMachine, getAllowedProductTransitions, canTransitionProduct } from '@/modules/product-catalog/workflow/state-machines/ProductStateMachine';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';

describe('ProductStateMachine', () => {
  describe('DRAFT state', () => {
    it('should allow publish and archive', () => {
      const sm = new ProductStateMachine('DRAFT');
      expect(sm.can('publish')).toBe(true);
      expect(sm.can('archive')).toBe(true);
    });

    it('should not allow draft', () => {
      const sm = new ProductStateMachine('DRAFT');
      expect(sm.can('draft')).toBe(false);
    });

    it('should transition to PUBLISHED on publish', () => {
      const sm = new ProductStateMachine('DRAFT');
      expect(sm.transition('publish')).toBe('PUBLISHED');
    });

    it('should transition to ARCHIVED on archive', () => {
      const sm = new ProductStateMachine('DRAFT');
      expect(sm.transition('archive')).toBe('ARCHIVED');
    });
  });

  describe('PUBLISHED state', () => {
    it('should allow archive and draft', () => {
      const sm = new ProductStateMachine('PUBLISHED');
      expect(sm.can('archive')).toBe(true);
      expect(sm.can('draft')).toBe(true);
    });

    it('should not allow publish', () => {
      const sm = new ProductStateMachine('PUBLISHED');
      expect(sm.can('publish')).toBe(false);
    });
  });

  describe('ARCHIVED state', () => {
    it('should allow draft only', () => {
      const sm = new ProductStateMachine('ARCHIVED');
      expect(sm.can('draft')).toBe(true);
      expect(sm.can('publish')).toBe(false);
      expect(sm.can('archive')).toBe(false);
    });
  });

  describe('invalid transitions', () => {
    it('should throw PRODUCT_INVALID_TRANSITION', () => {
      const sm = new ProductStateMachine('DRAFT');
      expect(() => sm.transition('draft')).toThrow(ProductCatalogErrors.PRODUCT_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions', () => {
      expect(getAllowedProductTransitions('DRAFT')).toEqual(['publish', 'archive']);
      expect(getAllowedProductTransitions('PUBLISHED')).toEqual(['archive', 'draft']);
      expect(getAllowedProductTransitions('ARCHIVED')).toEqual(['draft']);
    });

    it('should check transition validity', () => {
      expect(canTransitionProduct('DRAFT', 'publish')).toBe(true);
      expect(canTransitionProduct('DRAFT', 'draft')).toBe(false);
      expect(canTransitionProduct('PUBLISHED', 'archive')).toBe(true);
    });
  });
});
