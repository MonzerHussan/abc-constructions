import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    supplierProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    supplierDocument: { create: vi.fn(), delete: vi.fn() },
    supplierCapability: { create: vi.fn(), update: vi.fn() },
    productMaster: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    supplierProductOffering: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    unitOfMeasure: { findMany: vi.fn() },
    rFQ: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    rFQSupplier: { findFirst: vi.fn() },
    quotation: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    quotationItem: { deleteMany: vi.fn() },
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
import { SupplierNetworkService } from '@/modules/supplier-network/services/SupplierNetworkService';
import { ProductCatalogService } from '@/modules/product-catalog/services/ProductCatalogService';
import { RFQService } from '@/modules/procurement/services/RFQService';
import { QuotationService } from '@/modules/procurement/services/QuotationService';

const supplierService = new SupplierNetworkService();
const catalogService = new ProductCatalogService();
const rfqService = new RFQService();
const quotationService = new QuotationService();

const SUPPLIER_USER_ID = 'supplier-user-1';
const SUPPLIER_PROFILE_ID = 'profile-1';
const BUYER_ID = 'buyer-1';

describe('Supplier Flow — end-to-end (service level)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('register as SUPPLIER role is allowed; SUPER_ADMIN role is rejected', async () => {
    const { selfRegisterSchema } = await import('@/modules/core/validators/user-schemas');

    const supplier = selfRegisterSchema.safeParse({
      email: 'supplier@steelco.com',
      password: 'StrongPass123!',
      name: 'SteelCo',
      role: 'SUPPLIER',
    });
    expect(supplier.success).toBe(true);

    const escalation = selfRegisterSchema.safeParse({
      email: 'hacker@example.com',
      password: 'StrongPass123!',
      name: 'Hacker',
      role: 'SUPER_ADMIN',
    });
    expect(escalation.success).toBe(false);
  });

  it('full journey: create profile → company verification → add products → receive RFQ → submit quote', async () => {
    // -- 1. Supplier creates company profile (UNVERIFIED)
    vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(null as never);
    const profile = {
      id: SUPPLIER_PROFILE_ID,
      userId: SUPPLIER_USER_ID,
      organizationId: null,
      verificationLevel: 'UNVERIFIED',
      supplierType: 'MANUFACTURER',
      companyName: 'SteelCo',
      licenseNumber: 'LIC-001',
      taxNumber: 'TAX-001',
      country: 'SA',
      city: 'Dammam',
      vatRegistered: true,
      transportTypes: [],
      countriesServed: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.supplierProfile.create).mockResolvedValue(profile as never);

    const createdProfile = await supplierService.createProfile(
      {
        supplierType: ['MANUFACTURER'],
        companyName: 'SteelCo',
        licenseNumber: 'LIC-001',
        taxNumber: 'TAX-001',
        country: 'SA',
        city: 'Dammam',
        vatRegistered: true,
      },
      SUPPLIER_USER_ID,
    );
    expect(createdProfile.verificationLevel).toBe('UNVERIFIED');

    // -- 2. Company verification: submit basic info → verify
    vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue({ ...profile, verificationLevel: 'UNVERIFIED' } as never);
    vi.mocked(prisma.supplierProfile.update).mockResolvedValue({ ...profile, verificationLevel: 'BASIC' } as never);
    const basic = await supplierService.transitionVerification(SUPPLIER_PROFILE_ID, 'submitBasic', SUPPLIER_USER_ID);
    expect(basic.currentLevel).toBe('BASIC');

    vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue({ ...profile, verificationLevel: 'BASIC' } as never);
    vi.mocked(prisma.supplierProfile.update).mockResolvedValue({ ...profile, verificationLevel: 'VERIFIED' } as never);
    const verified = await supplierService.transitionVerification(SUPPLIER_PROFILE_ID, 'verify', SUPPLIER_USER_ID);
    expect(verified.currentLevel).toBe('VERIFIED');

    // -- 3. Add products to catalog
    vi.mocked(prisma.productMaster.create).mockResolvedValue({
      id: 'product-1',
      name: 'Steel Rebar 16mm',
      status: 'DRAFT',
      category: 'Steel',
    } as never);
    const product = await catalogService.createProduct(
      { sku: 'REBAR-16', name: 'Steel Rebar 16mm', manufacturerId: 'manu-1', categoryId: 'cat-1' },
      SUPPLIER_USER_ID,
    );
    expect(product.id).toBe('product-1');

    // -- 4. Supplier lists the product with a price (offering)
    vi.mocked(prisma.productMaster.findUnique).mockResolvedValue({ id: 'product-1' } as never);
    vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.supplierProductOffering.create).mockResolvedValue({
      id: 'offering-1',
      productId: 'product-1',
      supplierId: SUPPLIER_PROFILE_ID,
      price: 4900,
      currency: 'SAR',
      availability: 'IN_STOCK',
      minOrderQty: 1,
    } as never);
    const offering = await catalogService.createOffering(
      {
        productId: 'product-1',
        supplierId: SUPPLIER_PROFILE_ID,
        price: 4900,
        currency: 'SAR',
        taxRate: 0,
        minOrderQty: 1,
        isAuthorized: false,
        availability: 'IN_STOCK',
      },
      SUPPLIER_USER_ID,
    );
    expect(offering.price).toBe(4900);

    // -- 5. Supplier receives an RFQ (buyer invited supplier; RFQ is OPEN)
    vi.mocked(prisma.rFQ.findMany).mockResolvedValue([
      {
        id: 'rfq-1',
        title: 'Procurement of structural steel',
        status: 'OPEN',
        referenceNumber: 'RFQ-2026-001',
        deadlineDate: new Date('2026-12-31'),
        createdAt: new Date('2026-07-01'),
        createdBy: { id: BUYER_ID, name: 'Buyer Co', companyName: 'BuyerCo' },
        items: [{ id: 'item-1' }],
        _count: { quotations: 1, suppliers: 1 },
      },
    ] as never);
    vi.mocked(prisma.rFQ.count).mockResolvedValue(1 as never);
    const openRfqs = await rfqService.list({ page: 1, limit: 20, status: 'OPEN' });
    expect(openRfqs.items.length).toBe(1);
    expect(openRfqs.items[0].status).toBe('OPEN');

    // -- 6. Supplier submits a quote
    vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({
      id: 'rfq-1', status: 'OPEN', organizationId: 'org-1', deadlineDate: new Date('2026-12-31'),
    } as never);
    vi.mocked(prisma.quotation.create).mockResolvedValue({
      id: 'quotation-1',
      rfqId: 'rfq-1',
      supplierId: SUPPLIER_USER_ID,
      organizationId: 'org-1',
      referenceNumber: 'QT-2026-001',
      status: 'DRAFT',
      totalAmount: 245000,
      taxAmount: 0,
      grandTotal: 245000,
      currency: 'SAR',
      createdAt: new Date(),
      updatedAt: new Date(),
      supplier: { id: SUPPLIER_USER_ID, name: 'SteelCo', companyName: 'SteelCo' },
      items: [{ id: 'qi-1' }],
    } as never);
    const quote = await quotationService.create(
      {
        rfqId: 'rfq-1',
        referenceNumber: 'QT-2026-001',
        currency: 'SAR',
        items: [{ rfqItemId: 'item-1', materialName: 'Steel Rebar 16mm', quantity: 50, unit: 'ton', unitPrice: 4900, totalPrice: 245000 }],
      },
      SUPPLIER_USER_ID,
    );
    expect(quote.grandTotal).toBe(245000);

    vi.mocked(prisma.quotation.findUnique).mockResolvedValue({
      id: 'quotation-1',
      status: 'DRAFT',
      supplierId: SUPPLIER_USER_ID,
      rfqId: 'rfq-1',
      items: [{ id: 'qi-1' }],
    } as never);
    vi.mocked(prisma.rFQ.findUniqueOrThrow).mockResolvedValue({ id: 'rfq-1', status: 'OPEN' } as never);
    vi.mocked(prisma.quotation.update).mockResolvedValue({
      id: 'quotation-1', status: 'SUBMITTED',
    } as never);
    const submitted = await quotationService.submit('quotation-1', SUPPLIER_USER_ID);
    expect(submitted.status).toBe('SUBMITTED');

    // Events fired along the journey
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining('SupplierNetwork') }),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining('ProductCatalog') }),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining('Quotation') }),
    );
  });

  it('supplier cannot create a duplicate profile', async () => {
    vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue({ id: SUPPLIER_PROFILE_ID } as never);

    const { SupplierNetworkErrors } = await import('@/modules/shared/errors/supplier-network.errors');
    await expect(
      supplierService.createProfile({ supplierType: ['MANUFACTURER'], companyName: 'SteelCo', vatRegistered: false }, SUPPLIER_USER_ID),
    ).rejects.toThrow(SupplierNetworkErrors.SUPPLIER_PROFILE_ALREADY_EXISTS);
  });
});
