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

export const SUPPLIER_TYPES = {
  building_materials: 'building_materials',
  finishing: 'finishing',
  mep: 'mep',
  equipment: 'equipment',
  logistics: 'logistics',
  equipment_rental: 'equipment_rental',
  training: 'training',
  services: 'services',
} as const;

export function supplierSections(): SeedSection[] {
  return [
    companyProfileSection(0),
    {
      code: 'SUPPLIER_TYPE',
      titleEn: 'Supplier Classification',
      titleAr: 'تصنيف المورد',
      sortOrder: 1,
      questions: [
        {
          code: 'S1',
          questionTextEn: 'Primary supplier type (select all)',
          questionTextAr: 'نوع المورد الرئيسي (اختر الكل)',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            [SUPPLIER_TYPES.building_materials, 'Building materials', 'مواد بناء'],
            [SUPPLIER_TYPES.finishing, 'Finishing materials', 'مواد تشطيب'],
            [SUPPLIER_TYPES.mep, 'MEP supplies', 'مستلزمات MEP'],
            [SUPPLIER_TYPES.equipment, 'Equipment/machinery', 'معدات/آليات'],
            [SUPPLIER_TYPES.logistics, 'Logistics & transport (Type 7)', 'لوجستيات ونقل (النوع 7)'],
            [SUPPLIER_TYPES.equipment_rental, 'Equipment rental (Type 8)', 'تأجير معدات (النوع 8)'],
            [SUPPLIER_TYPES.training, 'Training services', 'خدمات تدريب'],
            [SUPPLIER_TYPES.services, 'Other services', 'خدمات أخرى'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'S2',
          questionTextEn: 'Product categories count',
          questionTextAr: 'عدد فئات المنتجات',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt10', 'Less than 10', 'أقل من 10'], ['10_50', '10-50', '10-50'],
            ['51_200', '51-200', '51-200'], ['gt200', '200+', '200+'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'CATALOG',
      titleEn: 'Catalog & Digital',
      titleAr: '\u0627\u0644\u0643\u0627\u062A\u0627\u0644\u0648\u062C \u0648\u0627\u0644\u0631\u0642\u0645\u0646\u0629',
      sortOrder: 2,
      questions: [
        {
          code: 'S10',
          questionTextEn: 'Digital product catalog?',
          questionTextAr: '\u0647\u0644 \u0644\u062F\u064A\u0643\u0645 \u0643\u062A\u0627\u0644\u0648\u062C \u0631\u0642\u0645\u064A \u0644\u0644\u0645\u0646\u062A\u062C\u0627\u062A\u061F',
          answerType: 'SINGLE_CHOICE',
          options: YES_NO,
          sortOrder: 0,
        },
        {
          code: 'S11',
          questionTextEn: 'ERP/inventory system?',
          questionTextAr: 'نظام ERP/مخزون؟',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['integrated', 'Integrated', 'متكامل'], ['basic', 'Basic', 'أساسي'], ['no', 'No', 'لا'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'LOGISTICS',
      titleEn: 'Logistics & Transport',
      titleAr: 'اللوجستيات والنقل',
      sortOrder: 3,
      showIf: { questionCode: 'S1', op: 'includes', value: SUPPLIER_TYPES.logistics },
      questions: [
        {
          code: 'L1',
          questionTextEn: 'Fleet size',
          questionTextAr: 'حجم الأسطول',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['1_5', '1-5', '1-5'], ['6_20', '6-20', '6-20'], ['21_50', '21-50', '21-50'], ['gt50', '50+', '50+'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'L2',
          questionTextEn: 'Service regions',
          questionTextAr: 'مناطق الخدمة',
          answerType: 'MULTIPLE_CHOICE',
          options: [],
          sortOrder: 1,
          metadata: REGIONS_OPTION_META,
        },
        {
          code: 'L3',
          questionTextEn: 'GPS tracking system?',
          questionTextAr: 'نظام تتبع GPS؟',
          answerType: 'SINGLE_CHOICE',
          options: YES_NO,
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'EQUIPMENT_RENTAL',
      titleEn: 'Equipment Rental',
      titleAr: 'تأجير المعدات',
      sortOrder: 4,
      showIf: { questionCode: 'S1', op: 'includes', value: SUPPLIER_TYPES.equipment_rental },
      questions: [
        {
          code: 'E1',
          questionTextEn: 'Equipment types',
          questionTextAr: 'أنواع المعدات',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['excavators', 'Excavators', 'حفارات'], ['cranes', 'Cranes', 'رافعات'],
            ['generators', 'Generators', 'مولدات'], ['scaffolding', 'Scaffolding', 'سقالات'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'E2',
          questionTextEn: 'Maintenance program',
          questionTextAr: 'برنامج الصيانة',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['full', 'Full preventive', 'وقائية كاملة'], ['partial', 'Partial', 'جزئي'], ['reactive', 'Mostly reactive', 'تصحيحي'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'COMMERCIAL',
      titleEn: 'Commercial',
      titleAr: 'التجاري',
      sortOrder: 5,
      questions: [
        {
          code: 'S20',
          questionTextEn: 'Average delivery lead time',
          questionTextAr: 'متوسط وقت التسليم',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['same_day', 'Same day', 'نفس اليوم'], ['1_3d', '1-3 days', '1-3 أيام'], ['gt7d', '7+ days', '7+ أيام'],
          ]),
          sortOrder: 0,
        },
        employeesGateQuestion('HC0', 1),
      ],
    },
    humanCapitalPlugIn('HC0'),
    aiDigitalSection(6),
    platformValueSection([
      ['catalog', 'Digital catalog', '\u0643\u062A\u0627\u0644\u0648\u062C \u0631\u0642\u0645\u064A'],
      ['orders', 'Online orders', 'طلبات'],
      ['logistics', 'Delivery matching', 'مطابقة توصيل'],
      ['analytics', 'Sales analytics', 'تحليلات'],
      ['credit', 'Credit tools', 'ائتمان'],
    ], 7),
    paymentSection(8),
    betaSection(9),
    openSection(10),
  ];
}
