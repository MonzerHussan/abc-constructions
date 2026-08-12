"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Video,
  Tag,
  ArrowLeft,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

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

const mockCourse = {
  id: "1",
  title: "إدارة المشاريع الإنشائية - من البداية للنهاية",
  titleEn: "Construction Project Management - Start to Finish",
  instructor: "م. أحمد الفهد",
  instructorTitle: "مدير مشاريع أول - 15 سنة خبرة",
  instructorBio: "خبير في إدارة المشاريع الإنشائية مع أكثر من 15 عامًا من الخبرة في تنفيذ المشاريع الكبرى في المملكة العربية السعودية والخليج. حاصل على شهادة PMP و PRINCE2.",
  instructorAvatar: null,
  rating: 4.8,
  reviews: 1247,
  students: 8560,
  duration: "42 ساعة",
  lessons: 186,
  level: "intermediate",
  price: 199,
  originalPrice: 599,
  thumbnail: null,
  tags: ["مشاريع", "إدارة", "تخطيط", "هندسة مدنية"],
  isBestseller: true,
  updatedAt: "يوليو 2026",
  description:
    "دورة شاملة في إدارة المشاريع الإنشائية تغطي جميع المراحل من التخطيط والتصميم إلى التنفيذ والتسليم. ستتعلم كيفية إدارة الفرق، الجداول الزمنية، الميزانيات، والمخاطر في المشاريع الإنشائية.",
  learn: [
    "إدارة دورة حياة المشروع الإنشائي بالكامل",
    "إعداد الجداول الزمنية والميزانيات بدقة",
    "إدارة المخاطر في المشاريع الإنشائية",
    "قيادة فرق العمل الهندسية بفعالية",
    "استخدام برامج إدارة المشاريع المتخصصة",
    "تطبيق معايير الجودة والسلامة الدولية",
  ],
  curriculum: [
    {
      title: "مقدمة في إدارة المشاريع الإنشائية",
      titleEn: "Introduction to Construction Project Management",
      lessons: [
        { id: "l1", title: "ما هي إدارة المشاريع الإنشائية؟", titleEn: "What is Construction Project Management?", type: "video", duration: "15:30" },
        { id: "l2", title: "دورة حياة المشروع الإنشائي", titleEn: "Construction Project Lifecycle", type: "video", duration: "22:15" },
        { id: "l3", title: "أدوار ومسؤوليات مدير المشروع", titleEn: "Project Manager Roles & Responsibilities", type: "video", duration: "18:45" },
      ],
    },
    {
      title: "التخطيط والجدولة",
      titleEn: "Planning & Scheduling",
      lessons: [
        { id: "l4", title: "هيكل تقسيم العمل (WBS)", titleEn: "Work Breakdown Structure (WBS)", type: "video", duration: "25:00" },
        { id: "l5", title: "الجدول الزمني باستخدام MS Project", titleEn: "Scheduling with MS Project", type: "video", duration: "30:20" },
        { id: "l6", title: "تحليل المسار الحرج", titleEn: "Critical Path Analysis", type: "pdf", duration: "10:00" },
      ],
    },
    {
      title: "إدارة الميزانية والتكاليف",
      titleEn: "Budget & Cost Management",
      lessons: [
        { id: "l7", title: "تقدير التكاليف في المشاريع", titleEn: "Cost Estimation in Projects", type: "video", duration: "20:10" },
        { id: "l8", title: "إدارة التدفقات النقدية", titleEn: "Cash Flow Management", type: "video", duration: "17:40" },
        { id: "l9", title: "اختبار منتصف الدورة", titleEn: "Mid-course Quiz", type: "quiz", duration: "15:00" },
      ],
    },
    {
      title: "إدارة المخاطر والجودة",
      titleEn: "Risk & Quality Management",
      lessons: [
        { id: "l10", title: "تحديد وتحليل المخاطر", titleEn: "Risk Identification & Analysis", type: "video", duration: "28:30" },
        { id: "l11", title: "خطط الاستجابة للمخاطر", titleEn: "Risk Response Plans", type: "pdf", duration: "12:00" },
        { id: "l12", title: "معايير الجودة في الإنشاءات", titleEn: "Quality Standards in Construction", type: "video", duration: "19:55" },
      ],
    },
  ],
};

const lessonTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="w-4 h-4" />,
  pdf: <FileText className="w-4 h-4" />,
  quiz: <HelpCircle className="w-4 h-4" />,
};

const lessonTypeLabelsAr: Record<string, string> = {
  video: "فيديو",
  pdf: "PDF",
  quiz: "اختبار",
};

