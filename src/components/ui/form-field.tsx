import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  helper,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-surface-700">
          {label}
          {required && <span className="text-danger-500 ms-1">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-sm text-danger-600">{error}</p>
      ) : helper ? (
        <p className="text-sm text-surface-500">{helper}</p>
      ) : null}
    </div>
  );
}

export function FormFieldset({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("space-y-4", className)}>
      {title && (
        <legend className="text-base font-semibold text-surface-900">{title}</legend>
      )}
      {description && <p className="text-sm text-surface-500">{description}</p>}
      {children}
    </fieldset>
  );
}
