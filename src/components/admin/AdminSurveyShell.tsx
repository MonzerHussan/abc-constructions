"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import AuthPanelLogo from "@/components/homepage/AuthPanelLogo";
import {
  AUTH_PANEL_HEADER_TITLE,
  AUTH_PANEL_HEADER_SUBTITLE,
} from "@/components/homepage/auth-panel-styles";

/** Survey-style primary action button (matches DynamicSurveyStep buttons). */
export const ADMIN_ACTION_BTN =
  "inline-flex items-center justify-center gap-1.5 bg-secondary-500 text-white px-3 py-1.5 text-[11px] font-bold hover:bg-secondary-600 rounded-none disabled:opacity-50";

/** Survey-style secondary action button. */
export const ADMIN_ACTION_BTN_SECONDARY =
  "inline-flex items-center justify-center gap-1.5 bg-white text-surface-700 border border-surface-300 px-3 py-1.5 text-[11px] font-bold hover:bg-surface-50 rounded-none";

interface AdminSurveyShellProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  actions?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

/**
 * Admin content wrapper styled to match the Onboarding / DynamicSurveyStep
 * visual chrome (white card, shadow-2xl, rounded-none, compact auth-panel
 * typography). The admin sidebar layout stays unchanged — only the main
 * content area is wrapped.
 */
export default function AdminSurveyShell({
  title,
  subtitle,
  showLogo,
  actions,
  loading,
  children,
}: AdminSurveyShellProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full overflow-hidden bg-white border border-surface-200 shadow-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-surface-100 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {showLogo && <AuthPanelLogo alt="ABC" />}
          <div className="min-w-0">
            <p className={AUTH_PANEL_HEADER_TITLE}>{title}</p>
            {subtitle ? (
              <p className={`${AUTH_PANEL_HEADER_SUBTITLE} truncate`}>{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
            {actions}
          </div>
        ) : null}
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-secondary-500 animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}