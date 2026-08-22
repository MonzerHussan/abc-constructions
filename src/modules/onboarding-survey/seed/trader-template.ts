import type { SeedSection } from './individual-template';
import { mcOptions } from './individual-template';
import {
  betaSection,
  companyProfileSection,
  openSection,
  paymentSection,
  platformValueSection,
  REGIONS_OPTION_META,
} from './seed-helpers';

export function traderSections(): SeedSection[] {
  return [
    companyProfileSection(0),
    {
      code: 'TRADER_PROFILE',
      titleEn: 'Trading Profile',
      titleAr: 'ملف التاجر',
      sortOrder: 1,
      questions: [
        {
          code: 'T1',
          questionTextEn: 'Primary trading category (determines skip path)',
          questionTextAr: 'فئة التجارة الرئيسية (يحدد المسار)',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['cement_steel', 'Cement & steel', 'إسمنت وحديد'],
            ['finishing', 'Finishing materials', 'مواد تشطيب'],
            ['mep', 'MEP trading', 'تجارة MEP'],
            ['general', 'General building materials', 'مواد بناء عامة'],
            ['import_export', 'Import/export', 'استيراد/تصدير'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'T2',
          questionTextEn: 'Number of SKUs/products traded',
          questionTextAr: 'عدد الأصناف/المنتجات',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt50', 'Less than 50', 'أقل من 50'], ['50_200', '50-200', '50-200'],
            ['201_1000', '201-1000', '201-1000'], ['gt1000', '1000+', '1000+'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'T3',
          questionTextEn: 'Trading regions',
          questionTextAr: 'مناطق التجارة',
          answerType: 'MULTIPLE_CHOICE',
          options: [],
          sortOrder: 2,
          metadata: REGIONS_OPTION_META,
        },
      ],
    },
    {
      code: 'SUPPLY_CHAIN',
      titleEn: 'Supply Chain & Inventory',
      titleAr: 'سلسلة التوريد والمخزون',
      sortOrder: 2,
      questions: [
        {
          code: 'T10',
          questionTextEn: 'Import vs local sourcing ratio',
          questionTextAr: 'نسبة الاستيراد vs المحلي',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['mostly_local', 'Mostly local', 'معظمها محلي'], ['balanced', 'Balanced', 'متوازن'],
            ['mostly_import', 'Mostly import', 'معظمها استيراد'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'T11',
          questionTextEn: 'Warehouse capacity',
          questionTextAr: 'سعة المستودعات',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt1000', 'Less than 1,000 m²', 'أقل من 1000 م²'],
            ['1000_5000', '1,000-5,000 m²', '1000-5000'],
            ['gt5000', 'More than 5,000 m²', 'أكثر من 5000'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'T12',
          questionTextEn: 'Price volatility management',
          questionTextAr: 'إدارة تقلب الأسعار',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['hedging', 'Forward contracts/hedging', 'عقود آجلة'],
            ['inventory', 'Inventory buffer', 'مخزون احتياطي'],
            ['pass_through', 'Pass to customer', 'تحويل للعميل'],
            ['absorb', 'Absorb in margin', 'امتصاص في الهامش'],
          ]),
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'CLIENTS',
      titleEn: 'Clients & Sales',
      titleAr: 'العملاء والمبيعات',
      sortOrder: 3,
      questions: [
        {
          code: 'T20',
          questionTextEn: 'Primary customer types',
          questionTextAr: 'أنواع العملاء الرئيسيين',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['contractors', 'Contractors', 'مقاولين'], ['retail', 'Retail/traders', 'تجار تجزئة'],
            ['projects', 'Project owners', 'ملاك مشاريع'], ['government', 'Government', 'حكومة'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'T21',
          questionTextEn: 'Monthly sales volume range',
          questionTextAr: 'نطاق حجم المبيعات الشهرية',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt500k', 'Less than 500K SAR', 'أقل من 500 ألف'],
            ['500k_2m', '500K-2M', '500K-2M'],
            ['2m_10m', '2M-10M', '2M-10M'],
            ['gt10m', 'More than 10M', 'أكثر من 10M'],
          ]),
          sortOrder: 1,
          metadata: { currencySegment: true },
        },
      ],
    },
    platformValueSection([
      ['buyers', 'More buyers', 'مزيد من المشترين'],
      ['pricing', 'Market pricing intel', 'معلومات أسعار'],
      ['inventory', 'Inventory visibility', 'رؤية مخزون'],
      ['logistics', 'Logistics matching', 'مطابقة لوجستيات'],
      ['credit', 'Credit tools', 'أدوات ائتمان'],
    ], 4),
    paymentSection(5),
    betaSection(6),
    openSection(7),
  ];
}
