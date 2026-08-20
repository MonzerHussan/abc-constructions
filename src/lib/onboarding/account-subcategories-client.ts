import type { PlatformAccountType } from "@/lib/account-types";
import {
  getDefaultSubcategoryOptions,
  isBuiltInOtherSubcategory,
} from "@/lib/account-type-subcategory-defaults";

export interface AccountSubcategoryOption {
  id: string;
  labelEn: string;
  labelAr: string;
}

function normalizeOptions(items: AccountSubcategoryOption[]): AccountSubcategoryOption[] {
  return items.filter((item) => !isBuiltInOtherSubcategory(item.labelEn, item.labelAr));
}

export async function fetchAccountSubcategories(
  accountType: PlatformAccountType | string,
): Promise<AccountSubcategoryOption[]> {
  if (!accountType) return [];

  const fallback = getDefaultSubcategoryOptions(accountType as PlatformAccountType);

  try {
    const res = await fetch(
      `/api/v1/account-types/subcategories/public?accountType=${encodeURIComponent(accountType)}`,
      { cache: "no-store", credentials: "same-origin" },
    );
    if (!res.ok) return fallback;

    const json = (await res.json()) as {
      success?: boolean;
      data?: { items?: AccountSubcategoryOption[] };
    };
    const items = json.data?.items ?? [];
    const normalized = normalizeOptions(items);
    return normalized.length > 0 ? normalized : fallback;
  } catch {
    return fallback;
  }
}
