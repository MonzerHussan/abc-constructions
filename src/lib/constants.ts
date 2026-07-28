export const ROLES = {
  OWNER: { label: "مالك مشروع", color: "bg-blue-100 text-blue-800" },
  CONSULTANT: { label: "استشاري", color: "bg-purple-100 text-purple-800" },
  CONTRACTOR: { label: "مقاول", color: "bg-green-100 text-green-800" },
  SUBCONTRACTOR: { label: "مقاول فرعي", color: "bg-teal-100 text-teal-800" },
  WORKSHOP: { label: "ورشة", color: "bg-orange-100 text-orange-800" },
  FREELANCER: { label: "مستقل", color: "bg-cyan-100 text-cyan-800" },
  SUPPLIER: { label: "مورد", color: "bg-amber-100 text-amber-800" },
  TRADER: { label: "تاجر مواد بناء", color: "bg-rose-100 text-rose-800" },
  ADMIN: { label: "مدير", color: "bg-gray-100 text-gray-800" },
} as const;

export const TENDER_STATUS = {
  OPEN: { label: "مفتوح", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "مغلق", color: "bg-red-100 text-red-800" },
  AWARDED: { label: "تم منحه", color: "bg-blue-100 text-blue-800" },
  CANCELLED: { label: "ملغي", color: "bg-gray-100 text-gray-800" },
} as const;

export const PROJECT_STATUS = {
  PLANNING: { label: "قيد التخطيط", color: "bg-yellow-100 text-yellow-800" },
  IN_PROGRESS: { label: "قيد التنفيذ", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "مكتمل", color: "bg-green-100 text-green-800" },
  ON_HOLD: { label: "متوقف", color: "bg-red-100 text-red-800" },
} as const;

export const JOB_TYPES = {
  FULL_TIME: { label: "دوام كامل", color: "bg-green-100 text-green-800" },
  PART_TIME: { label: "دوام جزئي", color: "bg-yellow-100 text-yellow-800" },
  CONTRACT: { label: "عقد", color: "bg-blue-100 text-blue-800" },
  FREELANCE: { label: "عمل حر", color: "bg-purple-100 text-purple-800" },
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
  { href: "/tenders/projects", label: "مناقصات المشاريع", icon: "FileText" },
  { href: "/tenders/materials", label: "مناقصات المواد", icon: "Package" },
  { href: "/marketplace", label: "سوق البضائع", icon: "Store" },
  { href: "/projects", label: "عرض المشاريع", icon: "Building2" },
  { href: "/jobs", label: "التوظيف", icon: "Briefcase" },
  { href: "/training", label: "التدريب", icon: "GraduationCap" },
  { href: "/delivery", label: "خدمة التوصيل", icon: "Truck" },
];
