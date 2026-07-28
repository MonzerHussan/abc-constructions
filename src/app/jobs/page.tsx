"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Plus,
  Bookmark,
  Zap,
  Building2,
  Search,
  CheckCircle2,
  ExternalLink,
  Send,
  Sparkles,
  Star,
  Globe,
  Heart,
  Share2,
  Bell,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

const mockJobs = [
  {
    id: "1",
    title: "مهندس مدني - إدارة المشاريع",
    description:
      "نبحث عن مهندس مدني ذي خبرة في إدارة المشاريع الإنشائية الكبيرة. المسئوليات تشمل التخطيط والمتابعة والإشراف على فرق العمل.ensure delivery on time.",
    category: "إدارة المشاريع",
    jobType: "FULL_TIME",
    salaryMin: 15000,
    salaryMax: 25000,
    location: "الرياض",
    remote: false,
    requirements: ["بكالوريوس هندسة مدنية", "خبرة 5+ سنوات", "PMP مفضّل", "MS Project"],
    benefits: ["تأمين صحي", "مكافأة سنوية", "سائق شخصي", "إجازات مدفوعة"],
    vacancies: 3,
    isUrgent: true,
    isFeatured: true,
    easyApply: true,
    company: {
      name: "شركة الإنشاءات الحديثة",
      initials: "MCO",
      color: "bg-blue-100 text-blue-700",
      size: "201-500",
      industry: "Construction & Engineering",
      followers: "12,450",
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
      color: "bg-purple-100 text-purple-700",
      size: "11-50",
      industry: "Interior Design & Finishing",
      followers: "3,200",
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
      followers: "8,780",
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
      color: "bg-green-100 text-green-700",
      size: "501-1000",
      industry: "Construction & Development",
      followers: "22,100",
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
      followers: "2,100",
    },
    applicants: 11,
    postedAt: "2026-07-23",
    skills: ["سباكة", "أنابيب", "صيانة"],
  },
];

