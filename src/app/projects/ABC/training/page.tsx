"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useLanguage } from "@/lib/LanguageContext";
import {
  GraduationCap,
  Clock,
  Users,
  Star,
  Play,
  BookOpen,
  Award,
  TrendingUp,
  Search,
  Filter,
  Heart,
  BarChart3,
  Flame,
} from "lucide-react";
import { useState } from "react";

const skillPaths = [
  { labelAr: "إدارة المشاريع الإنشائية", labelEn: "Construction Project Management", labelUr: "تعمیراتی پروجیکٹ مینجمنٹ", courses: 12, color: "from-info-500 to-info-600" },
  { labelAr: "السلامة والصحة المهنية", labelEn: "Occupational Health & Safety", labelUr: "پیشہ ورانہ صحت و حفاظت", courses: 8, color: "from-success-500 to-success-600" },
  { labelAr: "التصميم المعماري", labelEn: "Architectural Design", labelUr: "عمارتی ڈیزائن", courses: 15, color: "from-flagship-500 to-flagship-600" },
  { labelAr: "البناء الخرساني", labelEn: "Concrete Construction", labelUr: "کنکریٹ تعمیر", courses: 10, color: "from-amber-500 to-amber-500" },
  { labelAr: "التشطيبات الداخلية", labelEn: "Interior Finishing", labelUr: "اندرونی تشطيبات", courses: 9, color: "from-danger-500 to-danger-600" },
  { labelAr: "أنظمة الكهرباء", labelEn: "Electrical Systems", labelUr: "بجلی کے نظام", courses: 11, color: "from-teal-500 to-teal-600" },
];

const mockCourses = [
  {
    id: "1",
    title: "إدارة المشاريع الإنشائية - من البداية للنهاية",
    titleEn: "Construction Project Management - Start to Finish",
    instructor: "م. أحمد الفهد",
    instructorTitle: "مدير مشاريع أول - 15 سنة خبرة",
    rating: 4.8,
    reviews: 1247,
    students: 8560,
    duration: "42 ساعة",
    lessons: 186,
    level: "intermediate",
    price: 199,
    originalPrice: 599,
    thumbnail: null,
    tags: ["مشاريع", "إدارة", "تخطيط"],
    isBestseller: true,
    updatedAt: "يوليو 2026",
  },
  {
    id: "2",
    title: "السلامة على مواقع البناء - دورة شاملة",
    titleEn: "Construction Site Safety - Comprehensive Course",
    instructor: "د. فاطمة الزهراني",
    instructorTitle: "خبيرة سلامة - معتمدة من OSHA",
    rating: 4.9,
    reviews: 892,
    students: 6340,
    duration: "28 ساعة",
    lessons: 124,
    level: "beginner",
    price: 149,
    originalPrice: 449,
    thumbnail: null,
    tags: ["سلامة", "صحة مهنية", "مواقع بناء"],
    isBestseller: true,
    updatedAt: "يونيو 2026",
  },
  {
    id: "3",
    title: "قراءة المخططات الهندسية like a Pro",
    titleEn: "Reading Engineering Blueprints like a Pro",
    instructor: "م. خالد العمري",
    instructorTitle: "مهندس مدني - مستشار",
    rating: 4.7,
    reviews: 634,
    students: 4120,
    duration: "18 ساعة",
    lessons: 78,
    level: "intermediate",
    price: 129,
    originalPrice: 399,
    thumbnail: null,
    tags: ["مخططات", "هندسة مدنية", "رسومات"],
    isBestseller: false,
    updatedAt: "مارس 2026",
  },
  {
    id: "4",
    title: "أعمال الخرسانات المسلحة - تطبيقات عملية",
    titleEn: "Reinforced Concrete Works - Practical Applications",
    instructor: "م. نورة السالم",
    instructorTitle: "مهندسة إنشائية - خبرة 12 سنة",
    rating: 4.6,
    reviews: 478,
    students: 3210,
    duration: "35 ساعة",
    lessons: 152,
    level: "advanced",
    price: 249,
    originalPrice: 699,
    thumbnail: null,
    tags: ["خرسانة", "حديد", "حساب هيكل"],
    isBestseller: false,
    updatedAt: "أبريل 2026",
  },
  {
    id: "5",
    title: "أساسيات الـ BIM للمهندسين المبتدئين",
    titleEn: "BIM Fundamentals for Beginner Engineers",
    instructor: "م. سعد الدوسري",
    instructorTitle: "خبير BIM - شهادة Autodesk",
    rating: 4.8,
    reviews: 1089,
    students: 7890,
    duration: "30 ساعة",
    lessons: 134,
    level: "beginner",
    price: 179,
    originalPrice: 549,
    thumbnail: null,
    tags: ["BIM", "Revit", "تصميم رقمي"],
    isBestseller: true,
    updatedAt: "مايو 2026",
  },
  {
    id: "6",
    title: "تقنيات التشطيبات الفاخرة",
    titleEn: "Luxury Finishing Techniques",
    instructor: "م. ريم الحربي",
    instructorTitle: "مصممة داخليات - حائزة على جوائز",
    rating: 4.5,
    reviews: 356,
    students: 2140,
    duration: "22 ساعة",
    lessons: 96,
    level: "advanced",
    price: 169,
    originalPrice: 499,
    thumbnail: null,
    tags: ["تشطيبات", "تصميم داخلي", "فاخر"],
    isBestseller: false,
    updatedAt: "يونيو 2026",
  },
];

