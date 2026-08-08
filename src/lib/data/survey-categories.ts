export interface SurveySubcategory {
  id: string;
  labelEn: string;
  labelAr: string;
}

export interface SurveyCategory {
  id: string;
  labelEn: string;
  labelAr: string;
  subcategories: SurveySubcategory[];
}

export const surveyCategories: SurveyCategory[] = [
  {
    id: "construction-materials",
    labelEn: "Construction Materials",
    labelAr: "مواد البناء",
    subcategories: [
      { id: "portland-cement", labelEn: "Portland Cement", labelAr: "أسمنت بورتلاندي" },
      { id: "white-cement", labelEn: "White Cement", labelAr: "أسمنت أبيض" },
      { id: "reinforcement-steel", labelEn: "Reinforcement Steel", labelAr: "حديد تسليح" },
      { id: "structural-steel", labelEn: "Structural Steel", labelAr: "حديد هيكلي" },
      { id: "aggregates", labelEn: "Aggregates", labelAr: "رمل وحصى" },
      { id: "concrete-blocks", labelEn: "Concrete Blocks", labelAr: "طوب أسمنتي" },
      { id: "clay-bricks", labelEn: "Clay Bricks", labelAr: "طوب طفلي" },
      { id: "ready-mix-concrete", labelEn: "Ready-Mix Concrete", labelAr: "خرسانة جاهزة" },
      { id: "concrete-admixtures", labelEn: "Concrete Admixtures", labelAr: "مضافات خرسانية" },
      { id: "formwork", labelEn: "Formwork", labelAr: "قوالب الخرسانة" },
      { id: "scaffolding", labelEn: "Scaffolding", labelAr: "سقالات" },
      { id: "construction-chemicals", labelEn: "Construction Chemicals", labelAr: "مواد كيميائية بناء" },
    ],
  },
  {
    id: "electrical-low-current",
    labelEn: "Electrical & Low Current",
    labelAr: "الكهرباء والتيار الخفيف",
    subcategories: [
      { id: "power-cables", labelEn: "Power Cables", labelAr: "كابلات قوى" },
      { id: "control-cables", labelEn: "Control Cables", labelAr: "كابلات تحكم" },
      { id: "electrical-panels", labelEn: "Electrical Panels", labelAr: "لوحات كهربائية" },
      { id: "distribution-boards", labelEn: "Distribution Boards", labelAr: "لوحات توزيع" },
      { id: "conduits-trunking", labelEn: "Conduits & Trunking", labelAr: "مواسير وقنوات كهربائية" },
      { id: "indoor-lighting", labelEn: "Indoor Lighting", labelAr: "إنارة داخلية" },
      { id: "outdoor-lighting", labelEn: "Outdoor Lighting", labelAr: "إنارة خارجية" },
      { id: "switches-sockets", labelEn: "Switches & Sockets", labelAr: "مفاتيح وفيش" },
      { id: "ups-generators", labelEn: "UPS & Generators", labelAr: "يو بي إس ومولدات" },
      { id: "fire-alarm", labelEn: "Fire Alarm Systems", labelAr: "أنظمة إنذار حريق" },
      { id: "cctv-access-control", labelEn: "CCTV & Access Control", labelAr: "كاميرات وتحكم دخول" },
      { id: "smart-home", labelEn: "Smart Home Systems", labelAr: "أنظمة منزل ذكي" },
    ],
  },
  {
    id: "plumbing-hvac",
    labelEn: "Plumbing & HVAC",
    labelAr: "السباكة والتكييف",
    subcategories: [
      { id: "pvc-pipes", labelEn: "PVC Pipes", labelAr: "مواسير PVC" },
      { id: "ppr-pipes", labelEn: "PPR Pipes", labelAr: "مواسير PPR" },
      { id: "copper-pipes", labelEn: "Copper Pipes", labelAr: "مواسير نحاس" },
      { id: "sanitary-fixtures", labelEn: "Sanitary Fixtures", labelAr: "أدوات صحية" },
      { id: "water-heaters", labelEn: "Water Heaters", labelAr: "سخانات مياه" },
      { id: "pumps", labelEn: "Pumps", labelAr: "مضخات" },
      { id: "drainage-systems", labelEn: "Drainage Systems", labelAr: "أنظمة صرف" },
      { id: "water-tanks", labelEn: "Water Tanks", labelAr: "خزانات مياه" },
      { id: "split-ac", labelEn: "Split AC Units", labelAr: "وحدات تكييف سبليت" },
      { id: "central-ac", labelEn: "Central AC", labelAr: "تكييف مركزي" },
      { id: "ductwork", labelEn: "Ductwork", labelAr: "قنوات تهوية" },
      { id: "ventilation-fans", labelEn: "Ventilation Fans", labelAr: "مراوح شفط" },
    ],
  },
  {
    id: "finishes-flooring",
    labelEn: "Finishes & Flooring",
    labelAr: "التشطيبات والأرضيات",
    subcategories: [
      { id: "ceramic-tiles", labelEn: "Ceramic Tiles", labelAr: "سيراميك" },
      { id: "porcelain-tiles", labelEn: "Porcelain Tiles", labelAr: "بورسلان" },
      { id: "marble", labelEn: "Marble", labelAr: "رخام" },
      { id: "granite", labelEn: "Granite", labelAr: "جرانيت" },
      { id: "vinyl-flooring", labelEn: "Vinyl Flooring", labelAr: "أرضيات فينيل" },
      { id: "laminate-flooring", labelEn: "Laminate Flooring", labelAr: "أرضيات لامينيت" },
      { id: "parquet", labelEn: "Parquet", labelAr: "باركيه" },
      { id: "carpet", labelEn: "Carpet", labelAr: "موكيت" },
      { id: "wall-cladding", labelEn: "Wall Cladding", labelAr: "أكسنة جدران" },
      { id: "false-ceilings", labelEn: "False Ceilings", labelAr: "أسقف مستعارة" },
      { id: "gypsum-boards", labelEn: "Gypsum Boards", labelAr: "ألواح جبس" },
      { id: "partitions", labelEn: "Partitions", labelAr: "فواصل" },
    ],
  },
  {
    id: "paints-coatings",
    labelEn: "Paints & Coatings",
    labelAr: "الدهانات والطلاء",
    subcategories: [
      { id: "interior-paint", labelEn: "Interior Paint", labelAr: "دهانات داخلية" },
      { id: "exterior-paint", labelEn: "Exterior Paint", labelAr: "دهانات خارجية" },
      { id: "primer", labelEn: "Primer", labelAr: "بوية أساس" },
      { id: "emulsion-paint", labelEn: "Emulsion Paint", labelAr: "دهانات بلاستيك" },
      { id: "oil-paint", labelEn: "Oil Paint", labelAr: "دهانات زيتية" },
      { id: "epoxy-coatings", labelEn: "Epoxy Coatings", labelAr: "طلاء إيبوكسي" },
      { id: "waterproof-coatings", labelEn: "Waterproof Coatings", labelAr: "طلاء عازل مائي" },
      { id: "wood-polish", labelEn: "Wood Polish", labelAr: "بوليش خشب" },
      { id: "varnish", labelEn: "Varnish", labelAr: "ورنيش" },
      { id: "texture-paint", labelEn: "Texture Paint", labelAr: "دهانات ديكورية" },
    ],
  },
  {
    id: "woodworks-carpentry",
    labelEn: "Woodworks & Carpentry",
    labelAr: "الأعمال الخشبية والنجارة",
    subcategories: [
      { id: "solid-wood", labelEn: "Solid Wood", labelAr: "خشب طبيعي" },
      { id: "mdf-boards", labelEn: "MDF Boards", labelAr: "ألواح MDF" },
      { id: "plywood", labelEn: "Plywood", labelAr: "ألواح خشب مضغوط" },
      { id: "wooden-doors", labelEn: "Doors", labelAr: "أبواب" },
      { id: "wooden-windows", labelEn: "Windows", labelAr: "نوافذ" },
      { id: "kitchen-cabinets", labelEn: "Kitchen Cabinets", labelAr: "مطابخ" },
      { id: "wardrobes", labelEn: "Wardrobes", labelAr: "خزائن ملابس" },
      { id: "wooden-ceilings", labelEn: "Wooden Ceilings", labelAr: "أسقف خشبية" },
      { id: "decorative-woodwork", labelEn: "Decorative Woodwork", labelAr: "أعمال خشبية ديكور" },
      { id: "wood-treatment", labelEn: "Wood Treatment", labelAr: "معالجة خشب" },
    ],
  },
  {
    id: "metal-works",
    labelEn: "Metal Works",
    labelAr: "الأعمال المعدنية",
    subcategories: [
      { id: "aluminum-profiles", labelEn: "Aluminum Profiles", labelAr: "بروفيلات ألمنيوم" },
      { id: "aluminum-windows", labelEn: "Aluminum Windows", labelAr: "نوافذ ألمنيوم" },
      { id: "aluminum-doors", labelEn: "Aluminum Doors", labelAr: "أبواب ألمنيوم" },
      { id: "curtain-walls", labelEn: "Curtain Walls", labelAr: "واجهات زجاجية" },
      { id: "steel-doors", labelEn: "Steel Doors", labelAr: "أبواب فولاذية" },
      { id: "rolling-shutters", labelEn: "Rolling Shutters", labelAr: "شترات" },
      { id: "metal-railings", labelEn: "Metal Railings", labelAr: "درابزينات معدنية" },
      { id: "metal-gates", labelEn: "Gates", labelAr: "بوابات" },
      { id: "stainless-steel", labelEn: "Stainless Steel", labelAr: "ستانلس ستيل" },
      { id: "metal-fabrication", labelEn: "Metal Fabrication", labelAr: "تشكيل معادن" },
      { id: "welding-materials", labelEn: "Welding Materials", labelAr: "مواد لحام" },
    ],
  },
  {
    id: "waterproofing-insulation",
    labelEn: "Waterproofing & Insulation",
    labelAr: "العزل والمقاومة",
    subcategories: [
      { id: "bitumen-membranes", labelEn: "Bitumen Membranes", labelAr: "أغشية بيتومين" },
      { id: "liquid-waterproofing", labelEn: "Liquid Waterproofing", labelAr: "عزل سائل" },
      { id: "cementitious-waterproofing", labelEn: "Cementitious Waterproofing", labelAr: "عزل أسمنتي" },
      { id: "thermal-insulation", labelEn: "Thermal Insulation", labelAr: "عزل حراري" },
      { id: "acoustic-insulation", labelEn: "Acoustic Insulation", labelAr: "عزل صوتي" },
      { id: "fireproofing", labelEn: "Fireproofing", labelAr: "مقاومة حريق" },
      { id: "expansion-joints", labelEn: "Expansion Joints", labelAr: "فواصل تمدد" },
      { id: "sealants", labelEn: "Sealants", labelAr: "مواد مانعة تسرب" },
      { id: "waterproofing-additives", labelEn: "Waterproofing Additives", labelAr: "مضافات عازلة" },
      { id: "roof-waterproofing", labelEn: "Roof Waterproofing", labelAr: "عزل أسطح" },
    ],
  },
  {
    id: "roads-infrastructure",
    labelEn: "Roads & Infrastructure",
    labelAr: "الطرق والبنية التحتية",
    subcategories: [
      { id: "asphalt", labelEn: "Asphalt", labelAr: "أسفلت" },
      { id: "road-marking", labelEn: "Road Marking Materials", labelAr: "مواد تخطيط طرق" },
      { id: "traffic-signs", labelEn: "Traffic Signs", labelAr: "إشارات مرور" },
      { id: "road-barriers", labelEn: "Road Barriers", labelAr: "حواجز طرق" },
      { id: "paving-stones", labelEn: "Paving Stones", labelAr: "بلاط خارجي" },
      { id: "manholes", labelEn: "Manholes", labelAr: "أغطية بالوعات" },
      { id: "drainage-channels", labelEn: "Drainage Channels", labelAr: "قنوات صرف" },
      { id: "street-lighting", labelEn: "Street Lighting", labelAr: "إنارة شوارع" },
      { id: "bridge-bearings", labelEn: "Bridge Bearings", labelAr: "فواصل جسور" },
      { id: "geotextiles", labelEn: "Geotextiles", labelAr: "أقمشة جيوتكسايل" },
    ],
  },
  {
    id: "mechanical-industrial",
    labelEn: "Mechanical & Industrial",
    labelAr: "الأعمال الميكانيكية والصناعية",
    subcategories: [
      { id: "industrial-pipes", labelEn: "Industrial Pipes", labelAr: "مواسير صناعية" },
      { id: "valves", labelEn: "Valves", labelAr: "صمامات" },
      { id: "pipe-fittings", labelEn: "Pipe Fittings", labelAr: "وصلات مواسير" },
      { id: "motors", labelEn: "Motors", labelAr: "محركات" },
      { id: "compressors", labelEn: "Compressors", labelAr: "ضواغط" },
      { id: "lifting-equipment", labelEn: "Lifting Equipment", labelAr: "معدات رفع" },
      { id: "heavy-machinery", labelEn: "Heavy Machinery", labelAr: "معدات ثقيلة" },
      { id: "power-tools", labelEn: "Power Tools", labelAr: "أدوات كهربائية" },
      { id: "hand-tools", labelEn: "Hand Tools", labelAr: "أدوات يدوية" },
      { id: "safety-equipment", labelEn: "Safety Equipment", labelAr: "معدات سلامة" },
    ],
  },
  {
    id: "safety-security",
    labelEn: "Safety & Security",
    labelAr: "السلامة والأمن",
    subcategories: [
      { id: "ppe", labelEn: "Personal Protective Equipment", labelAr: "معدات الوقاية الشخصية" },
      { id: "safety-helmets", labelEn: "Safety Helmets", labelAr: "خوذات" },
      { id: "safety-harnesses", labelEn: "Safety Harnesses", labelAr: "أحزمة أمان" },
      { id: "safety-shoes", labelEn: "Safety Shoes", labelAr: "أحذية سلامة" },
      { id: "fire-extinguishers", labelEn: "Fire Extinguishers", labelAr: "طفايات حريق" },
      { id: "firefighting-systems", labelEn: "Firefighting Systems", labelAr: "أنظمة إطفاء" },
      { id: "first-aid-kits", labelEn: "First Aid Kits", labelAr: "حقائب إسعافات" },
      { id: "safety-signs", labelEn: "Safety Signs", labelAr: "لافتات سلامة" },
      { id: "guardrails", labelEn: "Guardrails", labelAr: "حواجز وقاية" },
      { id: "security-fencing", labelEn: "Security Fencing", labelAr: "أسوار أمنية" },
      { id: "surveillance-cameras", labelEn: "Surveillance Cameras", labelAr: "كاميرات مراقبة" },
      { id: "intrusion-detection", labelEn: "Intrusion Detection", labelAr: "أنظمة كشف اقتحام" },
    ],
  },
  {
    id: "project-services",
    labelEn: "Project Services",
    labelAr: "خدمات المشاريع",
    subcategories: [
      { id: "general-contracting", labelEn: "General Contracting", labelAr: "مقاولات عامة" },
      { id: "subcontracting", labelEn: "Subcontracting", labelAr: "مقاولات فرعية" },
      { id: "consulting-engineering", labelEn: "Consulting Engineering", labelAr: "استشارات هندسية" },
      { id: "project-management", labelEn: "Project Management", labelAr: "إدارة مشاريع" },
      { id: "quantity-surveying", labelEn: "Quantity Surveying", labelAr: "حصر كميات" },
      { id: "cost-estimation", labelEn: "Cost Estimation", labelAr: "تقدير تكاليف" },
      { id: "bim-services", labelEn: "BIM Services", labelAr: "خدمات BIM" },
      { id: "surveying", labelEn: "Surveying", labelAr: "مساحة" },
      { id: "soil-testing", labelEn: "Soil Testing", labelAr: "فحص تربة" },
      { id: "material-testing", labelEn: "Material Testing", labelAr: "فحص مواد" },
      { id: "environmental-studies", labelEn: "Environmental Studies", labelAr: "دراسات بيئية" },
      { id: "permitting-services", labelEn: "Permitting Services", labelAr: "خدمات تراخيص" },
    ],
  },
];

export function getSubcategoriesByCategoryId(categoryId: string): SurveySubcategory[] {
  return surveyCategories.find((c) => c.id === categoryId)?.subcategories ?? [];
}

export function getAllSubcategoryIds(): string[] {
  return surveyCategories.flatMap((c) => c.subcategories.map((s) => s.id));
}

export function getSubcategoryById(id: string): SurveySubcategory | undefined {
  return surveyCategories.flatMap((c) => c.subcategories).find((s) => s.id === id);
}
