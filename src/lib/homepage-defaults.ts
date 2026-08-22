export interface HomepageContentData {
  id: string;
  introTitle: string;
  introTitleEn: string;
  introTitleUr: string;
  introBody: string;
  introBodyEn: string;
  introBodyUr: string;
  visionTitle: string;
  visionTitleEn: string;
  visionTitleUr: string;
  visionBody: string;
  visionBodyEn: string;
  visionBodyUr: string;
  primaryCtaLabel: string;
  primaryCtaLabelEn: string;
  primaryCtaLabelUr: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaLabelEn: string;
  secondaryCtaLabelUr: string;
  secondaryCtaHref: string;
  leftBlockType: string;
  leftBlockTitle: string;
  leftBlockTitleEn: string;
  leftBlockTitleUr: string;
  leftBlockBody: string;
  leftBlockBodyEn: string;
  leftBlockBodyUr: string;
  leftBlockImageUrl: string;
  leftBlockVideoUrl: string;
  leftBlockPosterUrl: string | null;
  leftBlockLinkUrl: string | null;
  leftBlockEnabled: boolean;
  showHighlights: boolean;
  highlightsTitle: string;
  highlightsTitleEn: string;
  highlightsTitleUr: string;
  showStats: boolean;
  stat1Value: string;
  stat1Label: string;
  stat1LabelEn: string;
  stat1LabelUr: string;
  stat2Value: string;
  stat2Label: string;
  stat2LabelEn: string;
  stat2LabelUr: string;
  stat3Value: string;
  stat3Label: string;
  stat3LabelEn: string;
  stat3LabelUr: string;
  stat4Value: string;
  stat4Label: string;
  stat4LabelEn: string;
  stat4LabelUr: string;
  showVideosSection: boolean;
  videosSectionTitle: string;
  videosSectionTitleEn: string;
  videosSectionTitleUr: string;
  showFooter: boolean;
  footerAbout: string | null;
  footerAboutEn: string | null;
  footerAboutUr: string | null;
  footerEmail: string | null;
  footerPhone: string | null;
  footerAddress: string | null;
  footerAddressEn: string | null;
  footerAddressUr: string | null;
  isActive: boolean;
  updatedAt: string;
}

