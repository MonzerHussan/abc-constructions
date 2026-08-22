import type { SeedSection } from './individual-template';
import { mcOptions } from './individual-template';
import {
  aiDigitalSection,
  betaSection,
  companyProfileSection,
  employeesGateQuestion,
  humanCapitalPlugIn,
  openSection,
  paymentSection,
  platformValueSection,
} from './seed-helpers';

/** Q1 specialty chosen in onboarding — not repeated here. Skip logic uses onboarding subcategories. */
export function subcontractorSections(): SeedSection[] {
  return [
    companyProfileSection(0),
    {
      code: 'OPPORTUNITIES',
      titleEn: 'Opportunities & RFQ Flow',
      titleAr: 'الفرص وتدفق RFQ',
      sortOrder: 1,
      questions: [
        {
          code: 'Q6',
          questionTextEn: 'How do you find work opportunities today?',
          questionTextAr: 'كيف تجدون فرص العمل حالياً؟',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['relationships', 'Relationships', 'علاقات'], ['whatsapp', 'WhatsApp groups', 'واتساب'],
            ['platforms', 'Online platforms', 'منصات'], ['main_contractor', 'Main contractors', 'مقاولين رئيسيين'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q7',
          questionTextEn: 'RFQs received per month',
          questionTextAr: 'عدد RFQ شهرياً',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['0_2', '0-2', '0-2'], ['3_10', '3-10', '3-10'], ['11_30', '11-30', '11-30'], ['gt30', '30+', '30+'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'Q8',
          questionTextEn: 'Response rate to RFQs',
          questionTextAr: 'نسبة الرد على RFQ',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt25', 'Less than 25%', 'أقل من 25%'], ['25_50', '25-50%', '25-50%'],
            ['51_75', '51-75%', '51-75%'], ['gt75', 'More than 75%', 'أكثر من 75%'],
          ]),
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'PRICING',
      titleEn: 'Pricing & Quotation',
      titleAr: 'التسعير وعروض الأسعار',
      sortOrder: 2,
      questions: [
        {
          code: 'Q11',
          questionTextEn: 'Average time to prepare a quotation',
          questionTextAr: 'متوسط وقت إعداد عرض السعر',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt4h', 'Less than 4 hours', 'أقل من 4 ساعات'], ['4_24h', '4-24 hours', '4-24 ساعة'],
            ['1_3d', '1-3 days', '1-3 أيام'], ['gt3d', 'More than 3 days', 'أكثر من 3 أيام'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q12',
          questionTextEn: 'Pricing method primarily used',
          questionTextAr: 'طريقة التسعير الأساسية',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['unit', 'Unit rate', 'سعر الوحدة'], ['lump', 'Lump sum', 'مقطوع'],
            ['cost_plus', 'Cost plus', 'تكلفة +'], ['mixed', 'Mixed', 'مزيج'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'MATERIALS',
      titleEn: 'Materials (Dynamic by Specialty)',
      titleAr: 'المواد (ديناميكي حسب التخصص)',
      sortOrder: 3,
      questions: [
        {
          code: 'Q15',
          questionTextEn: 'Key materials you supply/install (based on your specialty)',
          questionTextAr: 'المواد الرئيسية التي تورد/تركب (حسب تخصصكم)',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['electrical', 'Electrical', 'كهرباء'], ['plumbing', 'Plumbing', 'سباكة'],
            ['hvac', 'HVAC', 'تكييف'], ['finishing', 'Finishing', 'تشطيبات'],
            ['structural', 'Structural steel', 'حديد'], ['mep', 'MEP packages', 'MEP'],
            ['other', 'Other', 'أخرى'],
          ]),
          sortOrder: 0,
          metadata: { dynamicBySpecialty: true, unionSpecialties: true },
        },
      ],
    },
    {
      code: 'EXECUTION',
      titleEn: 'Execution & Delivery',
      titleAr: 'التنفيذ والتسليم',
      sortOrder: 4,
      questions: [
        {
          code: 'Q18',
          questionTextEn: 'On-time delivery rate',
          questionTextAr: 'نسبة التسليم في الوقت',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt70', 'Less than 70%', 'أقل من 70%'], ['70_85', '70-85%', '70-85%'],
            ['86_95', '86-95%', '86-95%'], ['gt95', 'More than 95%', 'أكثر من 95%'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q19',
          questionTextEn: 'Quality rework frequency',
          questionTextAr: 'تكرار إعادة العمل بسبب الجودة',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['often', 'Often', 'كثيراً'], ['sometimes', 'Sometimes', 'أحياناً'], ['rarely', 'Rarely', 'نادراً'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'WORKFORCE',
      titleEn: 'Workforce',
      titleAr: 'العمالة',
      sortOrder: 5,
      questions: [
        employeesGateQuestion('HC0', 0),
        {
          code: 'Q26',
          questionTextEn: 'Skilled vs unskilled labor ratio',
          questionTextAr: 'نسبة العمالة الماهرة vs العادية',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['mostly_skilled', 'Mostly skilled', 'معظمها ماهرة'], ['balanced', 'Balanced', 'متوازنة'],
            ['mostly_unskilled', 'Mostly unskilled', 'معظمها عادية'],
          ]),
          sortOrder: 1,
          showIf: { questionCode: 'HC0', op: 'eq', value: 'yes' },
        },
        {
          code: 'Q27',
          questionTextEn: 'Labor availability challenges',
          questionTextAr: 'تحديات توفر العمالة',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['shortage', 'Skilled shortage', 'نقص المهارة'], ['cost', 'High cost', 'تكلفة عالية'],
            ['turnover', 'High turnover', 'دوران عالي'], ['permits', 'Work permits', 'تصاريح'],
          ]),
          sortOrder: 2,
          showIf: { questionCode: 'HC0', op: 'eq', value: 'yes' },
        },
      ],
    },
    humanCapitalPlugIn('HC0'),
    {
      code: 'PAYMENTS',
      titleEn: 'Payments & Collection',
      titleAr: 'المدفوعات والتحصيل',
      sortOrder: 6,
      questions: [
        {
          code: 'Q30',
          questionTextEn: 'Average payment delay from main contractors',
          questionTextAr: 'متوسط تأخر الدفع من المقاول الرئيسي',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt30', 'Less than 30 days', 'أقل من 30 يوم'], ['30_60', '30-60 days', '30-60'],
            ['60_90', '60-90 days', '60-90'], ['gt90', 'More than 90 days', 'أكثر من 90'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q31',
          questionTextEn: 'Interest in payment protection/escrow',
          questionTextAr: 'الاهتمام بحماية المدفوعات/Escrow',
          answerType: 'LINEAR_SCALE',
          options: mcOptions([
            ['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['4', '4', '4'], ['5', '5', '5'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    aiDigitalSection(7),
    platformValueSection([
      ['rfq', 'More RFQ opportunities', 'فرص RFQ'],
      ['pricing', 'Fast quoting tools', 'أدوات تسعير'],
      ['matching', 'Contractor matching', 'مطابقة مقاولين'],
      ['payments', 'Payment protection', 'حماية مدفوعات'],
      ['portfolio', 'Work portfolio', 'سجل أعمال'],
    ], 8),
    paymentSection(9),
    betaSection(10),
    openSection(11),
  ];
}
