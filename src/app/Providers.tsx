"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/LanguageContext";
import DirSync from "@/components/DirSync";

export default function Providers({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: string;
}) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <DirSync />
      {children}
    </LanguageProvider>
  );
}
