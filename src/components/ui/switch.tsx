import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, ...props }, ref) => (
    <label className={cn("inline-flex items-center gap-3 cursor-pointer", className)}>
      <div className="relative inline-flex h-6 w-11 items-center">
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-surface-300 transition-colors",
            "peer-checked:bg-brand-500 peer-focus:ring-2 peer-focus:ring-brand-500 peer-focus:ring-offset-2",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
          )}
        />
        <span
          className={cn(
            "absolute start-1 h-4 w-4 rounded-full bg-white transition-transform",
            "peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5"
          )}
        />
      </div>
      {label && <span className="text-sm text-surface-700">{label}</span>}
    </label>
  )
);
Switch.displayName = "Switch";
