// Default homepage content — shown when the DB is empty (admin has not yet published content).

export interface LocalizedText {
  ar: string;
  en: string;
  ur: string;
  [key: string]: string;
}

export interface HomepageDefaults {
  logoUrl: string;
  ctaLabel: LocalizedText;
  ctaHref: string;
  heroTitle: LocalizedText;
  heroSubtitle: LocalizedText;
  heroDescription: LocalizedText;
  footerText: LocalizedText;
  showLanguage: boolean;
  showLogin: boolean;
  showRegister: boolean;
}

export const HOMEPAGE_DEFAULTS: HomepageDefaults = {
  logoUrl: "/logo/abc-logo-white.svg",
  ctaLabel: { ar: "ابدأ الآن", en: "Start Now", ur: "ابھی شروع کریں" },
  ctaHref: "/projects/ABC/auth/register",
  heroTitle: { ar: "منصة ABC الشاملة", en: "ABC Comprehensive Platform", ur: "ABC مکمل پلیٹ فارم" },
  heroSubtitle: { ar: "لبناء قطاع الإنشاءات", en: "for Construction", ur: "تعمیرات کے لیے" },
  heroDescription: {
    ar: "اربط مشاريعك بأفضل المقاولين والمستقلين، واحصل على أفضل أسعار مواد البناء، وتابع المناقصات الحية — كل ما تحتاجه في منصة واحدة.",
    en: "Connect your projects with the best contractors and freelancers, get the best building material prices, and follow live bids — everything you need in one platform.",
    ur: "اپنے پروجیکٹس کو بہترین ٹھیکیداروں اور فری لانسرز سے جوڑیں، تعمیراتی سامان کی بہترین قیمتیں حاصل کریں، اور لائیو ٹینڈرز کی پیروی کریں۔",
  },
  footerText: {
    ar: "© 2026 ABC — All About Constructions. جميع الحقوق محفوظة.",
    en: "© 2026 ABC — All About Constructions. All rights reserved.",
    ur: "© 2026 ABC — All About Constructions. جملہ حقوق محفوظ ہیں۔",
  },
  showLanguage: true,
  showLogin: true,
  showRegister: true,
};

export interface ZoneDefaults {
  location: string;
  contentType: "TEXT" | "IMAGE" | "VIDEO";
  title: LocalizedText;
  body: LocalizedText;
  mediaUrl: string;
  link: string;
}

export const ZONE_LOCATIONS = ["LEFT_TOP", "LEFT_BOTTOM", "RIGHT_TOP", "RIGHT_BOTTOM"] as const;

export const ZONE_DEFAULTS: Record<string, ZoneDefaults> = {
  LEFT_TOP: {
    location: "LEFT_TOP",
    contentType: "TEXT",
    title: { ar: "رؤيتنا", en: "Our Vision", ur: "ہمارا وژن" },
    body: {
      ar: "نسعى لبناء أكبر منصة عربية لقطاع الإنشاءات والمقاولات.",
      en: "We aim to build the largest construction platform in the region.",
      ur: "ہم خطے کی سب سے بڑی تعمیراتی پلیٹ فارم بنانے کا ہدف رکھتے ہیں۔",
    },
    mediaUrl: "",
    link: "",
  },
  LEFT_BOTTOM: {
    location: "LEFT_BOTTOM",
    contentType: "TEXT",
    title: { ar: "انضم إلينا", en: "Join Us", ur: "ہم سے جڑیں" },
    body: {
      ar: "أنشئ حسابك مجاناً وابدأ في استكشاف الفرص المتاحة.",
      en: "Create your free account and start exploring opportunities.",
      ur: "اپنا مفت اکاؤنٹ بنائیں اور مواقع تلاش کرنا شروع کریں۔",
    },
    mediaUrl: "",
    link: "/projects/ABC/auth/register",
  },
  RIGHT_TOP: {
    location: "RIGHT_TOP",
    contentType: "VIDEO",
    title: { ar: "تعريف بالمنصة", en: "Platform Overview", ur: "پلیٹ فارم جائزہ" },
    body: { ar: "", en: "", ur: "" },
    mediaUrl: "",
    link: "",
  },
  RIGHT_BOTTOM: {
    location: "RIGHT_BOTTOM",
    contentType: "IMAGE",
    title: { ar: "أحدث المشاريع", en: "Latest Projects", ur: "تازہ ترین پروجیکٹس" },
    body: { ar: "", en: "", ur: "" },
    mediaUrl: "/logo/abc-logo-white.svg",
    link: "/projects/ABC/projects",
  },
};

export interface SlideDefaults {
  title: LocalizedText;
  subtitle: LocalizedText;
  imageUrl: string;
  link: string;
}