export default function JobsPage() {
  const { t, language } = useLanguage();
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredJobs = mockJobs.filter((job) => {
    if (filterType !== "all" && job.jobType !== filterType) return false;
    if (search && !job.title.includes(search) && !job.company.name.includes(search)) return false;
    return true;
  });

  const timeAgoLabel = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diff === 0) return language === "ar" ? "اليوم" : language === "en" ? "Today" : "آج";
    if (diff === 1) return language === "ar" ? "أمس" : language === "en" ? "Yesterday" : "کل";
    return language === "ar" ? `منذ ${diff} أيام` : language === "en" ? `${diff}d ago` : `${diff} دن پہلے`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: t("navJobs") }]} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-teal-600" />
              {t("jobsTitle")}
            </h1>
            <p className="text-gray-600 mt-1">{t("jobsDescription")}</p>
          </div>
          <Link
            href="/jobs/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t("postJob")}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={language === "ar" ? "بحث بالوظيفة أو الشركة..." : language === "en" ? "Search by job or company..." : "وظیعت یا کمپنی سے تلاش کریں..."}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
            </Card>

            {/* Job Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  filterType === "all"
                    ? "bg-teal-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {t("all")}
              </button>
              {Object.entries(JOB_TYPES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    filterType === key
                      ? "bg-teal-500 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>

            {/* Jobs List */}
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <Card key={job.id} hover className="p-5">
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className={`w-14 h-14 rounded-xl ${job.company.color} flex items-center justify-center text-lg font-bold flex-shrink-0`}>
                      {job.company.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-gray-900 hover:text-teal-600 cursor-pointer transition-colors">
                              {job.title}
                            </h3>
                            {job.isUrgent && (
                              <span className="flex items-center gap-0.5 text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                                <Zap className="w-3 h-3" />
                                {language === "ar" ? "عاجل" : language === "en" ? "Urgent" : "فوری"}
                              </span>
                            )}
                            {job.easyApply && (
                              <span className="flex items-center gap-0.5 text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                <Sparkles className="w-3 h-3" />
                                {language === "ar" ? "تقديم سريع" : language === "en" ? "Easy Apply" : "آسان درخواست"}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">{job.company.name}</p>
                        </div>
                        <button
                          onClick={() => toggleSave(job.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                        >
                          <Bookmark className={`w-5 h-5 ${savedJobs.has(job.id) ? "text-teal-600 fill-current" : "text-gray-400"}`} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-500">
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
                          <Briefcase className="w-3.5 h-3.5" />
                          {JOB_TYPES[job.jobType as keyof typeof JOB_TYPES].label}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {timeAgoLabel(job.postedAt)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills.map((skill) => (
                          <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{skill}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {job.applicants} {language === "ar" ? "متقدم" : language === "en" ? "applicants" : "درخواست دہندگان"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" />
                            {job.company.followers} {language === "ar" ? "متابع" : language === "en" ? "followers" : "فالوورز"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company.size} {language === "ar" ? "موظف" : language === "en" ? "employees" : "ملازمین"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.easyApply ? (
                            <button className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
                              <Send className="w-3.5 h-3.5" />
                              {language === "ar" ? "تقديم سريع" : language === "en" ? "Easy Apply" : "آسان درخواست"}
                            </button>
                          ) : (
                            <Link
                              href={`/jobs/${job.id}`}
                              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {t("viewDetails")}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Job Alerts Card */}
            <Card className="p-5 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-gray-900">
                  {language === "ar" ? "تنبيهات الوظائف" : language === "en" ? "Job Alerts" : "ملازمتی اعلانات"}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {language === "ar" ? "احصل على إشعارات فورية لأحدث الوظائف المناسبة لخبراتك" : language === "en" ? "Get instant notifications for latest jobs matching your skills" : "اپنی مہارتوں سے میل کھاتی تازہ ترین ملازمتوں کی فوری اطلاعات حاصل کریں"}
              </p>
              <button className="w-full py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
                {language === "ar" ? "تفعيل التنبيهات" : language === "en" ? "Activate Alerts" : "اعلانات فعال کریں"}
              </button>
            </Card>

            {/* Recommended Skills */}
            <Card className="p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {language === "ar" ? "مهارات مطلوبة" : language === "en" ? "In-Demand Skills" : "مطلوب مہارتیں"}
              </h3>
              <div className="space-y-2">
                {["إدارة المشاريع", "BIM", "السلامة المهنية", "الخرسانة المسلحة", "السباكة الحديثة", "أنظمة الذكاء"].map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <span className="text-sm text-gray-700">{skill}</span>
                    <span className="text-xs text-teal-600 font-medium">
                      {Math.floor(Math.random() * 30 + 10)} {language === "ar" ? "وظيفة" : language === "en" ? "jobs" : "ملازمتیں"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Companies */}
            <Card className="p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                {language === "ar" ? "شركات نشطة" : language === "en" ? "Top Companies" : "فعال کمپنیاں"}
              </h3>
              <div className="space-y-3">
                {mockJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className={`w-10 h-10 rounded-lg ${job.company.color} flex items-center justify-center text-xs font-bold`}>
                      {job.company.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{job.company.name}</p>
                      <p className="text-xs text-gray-500">{job.company.followers} {language === "ar" ? "متابع" : language === "en" ? "followers" : "فالوورز"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                {language === "ar" ? "إحصائيات" : language === "en" ? "Statistics" : "اعداد"}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === "ar" ? "وظائف جديدة اليوم" : language === "en" ? "New Jobs Today" : "آج نئی ملازمتیں"}</span>
                  <span className="text-sm font-bold text-teal-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === "ar" ? "وظائف عاجلة" : language === "en" ? "Urgent Jobs" : "فوری ملازمتیں"}</span>
                  <span className="text-sm font-bold text-red-600">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === "ar" ? "شركات توظف الآن" : language === "en" ? "Companies Hiring" : "کمپنیاں ملازمت دے رہی ہیں"}</span>
                  <span className="text-sm font-bold text-purple-600">34</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


