import { prisma } from '@/lib/prisma';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import type { IEventBus } from '@/modules/shared/events/types';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import type { WorkflowEngine, WorkflowTransitionResult } from '@/modules/shared/workflow/WorkflowEngine';
import type { WorkflowContext } from '@/modules/shared/workflow/WorkflowContext';
import { logger } from '@/modules/shared/utils/logger';
import { WorkflowHistoryService } from '@/modules/procurement/services/WorkflowHistoryService';
import { registerProcurementDefinitions } from '@/modules/procurement/workflow/definitions';

export interface EntityStatusPort {
  loadStatus(entityType: string, entityId: string): Promise<string>;
  persistStatus(entityType: string, entityId: string, status: string): Promise<void>;
}

export interface OrchestratorContext {
  entityId: string;
  actorId: string;
  actorRole?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface OrchestrationSuccess {
  fromStatus: string;
  toStatus: string;
  action: string;
  entityType: string;
  entityId: string;
  result: 'SUCCESS';
  historyId?: string;
  eventName?: string;
}

export interface OrchestrationBlocked {
  fromStatus: string;
  toStatus: string;
  action: string;
  entityType: string;
  entityId: string;
  result: 'BLOCKED_BY_GUARD';
  blockedBy?: string;
  reason?: string;
}

export interface OrchestrationInvalid {
  fromStatus: string;
  toStatus: string;
  action: string;
  entityType: string;
  entityId: string;
  result: 'INVALID_TRANSITION';
  reason?: string;
}

export type OrchestrationResult = OrchestrationSuccess | OrchestrationBlocked | OrchestrationInvalid;

const ENTITY_EVENT_ACTIONS: Record<string, Record<string, string>> = {
  RFQ: { submit: 'Submitted', send: 'Sent', award: 'Awarded', close: 'Closed', cancel: 'Cancelled' },
  Quotation: { submit: 'Submitted', withdraw: 'Withdrawn', accept: 'Accepted', reject: 'Rejected' },
  PO: { issue: 'Issued', acknowledge: 'Acknowledged', receive: 'Received', complete: 'Completed', cancel: 'Cancelled' },
  Delivery: { dispatch: 'Dispatched', markInTransit: 'InTransit', arrive: 'Arrived', receive: 'Received', complete: 'Completed', cancel: 'Cancelled' },
  PurchaseRequest: { submit: 'Submitted', approve: 'Approved', reject: 'Rejected', order: 'Ordered' },
  Evaluation: { start: 'Started', score: 'Scored', complete: 'Completed' },
  Award: { accept: 'Accepted', decline: 'Declined', cancel: 'Cancelled' },
};

interface StatusModel {
  findUnique(args: { where: { id: string }; select: { status: true } }): Promise<{ status: string } | null>;
  update(args: { where: { id: string }; data: { status: string } }): Promise<unknown>;
}

class PrismaEntityStatusPort implements EntityStatusPort {
  private modelFor(entityType: string): StatusModel | null {
    let model: StatusModel | null;
    switch (entityType) {
      case 'RFQ':
        model = prisma.rFQ as unknown as StatusModel;
        break;
      case 'Quotation':
        model = prisma.quotation as unknown as StatusModel;
        break;
      case 'PO':
        model = prisma.purchaseOrder as unknown as StatusModel;
        break;
      case 'Delivery':
        model = prisma.delivery as unknown as StatusModel;
        break;
      case 'PurchaseRequest':
        model = prisma.purchaseRequest as unknown as StatusModel;
        break;
      case 'Evaluation':
        model = prisma.evaluation as unknown as StatusModel;
        break;
      case 'Award':
        model = prisma.award as unknown as StatusModel;
        break;
      default:
        model = null;
    }
    return model;
  }

  async loadStatus(entityType: string, entityId: string): Promise<string> {
    const model = this.modelFor(entityType);
    if (!model) throw new Error('WORKFLOW_ENTITY_TYPE_UNSUPPORTED');
    const record = await model.findUnique({ where: { id: entityId }, select: { status: true } });
    if (!record) throw new Error('WORKFLOW_INSTANCE_NOT_FOUND');
    return record.status as string;
  }

  async persistStatus(entityType: string, entityId: string, status: string): Promise<void> {
    const model = this.modelFor(entityType);
    if (!model) throw new Error('WORKFLOW_ENTITY_TYPE_UNSUPPORTED');
    await model.update({ where: { id: entityId }, data: { status } });
  }
}

export class ProcurementWorkflowOrchestrator {
  private readonly engine: WorkflowEngine;
  private readonly historyService: WorkflowHistoryService;
  private readonly statusPort: EntityStatusPort;
  private readonly bus: IEventBus;

