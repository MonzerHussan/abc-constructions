import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 text-surface-400">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-medium text-surface-900">{title}</h3>
      {description && <p className="mb-6 max-w-md text-sm text-surface-500">{description}</p>}
      {action}
    </div>
  );
}
