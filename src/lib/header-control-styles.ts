/** Shared typography/padding for ABC homepage + onboarding header controls */
export const HEADER_CONTROL =
  "text-sm font-semibold px-2.5 py-1.5 whitespace-nowrap transition-colors";

export const HEADER_CONTROL_BUTTON =
  "inline-flex items-center gap-1.5 rounded-none";

export const HEADER_LOGOUT_BUTTON =
  `${HEADER_CONTROL_BUTTON} ${HEADER_CONTROL} text-surface-700 hover:text-danger-600`;

export const HEADER_LANGUAGE_BUTTON =
  `${HEADER_CONTROL_BUTTON} ${HEADER_CONTROL} text-surface-600 hover:text-surface-900 hover:bg-surface-100 border border-surface-200`;
