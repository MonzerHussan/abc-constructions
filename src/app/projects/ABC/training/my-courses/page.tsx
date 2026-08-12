"use client";

import Link from "next/link";
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
  ArrowLeft,
  CheckCircle2,
  Download,
  GraduationCap,
  TrendingUp,
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

const mockEnrolledCourses = [
  {
    id: "1",
    title: "إدارة المشاريع الإنشائية - من البداية للنهاية",
    titleEn: "Construction Project Management - Start to Finish",
    instructor: "م. أحمد الفهد",
    progress: 68,
    totalLessons: 186,
    completedLessons: 126,
    level: "intermediate",
    rating: 4.8,
    thumbnail: null,
  },
  {
    id: "2",
    title: "السلامة على مواقع البناء - دورة شاملة",
    titleEn: "Construction Site Safety - Comprehensive Course",
    instructor: "د. فاطمة الزهراني",
    progress: 100,
    totalLessons: 124,
    completedLessons: 124,
    level: "beginner",
    rating: 4.9,
    thumbnail: null,
  },
  {
    id: "5",
    title: "أساسيات الـ BIM للمهندسين المبتدئين",
    titleEn: "BIM Fundamentals for Beginner Engineers",
    instructor: "م. سعد الدوسري",
    progress: 35,
    totalLessons: 134,
    completedLessons: 47,
    level: "beginner",
    rating: 4.8,
    thumbnail: null,
  },
];

const mockCertificates = [
  {
    id: "c1",
    courseTitle: "السلامة على مواقع البناء - دورة شاملة",
    courseTitleEn: "Construction Site Safety - Comprehensive Course",
    issueDate: "15 يونيو 2026",
    issueDateEn: "June 15, 2026",
    certificateId: "ABC-CERT-2026-0042",
    instructor: "د. فاطمة الزهراني",
  },
  {
    id: "c2",
    courseTitle: "أساسيات إدارة المشاريع",
    courseTitleEn: "Project Management Fundamentals",
    issueDate: "20 مارس 2026",
    issueDateEn: "March 20, 2026",
    certificateId: "ABC-CERT-2026-0028",
    instructor: "م. أحمد الفهد",
  },
];

export default function MyCoursesPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"courses" | "certificates">("courses");

  const getLevelLabels = () =>
    language === "ar" ? levelLabelsAr : language === "en" ? levelLabelsEn : levelLabelsUr;

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: t("navTraining"), href: "/projects/ABC/training" }, { label: t("myCourses") }]} />

        {/* Back link */}
        <Link
          href="/projects/ABC/training"
          className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-danger-600" />
              {t("myCourses")}
            </h1>
            <p className="text-surface-600 mt-1">{t("trainingDescription")}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-surface-200 pb-0">
          {(["courses", "certificates"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2 ${
                activeTab === tab
                  ? "border-danger-500 text-danger-600"
                  : "border-transparent text-surface-500 hover:text-surface-700"
              }`}
            >
              {tab === "courses" ? (
                <BookOpen className="w-4 h-4" />
              ) : (
                <Award className="w-4 h-4" />
              )}
              {tab === "courses" ? t("myCourses") : t("certificates")}
            </button>
          ))}
        </div>

        {/* My Courses */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEnrolledCourses.map((course) => {
              const isCompleted = course.progress === 100;
              const title = language === "ar" ? course.title : language === "en" ? course.titleEn : course.title;

              return (
                <Card key={course.id} className="overflow-hidden flex flex-col">
                  {/* Thumbnail */}
                  <div className="h-36 bg-gradient-to-br from-surface-700 to-surface-900 flex items-center justify-center relative">
                    <Play className="w-10 h-10 text-white/60" />
                    {isCompleted && (
                      <span className="absolute top-3 left-3 flex items-center gap-1 bg-success-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {t("completedCourse")}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[course.level]}`}>
                        {getLevelLabels()[course.level]}
                      </span>
                    </div>

                    <h3 className="font-bold text-surface-900 mb-1 line-clamp-2 leading-snug">{title}</h3>
                    <p className="text-sm text-surface-500 mb-3">{course.instructor}</p>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-surface-500">{t("progress")}</span>
                        <span className={`font-semibold ${isCompleted ? "text-success-600" : "text-danger-600"}`}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? "bg-success-500" : "bg-danger-500"
                          }`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-surface-400 mb-4">
                      {course.completedLessons}/{course.totalLessons} {t("courseLessons")}
                    </p>

                    <Link
                      href={`/projects/ABC/training/${course.id}`}
                      className={`mt-auto w-full py-2.5 rounded-lg text-sm font-medium transition-colors text-center block ${
                        isCompleted
                          ? "bg-surface-100 text-surface-600 hover:bg-surface-200"
                          : course.progress > 0
                          ? "bg-danger-500 text-white hover:bg-danger-600"
                          : "bg-danger-500 text-white hover:bg-danger-600"
                      }`}
                    >
                      {isCompleted
                        ? t("completedCourse")
                        : course.progress > 0
                        ? t("continueCourse")
                        : t("startCourse")}
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Certificates */}
        {activeTab === "certificates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockCertificates.map((cert) => {
              const certTitle = language === "ar" ? cert.courseTitle : language === "en" ? cert.courseTitleEn : cert.courseTitle;
              const issueDate = language === "ar" ? cert.issueDate : language === "en" ? cert.issueDateEn : cert.issueDate;

              return (
                <Card key={cert.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-danger-400 to-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-surface-900 mb-1 line-clamp-2">{certTitle}</h3>
                        <p className="text-sm text-surface-500 mb-1">{cert.instructor}</p>
                        <p className="text-xs text-surface-400">
                          {issueDate} · {cert.certificateId}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-5 pt-0">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-danger-50 text-danger-600 rounded-lg text-sm font-medium hover:bg-danger-100 transition-colors">
                      <Download className="w-4 h-4" />
                      {language === "ar" ? "تحميل الشهادة" : language === "en" ? "Download Certificate" : "سرٹیفکیٹ ڈاؤن لوڈ کریں"}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
