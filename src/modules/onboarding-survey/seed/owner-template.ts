import type { SeedSection } from './individual-template';
import { mcOptions } from './individual-template';
import {
  betaSection,
  openSection,
  paymentSection,
  platformValueSection,
  PROJECT_SIZE,
  REGIONS,
  YES_NO,
} from './seed-helpers';

export const OWNER_TYPES = {
  individual: 'individual',
  small_investor: 'small_investor',
  medium_dev: 'medium_dev',
  large_dev: 'large_dev',
  government: 'government',
} as const;

export function ownerSections(): SeedSection[] {
  return [
    {
      code: 'OWNER_PROFILE',
      titleEn: 'Owner Profile & Project Type',
      titleAr: 'ملف المالك ونوع المشروع',
      sortOrder: 0,
      questions: [
        {
          code: 'Q1',
          questionTextEn: 'What type of owner are you? (determines next questions)',
          questionTextAr: 'ما هو نوع المالك؟ (يحدد مسار الأسئلة)',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            [OWNER_TYPES.individual, 'Individual (villa/apartment)', 'فرد (فيلا/شقة)'],
            [OWNER_TYPES.small_investor, 'Small investor (2-5 projects)', 'مستثمر صغير'],
            [OWNER_TYPES.medium_dev, 'Medium developer', 'مطور متوسط'],
            [OWNER_TYPES.large_dev, 'Large developer', 'مطور كبير'],
            [OWNER_TYPES.government, 'Government entity', 'جهة حكومية'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q2',
          questionTextEn: 'Typical/current project size',
          questionTextAr: 'حجم مشروعك الحالي أو المعتاد',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['single_small', 'Single small (villa/unit)', 'مشروع صغير واحد'],
            ['2_5_small', '2-5 small projects', '2-5 مشاريع صغيرة'],
            ['medium', 'Medium building', 'مبنى متوسط'],
            ['large', 'Large development', 'تطوير كبير'],
            ['portfolio', 'Mixed portfolio', 'محفظة متنوعة'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'Q3',
          questionTextEn: 'Project locations',
          questionTextAr: 'مواقع المشاريع',
          answerType: 'MULTIPLE_CHOICE',
          options: REGIONS,
          sortOrder: 2,
        },
        {
          code: 'Q4',
          questionTextEn: 'Active projects count',
          questionTextAr: 'عدد المشاريع النشطة',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['0', 'Planning stage', 'مرحلة التخطيط'], ['1', '1', '1'], ['2_5', '2-5', '2-5'],
            ['6_15', '6-15', '6-15'], ['gt15', 'More than 15', 'أكثر من 15'],
          ]),
          sortOrder: 3,
        },
      ],
    },
    {
      code: 'PROCUREMENT_NEEDS',
      titleEn: 'Procurement & Contractor Needs',
      titleAr: 'احتياجات التوريد والمقاولين',
      sortOrder: 1,
      questions: [
        {
          code: 'Q10',
          questionTextEn: 'What do you need most from the platform?',
          questionTextAr: 'ما الذي تحتاجه أكثر من المنصة؟',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['main_contractor', 'Main contractor', 'مقاول رئيسي'], ['subcontractors', 'Subcontractors', 'مقاولين فرعيين'],
            ['materials', 'Building materials', 'مواد بناء'], ['consultants', 'Consultants', 'استشاريين'],
            ['supervision', 'Supervision/PM', 'إشراف/PM'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q11',
          questionTextEn: 'Typical procurement method',
          questionTextAr: 'طريقة الشراء/التعاقد المعتادة',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['direct', 'Direct hire', 'تعيين مباشر'], ['tender', 'Competitive tender', 'مناقصة'],
            ['negotiated', 'Negotiated', 'تفاوض'], ['mixed', 'Mixed', 'مزيج'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'Q12',
          questionTextEn: 'Budget range per project',
          questionTextAr: 'نطاق الميزانية للمشروع',
          answerType: 'SINGLE_CHOICE',
          options: PROJECT_SIZE,
          sortOrder: 2,
          showIf: {
            operator: 'or',
            conditions: [
              { questionCode: 'Q1', op: 'eq', value: OWNER_TYPES.medium_dev },
              { questionCode: 'Q1', op: 'eq', value: OWNER_TYPES.large_dev },
            ],
          },
        },
      ],
    },
    {
      code: 'TRUST_PAYMENTS',
      titleEn: 'Trust, Payments & Defects',
      titleAr: 'الثقة والمدفوعات والعيوب',
      sortOrder: 2,
      questions: [
        {
          code: 'Q20',
          questionTextEn: 'Experienced payment disputes with contractors?',
          questionTextAr: 'هل واجهتم نزاعات دفع مع مقاولين؟',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['often', 'Often', 'كثيراً'], ['sometimes', 'Sometimes', 'أحياناً'], ['never', 'Never', 'أبداً'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q21',
          questionTextEn: 'Interest in payment protection/escrow',
          questionTextAr: 'الاهتمام بحماية المدفوعات',
          answerType: 'LINEAR_SCALE',
          options: mcOptions([
            ['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['4', '4', '4'], ['5', '5', '5'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'Q22',
          questionTextEn: 'Post-handover defects experience',
          questionTextAr: 'تجربة العيوب بعد التسليم',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['major', 'Major issues', 'مشاكل كبيرة'], ['minor', 'Minor issues', 'مشاكل بسيطة'],
            ['none', 'No major issues', 'لا مشاكل كبيرة'],
          ]),
          sortOrder: 2,
        },
        {
          code: 'Q23',
          questionTextEn: 'Need defect liability tracking?',
          questionTextAr: 'هل تحتاجون تتبع مسؤولية العيوب؟',
          answerType: 'SINGLE_CHOICE',
          options: YES_NO,
          sortOrder: 3,
        },
      ],
    },
    {
      code: 'INDIVIDUAL_OWNER',
      titleEn: 'Individual Owner Path',
      titleAr: 'مسار المالك الفرد',
      sortOrder: 3,
      showIf: { questionCode: 'Q1', op: 'eq', value: OWNER_TYPES.individual },
      questions: [
        {
          code: 'Q30',
          questionTextEn: 'Project type',
          questionTextAr: 'نوع المشروع',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['villa', 'Villa', 'فيلا'], ['apartment', 'Apartment', 'شقة'], ['renovation', 'Renovation', 'ترميم'],
            ['maintenance', 'Maintenance', 'صيانة'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q31',
          questionTextEn: 'Need help finding trusted contractors?',
          questionTextAr: 'هل تحتاج مساعدة في إيجاد مقاولين موثوقين؟',
          answerType: 'LINEAR_SCALE',
          options: mcOptions([
            ['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['4', '4', '4'], ['5', '5', '5'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'DEVELOPER',
      titleEn: 'Developer Path',
      titleAr: 'مسار المطور',
      sortOrder: 4,
      showIf: {
        operator: 'or',
        conditions: [
          { questionCode: 'Q1', op: 'eq', value: OWNER_TYPES.medium_dev },
          { questionCode: 'Q1', op: 'eq', value: OWNER_TYPES.large_dev },
        ],
      },
      questions: [
        {
          code: 'Q35',
          questionTextEn: 'Annual development volume (units or SAR)',
          questionTextAr: 'حجم التطوير السنوي',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt50m', 'Less than 50M SAR', 'أقل من 50 مليون'],
            ['50_200m', '50-200M', '50-200 مليون'],
            ['200_500m', '200-500M', '200-500 مليون'],
            ['gt500m', 'More than 500M', 'أكثر من 500 مليون'],
          ]),
          sortOrder: 0,
          metadata: { currencySegment: true },
        },
        {
          code: 'Q36',
          questionTextEn: 'Need consultant/contractor coordination platform?',
          questionTextAr: 'هل تحتاجون منصة تنسيق استشاري/مقاول؟',
          answerType: 'LINEAR_SCALE',
          options: mcOptions([
            ['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['4', '4', '4'], ['5', '5', '5'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    platformValueSection([
      ['contractors', 'Verified contractors', 'مقاولين موثوقين'],
      ['materials', 'Material sourcing', 'توريد مواد'],
      ['transparency', 'Price transparency', 'شفافية الأسعار'],
      ['payments', 'Payment protection', 'حماية مدفوعات'],
      ['tracking', 'Project tracking', 'متابعة المشروع'],
    ], 5),
    paymentSection(6),
    betaSection(7),
    openSection(8),
  ];
}
