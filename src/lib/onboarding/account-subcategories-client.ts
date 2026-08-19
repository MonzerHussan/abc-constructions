import type { PlatformAccountType } from "@/lib/account-types";

export interface AccountSubcategoryItem {
  id: string;
  accountType: PlatformAccountType;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
}

export async function fetchAccountSubcategories(
  accountType: PlatformAccountType,
): Promise<AccountSubcategoryItem[]> {
  try {
    const res = await fetch(
      `/api/v1/account-types/subcategories/public?accountType=${encodeURIComponent(accountType)}`,
      { credentials: "same-origin", cache: "no-store" },
    );
    if (!res.ok) return [];
    const envelope = (await res.json()) as {
      success?: boolean;
      data?: { items?: AccountSubcategoryItem[] };
    };
    return envelope.data?.items ?? [];
  } catch {
    return [];
  }
}
