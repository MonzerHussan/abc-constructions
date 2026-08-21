"use client";

import { useMemo } from "react";
import type { PublicSurveyQuestion } from "@/modules/onboarding-survey";
import {
  AUTH_PANEL_CHOICE_CLS,
  AUTH_PANEL_INPUT_CLS,
  AUTH_PANEL_LABEL_CLS,
} from "@/components/homepage/auth-panel-styles";
import {
  allowsMultipleAnswers,
  choiceGridClass,
  resolveQuestionPresentation,
} from "@/lib/onboarding/survey-option-sources";
import { useLanguage } from "@/lib/LanguageContext";
import { resolveCountryCode } from "@/lib/data/countries";

interface SurveyQuestionFieldProps {
  question: PublicSurveyQuestion;
  value: unknown;
  onChange: (code: string, value: unknown) => void;
  error?: string;
  countryCode?: string | null;
}

function isSelectedMulti(value: unknown, optionValue: string): boolean {
  return Array.isArray(value) && value.includes(optionValue);
}

export function SurveyQuestionField({
  question,
  value,
  onChange,
  error,
  countryCode,
}: SurveyQuestionFieldProps) {
  const { language } = useLanguage();
  const lang = language === "ur" ? "ur" : language === "en" ? "en" : "ar";
  const resolvedCountry = resolveCountryCode(countryCode ?? "AE");

  const { questionText, options } = useMemo(
    () =>
      resolveQuestionPresentation(
        question.questionText,
        question.options,
        question.metadata,
        resolvedCountry,
        lang,
      ),
    [
      question.questionText,
      question.options,
      question.metadata,
      resolvedCountry,
      lang,
    ],
  );

  const readOnly = question.metadata?.readOnly === true;
  const disabled = readOnly;
  const multi = allowsMultipleAnswers(
    question.answerType,
    questionText,
    question.metadata,
  );
  const gridClass = choiceGridClass(
    options,
    question.answerType,
    question.metadata,
  );
  const compactBtn =
    question.answerType === "LINEAR_SCALE" || question.metadata?.compactNumeric
      ? "px-1.5 py-1.5 text-center whitespace-nowrap tabular-nums"
      : "px-2 py-1.5 text-start whitespace-normal leading-snug line-clamp-2";

  const label = (
    <label className={AUTH_PANEL_LABEL_CLS}>
      {questionText}
      {question.isRequired && !readOnly ? " *" : ""}
    </label>
  );

  if (
    question.answerType === "SINGLE_CHOICE" ||
    question.answerType === "DROPDOWN" ||
    question.answerType === "YES_NO" ||
    question.answerType === "LINEAR_SCALE" ||
    question.answerType === "MULTIPLE_CHOICE"
  ) {
    if (multi) {
      return (
        <div className="space-y-1">
          {label}
          <div className={gridClass}>
            {options.map((opt) => {
              const selected = isSelectedMulti(value, opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const current = Array.isArray(value) ? [...value] : [];
                    const next = selected
                      ? current.filter((v) => v !== opt.value)
                      : [...current, opt.value];
                    onChange(question.code, next);
                  }}
                  className={`text-[11px] border rounded-none transition ${compactBtn} ${AUTH_PANEL_CHOICE_CLS(selected)} ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {error && <p className="text-[10px] text-danger-600">{error}</p>}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {label}
        <div className={gridClass}>
          {options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() => onChange(question.code, opt.value)}
                className={`text-[11px] border rounded-none transition ${compactBtn} ${AUTH_PANEL_CHOICE_CLS(selected)} ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {error && <p className="text-[10px] text-danger-600">{error}</p>}
      </div>
    );
  }

  if (question.answerType === "TEXTAREA") {
    return (
      <div className="space-y-1">
        {label}
        <textarea
          rows={3}
          disabled={disabled}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(question.code, e.target.value)}
          className={`${AUTH_PANEL_INPUT_CLS} resize-y min-h-[72px]`}
        />
        {error && <p className="text-[10px] text-danger-600">{error}</p>}
      </div>
    );
  }

  const inputType =
    question.answerType === "EMAIL"
      ? "email"
      : question.answerType === "PHONE"
        ? "tel"
        : question.answerType === "DATE"
          ? "date"
          : "text";

  return (
    <div className="space-y-1">
      {label}
      <input
        type={inputType}
        disabled={disabled}
        readOnly={readOnly}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(question.code, e.target.value)}
        className={`${AUTH_PANEL_INPUT_CLS} ${readOnly ? "bg-surface-50" : ""}`}
      />
      {error && <p className="text-[10px] text-danger-600">{error}</p>}
    </div>
  );
}
