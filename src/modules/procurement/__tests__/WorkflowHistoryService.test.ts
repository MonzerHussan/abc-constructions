import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkflowHistoryService } from '@/modules/procurement/services/WorkflowHistoryService';
import { InMemoryWorkflowHistoryRecorder } from '@/modules/shared/workflow/WorkflowHistoryRecorder';

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('WorkflowHistoryService', () => {
  let service: WorkflowHistoryService;

  beforeEach(() => {
    service = new WorkflowHistoryService(new InMemoryWorkflowHistoryRecorder());
  });

  describe('record', () => {
    it('should record an entry and return it with id and createdAt', async () => {
      const entry = await service.record({
        entityType: 'Award',
        entityId: 'aw1',
        action: 'accept',
        fromStatus: 'PENDING_ACCEPTANCE',
        toStatus: 'ACCEPTED',
        result: 'SUCCESS',
        actorId: 'supplier-1',
        actorRole: 'SUPPLIER',
      });
      expect(entry.id).toBeDefined();
      expect(entry.createdAt).toBeInstanceOf(Date);
      expect(entry.entityType).toBe('Award');
      expect(entry.toStatus).toBe('ACCEPTED');
    });
  });

  describe('listByEntity', () => {
    it('should list history filtered by entity type and id', async () => {
      await service.record({ entityType: 'Award', entityId: 'aw1', action: 'accept', fromStatus: 'PENDING_ACCEPTANCE', toStatus: 'ACCEPTED', result: 'SUCCESS' });
      await service.record({ entityType: 'Award', entityId: 'aw1', action: 'decline', fromStatus: 'PENDING_ACCEPTANCE', toStatus: 'DECLINED', result: 'SUCCESS' });
      await service.record({ entityType: 'PurchaseRequest', entityId: 'pr1', action: 'submit', fromStatus: 'DRAFT', toStatus: 'PENDING_APPROVAL', result: 'SUCCESS' });

      const awardHistory = await service.listByEntity('Award', 'aw1');
      expect(awardHistory.length).toBe(2);
      const prHistory = await service.listByEntity('PurchaseRequest', 'pr1');
      expect(prHistory.length).toBe(1);
    });
  });

  describe('list', () => {
    it('should return paginated results', async () => {
      for (let i = 0; i < 5; i++) {
        await service.record({ entityType: 'Award', entityId: `aw${i}`, action: 'accept', fromStatus: 'PENDING_ACCEPTANCE', toStatus: 'ACCEPTED', result: 'SUCCESS' });
      }
      const page1 = await service.list({ page: 1, limit: 2 });
      expect(page1.total).toBe(5);
      expect(page1.items.length).toBe(2);

      const page2 = await service.list({ page: 3, limit: 2 });
      expect(page2.items.length).toBe(1);
    });

    it('should filter by entity type', async () => {
      await service.record({ entityType: 'Award', entityId: 'aw1', action: 'accept', fromStatus: 'PENDING_ACCEPTANCE', toStatus: 'ACCEPTED', result: 'SUCCESS' });
      await service.record({ entityType: 'Evaluation', entityId: 'ev1', action: 'complete', fromStatus: 'IN_PROGRESS', toStatus: 'COMPLETED', result: 'SUCCESS' });

      const awards = await service.list({ entityType: 'Award' });
      expect(awards.total).toBe(1);
      expect(awards.items[0].entityType).toBe('Award');
    });

    it('should filter by entity type and id together', async () => {
      await service.record({ entityType: 'Award', entityId: 'aw1', action: 'accept', fromStatus: 'PENDING_ACCEPTANCE', toStatus: 'ACCEPTED', result: 'SUCCESS' });
      await service.record({ entityType: 'Award', entityId: 'aw2', action: 'decline', fromStatus: 'PENDING_ACCEPTANCE', toStatus: 'DECLINED', result: 'SUCCESS' });

      const result = await service.list({ entityType: 'Award', entityId: 'aw1' });
      expect(result.total).toBe(1);
      expect(result.items[0].entityId).toBe('aw1');
    });

    it('should default to page 1 and limit 20', async () => {
      await service.record({ entityType: 'Award', entityId: 'aw1', action: 'accept', fromStatus: 'PENDING_ACCEPTANCE', toStatus: 'ACCEPTED', result: 'SUCCESS' });
      const result = await service.list();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(1);
    });
  });

  describe('getRecorder', () => {
    it('should return the underlying recorder', () => {
      const recorder = new InMemoryWorkflowHistoryRecorder();
      const svc = new WorkflowHistoryService(recorder);
      expect(svc.getRecorder()).toBe(recorder);
    });
  });
});
