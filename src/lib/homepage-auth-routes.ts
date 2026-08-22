/** @deprecated Use abcLogoSrc() / AbcLogo from @/lib/brand-logo */
export { LOGO_DARK_PILLARS as APPROVED_HOMEPAGE_LOGO } from "@/lib/brand-logo";

export const PLATFORM_HOME = "/projects/ABC";

export function platformLoginUrl(callbackUrl?: string): string {
  const params = new URLSearchParams({ login: "1" });
  if (callbackUrl) params.set("callbackUrl", callbackUrl);
  return `${PLATFORM_HOME}?${params.toString()}`;
}

export function platformRegisterUrl(categoryKey?: string): string {
  const params = new URLSearchParams({ register: "1" });
  if (categoryKey) params.set("category", categoryKey);
  return `${PLATFORM_HOME}?${params.toString()}`;
}
