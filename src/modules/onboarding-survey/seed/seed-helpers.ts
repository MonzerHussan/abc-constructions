import type { ShowIfRule } from '@/lib/onboarding/survey-show-if';
import type { SeedQuestion, SeedSection } from './individual-template';
import { mcOptions } from './individual-template';

export const YES_NO = mcOptions([
  ['yes', 'Yes', 'نعم'],
  ['no', 'No', 'لا'],
]);

export const YES_MAYBE_NO = mcOptions([
  ['yes', 'Yes', 'نعم'],
  ['maybe', 'Maybe', 'ربما'],
  ['no', 'No', 'لا'],
]);

export const LIKERT = mcOptions([
  ['1', '1 - Not important', '1 - غير مهم'],
  ['2', '2', '2'],
  ['3', '3', '3'],
  ['4', '4', '4'],
  ['5', '5 - Very important', '5 - مهم جداً'],
]);

export const REGIONS_OPTION_META = { optionSource: "REGIONS_BY_COUNTRY" as const };
export const NATIONALS_OPTION_META = { optionSource: "NATIONALS_PERCENT" as const };

/** @deprecated Use REGIONS_OPTION_META — options resolved from profile.country at runtime */
export const REGIONS = mcOptions([
  ['riyadh', 'Riyadh', 'الرياض'],
  ['jeddah', 'Jeddah', 'جدة'],
  ['dammam', 'Dammam', 'الدمام'],
  ['makkah', 'Makkah', 'مكة'],
  ['any_ksa', 'Anywhere in KSA', 'أي مكان في المملكة'],
  ['gcc', 'GCC', 'دول الخليج'],
]);

export const PROJECT_SIZE = mcOptions([
  ['small', 'Small (<5M SAR)', 'صغير (أقل من 5 مليون)'],
  ['medium', 'Medium (5-50M)', 'متوسط (5-50 مليون)'],
  ['large', 'Large (50-200M)', 'كبير (50-200 مليون)'],
  ['mega', 'Mega (>200M)', 'ضخم (أكثر من 200 مليون)'],
]);

export function companyProfileSection(sortOrder = 0): SeedSection {
  return {
    code: 'COMPANY_PROFILE',
    titleEn: 'Company Profile (KYC)',
    titleAr: 'ملف الشركة',
    sortOrder,
    questions: [
      {
        code: 'K1',
        questionTextEn: 'Years of operation in construction',
        questionTextAr: 'سنوات العمل في قطاع الإنشاءات',
        answerType: 'SINGLE_CHOICE',
        options: mcOptions([
          ['lt3', 'Less than 3 years', 'أقل من 3 سنوات'],
          ['3_7', '3-7 years', '3-7 سنوات'],
          ['8_15', '8-15 years', '8-15 سنة'],
          ['gt15', 'More than 15 years', 'أكثر من 15 سنة'],
        ]),
        sortOrder: 0,
        metadata: { compactNumeric: true },
      },
      {
        code: 'K2',
        questionTextEn: 'Number of active projects currently',
        questionTextAr: 'عدد المشاريع النشطة حالياً',
        answerType: 'SINGLE_CHOICE',
        options: mcOptions([
          ['0', 'None', 'لا يوجد'], ['1_3', '1-3', '1-3'], ['4_10', '4-10', '4-10'], ['gt10', 'More than 10', 'أكثر من 10'],
        ]),
        sortOrder: 1,
        metadata: { compactNumeric: true },
      },
      {
        code: 'K3',
        questionTextEn: 'Primary operating regions',
        questionTextAr: 'المناطق الرئيسية للعمل',
        answerType: 'MULTIPLE_CHOICE',
        options: [],
        sortOrder: 2,
        metadata: REGIONS_OPTION_META,
      },
      {
        code: 'K4',
        questionTextEn: 'Valid commercial registration and licenses?',
        questionTextAr: 'هل لديكم سجل تجاري وتراخيص سارية؟',
        answerType: 'SINGLE_CHOICE',
        options: mcOptions([
          ['valid', 'Yes, all valid', 'نعم، جميعها سارية'],
          ['partial', 'Partially valid', 'بعضها يحتاج تجديد'],
          ['no', 'No', 'لا'],
        ]),
        sortOrder: 3,
      },
    ],
  };
}

