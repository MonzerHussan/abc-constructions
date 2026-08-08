import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { SurveyErrors } from '@/modules/shared/errors/survey.errors';
import type {
  CreateSurveyQuestionInput,
  UpdateSurveyQuestionInput,
  SurveyQuestionListQuery,
  ReorderQuestionInput,
} from '@/modules/survey/validators/question-schemas';

const CHOICE_TYPES = new Set(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN', 'RANKING']);

const QUESTION_INCLUDE = {
  options: { orderBy: { sortOrder: 'asc' as const } },
  section: { select: { id: true, title: true, surveyId: true, survey: { select: { id: true, title: true } } } },
} as const;

function mapOptions(options?: CreateSurveyQuestionInput['options']): Prisma.QuestionOptionCreateManyInput[] {
  return (options ?? []).map((o, index) => ({
    label: o.label,
    labelEn: o.labelEn ?? null,
    labelUr: o.labelUr ?? null,
    value: o.value ?? o.label,
    sortOrder: o.sortOrder ?? index,
    hasCustom: o.hasCustom ?? false,
    metadata: o.metadata,
  }));
}

function validateChoiceOptions(questionType: string, options?: unknown[] | null) {
  if (CHOICE_TYPES.has(questionType) && (!options || options.length < 2)) {
    throw new Error(SurveyErrors.SURVEY_QUESTION_VALIDATION);
  }
}

export class SurveyQuestionService {
  async list(query: SurveyQuestionListQuery) {
    const { page, limit, surveyId, sectionId, questionType } = query;

    const where: Prisma.SurveyQuestionWhereInput = {};
    if (sectionId) where.sectionId = sectionId;
    if (questionType) where.questionType = questionType as never;
    if (surveyId) {
      where.section = { is: { surveyId } };
    }

    const [items, total] = await Promise.all([
      prisma.surveyQuestion.findMany({
        where,
        include: QUESTION_INCLUDE,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.surveyQuestion.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async get(id: string) {
    const question = await prisma.surveyQuestion.findUnique({
      where: { id },
      include: QUESTION_INCLUDE,
    });
    if (!question) throw new Error(SurveyErrors.SURVEY_QUESTION_NOT_FOUND);
    return question;
  }

  async create(input: CreateSurveyQuestionInput) {
    const section = await prisma.surveySection.findUnique({ where: { id: input.sectionId } });
    if (!section) throw new Error(SurveyErrors.SURVEY_SECTION_NOT_FOUND);

    validateChoiceOptions(input.questionType, input.options);

    let sortOrder = input.sortOrder;
    if (sortOrder === undefined) {
      const last = await prisma.surveyQuestion.findFirst({
        where: { sectionId: input.sectionId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      sortOrder = (last?.sortOrder ?? -1) + 1;
    }

    const question = await prisma.surveyQuestion.create({
      data: {
        title: input.title,
        titleEn: input.titleEn ?? null,
        titleAr: input.titleAr ?? null,
        titleUr: input.titleUr ?? null,
        description: input.description ?? null,
        questionType: input.questionType as never,
        section: { connect: { id: input.sectionId } },
        sortOrder,
        isRequired: input.isRequired ?? true,
        hasOtherOption: input.hasOtherOption ?? false,
        otherOptionLabel: input.otherOptionLabel ?? null,
        randomizeOptions: input.randomizeOptions ?? false,
        maxSelections: input.maxSelections ?? null,
        minSelections: input.minSelections ?? null,
        lowLabel: input.lowLabel ?? null,
        highLabel: input.highLabel ?? null,
        lowValue: input.lowValue ?? null,
        highValue: input.highValue ?? null,
        stepValue: input.stepValue ?? null,
        matrixRows: input.matrixRows ?? undefined,
        matrixColumns: input.matrixColumns ?? undefined,
        validationRules: input.validationRules ?? undefined,
        visibilityLogic: input.visibilityLogic ?? undefined,
        metadata: input.metadata ?? undefined,
        options: input.options ? { create: mapOptions(input.options) } : undefined,
      },
      include: QUESTION_INCLUDE,
    });

    return question;
  }

  async update(id: string, input: UpdateSurveyQuestionInput) {
    const existing = await prisma.surveyQuestion.findUnique({ where: { id } });
    if (!existing) throw new Error(SurveyErrors.SURVEY_QUESTION_NOT_FOUND);

    if (input.sectionId && input.sectionId !== existing.sectionId) {
      const section = await prisma.surveySection.findUnique({ where: { id: input.sectionId } });
      if (!section) throw new Error(SurveyErrors.SURVEY_SECTION_NOT_FOUND);
    }

    const questionType = input.questionType ?? existing.questionType;
    if (input.options) {
      validateChoiceOptions(questionType, input.options);
    }

    const data: Prisma.SurveyQuestionUpdateInput = {
      title: input.title,
      titleEn: input.titleEn,
      titleAr: input.titleAr,
      titleUr: input.titleUr,
      description: input.description,
      questionType: input.questionType as never,
      section: input.sectionId ? { connect: { id: input.sectionId } } : undefined,
      sortOrder: input.sortOrder,
      isRequired: input.isRequired,
      hasOtherOption: input.hasOtherOption,
      otherOptionLabel: input.otherOptionLabel,
      randomizeOptions: input.randomizeOptions,
      maxSelections: input.maxSelections,
      minSelections: input.minSelections,
      lowLabel: input.lowLabel,
      highLabel: input.highLabel,
      lowValue: input.lowValue,
      highValue: input.highValue,
      stepValue: input.stepValue,
      matrixRows: input.matrixRows,
      matrixColumns: input.matrixColumns,
      validationRules: input.validationRules,
      visibilityLogic: input.visibilityLogic,
      metadata: input.metadata,
    };

    const question = await prisma.$transaction(async (tx) => {
      if (input.options) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
        await tx.questionOption.createMany({
          data: mapOptions(input.options).map((o) => ({ ...o, questionId: id })),
        });
      }
      return tx.surveyQuestion.update({
        where: { id },
        data,
        include: QUESTION_INCLUDE,
      });
    });

    return question;
  }

  async delete(id: string) {
    const existing = await prisma.surveyQuestion.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new Error(SurveyErrors.SURVEY_QUESTION_NOT_FOUND);

    try {
      await prisma.$transaction([
        prisma.questionOption.deleteMany({ where: { questionId: id } }),
        prisma.surveyQuestion.delete({ where: { id } }),
      ]);
    } catch (err) {
      if (err instanceof Error && 'code' in err && (err as { code?: string }).code === 'P2003') {
        throw new Error(SurveyErrors.SURVEY_QUESTION_HAS_RESPONSES);
      }
      throw err;
    }

    return { id };
  }

  async reorder(id: string, input: ReorderQuestionInput) {
    const question = await prisma.surveyQuestion.findUnique({
      where: { id },
      select: { id: true, sectionId: true },
    });
    if (!question) throw new Error(SurveyErrors.SURVEY_QUESTION_NOT_FOUND);

    const siblings = await prisma.surveyQuestion.findMany({
      where: { sectionId: question.sectionId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    });

    const ids = siblings.map((s) => s.id);
    const currentIndex = ids.indexOf(id);
    if (currentIndex === -1) throw new Error(SurveyErrors.SURVEY_QUESTION_NOT_FOUND);

    let targetIndex = currentIndex;

    if (input.direction === 'up') {
      targetIndex = Math.max(0, currentIndex - 1);
    } else if (input.direction === 'down') {
      targetIndex = Math.min(ids.length - 1, currentIndex + 1);
    } else if (input.sortOrder !== undefined) {
      targetIndex = Math.min(Math.max(0, input.sortOrder), ids.length - 1);
    }

    ids.splice(currentIndex, 1);
    ids.splice(targetIndex, 0, id);

    await prisma.$transaction(
      ids.map((qid, index) =>
        prisma.surveyQuestion.update({
          where: { id: qid },
          data: { sortOrder: index },
        })
      )
    );

    return this.get(id);
  }
}

export const surveyQuestionService = new SurveyQuestionService();
