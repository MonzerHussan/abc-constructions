"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Play,
  FileText,
  HelpCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Video,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

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

const mockCourse = {
  id: "1",
  title: "إدارة المشاريع الإنشائية - من البداية للنهاية",
  titleEn: "Construction Project Management - Start to Finish",
};

const mockLessons = [
  { id: "l1", title: "ما هي إدارة المشاريع الإنشائية؟", titleEn: "What is Construction Project Management?", type: "video", duration: "15:30", description: "في هذا الدرس سنتعرف على مفهوم إدارة المشاريع الإنشائية وأهميتها في صناعة البناء والتشييد.", descriptionEn: "In this lesson we'll learn about construction project management and its importance in the building industry." },
  { id: "l2", title: "دورة حياة المشروع الإنشائي", titleEn: "Construction Project Lifecycle", type: "video", duration: "22:15", description: "نستعرض مراحل دورة حياة المشروع الإنشائي من الفكرة إلى التسليم النهائي.", descriptionEn: "We review the construction project lifecycle stages from concept to final delivery." },
  { id: "l3", title: "أدوار ومسؤوليات مدير المشروع", titleEn: "Project Manager Roles & Responsibilities", type: "video", duration: "18:45", description: "تفصيل لأدوار ومسؤوليات مدير المشروع في مختلف مراحل المشروع.", descriptionEn: "Detailed breakdown of project manager roles and responsibilities across project stages." },
  { id: "l4", title: "هيكل تقسيم العمل (WBS)", titleEn: "Work Breakdown Structure (WBS)", type: "video", duration: "25:00", description: "كيفية إعداد هيكل تقسيم العمل كأساس للتخطيط والجدولة.", descriptionEn: "How to create a Work Breakdown Structure as a foundation for planning and scheduling." },
  { id: "l5", title: "الجدول الزمني باستخدام MS Project", titleEn: "Scheduling with MS Project", type: "video", duration: "30:20", description: "تطبيق عملي على برنامج MS Project لإدارة الجداول الزمنية.", descriptionEn: "Hands-on application of MS Project for schedule management." },
  { id: "l6", title: "تحليل المسار الحرج", titleEn: "Critical Path Analysis", type: "pdf", duration: "10:00", description: "ملف PDF يشرح طريقة تحليل المسار الحرج مع أمثلة تطبيقية.", descriptionEn: "PDF document explaining critical path analysis with practical examples." },
  { id: "l7", title: "تقدير التكاليف في المشاريع", titleEn: "Cost Estimation in Projects", type: "video", duration: "20:10", description: "أساليب تقدير التكاليف في المشاريع الإنشائية.", descriptionEn: "Cost estimation methods in construction projects." },
  { id: "l8", title: "إدارة التدفقات النقدية", titleEn: "Cash Flow Management", type: "video", duration: "17:40", description: "كيفية إدارة التدفقات النقدية لضمان استمرارية المشروع.", descriptionEn: "How to manage cash flows to ensure project continuity." },
  { id: "l9", title: "اختبار منتصف الدورة", titleEn: "Mid-course Quiz", type: "quiz", duration: "15:00", description: "اختبار قصير لتقييم فهمك للمفاهيم التي تم تغطيتها.", descriptionEn: "Short quiz to assess your understanding of covered concepts." },
  { id: "l10", title: "تحديد وتحليل المخاطر", titleEn: "Risk Identification & Analysis", type: "video", duration: "28:30", description: "طرق تحديد وتحليل المخاطر في المشاريع الإنشائية.", descriptionEn: "Methods for identifying and analyzing risks in construction projects." },
  { id: "l11", title: "خطط الاستجابة للمخاطر", titleEn: "Risk Response Plans", type: "pdf", duration: "12:00", description: "دليل إرشادي لإعداد خطط الاستجابة للمخاطر.", descriptionEn: "Guide for preparing risk response plans." },
  { id: "l12", title: "معايير الجودة في الإنشاءات", titleEn: "Quality Standards in Construction", type: "video", duration: "19:55", description: "معايير الجودة الدولية وتطبيقها في المشاريع الإنشائية.", descriptionEn: "International quality standards and their application in construction projects." },
];

