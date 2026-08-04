import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  base: "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variant: {
    primary: "bg-brand-500 text-white hover:bg-brand-600",
    secondary: "bg-navy-800 text-white hover:bg-navy-900",
    outline: "border border-surface-300 text-surface-700 hover:bg-surface-50",
    ghost: "text-surface-700 hover:bg-surface-100",
    danger: "bg-danger-500 text-white hover:bg-danger-600",
    success: "bg-success-500 text-white hover:bg-success-600",
    link: "text-brand-600 underline-offset-4 hover:underline",
  },
  size: {
    xs: "h-7 px-2.5 text-xs",
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-base",
    icon: "h-10 w-10",
  },
} as const;

export type ButtonVariant = keyof typeof buttonVariants.variant;
export type ButtonSize = keyof typeof buttonVariants.size;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      loading,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isIconOnly = size === "icon";
    const isLoading = loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          buttonVariants.base,
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          isIconOnly && "p-0",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {!isIconOnly && (loadingText ?? children)}
          </>
        ) : (
          <>
            {leftIcon}
            {!isIconOnly && children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