export interface CarouselSlideData {
  id: string;
  type: string;
  title: string;
  titleEn: string;
  titleUr: string;
  subtitle: string;
  subtitleEn: string;
  subtitleUr: string;
  imageUrl: string;
  videoUrl: string | null;
  posterUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface VideoSectionData {
  id: string;
  title: string;
  titleEn: string;
  titleUr: string;
  description: string;
  descriptionEn: string;
  descriptionUr: string;
  videoUrl: string;
  posterUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AdData {
  id: string;
  type: string;
  title: string;
  titleEn: string;
  titleUr: string;
  subtitle: string;
  subtitleEn: string;
  subtitleUr: string;
  body: string;
  bodyEn: string;
  bodyUr: string;
  imageUrl: string;
  videoUrl: string | null;
  posterUrl: string | null;
  linkUrl: string | null;
  animation: string;
  sortOrder: number;
  isActive: boolean;
}

export interface HomepageZoneData {
  id: string;
  type: string;
  title: string;
  titleEn: string;
  titleUr: string;
  subtitle: string;
  subtitleEn: string;
  subtitleUr: string;
  body: string;
  bodyEn: string;
  bodyUr: string;
  imageUrl: string;
  videoUrl: string | null;
  posterUrl: string | null;
  linkUrl: string | null;
  animation: string;
  sortOrder: number;
  isActive: boolean;
}

export interface HomepageData {
  content: HomepageContentData;
  slides: CarouselSlideData[];
  videos: VideoSectionData[];
  ads: AdData[];
  zones: HomepageZoneData[];
}

const slideImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23f97316'/%3E%3C/svg%3E";

const adImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='160'%3E%3Crect width='100%25' height='100%25' fill='%230a1f44'/%3E%3C/svg%3E";

const posterImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect width='100%25' height='100%25' fill='%231f2937'/%3E%3C/svg%3E";

export const HOMEPAGE_DEFAULTS: HomepageData = {
  content: {
    id: "default",
    introTitle: "منصة ABC الشاملة",
    introTitleEn: "ABC All-in-One Platform",
    introTitleUr: "ABC مکمل پلیٹ فارم",
    introBody:
      "اربط مشاريعك بأفضل المقاولين والمستقلين، واحصل على أفضل أسعار مواد البناء، وتابع المناقصات الحية - كل ما تحتاجه في منصة واحدة",
    introBodyEn:
      "Connect your projects with the best contractors and freelancers, get the best building material prices, and follow live tenders - everything you need in one platform",
    introBodyUr:
      "اپنے پروجیکٹس کو بہترین ٹھیکیداروں اور فری لانسرز سے جوڑیں، تعمیراتی مواد کی بہترین قیمتیں حاصل کریں، اور لائیو ٹینڈرز کی پیروی کریں",
    visionTitle: "رؤيتنا",
    visionTitleEn: "Our Vision",
    visionTitleUr: "ہمارا وژن",
    visionBody:
      "أن نكون المنصة الرقمية الأولى التي تُحدث نقلة نوعية في قطاع الإنشاءات والمقاولات بالمنطقة",
    visionBodyEn:
      "To be the leading digital platform transforming the construction and contracting sector in the region",
    visionBodyUr:
      "خطے میں تعمیرات اور کنٹریکٹنگ کے شعبے کو تبدیل کرنے والا اولین ڈیجیٹل پلیٹ فارم بننا",
    primaryCtaLabel: "ابدأ الآن مجاناً",
    primaryCtaLabelEn: "Start Free Now",
    primaryCtaLabelUr: "مفت شروع کریں",
    primaryCtaHref: "/projects/ABC?register=1",
    secondaryCtaLabel: "تصفح المناقصات",
    secondaryCtaLabelEn: "Browse Bids",
    secondaryCtaLabelUr: "ٹینڈرز براؤز کریں",
    secondaryCtaHref: "/projects/ABC/tenders/projects",
    leftBlockType: "text",
    leftBlockTitle: "رؤيتنا",
    leftBlockTitleEn: "Our Vision",
    leftBlockTitleUr: "ہمارا وژن",
    leftBlockBody:
      "أن نكون المنصة الرقمية الأولى التي تُحدث نقلة نوعية في قطاع الإنشاءات والمقاولات بالمنطقة",
    leftBlockBodyEn:
      "To be the leading digital platform transforming the construction and contracting sector in the region",
    leftBlockBodyUr:
      "خطے میں تعمیرات اور کنٹریکٹنگ کے شعبے کو تبدیل کرنے والا اولین ڈیجیٹل پلیٹ فارم بننا",
    leftBlockImageUrl: "",
    leftBlockVideoUrl: "",
    leftBlockPosterUrl: null,
    leftBlockLinkUrl: null,
    leftBlockEnabled: true,
    showHighlights: true,
    highlightsTitle: "أبرز ما في المنصة",
    highlightsTitleEn: "Platform Highlights",
    highlightsTitleUr: "",
    showStats: true,
    stat1Value: "2,500+",
    stat1Label: "مشاريع منجزة",
    stat1LabelEn: "Completed projects",
    stat1LabelUr: "",
    stat2Value: "1,800+",
    stat2Label: "مقاولون موثوقون",
    stat2LabelEn: "Verified contractors",
    stat2LabelUr: "",
    stat3Value: "10,000+",
    stat3Label: "خامات",
    stat3LabelEn: "Materials",
    stat3LabelUr: "",
    stat4Value: "3,200+",
    stat4Label: "عطاءات ممنوحة",
    stat4LabelEn: "Awarded bids",
    stat4LabelUr: "",
    showVideosSection: true,
    videosSectionTitle: "اكتشف المنصة",
    videosSectionTitleEn: "Discover the Platform",
    videosSectionTitleUr: "",
    showFooter: true,
    footerAbout:
      "منصة رقمية متكاملة تربط أصحاب المشاريع والمقاولين والموردين في قطاع الإنشاءات",
    footerAboutEn:
      "An all-in-one digital platform connecting project owners, contractors and suppliers in the construction sector",
    footerAboutUr: "",
    footerEmail: "info@abc-constructions.com",
    footerPhone: "+966 50 000 0000",
    footerAddress: "الرياض، المملكة العربية السعودية",
    footerAddressEn: "Riyadh, Saudi Arabia",
    footerAddressUr: "",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  slides: [
    {
      id: "default-slide-1",
      type: "image",
      title: "مناقصات المشاريع",
      titleEn: "Project Bids",
      titleUr: "پروجیکٹ ٹینڈرز",
      subtitle: "اكتشف مناقصات جديدة يومياً",
      subtitleEn: "Discover new bids daily",
      subtitleUr: "روزانہ نئے ٹینڈرز دریافت کریں",
      imageUrl: slideImage,
      videoUrl: null,
      posterUrl: null,
      linkUrl: "/projects/ABC/tenders/projects",
      sortOrder: 0,
      isActive: true,
    },
    {
      id: "default-slide-2",
      type: "image",
      title: "سوق البضائع",
      titleEn: "Marketplace",
      titleUr: "بازار",
      subtitle: "مواد بناء بأسعار منافسة",
      subtitleEn: "Building materials at competitive prices",
      subtitleUr: "مسابقتی قیمتوں پر تعمیراتی مواد",
      imageUrl: slideImage,
      videoUrl: null,
      posterUrl: null,
      linkUrl: "/projects/ABC/marketplace",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "default-slide-3",
      type: "image",
      title: "عرض المشاريع",
      titleEn: "Project Showcase",
      titleUr: "پروجیکٹ شوکیس",
      subtitle: "استعرض أعمالنا وإنجازاتنا",
      subtitleEn: "Explore our work and achievements",
      subtitleUr: "ہمارا کام اور کامیابیاں دیکھیں",
      imageUrl: slideImage,
      videoUrl: null,
      posterUrl: null,
      linkUrl: "/projects/ABC/projects",
      sortOrder: 2,
      isActive: true,
    },
  ],
  videos: [
    {
      id: "default-video-1",
      title: "تعرّف على المنصة",
      titleEn: "Discover the Platform",
      titleUr: "پلیٹ فارم دریافت کریں",
      description: "جولة سريعة على أبرز المميزات",
      descriptionEn: "A quick tour of the key features",
      descriptionUr: "کلیدی خصوصیات کا ایک فوری دورہ",
      videoUrl: "",
      posterUrl: posterImage,
      sortOrder: 0,
      isActive: true,
    },
    {
      id: "default-video-2",
      title: "قصص نجاح",
      titleEn: "Success Stories",
      titleUr: "کامیابی کی کہانیاں",
      description: "مقاولون نفّذوا مشاريعهم عبر المنصة",
      descriptionEn: "Contractors who delivered via the platform",
      descriptionUr: "ٹھیکیدار جنہوں نے پلیٹ فارم کے ذریعے کام کیا",
      videoUrl: "",
      posterUrl: posterImage,
      sortOrder: 1,
      isActive: true,
    },
  ],
  ads: [
    {
      id: "default-ad-1",
      type: "image",
      title: "اشترك الآن",
      titleEn: "Subscribe Now",
      titleUr: "ابھی سبسکرائب کریں",
      subtitle: "مزايا حصرية للأعضاء",
      subtitleEn: "Exclusive member benefits",
      subtitleUr: "ممبران کے لیے خصوصی فوائد",
      body: "",
      bodyEn: "",
      bodyUr: "",
      imageUrl: adImage,
      videoUrl: null,
      posterUrl: null,
      linkUrl: "/projects/ABC?register=1",
      animation: "fade",
      sortOrder: 0,
      isActive: true,
    },
  ],
  zones: [
    {
      id: "default-zone-1",
      type: "text",
      title: "جودة مضمونة",
      titleEn: "Guaranteed Quality",
      titleUr: "ضمانی کوالٹی",
      subtitle: "موردون موثوقون وخامات معتمدة",
      subtitleEn: "Trusted suppliers and certified materials",
      subtitleUr: "قابل اعتماد سپلائرز اور تصدیق شدہ مواد",
      body: "كل عقد على المنصة مغطى بضمان الجودة والالتزام بالجدول الزمني",
      bodyEn: "Every contract on the platform is backed by quality assurance and schedule commitment",
      bodyUr: "پلیٹ فارم پر ہر معاہدہ کوالٹی اشورنس اور شیڈول کی پابندی کے ساتھ محفوظ ہے",
      imageUrl: "",
      videoUrl: null,
      posterUrl: null,
      linkUrl: null,
      animation: "fade",
      sortOrder: 0,
      isActive: true,
    },
    {
      id: "default-zone-2",
      type: "text",
      title: "خدمات مالية",
      titleEn: "Financial Services",
      titleUr: "مالی خدمات",
      subtitle: "مدفوعات آمنة عبر محفظة المنصة",
      subtitleEn: "Secure payments via the platform wallet",
      subtitleUr: "پلیٹ فارم والیٹ کے ذریعے محفوظ ادائیگیاں",
      body: "",
      bodyEn: "",
      bodyUr: "",
      imageUrl: "",
      videoUrl: null,
      posterUrl: null,
      linkUrl: null,
      animation: "fade",
      sortOrder: 1,
      isActive: true,
    },
  ],
};

/** Merge API payload with defaults so missing arrays (e.g. zones) never crash the homepage. */
export function mergeHomepageData(partial: Partial<HomepageData> | null | undefined): HomepageData {
  if (!partial) return HOMEPAGE_DEFAULTS;
  return {
    ...HOMEPAGE_DEFAULTS,
    ...partial,
    content: { ...HOMEPAGE_DEFAULTS.content, ...(partial.content ?? {}) },
    slides: partial.slides?.length ? partial.slides : HOMEPAGE_DEFAULTS.slides,
    videos: partial.videos?.length ? partial.videos : HOMEPAGE_DEFAULTS.videos,
    ads: partial.ads?.length ? partial.ads : HOMEPAGE_DEFAULTS.ads,
    zones: partial.zones?.length ? partial.zones : HOMEPAGE_DEFAULTS.zones,
  };
}
