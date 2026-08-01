const C = {
  blue: "bg-info-100 text-info-700",
  green: "bg-success-100 text-success-700",
  purple: "bg-flagship-100 text-flagship-700",
  orange: "bg-amber-100 text-amber-700",
  pink: "bg-danger-100 text-danger-700",
  red: "bg-danger-100 text-danger-700",
  teal: "bg-teal-100 text-teal-700",
  indigo: "bg-flagship-100 text-flagship-700",
  cyan: "bg-info-100 text-info-700",
  gray: "bg-surface-100 text-surface-700",
  yellow: "bg-warning-100 text-warning-700",
  emerald: "bg-emerald-100 text-emerald-700",
} as const

export const LEAD_SOURCES = [
  { value: "WEBSITE", label: "Website", color: C.blue },
  { value: "REFERRAL", label: "Referral", color: C.green },
  { value: "SOCIAL_MEDIA", label: "Social Media", color: C.purple },
  { value: "EMAIL_CAMPAIGN", label: "Email Campaign", color: C.orange },
  { value: "EVENT", label: "Event", color: C.pink },
  { value: "COLD_CALL", label: "Cold Call", color: C.red },
  { value: "PARTNER", label: "Partner", color: C.teal },
  { value: "TRADE_SHOW", label: "Trade Show", color: C.indigo },
  { value: "TENDER_PORTAL", label: "Tender Portal", color: C.cyan },
  { value: "OTHER", label: "Other", color: C.gray },
] as const

export const LEAD_STATUSES = [
  { value: "NEW", label: "New", color: C.blue },
  { value: "CONTACTED", label: "Contacted", color: C.yellow },
  { value: "QUALIFIED", label: "Qualified", color: C.green },
  { value: "PROPOSAL", label: "Proposal", color: C.purple },
  { value: "NEGOTIATION", label: "Negotiation", color: C.orange },
  { value: "WON", label: "Won", color: C.emerald },
  { value: "LOST", label: "Lost", color: C.red },
  { value: "DISQUALIFIED", label: "Disqualified", color: C.gray },
] as const

export const OPPORTUNITY_STAGES = [
  { value: "DISCOVERY", label: "Discovery", color: C.blue },
  { value: "QUALIFICATION", label: "Qualification", color: C.indigo },
  { value: "PROPOSAL", label: "Proposal", color: C.purple },
  { value: "NEGOTIATION", label: "Negotiation", color: C.orange },
  { value: "CLOSED_WON", label: "Closed Won", color: C.green },
  { value: "CLOSED_LOST", label: "Closed Lost", color: C.red },
] as const

export const ACTIVITY_TYPES = [
  { value: "CALL", label: "Call", color: C.blue, icon: "phone" },
  { value: "EMAIL", label: "Email", color: C.green, icon: "mail" },
  { value: "MEETING", label: "Meeting", color: C.purple, icon: "calendar" },
  { value: "TASK", label: "Task", color: C.orange, icon: "checkSquare" },
  { value: "NOTE", label: "Note", color: C.gray, icon: "fileText" },
] as const

export const TASK_PRIORITIES = [
  { value: "LOW", label: "Low", color: C.gray },
  { value: "MEDIUM", label: "Medium", color: C.yellow },
  { value: "HIGH", label: "High", color: C.orange },
  { value: "URGENT", label: "Urgent", color: C.red },
] as const

export const TASK_STATUSES = [
  { value: "PENDING", label: "Pending", color: C.gray },
  { value: "IN_PROGRESS", label: "In Progress", color: C.blue },
  { value: "COMPLETED", label: "Completed", color: C.green },
  { value: "CANCELLED", label: "Cancelled", color: C.red },
] as const

export function getLeadSourceMeta(value: string) {
  return LEAD_SOURCES.find(s => s.value === value) ?? LEAD_SOURCES[LEAD_SOURCES.length - 1]
}

export function getLeadStatusMeta(value: string) {
  return LEAD_STATUSES.find(s => s.value === value) ?? LEAD_STATUSES[0]
}

export function getOpportunityStageMeta(value: string) {
  return OPPORTUNITY_STAGES.find(s => s.value === value) ?? OPPORTUNITY_STAGES[0]
}

export function getActivityTypeMeta(value: string) {
  return ACTIVITY_TYPES.find(s => s.value === value) ?? ACTIVITY_TYPES[0]
}

export function getTaskPriorityMeta(value: string) {
  return TASK_PRIORITIES.find(s => s.value === value) ?? TASK_PRIORITIES[1]
}

export function getTaskStatusMeta(value: string) {
  return TASK_STATUSES.find(s => s.value === value) ?? TASK_STATUSES[0]
}
