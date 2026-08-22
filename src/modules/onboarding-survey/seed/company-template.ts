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
  REGIONS_OPTION_META,
  YES_NO,
} from './seed-helpers';

export const PM_SPECIALTIES = {
  pm_execution: 'pm_execution',
  fm: 'fm',
  preventive: 'preventive',
  cmms: 'cmms',
  emergency: 'emergency',
} as const;

export function companySections(): SeedSection[] {
  return [
    companyProfileSection(0),
    {
      code: 'SPECIALIZATION',
      titleEn: 'Company Specialization',
      titleAr: 'تخصص الشركة',
      sortOrder: 1,
      questions: [
        {
          code: 'Q1',
          questionTextEn: 'Primary specialization (select all)',
          questionTextAr: 'التخصص الرئيسي (اختر الكل)',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            [PM_SPECIALTIES.pm_execution, 'PM during execution', 'إدارة مشاريع أثناء التنفيذ'],
            [PM_SPECIALTIES.fm, 'Facility management (FM)', 'إدارة مرافق بعد التسليم'],
            [PM_SPECIALTIES.preventive, 'Preventive maintenance', 'صيانة وقائية'],
            [PM_SPECIALTIES.emergency, 'Emergency response', 'استجابة طارئة'],
            [PM_SPECIALTIES.cmms, 'CMMS/CAFM services', 'خدمات CMMS/CAFM'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q2',
          questionTextEn: 'Assets/facilities under management',
          questionTextAr: 'الأصول/المرافق تحت الإدارة',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt5', 'Less than 5', 'أقل من 5'], ['5_20', '5-20', '5-20'],
            ['21_100', '21-100', '21-100'], ['gt100', '100+', '100+'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'PM_EXECUTION',
      titleEn: 'Project Management (Execution)',
      titleAr: 'إدارة المشاريع (التنفيذ)',
      sortOrder: 2,
      showIf: { questionCode: 'Q1', op: 'includes', value: PM_SPECIALTIES.pm_execution },
      questions: [
        {
          code: 'Q9',
          questionTextEn: 'PM methodology used',
          questionTextAr: 'منهجية PM المستخدمة',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['traditional', 'Traditional', 'تقليدي'], ['agile', 'Agile/hybrid', 'Agile/هجين'],
            ['epc', 'EPC focused', 'EPC'], ['client_specific', 'Client-specific', 'حسب العميل'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q10',
          questionTextEn: 'Owner/stakeholder reporting frequency',
          questionTextAr: 'تكرار التقارير لأصحاب المشاريع',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['daily', 'Daily', 'يومي'], ['weekly', 'Weekly', 'أسبوعي'],
            ['monthly', 'Monthly', 'شهري'], ['milestone', 'Per milestone', 'حسب milestone'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'FM_MAINTENANCE',
      titleEn: 'Facility Management & Maintenance',
      titleAr: 'إدارة المرافق والصيانة',
      sortOrder: 3,
      showIf: {
        operator: 'or',
        conditions: [
          { questionCode: 'Q1', op: 'includes', value: PM_SPECIALTIES.fm },
          { questionCode: 'Q1', op: 'includes', value: PM_SPECIALTIES.preventive },
        ],
      },
      questions: [
        {
          code: 'Q15',
          questionTextEn: 'Current CMMS/CAFM system',
          questionTextAr: 'نظام CMMS/CAFM الحالي',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['none', 'None', 'لا يوجد'], ['basic', 'Basic/spreadsheet', 'أساسي/Excel'],
            ['commercial', 'Commercial CMMS', 'CMMS تجاري'], ['integrated', 'Integrated CAFM', 'CAFM متكامل'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q16',
          questionTextEn: 'Satisfaction with current CMMS',
          questionTextAr: 'الرضا عن النظام الحالي',
          answerType: 'LINEAR_SCALE',
          options: mcOptions([
            ['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['4', '4', '4'], ['5', '5', '5'],
          ]),
          sortOrder: 1,
          showIf: { questionCode: 'Q15', op: 'neq', value: 'none' },
        },
        {
          code: 'Q17',
          questionTextEn: 'Preventive vs corrective vs emergency ratio',
          questionTextAr: 'نسبة الوقائية vs التصحيحية vs الطارئة',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['mostly_preventive', 'Mostly preventive', 'معظمها وقائية'],
            ['balanced', 'Balanced', 'متوازنة'], ['mostly_corrective', 'Mostly corrective/emergency', 'تصحيحية/طارئة'],
          ]),
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'SLA_CONTRACTS',
      titleEn: 'SLA & Maintenance Contracts',
      titleAr: 'SLA وعقود الصيانة',
      sortOrder: 4,
      showIf: { questionCode: 'Q1', op: 'includes', value: PM_SPECIALTIES.fm },
      questions: [
        {
          code: 'Q20',
          questionTextEn: 'SLA types managed',
          questionTextAr: 'أنواع SLA المُدارة',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['response_time', 'Response time', 'زمن الاستجابة'],
            ['uptime', 'Uptime/availability', 'توفر'],
            ['quality', 'Quality KPIs', 'KPIs جودة'],
            ['penalties', 'Penalty clauses', 'غرامات'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q21',
          questionTextEn: 'Average contract duration',
          questionTextAr: 'متوسط مدة العقد',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt1y', 'Less than 1 year', 'أقل من سنة'], ['1_3y', '1-3 years', '1-3'],
            ['3_5y', '3-5 years', '3-5'], ['gt5y', 'More than 5 years', 'أكثر من 5'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'TRANSPORT',
      titleEn: 'Transport Services',
      titleAr: 'خدمات النقل',
      sortOrder: 5,
      showIf: {
        operator: 'or',
        conditions: [
          { questionCode: 'Q1', op: 'includes', value: PM_SPECIALTIES.emergency },
          { questionCode: 'Q1', op: 'includes', value: PM_SPECIALTIES.fm },
        ],
      },
      questions: [
        {
          code: 'Q25',
          questionTextEn: 'Spare parts transport services?',
          questionTextAr: 'خدمات نقل قطع الغيار؟',
          answerType: 'SINGLE_CHOICE',
          options: YES_NO,
          sortOrder: 0,
        },
        {
          code: 'Q26',
          questionTextEn: 'Emergency response capability',
          questionTextAr: 'قدرة الاستجابة للبلاغات الطارئة',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['24_7', '24/7', '24/7'], ['business_hours', 'Business hours', 'ساعات عمل'],
            ['on_call', 'On-call', 'استدعاء'], ['none', 'None', 'لا'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'Q27',
          questionTextEn: 'Service regions',
          questionTextAr: 'مناطق الخدمة',
          answerType: 'MULTIPLE_CHOICE',
          options: [],
          sortOrder: 2,
          metadata: REGIONS_OPTION_META,
        },
      ],
    },
    {
      code: 'WORKFORCE',
      titleEn: 'Workforce',
      titleAr: 'الموارد البشرية',
      sortOrder: 6,
      questions: [employeesGateQuestion('HC0', 0)],
    },
    humanCapitalPlugIn('HC0'),
    aiDigitalSection(7),
    {
      code: 'AI_PM',
      titleEn: 'AI & Predictive Maintenance',
      titleAr: 'AI والصيانة التنبؤية',
      sortOrder: 8,
      questions: [
        {
          code: 'AI4',
          questionTextEn: 'Interest in predictive maintenance AI',
          questionTextAr: 'الاهتمام بالصيانة التنبؤية بالAI',
          answerType: 'LINEAR_SCALE',
          options: mcOptions([
            ['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['4', '4', '4'], ['5', '5', '5'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'AI5',
          questionTextEn: 'Interest in automated reporting to owners',
          questionTextAr: 'الاهتمام بالتقارير التلقائية لأصحاب المشاريع',
          answerType: 'LINEAR_SCALE',
          options: mcOptions([
            ['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['4', '4', '4'], ['5', '5', '5'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    platformValueSection([
      ['cmms', 'CMMS integration', 'تكامل CMMS'],
      ['sla', 'SLA tracking', 'متابعة SLA'],
      ['predictive', 'Predictive maintenance', 'صيانة تنبؤية'],
      ['reporting', 'Owner reporting', 'تقارير للملاك'],
      ['workforce', 'Workforce dispatch', 'إرسال فرق'],
    ], 9),
    paymentSection(10),
    betaSection(11),
    openSection(12),
  ];
}
