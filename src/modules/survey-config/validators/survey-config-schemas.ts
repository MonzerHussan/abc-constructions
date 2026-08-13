import { z } from 'zod';

export const surveyConfigItemSchema = z.object({
  id: z.string().min(1),
  parentId: z.string().nullable(),
  type: z.enum(['category', 'subcategory']),
  labelEn: z.string().min(1),
  labelAr: z.string().min(1),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export const surveyConfigSchema = z.object({
  categories: z.array(surveyConfigItemSchema),
  subcategories: z.array(surveyConfigItemSchema),
  updatedAt: z.string().nullable(),
});

export const createSurveyConfigItemSchema = z.object({
  type: z.enum(['category', 'subcategory']),
  parentId: z.string().nullable().optional(),
  labelEn: z.string().min(1, 'labelEn is required'),
  labelAr: z.string().min(1, 'labelAr is required'),
});

export const updateSurveyConfigItemSchema = z.object({
  labelEn: z.string().min(1).optional(),
  labelAr: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const reorderSurveyConfigSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export type SurveyConfigItem = z.infer<typeof surveyConfigItemSchema>;
export type SurveyConfig = z.infer<typeof surveyConfigSchema>;
export type CreateSurveyConfigItemInput = z.infer<typeof createSurveyConfigItemSchema>;
export type UpdateSurveyConfigItemInput = z.infer<typeof updateSurveyConfigItemSchema>;
export type ReorderSurveyConfigInput = z.infer<typeof reorderSurveyConfigSchema>;
