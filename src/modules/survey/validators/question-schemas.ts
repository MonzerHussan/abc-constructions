import { z } from 'zod';

export const QuestionTypeEnum = z.enum([
  'TEXT',
  'TEXTAREA',
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'DROPDOWN',
  'LINEAR_SCALE',
  'RATING',
  'YES_NO',
  'EMAIL',
  'PHONE',
  'DATE',
  'FILE_UPLOAD',
  'MATRIX',
  'NET_PROMOTER_SCORE',
  'CSAT',
  'CES',
  'RANKING',
  'SECTION_BREAK',
  'INFO_TEXT',
]);

const CHOICE_TYPES = new Set(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN', 'RANKING']);

export const questionOptionSchema = z.object({
  label: z.string().min(1, 'Option label is required'),
  labelEn: z.string().optional(),
  labelUr: z.string().optional(),
  value: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  hasCustom: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createSurveyQuestionSchema = z
  .object({
    title: z.string().min(1, 'Question title is required'),
    titleEn: z.string().optional(),
    titleAr: z.string().optional(),
    titleUr: z.string().optional(),
    description: z.string().optional(),
    questionType: QuestionTypeEnum,
    sectionId: z.string().min(1, 'Section ID is required'),
    sortOrder: z.coerce.number().int().optional(),
    isRequired: z.boolean().optional().default(true),
    hasOtherOption: z.boolean().optional().default(false),
    otherOptionLabel: z.string().optional(),
    randomizeOptions: z.boolean().optional().default(false),
    maxSelections: z.coerce.number().int().positive().nullable().optional(),
    minSelections: z.coerce.number().int().positive().nullable().optional(),
    lowLabel: z.string().optional(),
    highLabel: z.string().optional(),
    lowValue: z.coerce.number().int().nullable().optional(),
    highValue: z.coerce.number().int().nullable().optional(),
    stepValue: z.coerce.number().int().nullable().optional(),
    matrixRows: z.record(z.string(), z.unknown()).nullable().optional(),
    matrixColumns: z.record(z.string(), z.unknown()).nullable().optional(),
    validationRules: z.record(z.string(), z.unknown()).nullable().optional(),
    visibilityLogic: z.record(z.string(), z.unknown()).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    options: z.array(questionOptionSchema).optional(),
  })
  .refine(
    (data) => {
      if (CHOICE_TYPES.has(data.questionType)) {
        return Array.isArray(data.options) && data.options.length >= 2;
      }
      return true;
    },
    {
      message: `Questions of type ${[...CHOICE_TYPES].join(', ')} require at least 2 options`,
      path: ['options'],
    }
  );

export const updateSurveyQuestionSchema = z
  .object({
    title: z.string().min(1).optional(),
    titleEn: z.string().nullable().optional(),
    titleAr: z.string().nullable().optional(),
    titleUr: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    questionType: QuestionTypeEnum.optional(),
    sectionId: z.string().min(1).optional(),
    sortOrder: z.coerce.number().int().optional(),
    isRequired: z.boolean().optional(),
    hasOtherOption: z.boolean().optional(),
    otherOptionLabel: z.string().nullable().optional(),
    randomizeOptions: z.boolean().optional(),
    maxSelections: z.coerce.number().int().positive().nullable().optional(),
    minSelections: z.coerce.number().int().positive().nullable().optional(),
    lowLabel: z.string().nullable().optional(),
    highLabel: z.string().nullable().optional(),
    lowValue: z.coerce.number().int().nullable().optional(),
    highValue: z.coerce.number().int().nullable().optional(),
    stepValue: z.coerce.number().int().nullable().optional(),
    matrixRows: z.record(z.string(), z.unknown()).nullable().optional(),
    matrixColumns: z.record(z.string(), z.unknown()).nullable().optional(),
    validationRules: z.record(z.string(), z.unknown()).nullable().optional(),
    visibilityLogic: z.record(z.string(), z.unknown()).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    options: z.array(questionOptionSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.questionType && CHOICE_TYPES.has(data.questionType) && data.options) {
        return data.options.length >= 2;
      }
      return true;
    },
    {
      message: `Questions of type ${[...CHOICE_TYPES].join(', ')} require at least 2 options`,
      path: ['options'],
    }
  );

export const surveyQuestionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  surveyId: z.string().optional(),
  sectionId: z.string().optional(),
  questionType: QuestionTypeEnum.optional(),
});

export const reorderQuestionSchema = z
  .object({
    sortOrder: z.coerce.number().int().min(0).optional(),
    direction: z.enum(['up', 'down']).optional(),
  })
  .refine((data) => data.sortOrder !== undefined || data.direction !== undefined, {
    message: 'Provide either sortOrder or direction',
    path: ['sortOrder'],
  });

export type CreateSurveyQuestionInput = z.infer<typeof createSurveyQuestionSchema>;
export type UpdateSurveyQuestionInput = z.infer<typeof updateSurveyQuestionSchema>;
export type SurveyQuestionListQuery = z.infer<typeof surveyQuestionListQuerySchema>;
export type ReorderQuestionInput = z.infer<typeof reorderQuestionSchema>;
