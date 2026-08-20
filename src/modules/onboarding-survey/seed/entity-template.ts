import type { SeedSection } from './individual-template';
import { mcOptions } from './individual-template';
import {
  aiDigitalSection,
  betaSection,
  openSection,
  paymentSection,
  platformValueSection,
  REGIONS,
  YES_NO,
} from './seed-helpers';

export const ENTITY_TYPES = {
  ministry: 'ministry',
  municipality: 'municipality',
  authority: 'authority',
  utility: 'utility',
  finance: 'finance',
  regulator: 'regulator',
  education: 'education',
  military: 'military',
} as const;

export function entitySections(): SeedSection[] {
  return [
    {
      code: 'ENTITY_PROFILE',
      titleEn: 'Entity Profile',
      titleAr: 'ملف الجهة',
      sortOrder: 0,
      questions: [
        {
          code: 'G1',
          questionTextEn: 'Type of government/regulatory entity (routing question)',
          questionTextAr: 'نوع الجهة (سؤال محوري)',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            [ENTITY_TYPES.ministry, 'Ministry', 'وزارة'],
            [ENTITY_TYPES.municipality, 'Municipality', 'بلدية/أمانة'],
            [ENTITY_TYPES.authority, 'Authority/agency', 'هيئة'],
            [ENTITY_TYPES.utility, 'Utility/infrastructure', 'مرافق/بنية تحتية'],
            [ENTITY_TYPES.finance, 'Financial institution', 'جهة مالية'],
            [ENTITY_TYPES.regulator, 'Regulator', 'جهة رقابية'],
            [ENTITY_TYPES.education, 'Education/training', 'تعليم/تدريب'],
            [ENTITY_TYPES.military, 'Military/security', 'عسكرية/أمنية'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'G2',
          questionTextEn: 'Primary mandate in construction sector',
          questionTextAr: 'الاختصاص الرئيسي في قطاع الإنشاءات',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['tendering', 'Public tendering', 'مناقصات حكومية'],
            ['regulation', 'Regulation/compliance', 'تنظيم/امتثال'],
            ['funding', 'Funding/finance', 'تمويل'],
            ['standards', 'Standards/codes', 'معايير/أكواد'],
            ['training', 'Workforce training', 'تدريب workforce'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'G3',
          questionTextEn: 'Geographic scope',
          questionTextAr: 'النطاق الجغرافي',
          answerType: 'MULTIPLE_CHOICE',
          options: REGIONS,
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'STAKEHOLDER_MAP',
      titleEn: 'Stakeholder Network (R0)',
      titleAr: 'خريطة أصحاب المصلحة (R0)',
      sortOrder: 1,
      questions: [
        {
          code: 'R0',
          questionTextEn: 'Key stakeholder groups you interact with (select all)',
          questionTextAr: 'مجموعات أصحاب المصلحة الرئيسية (اختر الكل)',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['contractors', 'Main contractors', 'مقاولين رئيسيين'],
            ['consultants', 'Consultants', 'استشاريين'],
            ['suppliers', 'Suppliers', 'موردين'],
            ['owners', 'Private developers', 'مطورين'],
            ['public', 'Public/citizens', 'جمهور'],
            ['other_entities', 'Other government entities', 'جهات حكومية أخرى'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'R1',
          questionTextEn: 'Annual construction-related transactions volume',
          questionTextAr: 'حجم المعاملات السنوية المتعلقة بالإنشاءات',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt100m', 'Less than 100M SAR', 'أقل من 100 مليون'],
            ['100m_1b', '100M-1B', '100M-1B'],
            ['1b_10b', '1B-10B', '1B-10B'],
            ['gt10b', 'More than 10B', 'أكثر من 10B'],
          ]),
          sortOrder: 1,
          metadata: { currencySegment: true },
        },
      ],
    },
    {
      code: 'PROCUREMENT',
      titleEn: 'Procurement & Tenders',
      titleAr: 'المشتريات والمناقصات',
      sortOrder: 2,
      showIf: {
        operator: 'or',
        conditions: [
          { questionCode: 'G2', op: 'includes', value: 'tendering' },
          { questionCode: 'G1', op: 'in', value: [ENTITY_TYPES.ministry, ENTITY_TYPES.municipality, ENTITY_TYPES.authority] },
        ],
      },
      questions: [
        {
          code: 'G10',
          questionTextEn: 'E-tendering platform in use?',
          questionTextAr: 'منصة مناقصات إلكترونية؟',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['national', 'National platform (Etimad/etc.)', 'وطنية'], ['internal', 'Internal system', 'داخلية'],
            ['mixed', 'Mixed', 'مزيج'], ['manual', 'Mostly manual', 'يدوي'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'G11',
          questionTextEn: 'Average tenders published per year',
          questionTextAr: 'متوسط المناقصات السنوية',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt50', 'Less than 50', 'أقل من 50'], ['50_200', '50-200', '50-200'],
            ['201_1000', '201-1000', '201-1000'], ['gt1000', '1000+', '1000+'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'G12',
          questionTextEn: 'Biggest procurement pain points',
          questionTextAr: 'أكبر تحديات المشتريات',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['qualification', 'Vendor qualification', 'تأهيل موردين'],
            ['evaluation', 'Bid evaluation', 'تقييم العروض'],
            ['transparency', 'Transparency', 'شفافية'],
            ['timeline', 'Timeline delays', 'تأخير الجداول'],
          ]),
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'REGULATION',
      titleEn: 'Regulation & Compliance',
      titleAr: 'التنظيم والامتثال',
      sortOrder: 3,
      showIf: {
        operator: 'or',
        conditions: [
          { questionCode: 'G1', op: 'eq', value: ENTITY_TYPES.regulator },
          { questionCode: 'G2', op: 'includes', value: 'regulation' },
        ],
      },
      questions: [
        {
          code: 'G20',
          questionTextEn: 'Regulations/standards enforced',
          questionTextAr: 'اللوائح/المعايير المُطبقة',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['building_codes', 'Building codes', 'أكواد البناء'],
            ['safety', 'Safety (OSHA/local)', 'سلامة'],
            ['environmental', 'Environmental', 'بيئية'],
            ['quality', 'Quality standards', 'جودة'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'G21',
          questionTextEn: 'Digital compliance monitoring?',
          questionTextAr: 'مراقبة امتثال رقمية؟',
          answerType: 'SINGLE_CHOICE',
          options: YES_NO,
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'EDUCATION_TRAINING',
      titleEn: 'Education & Training (G10)',
      titleAr: 'التعليم والتدريب',
      sortOrder: 4,
      showIf: {
        operator: 'or',
        conditions: [
          { questionCode: 'G1', op: 'eq', value: ENTITY_TYPES.education },
          { questionCode: 'G2', op: 'includes', value: 'training' },
        ],
      },
      questions: [
        {
          code: 'G30',
          questionTextEn: 'Training programs offered',
          questionTextAr: 'البرامج التدريبية المقدمة',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['technical', 'Technical skills', 'مهارات فنية'],
            ['safety', 'Safety certification', 'شهادات سلامة'],
            ['management', 'Project management', 'إدارة مشاريع'],
            ['digital', 'Digital/BIM', 'رقمي/BIM'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'G31',
          questionTextEn: 'Annual trainees capacity',
          questionTextAr: 'القدرة السنوية للمتدربين',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt100', 'Less than 100', 'أقل من 100'], ['100_500', '100-500', '100-500'],
            ['501_2000', '501-2000', '501-2000'], ['gt2000', '2000+', '2000+'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'DIGITAL',
      titleEn: 'Digital Transformation',
      titleAr: 'التحول الرقمي',
      sortOrder: 5,
      questions: [
        {
          code: 'G40',
          questionTextEn: 'Digital maturity level',
          questionTextAr: 'مستوى النضج الرقمي',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['early', 'Early stage', 'مبكر'], ['developing', 'Developing', 'Developing'],
            ['advanced', 'Advanced', 'متقدم'], ['leading', 'Leading', 'رائد'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'G41',
          questionTextEn: 'Open data/API sharing with private sector?',
          questionTextAr: 'مشاركة بيانات/API مع القطاع الخاص؟',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['yes_active', 'Yes, active', 'نعم نشط'], ['planned', 'Planned', 'مخطط'], ['no', 'No', 'لا'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    aiDigitalSection(6),
    platformValueSection([
      ['transparency', 'Market transparency', 'شفافية السوق'],
      ['vendor_mgmt', 'Vendor management', 'إدارة موردين'],
      ['analytics', 'Sector analytics', 'تحليلات قطاع'],
      ['compliance', 'Compliance monitoring', 'مراقبة امتثال'],
      ['workforce', 'Workforce programs', 'برامج workforce'],
    ], 7),
    paymentSection(8),
    betaSection(9),
    openSection(10),
  ];
}
