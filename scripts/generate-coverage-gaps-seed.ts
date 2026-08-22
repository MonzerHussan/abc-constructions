/**
 * Generates docs/pilot-validation/coverage-gaps-seed.json from ABC-Coverage-Gaps-v1.md
 */
import { writeFileSync } from "fs";
import { join } from "path";

const ALL_TYPES = [
  "OWNER",
  "CONSULTANT",
  "CONTRACTOR",
  "SUBCONTRACTOR",
  "SUPPLIER",
  "TRADER",
  "COMPANY",
  "ENTITY",
  "INDIVIDUAL",
] as const;

type AccountType = (typeof ALL_TYPES)[number];
type AnswerType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "LINEAR_SCALE"
  | "TEXTAREA";

interface Option {
  value: string;
  labelAr: string;
  labelEn: string;
  order: number;
}

interface Question {
  code: string;
  accountTypes: AccountType[];
  sectionCode: string;
  sectionTitleAr: string;
  sectionTitleEn: string;
  sectionOrder: number;
  questionOrder: number;
  textAr: string;
  textEn: string;
  answerType: AnswerType;
  required: boolean;
  showIf: Record<string, unknown> | null;
  options: Option[] | null;
  scale: Record<string, unknown> | null;
  note?: string;
}

const defaultScale = {
  min: 1,
  max: 5,
  minLabelAr: "غير مهتم إطلاقاً",
  maxLabelAr: "مهتم جداً وسأستخدمه فوراً",
  minLabelEn: "Not interested at all",
  maxLabelEn: "Very interested, would use immediately",
};

const SECTIONS: Record<
  string,
  { titleAr: string; titleEn: string; order: number }
> = {
  TRUST_PAYMENTS: {
    titleAr: "المدفوعات والثقة",
    titleEn: "Payments & Trust",
    order: 15,
  },
  PRICING: {
    titleAr: "التسعير وإعداد العروض",
    titleEn: "Pricing & Bidding",
    order: 18,
  },
  SUBCONTRACTING: {
    titleAr: "إدارة المقاولين من الباطن",
    titleEn: "Subcontractor Management",
    order: 22,
  },
  OPERATIONS: {
    titleAr: "التشغيل والتنفيذ",
    titleEn: "Operations & Execution",
    order: 25,
  },
  HUMAN_CAPITAL: {
    titleAr: "رأس المال البشري",
    titleEn: "Human Capital",
    order: 28,
  },
  EQUIPMENT: {
    titleAr: "المعدات",
    titleEn: "Equipment",
    order: 32,
  },
  AI_DIGITAL: {
    titleAr: "الجاهزية الرقمية والذكاء الاصطناعي",
    titleEn: "Digital & AI Readiness",
    order: 55,
  },
  TENDERS: {
    titleAr: "المناقصات والتعاقد",
    titleEn: "Tenders & Contracting",
    order: 12,
  },
  EXECUTION: {
    titleAr: "التنفيذ والمتابعة",
    titleEn: "Execution & Tracking",
    order: 30,
  },
  OPPORTUNITIES: {
    titleAr: "الفرص والعمل",
    titleEn: "Opportunities & Work",
    order: 14,
  },
  BOQ: {
    titleAr: "الكميات و BOQ",
    titleEn: "Quantities & BOQ",
    order: 20,
  },
  LOGISTICS: {
    titleAr: "النقل واللوجستيات",
    titleEn: "Transport & Logistics",
    order: 38,
  },
  CREDIT: {
    titleAr: "الائتمان والتحصيل",
    titleEn: "Credit & Collections",
    order: 16,
  },
  RFQ: {
    titleAr: "طلبات التسعير",
    titleEn: "RFQ Flow",
    order: 19,
  },
  QUALITY: {
    titleAr: "الجودة والمرتجعات",
    titleEn: "Quality & Returns",
    order: 21,
  },
  CLIENTS: {
    titleAr: "العملاء والمبيعات",
    titleEn: "Clients & Sales",
    order: 20,
  },
  PROCUREMENT: {
    titleAr: "المشتريات",
    titleEn: "Procurement",
    order: 22,
  },
  PLATFORM_UNIVERSAL: {
    titleAr: "فرضية المنصة",
    titleEn: "Platform Hypothesis",
    order: 70,
  },
  ENTITY_COOPERATION: {
    titleAr: "نموذج التعاون",
    titleEn: "Cooperation Model",
    order: 65,
  },
};

function sec(sectionCode: string) {
  const s = SECTIONS[sectionCode];
  if (!s) throw new Error(`Unknown section: ${sectionCode}`);
  return s;
}

function opts(
  pairs: [string, string, string][]
): Option[] {
  return pairs.map(([value, labelAr, labelEn], i) => ({
    value,
    labelAr,
    labelEn,
    order: i + 1,
  }));
}

function q(
  partial: Omit<Question, "sectionTitleAr" | "sectionTitleEn" | "sectionOrder"> & {
    sectionCode: string;
  }
): Question {
  const s = sec(partial.sectionCode);
  return {
    ...partial,
    sectionTitleAr: s.titleAr,
    sectionTitleEn: s.titleEn,
    sectionOrder: s.order,
    showIf: partial.showIf ?? null,
    scale:
      partial.answerType === "LINEAR_SCALE"
        ? { ...defaultScale }
        : partial.scale ?? null,
    options:
      partial.answerType === "LINEAR_SCALE" || partial.answerType === "TEXTAREA"
        ? null
        : partial.options ?? null,
  };
}

const yesNo = opts([
  ["yes", "نعم", "Yes"],
  ["no", "لا", "No"],
  ["sometimes", "أحياناً", "Sometimes"],
]);

const durationBuckets = opts([
  ["under_30", "أقل من 30 يوماً", "Under 30 days"],
  ["30_60", "30–60 يوماً", "30–60 days"],
  ["60_90", "60–90 يوماً", "60–90 days"],
  ["over_90", "أكثر من 90 يوماً", "Over 90 days"],
  ["varies", "يختلف حسب المشروع", "Varies by project"],
]);

const percentBuckets = opts([
  ["under_10", "أقل من 10%", "Under 10%"],
  ["10_25", "10–25%", "10–25%"],
  ["25_50", "25–50%", "25–50%"],
  ["50_75", "50–75%", "50–75%"],
  ["over_75", "أكثر من 75%", "Over 75%"],
]);

