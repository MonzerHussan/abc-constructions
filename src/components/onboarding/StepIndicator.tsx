"use client";

import { useLanguage } from "@/lib/LanguageContext";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((stepKey, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === current;
        const isCompleted = stepNumber < current;

        return (
          <div
            key={stepKey}
            className={`border px-2 py-1.5 text-center transition-colors ${
              isActive
                ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                : isCompleted
                  ? "border-success-500 bg-success-50 text-success-700"
                  : "border-surface-200 bg-white text-surface-500"
            }`}
          >
            <span className="block text-[10px] font-semibold leading-tight truncate">
              {t(stepKey as never)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default StepIndicator;
