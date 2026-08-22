"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import type { PlatformAccountType } from "@/lib/account-types";
import type { PublicSectionContent, PublicSurveySection } from "@/modules/onboarding-survey";
import { evaluateShowIf } from "@/lib/onboarding/survey-show-if";
import {
  fetchSurveyProgress,
  fetchSurveyTemplate,
  saveSurveyProgress,
} from "@/lib/onboarding/survey-client";
import { SurveyQuestionField } from "./SurveyQuestionField";
import type { OnboardingProfile } from "@/lib/onboarding/types";

interface DynamicSurveyStepProps {
  platformAccountType: PlatformAccountType;
  profile: OnboardingProfile;
  onSectionContentChange?: (content: PublicSectionContent | null) => void;
  onComplete: (answers: Record<string, unknown>) => void;
}

type ProfilePrefill = Pick<OnboardingProfile, "fullName" | "email" | "phone" | "city">;

function applyPrefill(
  answers: Record<string, unknown>,
  profile: ProfilePrefill,
  sections: PublicSurveySection[],
): Record<string, unknown> {
  const next = { ...answers };
  for (const section of sections) {
    for (const q of section.questions) {
      const key = q.metadata?.prefillKey as string | undefined;
      if (!key || next[q.code] !== undefined) continue;
      if (key === "fullName" && profile.fullName) next[q.code] = profile.fullName;
      if (key === "email" && profile.email) next[q.code] = profile.email;
      if (key === "phone" && profile.phone) next[q.code] = profile.phone;
      if (key === "city" && profile.city) next[q.code] = profile.city;
    }
  }
  return next;
}

function visibleSections(
  sections: PublicSurveySection[],
  answers: Record<string, unknown>,
  skipped: string[],
): PublicSurveySection[] {
  return sections.filter((s) => {
    if (skipped.includes(s.code)) return false;
    return evaluateShowIf(s.showIf, answers);
  });
}

function visibleQuestions(section: PublicSurveySection, answers: Record<string, unknown>) {
  return section.questions.filter((q) => evaluateShowIf(q.showIf, answers));
}

