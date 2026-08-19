import { prisma } from '@/lib/prisma';
import type { PlatformAccountType } from '@/lib/account-types';
import { PLATFORM_ACCOUNT_TYPE_IDS } from '@/lib/account-types';
import { PlatformAccountType as PlatformAccountTypeEnum } from '@/generated/prisma/enums';
import type {
  CreateAccountSubcategoryInput,
  UpdateAccountSubcategoryInput,
} from '@/modules/account-types/validators/account-type-schemas';

const DEFAULT_SUBCATEGORIES: Record<
  PlatformAccountType,
  Array<{ labelEn: string; labelAr: string }>
> = {
  [PlatformAccountTypeEnum.OWNER]: [
    { labelEn: 'Residential Developer', labelAr: 'مطور سكني' },
    { labelEn: 'Commercial Developer', labelAr: 'مطور تجاري' },
  ],
  [PlatformAccountTypeEnum.CONSULTANT]: [
    { labelEn: 'Engineering Office', labelAr: 'مكتب هندسي' },
    { labelEn: 'Design Office', labelAr: 'مكتب تصميم' },
  ],
  [PlatformAccountTypeEnum.CONTRACTOR]: [
    { labelEn: 'General Contracting', labelAr: 'مقاول عام' },
    { labelEn: 'Infrastructure', labelAr: 'بنية تحتية' },
  ],
  [PlatformAccountTypeEnum.SUBCONTRACTOR]: [
    { labelEn: 'Building', labelAr: 'بناء' },
    { labelEn: 'Workshops', labelAr: 'ورش' },
    { labelEn: 'Interior & Decor', labelAr: 'ديكور' },
    { labelEn: 'Landscape', labelAr: 'لاندسكيب' },
    { labelEn: 'Electrical', labelAr: 'كهرباء' },
    { labelEn: 'Freelancer', labelAr: 'فريلانسر' },
    { labelEn: 'Other', labelAr: 'أخرى' },
  ],
  [PlatformAccountTypeEnum.SUPPLIER]: [
    { labelEn: 'Building Materials', labelAr: 'مواد بناء' },
    { labelEn: 'Equipment', labelAr: 'معدات' },
  ],
  [PlatformAccountTypeEnum.TRADER]: [
    { labelEn: 'Wholesale', labelAr: 'جملة' },
    { labelEn: 'Retail', labelAr: 'تجزئة' },
  ],
  [PlatformAccountTypeEnum.INDIVIDUAL]: [
    { labelEn: 'Job Seeker', labelAr: 'باحث عن عمل' },
    { labelEn: 'Trainee', labelAr: 'متدرب' },
    { labelEn: 'Independent Professional', labelAr: 'مهني مستقل' },
  ],
  [PlatformAccountTypeEnum.COMPANY]: [
    { labelEn: 'Maintenance', labelAr: 'صيانة' },
    { labelEn: 'Services', labelAr: 'خدمات' },
    { labelEn: 'Sector Related', labelAr: 'مرتبطة بالقطاع' },
  ],
  [PlatformAccountTypeEnum.ENTITY]: [
    { labelEn: 'Government', labelAr: 'حكومية' },
    { labelEn: 'Financial', labelAr: 'مالية' },
    { labelEn: 'Regulatory', labelAr: 'رقابية' },
    { labelEn: 'Regulatory Body', labelAr: 'تنظيمية' },
  ],
};

export class AccountTypeSubcategoryService {
  private async ensureSeededForType(accountType: PlatformAccountType): Promise<void> {
    const count = await prisma.accountTypeSubcategory.count({ where: { accountType } });
    if (count > 0) return;

    const defaults = DEFAULT_SUBCATEGORIES[accountType] ?? [];
    if (defaults.length === 0) return;

    await prisma.accountTypeSubcategory.createMany({
      data: defaults.map((item, index) => ({
        accountType,
        labelEn: item.labelEn,
        labelAr: item.labelAr,
        sortOrder: index,
        isActive: true,
      })),
    });
  }

  async ensureAllSeeded(): Promise<void> {
    await Promise.all(
      PLATFORM_ACCOUNT_TYPE_IDS.map((type) => this.ensureSeededForType(type)),
    );
  }

  async listPublic(accountType: PlatformAccountType) {
    await this.ensureSeededForType(accountType);
    return prisma.accountTypeSubcategory.findMany({
      where: { accountType, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        accountType: true,
        labelEn: true,
        labelAr: true,
        sortOrder: true,
      },
    });
  }

  async listAdmin(accountType?: PlatformAccountType) {
    if (accountType) {
      await this.ensureSeededForType(accountType);
    } else {
      await this.ensureAllSeeded();
    }

    return prisma.accountTypeSubcategory.findMany({
      where: accountType ? { accountType } : undefined,
      orderBy: [{ accountType: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async create(input: CreateAccountSubcategoryInput) {
    const last = await prisma.accountTypeSubcategory.findFirst({
      where: { accountType: input.accountType },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return prisma.accountTypeSubcategory.create({
      data: {
        accountType: input.accountType,
        labelEn: input.labelEn,
        labelAr: input.labelAr,
        isActive: input.isActive ?? true,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
  }

  async update(id: string, input: UpdateAccountSubcategoryInput) {
    return prisma.accountTypeSubcategory.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string) {
    return prisma.accountTypeSubcategory.delete({ where: { id } });
  }

  async reorder(accountType: PlatformAccountType, orderedIds: string[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.accountTypeSubcategory.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
    return this.listAdmin(accountType);
  }
}

export const accountTypeSubcategoryService = new AccountTypeSubcategoryService();
