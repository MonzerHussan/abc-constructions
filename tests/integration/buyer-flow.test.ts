import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    rFQ: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    rFQItem: { deleteMany: vi.fn() },
    rFQSupplier: { findFirst: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    quotation: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    quotationItem: { deleteMany: vi.fn() },
    quotationEvaluation: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    evaluationCriterion: { findMany: vi.fn(), create: vi.fn() },
    evaluationScore: { deleteMany: vi.fn(), create: vi.fn() },
    award: { create: vi.fn() },
  },
}));

vi.mock('@/modules/shared/events/event-bus', () => ({
  eventBus: { publish: vi.fn() },
}));

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

import { prisma } from '@/lib/prisma';
import { eventBus } from '@/modules/shared/events/event-bus';
import { RFQService } from '@/modules/procurement/services/RFQService';
import { QuotationService } from '@/modules/procurement/services/QuotationService';
import { EvaluationService } from '@/modules/procurement/services/EvaluationService';

const rfqService = new RFQService();
const quotationService = new QuotationService();
const evaluationService = new EvaluationService();

const BUYER_ID = 'buyer-1';
const SUPPLIER_ID = 'supplier-1';

function baseRFQ(overrides: Record<string, unknown> = {}) {
  return {
    id: 'rfq-1',
    title: 'Procurement of structural steel',
    description: 'Supply and delivery of 50 tons of rebar',
    referenceNumber: 'RFQ-2026-001',
    status: 'DRAFT',
    purchaseRequestId: null,
    projectId: null,
    organizationId: 'org-1',
    issueDate: null,
    deadlineDate: new Date('2026-12-31'),
    deliveryDate: null,
    deliveryLocation: 'Riyadh',
    termsAndConditions: null,
    attachments: ['/uploads/boq/boq-steel.xlsx'],
    createdById: BUYER_ID,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    createdBy: { id: BUYER_ID, name: 'Buyer Co', companyName: 'BuyerCo' },
    items: [
      { id: 'item-1', materialName: 'Steel Rebar 16mm', description: null, quantity: 50, unit: 'ton', specifications: null },
    ],
    suppliers: [{ id: 'rs-1', supplierId: SUPPLIER_ID, invitedAt: new Date(), responded: false, respondedAt: null }],
    _count: { quotations: 0, suppliers: 1 },
    ...overrides,
  };
}

function baseQuotation(overrides: Record<string, unknown> = {}) {
  return {
    id: 'quotation-1',
    rfqId: 'rfq-1',
    supplierId: SUPPLIER_ID,
    organizationId: 'org-1',
    referenceNumber: 'QT-2026-001',
    status: 'DRAFT',
    totalAmount: 245000,
    taxAmount: 0,
    grandTotal: 245000,
    currency: 'SAR',
    createdAt: new Date('2026-07-05'),
    updatedAt: new Date('2026-07-05'),
    supplier: { id: SUPPLIER_ID, name: 'Steel Supplier', companyName: 'SteelCo' },
    items: [{ id: 'qi-1', rfqItemId: 'item-1', materialName: 'Steel Rebar 16mm', quantity: 50, unit: 'ton', unitPrice: 4900, totalPrice: 245000 }],
    ...overrides,
  };
}

