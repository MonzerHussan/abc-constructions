import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { SupplierVerificationStateMachine } from '@/modules/supplier-network/workflow/state-machines/SupplierVerificationStateMachine';
import type { VerificationStatus } from '@/modules/supplier-network/workflow/state-machines/SupplierVerificationStateMachine';
import type {
  CreateProfileInput, UpdateProfileInput, ProfileListQuery,
  UploadDocumentInput, VerifyDocumentInput,
  AddCertificationInput, UpsertBankingInput,
  AddCapabilityInput, UpdateCapabilityInput,
  CreateRelationshipInput, UpdateRelationshipInput, RelationshipListQuery,
  CreateRatingInput,
} from '@/modules/supplier-network/validators/supplier-network-schemas';

function mapProfile(p: Record<string, unknown>) {
  return p;
}

export class SupplierNetworkService {
  // ==================== Profiles ====================

  async listProfiles(query: ProfileListQuery) {
    const { page, limit, verificationLevel, supplierType, countryId, cityId, isActive, search } = query;
    const where: Record<string, unknown> = {};
    if (verificationLevel) where.verificationLevel = verificationLevel;
    if (supplierType) where.supplierType = { has: supplierType };
    if (countryId) where.countryId = countryId;
    if (cityId) where.cityId = cityId;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) where.companyName = { contains: search, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.supplierProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supplierProfile.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findProfileById(id: string) {
    const profile = await prisma.supplierProfile.findUnique({
      where: { id },
      include: {
        branches: true,
        documents: true,
        certifications: true,
        bankingInfo: true,
        coverageAreas: true,
        capabilities: { include: { coverageAreas: true } },
        projectRefs: true,
        ratings: true,
      },
    });
    if (!profile) throw new Error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND);
    return profile;
  }

  async createProfile(input: CreateProfileInput, userId: string) {
    const existing = await prisma.supplierProfile.findUnique({ where: { userId } });
    if (existing) throw new Error(SupplierNetworkErrors.SUPPLIER_PROFILE_ALREADY_EXISTS);

    const profile = await prisma.supplierProfile.create({
      data: {
        userId,
        organizationId: input.organizationId ?? null,
        supplierType: input.supplierType,
        companyName: input.companyName,
        companyNameAr: input.companyNameAr ?? null,
        companyNameUr: input.companyNameUr ?? null,
        commercialLicense: input.commercialLicense ?? null,
        licenseNumber: input.licenseNumber ?? null,
        taxNumber: input.taxNumber ?? null,
        vatRegistered: input.vatRegistered ?? false,
        yearEstablished: input.yearEstablished ?? null,
        employeeCount: input.employeeCount ?? null,
        country: input.country ?? null,
        emirate: input.emirate ?? null,
        city: input.city ?? null,
        countryId: input.countryId ?? null,
        cityId: input.cityId ?? null,
        location: input.location ?? null,
        website: input.website ?? null,
        about: input.about ?? null,
        aboutAr: input.aboutAr ?? null,
        aboutUr: input.aboutUr ?? null,
        logo: input.logo ?? null,
        coverImage: input.coverImage ?? null,
        minOrderValue: input.minOrderValue ?? null,
        maxDailyCapacity: input.maxDailyCapacity ?? null,
        leadTimeDays: input.leadTimeDays ?? null,
        transportTypes: input.transportTypes ?? [],
        countriesServed: input.countriesServed ?? [],
        workingHours: input.workingHours ?? null,
        hasWarehouses: input.hasWarehouses ?? false,
        hasBranches: input.hasBranches ?? false,
      },
    });

    logger.info(`Supplier profile ${profile.id} created for user ${userId}`);

    await eventBus.publish({
      name: buildEventName('SupplierNetwork', 'Profile', 'Created'),
      version: 1,
      payload: { profileId: profile.id, userId, companyName: profile.companyName },
      metadata: { timestamp: new Date(), correlationId: `sp_${profile.id}_${Date.now()}`, source: 'supplier-network', userId },
    });

    return profile;
  }

  async updateProfile(id: string, input: UpdateProfileInput) {
    const existing = await prisma.supplierProfile.findUnique({ where: { id } });
    if (!existing) throw new Error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND);

