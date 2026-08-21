import {
  COUNTRIES,
  getCityLabel,
  getCountryByCode,
  resolveCountryCode,
} from "@/lib/data/countries";
import type { PublicSurveyQuestionOption } from "@/modules/onboarding-survey/types";

type Lang = "ar" | "en" | "ur";

const PERCENT_BUCKETS: { value: string; en: string; ar: string }[] = [
  { value: "lt25", en: "Less than 25%", ar: "أقل من 25%" },
  { value: "25_50", en: "25-50%", ar: "25-50%" },
  { value: "51_75", en: "51-75%", ar: "51-75%" },
  { value: "gt75", en: "More than 75%", ar: "أكثر من 75%" },
];

const NATIONALS_QUESTION: Record<string, { en: string; ar: string }> = {
  SA: {
    en: "Saudi nationals percentage in workforce",
    ar: "نسبة السعوديين في القوى العاملة",
  },
  AE: {
    en: "Emirati nationals percentage in workforce",
    ar: "نسبة المواطنين الإماراتيين",
  },
  QA: {
    en: "Qatari nationals percentage in workforce",
    ar: "نسبة القطريين",
  },
  KW: {
    en: "Kuwaiti nationals percentage in workforce",
    ar: "نسبة الكويتيين",
  },
  BH: {
    en: "Bahraini nationals percentage in workforce",
    ar: "نسبة البحرينيين",
  },
  OM: {
    en: "Omani nationals percentage in workforce",
    ar: "نسبة العُمانيين",
  },
  EG: {
    en: "Egyptian nationals percentage in workforce",
    ar: "نسبة المصريين",
  },
  JO: {
    en: "Jordanian nationals percentage in workforce",
    ar: "نسبة الأردنيين",
  },
  PK: {
    en: "Pakistani nationals percentage in workforce",
    ar: "نسبة الباكستانيين",
  },
};

function labelForLang(en: string, ar: string, lang: Lang): string {
  if (lang === "ar" || lang === "ur") return ar;
  return en;
}

export function regionsByCountryOptions(
  countryInput: string | null | undefined,
  lang: Lang,
): PublicSurveyQuestionOption[] {
  const code = resolveCountryCode(countryInput ?? "");
  const country = getCountryByCode(code) ?? COUNTRIES[0];
  const cities = country.cities.map((city) => ({
    value: city.id,
    label: getCityLabel(city, lang),
  }));
  const countryWide = {
    value: `any_${code.toLowerCase()}`,
    label:
      lang === "ar"
        ? `أي مكان في ${country.nameAr}`
        : `Anywhere in ${country.nameEn}`,
  };
  const gcc =
    code !== "AE"
      ? [{ value: "gcc", label: lang === "ar" ? "دول الخليج" : "GCC countries" }]
      : [];
  return [...cities, countryWide, ...gcc];
}

export function nationalsPercentOptions(lang: Lang): PublicSurveyQuestionOption[] {
  return PERCENT_BUCKETS.map((b) => ({
    value: b.value,
    label: labelForLang(b.en, b.ar, lang),
  }));
}

export function nationalsQuestionText(
  countryInput: string | null | undefined,
  lang: Lang,
): string {
  const code = resolveCountryCode(countryInput ?? "");
  const copy = NATIONALS_QUESTION[code] ?? {
    en: "Nationals percentage in workforce",
    ar: "نسبة المواطنين في القوى العاملة",
  };
  return labelForLang(copy.en, copy.ar, lang);
}

export type ResolvedQuestionPresentation = {
  questionText: string;
  options: PublicSurveyQuestionOption[];
};

export function resolveQuestionPresentation(
  questionText: string,
  options: PublicSurveyQuestionOption[],
  metadata: Record<string, unknown> | null,
  countryInput: string | null | undefined,
  lang: Lang,
): ResolvedQuestionPresentation {
  const source = metadata?.optionSource as string | undefined;
  if (source === "REGIONS_BY_COUNTRY") {
    return {
      questionText,
      options: regionsByCountryOptions(countryInput, lang),
    };
  }
  if (source === "NATIONALS_PERCENT") {
    return {
      questionText: nationalsQuestionText(countryInput, lang),
      options: nationalsPercentOptions(lang),
    };
  }
  return { questionText, options };
}

/** Questions that accept more than one answer (UI multi-toggle). */
export function allowsMultipleAnswers(
  answerType: string,
  questionText: string,
  metadata: Record<string, unknown> | null,
): boolean {
  if (answerType === "MULTIPLE_CHOICE") return true;
  if (metadata?.allowsMultiple === true) return true;
  if (metadata?.optionSource === "REGIONS_BY_COUNTRY") return true;
  const t = questionText.trim();
  if (
    /(المناطق|مناطق|ضمانات|تحديات|ميزات|مصادر|قنوات|أولويات|أي من|ما هي المناطق)/.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

export function choiceGridClass(
  options: PublicSurveyQuestionOption[],
  answerType: string,
  metadata: Record<string, unknown> | null,
): string {
  if (answerType === "LINEAR_SCALE" || metadata?.compactNumeric === true) {
    const n = options.length;
    if (n <= 5) return "grid grid-flow-col auto-cols-fr gap-1.5";
    return "grid grid-cols-3 sm:grid-cols-5 gap-1.5";
  }

  if (options.length === 0) return "grid grid-cols-2 gap-1.5";

  const maxLen = Math.max(...options.map((o) => o.label.length));
  const numericLike = options.every((o) => /^[\d\s\-–%+./]+$/.test(o.label.trim()));

  if (numericLike || maxLen <= 8) {
    return "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5";
  }
  if (maxLen <= 18) {
    return "grid grid-cols-2 sm:grid-cols-3 gap-1.5";
  }
  return "grid grid-cols-1 sm:grid-cols-2 gap-1.5";
}