const hc0ShowIf = {
  questionCode: "TRD-HR1",
  op: "eq",
  value: "yes",
};

const newQuestions: Question[] = [
  // ── Section 3: CONTRACTOR ──────────────────────────────────────────
  q({
    code: "CNT-TP1",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 1,
    textAr: "ما متوسط مدة تحصيل مستخلصاتكم من المالك؟",
    textEn: "Average time to collect payment certificates from owners",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: durationBuckets,
  }),
  q({
    code: "CNT-TP2",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 2,
    textAr: "ما متوسط مدة سدادكم للمقاولين من الباطن والموردين؟",
    textEn: "Average time you pay subcontractors and suppliers",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: durationBuckets,
  }),
  q({
    code: "CNT-TP3",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 3,
    textAr: "هل واجهتم نزاعات دفع؟ ومع من؟",
    textEn: "Have you faced payment disputes, and with whom?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["owner", "المالك / المطوّر", "Owner / developer"],
      ["subcontractor", "مقاول باطن", "Subcontractor"],
      ["supplier", "مورّد", "Supplier"],
      ["consultant", "استشاري", "Consultant"],
      ["none", "لم نواجه نزاعات", "No disputes"],
    ]),
  }),
  q({
    code: "CNT-TP4",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 4,
    textAr:
      "ما مدى اهتمامكم بحساب ضمان (Escrow) يحتجز مستحقاتكم لحين التسليم؟",
    textEn:
      "Interest in an escrow account holding your dues until delivery",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
  }),
  q({
    code: "CNT-TP5",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 5,
    textAr: "هل تحتاجون تمويلاً قصير الأجل لتغطية فجوة التحصيل؟",
    textEn: "Do you need short-term financing to bridge collection gaps?",
    answerType: "LINEAR_SCALE",
    required: false,
    options: null,
    scale: null,
    note: "يفتح باب منتج التمويل",
  }),
  q({
    code: "CNT-TP6",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 6,
    textAr:
      "ما الضمانات التي تطلبونها من المقاول من الباطن قبل التعاقد؟",
    textEn: "Guarantees you require from subcontractors before contracting",
    answerType: "MULTIPLE_CHOICE",
    required: false,
    options: opts([
      ["performance_bond", "ضمان حسن تنفيذ", "Performance bond"],
      ["advance_guarantee", "ضمان دفعة مقدّمة", "Advance payment guarantee"],
      ["insurance", "تأمين", "Insurance"],
      ["references", "مراجع سابقة", "Past references"],
      ["retention", "حجز مستحقات / retention", "Retention holdback"],
      ["none", "لا نطلب ضمانات", "No guarantees required"],
    ]),
  }),
  q({
    code: "CNT-PR1",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "PRICING",
    questionOrder: 1,
    textAr: "كم يستغرق إعداد عرض سعر لمشروع متوسط؟",
    textEn: "Time to prepare a bid for a medium project",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["under_3d", "أقل من 3 أيام", "Under 3 days"],
      ["3_7d", "3–7 أيام", "3–7 days"],
      ["1_2w", "1–2 أسبوع", "1–2 weeks"],
      ["2_4w", "2–4 أسابيع", "2–4 weeks"],
      ["over_4w", "أكثر من 4 أسابيع", "Over 4 weeks"],
    ]),
  }),
  q({
    code: "CNT-PR2",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "PRICING",
    questionOrder: 2,
    textAr: "ما أساس تسعيركم؟",
    textEn: "Basis of your pricing",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["unit_rates", "أسعار الوحدات / BOQ", "Unit rates / BOQ"],
      ["lump_sum", "مبلغ إجمالي ثابت", "Lump sum"],
      ["cost_plus", "تكلفة + هامش", "Cost plus margin"],
      ["historical", "بيانات مشاريع سابقة", "Historical project data"],
      ["mixed", "مزيج", "Mixed approach"],
    ]),
  }),
  q({
    code: "CNT-PR3",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "PRICING",
    questionOrder: 3,
    textAr: "كم مورّداً تطلبون منه عرض سعر لكل بند عادةً؟",
    textEn: "Suppliers asked to quote per line item",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["one", "مورّد واحد", "One supplier"],
      ["two_three", "2–3 موردين", "2–3 suppliers"],
      ["four_plus", "4 أو أكثر", "4 or more"],
      ["varies", "يختلف حسب البند", "Varies by item"],
    ]),
  }),
  q({
    code: "CNT-PR4",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "PRICING",
    questionOrder: 4,
    textAr: "ما نسبة العروض التي خسرتموها بسبب ارتفاع سعر المواد؟",
    textEn: "Bids lost due to material price increases",
    answerType: "SINGLE_CHOICE",
    required: false,
    options: percentBuckets,
  }),
  q({
    code: "CNT-SC1",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "SUBCONTRACTING",
    questionOrder: 1,
    textAr: "كيف تجدون المقاولين من الباطن اليوم؟",
    textEn: "How do you find subcontractors today?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["network", "شبكة علاقات شخصية", "Personal network"],
      ["past_projects", "مشاريع سابقة", "Past projects"],
      ["tender_invite", "دعوة مناقصة / RFQ", "Tender / RFQ invite"],
      ["brokers", "وسطاء", "Brokers"],
      ["platforms", "منصات / إعلانات", "Platforms / ads"],
      ["walk_in", "تقديم مباشر", "Direct approach"],
    ]),
  }),
  q({
    code: "CNT-SC2",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "SUBCONTRACTING",
    questionOrder: 2,
    textAr: "كم مقاولاً من الباطن يعمل معكم حالياً؟",
    textEn: "Active subcontractors currently",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["1_3", "1–3", "1–3"],
      ["4_10", "4–10", "4–10"],
      ["11_25", "11–25", "11–25"],
      ["over_25", "أكثر من 25", "Over 25"],
    ]),
  }),
  q({
    code: "CNT-SC3",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "SUBCONTRACTING",
    questionOrder: 3,
    textAr: "ما أكبر مشكلة مع المقاولين من الباطن؟",
    textEn: "Biggest problem with subcontractors",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["quality", "جودة التنفيذ", "Execution quality"],
      ["delays", "تأخير", "Delays"],
      ["pricing", "التسعير", "Pricing"],
      ["safety", "السلامة", "Safety"],
      ["coordination", "التنسيق", "Coordination"],
      ["payment", "المدفوعات", "Payments"],
    ]),
  }),
  q({
    code: "CNT-SC4",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "SUBCONTRACTING",
    questionOrder: 4,
    textAr: "هل سبق أن تضررتم من مقاول باطن لم تتحققوا من سجله؟",
    textEn: "Harmed by an unvetted subcontractor before?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: yesNo.slice(0, 2),
  }),
  q({
    code: "CNT-EX1",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "OPERATIONS",
    questionOrder: 10,
    textAr: "ما نسبة مشاريعكم التي تُسلَّم في موعدها؟",
    textEn: "Share of projects delivered on schedule",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: percentBuckets,
  }),
  q({
    code: "CNT-EX2",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "OPERATIONS",
    questionOrder: 11,
    textAr: "ما تكرار إعادة العمل بسبب الجودة؟",
    textEn: "Frequency of rework due to quality issues",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["rare", "نادراً", "Rarely"],
      ["occasional", "أحياناً", "Occasionally"],
      ["frequent", "متكرر", "Frequently"],
      ["major_issue", "مشكلة كبيرة", "Major ongoing issue"],
    ]),
  }),
  q({
    code: "CNT-EX3",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "OPERATIONS",
    questionOrder: 12,
    textAr: "كيف تتابعون تقدم الأعمال في الموقع اليوم؟",
    textEn: "How do you track site progress today?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["daily_reports", "تقارير يومية", "Daily reports"],
      ["site_visits", "زيارات موقع", "Site visits"],
      ["photos", "صور / فيديو", "Photos / video"],
      ["pm_software", "برنامج إدارة مشاريع", "PM software"],
      ["whatsapp", "واتساب / مجموعات", "WhatsApp groups"],
      ["spreadsheets", "جداول / Excel", "Spreadsheets"],
    ]),
  }),
  q({
    code: "CNT-HR1",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "HUMAN_CAPITAL",
    questionOrder: 5,
    textAr: "ما أكبر تحدٍ في توفير العمالة؟",
    textEn: "Biggest labor availability challenge",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["skilled_shortage", "نقص العمالة الماهرة", "Skilled labor shortage"],
      ["cost", "ارتفاع التكلفة", "Rising labor cost"],
      ["visa_sponsorship", "التأشيرات / الكفالة", "Visas / sponsorship"],
      ["turnover", "دوران العمالة", "High turnover"],
      ["seasonal", "موسمية الطلب", "Seasonal demand"],
      ["compliance", "متطلبات تنظيمية", "Regulatory compliance"],
    ]),
  }),
  q({
    code: "CNT-EQ1",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "EQUIPMENT",
    questionOrder: 1,
    textAr: "معداتكم: تملّك أم تأجير؟",
    textEn: "Equipment: owned vs rented",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["mostly_owned", "معظمها مملوكة", "Mostly owned"],
      ["mostly_rented", "معظمها مؤجّرة", "Mostly rented"],
      ["mixed", "مزيج", "Mixed"],
      ["minimal", "معدات محدودة", "Minimal equipment"],
    ]),
  }),
  q({
    code: "CNT-EQ2",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "EQUIPMENT",
    questionOrder: 2,
    textAr: "كيف تستأجرون المعدات اليوم؟",
    textEn: "How do you rent equipment today?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["direct_rental", "شركات تأجير مباشرة", "Direct rental companies"],
      ["subcontractor", "عبر مقاول باطن", "Via subcontractor"],
      ["project_owner", "يوفرها المالك", "Provided by owner"],
      ["brokers", "وسطاء", "Brokers"],
      ["online", "منصات / إعلانات", "Online / ads"],
    ]),
  }),
  q({
    code: "CNT-BIM1",
    accountTypes: ["CONTRACTOR"],
    sectionCode: "AI_DIGITAL",
    questionOrder: 5,
    textAr: "هل تستلمون نماذج BIM من الاستشاري؟",
    textEn: "Do you receive BIM models from the consultant?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["always", "دائماً", "Always"],
      ["sometimes", "أحياناً", "Sometimes"],
      ["rarely", "نادراً", "Rarely"],
      ["never", "لا", "Never"],
    ]),
  }),

  // ── Section 4: OWNER ─────────────────────────────────────────────
  q({
    code: "OWN-T1",
    accountTypes: ["OWNER"],
    sectionCode: "TENDERS",
    questionOrder: 1,
    textAr: "كيف تطرحون المشروع على المقاولين اليوم؟",
    textEn: "How do you invite contractors to bid today?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["direct_invite", "دعوة مباشرة لمقاولين معروفين", "Direct invite to known contractors"],
      ["consultant", "عبر الاستشاري", "Via consultant"],
      ["public_tender", "مناقصة عامة", "Public tender"],
      ["rfq_informal", "RFQ غير رسمي", "Informal RFQ"],
      ["brokers", "وسطاء", "Brokers"],
    ]),
    note: "سؤال التحقق الأهم — البديل الحالي",
  }),
  q({
    code: "OWN-T2",
    accountTypes: ["OWNER"],
    sectionCode: "TENDERS",
    questionOrder: 2,
    textAr: "كم مقاولاً تدعون عادةً للمنافسة؟",
    textEn: "How many contractors do you typically invite to bid?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["1_2", "1–2", "1–2"],
      ["3_5", "3–5", "3–5"],
      ["6_10", "6–10", "6–10"],
      ["over_10", "أكثر من 10", "Over 10"],
    ]),
  }),
  q({
    code: "OWN-T3",
    accountTypes: ["OWNER"],
    sectionCode: "TENDERS",
    questionOrder: 3,
    textAr: "ما معيار الترسية لديكم؟ (أقل سعر / أفضل قيمة / سمعة)",
    textEn: "Your award criteria (lowest price / best value / reputation)",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["lowest_price", "أقل سعر", "Lowest price"],
      ["best_value", "أفضل قيمة", "Best value"],
      ["reputation", "السمعة والخبرة", "Reputation & experience"],
      ["combined", "معايير مركّبة", "Combined criteria"],
    ]),
  }),
  q({
    code: "OWN-S1",
    accountTypes: ["OWNER"],
    sectionCode: "TENDERS",
    questionOrder: 4,
    textAr: "ما إجمالي إنفاقكم الإنشائي السنوي تقريباً؟",
    textEn: "Approximate annual construction spend",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["under_5m", "أقل من 5 ملايين", "Under 5M"],
      ["5_20m", "5–20 مليون", "5–20M"],
      ["20_100m", "20–100 مليون", "20–100M"],
      ["over_100m", "أكثر من 100 مليون", "Over 100M"],
      ["prefer_not", "أفضل عدم الإفصاح", "Prefer not to say"],
    ]),
    note: "أهم مؤشر تأهيل",
  }),
  q({
    code: "OWN-E1",
    accountTypes: ["OWNER"],
    sectionCode: "EXECUTION",
    questionOrder: 1,
    textAr: "كيف تتابعون تقدم المشروع اليوم؟",
    textEn: "How do you track project progress today?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["consultant_reports", "تقارير الاستشاري", "Consultant reports"],
      ["site_visits", "زيارات موقع", "Site visits"],
      ["pm_software", "برنامج إدارة مشاريع", "PM software"],
      ["contractor_updates", "تحديثات المقاول", "Contractor updates"],
      ["photos", "صور / فيديو", "Photos / video"],
      ["spreadsheets", "جداول / Excel", "Spreadsheets"],
    ]),
  }),
  q({
    code: "OWN-E2",
    accountTypes: ["OWNER"],
    sectionCode: "EXECUTION",
    questionOrder: 2,
    textAr: "ما نسبة مشاريعكم التي تأخرت عن الجدول؟",
    textEn: "Share of projects delayed vs schedule",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: percentBuckets,
  }),
  q({
    code: "OWN-D1",
    accountTypes: ["OWNER"],
    sectionCode: "AI_DIGITAL",
    questionOrder: 1,
    textAr: "ما مستوى الأنظمة الرقمية لديكم حالياً؟",
    textEn: "Current level of digital systems",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["manual", "عمليات يدوية / بريد وواتساب", "Manual / email & WhatsApp"],
      ["basic", "أدوات أساسية (Excel)", "Basic tools (Excel)"],
      ["partial", "أنظمة جزئية", "Partial systems"],
      ["integrated", "أنظمة متكاملة", "Integrated systems"],
    ]),
  }),
  q({
    code: "OWN-D2",
    accountTypes: ["OWNER"],
    sectionCode: "AI_DIGITAL",
    questionOrder: 2,
    textAr: "ما مدى اهتمامكم بتقارير آلية عن تقدم المشروع؟",
    textEn: "Interest in automated project progress reports",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
  }),
  q({
    code: "OWN-TR1",
    accountTypes: ["OWNER"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 1,
    textAr:
      "هل ستتعاملون مع مقاول لم تعرفوه شخصياً إذا كان موثّقاً ومُقيّماً؟",
    textEn:
      "Would you work with an unknown but verified & rated contractor?",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
    note: "جوهر فرضية المنصة",
  }),

  // ── Section 4: CONSULTANT ──────────────────────────────────────────
  q({
    code: "CNS-O1",
    accountTypes: ["CONSULTANT"],
    sectionCode: "OPPORTUNITIES",
    questionOrder: 1,
    textAr: "كيف تحصلون على مشاريع جديدة اليوم؟",
    textEn: "How do you win new projects today?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["referrals", "إحالات / شبكة", "Referrals / network"],
      ["repeat_clients", "عملاء متكررون", "Repeat clients"],
      ["tenders", "مناقصات", "Tenders"],
      ["direct_approach", "تقديم مباشر", "Direct approach"],
      ["partnerships", "شراكات", "Partnerships"],
    ]),
  }),
  q({
    code: "CNS-O2",
    accountTypes: ["CONSULTANT"],
    sectionCode: "OPPORTUNITIES",
    questionOrder: 2,
    textAr: "ما نسبة أعمالكم من عملاء متكررين؟",
    textEn: "Share of work from repeat clients",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: percentBuckets,
  }),
  q({
    code: "CNS-T1",
    accountTypes: ["CONSULTANT"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 1,
    textAr: "هل تواجهون تأخراً في تحصيل أتعابكم؟",
    textEn: "Do you experience delays collecting fees?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: yesNo.slice(0, 2),
  }),
  q({
    code: "CNS-T2",
    accountTypes: ["CONSULTANT"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 2,
    textAr: "ما مدى اهتمامكم بحساب ضمان لأتعاب الاستشارة؟",
    textEn: "Interest in escrow for consulting fees",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
  }),
  q({
    code: "CNS-M1",
    accountTypes: ["CONSULTANT"],
    sectionCode: "TENDERS",
    questionOrder: 1,
    textAr: "هل تديرون المناقصات نيابة عن المالك؟",
    textEn: "Do you manage tenders on behalf of owners?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: yesNo.slice(0, 2),
  }),
  q({
    code: "CNS-M2",
    accountTypes: ["CONSULTANT"],
    sectionCode: "TENDERS",
    questionOrder: 2,
    textAr: "كيف تقيّمون عروض المقاولين اليوم؟",
    textEn: "How do you evaluate contractor bids today?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["price", "السعر", "Price"],
      ["technical", "الجدول الفني", "Technical proposal"],
      ["experience", "الخبرة والمراجع", "Experience & references"],
      ["schedule", "الجدول الزمني", "Schedule"],
      ["compliance", "الامتثال", "Compliance"],
      ["interviews", "مقابلات / زيارات", "Interviews / site visits"],
    ]),
  }),
  q({
    code: "CNS-P1",
    accountTypes: ["CONSULTANT"],
    sectionCode: "OPERATIONS",
    questionOrder: 1,
    textAr: "ما أكثر ما يعطّل تسليم مخرجاتكم؟",
    textEn: "What most delays your deliverables?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["client_approval", "موافقات العميل", "Client approvals"],
      ["scope_changes", "تغييرات النطاق", "Scope changes"],
      ["data_gaps", "نقص بيانات / مخططات", "Missing data / drawings"],
      ["coordination", "تنسيق مع جهات أخرى", "Coordination with others"],
      ["staffing", "نقص الكادر", "Staffing gaps"],
      ["payment", "تأخر الدفع", "Payment delays"],
    ]),
  }),

  // ── Section 4: SUBCONTRACTOR ───────────────────────────────────────
  q({
    code: "SUB-B1",
    accountTypes: ["SUBCONTRACTOR"],
    sectionCode: "BOQ",
    questionOrder: 1,
    textAr:
      "كيف تستلمون الكميات؟ (BOQ جاهز من المقاول / تحصرون بأنفسكم / رسومات فقط)",
    textEn:
      "How do you receive quantities? (BOQ from contractor / self takeoff / drawings only)",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["boq_from_contractor", "BOQ جاهز من المقاول", "BOQ from main contractor"],
      ["self_takeoff", "تحصرون بأنفسكم", "Self quantity takeoff"],
      ["drawings_only", "رسومات فقط", "Drawings only"],
      ["mixed", "مزيج", "Mixed"],
    ]),
  }),
  q({
    code: "SUB-B2",
    accountTypes: ["SUBCONTRACTOR"],
    sectionCode: "BOQ",
    questionOrder: 2,
    textAr: "هل سبق أن تضررتم من كميات خاطئة في العقد؟",
    textEn: "Have incorrect contract quantities harmed you before?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: yesNo.slice(0, 2),
  }),
  q({
    code: "SUB-C1",
    accountTypes: ["SUBCONTRACTOR"],
    sectionCode: "OPPORTUNITIES",
    questionOrder: 1,
    textAr: "ما نسبة أعمالكم القادمة من مقاول رئيسي واحد؟",
    textEn: "Share of work from a single main contractor",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: percentBuckets,
  }),
  q({
    code: "SUB-L1",
    accountTypes: ["SUBCONTRACTOR"],
    sectionCode: "LOGISTICS",
    questionOrder: 1,
    textAr: "من يتحمل نقل المواد في أعمالكم؟",
    textEn: "Who bears material transport in your work?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["us", "نحن", "Us (subcontractor)"],
      ["main_contractor", "المقاول الرئيسي", "Main contractor"],
      ["supplier", "المورّد", "Supplier"],
      ["owner", "المالك", "Owner"],
      ["shared", "مشترك / حسب العقد", "Shared / per contract"],
    ]),
  }),
  q({
    code: "SUB-T1",
    accountTypes: ["SUBCONTRACTOR"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 1,
    textAr:
      "هل سبق أن رفضتم فرصة لعدم قدرتكم على تقييم جدية العميل؟",
    textEn:
      "Have you declined opportunities due to inability to assess client seriousness?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: yesNo.slice(0, 2),
  }),

  // ── Section 4: SUPPLIER ──────────────────────────────────────────────
  q({
    code: "SUP-CR1",
    accountTypes: ["SUPPLIER"],
    sectionCode: "CREDIT",
    questionOrder: 1,
    textAr: "ما مدة السداد التي تمنحونها للمقاولين؟",
    textEn: "Payment terms you grant contractors",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["cash", "نقد / فوري", "Cash / immediate"],
      ["15_30", "15–30 يوماً", "15–30 days"],
      ["30_60", "30–60 يوماً", "30–60 days"],
      ["60_90", "60–90 يوماً", "60–90 days"],
      ["over_90", "أكثر من 90 يوماً", "Over 90 days"],
    ]),
  }),
  q({
    code: "SUP-CR2",
    accountTypes: ["SUPPLIER"],
    sectionCode: "CREDIT",
    questionOrder: 2,
    textAr: "ما نسبة الذمم المتأخرة لديكم؟",
    textEn: "Share of overdue receivables",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: percentBuckets,
  }),
  q({
    code: "SUP-CR3",
    accountTypes: ["SUPPLIER"],
    sectionCode: "CREDIT",
    questionOrder: 3,
    textAr: "ما مدى اهتمامكم بضمان الدفع عبر المنصة؟",
    textEn: "Interest in platform-guaranteed payment",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
  }),
  q({
    code: "SUP-CR4",
    accountTypes: ["SUPPLIER"],
    sectionCode: "CREDIT",
    questionOrder: 4,
    textAr: "هل سبق أن أوقفتم التوريد بسبب عدم السداد؟",
    textEn: "Have you stopped supply due to non-payment?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: yesNo.slice(0, 2),
  }),
  q({
    code: "SUP-R1",
    accountTypes: ["SUPPLIER"],
    sectionCode: "RFQ",
    questionOrder: 1,
    textAr: "كم طلب عرض سعر يصلكم شهرياً؟",
    textEn: "RFQs received per month",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["under_10", "أقل من 10", "Under 10"],
      ["10_30", "10–30", "10–30"],
      ["30_100", "30–100", "30–100"],
      ["over_100", "أكثر من 100", "Over 100"],
    ]),
  }),
  q({
    code: "SUP-R2",
    accountTypes: ["SUPPLIER"],
    sectionCode: "RFQ",
    questionOrder: 2,
    textAr: "كيف تصلكم الطلبات اليوم؟ (واتساب / هاتف / بريد / نظام)",
    textEn: "How do RFQs reach you today? (WhatsApp / phone / email / system)",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["whatsapp", "واتساب", "WhatsApp"],
      ["phone", "هاتف", "Phone"],
      ["email", "بريد إلكتروني", "Email"],
      ["system", "نظام / ERP", "System / ERP"],
      ["in_person", "زيارة مباشرة", "In person"],
    ]),
  }),
  q({
    code: "SUP-R3",
    accountTypes: ["SUPPLIER"],
    sectionCode: "RFQ",
    questionOrder: 3,
    textAr: "كم يستغرق إعداد عرض السعر الواحد؟",
    textEn: "Time to prepare one quote",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["under_1h", "أقل من ساعة", "Under 1 hour"],
      ["1_4h", "1–4 ساعات", "1–4 hours"],
      ["half_day", "نصف يوم", "Half day"],
      ["full_day", "يوم كامل أو أكثر", "Full day or more"],
    ]),
  }),
  q({
    code: "SUP-R4",
    accountTypes: ["SUPPLIER"],
    sectionCode: "RFQ",
    questionOrder: 4,
    textAr: "ما نسبة العروض التي تتحول إلى طلبات فعلية؟",
    textEn: "Share of quotes that convert to orders",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: percentBuckets,
  }),
  q({
    code: "SUP-Q1",
    accountTypes: ["SUPPLIER"],
    sectionCode: "QUALITY",
    questionOrder: 1,
    textAr: "ما نسبة الطلبات التي تُرجع أو تُشتكى بسبب الجودة؟",
    textEn: "Share of orders returned or complained about (quality)",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: percentBuckets,
  }),
  q({
    code: "SUP-AI1",
    accountTypes: ["SUPPLIER"],
    sectionCode: "AI_DIGITAL",
    questionOrder: 10,
    textAr: "ما مدى اهتمامكم بالتسعير الآلي للعروض؟",
    textEn: "Interest in automated quote pricing",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
    note: "بديل AI2 — حصر الكميات غير ذي صلة بالمورّد",
  }),
  q({
    code: "SUP-AI2",
    accountTypes: ["SUPPLIER"],
    sectionCode: "AI_DIGITAL",
    questionOrder: 11,
    textAr: "ما مدى اهتمامكم بالتنبؤ بالطلب؟",
    textEn: "Interest in demand forecasting",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
    note: "بديل AI2 — حصر الكميات غير ذي صلة بالمورّد",
  }),

  // ── Section 4: TRADER ────────────────────────────────────────────────
  q({
    code: "TRD-TP1",
    accountTypes: ["TRADER"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 1,
    textAr: "هل واجهتم شيكات مرتجعة أو تعثّر سداد؟",
    textEn: "Have you faced bounced checks or payment defaults?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: yesNo.slice(0, 2),
  }),
  q({
    code: "TRD-TP2",
    accountTypes: ["TRADER"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 2,
    textAr: "ما نسبة مبيعاتكم بالآجل؟",
    textEn: "Share of sales on credit",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: percentBuckets,
  }),
  q({
    code: "TRD-TP3",
    accountTypes: ["TRADER"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 3,
    textAr: "ما مدى اهتمامكم بضمان الدفع عبر المنصة؟",
    textEn: "Interest in platform-guaranteed payment",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
  }),
  q({
    code: "TRD-C1",
    accountTypes: ["TRADER"],
    sectionCode: "CLIENTS",
    questionOrder: 1,
    textAr: "كيف تجدون عملاء جدداً اليوم؟",
    textEn: "How do you find new customers today?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["network", "شبكة علاقات", "Personal network"],
      ["walk_in", "زيارات / معارض", "Walk-in / exhibitions"],
      ["online", "إعلانات / منصات", "Online / platforms"],
      ["contractors", "مقاولون / مشاريع", "Contractors / projects"],
      ["agents", "وكلاء / موزّعون", "Agents / distributors"],
    ]),
  }),
  q({
    code: "TRD-P1",
    accountTypes: ["TRADER"],
    sectionCode: "PRICING",
    questionOrder: 1,
    textAr: "كيف تحدّدون أسعاركم مع تقلب سعر الصرف والشحن؟",
    textEn: "How do you set prices amid FX and shipping volatility?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["fixed_margin", "هامش ثابت", "Fixed margin"],
      ["index_linked", "ربط بمؤشر / سعر صرف", "Index / FX linked"],
      ["quote_validity", "صلاحية محددة للعرض", "Limited quote validity"],
      ["stock_cost", "تكلفة المخزون الفعلية", "Actual stock cost"],
      ["market_daily", "متابعة السوق يومياً", "Daily market tracking"],
    ]),
  }),
  q({
    code: "TRD-L1",
    accountTypes: ["TRADER"],
    sectionCode: "LOGISTICS",
    questionOrder: 1,
    textAr: "من يتحمل الشحن والتوصيل؟",
    textEn: "Who bears shipping and delivery?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["trader", "التاجر", "Trader"],
      ["customer", "العميل", "Customer"],
      ["third_party", "شركة شحن", "Third-party carrier"],
      ["depends", "حسب الاتفاق", "Depends on agreement"],
    ]),
  }),
  q({
    code: "TRD-D1",
    accountTypes: ["TRADER"],
    sectionCode: "AI_DIGITAL",
    questionOrder: 1,
    textAr: "ما مستوى أنظمتكم الرقمية (مخزون / فوترة)؟",
    textEn: "Level of digital systems (inventory / invoicing)",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["manual", "يدوي / Excel", "Manual / Excel"],
      ["basic", "برنامج أساسي", "Basic software"],
      ["integrated", "ERP متكامل", "Integrated ERP"],
      ["none", "لا يوجد", "None"],
    ]),
  }),
  q({
    code: "TRD-D2",
    accountTypes: ["TRADER"],
    sectionCode: "AI_DIGITAL",
    questionOrder: 2,
    textAr: "ما مدى اهتمامكم بعرض مخزونكم مباشرة على المنصة؟",
    textEn: "Interest in listing inventory live on the platform",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
  }),
  q({
    code: "TRD-HR1",
    accountTypes: ["TRADER"],
    sectionCode: "HUMAN_CAPITAL",
    questionOrder: 1,
    textAr: "هل لديكم موظفون (غير المالكين)؟",
    textEn: "Do you have employees (not just owners)?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: yesNo.slice(0, 2),
    note: "مكافئ HC0 — قسم الموارد البشرية للتاجر",
  }),
  q({
    code: "TRD-HR2",
    accountTypes: ["TRADER"],
    sectionCode: "HUMAN_CAPITAL",
    questionOrder: 2,
    textAr: "إجمالي الموظفين (مباشر + غير مباشر)",
    textEn: "Total employees (direct + indirect)",
    answerType: "SINGLE_CHOICE",
    required: true,
    showIf: hc0ShowIf,
    options: opts([
      ["1_5", "1–5", "1–5"],
      ["6_20", "6–20", "6–20"],
      ["21_50", "21–50", "21–50"],
      ["51_200", "51–200", "51–200"],
      ["over_200", "أكثر من 200", "Over 200"],
    ]),
    note: "مكافئ HC1",
  }),
  q({
    code: "TRD-HR3",
    accountTypes: ["TRADER"],
    sectionCode: "HUMAN_CAPITAL",
    questionOrder: 3,
    textAr: "أكبر تحدٍ في الموارد البشرية",
    textEn: "Biggest workforce challenge",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    showIf: hc0ShowIf,
    options: opts([
      ["hiring", "التوظيف", "Hiring"],
      ["retention", "الاحتفاظ", "Retention"],
      ["cost", "التكلفة", "Cost"],
      ["training", "التدريب", "Training"],
      ["compliance", "الامتثال / السعودة", "Compliance / localization"],
      ["productivity", "الإنتاجية", "Productivity"],
    ]),
    note: "مكافئ HC3 — HC2 (نسبة السعوديين) اختياري حسب البلد",
  }),

  // ── Section 4: COMPANY ───────────────────────────────────────────────
  q({
    code: "COM-O1",
    accountTypes: ["COMPANY"],
    sectionCode: "OPPORTUNITIES",
    questionOrder: 1,
    textAr: "كيف تحصلون على عقود جديدة اليوم؟",
    textEn: "How do you win new contracts today?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["tenders", "مناقصات", "Tenders"],
      ["direct", "تعاقد مباشر", "Direct contracting"],
      ["referrals", "إحالات", "Referrals"],
      ["framework", "اتفاقيات إطارية", "Framework agreements"],
      ["partners", "شركاء / مقاولون", "Partners / contractors"],
    ]),
  }),
  q({
    code: "COM-O2",
    accountTypes: ["COMPANY"],
    sectionCode: "OPPORTUNITIES",
    questionOrder: 2,
    textAr: "ما نسبة تجديد عقودكم سنوياً؟",
    textEn: "Annual contract renewal rate",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: percentBuckets,
  }),
  q({
    code: "COM-T1",
    accountTypes: ["COMPANY"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 1,
    textAr: "هل تواجهون تأخراً في تحصيل مستحقات عقود الصيانة؟",
    textEn: "Delays collecting maintenance contract dues?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: yesNo.slice(0, 2),
  }),
  q({
    code: "COM-T2",
    accountTypes: ["COMPANY"],
    sectionCode: "TRUST_PAYMENTS",
    questionOrder: 2,
    textAr: "ما مدى اهتمامكم بربط الدفع بمؤشرات الأداء (SLA)؟",
    textEn: "Interest in payment linked to SLA metrics",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
  }),
  q({
    code: "COM-S1",
    accountTypes: ["COMPANY"],
    sectionCode: "PROCUREMENT",
    questionOrder: 1,
    textAr: "كيف تشترون قطع الغيار والمستهلكات؟",
    textEn: "How do you buy spare parts and consumables?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["approved_vendors", "موردون معتمدون", "Approved vendors"],
      ["project_by_project", "حسب المشروع", "Project by project"],
      ["stock_program", "برنامج مخزون", "Stock program"],
      ["emergency", "طوارئ / أي مورّد", "Emergency / any supplier"],
      ["manufacturer", "مباشرة من المصنع", "Direct from manufacturer"],
    ]),
  }),
  q({
    code: "COM-S2",
    accountTypes: ["COMPANY"],
    sectionCode: "PROCUREMENT",
    questionOrder: 2,
    textAr: "ما أكبر مشكلة في توفير قطع الغيار؟",
    textEn: "Biggest spare parts sourcing problem",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["availability", "عدم التوفر", "Unavailability"],
      ["lead_time", "وقت التوريد الطويل", "Long lead time"],
      ["price", "السعر", "Price"],
      ["quality", "الجودة / التقليد", "Quality / counterfeits"],
      ["approval", "موافقات / بيروقراطية", "Approvals / bureaucracy"],
    ]),
  }),

  // ── Section 4: ENTITY ────────────────────────────────────────────────
  q({
    code: "ENT-W1",
    accountTypes: ["ENTITY"],
    sectionCode: "ENTITY_COOPERATION",
    questionOrder: 1,
    textAr: "ما نموذج التعاون المفضل مع المنصة؟",
    textEn: "Preferred cooperation model with the platform",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["mou", "اتفاقية تعاون (MoU)", "Memorandum of understanding"],
      ["api", "تكامل API", "API integration"],
      ["license", "ترخيص مؤسسي", "Institutional license"],
      ["pilot", "مشروع تجريبي", "Pilot project"],
    ]),
    note: "ENT-1 — بديل W1 (جهة لا تشترك شهرياً)",
  }),
  q({
    code: "ENT-W2",
    accountTypes: ["ENTITY"],
    sectionCode: "ENTITY_COOPERATION",
    questionOrder: 2,
    textAr: "ما دورة الاعتماد المتوقعة لديكم؟",
    textEn: "Expected approval cycle on your side",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["under_1m", "أقل من شهر", "Under 1 month"],
      ["1_3m", "1–3 أشهر", "1–3 months"],
      ["3_6m", "3–6 أشهر", "3–6 months"],
      ["over_6m", "أكثر من 6 أشهر", "Over 6 months"],
    ]),
    note: "ENT-1 — بديل W2",
  }),
  q({
    code: "ENT-W3",
    accountTypes: ["ENTITY"],
    sectionCode: "ENTITY_COOPERATION",
    questionOrder: 3,
    textAr: "من الجهة صاحبة القرار للتعاون؟",
    textEn: "Decision-making unit for cooperation",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["it", "تقنية المعلومات", "IT department"],
      ["procurement", "المشتريات", "Procurement"],
      ["legal", "القانونية", "Legal"],
      ["executive", "الإدارة العليا", "Executive leadership"],
      ["committee", "لجنة مشتركة", "Joint committee"],
    ]),
    note: "ENT-1 — بديل W3",
  }),
  q({
    code: "ENT-AI2",
    accountTypes: ["ENTITY"],
    sectionCode: "AI_DIGITAL",
    questionOrder: 10,
    textAr: "ما مدى اهتمامكم بمراقبة الامتثال آلياً؟",
    textEn: "Interest in automated compliance monitoring",
    answerType: "LINEAR_SCALE",
    required: true,
    options: null,
    scale: null,
    note: "ENT-2 — بديل AI2 (حصر الكميات غير ذي صلة)",
  }),
  q({
    code: "ENT-D1",
    accountTypes: ["ENTITY"],
    sectionCode: "AI_DIGITAL",
    questionOrder: 11,
    textAr: "ما البيانات التي يمكنكم مشاركتها مع القطاع الخاص؟",
    textEn: "What data can you share with the private sector?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["tender_stats", "إحصاءات المناقصات", "Tender statistics"],
      ["compliance", "بيانات امتثال / تراخيص", "Compliance / license data"],
      ["standards", "معايير / لوائح", "Standards / regulations"],
      ["training", "برامج تدريب", "Training programs"],
      ["none", "لا يمكن مشاركة بيانات", "Cannot share data"],
      ["case_by_case", "حسب الحالة", "Case by case"],
    ]),
    note: "ENT-3 — إضافة مقترحة",
  }),

  // ── Section 5: Universal (all 9 account types) ───────────────────────
  q({
    code: "ALT1",
    accountTypes: [...ALL_TYPES],
    sectionCode: "PLATFORM_UNIVERSAL",
    questionOrder: 1,
    textAr: "كيف تنجزون هذا العمل اليوم بدون منصة؟",
    textEn: "How do you accomplish this work today without a platform?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["whatsapp", "واتساب / مكالمات", "WhatsApp / calls"],
      ["email", "بريد / مستندات", "Email / documents"],
      ["spreadsheets", "Excel / جداول", "Spreadsheets"],
      ["erp", "أنظمة ERP / داخلية", "ERP / internal systems"],
      ["brokers", "وسطاء / شبكة", "Brokers / network"],
      ["manual_site", "زيارات موقع", "Site visits"],
    ]),
  }),
  q({
    code: "ALT2",
    accountTypes: [...ALL_TYPES],
    sectionCode: "PLATFORM_UNIVERSAL",
    questionOrder: 2,
    textAr: "ما أكثر ما يزعجكم في الطريقة الحالية؟",
    textEn: "What annoys you most about the current way?",
    answerType: "TEXTAREA",
    required: false,
    options: null,
    scale: null,
  }),
  q({
    code: "PMF1",
    accountTypes: [...ALL_TYPES],
    sectionCode: "PLATFORM_UNIVERSAL",
    questionOrder: 3,
    textAr:
      "كيف ستشعرون لو لم تعد منصة ABC متاحة؟ (محبط جداً / محبط قليلاً / لا يهم)",
    textEn:
      "How would you feel if ABC platform were no longer available?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["very_disappointed", "محبط جداً", "Very disappointed"],
      ["somewhat_disappointed", "محبط قليلاً", "Somewhat disappointed"],
      ["not_disappointed", "لا يهم", "Not disappointed"],
    ]),
    note: "سؤال PMF الكلاسيكي",
  }),
  q({
    code: "TRUST1",
    accountTypes: [...ALL_TYPES],
    sectionCode: "PLATFORM_UNIVERSAL",
    questionOrder: 4,
    textAr: "ما الذي يجعلكم تثقون بطرف لم تتعاملوا معه من قبل؟",
    textEn: "What makes you trust a party you have not worked with before?",
    answerType: "MULTIPLE_CHOICE",
    required: true,
    options: opts([
      ["verification", "توثيق / تحقق رسمي", "Official verification"],
      ["ratings", "تقييمات / مراجعات", "Ratings / reviews"],
      ["references", "مراجع مشاريع", "Project references"],
      ["guarantees", "ضمانات / escrow", "Guarantees / escrow"],
      ["personal_intro", "تعارف شخصي", "Personal introduction"],
      ["trial", "تجربة صغيرة أولاً", "Small trial first"],
    ]),
  }),
  q({
    code: "SRC1",
    accountTypes: [...ALL_TYPES],
    sectionCode: "PLATFORM_UNIVERSAL",
    questionOrder: 5,
    textAr: "كيف عرفتم عن منصة ABC؟",
    textEn: "How did you hear about ABC platform?",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["referral", "إحالة / زميل", "Referral / colleague"],
      ["social", "وسائل التواصل", "Social media"],
      ["event", "فعالية / معرض", "Event / exhibition"],
      ["search", "بحث على الإنترنت", "Online search"],
      ["partner", "شريك / جهة", "Partner / organization"],
      ["other", "أخرى", "Other"],
    ]),
  }),
  q({
    code: "CONSENT1",
    accountTypes: [...ALL_TYPES],
    sectionCode: "PLATFORM_UNIVERSAL",
    questionOrder: 6,
    textAr: "الموافقة على استخدام بياناتكم للتواصل",
    textEn: "Consent to use your data for follow-up contact",
    answerType: "SINGLE_CHOICE",
    required: true,
    options: opts([
      ["yes", "أوافق", "I agree"],
      ["no", "لا أوافق", "I do not agree"],
    ]),
  }),
];

