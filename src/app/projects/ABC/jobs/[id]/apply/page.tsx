"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  ChevronLeft,
  Send,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useState } from "react";

const mockJobs = [
  {
    id: "1",
    title: "مهندس مدني - إدارة المشاريع",
    company: { name: "شركة الإنشاءات الحديثة", initials: "MCO", color: "bg-info-100 text-info-700" },
    location: "الرياض",
    salaryMin: 15000,
    salaryMax: 25000,
    jobType: "FULL_TIME",
  },
  {
    id: "2",
    title: "مقاول بلاط - أعمال التشطيبات الفاخرة",
    company: { name: "مؤسسة البناء الداخلي", initials: "UBI", color: "bg-flagship-100 text-flagship-700" },
    location: "جدة",
    salaryMin: null,
    salaryMax: null,
    jobType: "CONTRACT",
  },
  {
    id: "3",
    title: "فني كهرباء - صيانة وتركيب",
    company: { name: "شركة الكهرباء الحديثة", initials: "MEC", color: "bg-amber-100 text-amber-700" },
    location: "الدمام",
    salaryMin: 6000,
    salaryMax: 9000,
    jobType: "FULL_TIME",
  },
  {
    id: "4",
    title: "مدير مشروع إنشائي - مشاريع فاخرة",
    company: { name: "مجموعة الإنشاءات الكبرى", initials: "GCG", color: "bg-success-100 text-success-700" },
    location: "الرياض",
    salaryMin: 20000,
    salaryMax: 35000,
    jobType: "FULL_TIME",
  },
  {
    id: "5",
    title: "سبّاك - أعمال سباكة مبنى إداري",
    company: { name: "مؤسسة الأعمال الصحية", initials: "PWS", color: "bg-teal-100 text-teal-700" },
    location: "الظهران",
    salaryMin: null,
    salaryMax: null,
    jobType: "CONTRACT",
  },
];

const JOB_TYPE_LABELS: Record<string, { label: string }> = {
  FULL_TIME: { label: "دوام كامل" },
  PART_TIME: { label: "دوام جزئي" },
  CONTRACT: { label: "عقد" },
  FREELANCE: { label: "عمل حر" },
};

export default function ApplyPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const job = mockJobs.find((j) => j.id === params.id);

  if (!job) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-surface-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-surface-900 mb-2">
              {language === "ar" ? "الوظيفة غير موجودة" : language === "en" ? "Job not found" : "ملازمت نہیں ملی"}
            </h2>
            <Link href="/projects/ABC/jobs" className="text-teal-600 hover:text-teal-700 font-medium">
              {t("back")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="max-w-lg mx-auto p-10 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 mb-2">
              {language === "ar" ? "تم تقديم طلبك بنجاح!" : language === "en" ? "Application submitted successfully!" : "آپ کی درخواست کامیابی سے جمع کر دی گئی!"}
            </h2>
            <p className="text-sm text-surface-500 mb-6">
              {language === "ar"
                ? "سيتم مراجعة طلبك من قبل فريق التوظيف والتواصل معك قريباً"
                : language === "en"
                  ? "Your application will be reviewed by the hiring team and they will contact you soon"
                  : "آپ کی درخواست کا جائزہ لیا جائے گا اور جلد ہی آپ سے رابطہ کیا جائے گا"}
            </p>
            <Link
              href="/projects/ABC/jobs"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              {language === "ar" ? "العودة إلى الوظائف" : language === "en" ? "Back to Jobs" : "ملازمتوں پر واپس جائیں"}
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: t("navJobs"), href: "/projects/ABC/jobs" },
            { label: job.title, href: `/projects/ABC/jobs/${job.id}` },
            { label: t("applyNow") },
          ]}
        />

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-surface-600 hover:text-surface-900 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">{t("back")}</span>
        </button>

        {/* Job Summary */}
        <Card className="p-5 mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl ${job.company.color} flex items-center justify-center text-lg font-bold flex-shrink-0`}
            >
              {job.company.initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-surface-900">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-surface-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.company.name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
                {job.salaryMin && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salaryMin.toLocaleString()} - {job.salaryMax!.toLocaleString()} {t("currency")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {JOB_TYPE_LABELS[job.jobType]?.label || job.jobType}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Application Form */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-surface-900">
              {language === "ar" ? "تقديم طلب" : language === "en" ? "Submit Application" : "درخواست جمع کریں"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                {language === "ar" ? "خطاب التقديم" : language === "en" ? "Cover Letter" : "کور لیٹر"}
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "اكتب رسالة تقديم توضح فيها سبب اهتمامك بالوظيفة..."
                    : language === "en"
                      ? "Write a cover letter explaining why you're interested in this position..."
                      : "اس عہدے میں دلچسپی کی وجوہات بیان کرتے ہوئے کور لیٹر لکھیں..."
                }
                rows={6}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                required
              />
            </div>

            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                {language === "ar" ? "رفع السيرة الذاتية" : language === "en" ? "Upload CV" : "CV اپ لوڈ کریں"}
              </label>
              <div className="border-2 border-dashed border-surface-200 rounded-xl p-6 text-center hover:border-teal-500 transition-colors">
                <input
                  type="file"
                  id="cvUpload"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="cvUpload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-surface-400 mx-auto mb-2" />
                  <p className="text-sm text-surface-600">
                    {cvFile
                      ? cvFile.name
                      : language === "ar"
                        ? "اضغط لرفع السيرة الذاتية (PDF, DOC)"
                        : language === "en"
                          ? "Click to upload CV (PDF, DOC)"
                          : "CV اپ لوڈ کرنے کے لیے کلک کریں (PDF, DOC)"}
                  </p>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitting ? t("loading") : t("applyNow")}
              </button>
              <Link
                href={`/projects/ABC/jobs/${job.id}`}
                className="px-6 py-2.5 border border-surface-300 text-surface-700 rounded-xl font-medium hover:bg-surface-50 transition-colors"
              >
                {t("cancel")}
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