    const profile = await prisma.supplierProfile.update({
      where: { id },
      data: {
        ...(input.supplierType !== undefined && { supplierType: input.supplierType }),
        ...(input.companyName !== undefined && { companyName: input.companyName }),
        ...(input.companyNameAr !== undefined && { companyNameAr: input.companyNameAr }),
        ...(input.companyNameUr !== undefined && { companyNameUr: input.companyNameUr }),
        ...(input.commercialLicense !== undefined && { commercialLicense: input.commercialLicense }),
        ...(input.licenseNumber !== undefined && { licenseNumber: input.licenseNumber }),
        ...(input.taxNumber !== undefined && { taxNumber: input.taxNumber }),
        ...(input.vatRegistered !== undefined && { vatRegistered: input.vatRegistered }),
        ...(input.yearEstablished !== undefined && { yearEstablished: input.yearEstablished }),
        ...(input.employeeCount !== undefined && { employeeCount: input.employeeCount }),
        ...(input.country !== undefined && { country: input.country }),
        ...(input.emirate !== undefined && { emirate: input.emirate }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.countryId !== undefined && { countryId: input.countryId }),
        ...(input.cityId !== undefined && { cityId: input.cityId }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.website !== undefined && { website: input.website }),
        ...(input.about !== undefined && { about: input.about }),
        ...(input.aboutAr !== undefined && { aboutAr: input.aboutAr }),
        ...(input.aboutUr !== undefined && { aboutUr: input.aboutUr }),
        ...(input.logo !== undefined && { logo: input.logo }),
        ...(input.coverImage !== undefined && { coverImage: input.coverImage }),
        ...(input.minOrderValue !== undefined && { minOrderValue: input.minOrderValue }),
        ...(input.maxDailyCapacity !== undefined && { maxDailyCapacity: input.maxDailyCapacity }),
        ...(input.leadTimeDays !== undefined && { leadTimeDays: input.leadTimeDays }),
        ...(input.transportTypes !== undefined && { transportTypes: input.transportTypes }),
        ...(input.countriesServed !== undefined && { countriesServed: input.countriesServed }),
        ...(input.workingHours !== undefined && { workingHours: input.workingHours }),
        ...(input.hasWarehouses !== undefined && { hasWarehouses: input.hasWarehouses }),
        ...(input.hasBranches !== undefined && { hasBranches: input.hasBranches }),
      },
    });

    logger.info(`Supplier profile ${id} updated`);

    await eventBus.publish({
      name: buildEventName('SupplierNetwork', 'Profile', 'Updated'),
      version: 1,
      payload: { profileId: id },
      metadata: { timestamp: new Date(), correlationId: `sp_${id}_${Date.now()}`, source: 'supplier-network' },
    });

