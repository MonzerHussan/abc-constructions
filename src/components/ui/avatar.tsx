import { cn } from "@/lib/utils";
import Image from "next/image";
import { User } from "lucide-react";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function getInitials(name?: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-surface-200 text-surface-700 font-medium overflow-hidden",
        sizeClasses[size],
        className
      )}
      aria-label={alt || name || "Avatar"}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          fill
          className="object-cover"
          sizes={sizeClasses[size]}
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2 text-surface-500" />
      )}
    </div>
  );
}