const lessonTypeLabelsEn: Record<string, string> = {
  video: "Video",
  pdf: "PDF",
  quiz: "Quiz",
};

const lessonTypeLabelsUr: Record<string, string> = {
  video: "ویڈیو",
  pdf: "PDF",
  quiz: "ٹیسٹ",
};

export default function CourseDetailPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [wishlisted, setWishlisted] = useState(false);

  const course = mockCourse;

  const getLevelLabels = () =>
    language === "ar" ? levelLabelsAr : language === "en" ? levelLabelsEn : levelLabelsUr;

  const getLessonTypeLabels = () =>
    language === "ar" ? lessonTypeLabelsAr : language === "en" ? lessonTypeLabelsEn : lessonTypeLabelsUr;

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const countByType = (type: string) => {
    let count = 0;
    for (const section of course.curriculum) {
      count += section.lessons.filter((l) => l.type === type).length;
    }
    return count;
  };

  const totalDuration = course.curriculum.reduce((acc, section) => {
    return (
      acc +
      section.lessons.reduce((sum, l) => {
        const [m] = l.duration.split(":");
        return sum + parseInt(m);
      }, 0)
    );
  }, 0);

  const fullTitle = language === "ar" ? course.title : language === "en" ? course.titleEn : course.title;

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: t("navTraining"), href: "/projects/ABC/training" },
            { label: fullTitle },
          ]}
        />

        {/* Back link */}
        <Link
          href="/projects/ABC/training"
          className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Thumbnail */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-surface-700 via-surface-800 to-surface-900 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-black/20" />
              <button className="relative w-20 h-20 bg-danger-500 hover:bg-danger-600 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-xl">
                <Play className="w-8 h-8 text-white fill-current" />
              </button>
              {course.isBestseller && (
                <span className="absolute top-4 left-4 flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full">
                  <BarChart3 className="w-3.5 h-3.5" />
                  {t("trendingCourses")}
                </span>
              )}
            </div>

            {/* Title & meta */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-surface-900 mb-3 leading-tight">
                {fullTitle}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-surface-500">{t("instructor")}:</span>
                <span className="text-sm font-medium text-surface-900">{course.instructor}</span>
              </div>
              <p className="text-sm text-surface-500 mb-4">{course.instructorTitle}</p>

              {/* Rating & stats row */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-current" />
                  <span className="font-bold text-amber-600">{course.rating}</span>
                  <span className="text-surface-400">
                    ({course.reviews.toLocaleString()} {t("courseRating")})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-surface-500">
                  <Users className="w-4 h-4" />
                  <span>{course.students.toLocaleString()} {t("courseStudents")}</span>
                </div>
                <div className="flex items-center gap-1 text-surface-500">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-surface-500">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.lessons} {t("courseLessons")}</span>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelColors[course.level]}`}
                >
                  {getLevelLabels()[course.level]}
                </span>
              </div>
            </div>

            {/* Price & enroll - mobile */}
            <div className="lg:hidden">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-surface-900">{course.price} {t("currency")}</span>
                    <span className="text-lg text-surface-400 line-through">{course.originalPrice} {t("currency")}</span>
                  </div>
                </div>
                <button className="w-full py-3 bg-danger-500 text-white rounded-xl font-medium hover:bg-danger-600 transition-colors text-lg">
                  {t("enrollNow")}
                </button>
              </Card>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-surface-900 mb-3">{t("description")}</h2>
              <p className="text-surface-600 leading-relaxed">{course.description}</p>
            </div>

            {/* What you'll learn */}
            <Card className="p-6 border-danger-100 bg-danger-50/30">
              <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-danger-600" />
                {language === "ar"
                  ? "ماذا ستتعلم؟"
                  : language === "en"
                  ? "What you'll learn"
                  : "آپ کیا سیکھیں گے؟"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.learn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-danger-100 text-danger-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-surface-700">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Course curriculum accordion */}
            <div>
              <h2 className="text-lg font-bold text-surface-900 mb-4">
                {language === "ar"
                  ? "محتوى الدورة"
                  : language === "en"
                  ? "Course Content"
                  : "کورس کا مواد"}
              </h2>
              <p className="text-sm text-surface-500 mb-4">
                {course.curriculum.length} {language === "ar" ? "أقسام" : language === "en" ? "sections" : "سیکشنز"} · {course.lessons}{" "}
                {language === "ar" ? "درس" : language === "en" ? "lessons" : "ابواب"} · {totalDuration}{" "}
                {language === "ar" ? "دقيقة" : language === "en" ? "min" : "منٹ"}
              </p>
              <div className="space-y-2">
                {course.curriculum.map((section, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <button
                      onClick={() => toggleSection(idx)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-surface-900">
                          {language === "ar" ? section.title : language === "en" ? section.titleEn : section.title}
                        </span>
                        <span className="text-xs text-surface-400">
                          {section.lessons.length} {language === "ar" ? "دروس" : language === "en" ? "lessons" : "ابواب"}
                        </span>
                      </div>
                      {expandedSections.has(idx) ? (
                        <ChevronUp className="w-4 h-4 text-surface-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-surface-400" />
                      )}
                    </button>
                    {expandedSections.has(idx) && (
                      <div className="border-t border-surface-100">
                        {section.lessons.map((lesson) => (
                          <Link
                            key={lesson.id}
                            href={`/projects/ABC/training/${course.id}/lessons/${lesson.id}`}
                            className="flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors border-b border-surface-50 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <span className={lesson.type === "video" ? "text-danger-500" : lesson.type === "pdf" ? "text-info-500" : "text-amber-500"}>
                                {lessonTypeIcons[lesson.type]}
                              </span>
                              <span className="text-sm text-surface-700">
                                {language === "ar" ? lesson.title : language === "en" ? lesson.titleEn : lesson.title}
                              </span>
                              <span className="text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded">
                                {getLessonTypeLabels()[lesson.type]}
                              </span>
                            </div>
                            <span className="text-xs text-surface-400">{lesson.duration}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h2 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-danger-500" />
                {language === "ar" ? "الوسوم" : language === "en" ? "Tags" : "ٹیگز"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm bg-surface-100 text-surface-600 px-3 py-1.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & enroll - desktop */}
            <div className="hidden lg:block sticky top-24">
              <Card className="p-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-surface-900">{course.price} {t("currency")}</span>
                  <span className="text-lg text-surface-400 line-through">{course.originalPrice} {t("currency")}</span>
                </div>
                <button className="w-full py-3 bg-danger-500 text-white rounded-xl font-medium hover:bg-danger-600 transition-colors text-lg mt-4">
                  {t("enrollNow")}
                </button>
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className="w-full py-2.5 mt-2 border border-surface-200 text-surface-600 rounded-xl font-medium hover:bg-surface-50 transition-colors text-sm"
                >
                  {wishlisted ? "♥ " : "♡ "}
                  {t("addToWishlist")}
                </button>

                <div className="border-t border-surface-100 mt-6 pt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t("courseDuration")}
                    </span>
                    <span className="font-medium text-surface-900">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {t("courseLessons")}
                    </span>
                    <span className="font-medium text-surface-900">{course.lessons}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t("courseStudents")}
                    </span>
                    <span className="font-medium text-surface-900">{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      {t("courseLevel")}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelColors[course.level]}`}>
                      {getLevelLabels()[course.level]}
                    </span>
                  </div>
                </div>

                <div className="border-t border-surface-100 mt-6 pt-6">
                  <p className="text-xs text-surface-400 mb-3">
                    {language === "ar"
                      ? "فيديوهات:"
                      : language === "en"
                      ? "Videos:"
                      : "ویڈیوز:"}{" "}
                    {countByType("video")} | PDF: {countByType("pdf")} |{" "}
                    {language === "ar" ? "اختبارات:" : language === "en" ? "Quizzes:" : "ٹیسٹ:"}{" "}
                    {countByType("quiz")}
                  </p>
                  <p className="text-xs text-surface-400">
                    {language === "ar"
                      ? "آخر تحديث:"
                      : language === "en"
                      ? "Last updated:"
                      : "آخری اپ ڈیٹ:"}{" "}
                    {course.updatedAt}
                  </p>
                </div>
              </Card>

              {/* Instructor card */}
              <Card className="p-6 mt-6">
                <h3 className="text-sm font-bold text-surface-900 mb-4">{t("instructor")}</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-danger-400 to-danger-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {course.instructor.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900 text-sm">{course.instructor}</p>
                    <p className="text-xs text-surface-500">{course.instructorTitle}</p>
                  </div>
                </div>
                <p className="text-xs text-surface-600 leading-relaxed">{course.instructorBio}</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile instructor card */}
        <div className="lg:hidden mt-8">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-surface-900 mb-4">{t("instructor")}</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-danger-400 to-danger-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {course.instructor.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-surface-900 text-sm">{course.instructor}</p>
                <p className="text-xs text-surface-500">{course.instructorTitle}</p>
              </div>
            </div>
            <p className="text-xs text-surface-600 leading-relaxed">{course.instructorBio}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
