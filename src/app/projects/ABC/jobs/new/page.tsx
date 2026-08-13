"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Briefcase,
  ChevronLeft,
  Send,
  DollarSign,
  MapPin,
  FileText,
  ListChecks,
  Gift,
  Users,
  AlertTriangle,
} from "lucide-react";

const CATEGORIES = [
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
  "إدارة المشاريع",
  "الأمن والسلامة",
];

const JOB_TYPE_OPTIONS = [
  { value: "FULL_TIME", labelAr: "دوام كامل", labelEn: "Full Time", labelUr: "پورا وقت" },
  { value: "PART_TIME", labelAr: "دوام جزئي", labelEn: "Part Time", labelUr: "جزوی وقت" },
  { value: "CONTRACT", labelAr: "عقد", labelEn: "Contract", labelUr: "معاہدہ" },
  { value: "FREELANCE", labelAr: "عمل حر", labelEn: "Freelance", labelUr: "فری لانس" },
];

export default function NewJobPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    jobType: "FULL_TIME",
    location: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    benefits: "",
    vacancies: "1",
    isUrgent: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.push("/projects/ABC/jobs");
    }, 1000);
  };

  const label = (ar: string, en: string, ur: string) =>
    language === "ar" ? ar : language === "en" ? en : ur;

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: t("navJobs"), href: "/projects/ABC/jobs" }, { label: t("postJob") }]} />

        <Link
          href="/projects/ABC/jobs"
          className="flex items-center gap-1.5 text-surface-600 hover:text-surface-900 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">{t("back")}</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{t("postJob")}</h1>
            <p className="text-sm text-surface-500">
              {label("انشر وظيفة جديدة", "Post a new job", "نئی ملازمت شائع کریں")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-600" />
              {label("معلومات الوظيفة", "Job Information", "ملازمت کی معلومات")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  {label("المسمى الوظيفي", "Job Title", "ملازمت کا عنوان")}
                </label>
                <input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder={label("أدخل المسمى الوظيفي", "Enter job title", "ملازمت کا عنوان درج کریں")}
                  className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    {t("category")}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    required
                  >
                    <option value="">
                      {label("اختر التصنيف", "Select category", "زمرہ منتخب کریں")}
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    {label("نوع الوظيفة", "Job Type", "ملازمت کی قسم")}
                  </label>
                  <select
                    value={form.jobType}
                    onChange={(e) => updateField("jobType", e.target.value)}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  >
                    {JOB_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value === "FULL_TIME"
                          ? t("fullTime")
                          : opt.value === "PART_TIME"
                            ? t("partTime")
                            : opt.value === "CONTRACT"
                              ? t("contract")
                              : t("freelance")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    <MapPin className="w-3.5 h-3.5 inline text-teal-600 ml-1" />
                    {t("location")}
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder={label("أدخل الموقع", "Enter location", "مقام درج کریں")}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    <Users className="w-3.5 h-3.5 inline text-teal-600 ml-1" />
                    {t("vacancies")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.vacancies}
                    onChange={(e) => updateField("vacancies", e.target.value)}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    <DollarSign className="w-3.5 h-3.5 inline text-teal-600 ml-1" />
                    {label("الحد الأدنى للراتب", "Min Salary", "کم از کم تنخواہ")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.salaryMin}
                    onChange={(e) => updateField("salaryMin", e.target.value)}
                    placeholder={label("أدخل الحد الأدنى", "Enter min salary", "کم از کم درج کریں")}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    <DollarSign className="w-3.5 h-3.5 inline text-teal-600 ml-1" />
                    {label("الحد الأقصى للراتب", "Max Salary", "زیادہ سے زیادہ تنخواہ")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.salaryMax}
                    onChange={(e) => updateField("salaryMax", e.target.value)}
                    placeholder={label("أدخل الحد الأقصى", "Enter max salary", "زیادہ سے زیادہ درج کریں")}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={form.isUrgent}
                  onChange={(e) => updateField("isUrgent", e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-surface-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="isUrgent" className="text-sm text-surface-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-danger-500" />
                  {t("urgent")}
                </label>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              {t("description")}
            </h2>
            <div>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder={label(
                  "أدخل وصف الوظيفة بالتفصيل...",
                  "Enter detailed job description...",
                  "ملازمت کی تفصیل درج کریں..."
                )}
                rows={6}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                required
              />
            </div>
          </Card>

          {/* Requirements */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-teal-600" />
              {t("requirements")}
            </h2>
            <div>
              <textarea
                value={form.requirements}
                onChange={(e) => updateField("requirements", e.target.value)}
                placeholder={label(
                  "أدخل المتطلبات (كل متطلب في سطر جديد)...",
                  "Enter requirements (one per line)...",
                  "ضروریات درج کریں (ایک فی لائن)..."
                )}
                rows={4}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
              />
            </div>
          </Card>

          {/* Benefits */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-teal-600" />
              {t("benefits")}
            </h2>
            <div>
              <textarea
                value={form.benefits}
                onChange={(e) => updateField("benefits", e.target.value)}
                placeholder={label(
                  "أدخل المزايا (كل ميزة في سطر جديد)...",
                  "Enter benefits (one per line)...",
                  "فوائد درج کریں (ایک فی لائن)..."
                )}
                rows={4}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
              />
            </div>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? t("loading") : t("submit")}
            </button>
            <Link
              href="/projects/ABC/jobs"
              className="px-6 py-2.5 border border-surface-300 text-surface-700 rounded-xl font-medium hover:bg-surface-50 transition-colors"
            >
              {t("cancel")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
