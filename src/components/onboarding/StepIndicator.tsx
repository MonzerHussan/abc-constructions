"use client";

import { useLanguage } from "@/lib/LanguageContext";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  const { t, dir } = useLanguage();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((stepKey, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === current;
          const isCompleted = stepNumber < current;
          const isLast = index === steps.length - 1;

          return (
            <div key={stepKey} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    isActive
                      ? "bg-amber-500 border-amber-500 text-white"
                      : isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white border-surface-300 text-surface-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center ${
                    isActive ? "text-amber-600" : "text-surface-500"
                  }`}
                >
                  {t(stepKey as never)}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    stepNumber < current ? "bg-amber-500" : "bg-surface-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
