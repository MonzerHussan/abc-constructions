import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** True when a string is safe for next/image or video poster src. */
export function isUsableMediaUrl(url: string | null | undefined): boolean {
  if (url == null) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^[a-zA-Z]:[\\/]/.test(trimmed)) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

/** User-facing hint when a media URL cannot be loaded in the browser. */
export function getMediaUrlIssue(url: string | null | undefined): string | null {
  if (url == null || !url.trim()) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z]:[\\/]/.test(trimmed) || trimmed.includes(":\\")) {
    return "localPathNotAllowed";
  }
  if (!isUsableMediaUrl(trimmed)) return "invalidMediaUrl";
  return null;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffDay > 30) return formatDate(date);
  if (diffDay > 0) return `منذ ${diffDay} يوم`;
  if (diffHr > 0) return `منذ ${diffHr} ساعة`;
  if (diffMin > 0) return `منذ ${diffMin} دقيقة`;
  return "الآن";
}
