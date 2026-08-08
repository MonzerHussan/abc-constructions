import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { SurveyErrors } from '@/modules/shared/errors/survey.errors';
import { surveyCategories } from '@/lib/data/survey-categories';
import type {
  SurveyConfig,
  SurveyConfigItem,
  CreateSurveyConfigItemInput,
  UpdateSurveyConfigItemInput,
  ReorderSurveyConfigInput,
} from '@/modules/survey-config/validators/survey-config-schemas';

const ITEM_ORDER: Prisma.SurveyConfigItemOrderByWithRelationInput = { sortOrder: 'asc' };

function toWire(item: {
  id: string;
  parentId: string | null;
  type: string;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
  isActive: boolean;
}): SurveyConfigItem {
  return {
    id: item.id,
    parentId: item.parentId,
    type: item.type === 'subcategory' ? 'subcategory' : 'category',
    labelEn: item.labelEn,
    labelAr: item.labelAr,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export class SurveyConfigService {
  /** يزرع الإعداد الافتراضي (12 فئة / 133 فئة فرعية) عند أول استخدام. */
  private async ensureSeeded(): Promise<void> {
    const count = await prisma.surveyConfigItem.count();
    if (count > 0) return;

    const categoryRows: Prisma.SurveyConfigItemCreateManyInput[] = [];
    const subcategoryRows: Prisma.SurveyConfigItemCreateManyInput[] = [];

    surveyCategories.forEach((cat, catIndex) => {
      categoryRows.push({
        id: cat.id,
        parentId: null,
        type: 'category',
        labelEn: cat.labelEn,
        labelAr: cat.labelAr,
        sortOrder: catIndex,
        isActive: true,
      });
      cat.subcategories.forEach((sub, subIndex) => {
        subcategoryRows.push({
          id: sub.id,
          parentId: cat.id,
          type: 'subcategory',
          labelEn: sub.labelEn,
          labelAr: sub.labelAr,
          sortOrder: subIndex,
          isActive: true,
        });
      });
    });

    await prisma.$transaction([
      prisma.surveyConfigItem.createMany({ data: categoryRows }),
      prisma.surveyConfigItem.createMany({ data: subcategoryRows }),
    ]);
  }

  async getConfig(): Promise<SurveyConfig> {
    await this.ensureSeeded();
    const items = await prisma.surveyConfigItem.findMany({ orderBy: ITEM_ORDER });

    const categories = items.filter((i) => i.type === 'category').map(toWire);
    const subcategories = items.filter((i) => i.type === 'subcategory').map(toWire);
    const latest = items.reduce<Date | null>(
      (max, i) => (i.updatedAt > (max ?? 0) ? i.updatedAt : max),
      null,
    );

    return {
      categories,
      subcategories,
      updatedAt: latest ? latest.toISOString() : null,
    };
  }

  async saveConfig(config: SurveyConfig): Promise<void> {
    await this.ensureSeeded();

    const categoryRows: Prisma.SurveyConfigItemCreateManyInput[] = config.categories.map((c, i) => ({
      id: c.id,
      parentId: null,
      type: 'category',
      labelEn: c.labelEn,
      labelAr: c.labelAr,
      sortOrder: i,
      isActive: c.isActive,
    }));
    const subcategoryRows: Prisma.SurveyConfigItemCreateManyInput[] = config.subcategories.map((s) => ({
      id: s.id,
      parentId: s.parentId,
      type: 'subcategory',
      labelEn: s.labelEn,
      labelAr: s.labelAr,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    }));

    await prisma.$transaction([
      prisma.surveyConfigItem.deleteMany(),
      prisma.surveyConfigItem.createMany({ data: categoryRows }),
      prisma.surveyConfigItem.createMany({ data: subcategoryRows }),
    ]);
  }

  async createItem(input: CreateSurveyConfigItemInput): Promise<SurveyConfigItem> {
    await this.ensureSeeded();
    const type = input.type;

    if (type === 'subcategory') {
      if (!input.parentId) throw new Error(SurveyErrors.SURVEY_SECTION_NOT_FOUND);
      const parent = await prisma.surveyConfigItem.findUnique({ where: { id: input.parentId } });
      if (!parent || parent.type !== 'category') {
        throw new Error(SurveyErrors.SURVEY_SECTION_NOT_FOUND);
      }
    }

    const last = await prisma.surveyConfigItem.findFirst({
      where: type === 'category' ? { type: 'category' } : { type: 'subcategory', parentId: input.parentId ?? undefined },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    let id = slugify(input.labelEn) || `item-${Date.now()}`;
    let suffix = 2;
    while (await prisma.surveyConfigItem.findUnique({ where: { id } })) {
      id = `${slugify(input.labelEn)}-${suffix}`;
      suffix += 1;
    }

    const item = await prisma.surveyConfigItem.create({
      data: {
        id,
        parentId: type === 'subcategory' ? input.parentId ?? null : null,
        type,
        labelEn: input.labelEn,
        labelAr: input.labelAr,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        isActive: true,
      },
    });

    return toWire(item);
  }

  async updateItem(id: string, input: UpdateSurveyConfigItemInput): Promise<SurveyConfigItem> {
    await this.ensureSeeded();
    const existing = await prisma.surveyConfigItem.findUnique({ where: { id } });
    if (!existing) throw new Error(SurveyErrors.SURVEY_QUESTION_NOT_FOUND);

    const item = await prisma.surveyConfigItem.update({
      where: { id },
      data: {
        labelEn: input.labelEn,
        labelAr: input.labelAr,
        isActive: input.isActive,
      },
    });

    return toWire(item);
  }

  async reorder(input: ReorderSurveyConfigInput): Promise<void> {
    await this.ensureSeeded();
    const { orderedIds } = input;

    const items = await prisma.surveyConfigItem.findMany({
      where: { id: { in: orderedIds } },
      select: { id: true },
    });
    if (items.length !== orderedIds.length) {
      throw new Error(SurveyErrors.SURVEY_QUESTION_NOT_FOUND);
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.surveyConfigItem.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  async getAnalytics() {
    await this.ensureSeeded();

    const [accountUsers, profiles, items] = await Promise.all([
      prisma.account.groupBy({ by: ['userId'] }),
      prisma.profile.findMany({
        select: { relevantCategories: true, subcategories: true },
      }),
      prisma.surveyConfigItem.findMany({ orderBy: ITEM_ORDER }),
    ]);

    const categoryLabel = new Map<string, { labelEn: string; labelAr: string }>();
    const subcategoryLabel = new Map<string, { labelEn: string; labelAr: string }>();
    for (const i of items) {
      const labels = { labelEn: i.labelEn, labelAr: i.labelAr };
      if (i.type === 'category') categoryLabel.set(i.id, labels);
      else subcategoryLabel.set(i.id, labels);
    }

    const completedProfiles = profiles.filter((p) => p.subcategories.length > 0);
    const totalUsers = accountUsers.length;
    const totalCompleted = completedProfiles.length;
    const completionRate =
      totalUsers > 0 ? Math.round((totalCompleted / totalUsers) * 100) : 0;

    const categoryCount = new Map<string, number>();
    let totalCategorySelections = 0;
    for (const p of completedProfiles) {
      for (const catId of p.relevantCategories) {
        categoryCount.set(catId, (categoryCount.get(catId) ?? 0) + 1);
        totalCategorySelections += 1;
      }
    }

    const categoryDistribution = Array.from(categoryCount.entries())
      .map(([id, count]) => ({
        id,
        labelAr: categoryLabel.get(id)?.labelAr ?? id,
        labelEn: categoryLabel.get(id)?.labelEn ?? id,
        count,
        percentage:
          totalCompleted > 0
            ? Math.round((count / totalCompleted) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const subcategoryCount = new Map<string, number>();
    let totalSubcategoriesSelected = 0;
    for (const p of profiles) {
      for (const subId of p.subcategories) {
        subcategoryCount.set(subId, (subcategoryCount.get(subId) ?? 0) + 1);
        totalSubcategoriesSelected += 1;
      }
    }

    const topSubcategories = Array.from(subcategoryCount.entries())
      .map(([id, count]) => ({
        id,
        labelAr: subcategoryLabel.get(id)?.labelAr ?? id,
        labelEn: subcategoryLabel.get(id)?.labelEn ?? id,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalUsers,
      totalCompleted,
      completionRate,
      averageCategoriesPerUser:
        totalCompleted > 0
          ? Math.round((totalCategorySelections / totalCompleted) * 10) / 10
          : 0,
      totalSubcategoriesSelected,
      categoryDistribution,
      topSubcategories,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const surveyConfigService = new SurveyConfigService();
