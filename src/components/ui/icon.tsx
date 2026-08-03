"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Icons that are visually directional and should be mirrored in RTL.
 * Only horizontal direction icons are flipped; vertical / neutral icons are not.
 */
const RTL_AUTO_FLIP = new Set<string>([
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeftRight",
  "ArrowBigLeft",
  "ArrowBigRight",
  "ArrowBigLeftDash",
  "ArrowBigRightDash",
  "ArrowLeftCircle",
  "ArrowRightCircle",
  "ArrowLeftFromLine",
  "ArrowRightFromLine",
  "ArrowLeftSquare",
  "ArrowRightSquare",
  "ArrowLeftToLine",
  "ArrowRightToLine",
  "ArrowUpLeft",
  "ArrowUpRight",
  "ArrowDownLeft",
  "ArrowDownRight",
  "ChevronLeft",
  "ChevronRight",
  "ChevronLeftRight",
  "ChevronFirst",
  "ChevronLast",
  "ChevronsLeft",
  "ChevronsRight",
  "ChevronLeftCircle",
  "ChevronRightCircle",
  "ChevronLeftSquare",
  "ChevronRightSquare",
  "CircleArrowLeft",
  "CircleArrowRight",
  "CircleChevronLeft",
  "CircleChevronRight",
  "SquareArrowLeft",
  "SquareArrowRight",
  "SquareChevronLeft",
  "SquareChevronRight",
  "CornerDownLeft",
  "CornerDownRight",
  "CornerUpLeft",
  "CornerUpRight",
  "CornerLeftDown",
  "CornerLeftUp",
  "CornerRightDown",
  "CornerRightUp",
  "LogIn",
  "LogOut",
  "Reply",
  "ReplyAll",
  "Forward",
  "Send",
  "Redo",
  "Undo",
  "Redo2",
  "Undo2",
  "MoveLeft",
  "MoveRight",
  "MoveUpLeft",
  "MoveUpRight",
  "MoveDownLeft",
  "MoveDownRight",
  "PanelLeft",
  "PanelRight",
  "PanelLeftOpen",
  "PanelRightOpen",
  "PanelLeftClose",
  "PanelRightClose",
  "Sidebar",
  "SidebarOpen",
  "SidebarClose",
  "Indent",
  "Outdent",
  "IndentIncrease",
  "IndentDecrease",
  "TextAlignLeft",
  "TextAlignRight",
  "AlignLeft",
  "AlignRight",
  "ListOrdered",
  "WrapText",
  "ArrowLeftFromLine",
  "ArrowRightFromLine",
  "ArrowLeftToLine",
  "ArrowRightToLine",
  "Signpost",
  "SignpostBig",
  "FileInput",
  "FileOutput",
  "Import",
  "Export",
  "SkipBack",
  "SkipForward",
  "Rewind",
  "FastForward",
  "StepBack",
  "StepForward",
  "Play",
  "BadgeCheck",
  "BadgeX",
  "CheckCircle",
  "XCircle",
  "AlertCircle",
  "Info",
  "HelpCircle",
  "MessageSquare",
  "MessagesSquare",
  "MessageCircle",
  "Megaphone",
  "Phone",
  "PhoneCall",
  "PhoneIncoming",
  "PhoneOutgoing",
  "PhoneMissed",
]);

function getIconName(icon: LucideIcon): string {
  return icon.displayName ?? icon.name ?? "";
}

export interface IconProps extends React.ComponentProps<LucideIcon> {
  icon: LucideIcon;
  /** Explicitly flip the icon in RTL. Overrides auto-detection. */
  flip?: boolean;
  /** Explicitly disable RTL flip, even if auto-detected. */
  noFlip?: boolean;
}

export function Icon({ icon: IconComponent, flip, noFlip, className, ...props }: IconProps) {
  const { dir } = useLanguage();
  const iconName = getIconName(IconComponent);
  const shouldFlip = dir === "rtl" && !noFlip && (flip ?? RTL_AUTO_FLIP.has(iconName));

  return (
    <IconComponent
      className={cn(shouldFlip && "scale-x-[-1]", className)}
      {...props}
    />
  );
}

/**
 * Convenience wrapper for a group of directional icons.
 * Use when you do not want to import `Icon` separately in every file.
 */
export function makeRtlIcon(icon: LucideIcon) {
  return function RtlIcon(props: Omit<IconProps, "icon">) {
    return <Icon icon={icon} {...props} />;
  };
}

export default Icon;