export function humanCapitalPlugIn(hasEmployeesCode = 'HC0'): SeedSection {
  return {
    code: 'HUMAN_CAPITAL',
    titleEn: 'Human Capital',
    titleAr: 'رأس المال البشري',
    sortOrder: 90,
    showIf: { questionCode: hasEmployeesCode, op: 'eq', value: 'yes' },
    questions: [
      {
        code: 'HC1',
        questionTextEn: 'Total employees (direct + indirect)',
        questionTextAr: 'إجمالي الموظفين (مباشر + غير مباشر)',
        answerType: 'SINGLE_CHOICE',
        options: mcOptions([
          ['lt10', 'Less than 10', 'أقل من 10'], ['10_50', '10-50', '10-50'],
          ['51_200', '51-200', '51-200'], ['gt200', 'More than 200', 'أكثر من 200'],
        ]),
        sortOrder: 0,
        metadata: { compactNumeric: true },
      },
      {
        code: 'HC2',
        questionTextEn: 'Nationals percentage in workforce',
        questionTextAr: 'نسبة المواطنين في القوى العاملة',
        answerType: 'SINGLE_CHOICE',
        options: [],
        sortOrder: 1,
        metadata: { ...NATIONALS_OPTION_META, compactNumeric: true },
      },
      {
        code: 'HC3',
        questionTextEn: 'Biggest workforce challenge',
        questionTextAr: 'أكبر تحدٍ في الموارد البشرية',
        answerType: 'MULTIPLE_CHOICE',
        options: mcOptions([
          ['hiring', 'Finding skilled workers', 'إيجاد عمال مهرة'],
          ['retention', 'Retention', 'الاحتفاظ بالكفاءات'],
          ['cost', 'Labor cost', 'تكلفة العمالة'],
          ['compliance', 'Saudization compliance', 'التوطين'],
        ]),
        sortOrder: 2,
      },
    ],
  };
}

export function employeesGateQuestion(code = 'HC0', sortOrder = 5): SeedQuestion {
  return {
    code,
    questionTextEn: 'Do you have employees (not just owners)?',
    questionTextAr: 'هل لديكم موظفون (غير المالكين)؟',
    answerType: 'SINGLE_CHOICE',
    options: YES_NO,
    sortOrder,
  };
}

const HAS_TRANSPORT: ShowIfRule = {
  questionCode: "TR0",
  op: "in",
  value: ["yes", "yes_service", "yes_internal"],
};

/** Single-screen transport section (gate + fleet + regions + GPS). */
export function unifiedTransportSection(sortOrder = 5): SeedSection {
  return {
    code: "TRANSPORT",
    titleEn: "Transport & Logistics",
    titleAr: "النقل واللوجستيات",
    sortOrder,
    questions: [
      {
        code: "TR0",
        questionTextEn: "Do you own a transport fleet or operate private logistics?",
        questionTextAr: "هل تملكون أسطول نقل أو تشغّلون لوجستيات خاصة؟",
        answerType: "SINGLE_CHOICE",
        options: mcOptions([
          ["yes_service", "Yes, we offer transport services", "نعم، ونقدّم خدمة نقل للغير"],
          ["yes_internal", "Yes, internal use only", "نعم، لاستخدامنا فقط"],
          ["no", "No", "لا"],
        ]),
        sortOrder: 0,
      },
      {
        code: "TR_FLEET",
        questionTextEn: "How many vehicles in your fleet?",
        questionTextAr: "كم مركبة في أسطولكم؟",
        answerType: "SINGLE_CHOICE",
        options: mcOptions([
          ["1_3", "1-3", "1-3"],
          ["4_10", "4-10", "4-10"],
          ["11_30", "11-30", "11-30"],
          ["gt30", "30+", "30+"],
        ]),
        sortOrder: 1,
        showIf: HAS_TRANSPORT,
        metadata: { compactNumeric: true },
      },
      {
        code: "TR_UTIL",
        questionTextEn: "Fleet utilization rate?",
        questionTextAr: "ما نسبة استغلال الأسطول؟",
        answerType: "SINGLE_CHOICE",
        options: mcOptions([
          ["lt40", "<40%", "أقل من 40%"],
          ["40_70", "40-70%", "40-70%"],
          ["71_90", "71-90%", "71-90%"],
          ["gt90", "90%+", "90%+"],
          ["unknown", "Don't know", "لا نعرف"],
        ]),
        sortOrder: 2,
        showIf: HAS_TRANSPORT,
        metadata: { compactNumeric: true },
      },
      {
        code: "TR_REGIONS",
        questionTextEn: "Service regions",
        questionTextAr: "مناطق الخدمة",
        answerType: "MULTIPLE_CHOICE",
        options: [],
        sortOrder: 3,
        showIf: HAS_TRANSPORT,
        metadata: REGIONS_OPTION_META,
      },
      {
        code: "TR_GPS",
        questionTextEn: "GPS/tracking system in use?",
        questionTextAr: "هل تستخدمون نظام تتبع/GPS؟",
        answerType: "SINGLE_CHOICE",
        options: YES_NO,
        sortOrder: 4,
        showIf: HAS_TRANSPORT,
      },
      {
        code: "TR_RENT",
        questionTextEn: "Interest in renting excess fleet capacity via platform?",
        questionTextAr: "الاهتمام بتأجير الطاقة الفائضة عبر المنصة؟",
        answerType: "LINEAR_SCALE",
        options: mcOptions([
          ["1", "1", "1"],
          ["2", "2", "2"],
          ["3", "3", "3"],
          ["4", "4", "4"],
          ["5", "5", "5"],
        ]),
        sortOrder: 5,
        showIf: { questionCode: "TR0", op: "eq", value: "yes_service" },
      },
    ],
  };
}