const levelColors: Record<string, string> = {
  beginner: "bg-success-100 text-success-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-danger-100 text-danger-700",
};

const levelLabelsAr: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const levelLabelsEn: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const levelLabelsUr: Record<string, string> = {
  beginner: "مبتدی",
  intermediate: "درمیانی",
  advanced: "پیشرفہ",
};

export default function TrainingPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"all" | "bestseller" | "new">("all");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const getLevelLabels = () => language === "ar" ? levelLabelsAr : language === "en" ? levelLabelsEn : levelLabelsUr;

  const filteredCourses = mockCourses.filter((c) => {
    if (activeTab === "bestseller" && !c.isBestseller) return false;
    if (activeTab === "new" && c.updatedAt.includes("يوليو") === false && !c.updatedAt.includes("June")) return false;
    if (search && !c.title.includes(search) && !c.titleEn.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: t("navTraining") }]} />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-danger-600" />
              {t("trainingTitle")}
            </h1>
            <p className="text-surface-600 mt-1">{t("trainingDescription")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search") + "..."}
                className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-danger-500 focus:border-danger-500 outline-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-info-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-surface-900">120+</p>
            <p className="text-sm text-surface-500">{t("browseCourses")}</p>
          </Card>
          <Card className="p-4 text-center">
            <Users className="w-8 h-8 text-success-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-surface-900">15,000+</p>
            <p className="text-sm text-surface-500">{t("courseStudents")}</p>
          </Card>
          <Card className="p-4 text-center">
            <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-surface-900">45+</p>
            <p className="text-sm text-surface-500">{t("instructor")}</p>
          </Card>
          <Card className="p-4 text-center">
            <BarChart3 className="w-8 h-8 text-flagship-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-surface-900">92%</p>
            <p className="text-sm text-surface-500">{t("courseRating")}</p>
          </Card>
        </div>

        {/* Skill Paths */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-danger-500" />
            {t("skillPaths")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {skillPaths.map((path) => (
              <button
                key={path.labelEn}
                className={`bg-gradient-to-br ${path.color} text-white rounded-xl p-4 text-center card-hover`}
              >
                <p className="font-bold text-sm">{language === "ar" ? path.labelAr : language === "en" ? path.labelEn : path.labelUr}</p>
                <p className="text-xs opacity-80 mt-1">{path.courses} {t("browseCourses")}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-surface-200 pb-0">
          {(["all", "bestseller", "new"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? "border-danger-500 text-danger-600"
                  : "border-transparent text-surface-500 hover:text-surface-700"
              }`}
            >
              {tab === "all" ? t("all") : tab === "bestseller" ? t("trendingCourses") : t("newest")}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} hover className="overflow-hidden flex flex-col">
              {/* Thumbnail placeholder */}
              <div className="h-44 bg-gradient-to-br from-surface-700 to-surface-900 flex items-center justify-center relative">
                <Play className="w-12 h-12 text-white/80" />
                {course.isBestseller && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
                    <Flame className="w-3 h-3" />
                    {t("trendingCourses")}
                  </span>
                )}
                <button
                  onClick={() => setWishlist((prev) => {
                    const next = new Set(prev);
                    if (next.has(course.id)) next.delete(course.id);
                    else next.add(course.id);
                    return next;
                  })}
                  className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${wishlist.has(course.id) ? "text-danger-400 fill-current" : "text-white"}`} />
                </button>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[course.level]}`}>
                    {getLevelLabels()[course.level]}
                  </span>
                  <span className="text-xs text-surface-400">{course.updatedAt}</span>
                </div>

                <h3 className="font-bold text-surface-900 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-surface-500 mb-3">{course.instructor}</p>

                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-sm font-bold text-amber-600">{course.rating}</span>
                  <span className="text-xs text-surface-400">({course.reviews.toLocaleString()})</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-surface-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {course.lessons} {language === "ar" ? "درس" : language === "en" ? "lessons" : "ابواب"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.students.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {course.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-surface-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-surface-900">{course.price} {t("currency")}</span>
                    <span className="text-sm text-surface-400 line-through">{course.originalPrice}</span>
                  </div>
                  <button className="px-4 py-2 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600 transition-colors">
                    {t("enrollNow")}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Instructors CTA */}
        <div className="mt-12">
          <Card className="p-8 bg-gradient-to-br from-danger-50 to-amber-50 border-danger-100 text-center">
            <Award className="w-12 h-12 text-danger-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 mb-2">
              {language === "ar" ? "أنت مدرب محترف؟" : language === "en" ? "Are you a professional instructor?" : "کیا آپ پیشہ ورانہ ٹرینر ہیں؟"}
            </h3>
            <p className="text-surface-600 mb-4 max-w-lg mx-auto">
              {language === "ar"
                ? "انضم إلى فريق المدربين وشارك خبراتك مع آلاف الطلاب في قطاع الإنشاءات"
                : language === "en"
                ? "Join our instructor team and share your expertise with thousands of construction students"
                : "ہماری ٹرینر ٹیم میں شامل ہوں اور تعمیراتی طلباء کے ساتھ اپنی مہارت شیئر کریں"}
            </p>
            <button className="px-6 py-3 bg-danger-500 text-white rounded-xl font-medium hover:bg-danger-600 transition-colors">
              {language === "ar" ? "قدّم طلبك" : language === "en" ? "Apply Now" : "ابھی درخواست دیں"}
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
