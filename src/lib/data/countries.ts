export interface CountryCity {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface CountryDefinition {
  code: string;
  nameAr: string;
  nameEn: string;
  dialCode: string;
  lat: number;
  lng: number;
  zoom: number;
  cities: CountryCity[];
}

export const COUNTRIES: CountryDefinition[] = [
  {
    code: "AE",
    nameAr: "الإمارات العربية المتحدة",
    nameEn: "United Arab Emirates",
    dialCode: "+971",
    lat: 25.2048,
    lng: 55.2708,
    zoom: 10,
    cities: [
      { id: "dubai", nameAr: "دبي", nameEn: "Dubai" },
      { id: "abu-dhabi", nameAr: "أبوظبي", nameEn: "Abu Dhabi" },
      { id: "sharjah", nameAr: "الشارقة", nameEn: "Sharjah" },
      { id: "ajman", nameAr: "عجمان", nameEn: "Ajman" },
      { id: "rak", nameAr: "رأس الخيمة", nameEn: "Ras Al Khaimah" },
      { id: "fujairah", nameAr: "الفجيرة", nameEn: "Fujairah" },
      { id: "uaq", nameAr: "أم القيوين", nameEn: "Umm Al Quwain" },
    ],
  },
  {
    code: "SA",
    nameAr: "المملكة العربية السعودية",
    nameEn: "Saudi Arabia",
    dialCode: "+966",
    lat: 24.7136,
    lng: 46.6753,
    zoom: 6,
    cities: [
      { id: "riyadh", nameAr: "الرياض", nameEn: "Riyadh" },
      { id: "jeddah", nameAr: "جدة", nameEn: "Jeddah" },
      { id: "dammam", nameAr: "الدمام", nameEn: "Dammam" },
      { id: "makkah", nameAr: "مكة المكرمة", nameEn: "Makkah" },
      { id: "madinah", nameAr: "المدينة المنورة", nameEn: "Madinah" },
      { id: "khobar", nameAr: "الخبر", nameEn: "Khobar" },
    ],
  },
  {
    code: "QA",
    nameAr: "قطر",
    nameEn: "Qatar",
    dialCode: "+974",
    lat: 25.2854,
    lng: 51.531,
    zoom: 11,
    cities: [
      { id: "doha", nameAr: "الدوحة", nameEn: "Doha" },
      { id: "al-wakrah", nameAr: "الوكرة", nameEn: "Al Wakrah" },
      { id: "al-khor", nameAr: "الخور", nameEn: "Al Khor" },
    ],
  },
  {
    code: "KW",
    nameAr: "الكويت",
    nameEn: "Kuwait",
    dialCode: "+965",
    lat: 29.3759,
    lng: 47.9774,
    zoom: 11,
    cities: [
      { id: "kuwait-city", nameAr: "مدينة الكويت", nameEn: "Kuwait City" },
      { id: "hawalli", nameAr: "حولي", nameEn: "Hawalli" },
      { id: "ahmadi", nameAr: "الأحمدي", nameEn: "Ahmadi" },
    ],
  },
  {
    code: "BH",
    nameAr: "البحرين",
    nameEn: "Bahrain",
    dialCode: "+973",
    lat: 26.2285,
    lng: 50.586,
    zoom: 11,
    cities: [
      { id: "manama", nameAr: "المنامة", nameEn: "Manama" },
      { id: "muharraq", nameAr: "المحرق", nameEn: "Muharraq" },
      { id: "riffa", nameAr: "الرفاع", nameEn: "Riffa" },
    ],
  },
  {
    code: "OM",
    nameAr: "عُمان",
    nameEn: "Oman",
    dialCode: "+968",
    lat: 23.588,
    lng: 58.3829,
    zoom: 7,
    cities: [
      { id: "muscat", nameAr: "مسقط", nameEn: "Muscat" },
      { id: "salalah", nameAr: "صلالة", nameEn: "Salalah" },
      { id: "sohar", nameAr: "صحار", nameEn: "Sohar" },
    ],
  },
  {
    code: "EG",
    nameAr: "مصر",
    nameEn: "Egypt",
    dialCode: "+20",
    lat: 30.0444,
    lng: 31.2357,
    zoom: 6,
    cities: [
      { id: "cairo", nameAr: "القاهرة", nameEn: "Cairo" },
      { id: "alexandria", nameAr: "الإسكندرية", nameEn: "Alexandria" },
      { id: "giza", nameAr: "الجيزة", nameEn: "Giza" },
    ],
  },
  {
    code: "JO",
    nameAr: "الأردن",
    nameEn: "Jordan",
    dialCode: "+962",
    lat: 31.9454,
    lng: 35.9284,
    zoom: 8,
    cities: [
      { id: "amman", nameAr: "عمان", nameEn: "Amman" },
      { id: "irbid", nameAr: "إربد", nameEn: "Irbid" },
      { id: "aqaba", nameAr: "العقبة", nameEn: "Aqaba" },
    ],
  },
  {
    code: "PK",
    nameAr: "باكستان",
    nameEn: "Pakistan",
    dialCode: "+92",
    lat: 33.6844,
    lng: 73.0479,
    zoom: 6,
    cities: [
      { id: "islamabad", nameAr: "إسلام آباد", nameEn: "Islamabad" },
      { id: "karachi", nameAr: "كراتشي", nameEn: "Karachi" },
      { id: "lahore", nameAr: "لاهور", nameEn: "Lahore" },
    ],
  },
];

export function getCountryByCode(code: string | null | undefined): CountryDefinition | undefined {
  if (!code) return undefined;
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

/** Match ISO code or legacy free-text country name from registration. */
export function resolveCountryCode(value: string | null | undefined): string {
  if (!value) return "AE";
  const upper = value.toUpperCase();
  const byCode = COUNTRIES.find((c) => c.code === upper);
  if (byCode) return byCode.code;
  const lower = value.toLowerCase();
  const byName = COUNTRIES.find(
    (c) =>
      c.nameEn.toLowerCase().includes(lower) ||
      c.nameAr.includes(value) ||
      lower.includes(c.nameEn.toLowerCase()),
  );
  return byName?.code ?? "AE";
}

export function getCountryLabel(country: CountryDefinition, lang: string): string {
  return lang.startsWith("ar") ? country.nameAr : country.nameEn;
}

export function getCityLabel(city: CountryCity, lang: string): string {
  return lang.startsWith("ar") ? city.nameAr : city.nameEn;
}

export function resolveCityId(countryCode: string, cityValue: string | null | undefined): string {
  if (!cityValue) return "";
  const country = getCountryByCode(countryCode);
  if (!country) return cityValue;
  const lower = cityValue.toLowerCase();
  const match = country.cities.find(
    (c) =>
      c.id === cityValue ||
      c.nameEn.toLowerCase() === lower ||
      c.nameAr === cityValue,
  );
  return match?.id ?? cityValue;
}

export function getCityCoordinates(
  countryCode: string,
  cityId: string,
): { lat: number; lng: number } | null {
  const country = getCountryByCode(countryCode);
  if (!country || !cityId) return null;
  const idx = country.cities.findIndex((c) => c.id === cityId);
  if (idx < 0) return { lat: country.lat, lng: country.lng };
  const spread = 0.08 * idx;
  return { lat: country.lat + spread * 0.3, lng: country.lng + spread * 0.2 };
}

export function stripDialCode(phone: string, dialCode: string): string {
  const normalized = phone.trim();
  if (normalized.startsWith(dialCode)) return normalized.slice(dialCode.length).trim();
  if (normalized.startsWith(dialCode.replace("+", ""))) return normalized.slice(dialCode.length - 1).trim();
  return normalized.replace(/^\+\d+\s*/, "");
}

export function formatPhoneWithDialCode(dialCode: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "");
  if (!digits) return "";
  return `${dialCode}${digits.startsWith("0") ? digits.slice(1) : digits}`;
}

/** Local-number patterns (without country dial code) for registration validation. */
const LOCAL_PHONE_RULES: Record<string, RegExp> = {
  AE: /^5\d{8}$/,
  SA: /^5\d{8}$/,
  QA: /^[3-7]\d{7}$/,
  KW: /^[569]\d{7}$/,
  BH: /^[3-9]\d{7}$/,
  OM: /^[79]\d{7}$/,
  EG: /^1\d{9}$/,
  JO: /^7[789]\d{7}$/,
  PK: /^3\d{9}$/,
};

export function normalizeLocalPhoneDigits(phoneLocal: string): string {
  return phoneLocal.replace(/\D/g, "").replace(/^0+/, "");
}

export function isValidLocalPhoneForCountry(
  countryCode: string,
  phoneLocal: string,
): boolean {
  const digits = normalizeLocalPhoneDigits(phoneLocal);
  if (!digits) return false;
  const rule = LOCAL_PHONE_RULES[countryCode.toUpperCase()];
  if (rule) return rule.test(digits);
  return digits.length >= 8 && digits.length <= 15;
}
