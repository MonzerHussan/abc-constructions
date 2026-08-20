"use client";

import type { PublicSurveyQuestion } from "@/modules/onboarding-survey";
import {
  AUTH_PANEL_CHOICE_CLS,
  AUTH_PANEL_INPUT_CLS,
  AUTH_PANEL_LABEL_CLS,
} from "@/components/homepage/auth-panel-styles";

interface SurveyQuestionFieldProps {
  question: PublicSurveyQuestion;
  value: unknown;
  onChange: (code: string, value: unknown) => void;
  error?: string;
}

function isSelectedMulti(value: unknown, optionValue: string): boolean {
  return Array.isArray(value) && value.includes(optionValue);
}

export function SurveyQuestionField({ question, value, onChange, error }: SurveyQuestionFieldProps) {
  const readOnly = question.metadata?.readOnly === true;
  const disabled = readOnly;

  const label = (
    <label className={AUTH_PANEL_LABEL_CLS}>
      {question.questionText}
      {question.isRequired && !readOnly ? " *" : ""}
    </label>
  );

  if (
    question.answerType === "SINGLE_CHOICE" ||
    question.answerType === "DROPDOWN" ||
    question.answerType === "YES_NO" ||
    question.answerType === "LINEAR_SCALE"
  ) {
    return (
      <div className="space-y-1">
        {label}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {question.options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() => onChange(question.code, opt.value)}
                className={`px-2.5 py-2 text-[11px] text-start border rounded-none transition ${AUTH_PANEL_CHOICE_CLS(selected)} ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
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

  if (question.answerType === "MULTIPLE_CHOICE") {
    return (
      <div className="space-y-1">
        {label}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {question.options.map((opt) => {
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
                className={`px-2.5 py-2 text-[11px] text-start border rounded-none transition ${AUTH_PANEL_CHOICE_CLS(selected)}`}
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
          rows={4}
          disabled={disabled}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(question.code, e.target.value)}
          className={`${AUTH_PANEL_INPUT_CLS} resize-y min-h-[80px]`}
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