/** @deprecated Use unifiedTransportSection */
export function transportPlugIn(showIf?: ShowIfRule): SeedSection {
  return {
    code: 'TRANSPORT_LOGISTICS',
    titleEn: 'Transport & Logistics',
    titleAr: 'النقل واللوجستيات',
    sortOrder: 91,
    showIf,
    questions: [
      {
        code: 'T1',
        questionTextEn: 'Do you provide transport/logistics services?',
        questionTextAr: 'هل تقدمون خدمات نقل/لوجستيات؟',
        answerType: 'SINGLE_CHOICE',
        options: YES_NO,
        sortOrder: 0,
      },
      {
        code: 'T2',
        questionTextEn: 'Fleet size',
        questionTextAr: 'حجم الأسطول',
        answerType: 'SINGLE_CHOICE',
        options: mcOptions([
          ['1_5', '1-5 vehicles', '1-5 مركبات'], ['6_20', '6-20', '6-20'],
          ['21_50', '21-50', '21-50'], ['gt50', 'More than 50', 'أكثر من 50'],
        ]),
        sortOrder: 1,
        showIf: { questionCode: 'T1', op: 'eq', value: 'yes' },
      },
      {
        code: 'T3',
        questionTextEn: 'Service regions',
        questionTextAr: 'مناطق الخدمة',
        answerType: 'MULTIPLE_CHOICE',
        options: REGIONS,
        sortOrder: 2,
        showIf: { questionCode: 'T1', op: 'eq', value: 'yes' },
      },
      {
        code: 'T4',
        questionTextEn: 'Tracking/GPS system in use?',
        questionTextAr: 'هل تستخدمون نظام تتبع/GPS؟',
        answerType: 'SINGLE_CHOICE',
        options: YES_NO,
        sortOrder: 3,
        showIf: { questionCode: 'T1', op: 'eq', value: 'yes' },
      },
    ],
  };
}

export function platformValueSection(featureOptions: [string, string, string][], sortOrder = 80): SeedSection {
  return {
    code: 'PLATFORM_VALUE',
    titleEn: 'Platform Features & Value',
    titleAr: 'قيمة المنصة والميزات',
    sortOrder,
    questions: [
      {
        code: 'M1',
        questionTextEn: 'Select and rank top 5 features (1=most important)',
        questionTextAr: 'اختر أهم 5 ميزات ورتبها (1 = الأهم)',
        answerType: 'MULTIPLE_CHOICE',
        options: mcOptions(featureOptions),
        sortOrder: 0,
        metadata: { rankMax: 5 },
      },
      {
        code: 'M2',
        questionTextEn: 'Single most important service from the platform',
        questionTextAr: 'الخدمة الأكثر أهمية التي تتوقعها من المنصة',
        answerType: 'SINGLE_CHOICE',
        options: mcOptions(featureOptions.slice(0, 5)),
        sortOrder: 1,
      },
      {
        code: 'M3',
        questionTextEn: 'Biggest challenge you want the platform to solve (optional)',
        questionTextAr: 'أكبر تحدٍ تريد أن تحله المنصة (اختياري)',
        answerType: 'TEXTAREA',
        sortOrder: 2,
        isRequired: false,
      },
    ],
  };
}

