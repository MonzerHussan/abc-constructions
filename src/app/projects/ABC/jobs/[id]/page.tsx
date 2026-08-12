"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JOB_TYPES } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Bookmark,
  Zap,
  Building2,
  ArrowRight,
  CheckCircle2,
  Send,
  Globe,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

const mockJobs = [
  {
    id: "1",
    title: "مهندس مدني - إدارة المشاريع",
    description:
      "نبحث عن مهندس مدني ذي خبرة في إدارة المشاريع الإنشائية الكبيرة. المسئوليات تشمل التخطيط والمتابعة والإشراف على فرق العمل.ensure delivery on time.\n\nالمسؤوليات:\n- الإشراف على تنفيذ المشاريع الإنشائية\n- إدارة فرق العمل والمقاولين\n- إعداد التقارير الدورية\n- متابعة الجداول الزمنية والميزانيات\n- التنسيق مع الجهات المعنية",
    category: "إدارة المشاريع",
    jobType: "FULL_TIME",
    salaryMin: 15000,
    salaryMax: 25000,
    location: "الرياض",
    remote: false,
    requirements: [
      "بكالوريوس هندسة مدنية",
      "خبرة 5+ سنوات في إدارة المشاريع",
      "شهادة PMP مفضّلة",
      "إجادة استخدام MS Project",
      "مهارات قيادية وتواصل ممتازة",
      "إجادة اللغة الإنجليزية",
    ],
    benefits: [
      "تأمين صحي شامل",
      "مكافأة سنوية",
      "سائق شخصي",
      "إجازات مدفوعة",
      "تذاكر سفر سنوية",
      "بدل سكن",
    ],
    vacancies: 3,
    isUrgent: true,
    isFeatured: true,
    easyApply: true,
    company: {
      name: "شركة الإنشاءات الحديثة",
      initials: "MCO",
      color: "bg-info-100 text-info-700",
      size: "201-500",
      industry: "Construction & Engineering",
      location: "الرياض، المملكة العربية السعودية",
      website: "www.mco.com.sa",
      followers: "12,450",
      description:
        "شركة الإنشاءات الحديثة هي إحدى الشركات الرائدة في مجال الإنشاءات والمقاولات في المملكة العربية السعودية، تأسست عام 2005 وتخصصت في تنفيذ المشاريع الكبرى.",
    },
    applicants: 24,
    postedAt: "2026-07-26",
    skills: ["إدارة المشاريع", "هندسة مدنية", "MS Project", "PMP"],
  },
  {
    id: "2",
    title: "مقاول بلاط - أعمال التشطيبات الفاخرة",
    description:
      "مقاول بلاط محترف لتركيب البلاط والسيراميك في مشروع سكني فاخر. يتطلب دقة عالية في الأعمال.",
    category: "البلاط والسيراميك",
    jobType: "CONTRACT",
    salaryMin: null,
    salaryMax: null,
    location: "جدة",
    remote: false,
    requirements: ["خبرة 3+ سنوات", "مهارة عالية في التراص", "قدرة على قراءة المخططات"],
    benefits: ["سكن", "وجبات", "أدوات عمل"],
    vacancies: 8,
    isUrgent: false,
    isFeatured: false,
    easyApply: false,
    company: {
      name: "مؤسسة البناء الداخلي",
      initials: "UBI",
      color: "bg-flagship-100 text-flagship-700",
      size: "11-50",
      industry: "Interior Design & Finishing",
      location: "جدة، المملكة العربية السعودية",
      website: "www.ubi.com.sa",
      followers: "3,200",
      description:
        "مؤسسة البناء الداخلي متخصصة في أعمال التشطيبات الداخلية والديكور.",
    },
    applicants: 15,
    postedAt: "2026-07-25",
    skills: ["بلاط", "سيراميك", "تشطيبات"],
  },
  {
    id: "3",
    title: "فني كهرباء - صيانة وتركيب",
    description:
      "فني كهرباء للعمل في مجمع تجاري كبير. يتضمن العمل صيانة الأنظمة الكهربائية وإصلاح الأعطال.",
    category: "الكهرباء",
    jobType: "FULL_TIME",
    salaryMin: 6000,
    salaryMax: 9000,
    location: "الدمام",
    remote: false,
    requirements: ["شهادة فني كهرباء", "رخصة قيادة", "خبرة سنة على الأقل"],
    benefits: ["تأمين", "إجازات مدفوعة", "نقل جماعي"],
    vacancies: 5,
    isUrgent: true,
    isFeatured: true,
    easyApply: true,
    company: {
      name: "شركة الكهرباء الحديثة",
      initials: "MEC",
      color: "bg-amber-100 text-amber-700",
      size: "51-200",
      industry: "Electrical Engineering",
      location: "الدمام، المملكة العربية السعودية",
      website: "www.mec.com.sa",
      followers: "8,780",
      description:
        "شركة الكهرباء الحديثة متخصصة في حلول الطاقة الكهربائية والصيانة.",
    },
    applicants: 32,
    postedAt: "2026-07-24",
    skills: ["كهرباء", "صيانة", "تركيب"],
  },
  {
    id: "4",
    title: "مدير مشروع إنشائي - مشاريع فاخرة",
    description:
      "مدير مشروع ذي خبرة واسعة في إدارة المشاريع الإنشائية الكبرى. المسئوليات تشمل إدارة الفرق والميزانية والجدول الزمني.",
    category: "إدارة المشاريع",
    jobType: "FULL_TIME",
    salaryMin: 20000,
    salaryMax: 35000,
    location: "الرياض",
    remote: false,
    requirements: ["بكالوريوس/ماجستير هندسة مدنية", "10+ سنوات خبرة", "PMP", " Leadership"],
    benefits: ["راتب مجزي", "سيارة", "سكن", "مكافأة أداء"],
    vacancies: 1,
    isUrgent: true,
    isFeatured: true,
    easyApply: false,
    company: {
      name: "مجموعة الإنشاءات الكبرى",
      initials: "GCG",
      color: "bg-success-100 text-success-700",
      size: "501-1000",
      industry: "Construction & Development",
      location: "الرياض، المملكة العربية السعودية",
      website: "www.gcg.com.sa",
      followers: "22,100",
      description:
        "مجموعة الإنشاءات الكبرى من أكبر شركات التطوير العقاري والإنشاءات في المنطقة.",
    },
    applicants: 8,
    postedAt: "2026-07-22",
    skills: ["إدارة المشاريع", "بناء", "ريادة", "تخطيط"],
  },
  {
    id: "5",
    title: "سبّاك - أعمال سباكة مبنى إداري",
    description:
      "سبّاك محترف لتنفيذ أعمال سباكة مبنى إداري من 10 طوابق. يتطلب خبرة في أنظمة السباكة الحديثة.",
    category: "السباكة",
    jobType: "CONTRACT",
    salaryMin: null,
    salaryMax: null,
    location: "الظهران",
    remote: false,
    requirements: ["خبرة 5+ سنوات", "إمكانيات العمل في بيئة متنوعة"],
    benefits: ["أجور مجزية حسب الإنجاز"],
    vacancies: 4,
    isUrgent: false,
    isFeatured: false,
    easyApply: true,
    company: {
      name: "مؤسسة الأعمال الصحية",
      initials: "PWS",
      color: "bg-teal-100 text-teal-700",
      size: "11-50",
      industry: "Plumbing & Sanitary",
      location: "الظهران، المملكة العربية السعودية",
      website: "www.pws.com.sa",
      followers: "2,100",
      description:
        "مؤسسة الأعمال الصحية متخصصة في أعمال السباكة والأنظمة الصحية.",
    },
    applicants: 11,
    postedAt: "2026-07-23",
    skills: ["سباكة", "أنابيب", "صيانة"],
  },
];

