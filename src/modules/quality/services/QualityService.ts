import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { QualityStateMachine } from '@/modules/quality/workflow/state-machines/QualityStateMachine';
import type { InspectionStatus } from '@/modules/quality/workflow/state-machines/QualityStateMachine';
import type {
  CreateInspectionInput, UpdateInspectionInput, InspectionListQuery,
  AddInspectionItemInput, UpdateInspectionItemInput, CreateNCRInput, CreateCertificateInput,
  AddAttachmentInput,
} from '@/modules/quality/validators/inspection-schemas';

function mapItem(item: { id: string; inspectionId: string; deliveryItemId: string | null; poItemId: string; specification: string; expectedValue: string | null; actualValue: string | null; result: string | null; remarks: string | null; createdAt: Date }) {
  return {
    id: item.id,
    inspectionId: item.inspectionId,
    deliveryItemId: item.deliveryItemId ?? null,
    poItemId: item.poItemId,
    specification: item.specification,
    expectedValue: item.expectedValue ?? null,
    actualValue: item.actualValue ?? null,
    result: item.result ?? null,
    remarks: item.remarks ?? null,
    createdAt: item.createdAt.toISOString(),
  };
}

function mapAttachment(a: { id: string; inspectionId: string; type: string; url: string; fileName: string; uploadedById: string; createdAt: Date }) {
  return {
    id: a.id,
    inspectionId: a.inspectionId,
    type: a.type,
    url: a.url,
    fileName: a.fileName,
    uploadedById: a.uploadedById,
    createdAt: a.createdAt.toISOString(),
  };
}

