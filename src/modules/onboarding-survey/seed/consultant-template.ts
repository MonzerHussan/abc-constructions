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

export function consultantSections(): SeedSection[] {
  return [
    companyProfileSection(0),
    {
      code: 'SERVICES',
      titleEn: 'Services & Deliverables',
      titleAr: 'الخدمات والمخرجات',
      sortOrder: 1,
      questions: [
        {
          code: 'Q6',
          questionTextEn: 'Primary services offered',
          questionTextAr: 'الخدمات الرئيسية المقدمة',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['design', 'Design', 'تصميم'], ['supervision', 'Supervision', 'إشراف'],
            ['studies', 'Studies/reports', 'دراسات/تقارير'], ['pm', 'Project management', 'إدارة مشاريع'],
            ['bim', 'BIM modeling', 'نمذجة BIM'], ['legal', 'Legal/contracts', 'قانوني/عقود'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q7',
          questionTextEn: 'Typical project phase involvement',
          questionTextAr: 'مراحل المشروع التي تشاركون فيها',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['concept', 'Concept/feasibility', 'مفهوم/جدوى'], ['design', 'Detailed design', 'تصميم تفصيلي'],
            ['tender', 'Tender support', 'دعم مناقصات'], ['construction', 'Construction phase', 'مرحلة التنفيذ'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'BIM_DIGITAL',
      titleEn: 'BIM & Digital Tools',
      titleAr: 'BIM والأدوات الرقمية',
      sortOrder: 2,
      showIf: {
        operator: 'or',
        conditions: [
          { questionCode: 'Q6', op: 'includes', value: 'bim' },
          { questionCode: 'Q6', op: 'includes', value: 'design' },
        ],
      },
      questions: [
        {
          code: 'Q9',
          questionTextEn: 'BIM maturity level',
          questionTextAr: 'مستوى نضج BIM',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['none', 'Not using BIM', 'لا نستخدم'], ['2d', '2D only', '2D فقط'],
            ['3d', '3D modeling', '3D'], ['4d5d', '4D/5D integrated', '4D/5D متكامل'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q10',
          questionTextEn: 'Software used (select all)',
          questionTextAr: 'البرامج المستخدمة',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['revit', 'Revit', 'Revit'], ['autocad', 'AutoCAD', 'AutoCAD'],
            ['etabs', 'ETABS', 'ETABS'], ['primavera', 'Primavera', 'Primavera'],
            ['navis', 'Navisworks', 'Navisworks'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'TAKEOFF',
      titleEn: 'Quantities & Takeoff',
      titleAr: 'الكميات والTakeoff',
      sortOrder: 3,
      showIf: {
        operator: 'or',
        conditions: [
          { questionCode: 'Q6', op: 'includes', value: 'design' },
          { questionCode: 'Q6', op: 'includes', value: 'bim' },
        ],
      },
      questions: [
        {
          code: 'Q26',
          questionTextEn: 'How do you perform quantity takeoff?',
          questionTextAr: 'كيف تنفذون quantity takeoff؟',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['manual', 'Manual', 'يدوي'], ['software', 'Software', 'برامج'],
            ['outsourced', 'Outsourced', 'خارجي'], ['mixed', 'Mixed', 'مزيج'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q27',
          questionTextEn: 'Interest in AI-assisted takeoff',
          questionTextAr: 'الاهتمام بـ AI للTakeoff',
          answerType: 'LINEAR_SCALE',
          options: mcOptions([
            ['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3'], ['4', '4', '4'], ['5', '5', '5'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'PM_CONSULTING',
      titleEn: 'PM Consulting',
      titleAr: 'استشارات PM',
      sortOrder: 4,
      showIf: { questionCode: 'Q6', op: 'includes', value: 'pm' },
      questions: [
        {
          code: 'Q13',
          questionTextEn: 'PM tools used',
          questionTextAr: 'أدوات PM المستخدمة',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['primavera', 'Primavera', 'Primavera'], ['ms_project', 'MS Project', 'MS Project'],
            ['procore', 'Procore', 'Procore'], ['excel', 'Excel', 'Excel'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'Q16',
          questionTextEn: 'Average projects managed simultaneously',
          questionTextAr: 'متوسط المشاريع المُدارة بالتوازي',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['1_3', '1-3', '1-3'], ['4_8', '4-8', '4-8'], ['9_15', '9-15', '9-15'], ['gt15', '15+', '15+'],
          ]),
          sortOrder: 1,
        },
      ],
    },
    {
      code: 'LEGAL',
      titleEn: 'Legal & Contracts',
      titleAr: 'القانون والعقود',
      sortOrder: 5,
      showIf: { questionCode: 'Q6', op: 'includes', value: 'legal' },
      questions: [
        {
          code: 'Q29',
          questionTextEn: 'Contract types handled',
          questionTextAr: 'أنواع العقود التي تتعاملون معها',
          answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['fidic', 'FIDIC', 'FIDIC'], ['local', 'Local standard', 'محلي'],
            ['epc', 'EPC', 'EPC'], ['consultancy', 'Consultancy agreements', 'اتفاقيات استشارية'],
          ]),
          sortOrder: 0,
        },
      ],
    },
    {
      code: 'WORKFORCE',
      titleEn: 'Team & Workforce',
      titleAr: 'الفريق والموارد',
      sortOrder: 6,
      questions: [
        employeesGateQuestion('HC0', 0),
        {
          code: 'Q32',
          questionTextEn: 'Licensed engineers on staff',
          questionTextAr: 'عدد المهندسين المرخصين',
          answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt5', 'Less than 5', 'أقل من 5'], ['5_15', '5-15', '5-15'],
            ['16_50', '16-50', '16-50'], ['gt50', 'More than 50', 'أكثر من 50'],
          ]),
          sortOrder: 1,
          showIf: { questionCode: 'HC0', op: 'eq', value: 'yes' },
        },
      ],
    },
    humanCapitalPlugIn('HC0'),
    aiDigitalSection(7),
    platformValueSection([
      ['projects', 'Project opportunities', 'فرص مشاريع'],
      ['collaboration', 'Collaboration tools', 'أدوات تعاون'],
      ['bim', 'BIM integration', 'تكامل BIM'],
      ['takeoff', 'AI takeoff', 'AI Takeoff'],
      ['reputation', 'Reputation/reviews', 'سمعة/تقييمات'],
    ], 8),
    paymentSection(9),
    betaSection(10),
    openSection(11),
  ];
}
