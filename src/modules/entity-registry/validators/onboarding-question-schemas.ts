import { z } from 'zod';
import { OnboardingAnswerType } from '@/generated/prisma/client';

/**
 * Onboarding survey question bank — validators.
 * ISOLATED from the Research Survey engine (SurveyQuestion/SurveySection).
 * Answers are stored in full on Profile.surveyData (Json).
 */

export const onboardingAnswerTypeSchema = z.nativeEnum(OnboardingAnswerType);

export const onboardingOptionSchema = z.object({
  label: z.string().min(1, 'Option label is required'),
  value: z.string().optional(),
});

const CHOICE_TYPES = new Set<OnboardingAnswerType>([
  OnboardingAnswerType.SINGLE_CHOICE,
  OnboardingAnswerType.MULTIPLE_CHOICE,
  OnboardingAnswerType.DROPDOWN,
]);

export const createOnboardingQuestionSchema = z
  .object({
    category: z.string().min(1, 'category is required').max(100),
    questionText: z.string().min(1, 'questionText is required').max(1000),
    answerType: onboardingAnswerTypeSchema,
    options: z.array(onboardingOptionSchema).optional(),
    order: z.coerce.number().int().min(0).optional(),
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      if (CHOICE_TYPES.has(data.answerType)) {
        return Array.isArray(data.options) && data.options.length >= 2;
      }
      return true;
    },
    {
      message: `Questions of type ${[...CHOICE_TYPES].join(', ')} require at least 2 options`,
      path: ['options'],
    },
  );

export const updateOnboardingQuestionSchema = z
  .object({
    category: z.string().min(1).max(100).optional(),
    questionText: z.string().min(1).max(1000).optional(),
    answerType: onboardingAnswerTypeSchema.optional(),
    options: z.array(onboardingOptionSchema).optional(),
    order: z.coerce.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.answerType && CHOICE_TYPES.has(data.answerType) && data.options) {
        return data.options.length >= 2;
      }
      return true;
    },
    {
      message: `Questions of type ${[...CHOICE_TYPES].join(', ')} require at least 2 options`,
      path: ['options'],
    },
  );

export const onboardingQuestionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  category: z.string().optional(),
  answerType: onboardingAnswerTypeSchema.optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export const saveSurveyDataSchema = z.object({
  surveyData: z.record(z.string(), z.unknown()),
});

export type CreateOnboardingQuestionInput = z.infer<typeof createOnboardingQuestionSchema>;
export type UpdateOnboardingQuestionInput = z.infer<typeof updateOnboardingQuestionSchema>;
export type OnboardingQuestionListQuery = z.infer<typeof onboardingQuestionListQuerySchema>;
export type SaveSurveyDataInput = z.infer<typeof saveSurveyDataSchema>;