    return profile;
  }

  // ==================== Verification ====================

  async transitionVerification(id: string, action: string, userId: string) {
    const existing = await prisma.supplierProfile.findUnique({ where: { id } });
    if (!existing) throw new Error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND);

    const machine = new SupplierVerificationStateMachine(existing.verificationLevel);
    const newStatus = machine.transition(action) as VerificationStatus;

    await prisma.supplierProfile.update({
      where: { id },
      data: { verificationLevel: newStatus },
    });

    const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
    logger.info(`Supplier profile ${id} verification ${actionLabel} -> ${newStatus}`);

    await eventBus.publish({
      name: buildEventName('SupplierNetwork', 'Profile', 'Verified'),
      version: 1,
      payload: { profileId: id, previousLevel: existing.verificationLevel, newLevel: newStatus, action },
      metadata: { timestamp: new Date(), correlationId: `sv_${id}_${Date.now()}`, source: 'supplier-network', userId },
    });

    return { id, previousLevel: existing.verificationLevel, currentLevel: newStatus };
  }

  // ==================== Documents ====================

  async uploadDocument(input: UploadDocumentInput, userId: string) {
    const profile = await prisma.supplierProfile.findUnique({ where: { id: input.supplierId } });
    if (!profile) throw new Error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND);

    const doc = await prisma.supplierDocument.create({
      data: {
        supplierId: input.supplierId,
        docType: input.docType,
        title: input.title,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType ?? null,
        issuedAt: input.issuedAt ? new Date(input.issuedAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        notes: input.notes ?? null,
      },
    });

    logger.info(`Document ${doc.id} uploaded for supplier ${input.supplierId}`);

    await eventBus.publish({
      name: buildEventName('SupplierNetwork', 'Document', 'Uploaded'),
      version: 1,
      payload: { documentId: doc.id, supplierId: input.supplierId, docType: input.docType },
      metadata: { timestamp: new Date(), correlationId: `sd_${doc.id}_${Date.now()}`, source: 'supplier-network', userId },
    });

    return doc;
  }

  async verifyDocument(id: string, input: VerifyDocumentInput, userId: string) {
    const doc = await prisma.supplierDocument.findUnique({ where: { id } });
    if (!doc) throw new Error(SupplierNetworkErrors.SUPPLIER_DOCUMENT_NOT_FOUND);

    const updated = await prisma.supplierDocument.update({
      where: { id },
      data: {
        status: input.status,
        notes: input.notes ?? doc.notes,
        verifiedAt: new Date(),
        verifiedById: userId,
      },
    });

    const eventName = input.status === 'VERIFIED' ? 'Verified' : 'Rejected';
    await eventBus.publish({
      name: buildEventName('SupplierNetwork', 'Document', eventName),
      version: 1,
      payload: { documentId: id, supplierId: doc.supplierId, status: input.status },
      metadata: { timestamp: new Date(), correlationId: `sd_${id}_${Date.now()}`, source: 'supplier-network', userId },
    });

    return updated;
  }

  async deleteDocument(id: string) {
    const doc = await prisma.supplierDocument.findUnique({ where: { id } });
    if (!doc) throw new Error(SupplierNetworkErrors.SUPPLIER_DOCUMENT_NOT_FOUND);
    await prisma.supplierDocument.delete({ where: { id } });
  }

  // ==================== Certifications ====================

  async addCertification(input: AddCertificationInput) {
    const profile = await prisma.supplierProfile.findUnique({ where: { id: input.supplierId } });
    if (!profile) throw new Error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND);

    const cert = await prisma.supplierCertification.create({
      data: {
        supplierId: input.supplierId,
        name: input.name,
        issuingBody: input.issuingBody,
        certificateNumber: input.certificateNumber ?? null,
        issueDate: new Date(input.issueDate),
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        fileUrl: input.fileUrl ?? null,
      },
    });

    await eventBus.publish({
      name: buildEventName('SupplierNetwork', 'Certification', 'Added'),
      version: 1,
      payload: { certificationId: cert.id, supplierId: input.supplierId, name: input.name },
      metadata: { timestamp: new Date(), correlationId: `sc_${cert.id}_${Date.now()}`, source: 'supplier-network' },
    });

    return cert;
  }

  // ==================== Banking ====================

  async upsertBanking(input: UpsertBankingInput) {
    const profile = await prisma.supplierProfile.findUnique({ where: { id: input.supplierId } });
    if (!profile) throw new Error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND);

    const banking = await prisma.supplierBanking.upsert({
      where: { supplierId: input.supplierId },
      create: {
        supplierId: input.supplierId,
        bankName: input.bankName,
        accountName: input.accountName,
        accountNumber: input.accountNumber,
        iban: input.iban,
        swiftCode: input.swiftCode ?? null,
        currency: input.currency ?? 'SAR',
      },
      update: {
        bankName: input.bankName,
        accountName: input.accountName,
        accountNumber: input.accountNumber,
        iban: input.iban,
        swiftCode: input.swiftCode ?? null,
        currency: input.currency ?? 'SAR',
      },
    });

    return banking;
  }

  // ==================== Capabilities ====================

  async addCapability(input: AddCapabilityInput) {
    const profile = await prisma.supplierProfile.findUnique({ where: { id: input.supplierId } });
    if (!profile) throw new Error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND);

    const existing = await prisma.supplierCapability.findUnique({
      where: { supplierId_category: { supplierId: input.supplierId, category: input.category } },
    });
    if (existing) throw new Error(SupplierNetworkErrors.SUPPLIER_CAPABILITY_ALREADY_EXISTS);

    const capability = await prisma.supplierCapability.create({
      data: {
        supplierId: input.supplierId,
        category: input.category,
        level: input.level ?? 'SECONDARY',
        capacityMonthly: input.capacityMonthly ?? null,
        maxProjectValue: input.maxProjectValue ?? null,
        currency: input.currency ?? 'SAR',
        notes: input.notes ?? null,
      },
    });

    await eventBus.publish({
      name: buildEventName('SupplierNetwork', 'Capability', 'Added'),
      version: 1,
      payload: { capabilityId: capability.id, supplierId: input.supplierId, category: input.category },
      metadata: { timestamp: new Date(), correlationId: `scap_${capability.id}_${Date.now()}`, source: 'supplier-network' },
    });

    return capability;
  }

  async updateCapability(id: string, input: UpdateCapabilityInput) {
    const existing = await prisma.supplierCapability.findUnique({ where: { id } });
    if (!existing) throw new Error(SupplierNetworkErrors.SUPPLIER_CAPABILITY_NOT_FOUND);

    const capability = await prisma.supplierCapability.update({
      where: { id },
      data: {
        ...(input.level !== undefined && { level: input.level }),
        ...(input.capacityMonthly !== undefined && { capacityMonthly: input.capacityMonthly }),
        ...(input.maxProjectValue !== undefined && { maxProjectValue: input.maxProjectValue }),
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });

    return capability;
  }

  // ==================== Relationships ====================

  async listRelationships(query: RelationshipListQuery) {
    const { page, limit, buyerOrgId, supplierProfileId, relationshipType, status } = query;
    const where: Record<string, unknown> = {};
    if (buyerOrgId) where.buyerOrgId = buyerOrgId;
    if (supplierProfileId) where.supplierId = supplierProfileId;
    if (relationshipType) where.relationshipType = relationshipType;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.supplierRelationship.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supplierRelationship.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async createRelationship(input: CreateRelationshipInput, userId: string) {
    const existing = await prisma.supplierRelationship.findUnique({
      where: { buyerOrgId_supplierId: { buyerOrgId: input.buyerOrgId, supplierId: input.supplierProfileId } },
    });
    if (existing) throw new Error(SupplierNetworkErrors.SUPPLIER_RELATIONSHIP_ALREADY_EXISTS);

    const relationship = await prisma.supplierRelationship.create({
      data: {
        buyerOrgId: input.buyerOrgId,
        supplierId: input.supplierProfileId,
        relationshipType: input.relationshipType ?? 'APPROVED',
        creditLimit: input.creditLimit ?? null,
        currency: input.currency ?? 'SAR',
        paymentTerms: input.paymentTerms ?? null,
        contractRef: input.contractRef ?? null,
        contractStartDate: input.contractStartDate ? new Date(input.contractStartDate) : null,
        contractEndDate: input.contractEndDate ? new Date(input.contractEndDate) : null,
        notes: input.notes ?? null,
        createdById: userId,
      },
    });

    await eventBus.publish({
      name: buildEventName('SupplierNetwork', 'Relationship', 'Created'),
      version: 1,
      payload: { relationshipId: relationship.id, buyerOrgId: input.buyerOrgId, supplierId: input.supplierProfileId },
      metadata: { timestamp: new Date(), correlationId: `sr_${relationship.id}_${Date.now()}`, source: 'supplier-network', userId },
    });

    return relationship;
  }

  async updateRelationship(id: string, input: UpdateRelationshipInput) {
    const existing = await prisma.supplierRelationship.findUnique({ where: { id } });
    if (!existing) throw new Error(SupplierNetworkErrors.SUPPLIER_RELATIONSHIP_NOT_FOUND);

    const relationship = await prisma.supplierRelationship.update({
      where: { id },
      data: {
        ...(input.relationshipType !== undefined && { relationshipType: input.relationshipType }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.creditLimit !== undefined && { creditLimit: input.creditLimit }),
        ...(input.paymentTerms !== undefined && { paymentTerms: input.paymentTerms }),
        ...(input.contractRef !== undefined && { contractRef: input.contractRef }),
        ...(input.contractEndDate !== undefined && { contractEndDate: input.contractEndDate ? new Date(input.contractEndDate) : null }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });

    return relationship;
  }

  async deleteRelationship(id: string) {
    const existing = await prisma.supplierRelationship.findUnique({ where: { id } });
    if (!existing) throw new Error(SupplierNetworkErrors.SUPPLIER_RELATIONSHIP_NOT_FOUND);
    await prisma.supplierRelationship.delete({ where: { id } });
  }

  // ==================== Ratings ====================

  async createRating(input: CreateRatingInput, userId: string) {
    const profile = await prisma.supplierProfile.findUnique({ where: { id: input.supplierProfileId } });
    if (!profile) throw new Error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND);

    const rating = await prisma.supplierRating.create({
      data: {
        supplierId: userId,
        supplierProfileId: input.supplierProfileId,
        organizationId: input.organizationId,
        purchaseOrderId: input.purchaseOrderId ?? null,
        ratedById: userId,
        rating: input.rating,
        quality: input.quality ?? null,
        delivery: input.delivery ?? null,
        communication: input.communication ?? null,
        price: input.price ?? null,
        comment: input.comment ?? null,
      },
    });

    const ratings = await prisma.supplierRating.aggregate({
      where: { supplierProfileId: input.supplierProfileId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.supplierProfile.update({
      where: { id: input.supplierProfileId },
      data: {
        avgRating: ratings._avg.rating ?? 0,
        totalRatings: ratings._count,
      },
    });

    await eventBus.publish({
      name: buildEventName('SupplierNetwork', 'Rating', 'Created'),
      version: 1,
      payload: { ratingId: rating.id, supplierProfileId: input.supplierProfileId, rating: input.rating },
      metadata: { timestamp: new Date(), correlationId: `srat_${rating.id}_${Date.now()}`, source: 'supplier-network', userId },
    });

    return rating;
  }
}
