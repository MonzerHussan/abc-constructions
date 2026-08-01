import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { InMemoryWorkflowHistoryRecorder } from '@/modules/shared/workflow/WorkflowHistoryRecorder';
import { WorkflowHistoryService } from '@/modules/procurement/services/WorkflowHistoryService';
import { ProcurementWorkflowOrchestrator } from '@/modules/procurement/services/ProcurementWorkflowOrchestrator';
import type { EntityStatusPort } from '@/modules/procurement/services/ProcurementWorkflowOrchestrator';
import { registerProcurementDefinitions } from '@/modules/procurement/workflow/definitions';

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

class FakeStatusPort implements EntityStatusPort {
  statuses: Map<string, string> = new Map();
  persistCalls: { entityType: string; entityId: string; status: string }[] = [];

  loadStatus(entityType: string, entityId: string): Promise<string> {
    const status = this.statuses.get(entityId);
    if (!status) return Promise.reject(new Error('WORKFLOW_INSTANCE_NOT_FOUND'));
    return Promise.resolve(status);
  }

  persistStatus(entityType: string, entityId: string, status: string): Promise<void> {
    this.statuses.set(entityId, status);
    this.persistCalls.push({ entityType, entityId, status });
    return Promise.resolve();
  }
}

describe('ProcurementWorkflowOrchestrator', () => {
  let orchestrator: ProcurementWorkflowOrchestrator;
  let statusPort: FakeStatusPort;
  let historyService: WorkflowHistoryService;
  const published: unknown[] = [];

  beforeEach(() => {
    statusPort = new FakeStatusPort();
    historyService = new WorkflowHistoryService(new InMemoryWorkflowHistoryRecorder());
    published.length = 0;
    registerProcurementDefinitions();
    orchestrator = new ProcurementWorkflowOrchestrator({
      engine: workflowEngine,
      historyService,
      statusPort,
      bus: {
        publish: async (event: unknown) => {
          published.push(event);
        },
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
      },
    });
  });

  describe('PurchaseRequest transitions', () => {
    it('should submit a PR owned by the actor', async () => {
      statusPort.statuses.set('pr1', 'DRAFT');
      const result = await orchestrator.execute('PurchaseRequest', 'submit', {
        entityId: 'pr1',
        actorId: 'user-requester',
        actorRole: 'CONSULTANT',
        metadata: { requesterId: 'user-requester' },
      });
      expect(result.result).toBe('SUCCESS');
      if (result.result === 'SUCCESS') {
        expect(result.toStatus).toBe('PENDING_APPROVAL');
      }
      expect(statusPort.statuses.get('pr1')).toBe('PENDING_APPROVAL');
    });

    it('should block submit when actor is not the requester', async () => {
      statusPort.statuses.set('pr1', 'DRAFT');
      const result = await orchestrator.execute('PurchaseRequest', 'submit', {
        entityId: 'pr1',
        actorId: 'other-user',
        actorRole: 'CONSULTANT',
        metadata: { requesterId: 'user-requester' },
      });
      expect(result.result).toBe('BLOCKED_BY_GUARD');
      if (result.result === 'BLOCKED_BY_GUARD') {
        expect(result.blockedBy).toBe('pr.submit.owner');
      }
    });

    it('should block approve for non-buyer roles', async () => {
      statusPort.statuses.set('pr1', 'PENDING_APPROVAL');
      const result = await orchestrator.execute('PurchaseRequest', 'approve', {
        entityId: 'pr1',
        actorId: 'supplier-1',
        actorRole: 'SUPPLIER',
      });
      expect(result.result).toBe('BLOCKED_BY_GUARD');
      if (result.result === 'BLOCKED_BY_GUARD') {
        expect(result.blockedBy).toBe('pr.approve.rbac');
      }
    });

    it('should allow approve for buyer roles', async () => {
      statusPort.statuses.set('pr1', 'PENDING_APPROVAL');
      const result = await orchestrator.execute('PurchaseRequest', 'approve', {
        entityId: 'pr1',
        actorId: 'buyer-1',
        actorRole: 'BUYER',
        reason: 'All good',
      });
      expect(result.result).toBe('SUCCESS');
      if (result.result === 'SUCCESS') {
        expect(result.toStatus).toBe('APPROVED');
      }
    });

    it('should return INVALID_TRANSITION for invalid action', async () => {
      statusPort.statuses.set('pr1', 'DRAFT');
      const result = await orchestrator.execute('PurchaseRequest', 'approve', {
        entityId: 'pr1',
        actorId: 'buyer-1',
        actorRole: 'BUYER',
      });
      expect(result.result).toBe('INVALID_TRANSITION');
    });
  });

  describe('Evaluation transitions', () => {
    it('should block complete when no scores are present', async () => {
      statusPort.statuses.set('ev1', 'IN_PROGRESS');
      const result = await orchestrator.execute('Evaluation', 'complete', {
        entityId: 'ev1',
        actorId: 'evaluator-1',
        actorRole: 'EVALUATOR',
        metadata: { scoreCount: 0 },
      });
      expect(result.result).toBe('BLOCKED_BY_GUARD');
      if (result.result === 'BLOCKED_BY_GUARD') {
        expect(result.blockedBy).toBe('eval.complete.completeness');
      }
    });

    it('should allow complete when scores exist', async () => {
      statusPort.statuses.set('ev1', 'IN_PROGRESS');
      const result = await orchestrator.execute('Evaluation', 'complete', {
        entityId: 'ev1',
        actorId: 'evaluator-1',
        actorRole: 'EVALUATOR',
        metadata: { scoreCount: 3 },
      });
      expect(result.result).toBe('SUCCESS');
      if (result.result === 'SUCCESS') {
        expect(result.toStatus).toBe('COMPLETED');
      }
    });
  });

  describe('Award transitions', () => {
    it('should block accept by a non-supplier', async () => {
      statusPort.statuses.set('aw1', 'PENDING_ACCEPTANCE');
      const result = await orchestrator.execute('Award', 'accept', {
        entityId: 'aw1',
        actorId: 'buyer-1',
        actorRole: 'BUYER',
        metadata: { supplierId: 'supplier-1' },
      });
      expect(result.result).toBe('BLOCKED_BY_GUARD');
      if (result.result === 'BLOCKED_BY_GUARD') {
        expect(result.blockedBy).toBe('award.accept.rbac');
      }
    });

    it('should allow accept by the awarded supplier', async () => {
      statusPort.statuses.set('aw1', 'PENDING_ACCEPTANCE');
      const result = await orchestrator.execute('Award', 'accept', {
        entityId: 'aw1',
        actorId: 'supplier-1',
        actorRole: 'SUPPLIER',
        metadata: { supplierId: 'supplier-1' },
      });
      expect(result.result).toBe('SUCCESS');
      if (result.result === 'SUCCESS') {
        expect(result.toStatus).toBe('ACCEPTED');
      }
    });

    it('should allow cancel by buyer roles', async () => {
      statusPort.statuses.set('aw1', 'PENDING_ACCEPTANCE');
      const result = await orchestrator.execute('Award', 'cancel', {
        entityId: 'aw1',
        actorId: 'buyer-1',
        actorRole: 'BUYER',
        reason: 'Bad terms',
      });
      expect(result.result).toBe('SUCCESS');
      if (result.result === 'SUCCESS') {
        expect(result.toStatus).toBe('CANCELLED');
      }
    });
  });

  describe('History recording', () => {
    it('should record successful transitions in history', async () => {
      statusPort.statuses.set('pr1', 'DRAFT');
      await orchestrator.execute('PurchaseRequest', 'submit', {
        entityId: 'pr1',
        actorId: 'user-requester',
        actorRole: 'CONSULTANT',
        metadata: { requesterId: 'user-requester' },
      });
      const history = await historyService.listByEntity('PurchaseRequest', 'pr1');
      expect(history.length).toBe(1);
      expect(history[0].result).toBe('SUCCESS');
      expect(history[0].action).toBe('submit');
    });

    it('should record blocked transitions in history', async () => {
      statusPort.statuses.set('pr1', 'DRAFT');
      await orchestrator.execute('PurchaseRequest', 'submit', {
        entityId: 'pr1',
        actorId: 'other-user',
        actorRole: 'CONSULTANT',
        metadata: { requesterId: 'user-requester' },
      });
      const history = await historyService.listByEntity('PurchaseRequest', 'pr1');
      expect(history.length).toBe(1);
      expect(history[0].result).toBe('BLOCKED_BY_GUARD');
      expect(history[0].guardName).toBe('pr.submit.owner');
    });
  });

  describe('Event publishing', () => {
    it('should publish a domain event on success', async () => {
      statusPort.statuses.set('aw1', 'PENDING_ACCEPTANCE');
      await orchestrator.execute('Award', 'accept', {
        entityId: 'aw1',
        actorId: 'supplier-1',
        actorRole: 'SUPPLIER',
        metadata: { supplierId: 'supplier-1' },
      });
      expect(published.length).toBe(1);
      const event = published[0] as { name: string };
      expect(event.name).toBe('Procurement.Award.Accepted');
    });

    it('should not publish events when transition is blocked', async () => {
      statusPort.statuses.set('aw1', 'PENDING_ACCEPTANCE');
      await orchestrator.execute('Award', 'accept', {
        entityId: 'aw1',
        actorId: 'buyer-1',
        actorRole: 'BUYER',
        metadata: { supplierId: 'supplier-1' },
      });
      expect(published.length).toBe(0);
    });
  });
});