export const SLIDE_DEFAULTS: SlideDefaults[] = [
  {
    title: { ar: "مناقصات المشاريع الحية", en: "Live Project Bids", ur: "لائیو پروجیکٹ ٹینڈرز" },
    subtitle: {
      ar: "تابع أحدث المناقصات الإنشائية وقدم عروضك",
      en: "Follow the latest construction bids and submit your offers",
      ur: "تازہ ترین تعمیراتی ٹینڈرز دیکھیں اور اپنی پیشکشیں جمع کریں",
    },
    imageUrl: "/logo/abc-logo-white.svg",
    link: "/projects/ABC/tenders/projects",
  },
  {
    title: { ar: "سوق مواد البناء", en: "Building Materials Market", ur: "تعمیراتی سامان مارکیٹ" },
    subtitle: {
      ar: "تصفح وقارن أسعار مواد البناء من موردين معتمدين",
      en: "Browse and compare building material prices from verified suppliers",
      ur: "تصدیق شدہ سپلائرز سے تعمیراتی سامان کی قیمتیں دیکھیں اور موازنہ کریں",
    },
    imageUrl: "/logo/abc-logo-mark.svg",
    link: "/projects/ABC/marketplace",
  },
];

export interface MenuDefaults {
  key: string;
  label: LocalizedText;
  items: { label: LocalizedText; href: string }[];
}

export const MENU_DEFAULTS: MenuDefaults[] = [
  {
    key: "bids",
    label: { ar: "المناقصات", en: "Bids", ur: "ٹینڈرز" },
    items: [
      { label: { ar: "المشاريع", en: "Projects", ur: "پروجیکٹس" }, href: "/projects/ABC/projects" },
      { label: { ar: "المواد", en: "Materials", ur: "مواد" }, href: "/projects/ABC/tenders/materials" },
      { label: { ar: "المنتجات", en: "Products", ur: "مصنوعات" }, href: "/projects/ABC/marketplace" },
      { label: { ar: "الرحلات", en: "Trip", ur: "ٹرپ" }, href: "/projects/ABC/delivery" },
    ],
  },
  {
    key: "market",
    label: { ar: "السوق", en: "Market", ur: "مارکیٹ" },
    items: [
      { label: { ar: "المشاريع", en: "Projects", ur: "پروجیکٹس" }, href: "/projects/ABC/projects" },
      { label: { ar: "المواد", en: "Materials", ur: "مواد" }, href: "/projects/ABC/tenders/materials" },
      { label: { ar: "المنتجات", en: "Products", ur: "مصنوعات" }, href: "/projects/ABC/marketplace" },
      { label: { ar: "التوصيل", en: "Delivery", ur: "ڈلیوری" }, href: "/projects/ABC/delivery" },
    ],
  },
  {
    key: "community",
    label: { ar: "المجتمع", en: "Community", ur: "کمیونٹی" },
    items: [
      { label: { ar: "الوظائف", en: "Jobs", ur: "ملازمتیں" }, href: "/projects/ABC/jobs" },
      { label: { ar: "التدريب", en: "Training", ur: "تربیت" }, href: "/projects/ABC/training" },
    ],
  },
];

export const REGISTER_ITEMS_DEFAULTS = [
  { label: { ar: "جهة حكومية", en: "Government", ur: "سرکاری ادارہ" }, href: "/projects/ABC/auth/register" },
  { label: { ar: "مالك مشروع", en: "Owner", ur: "پروجیکٹ مالک" }, href: "/projects/ABC/auth/register" },
  { label: { ar: "استشاري", en: "Consultant", ur: "مشیر" }, href: "/projects/ABC/auth/register" },
  { label: { ar: "مورد", en: "Supplier", ur: "سپلائر" }, href: "/projects/ABC/auth/register" },
  { label: { ar: "مقاول", en: "Contractor", ur: "پیمانہ دار" }, href: "/projects/ABC/auth/register" },
  { label: { ar: "مقاول فرعي", en: "Sub Contractor", ur: "ذیلی پیمانہ دار" }, href: "/projects/ABC/auth/register" },
  { label: { ar: "إدارة المشاريع والصيانة", en: "PM & Maintenance", ur: "پروجیکٹ مینجمنٹ اور مینٹیننس" }, href: "/projects/ABC/auth/register" },
  { label: { ar: "فرد", en: "Individual", ur: "فرد" }, href: "/projects/ABC/auth/register" },
];

export const FOOTER_LINKS_DEFAULTS = [
  { label: { ar: "عن المنصة", en: "About", ur: "ہمارے بارے میں" }, href: "/about" },
  { label: { ar: "تواصل معنا", en: "Contact", ur: "رابطہ کریں" }, href: "/contact" },
  { label: { ar: "الشروط", en: "Terms", ur: "شرائط" }, href: "/terms" },
  { label: { ar: "الخصوصية", en: "Privacy", ur: "پرائیویسی" }, href: "/privacy" },
];
