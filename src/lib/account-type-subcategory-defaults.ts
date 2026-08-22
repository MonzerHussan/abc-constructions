import { PlatformAccountType, type PlatformAccountType as PlatformAccountTypeId } from "@/lib/account-types";

export interface SubcategoryDefault {
  labelEn: string;
  labelAr: string;
}

export const ACCOUNT_TYPE_SUBCATEGORY_DEFAULTS: Record<
  PlatformAccountTypeId,
  SubcategoryDefault[]
> = {
  [PlatformAccountType.OWNER]: [
    { labelEn: "Residential Developer", labelAr: "مطور سكني" },
    { labelEn: "Commercial Developer", labelAr: "مطور تجاري" },
  ],
  [PlatformAccountType.CONSULTANT]: [
    { labelEn: "Engineering Office", labelAr: "مكتب هندسي" },
    { labelEn: "Design Office", labelAr: "مكتب تصميم" },
  ],
  [PlatformAccountType.CONTRACTOR]: [
    { labelEn: "General Contracting", labelAr: "مقاول عام" },
    { labelEn: "Infrastructure", labelAr: "بنية تحتية" },
  ],
  [PlatformAccountType.SUBCONTRACTOR]: [
    { labelEn: "Building", labelAr: "بناء" },
    { labelEn: "Workshops", labelAr: "ورش" },
    { labelEn: "Interior & Decor", labelAr: "ديكور" },
    { labelEn: "Landscape", labelAr: "لاندسكيب" },
    { labelEn: "Electrical", labelAr: "كهرباء" },
    { labelEn: "Freelancer", labelAr: "فريلانسر" },
  ],
  [PlatformAccountType.SUPPLIER]: [
    { labelEn: "Building Materials", labelAr: "مواد بناء" },
    { labelEn: "Equipment", labelAr: "معدات" },
  ],
  [PlatformAccountType.TRADER]: [
    { labelEn: "Wholesale", labelAr: "جملة" },
    { labelEn: "Retail", labelAr: "تجزئة" },
  ],
  [PlatformAccountType.INDIVIDUAL]: [
    { labelEn: "Job Seeker", labelAr: "باحث عن عمل" },
    { labelEn: "Trainee", labelAr: "متدرب" },
    { labelEn: "Independent Professional", labelAr: "مهني مستقل" },
  ],
  [PlatformAccountType.COMPANY]: [
    { labelEn: "Maintenance", labelAr: "صيانة" },
    { labelEn: "Services", labelAr: "خدمات" },
    { labelEn: "Sector Related", labelAr: "مرتبطة بالقطاع" },
  ],
  [PlatformAccountType.ENTITY]: [
    { labelEn: "Government", labelAr: "حكومية" },
    { labelEn: "Financial", labelAr: "مالية" },
    { labelEn: "Regulatory", labelAr: "رقابية" },
    { labelEn: "Regulatory Body", labelAr: "تنظيمية" },
  ],
};

export function isBuiltInOtherSubcategory(labelEn: string, labelAr: string): boolean {
  return labelEn.trim().toLowerCase() === "other" || labelAr.trim() === "أخرى";
}

/** Client-safe fallback when public API is unavailable (registration as guest). */
export function getDefaultSubcategoryOptions(accountType: PlatformAccountTypeId) {
  return (ACCOUNT_TYPE_SUBCATEGORY_DEFAULTS[accountType] ?? [])
    .filter((item) => !isBuiltInOtherSubcategory(item.labelEn, item.labelAr))
    .map((item, index) => ({
      id: `default-${accountType}-${index}`,
      labelEn: item.labelEn,
      labelAr: item.labelAr,
    }));
}