function mapNCR(n: { id: string; ncrNumber: string; inspectionId: string; severity: string; category: string; description: string; correctiveAction: string | null; dueDate: Date | null; status: string; createdById: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: n.id,
    ncrNumber: n.ncrNumber,
    inspectionId: n.inspectionId,
    severity: n.severity,
    category: n.category,
    description: n.description,
    correctiveAction: n.correctiveAction ?? null,
    dueDate: n.dueDate?.toISOString() ?? null,
    status: n.status,
    createdById: n.createdById,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

function mapCertificate(c: { id: string; certificateNumber: string; inspectionId: string; acceptedById: string; acceptedAt: Date; remarks: string | null; createdAt: Date; acceptedBy: { id: string; name: string } }) {
  return {
    id: c.id,
    certificateNumber: c.certificateNumber,
    inspectionId: c.inspectionId,
    acceptedById: c.acceptedById,
    acceptedByName: c.acceptedBy?.name ?? '',
    acceptedAt: c.acceptedAt.toISOString(),
    remarks: c.remarks ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

export class QualityService {
  async listInspections(query: InspectionListQuery) {
    const { page, limit, status, type, referenceType, referenceId, inspectorId, sort } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (referenceType) where.referenceType = referenceType;
    if (referenceId) where.referenceId = referenceId;
    if (inspectorId) where.inspectorId = inspectorId;
    const orderBy = sort
      ? { [sort.split(':')[0]]: sort.split(':')[1] || 'desc' }
      : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        include: { _count: { select: { items: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inspection.count({ where }),
    ]);

    return {
      items: items.map((i) => ({
        id: i.id, inspectionNumber: i.inspectionNumber, type: i.type,
        status: i.status, referenceType: i.referenceType, referenceId: i.referenceId,
        inspectorId: i.inspectorId, itemCount: i._count.items,
        scheduledAt: i.scheduledAt?.toISOString() ?? null,
        completedAt: i.completedAt?.toISOString() ?? null,
        createdAt: i.createdAt.toISOString(),
      })),
      total, page, limit,
    };
  }

  async findInspectionById(id: string) {
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        inspector: { select: { id: true, name: true } },
        items: { include: { poItem: { select: { id: true, materialName: true } } } },
        attachments: true,
        ncrs: true,
        certificates: { include: { acceptedBy: { select: { id: true, name: true } } } },
      },
    });
    if (!inspection) throw new Error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND);

    return {
      id: inspection.id, inspectionNumber: inspection.inspectionNumber,
      type: inspection.type, status: inspection.status,
      referenceType: inspection.referenceType, referenceId: inspection.referenceId,
      inspectorId: inspection.inspectorId,
      inspectorName: inspection.inspector.name,
      scheduledAt: inspection.scheduledAt?.toISOString() ?? null,
      completedAt: inspection.completedAt?.toISOString() ?? null,
      notes: inspection.notes,
      items: inspection.items.map(mapItem),
      attachments: inspection.attachments.map(mapAttachment),
      ncrs: inspection.ncrs.map(mapNCR),
      certificates: inspection.certificates.map(mapCertificate),
      createdAt: inspection.createdAt.toISOString(),
      updatedAt: inspection.updatedAt.toISOString(),
    };
  }

  async createInspection(input: CreateInspectionInput, userId: string) {
    const inspection = await prisma.inspection.create({
      data: {
        inspectionNumber: `INS-${Date.now()}`,
        type: input.type,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        inspectorId: input.inspectorId,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        notes: input.notes ?? null,
        items: input.items ? {
          create: input.items.map((item) => ({
            poItemId: item.poItemId,
            specification: item.specification,
            expectedValue: item.expectedValue ?? null,
            remarks: item.remarks ?? null,
          })),
        } : undefined,
      },
      include: { items: true },
    });

    logger.info(`Inspection ${inspection.inspectionNumber} created`);

    await eventBus.publish({
      name: buildEventName('Quality', 'Inspection', 'Created'),
      version: 1,
      payload: { inspectionId: inspection.id, inspectionNumber: inspection.inspectionNumber },
      metadata: { timestamp: new Date(), correlationId: `ins_${inspection.id}_${Date.now()}`, source: 'quality', userId },
    });

    return {
      id: inspection.id, inspectionNumber: inspection.inspectionNumber, status: inspection.status,
      items: inspection.items.map(mapItem), createdAt: inspection.createdAt.toISOString(),
    };
  }

  async updateInspection(id: string, input: UpdateInspectionInput) {
    const existing = await prisma.inspection.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND);
    if (existing.status !== 'PENDING') {
      throw new Error(ErrorCodes.QUALITY_INSPECTION_CANNOT_MODIFY);
    }

    const inspection = await prisma.inspection.update({
      where: { id },
      data: {
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : existing.scheduledAt,
        notes: input.notes ?? existing.notes,
      },
    });

    return { id: inspection.id, inspectionNumber: inspection.inspectionNumber, status: inspection.status };
  }

  async deleteInspection(id: string) {
    const existing = await prisma.inspection.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND);
    if (existing.status !== 'PENDING') {
      throw new Error(ErrorCodes.QUALITY_INSPECTION_CANNOT_DELETE);
    }
    await prisma.inspectionAttachment.deleteMany({ where: { inspectionId: id } });
    await prisma.nCR.deleteMany({ where: { inspectionId: id } });
    await prisma.acceptanceCertificate.deleteMany({ where: { inspectionId: id } });
    await prisma.inspectionItem.deleteMany({ where: { inspectionId: id } });
    await prisma.inspection.delete({ where: { id } });
  }

  async addInspectionItem(id: string, input: AddInspectionItemInput) {
    const inspection = await prisma.inspection.findUnique({ where: { id } });
    if (!inspection) throw new Error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND);

    const item = await prisma.inspectionItem.create({
      data: {
        inspectionId: id,
        deliveryItemId: input.deliveryItemId ?? null,
        poItemId: input.poItemId,
        specification: input.specification,
        expectedValue: input.expectedValue ?? null,
        remarks: input.remarks ?? null,
      },
    });

    return mapItem(item);
  }

  async updateInspectionItem(inspectionId: string, itemId: string, input: UpdateInspectionItemInput) {
    const item = await prisma.inspectionItem.findFirst({
      where: { id: itemId, inspectionId },
    });
    if (!item) throw new Error(ErrorCodes.QUALITY_INSPECTION_ITEM_NOT_FOUND);

    const updated = await prisma.inspectionItem.update({
      where: { id: itemId },
      data: { actualValue: input.actualValue ?? item.actualValue, result: input.result, remarks: input.remarks ?? item.remarks },
    });

    return mapItem(updated);
  }

  async startInspection(id: string) {
    return this.transitionInspection(id, 'start', 'Started');
  }

  async passInspection(id: string) {
    return this.transitionInspection(id, 'pass', 'Passed');
  }

  async failInspection(id: string) {
    return this.transitionInspection(id, 'fail', 'Failed');
  }

  async partialInspection(id: string) {
    return this.transitionInspection(id, 'partial', 'Partial');
  }

  async acceptInspection(id: string, input?: CreateCertificateInput, userId?: string) {
    const { delivery, newStatus } = await this.transitionInspectionRaw(id, 'accept', 'Accepted');
    const certificate = await prisma.acceptanceCertificate.create({
      data: {
        certificateNumber: `CERT-${Date.now()}`,
        inspectionId: id,
        acceptedById: userId ?? delivery.inspectorId,
        remarks: input?.remarks ?? null,
      },
      include: { acceptedBy: { select: { id: true, name: true } } },
    });

    await eventBus.publish({
      name: buildEventName('Quality', 'Acceptance', 'Issued'),
      version: 1,
      payload: { certificateId: certificate.id, certificateNumber: certificate.certificateNumber, inspectionId: id },
      metadata: { timestamp: new Date(), correlationId: `cert_${certificate.id}_${Date.now()}`, source: 'quality' },
    });

    return { inspection: { id: delivery.id, inspectionNumber: delivery.inspectionNumber, status: newStatus }, certificate: mapCertificate(certificate) };
  }

  async attachToInspection(id: string, input: AddAttachmentInput, userId: string) {
    const inspection = await prisma.inspection.findUnique({ where: { id } });
    if (!inspection) throw new Error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND);

    const attachment = await prisma.inspectionAttachment.create({
      data: {
        inspectionId: id, type: input.type, url: input.url, fileName: input.fileName, uploadedById: userId,
      },
    });

    return mapAttachment(attachment);
  }

  async createNCR(inspectionId: string, input: CreateNCRInput, userId: string) {
    const inspection = await prisma.inspection.findUnique({ where: { id: inspectionId } });
    if (!inspection) throw new Error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND);

    const ncr = await prisma.nCR.create({
      data: {
        ncrNumber: `NCR-${Date.now()}`,
        inspectionId,
        severity: input.severity,
        category: input.category,
        description: input.description,
        correctiveAction: input.correctiveAction ?? null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        createdById: userId,
      },
    });

    logger.info(`NCR ${ncr.ncrNumber} created for inspection ${inspection.inspectionNumber}`);

    await eventBus.publish({
      name: buildEventName('Quality', 'NCR', 'Created'),
      version: 1,
      payload: { ncrId: ncr.id, ncrNumber: ncr.ncrNumber, inspectionId },
      metadata: { timestamp: new Date(), correlationId: `ncr_${ncr.id}_${Date.now()}`, source: 'quality', userId },
    });

    return mapNCR(ncr);
  }

  async findNCRById(id: string) {
    const ncr = await prisma.nCR.findUnique({ where: { id } });
    if (!ncr) throw new Error(ErrorCodes.QUALITY_NCR_NOT_FOUND);
    return mapNCR(ncr);
  }

  async listCertificates(inspectionId?: string) {
    const where: Record<string, unknown> = {};
    if (inspectionId) where.inspectionId = inspectionId;

    const certificates = await prisma.acceptanceCertificate.findMany({
      where,
      include: { acceptedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return certificates.map(mapCertificate);
  }

  private async transitionInspectionRaw(id: string, action: string, _actionLabel: string) {
    const existing = await prisma.inspection.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND);

    const machine = new QualityStateMachine(existing.status);
    const newStatus = machine.transition(action) as InspectionStatus;

    const now = new Date();
    const isTerminal = newStatus === 'ACCEPTED' || newStatus === 'FAILED' || newStatus === 'PASSED' || newStatus === 'NCR_CREATED';
    const delivery = await prisma.inspection.update({
      where: { id },
      data: { status: newStatus, completedAt: isTerminal ? now : existing.completedAt },
    });

    return { delivery, newStatus };
  }

  private async transitionInspection(id: string, action: string, actionLabel: string) {
    const { delivery, newStatus } = await this.transitionInspectionRaw(id, action, actionLabel);

    logger.info(`Inspection ${delivery.inspectionNumber} ${actionLabel}`);

    await eventBus.publish({
      name: buildEventName('Quality', 'Inspection', actionLabel),
      version: 1,
      payload: { inspectionId: delivery.id, inspectionNumber: delivery.inspectionNumber, status: newStatus },
      metadata: { timestamp: new Date(), correlationId: `ins_${delivery.id}_${Date.now()}`, source: 'quality' },
    });

    return { id: delivery.id, inspectionNumber: delivery.inspectionNumber, status: newStatus };
  }
}
