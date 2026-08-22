"use client";

import { useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Building2, Mail, User, Upload } from "lucide-react";
import MapPicker from "@/components/MapPicker";
import {
  LocationFormFields,
  locationValuesToPhone,
  storageToLocationValues,
  type LocationFieldValues,
} from "@/components/shared/LocationFormFields";
import { useLanguage } from "@/lib/LanguageContext";
import {
  AUTH_PANEL_HEADER_SUBTITLE,
  AUTH_PANEL_HEADER_TITLE,
  AUTH_PANEL_INPUT_CLS,
  AUTH_PANEL_LABEL_CLS,
} from "@/components/homepage/auth-panel-styles";
import { PLATFORM_ACCOUNT_TYPES } from "@/lib/account-types";
import { getCityCoordinates, getCityLabel, getCountryByCode } from "@/lib/data/countries";
import { isIndividualAccountType } from "@/lib/onboarding/account-type-map";
import { uploadDocument } from "@/lib/onboarding/api";
import type { OnboardingProfile } from "@/lib/onboarding/types";

interface StepProfileReviewProps {
  profile: OnboardingProfile;
  onChange: (profile: OnboardingProfile) => void;
  errors: Record<string, string>;
}

export function StepProfileReview({ profile, onChange, errors }: StepProfileReviewProps) {
  const { t, language } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const accountDef = PLATFORM_ACCOUNT_TYPES.find((a) => a.id === profile.platformAccountType);
  const isIndividual = isIndividualAccountType(profile.platformAccountType || null);
  const orgNameLabel = profile.platformAccountType === "ENTITY" ? t("entityName") : t("companyName");

  const inputCls = AUTH_PANEL_INPUT_CLS;

  const locationValues: LocationFieldValues = useMemo(
    () =>
      storageToLocationValues(
        profile.countryCode || profile.country,
        profile.city,
        profile.address,
        profile.phone,
      ),
    [profile.countryCode, profile.country, profile.city, profile.address, profile.phone],
  );

  const country = getCountryByCode(locationValues.countryCode) ?? getCountryByCode("AE")!;
  const cityCoords = getCityCoordinates(locationValues.countryCode, locationValues.city);
  const mapCenter = cityCoords ?? { lat: country.lat, lng: country.lng };

  function setField<K extends keyof OnboardingProfile>(field: K, value: OnboardingProfile[K]) {
    onChange({ ...profile, [field]: value });
  }

  function handleLocationChange(values: LocationFieldValues) {
    onChange({
      ...profile,
      countryCode: values.countryCode,
      country: values.countryCode,
      city: values.city,
      address: values.address,
      phone: locationValuesToPhone(values),
    });
  }

  async function handleImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadDocument(file, () => {});
      if (isIndividual) {
        setField("avatarUrl", result.url);
      } else {
        setField("companyLogoUrl", result.url);
      }
    } finally {
      setUploading(false);
    }
  }

  const previewUrl = isIndividual ? profile.avatarUrl : profile.companyLogoUrl;
  const cityLabel =
    country.cities.find((c) => c.id === locationValues.city) &&
    getCityLabel(country.cities.find((c) => c.id === locationValues.city)!, language);

  const mapSearchHint = [country.nameEn, cityLabel, locationValues.address].filter(Boolean).join(", ");

  return (
    <div className="space-y-3">
      <div>
        <p className={AUTH_PANEL_HEADER_TITLE}>{t("obReviewTitle")}</p>
        <p className={AUTH_PANEL_HEADER_SUBTITLE}>{t("obReviewSubtitle")}</p>
      </div>

      {accountDef && (
        <div className="rounded-none border border-secondary-200 bg-secondary-50/40 px-3 py-2 text-xs text-secondary-700">
          {t("accountCategory")}: {t(accountDef.labelKey)}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-none border border-surface-200 bg-surface-50 overflow-hidden shrink-0">
          {previewUrl ? (
            <Image src={previewUrl} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-400">
              {isIndividual ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
            </div>
          )}
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0] ?? null)} />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold border border-surface-300 hover:bg-surface-50"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? t("loading") : isIndividual ? t("obUploadPhoto") : t("obUploadLogo")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={AUTH_PANEL_LABEL_CLS}>{t("fullName")} *</label>
          <div className="relative">
            <User className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
            <input type="text" value={profile.fullName} onChange={(e) => setField("fullName", e.target.value)} className={inputCls + " ps-8"} />
          </div>
          {errors.fullName && <p className="text-[10px] text-danger-600 mt-0.5">{errors.fullName}</p>}
        </div>
        <div>
          <label className={AUTH_PANEL_LABEL_CLS}>{t("jobTitleLabel")}</label>
          <input
            type="text"
            value={profile.jobTitle}
            onChange={(e) => setField("jobTitle", e.target.value)}
            className={inputCls}
            placeholder={t("jobTitlePlaceholder")}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={AUTH_PANEL_LABEL_CLS}>{t("email")} *</label>
          <div className="relative">
            <Mail className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
            <input type="email" dir="ltr" value={profile.email} onChange={(e) => setField("email", e.target.value)} className={inputCls + " ps-8 text-start"} />
          </div>
          {errors.email && <p className="text-[10px] text-danger-600 mt-0.5">{errors.email}</p>}
        </div>
      </div>

      {!isIndividual && (
        <div className="space-y-2 rounded-none border border-surface-200 bg-surface-50/50 p-2.5">
          <div>
            <label className={AUTH_PANEL_LABEL_CLS}>{orgNameLabel} *</label>
            <input type="text" value={profile.companyName} onChange={(e) => setField("companyName", e.target.value)} className={inputCls} />
            {errors.companyName && <p className="text-[10px] text-danger-600 mt-0.5">{errors.companyName}</p>}
          </div>
          <div>
            <label className={AUTH_PANEL_LABEL_CLS}>
              {profile.platformAccountType === "ENTITY" ? t("entityType") : t("companyType")} *
            </label>
            <input
              type="text"
              value={profile.companyType}
              onChange={(e) => setField("companyType", e.target.value)}
              className={inputCls}
              placeholder={t("companyTypePlaceholder")}
            />
            {!profile.companyType.trim() && (
              <p className="text-[10px] text-amber-700 mt-0.5">{t("regTypeOtherHint")}</p>
            )}
            {errors.companyType && <p className="text-[10px] text-danger-600 mt-0.5">{errors.companyType}</p>}
          </div>
          <div>
            <label className={AUTH_PANEL_LABEL_CLS}>{t("description")}</label>
            <textarea
              value={profile.companyDescription}
              onChange={(e) => setField("companyDescription", e.target.value)}
              className={inputCls + " min-h-[72px] resize-y"}
              placeholder={t("companyDescriptionPlaceholder")}
            />
          </div>
        </div>
      )}

      {isIndividual && (
        <div>
          <label className={AUTH_PANEL_LABEL_CLS}>{t("category")} *</label>
          <input
            type="text"
            value={profile.companyType}
            onChange={(e) => setField("companyType", e.target.value)}
            className={inputCls}
            placeholder={t("companyTypePlaceholder")}
          />
          {!profile.companyType.trim() && (
            <p className="text-[10px] text-amber-700 mt-0.5">{t("regTypeOtherHint")}</p>
          )}
        </div>
      )}

      <LocationFormFields
        values={locationValues}
        onChange={handleLocationChange}
        inputCls={inputCls}
        showAddress
        phoneRequired
        countryRequired
        cityRequired
      />
      {errors.phone && <p className="text-[10px] text-danger-600">{errors.phone}</p>}

      <div>
        <label className={AUTH_PANEL_LABEL_CLS}>{t("obSelectLocation")}</label>
        <MapPicker
          value={profile.location ?? ""}
          onChange={(value, lat, lng) => {
            onChange({ ...profile, location: value, locationLat: lat, locationLng: lng });
          }}
          placeholder={mapSearchHint || t("obSelectLocation")}
          countryCode={locationValues.countryCode}
          defaultLat={profile.locationLat ?? mapCenter.lat}
          defaultLng={profile.locationLng ?? mapCenter.lng}
          defaultZoom={country.zoom}
        />
      </div>
    </div>
  );
}