  constructor(options?: {
    engine?: WorkflowEngine;
    historyService?: WorkflowHistoryService;
    statusPort?: EntityStatusPort;
    bus?: IEventBus;
  }) {
    registerProcurementDefinitions();
    this.engine = options?.engine ?? workflowEngine;
    this.historyService = options?.historyService ?? new WorkflowHistoryService();
    this.statusPort = options?.statusPort ?? new PrismaEntityStatusPort();
    this.bus = options?.bus ?? eventBus;
    this.engine.setHistoryRecorder(this.historyService.getRecorder());
  }

  getHistoryService(): WorkflowHistoryService {
    return this.historyService;
  }

  private buildContext(entityType: string, ctx: OrchestratorContext): WorkflowContext {
    return {
      entityId: ctx.entityId,
      entityType,
      userId: ctx.actorId,
      actorRole: ctx.actorRole,
      reason: ctx.reason,
      timestamp: new Date(),
      metadata: ctx.metadata,
    };
  }

  async execute(entityType: string, action: string, ctx: OrchestratorContext): Promise<OrchestrationResult> {
    const currentStatus = await this.statusPort.loadStatus(entityType, ctx.entityId);
    const workflowContext = this.buildContext(entityType, ctx);

    let outcome: WorkflowTransitionResult;
    try {
      outcome = await this.engine.execute(entityType, currentStatus, action, workflowContext);
    } catch (err) {
      if (err instanceof Error && err.message.includes('INVALID_TRANSITION')) {
        return {
          fromStatus: currentStatus,
          toStatus: currentStatus,
          action,
          entityType,
          entityId: ctx.entityId,
          result: 'INVALID_TRANSITION',
          reason: err.message,
        };
      }
      throw err;
    }

    if (outcome.result !== 'SUCCESS') {
      return {
        fromStatus: outcome.fromStatus,
        toStatus: outcome.toStatus,
        action,
        entityType,
        entityId: ctx.entityId,
        result: outcome.result as 'BLOCKED_BY_GUARD',
        blockedBy: outcome.blockedBy,
        reason: outcome.reason,
      };
    }

    await this.statusPort.persistStatus(entityType, ctx.entityId, outcome.toStatus);

    const eventAction = ENTITY_EVENT_ACTIONS[entityType]?.[action];
    let eventName: string | undefined;
    if (eventAction) {
      eventName = buildEventName('Procurement', entityType, eventAction);
      await this.bus.publish({
        name: eventName,
        version: 1,
        payload: { entityId: ctx.entityId, action, fromStatus: currentStatus, toStatus: outcome.toStatus, actorId: ctx.actorId, reason: ctx.reason },
        metadata: { timestamp: new Date(), correlationId: `wf_${ctx.entityId}_${Date.now()}`, source: 'procurement', userId: ctx.actorId },
      });
    }

    logger.info('Workflow transition executed', { entityType, entityId: ctx.entityId, action, fromStatus: currentStatus, toStatus: outcome.toStatus, actorId: ctx.actorId });
    return {
      fromStatus: currentStatus,
      toStatus: outcome.toStatus,
      action,
      entityType,
      entityId: ctx.entityId,
      result: 'SUCCESS',
      historyId: outcome.historyId,
      eventName,
    };
  }

  async createPOFromAward(awardId: string, actorId: string) {
    const award = await prisma.award.findUnique({
      where: { id: awardId },
      include: {
        rfq: { select: { id: true, title: true, referenceNumber: true, projectId: true, organizationId: true } },
        quotation: {
          include: {
            items: { select: { materialName: true, description: true, quantity: true, unit: true, unitPrice: true, totalPrice: true } },
          },
        },
      },
    });
    if (!award) throw new Error('PROCUREMENT_AWARD_NOT_FOUND');

    const poNumber = `PO-${award.rfq.referenceNumber}-${Date.now().toString().slice(-6)}`;
    const totalAmount = award.quotation.items.reduce((sum, item) => sum + item.totalPrice, 0);

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        rfqId: award.rfqId,
        quotationId: award.quotationId,
        awardId: award.id,
        projectId: award.rfq.projectId ?? null,
        organizationId: award.rfq.organizationId ?? null,
        supplierId: award.supplierId,
        createdById: actorId,
        subtotal: totalAmount,
        taxAmount: 0,
        totalAmount,
        items: {
          create: award.quotation.items.map((item) => ({
            materialName: item.materialName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            balanceQuantity: item.quantity,
          })),
        },
      },
      select: { id: true, poNumber: true, status: true, totalAmount: true },
    });

    await this.bus.publish({
      name: buildEventName('Procurement', 'PO', 'Created'),
      version: 1,
      payload: { poId: po.id, poNumber: po.poNumber, awardId, supplierId: award.supplierId, totalAmount, itemCount: award.quotation.items.length },
      metadata: { timestamp: new Date(), correlationId: `award_${awardId}_${Date.now()}`, source: 'procurement', userId: actorId },
    });

    logger.info('PO created from accepted award', { awardId, poId: po.id, actorId });
    return po;
  }
}

export const procurementWorkflowOrchestrator = new ProcurementWorkflowOrchestrator();
