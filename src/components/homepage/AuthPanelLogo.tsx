import { LOGO_DARK_PILLARS } from "@/lib/brand-logo";
import { AUTH_PANEL_LOGO_CLASS } from "./auth-panel-styles";

type AuthPanelLogoProps = {
  alt: string;
};

/** Dark-pillar logo for white auth panels — native img so PNG always renders. */
export default function AuthPanelLogo({ alt }: AuthPanelLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_DARK_PILLARS} alt={alt} className={AUTH_PANEL_LOGO_CLASS} />
  );
}
