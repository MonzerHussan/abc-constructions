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
  PROJECT_SIZE,
  transportPlugIn,
  YES_NO,
} from './seed-helpers';

export function contractorSections(): SeedSection[] {
  return [
    companyProfileSection(0),
    {
      code: 'BOQ_QUANTITIES',
      titleEn: 'BOQ & Quantities',
      titleAr: 'الكميات وقوائم BOQ',
      sortOrder: 1,
      questions: [
        {
          code: 'B1',
          questionTextEn: 'How do you prepare BOQ/quantities today?',
          questionTextAr: 'كيف تعدّون الكميات/BOQ حالياً؟',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['manual', 'Manual Excel', 'Excel يدوي'], ['software', 'Specialized software', 'برامج متخصصة'],
            ['consultant', 'External consultant', 'استشاري خارجي'], ['mixed', 'Mixed', 'مزيج'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'B2',
          questionTextEn: 'Biggest BOQ/quantities pain points',
          questionTextAr: 'أكبر تحديات في الكميات',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['accuracy', 'Accuracy errors', 'أخطاء الدقة'], ['time', 'Time consuming', 'استهلاك الوقت'],
            ['updates', 'Frequent revisions', 'مراجعات متكررة'], ['coordination', 'Coordination with design', 'التنسيق مع التصميم'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'B3',
          questionTextEn: 'Average time to prepare BOQ for medium project',
          questionTextAr: 'متوسط وقت إعداد BOQ لمشروع متوسط',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt1w', 'Less than 1 week', 'أقل من أسبوع'], ['1_2w', '1-2 weeks', '1-2 أسبوع'],
            ['2_4w', '2-4 weeks', '2-4 أسابيع'], ['gt4w', 'More than 4 weeks', 'أكثر من 4 أسابيع'],
          ]),
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'PROCUREMENT',
      titleEn: 'Procurement & Supply',
      titleAr: 'التوريد والمشتريات',
      sortOrder: 2,
      questions: [
        {
          code: 'P1',
          questionTextEn: 'How do you source materials today?',
          questionTextAr: 'كيف ت sourcing المواد حالياً؟',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['direct', 'Direct from suppliers', 'مباشرة من الموردين'], ['traders', 'Through traders', 'عبر تجار'],
            ['tenders', 'Material tenders', 'مناقصات مواد'], ['brokers', 'Brokers/middlemen', 'وسطاء'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'P2',
          questionTextEn: 'Material price volatility impact',
          questionTextAr: 'تأثير تقلب أسعار المواد',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['high', 'High impact', 'تأثير كبير'], ['medium', 'Medium', 'متوسط'], ['low', 'Low', 'قليل'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'P3',
          questionTextEn: 'Interest in centralized material marketplace',
          questionTextAr: 'الاهتمام بسوق مواد مركزي',
          answerType: 'LINEAR_SCALE',
          options: mcOptions([
            ['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['4', '4', '4'], ['5', '5', '5'],
          ]),
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'RFQ_BIDDING',
      titleEn: 'RFQ & Bidding',
      titleAr: 'طلبات العروض والمناقصات',
      sortOrder: 3,
      questions: [
        {
          code: 'R1',
          questionTextEn: 'Typical project size you bid on',
          questionTextAr: 'حجم المشاريع التي تشاركون فيها',
          answerType: 'SINGLE_CHOICE',
          options: PROJECT_SIZE,
          sortOrder: 0,
        },
        {
          code: 'R2',
          questionTextEn: 'RFQs received per month (average)',
          questionTextAr: 'عدد RFQ شهرياً (متوسط)',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['0_2', '0-2', '0-2'], ['3_5', '3-5', '3-5'], ['6_15', '6-15', '6-15'], ['gt15', 'More than 15', 'أكثر من 15'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'R3',
          questionTextEn: 'Win rate on submitted bids',
          questionTextAr: 'نسبة الفوز في العروض',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt10', 'Less than 10%', 'أقل من 10%'], ['10_25', '10-25%', '10-25%'],
            ['26_50', '26-50%', '26-50%'], ['gt50', 'More than 50%', 'أكثر من 50%'],
          ]),
          sortOrder: 2,
        },
        {
          code: 'R4',
          questionTextEn: 'Biggest RFQ/bidding challenges',
          questionTextAr: 'أكبر تحديات RFQ/المناقصات',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['time', 'Short deadlines', 'مواعيد ضيقة'], ['info', 'Incomplete info', 'معلومات ناقصة'],
            ['pricing', 'Pricing pressure', 'ضغط التسعير'], ['competition', 'High competition', 'منافسة عالية'],
          ]),
          sortOrder: 3,
        },
      ],
    },
    {
      code: 'OPERATIONS',
      titleEn: 'Operations & Workforce',
      titleAr: 'التشغيل والموارد',
      sortOrder: 4,
      questions: [
        employeesGateQuestion('HC0', 0),
        {
          code: 'O1',
          questionTextEn: 'Subcontractor dependency level',
          questionTextAr: 'مستوى الاعتماد على مقاولين فرعيين',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['low', 'Low (<30%)', 'منخفض'], ['medium', 'Medium (30-60%)', 'متوسط'],
            ['high', 'High (>60%)', 'مرتفع'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'O2',
          questionTextEn: 'Payment collection delays from clients?',
          questionTextAr: 'تأخر تحصيل المدفوعات من العملاء؟',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['often', 'Often', 'كثيراً'], ['sometimes', 'Sometimes', 'أحياناً'], ['rarely', 'Rarely', 'نادراً'],
          ]),
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'TRANSPORT_GATE',
      titleEn: 'Transport Services',
      titleAr: 'خدمات النقل',
      sortOrder: 5,
      questions: [
        {
          code: 'TR0',
          questionTextEn: 'Do you operate own transport/logistics?',
          questionTextAr: 'هل تشغّلون نقل/لوجستيات خاصة؟',
          answerType: 'SINGLE_CHOICE',
          options: YES_NO,
          sortOrder: 0,
        },
      ],
    },
    humanCapitalPlugIn('HC0'),
    transportPlugIn({ questionCode: 'TR0', op: 'eq', value: 'yes' }),
    aiDigitalSection(6),
    platformValueSection([
      ['boq_ai', 'AI BOQ/quantities', 'AI للكميات'],
      ['rfq', 'RFQ management', 'إدارة RFQ'],
      ['procurement', 'Material procurement', 'توريد المواد'],
      ['subcontractors', 'Subcontractor matching', 'مطابقة مقاولين فرعيين'],
      ['payments', 'Payment protection', 'حماية المدفوعات'],
      ['reporting', 'Project reporting', 'تقارير المشاريع'],
    ], 7),
    paymentSection(8),
    betaSection(9),
    openSection(10),
  ];
}
