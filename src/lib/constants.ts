export const ROLES = {
  OWNER: { label: "مالك مشروع", color: "bg-info-100 text-info-800" },
  CONSULTANT: { label: "استشاري", color: "bg-flagship-100 text-flagship-800" },
  CONTRACTOR: { label: "مقاول", color: "bg-success-100 text-success-800" },
  SUBCONTRACTOR: { label: "مقاول فرعي", color: "bg-teal-100 text-teal-800" },
  WORKSHOP: { label: "ورشة", color: "bg-amber-100 text-amber-800" },
  FREELANCER: { label: "مستقل", color: "bg-info-100 text-info-800" },
  SUPPLIER: { label: "مورد", color: "bg-amber-100 text-amber-800" },
  TRADER: { label: "تاجر مواد بناء", color: "bg-danger-100 text-danger-800" },
  ADMIN: { label: "مدير", color: "bg-surface-100 text-surface-800" },
} as const;

export const TENDER_STATUS = {
  OPEN: { label: "مفتوح", color: "bg-success-100 text-success-800" },
  CLOSED: { label: "مغلق", color: "bg-danger-100 text-danger-800" },
  AWARDED: { label: "تم منحه", color: "bg-info-100 text-info-800" },
  CANCELLED: { label: "ملغي", color: "bg-surface-100 text-surface-800" },
} as const;

export const PROJECT_STATUS = {
  PLANNING: { label: "قيد التخطيط", color: "bg-warning-100 text-warning-800" },
  IN_PROGRESS: { label: "قيد التنفيذ", color: "bg-info-100 text-info-800" },
  COMPLETED: { label: "مكتمل", color: "bg-success-100 text-success-800" },
  ON_HOLD: { label: "متوقف", color: "bg-danger-100 text-danger-800" },
} as const;

export const JOB_TYPES = {
  FULL_TIME: { label: "دوام كامل", color: "bg-success-100 text-success-800" },
  PART_TIME: { label: "دوام جزئي", color: "bg-warning-100 text-warning-800" },
  CONTRACT: { label: "عقد", color: "bg-info-100 text-info-800" },
  FREELANCE: { label: "عمل حر", color: "bg-flagship-100 text-flagship-800" },
} as const;

export const CATEGORIES = [
  "البناء العام",
  "الهندسة المدنية",
  "الكهرباء",
  "السباكة",
  "التشطيبات",
  "الدهانات",
  "البلاط والسيراميك",
  "النجارة",
  "الحدادة",
  "العزل",
  "الميكانيكا",
  "الأبراج والمباني العالية",
  "الطرق والجسور",
  "البنية التحتية",
  "التصميم الداخلي",
  "المسح وال.Measurements",
  "الأمن والسلامة",
  "إدارة المشاريع",
];

export const MATERIAL_TYPES = [
  "أسمنت",
  "حديد",
  "رمل",
  "حصى",
  "طوب",
  "بلاط",
  "سيراميك",
  "أنابيب",
  "كابلات",
  "دهانات",
  "زجاج",
  "ألمنيوم",
  "خشب",
  "عوازل",
  "مواد كيميائية",
  "آلات وأدوات",
  "أخرى",
];

export const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: "Home" },
  { href: "/projects/ABC/tenders/projects", label: "مناقصات المشاريع", icon: "FileText" },
  { href: "/projects/ABC/tenders/materials", label: "مناقصات المواد", icon: "Package" },
  { href: "/projects/ABC/marketplace", label: "سوق البضائع", icon: "Store" },
  { href: "/projects/ABC/projects", label: "عرض المشاريع", icon: "Building2" },
  { href: "/projects/ABC/jobs", label: "التوظيف", icon: "Briefcase" },
  { href: "/projects/ABC/training", label: "التدريب", icon: "GraduationCap" },
  { href: "/projects/ABC/delivery", label: "خدمة التوصيل", icon: "Truck" },
  { href: "/projects/ABC/procurement", label: "المشتريات", icon: "ShoppingCart" },
  { href: "/projects/ABC/research", label: "مختبر الأبحاث", icon: "Flask" },
];

