import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Briefcase,
  FileText,
  HardHat,
  Landmark,
  Store,
  Truck,
  User,
  Wrench,
} from "lucide-react";
import type { TranslationKey } from "@/lib/translations";

/** UserRole values linked to the 9 platform account types (client-safe). */
export type PlatformLinkedUserRole =
  | "OWNER"
  | "CONSULTANT"
  | "CONTRACTOR"
  | "SUBCONTRACTOR"
  | "SUPPLIER"
  | "TRADER"
  | "INDIVIDUAL"
  | "COMPANY"
  | "ENTITY";

/** Fixed 9 platform account types (matches DB enum PlatformAccountType). */
export const PlatformAccountType = {
  OWNER: "OWNER",
  CONSULTANT: "CONSULTANT",
  CONTRACTOR: "CONTRACTOR",
  SUBCONTRACTOR: "SUBCONTRACTOR",
  SUPPLIER: "SUPPLIER",
  TRADER: "TRADER",
  INDIVIDUAL: "INDIVIDUAL",
  COMPANY: "COMPANY",
  ENTITY: "ENTITY",
} as const;

export type PlatformAccountType =
  (typeof PlatformAccountType)[keyof typeof PlatformAccountType];

export interface PlatformAccountTypeDefinition {
  id: PlatformAccountType;
  role: PlatformLinkedUserRole;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  icon: LucideIcon;
}

export const PLATFORM_ACCOUNT_TYPES: PlatformAccountTypeDefinition[] = [
  {
    id: PlatformAccountType.OWNER,
    role: "OWNER",
    labelKey: "accountCategoryOwner",
    descKey: "obTypeOwnerDesc",
    icon: Landmark,
  },
  {
    id: PlatformAccountType.CONSULTANT,
    role: "CONSULTANT",
    labelKey: "accountCategoryConsultant",
    descKey: "obTypeConsultantDesc",
    icon: FileText,
  },
  {
    id: PlatformAccountType.CONTRACTOR,
    role: "CONTRACTOR",
    labelKey: "accountCategoryContractor",
    descKey: "obTypeContractorDesc",
    icon: HardHat,
  },
  {
    id: PlatformAccountType.SUBCONTRACTOR,
    role: "SUBCONTRACTOR",
    labelKey: "accountCategorySubcontractor",
    descKey: "obTypeSubcontractorDesc",
    icon: Wrench,
  },
  {
    id: PlatformAccountType.SUPPLIER,
    role: "SUPPLIER",
    labelKey: "accountCategorySupplier",
    descKey: "obTypeSupplierDesc",
    icon: Truck,
  },
  {
    id: PlatformAccountType.TRADER,
    role: "TRADER",
    labelKey: "accountCategoryTrader",
    descKey: "obTypeTraderDesc",
    icon: Store,
  },
  {
    id: PlatformAccountType.INDIVIDUAL,
    role: "INDIVIDUAL",
    labelKey: "accountCategoryIndividual",
    descKey: "obTypeIndividualDesc",
    icon: User,
  },
  {
    id: PlatformAccountType.COMPANY,
    role: "COMPANY",
    labelKey: "accountCategoryCompany",
    descKey: "obTypeCompanyDesc",
    icon: Building2,
  },
  {
    id: PlatformAccountType.ENTITY,
    role: "ENTITY",
    labelKey: "accountCategoryEntity",
    descKey: "obTypeEntityDesc",
    icon: Briefcase,
  },
];

export const PLATFORM_ACCOUNT_TYPE_IDS = PLATFORM_ACCOUNT_TYPES.map((t) => t.id);

export function isPlatformAccountType(value: string): value is PlatformAccountType {
  return (PLATFORM_ACCOUNT_TYPE_IDS as string[]).includes(value);
}

export function platformAccountTypeToUserRole(accountType: PlatformAccountType): PlatformLinkedUserRole {
  const found = PLATFORM_ACCOUNT_TYPES.find((t) => t.id === accountType);
  if (!found) throw new Error(`Unknown platform account type: ${accountType}`);
  return found.role;
}

export function userRoleToPlatformAccountType(role: PlatformLinkedUserRole | string): PlatformAccountType | null {
  return PLATFORM_ACCOUNT_TYPES.find((t) => t.role === role)?.id ?? null;
}

export const LABEL_KEY_TO_PLATFORM_ACCOUNT_TYPE: Record<string, PlatformAccountType> = {
  accountCategoryOwner: PlatformAccountType.OWNER,
  accountCategoryConsultant: PlatformAccountType.CONSULTANT,
  accountCategoryContractor: PlatformAccountType.CONTRACTOR,
  accountCategorySubcontractor: PlatformAccountType.SUBCONTRACTOR,
  accountCategorySupplier: PlatformAccountType.SUPPLIER,
  accountCategoryTrader: PlatformAccountType.TRADER,
  accountCategoryIndividual: PlatformAccountType.INDIVIDUAL,
  accountCategoryCompany: PlatformAccountType.COMPANY,
  accountCategoryEntity: PlatformAccountType.ENTITY,
};

export function requiresOrganizationName(accountType: PlatformAccountType): boolean {
  return accountType !== PlatformAccountType.INDIVIDUAL;
}
