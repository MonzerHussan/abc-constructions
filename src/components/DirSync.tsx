"use client";

import { useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function DirSync() {
  const { dir, language } = useLanguage();

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return null;
}