export const COURSE_LEVELS = {
  BEGINNER: { label: "مبتدئ", color: "bg-success-100 text-success-700" },
  INTERMEDIATE: { label: "متوسط", color: "bg-amber-100 text-amber-700" },
  ADVANCED: { label: "متقدم", color: "bg-danger-100 text-danger-700" },
} as const;

export const COURSE_CATEGORIES = [
  "إدارة المشاريع",
  "الهندسة المدنية",
  "الهندسة المعمارية",
  "BIM",
  "AutoCAD",
  "Revit",
  "Primavera",
  "Quantity Surveying",
  "التقدير والتكلفة",
  "المشتريات",
  "FIDIC",
  "PMP",
  "OSHA",
  "السلامة المهنية",
  "العقود",
  "إدارة المخازن",
  "قراءة المخططات",
  "إدارة المناقصات",
  "الكهرباء",
  "السباكة",
  "الميكانيكا",
  "MEP",
  "الخرسانة",
  "الحديد والصلب",
  "التشطيبات",
  "الطرق والجسور",
] as const;

export const ORG_NAV_ITEMS = [
  { href: "/projects/ABC/organization", label: "مؤسستي", labelEn: "My Organization", icon: "Building2" },
  { href: "/projects/ABC/verification", label: "التوثيق", labelEn: "Verification", icon: "ShieldCheck" },
];

// ============================
// Research Lab Constants
// ============================

export const CAMPAIGN_TYPES = {
  MARKET_RESEARCH: { label: "أبحاث سوق", labelEn: "Market Research", color: "bg-info-100 text-info-800", icon: "Search" },
  PROBLEM_DISCOVERY: { label: "اكتشاف المشاكل", labelEn: "Problem Discovery", color: "bg-danger-100 text-danger-800", icon: "AlertTriangle" },
  PRICING_RESEARCH: { label: "أبحاث التسعير", labelEn: "Pricing Research", color: "bg-success-100 text-success-800", icon: "DollarSign" },
  COMPETITOR_BENCHMARKING: { label: "دراسة المنافسين", labelEn: "Competitor Benchmarking", color: "bg-flagship-100 text-flagship-800", icon: "Crosshair" },
  PRODUCT_VALIDATION: { label: "اختبار المنتج", labelEn: "Product Validation", color: "bg-flagship-100 text-flagship-800", icon: "CheckCircle" },
  FEATURE_VALIDATION: { label: "اختبار الميزات", labelEn: "Feature Validation", color: "bg-teal-100 text-teal-800", icon: "Layers" },
  BETA_TESTING: { label: "اختبار تجريبي", labelEn: "Beta Testing", color: "bg-info-100 text-info-800", icon: "Flask" },
  CUSTOMER_SATISFACTION: { label: "رضا العملاء", labelEn: "Customer Satisfaction", color: "bg-amber-100 text-amber-800", icon: "Smile" },
  NPS: { label: "صافي نقاط الترويج", labelEn: "NPS", color: "bg-emerald-100 text-emerald-800", icon: "TrendingUp" },
  CSAT: { label: "رضا العملاء CSAT", labelEn: "CSAT", color: "bg-warning-100 text-warning-800", icon: "Star" },
  CES: { label: "سهولة التجربة CES", labelEn: "CES", color: "bg-info-100 text-info-800", icon: "Activity" },
  PRODUCT_FEEDBACK: { label: "ملاحظات المنتج", labelEn: "Product Feedback", color: "bg-flagship-100 text-flagship-800", icon: "MessageSquare" },
  FEATURE_REQUESTS: { label: "طلبات الميزات", labelEn: "Feature Requests", color: "bg-flagship-100 text-flagship-800", icon: "Lightbulb" },
  BUG_REPORTS: { label: "تقارير الأخطاء", labelEn: "Bug Reports", color: "bg-danger-100 text-danger-800", icon: "Bug" },
  UX_RESEARCH: { label: "أبحاث تجربة المستخدم", labelEn: "UX Research", color: "bg-danger-100 text-danger-800", icon: "Monitor" },
  INTERVIEW: { label: "مقابلات", labelEn: "Interview", color: "bg-amber-100 text-amber-800", icon: "Users" },
  FOCUS_GROUP: { label: "مجموعات نقاش", labelEn: "Focus Group", color: "bg-warning-100 text-warning-800", icon: "Group" },
} as const;