export default function JobDetailPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

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
              {language === "ar" ? "العودة إلى الوظائف" : language === "en" ? "Back to Jobs" : "ملازمتوں پر واپس جائیں"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const similarJobs = mockJobs.filter(
    (j) => j.id !== job.id && j.category === job.category
  ).slice(0, 3);

  const timeAgoLabel = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diff === 0) return language === "ar" ? "اليوم" : language === "en" ? "Today" : "آج";
    if (diff === 1) return language === "ar" ? "أمس" : language === "en" ? "Yesterday" : "کل";
    return language === "ar" ? `منذ ${diff} أيام` : language === "en" ? `${diff}d ago` : `${diff} دن پہلے`;
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: t("navJobs"), href: "/projects/ABC/jobs" },
            { label: job.title },
          ]}
        />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-surface-600 hover:text-surface-900 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">{t("back")}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-16 h-16 rounded-xl ${job.company.color} flex items-center justify-center text-xl font-bold flex-shrink-0`}
                >
                  {job.company.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-surface-900">{job.title}</h1>
                      <p className="text-surface-600 mt-1">{job.company.name}</p>
                    </div>
                    <button
                      onClick={() => setSaved(!saved)}
                      className="p-2 rounded-lg hover:bg-surface-100 transition-colors flex-shrink-0"
                    >
                      <Bookmark
                        className={`w-5 h-5 ${saved ? "text-teal-600 fill-current" : "text-surface-400"}`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-surface-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      {job.location}
                    </span>
                    {job.salaryMin && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-teal-600" />
                        {job.salaryMin.toLocaleString()} - {job.salaryMax!.toLocaleString()} {t("currency")}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-teal-600" />
                      {JOB_TYPES[job.jobType as keyof typeof JOB_TYPES].label}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-teal-600" />
                      {timeAgoLabel(job.postedAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-600" />
                      {job.applicants} {language === "ar" ? "متقدم" : language === "en" ? "applicants" : "درخواست دہندگان"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {job.isUrgent && (
                      <span className="flex items-center gap-1 text-xs font-bold text-danger-600 bg-danger-50 px-2.5 py-1 rounded-full">
                        <Zap className="w-3.5 h-3.5" />
                        {language === "ar" ? "عاجل" : language === "en" ? "Urgent" : "فوری"}
                      </span>
                    )}
                    {job.easyApply && (
                      <span className="flex items-center gap-1 text-xs font-medium text-info-600 bg-info-50 px-2.5 py-1 rounded-full">
                        <Send className="w-3.5 h-3.5" />
                        {language === "ar" ? "تقديم سريع" : language === "en" ? "Easy Apply" : "آسان درخواست"}
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${JOB_TYPES[job.jobType as keyof typeof JOB_TYPES].color}`}
                    >
                      {JOB_TYPES[job.jobType as keyof typeof JOB_TYPES].label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <Link
                      href={`/projects/ABC/jobs/${job.id}/apply`}
                      className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      {t("applyNow")}
                    </Link>
                    <button
                      onClick={() => setSaved(!saved)}
                      className="flex items-center gap-2 px-5 py-2.5 border border-surface-300 text-surface-700 rounded-xl font-medium hover:bg-surface-50 transition-colors"
                    >
                      <Bookmark className={`w-4 h-4 ${saved ? "text-teal-600 fill-current" : ""}`} />
                      {t("saveJob")}
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-3">{t("description")}</h2>
              <div className="text-surface-600 text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </Card>

            {/* Requirements */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-3">{t("requirements")}</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-600">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Benefits */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-3">{t("benefits")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {job.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-surface-600">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>
            </Card>

            {/* Skills */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-3">
                {language === "ar" ? "المهارات المطلوبة" : language === "en" ? "Skills" : "مہارتیں"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-bold text-surface-900 mb-4">
                  {language === "ar" ? "وظائف مماثلة" : language === "en" ? "Similar Jobs" : "اسی طرح کی ملازمتیں"}
                </h2>
                <div className="space-y-3">
                  {similarJobs.map((sj) => (
                    <Link key={sj.id} href={`/projects/ABC/jobs/${sj.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors">
                        <div
                          className={`w-12 h-12 rounded-xl ${sj.company.color} flex items-center justify-center text-sm font-bold flex-shrink-0`}
                        >
                          {sj.company.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">{sj.title}</p>
                          <p className="text-xs text-surface-500">{sj.company.name} - {sj.location}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-surface-400 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card className="p-6">
              <div className="text-center">
                <div
                  className={`w-20 h-20 rounded-2xl ${job.company.color} flex items-center justify-center text-2xl font-bold mx-auto`}
                >
                  {job.company.initials}
                </div>
                <h3 className="text-lg font-bold text-surface-900 mt-3">{job.company.name}</h3>
                <p className="text-sm text-surface-500 mt-1">{job.company.industry}</p>
              </div>

              <div className="space-y-3 mt-5 pt-5 border-t border-surface-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">
                    {language === "ar" ? "حجم الشركة" : language === "en" ? "Company Size" : "کمپنی کا سائز"}
                  </span>
                  <span className="text-surface-900 font-medium">{job.company.size}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">
                    {language === "ar" ? "المتابعون" : language === "en" ? "Followers" : "فالوورز"}
                  </span>
                  <span className="text-surface-900 font-medium">{job.company.followers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">
                    {language === "ar" ? "الموقع" : language === "en" ? "Location" : "مقام"}
                  </span>
                  <span className="text-surface-900 font-medium">{job.company.location}</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-surface-100">
                <p className="text-sm text-surface-600">{job.company.description}</p>
              </div>

              <div className="mt-5">
                <Link
                  href={`/projects/ABC/jobs/${job.id}/apply`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {t("applyNow")}
                </Link>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-5">
              <h3 className="font-bold text-surface-900 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                {language === "ar" ? "إحصائيات الوظيفة" : language === "en" ? "Job Stats" : "ملازمت کے اعداد و شمار"}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-600">
                    {language === "ar" ? "عدد المتقدمين" : language === "en" ? "Applicants" : "درخواست دہندگان"}
                  </span>
                  <span className="text-sm font-bold text-teal-600">{job.applicants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-600">
                    {language === "ar" ? "الوظائف الشاغرة" : language === "en" ? "Vacancies" : "آسامیاں"}
                  </span>
                  <span className="text-sm font-bold text-surface-900">{job.vacancies}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-600">
                    {language === "ar" ? "تاريخ النشر" : language === "en" ? "Posted" : "شائع کردہ"}
                  </span>
                  <span className="text-sm font-medium text-surface-900">{job.postedAt}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
