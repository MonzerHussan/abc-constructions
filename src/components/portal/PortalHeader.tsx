"use client";

import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { AUTH_PANEL_HEADER_SUBTITLE } from "@/components/homepage/auth-panel-styles";
import type { PortalOrganizationView } from "@/modules/portal/types/portal-home.types";

interface PortalHeaderProps {
  title: string;
  welcome: string;
  organization: PortalOrganizationView | null;
}

export default function PortalHeader({ title, welcome, organization }: PortalHeaderProps) {
  const { t } = useLanguage();
  const isVerified = !!organization?.verificationLevel && organization.verificationLevel !== "0";
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={AUTH_PANEL_HEADER_SUBTITLE}>{title}</p>
        <h1 className="text-lg font-bold text-surface-900 leading-tight">{welcome}</h1>
        {organization && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-surface-500">
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-success-600">
                <BadgeCheck className="w-4 h-4" />
                {organization.name}
              </span>
            ) : (
              organization.name
            )}
          </p>
        )}
      </div>
    </div>
  );
}