export const CAMPAIGN_STATUSES = {
  DRAFT: { label: "مسودة", labelEn: "Draft", color: "bg-surface-100 text-surface-800" },
  ACTIVE: { label: "نشطة", labelEn: "Active", color: "bg-success-100 text-success-800" },
  PAUSED: { label: "متوقفة", labelEn: "Paused", color: "bg-warning-100 text-warning-800" },
  CLOSED: { label: "مغلقة", labelEn: "Closed", color: "bg-danger-100 text-danger-800" },
  ARCHIVED: { label: "مؤرشفة", labelEn: "Archived", color: "bg-surface-100 text-surface-800" },
} as const;

export const SEGMENT_TYPES = {
  PROJECT_OWNER: { label: "مالك مشروع", labelEn: "Project Owner" },
  CONSULTANT_OFFICE: { label: "مكتب استشاري", labelEn: "Consultant Office" },
  MAIN_CONTRACTOR: { label: "مقاول رئيسي", labelEn: "Main Contractor" },
  SUBCONTRACTOR: { label: "مقاول فرعي", labelEn: "Subcontractor" },
  WORKSHOP: { label: "ورشة", labelEn: "Workshop" },
  SUPPLIER: { label: "مورد", labelEn: "Supplier" },
  FACTORY: { label: "مصنع", labelEn: "Factory" },
  TRANSPORT_COMPANY: { label: "شركة نقل", labelEn: "Transport Company" },
  FREELANCER: { label: "مستقل", labelEn: "Freelancer" },
  JOB_SEEKER: { label: "باحث عن عمل", labelEn: "Job Seeker" },
  GOVERNMENT_ENTITY: { label: "جهة حكومية", labelEn: "Government Entity" },
  OTHER: { label: "أخرى", labelEn: "Other" },
} as const;

export const QUESTION_TYPES = {
  TEXT: { label: "نص قصير", labelEn: "Short Text" },
  TEXTAREA: { label: "نص طويل", labelEn: "Long Text" },
  SINGLE_CHOICE: { label: "اختيار واحد", labelEn: "Single Choice" },
  MULTIPLE_CHOICE: { label: "اختيار متعدد", labelEn: "Multiple Choice" },
  DROPDOWN: { label: "قائمة منسدلة", labelEn: "Dropdown" },
  RATING: { label: "تقييم", labelEn: "Rating" },
  NPS: { label: "NPS", labelEn: "NPS" },
  LINEAR_SCALE: { label: "مقياس خطي", labelEn: "Linear Scale" },
  DATE: { label: "تاريخ", labelEn: "Date" },
  TIME: { label: "وقت", labelEn: "Time" },
  FILE_UPLOAD: { label: "رفع ملف", labelEn: "File Upload" },
  EMAIL: { label: "بريد إلكتروني", labelEn: "Email" },
  PHONE: { label: "رقم جوال", labelEn: "Phone" },
  MATRIX: { label: "مصفوفة", labelEn: "Matrix" },
} as const;

export const FEATURE_REQUEST_STATUSES = {
  UNDER_REVIEW: { label: "قيد المراجعة", labelEn: "Under Review", color: "bg-warning-100 text-warning-800" },
  PLANNED: { label: "مخطط", labelEn: "Planned", color: "bg-info-100 text-info-800" },
  IN_PROGRESS: { label: "قيد التطوير", labelEn: "In Progress", color: "bg-flagship-100 text-flagship-800" },
  COMPLETED: { label: "مكتمل", labelEn: "Completed", color: "bg-success-100 text-success-800" },
  DECLINED: { label: "مرفوض", labelEn: "Declined", color: "bg-danger-100 text-danger-800" },
} as const;

