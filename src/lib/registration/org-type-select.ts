/** Selected when user will specify organization type later in onboarding. */
export const ORG_TYPE_OTHER = "__OTHER__";

export function isOrgTypeOther(value: string | null | undefined): boolean {
  return value === ORG_TYPE_OTHER;
}

export function resolveCompanyTypeForApi(
  selectedId: string,
  options: Array<{ id: string; labelEn: string; labelAr: string }>,
  language: "ar" | "en" | "ur",
): string {
  if (!selectedId || selectedId === ORG_TYPE_OTHER) return "";
  const match = options.find((o) => o.id === selectedId);
  if (!match) return "";
  if (language === "en") return match.labelEn;
  return match.labelAr;
}