describe('Buyer Flow — end-to-end (service level)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('register as buyer is allowed (role OWNER), ADMIN is rejected server-side', async () => {
    const { selfRegisterSchema } = await import('@/modules/core/validators/user-schemas');

    const buyer = selfRegisterSchema.safeParse({
      email: 'buyer@example.com',
      password: 'StrongPass123!',
      name: 'Buyer Co',
      role: 'OWNER',
    });
    expect(buyer.success).toBe(true);

    const escalation = selfRegisterSchema.safeParse({
      email: 'hacker@example.com',
      password: 'StrongPass123!',
      name: 'Hacker',
      role: 'ADMIN',
    });
    expect(escalation.success).toBe(false);
  });

  it('full journey: create RFQ → submit → send → receive offer → compare → select supplier', async () => {
    // -- 1. Buyer creates RFQ (DRAFT) with supplier invited, BOQ attached
    const created = baseRFQ({ status: 'DRAFT' });
    vi.mocked(prisma.rFQ.create).mockResolvedValue(created as never);

    const rfq = await rfqService.create(
      {
        title: 'Procurement of structural steel',
        description: 'Supply and delivery of 50 tons of rebar',
        referenceNumber: 'RFQ-2026-001',
        organizationId: 'org-1',
        deadlineDate: '2026-12-31',
        deliveryLocation: 'Riyadh',
        attachments: ['/uploads/boq/boq-steel.xlsx'],
        items: [{ materialName: 'Steel Rebar 16mm', quantity: 50, unit: 'ton' }],
        supplierIds: [SUPPLIER_ID],
      },
      BUYER_ID,
    );
    expect(rfq.id).toBe('rfq-1');
    expect(rfq.status).toBe('DRAFT');
    expect(rfq.suppliersCount).toBe(1);

    // -- 2. Buyer submits (DRAFT → SENT)
    const submitted = baseRFQ({ status: 'SENT' });
    vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(baseRFQ() as never);
    vi.mocked(prisma.rFQ.update).mockResolvedValue(submitted as never);
    const sent = await rfqService.submit('rfq-1', BUYER_ID);
    expect(sent.status).toBe('SENT');

    // -- 3. Buyer sends to suppliers (SENT → OPEN)
    const open = baseRFQ({ status: 'OPEN' });
    vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(baseRFQ({ status: 'SENT' }) as never);
    vi.mocked(prisma.rFQ.update).mockResolvedValue(open as never);
    const opened = await rfqService.send('rfq-1', BUYER_ID);
    expect(opened.status).toBe('OPEN');

    // -- 4. Supplier receives RFQ and submits an offer (quotation)
    vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({
      id: 'rfq-1', status: 'OPEN', organizationId: 'org-1', deadlineDate: new Date('2026-12-31'),
    } as never);
    const quotation = baseQuotation();
    vi.mocked(prisma.quotation.create).mockResolvedValue(quotation as never);
    const createdQuote = await quotationService.create(
      {
        rfqId: 'rfq-1',
        referenceNumber: 'QT-2026-001',
        currency: 'SAR',
        items: [{ rfqItemId: 'item-1', materialName: 'Steel Rebar 16mm', quantity: 50, unit: 'ton', unitPrice: 4900, totalPrice: 245000 }],
      },
      SUPPLIER_ID,
    );
    expect(createdQuote.grandTotal).toBe(245000);

    // -- 5. Supplier submits the quotation (DRAFT → SUBMITTED)
    const submittedQuote = baseQuotation({ status: 'SUBMITTED' });
    vi.mocked(prisma.quotation.findUnique).mockResolvedValue(baseQuotation() as never);
    vi.mocked(prisma.quotation.update).mockResolvedValue(submittedQuote as never);
    vi.mocked(prisma.rFQ.findUniqueOrThrow).mockResolvedValue({ id: 'rfq-1', status: 'OPEN' } as never);
    const sub = await quotationService.submit('quotation-1', SUPPLIER_ID);
    expect(sub.status).toBe('SUBMITTED');

    // -- 6. Buyer evaluates / compares offers
    vi.mocked(prisma.quotation.findUnique).mockResolvedValue({
      id: 'quotation-1', status: 'SUBMITTED', rfqId: 'rfq-1', referenceNumber: 'QT-2026-001', supplierId: SUPPLIER_ID,
    } as never);
    vi.mocked(prisma.quotationEvaluation.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.quotationEvaluation.create).mockResolvedValue({
      id: 'eval-1', quotationId: 'quotation-1', evaluatorId: BUYER_ID, status: 'PENDING', notes: null, createdAt: new Date(),
      evaluator: { id: BUYER_ID, name: 'Buyer Co' },
      quotation: { id: 'quotation-1', referenceNumber: 'QT-2026-001', supplier: { name: 'Steel Supplier', companyName: 'SteelCo' } },
    } as never);

    const evalStarted = await evaluationService.start('quotation-1', BUYER_ID);
    expect(evalStarted.status).toBe('PENDING');

    // criteria for scoring
    const criteria = [
      { id: 'criterion-1', name: 'Price', maxScore: 50, weight: 0.6 },
      { id: 'criterion-2', name: 'Quality', maxScore: 50, weight: 0.4 },
    ];
    vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue({
      id: 'eval-1', evaluatorId: BUYER_ID, status: 'IN_PROGRESS', scores: [],
    } as never);
    vi.mocked(prisma.evaluationCriterion.findMany).mockResolvedValue(criteria as never);
    vi.mocked(prisma.quotationEvaluation.update).mockResolvedValue({
      id: 'eval-1', quotationId: 'quotation-1', status: 'COMPLETED', totalScore: 88.4, scores: criteria.map((c) => ({ criterion: c })), updatedAt: new Date(),
    } as never);

    const scored = await evaluationService.submitScores(
      'eval-1',
      { scores: [{ criterionId: 'criterion-1', score: 45 }, { criterionId: 'criterion-2', score: 44 }], notes: 'Best value' },
      BUYER_ID,
    );
    expect(scored.status).toBe('COMPLETED');
    expect(scored.totalScore).toBe(88.4);

    // -- 7. Buyer selects supplier (award) → AWARDED
    vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({
      id: 'rfq-1', status: 'OPEN', createdById: BUYER_ID, referenceNumber: 'RFQ-2026-001',
    } as never);
    vi.mocked(prisma.quotation.findUnique).mockResolvedValue({
      id: 'quotation-1', supplierId: SUPPLIER_ID, grandTotal: 245000, rfqId: 'rfq-1',
    } as never);
    vi.mocked(prisma.rFQ.update).mockResolvedValue({
      id: 'rfq-1', title: 'Procurement of structural steel', referenceNumber: 'RFQ-2026-001', status: 'AWARDED', deadlineDate: new Date('2026-12-31'),
    } as never);
    vi.mocked(prisma.award.create).mockResolvedValue({ id: 'award-1' } as never);

    const awarded = await rfqService.award('rfq-1', 'quotation-1', BUYER_ID);
    expect(awarded.status).toBe('AWARDED');

    // Events were published along the journey
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining('RFQ') }),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining('Quotation') }),
    );
  });

  it('buyer cannot award with a quotation belonging to a different RFQ (cross-RFQ guard)', async () => {
    vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({
      id: 'rfq-1', status: 'OPEN', createdById: BUYER_ID, referenceNumber: 'RFQ-2026-001',
    } as never);
    vi.mocked(prisma.quotation.findUnique).mockResolvedValue({
      id: 'quotation-2', supplierId: SUPPLIER_ID, grandTotal: 100, rfqId: 'rfq-OTHER',
    } as never);

    const { ErrorCodes } = await import('@/modules/shared/utils/error-codes');
    await expect(rfqService.award('rfq-1', 'quotation-2', BUYER_ID)).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
  });
});