export const BUG_SEVERITIES = {
  CRITICAL: { label: "حرج", labelEn: "Critical", color: "bg-danger-100 text-danger-800" },
  HIGH: { label: "عالٍ", labelEn: "High", color: "bg-amber-100 text-amber-800" },
  MEDIUM: { label: "متوسط", labelEn: "Medium", color: "bg-warning-100 text-warning-800" },
  LOW: { label: "منخفض", labelEn: "Low", color: "bg-success-100 text-success-800" },
} as const;

export const INSIGHT_TYPES = {
  PAIN_POINTS: { label: "المشاكل الأكثر تكرارًا", labelEn: "Pain Points", color: "bg-danger-100 text-danger-800" },
  FEATURE_DEMAND: { label: "الميزات الأكثر طلبًا", labelEn: "Feature Demand", color: "bg-info-100 text-info-800" },
  SENTIMENT_ANALYSIS: { label: "تحليل المشاعر", labelEn: "Sentiment Analysis", color: "bg-flagship-100 text-flagship-800" },
  CUSTOMER_SEGMENTATION: { label: "تقسيم العملاء", labelEn: "Customer Segmentation", color: "bg-success-100 text-success-800" },
  DEVELOPMENT_PRIORITIES: { label: "أولويات التطوير", labelEn: "Development Priorities", color: "bg-amber-100 text-amber-800" },
  PRICING_RECOMMENDATION: { label: "توصيات التسعير", labelEn: "Pricing Recommendation", color: "bg-teal-100 text-teal-800" },
  DEMAND_FORECAST: { label: "توقعات الطلب", labelEn: "Demand Forecast", color: "bg-info-100 text-info-800" },
  UX_IMPROVEMENT: { label: "تحسين تجربة المستخدم", labelEn: "UX Improvement", color: "bg-danger-100 text-danger-800" },
  COMPETITOR_ANALYSIS: { label: "تحليل المنافسين", labelEn: "Competitor Analysis", color: "bg-flagship-100 text-flagship-800" },
  MARKET_TREND: { label: "اتجاهات السوق", labelEn: "Market Trend", color: "bg-flagship-100 text-flagship-800" },
} as const;

export const FEEDBACK_CATEGORIES = {
  GENERAL: { label: "عام", labelEn: "General" },
  PRODUCT: { label: "منتج", labelEn: "Product" },
  SERVICE: { label: "خدمة", labelEn: "Service" },
  UX: { label: "تجربة مستخدم", labelEn: "UX" },
  PRICING: { label: "تسعير", labelEn: "Pricing" },
  FEATURE: { label: "ميزة", labelEn: "Feature" },
  SUPPORT: { label: "دعم", labelEn: "Support" },
  OTHER: { label: "أخرى", labelEn: "Other" },
} as const;

