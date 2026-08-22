import type { OnboardingAnswerType } from '@/generated/prisma/client';
import type { ShowIfRule } from '@/lib/onboarding/survey-show-if';

export type SeedOption = { value: string; labelEn: string; labelAr: string };

export type SeedQuestion = {
  code: string;
  questionTextEn: string;
  questionTextAr: string;
  answerType: OnboardingAnswerType;
  options?: SeedOption[];
  sortOrder: number;
  isRequired?: boolean;
  showIf?: ShowIfRule;
  metadata?: Record<string, unknown>;
};

export type SeedSection = {
  code: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  sortOrder: number;
  showIf?: ShowIfRule;
  questions: SeedQuestion[];
};

export function mcOptions(items: [string, string, string][]): SeedOption[] {
  return items.map(([value, labelEn, labelAr]) => ({ value, labelEn, labelAr }));
}

export const P1_VALUES = {
  engineer: 'engineer',
  technician: 'technician',
  skilled: 'skilled_worker',
  laborer: 'laborer',
  transporter: 'transporter',
  freelancer: 'freelancer',
  student: 'student',
  other: 'other',
} as const;

export function individualSections(): SeedSection[] {
  const p1Opts = mcOptions([
    [P1_VALUES.engineer, 'Engineer', 'مهندس'],
    [P1_VALUES.technician, 'Technician', 'فني'],
    [P1_VALUES.skilled, 'Skilled Worker', 'عامل ماهر'],
    [P1_VALUES.laborer, 'Laborer', 'عامل عادي'],
    [P1_VALUES.transporter, 'Transporter / Driver', 'مالك وسيلة نقل'],
    [P1_VALUES.freelancer, 'Freelancer', 'مستقل / صاحب عمل حر'],
    [P1_VALUES.student, 'Student / Intern', 'طالب / متدرب'],
    [P1_VALUES.other, 'Other', 'أخرى'],
  ]);

  const likertOpts = mcOptions([
    ['1', '1 - Not important', '1 - غير مهم'],
    ['2', '2', '2'],
    ['3', '3', '3'],
    ['4', '4', '4'],
    ['5', '5 - Very important', '5 - مهم جداً'],
  ]);

  return [
    {
      code: 'IDENTITY',
      titleEn: 'Identity & Basic Info',
      titleAr: 'الهوية والمعلومات الأساسية',
      sortOrder: 0,
      questions: [
        { code: 'P1', questionTextEn: 'What is your primary role in construction?', questionTextAr: 'ما هي مهنتك/دورك الأساسي في قطاع الإنشاءات؟', answerType: 'SINGLE_CHOICE', options: p1Opts, sortOrder: 0 },
        {
          code: 'P2', questionTextEn: 'What is your exact specialty?', questionTextAr: 'ما هو تخصصك الدقيق؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['civil', 'Civil', 'مدني'], ['architectural', 'Architectural', 'معماري'], ['electrical', 'Electrical', 'كهربائي'],
            ['hvac', 'HVAC', 'HVAC'], ['plumbing', 'Plumbing', 'سباكة'], ['other', 'Other', 'أخرى'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'P3', questionTextEn: 'What is your professional level?', questionTextAr: 'ما هو مستواك المهني؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['junior', 'Junior (<3 years)', 'مبتدئ (أقل من 3 سنوات)'],
            ['mid', 'Mid (3-7 years)', 'متوسط (3-7 سنوات)'],
            ['senior', 'Senior (>7 years)', 'خبير (أكثر من 7 سنوات)'],
          ]),
          sortOrder: 2,
        },
        { code: 'P4', questionTextEn: 'Full name', questionTextAr: 'الاسم الكامل', answerType: 'TEXT', sortOrder: 3, metadata: { prefillKey: 'fullName', readOnly: true } },
        { code: 'P5', questionTextEn: 'Mobile number', questionTextAr: 'رقم الجوال', answerType: 'PHONE', sortOrder: 4, metadata: { prefillKey: 'phone', readOnly: true } },
        { code: 'P6', questionTextEn: 'Email', questionTextAr: 'البريد الإلكتروني', answerType: 'EMAIL', sortOrder: 5, metadata: { prefillKey: 'email', readOnly: true } },
        {
          code: 'P7', questionTextEn: 'Current city / region', questionTextAr: 'المدينة / المنطقة الحالية', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['riyadh', 'Riyadh', 'الرياض'], ['jeddah', 'Jeddah', 'جدة'], ['dammam', 'Dammam', 'الدمام'],
            ['makkah', 'Makkah', 'مكة'], ['madinah', 'Madinah', 'المدينة'], ['other', 'Other', 'أخرى'],
          ]),
          sortOrder: 6, metadata: { prefillKey: 'city' },
        },
        {
          code: 'P8', questionTextEn: 'Nationality', questionTextAr: 'الجنسية', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['saudi', 'Saudi', 'سعودي'], ['resident', 'Resident', 'مقيم'], ['prefer_not', 'Prefer not to say', 'أفضل عدم الإفصاح'],
          ]),
          sortOrder: 7,
        },
        {
          code: 'P9', questionTextEn: 'Current employment status (select all)', questionTextAr: 'ما هو وضعك المهني الحالي؟', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['full_time', 'Full-time employee', 'موظف بدوام كامل'], ['part_time', 'Part-time', 'موظف بدوام جزئي'],
            ['freelance', 'Freelancer', 'مستقل / حر'], ['owner', 'Business owner', 'صاحب عمل / مقاول'],
            ['trainee', 'Trainee', 'متدرب'], ['job_seeker', 'Job seeker', 'باحث عن عمل'], ['daily', 'Daily / temp work', 'أعمل بشكل يومي / مؤقت'],
          ]),
          sortOrder: 8,
        },
        {
          code: 'P10', questionTextEn: 'Are you actively looking for work?', questionTextAr: 'هل أنت باحث عن عمل أو فرص حالياً؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['yes_primary', 'Yes (primary)', 'نعم (بشكل أساسي)'], ['yes_secondary', 'Yes (secondary)', 'نعم (بشكل ثانوي)'], ['no', 'No', 'لا'],
          ]),
          sortOrder: 9,
        },
        {
          code: 'P11', questionTextEn: 'Do you have a valid commercial or professional license?', questionTextAr: 'هل لديك سجل تجاري أو ترخيص مهني ساري المفعول؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['valid', 'Yes, valid', 'نعم، ساري'], ['needs_renewal', 'Needs renewal', 'يحتاج تجديد'], ['no', 'No', 'لا'],
            ['na', 'Not applicable', 'لا ينطبق'], ['unknown', 'Not sure', 'لا أعرف'],
          ]),
          sortOrder: 10,
        },
      ],
    },
    {
      code: 'CAPABILITY',
      titleEn: 'Skills & Capabilities',
      titleAr: 'القدرات والمهارات',
      sortOrder: 1,
      questions: [
        {
          code: 'C1', questionTextEn: 'Core skills (select all)', questionTextAr: 'ما هي المهارات الأساسية التي تمتلكها؟', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['project_mgmt', 'Project management', 'إدارة مشاريع'], ['supervision', 'Supervision', 'إشراف'],
            ['design', 'Design', 'تصميم'], ['welding', 'Welding', 'لحام'], ['plumbing', 'Plumbing', 'سباكة'],
            ['electrical', 'Electrical', 'كهرباء'], ['equipment', 'Equipment operation', 'قيادة معدات'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'C2', questionTextEn: 'Tools/software proficiency', questionTextAr: 'ما هي البرامج أو الأدوات التي تجيد استخدامها؟', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['autocad', 'AutoCAD', 'AutoCAD'], ['revit', 'Revit', 'Revit'], ['primavera', 'Primavera', 'Primavera'],
            ['excel', 'Excel', 'Excel'], ['sap', 'SAP', 'SAP'],
          ]),
          sortOrder: 1, metadata: { proficiencyLevels: true },
        },
        {
          code: 'C3', questionTextEn: 'Do you have professional or academic certificates?', questionTextAr: 'هل لديك شهادات مهنية أو أكاديمية إضافية؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['no', 'No', 'لا']]),
          sortOrder: 2,
        },
        {
          code: 'C4', questionTextEn: 'Certificate type', questionTextAr: 'ما نوع الشهادة؟', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['academic', 'Academic', 'أكاديمية'], ['professional', 'Professional (PMP, LEED)', 'مهنية'],
            ['safety', 'Safety (OSHA, IOSH)', 'سلامة'], ['technical', 'Technical', 'فنية'],
          ]),
          sortOrder: 3, showIf: { questionCode: 'C3', op: 'eq', value: 'yes' },
        },
        { code: 'C5', questionTextEn: 'Certificate name and issuer', questionTextAr: 'اسم الشهادة (والمصدر)', answerType: 'TEXT', sortOrder: 4, showIf: { questionCode: 'C3', op: 'eq', value: 'yes' }, isRequired: false },
        {
          code: 'C6', questionTextEn: 'Is the certificate valid?', questionTextAr: 'هل الشهادة سارية المفعول؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['valid', 'Yes', 'نعم'], ['expired', 'Expired', 'لا (انتهت)'], ['renewing', 'Renewing', 'قيد التجديد']]),
          sortOrder: 5, showIf: { questionCode: 'C3', op: 'eq', value: 'yes' },
        },
        {
          code: 'C7', questionTextEn: 'Do you have a valid driving license?', questionTextAr: 'هل لديك رخصة قيادة سارية؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['no', 'No', 'لا']]),
          sortOrder: 6,
        },
      ],
    },
    {
      code: 'EXPERIENCE',
      titleEn: 'Experience',
      titleAr: 'الخبرة والتاريخ',
      sortOrder: 2,
      questions: [
        {
          code: 'E1', questionTextEn: 'Total years in construction', questionTextAr: 'كم سنة من الخبرة الإجمالية لديك في قطاع الإنشاءات؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt1', '<1 year', 'أقل من سنة'], ['1_3', '1-3 years', '1-3 سنوات'], ['4_7', '4-7 years', '4-7 سنوات'],
            ['8_15', '8-15 years', '8-15 سنة'], ['gt15', '>15 years', 'أكثر من 15 سنة'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'E2', questionTextEn: 'Years in current specialty', questionTextAr: 'كم سنة من الخبرة لديك في تخصصك الحالي؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt1', '<1 year', 'أقل من سنة'], ['1_3', '1-3 years', '1-3 سنوات'], ['4_7', '4-7 years', '4-7 سنوات'], ['gt7', '>7 years', 'أكثر من 7 سنوات'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'E3', questionTextEn: 'Worked on mega projects (>50M SAR)?', questionTextAr: 'هل سبق أن عملت في مشاريع كبرى (أكثر من 50 مليون ريال)؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['no', 'No', 'لا']]),
          sortOrder: 2,
        },
        {
          code: 'E4', questionTextEn: 'Do you have a portfolio?', questionTextAr: 'هل لديك بورتفوليو أو أعمال سابقة يمكن عرضها؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['ready', 'Yes (ready)', 'نعم (جاهز)'], ['preparing', 'Preparing', 'قيد الإعداد'], ['no', 'No', 'لا'],
          ]),
          sortOrder: 3,
          showIf: { operator: 'or', conditions: [{ questionCode: 'P1', op: 'eq', value: P1_VALUES.freelancer }, { questionCode: 'P1', op: 'eq', value: P1_VALUES.engineer }] },
        },
      ],
    },
    {
      code: 'AVAILABILITY',
      titleEn: 'Availability & Location',
      titleAr: 'التوفر والانتشار الجغرافي',
      sortOrder: 3,
      questions: [
        {
          code: 'A1', questionTextEn: 'When can you start?', questionTextAr: 'متى يمكنك البدء في العمل / المشروع؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['immediate', 'Immediately', 'فوراً'], ['2weeks', 'Within 2 weeks', 'خلال أسبوعين'],
            ['1month', 'Within 1 month', 'خلال شهر'], ['gt1month', 'More than 1 month', 'أكثر من شهر'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'A2', questionTextEn: 'Regions you accept work in', questionTextAr: 'ما هي المناطق التي تقبل العمل فيها؟', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['riyadh', 'Riyadh', 'الرياض'], ['jeddah', 'Jeddah', 'جدة'], ['dammam', 'Dammam', 'الدمام'],
            ['any_ksa', 'Anywhere in KSA', 'أي مكان في المملكة'], ['abroad', 'Outside KSA', 'خارج المملكة'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'A3', questionTextEn: 'Willing to relocate?', questionTextAr: 'هل أنت مستعد للانتقال إلى مدينة أخرى للعمل؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['maybe', 'Maybe', 'ربما'], ['no', 'No', 'لا']]),
          sortOrder: 2,
        },
        {
          code: 'A4', questionTextEn: 'Preferred work type', questionTextAr: 'ما هو نوع العمل المفضل لديك؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['onsite', 'On-site', 'حضوري (موقع)'], ['office', 'Office', 'مكتبي'], ['field', 'Field', 'ميداني'],
            ['hybrid', 'Hybrid', 'هجين'], ['remote', 'Remote if possible', 'عن بُعد'], ['any', 'No preference', 'لا يهم'],
          ]),
          sortOrder: 3,
        },
        {
          code: 'A5', questionTextEn: 'Work arrangements accepted', questionTextAr: 'هل تقبل العمل بنظام:', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['full_time', 'Full-time', 'دوام كامل'], ['part_time', 'Part-time', 'دوام جزئي'],
            ['daily', 'Daily / hourly', 'يومي / بالساعة'], ['project', 'Project contract', 'عقد مؤقت (مشروع)'],
          ]),
          sortOrder: 4,
        },
      ],
    },
    {
      code: 'COMMERCIAL',
      titleEn: 'Commercial & Financial',
      titleAr: 'الجوانب التجارية والمالية',
      sortOrder: 4,
      questions: [
        {
          code: 'B1', questionTextEn: 'Expected minimum wage (monthly)', questionTextAr: 'ما هو الحد الأدنى للأجر الشهري المتوقع؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt5k', '<5,000 SAR', 'أقل من 5,000 ريال'], ['5_10k', '5,000-10,000', '5,000-10,000'],
            ['10_20k', '10,000-20,000', '10,000-20,000'], ['gt20k', '>20,000', 'أكثر من 20,000'], ['depends', 'Depends on project', 'يعتمد على المشروع'],
          ]),
          sortOrder: 0, metadata: { currencySegment: true },
        },
        {
          code: 'B2', questionTextEn: 'Preferred payment model', questionTextAr: 'هل تفضل العمل بنظام:', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['salary', 'Fixed salary', 'راتب ثابت'], ['commission', 'Commission', 'عمولة'], ['mixed', 'Mixed', 'مزيج'], ['hourly', 'Hourly/daily', 'بالساعة / اليومية'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'B3', questionTextEn: 'Saudi bank account for payments?', questionTextAr: 'هل لديك حساب بنكي سعودي لاستقبال المدفوعات؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['no', 'No', 'لا']]),
          sortOrder: 2,
        },
        {
          code: 'B4', questionTextEn: 'Payment delays from clients?', questionTextAr: 'هل سبق أن واجهت تأخراً في المدفوعات من العملاء؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['often', 'Often', 'نعم بكثرة'], ['sometimes', 'Sometimes', 'أحياناً'], ['rarely', 'Rarely', 'نادراً'], ['never', 'Never', 'لا'],
          ]),
          sortOrder: 3,
        },
      ],
    },
    {
      code: 'TRUST',
      titleEn: 'Trust & Verification',
      titleAr: 'الثقة والتحقق',
      sortOrder: 5,
      questions: [
        {
          code: 'T1', questionTextEn: 'Profiles on job/freelance platforms?', questionTextAr: 'هل لديك حساب على منصات التوظيف أو العمل الحر؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['no', 'No', 'لا']]),
          sortOrder: 0,
        },
        {
          code: 'T2', questionTextEn: 'Can we contact a reference?', questionTextAr: 'هل يمكننا التواصل مع مرجع سابق للتحقق من أدائك؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['maybe', 'Maybe', 'ربما'], ['no', 'No', 'لا']]),
          sortOrder: 1,
        },
        {
          code: 'T3', questionTextEn: 'Agree to skills test if needed?', questionTextAr: 'هل توافق على إجراء اختبار مهارات (إن لزم الأمر)؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['maybe', 'Maybe', 'ربما'], ['no', 'No', 'لا']]),
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'ENG',
      titleEn: 'Engineers & Technicians',
      titleAr: 'المهندسين والفنيين',
      sortOrder: 6,
      showIf: { operator: 'or', conditions: [{ questionCode: 'P1', op: 'eq', value: P1_VALUES.engineer }, { questionCode: 'P1', op: 'eq', value: P1_VALUES.technician }] },
      questions: [
        {
          code: 'ENG2', questionTextEn: 'Biggest professional challenges', questionTextAr: 'ما هي أكبر التحديات التي تواجهك في ممارستك المهنية؟', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['coordination', 'Poor coordination', 'ضعف التنسيق'], ['software', 'Software difficulty', 'صعوبة البرامج'],
            ['data', 'Lack of data', 'نقص البيانات'], ['pay', 'Low pay', 'ضعف الأجور'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'ENG3', questionTextEn: 'Offer consulting/design independently?', questionTextAr: 'هل تقدم خدمات استشارية أو تصميم بشكل مستقل؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['primary', 'Yes (primary)', 'نعم (أساسي)'], ['secondary', 'Yes (secondary)', 'نعم (ثانوي)'], ['no', 'No', 'لا'],
          ]),
          sortOrder: 1,
        },
        { code: 'ENG4', questionTextEn: 'Interest in consulting platform', questionTextAr: 'هل ترغب في منصة تتيح لك تقديم استشارات أو تصميم؟', answerType: 'LINEAR_SCALE', options: likertOpts, sortOrder: 2 },
      ],
    },
    {
      code: 'SKILLED',
      titleEn: 'Skilled & General Workers',
      titleAr: 'العمال المهرة والعاديون',
      sortOrder: 7,
      showIf: { operator: 'or', conditions: [{ questionCode: 'P1', op: 'eq', value: P1_VALUES.skilled }, { questionCode: 'P1', op: 'eq', value: P1_VALUES.laborer }] },
      questions: [
        {
          code: 'SK1', questionTextEn: 'Current work arrangement', questionTextAr: 'هل تعمل حالياً لدى مقاول معين أم بشكل حر؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['employed', 'With contractor', 'لدى مقاول'], ['freelance', 'Freelance', 'حر'], ['mixed', 'Mixed', 'مزيج'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'SK2', questionTextEn: 'Biggest job-finding challenges', questionTextAr: 'ما هي أكبر التحديات في الحصول على فرص عمل؟', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['demand', 'Low demand', 'قلة الطلب'], ['pay', 'Low pay', 'ضعف الأجور'], ['competition', 'Competition', 'المنافسة'],
          ]),
          sortOrder: 1,
        },
        { code: 'SK3', questionTextEn: 'Interest in skills marketplace', questionTextAr: 'هل ترغب في منصة لعرض مهاراتك والتواصل مع المقاولين؟', answerType: 'LINEAR_SCALE', options: likertOpts, sortOrder: 2 },
        {
          code: 'LB1', questionTextEn: 'Own transport to sites?', questionTextAr: 'هل لديك وسيلة نقل خاصة للوصول إلى مواقع العمل؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['no', 'No', 'لا']]),
          sortOrder: 3, showIf: { questionCode: 'P1', op: 'eq', value: P1_VALUES.laborer },
        },
      ],
    },
    {
      code: 'FREELANCER',
      titleEn: 'Freelancers',
      titleAr: 'المستقلون',
      sortOrder: 8,
      showIf: { questionCode: 'P1', op: 'eq', value: P1_VALUES.freelancer },
      questions: [
        {
          code: 'FR1', questionTextEn: 'Main freelance field', questionTextAr: 'ما هو مجال عملك الحر الرئيسي؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['consulting', 'Consulting', 'استشارات'], ['design', 'Design', 'تصميم'], ['small_contracting', 'Small contracting', 'مقاولات صغرى'],
            ['training', 'Training', 'تدريب'], ['other', 'Other', 'أخرى'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'FR2', questionTextEn: 'Projects per year', questionTextAr: 'كم عدد المشاريع التي تنفذها سنوياً؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt3', '<3', 'أقل من 3'], ['3_6', '3-6', '3-6'], ['7_12', '7-12', '7-12'], ['gt12', '>12', 'أكثر من 12'],
          ]),
          sortOrder: 1,
        },
        { code: 'FR5', questionTextEn: 'Interest in portfolio platform', questionTextAr: 'هل ترغب في منصة لعرض أعمالك والحصول على مشاريع؟', answerType: 'LINEAR_SCALE', options: likertOpts, sortOrder: 2 },
      ],
    },
    {
      code: 'TRANSPORT',
      titleEn: 'Vehicle Owners / Transporters',
      titleAr: 'مالكو سيارات النقل',
      sortOrder: 9,
      showIf: { questionCode: 'P1', op: 'eq', value: P1_VALUES.transporter },
      questions: [
        {
          code: 'TR1', questionTextEn: 'Vehicle type', questionTextAr: 'ما هو نوع المركبة التي تملكها؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['truck', 'Truck', 'شاحنة'], ['pickup', 'Pickup', 'بيك آب'], ['flatbed', 'Flatbed', 'سطحه'],
            ['refrigerated', 'Refrigerated', 'ثلاجة'], ['other', 'Other', 'أخرى'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'TR2', questionTextEn: 'Max payload (tons)', questionTextAr: 'ما هي الحمولة القصوى (بالطن)؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt3', '<3 tons', 'أقل من 3 طن'], ['3_10', '3-10 tons', '3-10 طن'], ['10_20', '10-20 tons', '10-20 طن'], ['gt20', '>20 tons', 'أكثر من 20 طن'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'TR7', questionTextEn: 'Primary service regions', questionTextAr: 'ما هي المناطق التي تخدمها بشكل أساسي؟', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['riyadh', 'Riyadh', 'الرياض'], ['jeddah', 'Jeddah', 'جدة'], ['dammam', 'Dammam', 'الدمام'], ['anywhere', 'Anywhere', 'أي مكان'],
          ]),
          sortOrder: 2,
        },
        {
          code: 'TR9', questionTextEn: 'Preferred pricing model', questionTextAr: 'ما هو نظام التسعير المفضل لديك؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['trip', 'Per trip', 'بالرحلة'], ['hour', 'Per hour', 'بالساعة'], ['day', 'Per day', 'باليوم'], ['weight', 'By weight/size', 'حسب الوزن/الحجم'],
          ]),
          sortOrder: 3,
        },
        { code: 'TR13', questionTextEn: 'Interest in transport requests platform', questionTextAr: 'هل ترغب في منصة تتيح لك تلقي طلبات النقل؟', answerType: 'LINEAR_SCALE', options: likertOpts, sortOrder: 4 },
      ],
    },
    {
      code: 'INTERN_JOB',
      titleEn: 'Interns & Job Seekers',
      titleAr: 'المتدربون والباحثون عن عمل',
      sortOrder: 10,
      showIf: {
        operator: 'or',
        conditions: [
          { questionCode: 'P1', op: 'eq', value: P1_VALUES.student },
          { questionCode: 'P10', op: 'in', value: ['yes_primary', 'yes_secondary'] },
        ],
      },
      questions: [
        {
          code: 'IN1', questionTextEn: 'Field of study', questionTextAr: 'ما هو تخصصك الدراسي؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['civil', 'Civil engineering', 'هندسة مدنية'], ['arch', 'Architecture', 'هندسة معمارية'], ['electrical', 'Electrical', 'كهرباء'], ['other', 'Other', 'أخرى'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'IN3', questionTextEn: 'Type of training sought', questionTextAr: 'ما نوع التدريب الذي تبحث عنه؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['coop', 'Co-op', 'تدريب تعاوني'], ['internship', 'Internship', 'Internship'], ['summer', 'Summer training', 'تدريب صيفي'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'JS1', questionTextEn: 'Target job field', questionTextAr: 'ما هو المجال الوظيفي الذي تبحث عنه؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['engineering', 'Engineering', 'هندسة'], ['technical', 'Technical', 'فني'], ['management', 'Management', 'إدارة'],
          ]),
          sortOrder: 2, showIf: { questionCode: 'P10', op: 'in', value: ['yes_primary', 'yes_secondary'] },
        },
        { code: 'JS5', questionTextEn: 'Interest in job platform', questionTextAr: 'هل ترغب في منصة للاطلاع على فرص العمل والتقديم؟', answerType: 'LINEAR_SCALE', options: likertOpts, sortOrder: 3 },
      ],
    },
    {
      code: 'TRAINING',
      titleEn: 'Training & Development',
      titleAr: 'التدريب والتطوير المهني',
      sortOrder: 11,
      questions: [
        {
          code: 'TD1', questionTextEn: 'Previous construction training?', questionTextAr: 'هل سبق أن التحقت بدورات تدريبية في قطاع الإنشاءات؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['many', 'Yes (many)', 'نعم (كثيرة)'], ['some', 'Yes (limited)', 'نعم (محدودة)'], ['no', 'No', 'لا'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'TD2', questionTextEn: 'Training areas of interest', questionTextAr: 'ما هي المجالات التدريبية التي ترغب في تطوير نفسك فيها؟', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['safety', 'Safety', 'سلامة'], ['technical', 'Technical skills', 'مهارات فنية'],
            ['pm', 'Project management', 'إدارة مشاريع'], ['digital', 'Digital skills', 'مهارات رقمية'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'TD3', questionTextEn: 'Willing to invest in paid courses?', questionTextAr: 'هل أنت مستعد للاستثمار في دورات مدفوعة؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['maybe', 'Maybe', 'ربما'], ['no', 'No', 'لا']]),
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'PLATFORM_VALUE',
      titleEn: 'Platform Features',
      titleAr: 'قيمة المنصة والميزات',
      sortOrder: 12,
      questions: [
        {
          code: 'M1', questionTextEn: 'Rank top 5 features for your category (1=most important)', questionTextAr: 'اختر أهم 5 ميزات ورتبها (1 = الأهم)', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['jobs', 'Job opportunities', 'فرص عمل'], ['portfolio', 'Portfolio', 'بورتفوليو'],
            ['training', 'Training courses', 'دورات تدريبية'], ['matching', 'Smart matching', 'مطابقة ذكية'],
            ['payments', 'Fast payments', 'مدفوعات سريعة'],
          ]),
          sortOrder: 0, metadata: { rankMax: 5, dynamicByP1: true },
        },
        {
          code: 'M2', questionTextEn: 'Most important service for you personally', questionTextAr: 'ما هي الخدمة الأكثر أهمية التي تتوقعها من المنصة؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['jobs', 'Jobs/projects', 'فرص عمل / مشاريع'], ['profile', 'Profile visibility', 'إبراز الملف'],
            ['training', 'Training', 'تدريب'], ['verification', 'Skill verification', 'التحقق من المهارات'],
          ]),
          sortOrder: 1,
        },
        { code: 'M3', questionTextEn: 'Biggest career challenge (optional)', questionTextAr: 'ما هو أكبر تحدٍ في مسيرتك المهنية؟ (اختياري)', answerType: 'TEXTAREA', sortOrder: 2, isRequired: false },
      ],
    },
    {
      code: 'PAYMENT',
      titleEn: 'Payment Model',
      titleAr: 'نموذج العمل والاستعداد للدفع',
      sortOrder: 13,
      questions: [
        {
          code: 'W1', questionTextEn: 'Preferred platform payment model', questionTextAr: 'أي نموذج دفع تفضله مقابل خدمات المنصة؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['free', 'Free (sponsored)', 'مجاني'], ['monthly', 'Monthly subscription', 'اشتراك شهري'],
            ['annual', 'Annual subscription', 'اشتراك سنوي'], ['commission', 'Commission per deal', 'عمولة'], ['success', 'Pay on success', 'دفع عند الحصول على عمل'],
          ]),
          sortOrder: 0,
        },
        {
          code: 'W2', questionTextEn: 'Max monthly subscription willing to pay', questionTextAr: 'الحد الأقصى للمبلغ الشهري الذي ترغب في دفعه', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['lt50', '<50 SAR', 'أقل من 50'], ['50_150', '50-150', '50-150'], ['150_300', '150-300', '150-300'],
            ['gt300', '>300', 'أكثر من 300'], ['cant_pay', 'Cannot pay now', 'لا أستطيع الدفع'],
          ]),
          sortOrder: 1, metadata: { currencySegment: true },
        },
        {
          code: 'W3', questionTextEn: 'What would you pay for?', questionTextAr: 'مقابل ماذا ستكون مستعداً للدفع؟', answerType: 'MULTIPLE_CHOICE',
          options: mcOptions([
            ['jobs', 'Job/project access', 'فرص عمل'], ['visibility', 'Profile boost', 'إبراز الملف'],
            ['courses', 'Certified courses', 'دورات معتمدة'], ['verification', 'Skill verification', 'التحقق من المهارات'],
          ]),
          sortOrder: 2,
        },
      ],
    },
    {
      code: 'BETA',
      titleEn: 'Beta Program',
      titleAr: 'البرنامج التجريبي',
      sortOrder: 14,
      questions: [
        {
          code: 'X1', questionTextEn: 'Join the platform beta?', questionTextAr: 'هل توافق على المشاركة في النسخة التجريبية؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم'], ['maybe', 'Maybe', 'ربما'], ['no', 'No', 'لا']]),
          sortOrder: 0,
        },
        {
          code: 'X2', questionTextEn: 'Preferred contact method', questionTextAr: 'ما هي الطريقة المفضلة للتواصل معك؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([
            ['whatsapp', 'WhatsApp', 'واتساب'], ['phone', 'Phone call', 'اتصال هاتفي'], ['email', 'Email', 'بريد إلكتروني'],
          ]),
          sortOrder: 1,
        },
        {
          code: 'X3', questionTextEn: 'Consent to use registered contact details?', questionTextAr: 'هل توافق على استخدام بياناتك المسجلة للتواصل؟', answerType: 'SINGLE_CHOICE',
          options: mcOptions([['yes', 'Yes', 'نعم (أوافق)'], ['no', 'No', 'لا']]),
          sortOrder: 2, showIf: { questionCode: 'X1', op: 'eq', value: 'yes' },
        },
      ],
    },
    {
      code: 'OPEN',
      titleEn: 'Your Feedback',
      titleAr: 'أسئلة مفتوحة',
      sortOrder: 15,
      questions: [
        { code: 'O1', questionTextEn: 'Biggest problem you want ABC to solve', questionTextAr: 'ما هي المشكلة الأكبر التي تواجهها وتتمنى أن تحلها منصة ABC؟', answerType: 'TEXTAREA', sortOrder: 0 },
        { code: 'O2', questionTextEn: 'Additional suggestions (optional)', questionTextAr: 'هل لديك أي اقتراح أو ميزة إضافية؟ (اختياري)', answerType: 'TEXTAREA', sortOrder: 1, isRequired: false },
      ],
    },
  ];
}
