/**
 * Brand logos — the variant is defined by the **3D pillar color**, not the ABC letters:
 * - White pillars → dark UI backgrounds (e.g. homepage left column)
 * - Dark pillars  → light UI backgrounds (e.g. login/register, favicon)
 */
/** White 3D pillars — use on dark UI backgrounds */
export const LOGO_WHITE_PILLARS = "/logo-left.png";

/** Dark 3D pillars — use on light/white UI backgrounds */
export const LOGO_DARK_PILLARS = "/logo-white.png";

/** @deprecated Use LOGO_DARK_PILLARS */
export const LOGO_ON_LIGHT_BG = LOGO_DARK_PILLARS;

/** @deprecated Use LOGO_WHITE_PILLARS */
export const LOGO_ON_DARK_BG = LOGO_WHITE_PILLARS;

export type LogoBackground = "light" | "dark";

/** @param background `"dark"` = dark UI → white pillars; `"light"` = light UI → dark pillars */
export function abcLogoSrc(background: LogoBackground): string {
  return background === "dark" ? LOGO_WHITE_PILLARS : LOGO_DARK_PILLARS;
}