export function DynamicSurveyStep({
  platformAccountType,
  profile,
  onSectionContentChange,
  onComplete,
}: DynamicSurveyStepProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<PublicSurveySection[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [skippedSections, setSkippedSections] = useState<string[]>([]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const profilePrefill = useMemo(
    () => ({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
    }),
    [profile.fullName, profile.email, profile.phone, profile.city],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const [templateResult, progress] = await Promise.all([
        fetchSurveyTemplate(platformAccountType, language),
        fetchSurveyProgress(),
      ]);
      if (cancelled) return;
      if (!templateResult.ok) {
        setLoadError(templateResult.message);
        setLoading(false);
        return;
      }
      const template = templateResult.data;
      const mergedAnswers = applyPrefill(
        progress?.answers ?? {},
        profilePrefill,
        template.sections,
      );
      setSections(template.sections);
      setAnswers(mergedAnswers);
      setSkippedSections(progress?.skippedSections ?? []);
      setCompletedSections(progress?.completedSections ?? []);

      const visible = visibleSections(template.sections, mergedAnswers, progress?.skippedSections ?? []);
      const idx = progress?.currentSectionCode
        ? Math.max(0, visible.findIndex((s) => s.code === progress.currentSectionCode))
        : 0;
      setSectionIndex(idx >= 0 ? idx : 0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [platformAccountType, language, profilePrefill, reloadToken]);

  const visible = useMemo(
    () => visibleSections(sections, answers, skippedSections),
    [sections, answers, skippedSections],
  );

  const currentSection = visible[sectionIndex] ?? null;

  useEffect(() => {
    onSectionContentChange?.(currentSection?.content ?? null);
  }, [currentSection, onSectionContentChange]);

  const persist = useCallback(
    async (patch: {
      answers?: Record<string, unknown>;
      skippedSections?: string[];
      completedSections?: string[];
      currentSectionCode?: string | null;
      isComplete?: boolean;
    }) => {
      setSaving(true);
      try {
        await saveSurveyProgress({
          accountType: platformAccountType,
          answers: patch.answers ?? answers,
          skippedSections: patch.skippedSections ?? skippedSections,
          completedSections: patch.completedSections ?? completedSections,
          currentSectionCode: patch.currentSectionCode ?? currentSection?.code ?? null,
          isComplete: patch.isComplete ?? false,
        });
      } finally {
        setSaving(false);
      }
    },
    [platformAccountType, answers, skippedSections, completedSections, currentSection],
  );

  const handleAnswerChange = (code: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [code]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  };

  const validateCurrentSection = (): boolean => {
    if (!currentSection) return true;
    const qs = visibleQuestions(currentSection, answers);
    const newErrors: Record<string, string> = {};
    for (const q of qs) {
      if (!q.isRequired || q.metadata?.readOnly) continue;
      const val = answers[q.code];
      const empty =
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0);
      if (empty) newErrors[q.code] = t("obRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = async () => {
    if (!validateCurrentSection()) return;
    const done = currentSection
      ? Array.from(new Set([...completedSections, currentSection.code]))
      : completedSections;
    setCompletedSections(done);

    if (sectionIndex >= visible.length - 1) {
      await persist({
        answers,
        completedSections: done,
        currentSectionCode: currentSection?.code ?? null,
        isComplete: true,
      });
      onComplete(answers);
      return;
    }

    const nextIndex = sectionIndex + 1;
    const nextSection = visible[nextIndex];
    setSectionIndex(nextIndex);
    await persist({
      answers,
      completedSections: done,
      currentSectionCode: nextSection?.code ?? null,
    });
  };

  const goPrev = async () => {
    if (sectionIndex <= 0) return;
    const prevIndex = sectionIndex - 1;
    const prevSection = visible[prevIndex];
    setSectionIndex(prevIndex);
    await persist({ currentSectionCode: prevSection?.code ?? null });
  };

  const skipSection = async () => {
    if (!currentSection) return;
    const skipped = Array.from(new Set([...skippedSections, currentSection.code]));
    setSkippedSections(skipped);
    const nextVisible = visibleSections(sections, answers, skipped);

    if (nextVisible.length === 0 || sectionIndex >= nextVisible.length) {
      await persist({
        skippedSections: skipped,
        currentSectionCode: null,
        isComplete: true,
      });
      onComplete(answers);
      return;
    }

    const nextSection = nextVisible[sectionIndex];
    await persist({ skippedSections: skipped, currentSectionCode: nextSection?.code ?? null });
  };

  const saveAndExit = async () => {
    await persist({ currentSectionCode: currentSection?.code ?? null });
    router.push("/projects/ABC");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-secondary-500" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-4 space-y-2">
        <p className="text-xs text-red-600">{t("obSurveyLoadError")}</p>
        <p className="text-[10px] text-surface-500">{loadError}</p>
        <button
          type="button"
          onClick={() => setReloadToken((n) => n + 1)}
          className="px-3 py-1.5 text-[11px] font-medium border border-surface-300 text-surface-700 hover:bg-surface-50 rounded-none"
        >
          {t("obSurveyRetry")}
        </button>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <p className="text-xs text-surface-600 py-4">{t("obSurveyNoTemplate")}</p>
    );
  }

  const questions = visibleQuestions(currentSection, answers);
  const progressPct = visible.length > 0 ? Math.round(((sectionIndex + 1) / visible.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between text-[10px] text-surface-500 mb-1">
          <span>{t("obSurveySectionProgress")} {sectionIndex + 1}/{visible.length}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1 bg-surface-200">
          <div className="h-1 bg-secondary-500 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-primary-500">{currentSection.title}</h3>
        {currentSection.description && (
          <p className="text-[11px] text-surface-600 mt-0.5">{currentSection.description}</p>
        )}
      </div>

      <div className="space-y-2">
        {questions.map((q) => (
          <SurveyQuestionField
            key={q.id}
            question={q}
            value={answers[q.code]}
            onChange={handleAnswerChange}
            error={errors[q.code]}
            countryCode={profile.countryCode || profile.country}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-100">
        <button
          type="button"
          onClick={goPrev}
          disabled={sectionIndex === 0 || saving}
          className="px-3 py-1.5 text-[11px] font-medium border border-surface-300 text-surface-700 hover:bg-surface-50 disabled:opacity-50 rounded-none"
        >
          {t("obSurveyPrev")}
        </button>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={skipSection}
            disabled={saving}
            className="px-3 py-1.5 text-[11px] font-medium border border-surface-300 text-surface-600 hover:bg-surface-50 rounded-none"
          >
            {t("obSurveySkip")}
          </button>
          <button
            type="button"
            onClick={saveAndExit}
            disabled={saving}
            className="px-3 py-1.5 text-[11px] font-medium border border-secondary-300 text-secondary-700 hover:bg-secondary-50 rounded-none"
          >
            {t("obSurveySaveExit")}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={saving}
            className="px-4 py-1.5 text-[11px] font-bold text-white bg-secondary-500 hover:bg-secondary-600 disabled:opacity-70 rounded-none"
          >
            {sectionIndex >= visible.length - 1 ? t("obSubmit") : t("obSurveyNext")}
          </button>
        </div>
      </div>
    </div>
  );
}
