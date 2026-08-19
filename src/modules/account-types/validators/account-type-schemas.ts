import { z } from 'zod';
import { PLATFORM_ACCOUNT_TYPE_IDS } from '@/lib/account-types';

export const platformAccountTypeSchema = z.enum(
  PLATFORM_ACCOUNT_TYPE_IDS as [
    (typeof PLATFORM_ACCOUNT_TYPE_IDS)[number],
    ...(typeof PLATFORM_ACCOUNT_TYPE_IDS)[number][],
  ],
);

export const createAccountSubcategorySchema = z.object({
  accountType: platformAccountTypeSchema,
  labelEn: z.string().min(1).max(200),
  labelAr: z.string().min(1).max(200),
  isActive: z.boolean().optional(),
});

export const updateAccountSubcategorySchema = z.object({
  labelEn: z.string().min(1).max(200).optional(),
  labelAr: z.string().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const reorderAccountSubcategoriesSchema = z.object({
  accountType: platformAccountTypeSchema,
  orderedIds: z.array(z.string().min(1)),
});

export type CreateAccountSubcategoryInput = z.infer<typeof createAccountSubcategorySchema>;
export type UpdateAccountSubcategoryInput = z.infer<typeof updateAccountSubcategorySchema>;