export const PARTICIPANT_SOURCES = [
  { value: "website", label: "الموقع الرسمي", labelEn: "Website" },
  { value: "landing_page", label: "Landing Page", labelEn: "Landing Page" },
  { value: "linkedin", label: "LinkedIn", labelEn: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp", labelEn: "WhatsApp" },
  { value: "email", label: "البريد الإلكتروني", labelEn: "Email" },
  { value: "qr_code", label: "QR Code", labelEn: "QR Code" },
  { value: "conference", label: "مؤتمر / معرض", labelEn: "Conference" },
  { value: "marketing", label: "حملة تسويقية", labelEn: "Marketing" },
  { value: "referral", label: "دعوة", labelEn: "Referral" },
  { value: "direct", label: "مباشر", labelEn: "Direct" },
] as const;

// ============================
// Procurement Constants
// ============================

export const PR_PRIORITIES = {
  LOW: { label: "منخفضة", labelEn: "Low", color: "bg-surface-100 text-surface-800" },
  MEDIUM: { label: "متوسطة", labelEn: "Medium", color: "bg-warning-100 text-warning-800" },
  HIGH: { label: "عالية", labelEn: "High", color: "bg-amber-100 text-amber-800" },
  URGENT: { label: "عاجلة", labelEn: "Urgent", color: "bg-danger-100 text-danger-800" },
} as const;

export const PR_STATUSES = {
  DRAFT: { label: "مسودة", labelEn: "Draft", color: "bg-surface-100 text-surface-800" },
  PENDING_APPROVAL: { label: "بانتظار الموافقة", labelEn: "Pending Approval", color: "bg-warning-100 text-warning-800" },
  APPROVED: { label: "معتمد", labelEn: "Approved", color: "bg-success-100 text-success-800" },
  REJECTED: { label: "مرفوض", labelEn: "Rejected", color: "bg-danger-100 text-danger-800" },
  ORDERED: { label: "تم الطلب", labelEn: "Ordered", color: "bg-info-100 text-info-800" },
} as const;

export const RFQ_STATUSES = {
  DRAFT: { label: "مسودة", labelEn: "Draft", color: "bg-surface-100 text-surface-800" },
  SENT: { label: "مرسل", labelEn: "Sent", color: "bg-info-100 text-info-800" },
  OPEN: { label: "مفتوح", labelEn: "Open", color: "bg-success-100 text-success-800" },
  CLOSED: { label: "مغلق", labelEn: "Closed", color: "bg-danger-100 text-danger-800" },
  AWARDED: { label: "تم الترسية", labelEn: "Awarded", color: "bg-amber-100 text-amber-800" },
  CANCELLED: { label: "ملغي", labelEn: "Cancelled", color: "bg-surface-100 text-surface-800" },
} as const;

export const QUOTATION_STATUSES = {
  DRAFT: { label: "مسودة", labelEn: "Draft", color: "bg-surface-100 text-surface-800" },
  SUBMITTED: { label: "مقدّم", labelEn: "Submitted", color: "bg-info-100 text-info-800" },
  WITHDRAWN: { label: "مسحوب", labelEn: "Withdrawn", color: "bg-warning-100 text-warning-800" },
  ACCEPTED: { label: "مقبول", labelEn: "Accepted", color: "bg-success-100 text-success-800" },
  REJECTED: { label: "مرفوض", labelEn: "Rejected", color: "bg-danger-100 text-danger-800" },
} as const;

export const EVAL_STATUSES = {
  PENDING: { label: "قيد الانتظار", labelEn: "Pending", color: "bg-surface-100 text-surface-800" },
  IN_PROGRESS: { label: "قيد التقييم", labelEn: "In Progress", color: "bg-warning-100 text-warning-800" },
  COMPLETED: { label: "مكتمل", labelEn: "Completed", color: "bg-success-100 text-success-800" },
} as const;

export const AWARD_STATUSES = {
  PENDING_ACCEPTANCE: { label: "بانتظار القبول", labelEn: "Pending Acceptance", color: "bg-warning-100 text-warning-800" },
  ACCEPTED: { label: "مقبول", labelEn: "Accepted", color: "bg-success-100 text-success-800" },
  DECLINED: { label: "مرفوض", labelEn: "Declined", color: "bg-danger-100 text-danger-800" },
  CANCELLED: { label: "ملغي", labelEn: "Cancelled", color: "bg-surface-100 text-surface-800" },
} as const;

export const PO_STATUSES = {
  DRAFT: { label: "مسودة", labelEn: "Draft", color: "bg-surface-100 text-surface-800" },
  APPROVED: { label: "معتمد", labelEn: "Approved", color: "bg-success-100 text-success-800" },
  SENT: { label: "مرسل", labelEn: "Sent", color: "bg-info-100 text-info-800" },
  ACKNOWLEDGED: { label: "مؤكد", labelEn: "Acknowledged", color: "bg-flagship-100 text-flagship-800" },
  PARTIALLY_DELIVERED: { label: "تم التوصيل جزئياً", labelEn: "Partially Delivered", color: "bg-amber-100 text-amber-800" },
  DELIVERED: { label: "تم التوصيل", labelEn: "Delivered", color: "bg-success-100 text-success-800" },
  CANCELLED: { label: "ملغي", labelEn: "Cancelled", color: "bg-danger-100 text-danger-800" },
} as const;

export const GR_STATUSES = {
  PENDING: { label: "قيد الانتظار", labelEn: "Pending", color: "bg-surface-100 text-surface-800" },
  PARTIAL: { label: "جزئي", labelEn: "Partial", color: "bg-warning-100 text-warning-800" },
  COMPLETE: { label: "كامل", labelEn: "Complete", color: "bg-success-100 text-success-800" },
  INSPECTED: { label: "تم الفحص", labelEn: "Inspected", color: "bg-info-100 text-info-800" },
  REJECTED: { label: "مرفوض", labelEn: "Rejected", color: "bg-danger-100 text-danger-800" },
} as const;

export const INVOICE_STATUSES = {
  PENDING: { label: "قيد الانتظار", labelEn: "Pending", color: "bg-surface-100 text-surface-800" },
  SUBMITTED: { label: "مقدّمة", labelEn: "Submitted", color: "bg-info-100 text-info-800" },
  VERIFIED: { label: "مدققة", labelEn: "Verified", color: "bg-flagship-100 text-flagship-800" },
  DISPUTED: { label: "متنازع عليها", labelEn: "Disputed", color: "bg-danger-100 text-danger-800" },
  APPROVED: { label: "معتمدة", labelEn: "Approved", color: "bg-success-100 text-success-800" },
  PAID: { label: "مدفوعة", labelEn: "Paid", color: "bg-emerald-100 text-emerald-800" },
  PARTIALLY_PAID: { label: "مدفوعة جزئياً", labelEn: "Partially Paid", color: "bg-amber-100 text-amber-800" },
  CANCELLED: { label: "ملغية", labelEn: "Cancelled", color: "bg-danger-100 text-danger-800" },
} as const;

export const PAYMENT_STATUSES = {
  PENDING: { label: "قيد الانتظار", labelEn: "Pending", color: "bg-surface-100 text-surface-800" },
  COMPLETED: { label: "مكتملة", labelEn: "Completed", color: "bg-success-100 text-success-800" },
  FAILED: { label: "فاشلة", labelEn: "Failed", color: "bg-danger-100 text-danger-800" },
  REFUNDED: { label: "مسترجع", labelEn: "Refunded", color: "bg-warning-100 text-warning-800" },
} as const;

export const PAYMENT_METHODS = {
  CASH: { label: "نقداً", labelEn: "Cash" },
  CARD: { label: "بطاقة", labelEn: "Card" },
  WALLET: { label: "محفظة", labelEn: "Wallet" },
  TRANSFER: { label: "تحويل بنكي", labelEn: "Bank Transfer" },
} as const;

export const PROCUREMENT_NAV_ITEMS = [
  { href: "/projects/ABC/procurement", label: "لوحة المشتريات", labelEn: "Procurement Dashboard", icon: "ShoppingCart" },
  { href: "/projects/ABC/procurement/purchase-requests", label: "طلبات الشراء", labelEn: "Purchase Requests", icon: "FileText" },
  { href: "/projects/ABC/procurement/rfqs", label: "طلبات عروض الأسعار", labelEn: "RFQs", icon: "Send" },
  { href: "/projects/ABC/procurement/quotations", label: "عروض الأسعار", labelEn: "Quotations", icon: "FileSpreadsheet" },
  { href: "/projects/ABC/procurement/purchase-orders", label: "أوامر الشراء", labelEn: "Purchase Orders", icon: "ShoppingCart" },
  { href: "/projects/ABC/procurement/invoices", label: "الفواتير", labelEn: "Invoices", icon: "Receipt" },
] as const;

export const RESEARCH_NAV_ITEMS = [
  { href: "/projects/ABC/research", label: "لوحة الأبحاث", labelEn: "Research Dashboard", icon: "Flask" },
  { href: "/projects/ABC/research/campaigns", label: "الحملات", labelEn: "Campaigns", icon: "Megaphone" },
  { href: "/projects/ABC/research/participants", label: "المشاركون", labelEn: "Participants", icon: "Users" },
  { href: "/projects/ABC/research/founding-members", label: "الأعضاء المؤسسون", labelEn: "Founding Members", icon: "Award" },
  { href: "/projects/ABC/research/feature-requests", label: "طلبات الميزات", labelEn: "Feature Requests", icon: "Lightbulb" },
  { href: "/projects/ABC/research/insights", label: "تحليلات الذكاء الاصطناعي", labelEn: "AI Insights", icon: "Brain" },
];
