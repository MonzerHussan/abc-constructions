import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => (
    <label className={cn("inline-flex items-center gap-2 cursor-pointer", className)}>
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border border-surface-300 bg-surface-0 text-brand-500 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-danger-500 text-danger-500 focus:ring-danger-500"
        )}
        {...props}
      />
      {label && <span className="text-sm text-surface-700">{label}</span>}
    </label>
  )
);
Checkbox.displayName = "Checkbox";
