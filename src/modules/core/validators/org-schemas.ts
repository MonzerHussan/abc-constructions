import { z } from 'zod';
import { OrganizationType } from '@/generated/prisma/client';

export const createOrgSchema = z.object({
  name: z.string().min(2).max(200),
  nameAr: z.string().optional(),
  type: z.nativeEnum(OrganizationType),
  website: z.string().url().optional(),
  about: z.string().max(1000).optional(),
});

export const updateOrgSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  nameAr: z.string().optional(),
  website: z.string().url().optional(),
  about: z.string().max(1000).optional(),
  location: z.string().optional(),
  logo: z.string().optional(),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
