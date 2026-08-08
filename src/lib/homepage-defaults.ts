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
  isActive: boolean;
  updatedAt: string;
}

export interface CarouselSlideData {
  id: string;
  title: string;
  titleEn: string;
  titleUr: string;
  subtitle: string;
  subtitleEn: string;
  subtitleUr: string;
  imageUrl: string;
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
  title: string;
  titleEn: string;
  titleUr: string;
  subtitle: string;
  subtitleEn: string;
  subtitleUr: string;
  imageUrl: string;
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
    primaryCtaHref: "/auth/register",
    secondaryCtaLabel: "تصفح المناقصات",
    secondaryCtaLabelEn: "Browse Bids",
    secondaryCtaLabelUr: "ٹینڈرز براؤز کریں",
    secondaryCtaHref: "/tenders/projects",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  slides: [
    {
      id: "default-slide-1",
      title: "مناقصات المشاريع",
      titleEn: "Project Bids",
      titleUr: "پروجیکٹ ٹینڈرز",
      subtitle: "اكتشف مناقصات جديدة يومياً",
      subtitleEn: "Discover new bids daily",
      subtitleUr: "روزانہ نئے ٹینڈرز دریافت کریں",
      imageUrl: slideImage,
      linkUrl: "/tenders/projects",
      sortOrder: 0,
      isActive: true,
    },
    {
      id: "default-slide-2",
      title: "سوق البضائع",
      titleEn: "Marketplace",
      titleUr: "بازار",
      subtitle: "مواد بناء بأسعار منافسة",
      subtitleEn: "Building materials at competitive prices",
      subtitleUr: "مسابقتی قیمتوں پر تعمیراتی مواد",
      imageUrl: slideImage,
      linkUrl: "/marketplace",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "default-slide-3",
      title: "عرض المشاريع",
      titleEn: "Project Showcase",
      titleUr: "پروجیکٹ شوکیس",
      subtitle: "استعرض أعمالنا وإنجازاتنا",
      subtitleEn: "Explore our work and achievements",
      subtitleUr: "ہمارا کام اور کامیابیاں دیکھیں",
      imageUrl: slideImage,
      linkUrl: "/projects",
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
      title: "اشترك الآن",
      titleEn: "Subscribe Now",
      titleUr: "ابھی سبسکرائب کریں",
      subtitle: "مزايا حصرية للأعضاء",
      subtitleEn: "Exclusive member benefits",
      subtitleUr: "ممبران کے لیے خصوصی فوائد",
      imageUrl: adImage,
      linkUrl: "/auth/register",
      animation: "fade",
      sortOrder: 0,
      isActive: true,
    },
  ],
};