const output = {
  version: "2026-08-21-coverage-gaps",
  defaultScale,
  metadata: {
    accountTypeSelectionNotes: {
      supplierVsTrader: {
        titleAr: "الفرق بين مورّد وتاجر",
        titleEn: "Supplier vs Trader",
        supplierAr:
          "مورّد: يصنّع أو يمتلك مخزوناً ويورّد مباشرة للمشاريع",
        supplierEn:
          "Supplier: manufactures or holds inventory and supplies directly to projects",
        traderAr:
          "تاجر: يشتري ويبيع دون تصنيع، غالباً استيراد وتوزيع",
        traderEn:
          "Trader: buys and resells without manufacturing, often import & distribution",
        noteAr:
          "⚠️ الفرق غير واضح للمستجيب — يجب عرض هذا التعريف في شاشة اختيار الفئة لتقليل التلوث",
        noteEn:
          "⚠️ Distinction is unclear to respondents — show this definition on account type selection to reduce misclassification",
      },
    },
    implementationNotes: {
      entityR1Optional:
        "ENT-4 — جعل R1 (حجم المعاملات السنوية) اختيارياً عند تطبيق البذرة على القالب الحالي",
      supplierAi2Replace:
        "SUP-AI — استبدال AI2 الحالي بـ SUP-AI1 و SUP-AI2 عند الدمج",
      entityPaymentReplace:
        "ENT-1 — استبدال W1/W2/W3 بـ ENT-W1/ENT-W2/ENT-W3 عند الدمج",
      entityAi2Replace:
        "ENT-2 — استبدال AI2 بـ ENT-AI2 عند الدمج",
    },
  },
  newQuestions,
  editsToExistingQuestions: [],
};

const outPath = join(
  process.cwd(),
  "docs/pilot-validation/coverage-gaps-seed.json"
);
writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf-8");

const counts: Record<string, number> = {};
for (const t of ALL_TYPES) counts[t] = 0;
for (const question of newQuestions) {
  for (const t of question.accountTypes) {
    counts[t]++;
  }
}

console.log("Wrote", outPath);
console.log("Total newQuestions entries:", newQuestions.length);
console.log("Questions per account type:");
for (const t of ALL_TYPES) {
  console.log(`  ${t}: ${counts[t]}`);
}
