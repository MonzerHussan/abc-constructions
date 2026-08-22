/** Matches homepage main header control typography (`HEADER_CONTROL` in page.tsx) */
export { HEADER_CONTROL } from "@/lib/header-control-styles";
export const AUTH_PANEL_HEADER_TITLE =
  "text-sm font-semibold text-surface-700 leading-tight";

export const AUTH_PANEL_HEADER_SUBTITLE =
  "text-xs text-surface-500 leading-tight";

export const AUTH_PANEL_LOGO_CLASS =
  "h-12 w-auto max-w-[160px] shrink-0 object-contain object-left";

/** Shared compact field styling for homepage auth + onboarding wizard */
export const AUTH_PANEL_INPUT_CLS =
  "w-full rounded-none border border-surface-300 px-2.5 py-2 text-xs focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 outline-none transition";

export const AUTH_PANEL_LABEL_CLS =
  "mb-0.5 block text-[11px] font-medium text-surface-700";

export const AUTH_PANEL_CHOICE_CLS = (selected: boolean) =>
  selected
    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
    : "border-surface-300 text-surface-700 hover:border-secondary-300 bg-white";