export function paymentSection(sortOrder = 81): SeedSection {
  return {
    code: 'PAYMENT',
    titleEn: 'Payment Model & Willingness to Pay',
    titleAr: 'نموذج الدفع والاستعداد للدفع',
    sortOrder,
    questions: [
      {
        code: 'W1',
        questionTextEn: 'Preferred platform payment model',
        questionTextAr: 'نموذج الدفع المفضل مقابل خدمات المنصة',
        answerType: 'SINGLE_CHOICE',
        options: mcOptions([
          ['free', 'Free (sponsored)', 'مجاني'], ['monthly', 'Monthly subscription', 'اشتراك شهري'],
          ['annual', 'Annual subscription', 'اشتراك سنوي'], ['commission', 'Commission per deal', 'عمولة'],
          ['success', 'Pay on success', 'دفع عند النجاح'], ['any', 'No preference', 'لا يهم'],
        ]),
        sortOrder: 0,
      },
      {
        code: 'W2',
        questionTextEn: 'Max monthly subscription willing to pay',
        questionTextAr: 'الحد الأقصى للاشتراك الشهري',
        answerType: 'SINGLE_CHOICE',
        options: mcOptions([
          ['lt100', 'Less than 100', 'أقل من 100'], ['100_500', '100-500', '100-500'],
          ['500_2000', '500-2,000', '500-2,000'], ['gt2000', 'More than 2,000', 'أكثر من 2,000'],
          ['cant', 'Cannot pay now', 'لا أستطيع الدفع'],
        ]),
        sortOrder: 1,
        metadata: { currencySegment: true },
      },
      {
        code: 'W3',
        questionTextEn: 'What would you pay for?',
        questionTextAr: 'مقابل ماذا ستكونون مستعدين للدفع؟',
        answerType: 'MULTIPLE_CHOICE',
        options: mcOptions([
          ['leads', 'Qualified leads/projects', 'فرص/projects مؤهلة'],
          ['visibility', 'Profile visibility', 'إبراز الملف'],
          ['tools', 'Digital tools (BOQ, RFQ)', 'أدوات رقمية'],
          ['analytics', 'Analytics & reports', 'تحليلات وتقارير'],
          ['support', 'Premium support', 'دعم متميز'],
        ]),
        sortOrder: 2,
      },
    ],
  };
}

export function betaSection(sortOrder = 82): SeedSection {
  return {
    code: 'BETA',
    titleEn: 'Beta Program',
    titleAr: 'البرنامج التجريبي',
    sortOrder,
    questions: [
      {
        code: 'X1',
        questionTextEn: 'Join the platform beta?',
        questionTextAr: 'هل توافق على المشاركة في النسخة التجريبية؟',
        answerType: 'SINGLE_CHOICE',
        options: YES_MAYBE_NO,
        sortOrder: 0,
      },
      {
        code: 'X2',
        questionTextEn: 'Preferred contact method for beta',
        questionTextAr: 'طريقة التواصل المفضلة للتجربة',
        answerType: 'SINGLE_CHOICE',
        options: mcOptions([
          ['whatsapp', 'WhatsApp', 'واتساب'], ['phone', 'Phone', 'اتصال'], ['email', 'Email', 'بريد'],
        ]),
        sortOrder: 1,
      },
    ],
  };
}

export function openSection(sortOrder = 83): SeedSection {
  return {
    code: 'OPEN',
    titleEn: 'Your Feedback',
    titleAr: 'ملاحظاتكم',
    sortOrder,
    questions: [
      {
        code: 'O1',
        questionTextEn: 'Biggest problem you want ABC to solve',
        questionTextAr: 'أكبر مشكلة تريدون أن تحلها منصة ABC',
        answerType: 'TEXTAREA',
        sortOrder: 0,
      },
      {
        code: 'O2',
        questionTextEn: 'Additional suggestions (optional)',
        questionTextAr: 'اقتراحات إضافية (اختياري)',
        answerType: 'TEXTAREA',
        sortOrder: 1,
        isRequired: false,
      },
    ],
  };
}

export function aiDigitalSection(sortOrder = 70): SeedSection {
  return {
    code: 'AI_DIGITAL',
    titleEn: 'Digital & AI Readiness',
    titleAr: 'الجاهزية الرقمية والذكاء الاصطناعي',
    sortOrder,
    questions: [
      {
        code: 'AI1',
        questionTextEn: 'Current digital maturity level',
        questionTextAr: 'مستوى النضج الرقمي الحالي',
        answerType: 'SINGLE_CHOICE',
        options: mcOptions([
          ['manual', 'Mostly manual/paper', 'ورقي/يدوي'], ['partial', 'Partial digital', 'رقمي جزئي'],
          ['integrated', 'Integrated systems', 'أنظمة متكاملة'], ['advanced', 'Advanced/automated', 'متقدم/آلي'],
        ]),
        sortOrder: 0,
      },
      {
        code: 'AI2',
        questionTextEn: 'Interest in AI-assisted BOQ/quantities',
        questionTextAr: 'الاهتمام بالذكاء الاصطناعي للكميات/BOQ',
        answerType: 'LINEAR_SCALE',
        options: LIKERT,
        sortOrder: 1,
      },
      {
        code: 'AI3',
        questionTextEn: 'Interest in AI matching/recommendations',
        questionTextAr: 'الاهتمام بالمطابقة والتوصيات الذكية',
        answerType: 'LINEAR_SCALE',
        options: LIKERT,
        sortOrder: 2,
      },
    ],
  };
}