export default function LessonPlayerPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const course = mockCourse;
  const allLessons = mockLessons;
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const lesson = allLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const getLessonTypeLabels = () =>
    language === "ar" ? lessonTypeLabelsAr : language === "en" ? lessonTypeLabelsEn : lessonTypeLabelsUr;

  const courseTitle = language === "ar" ? course.title : language === "en" ? course.titleEn : course.title;
  const lessonTitle = lesson
    ? language === "ar"
      ? lesson.title
      : language === "en"
      ? lesson.titleEn
      : lesson.title
    : "";
  const lessonDescription = lesson
    ? language === "ar"
      ? lesson.description
      : language === "en"
      ? lesson.descriptionEn
      : lesson.description
    : "";

  const toggleComplete = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-surface-500">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: t("navTraining"), href: "/training" },
            { label: courseTitle, href: `/training/${course.id}` },
            { label: lessonTitle },
          ]}
        />

        {/* Back link */}
        <Link
          href={`/training/${course.id}`}
          className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")} {t("navTraining")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main player area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Lesson header */}
            <div>
              <p className="text-sm text-danger-600 font-medium mb-1">
                {courseTitle}
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-surface-900">
                {lessonTitle}
              </h1>
            </div>

            {/* Player placeholder */}
            {lesson.type === "video" && (
              <div className="aspect-video bg-gradient-to-br from-surface-700 via-surface-800 to-surface-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative text-center">
                  <button className="w-16 h-16 md:w-20 md:h-20 bg-danger-500 hover:bg-danger-600 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-xl mx-auto mb-3">
                    <Play className="w-7 h-7 md:w-8 h-8 text-white fill-current" />
                  </button>
                  <p className="text-white/60 text-xs">
                    {lesson.duration} · {getLessonTypeLabels()[lesson.type]}
                  </p>
                </div>
              </div>
            )}

            {lesson.type === "pdf" && (
              <Card className="p-12 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-info-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-info-500" />
                </div>
                <p className="text-lg font-semibold text-surface-900 mb-2">
                  {language === "ar" ? "عرض PDF" : language === "en" ? "PDF Viewer" : "PDF دیکھیں"}
                </p>
                <p className="text-sm text-surface-500 mb-4">{lesson.description}</p>
                <button className="px-6 py-2.5 bg-info-500 text-white rounded-lg font-medium hover:bg-info-600 transition-colors text-sm">
                  {language === "ar" ? "تحميل PDF" : language === "en" ? "Download PDF" : "PDF ڈاؤن لوڈ کریں"}
                </button>
              </Card>
            )}

            {lesson.type === "quiz" && (
              <Card className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-2">
                    {language === "ar" ? "اختبار قصير" : language === "en" ? "Quiz" : "ٹیسٹ"}
                  </h3>
                  <p className="text-sm text-surface-500">{lesson.description}</p>
                </div>
                <div className="space-y-4 mb-6">
                  <p className="text-sm font-medium text-surface-700">
                    {language === "ar"
                      ? "سؤال 1: ما هو هيكل تقسيم العمل (WBS)؟"
                      : language === "en"
                      ? "Question 1: What is a Work Breakdown Structure (WBS)?"
                      : "سوال 1: ورک بریک ڈاؤن سٹرکچر (WBS) کیا ہے؟"}
                  </p>
                  {["أداة لتقسيم المشروع إلى أجزاء صغيرة قابلة للإدارة", "نوع من الميزانيات", "جدول زمني", "تقرير أداء"].map(
                    (opt, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-3 border border-surface-200 rounded-lg cursor-pointer hover:bg-surface-50 transition-colors"
                      >
                        <input type="radio" name={`q1`} className="accent-danger-500" />
                        <span className="text-sm text-surface-700">{opt}</span>
                      </label>
                    )
                  )}
                </div>
                <button className="px-6 py-2.5 bg-danger-500 text-white rounded-lg font-medium hover:bg-danger-600 transition-colors text-sm">
                  {language === "ar" ? "إرسال الإجابة" : language === "en" ? "Submit Answer" : "جواب جمع کریں"}
                </button>
              </Card>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-surface-900 mb-2">{t("description")}</h3>
              <p className="text-surface-600 leading-relaxed">{lessonDescription}</p>
            </div>

            {/* Navigation & Complete */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-surface-200">
              <div className="flex gap-3">
                {prevLesson ? (
                  <Link
                    href={`/training/${course.id}/lessons/${prevLesson.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-surface-200 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {language === "ar" ? "السابق" : language === "en" ? "Previous" : "پچھلا"}
                  </Link>
                ) : (
                  <span />
                )}
                {nextLesson ? (
                  <Link
                    href={`/training/${course.id}/lessons/${nextLesson.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-surface-200 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                  >
                    {language === "ar" ? "التالي" : language === "en" ? "Next" : "اگلا"}
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                ) : null}
              </div>
              <button
                onClick={() => toggleComplete(lesson.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  completed.has(lesson.id)
                    ? "bg-success-100 text-success-700 border border-success-200"
                    : "bg-danger-500 text-white hover:bg-danger-600"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {completed.has(lesson.id)
                  ? language === "ar"
                    ? "تم الإكمال"
                    : language === "en"
                    ? "Completed"
                    : "مکمل"
                  : language === "ar"
                  ? "وضع كمكتمل"
                  : language === "en"
                  ? "Mark as Complete"
                  : "مکمل کریں"}
              </button>
            </div>
          </div>

          {/* Sidebar - lesson list */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-surface-100 bg-surface-50">
                  <h3 className="text-sm font-bold text-surface-900">
                    {language === "ar" ? "محتوى الدورة" : language === "en" ? "Course Content" : "کورس کا مواد"}
                  </h3>
                  <p className="text-xs text-surface-500 mt-1">
                    {allLessons.length} {language === "ar" ? "درس" : language === "en" ? "lessons" : "ابواب"}
                  </p>
                </div>
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {allLessons.map((l, i) => {
                    const isActive = l.id === lesson.id;
                    const isCompleted = completed.has(l.id);
                    const langTitle = language === "ar" ? l.title : language === "en" ? l.titleEn : l.title;
                    return (
                      <Link
                        key={l.id}
                        href={`/training/${course.id}/lessons/${l.id}`}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-surface-50 transition-colors ${
                          isActive
                            ? "bg-danger-50 border-r-2 border-danger-500"
                            : "hover:bg-surface-50"
                        }`}
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-100 text-xs font-medium text-surface-500 flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-success-500" />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm truncate ${
                              isActive ? "font-semibold text-danger-700" : "text-surface-700"
                            }`}
                          >
                            {langTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-surface-400 flex items-center gap-1">
                              {lessonTypeIcons[l.type]}
                              {getLessonTypeLabels()[l.type]}
                            </span>
                            <span className="text-xs text-surface-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {l.duration}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
