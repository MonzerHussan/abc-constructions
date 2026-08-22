"use client";

import { Globe, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import {
  COUNTRIES,
  formatPhoneWithDialCode,
  getCityLabel,
  getCountryByCode,
  getCountryLabel,
  resolveCountryCode,
  stripDialCode,
} from "@/lib/data/countries";

export interface LocationFieldValues {
  countryCode: string;
  city: string;
  address: string;
  phoneLocal: string;
}

interface LocationFormFieldsProps {
  values: LocationFieldValues;
  onChange: (values: LocationFieldValues) => void;
  inputCls: string;
  showAddress?: boolean;
  phoneRequired?: boolean;
  countryRequired?: boolean;
  cityRequired?: boolean;
}

export function LocationFormFields({
  values,
  onChange,
  inputCls,
  showAddress = false,
  phoneRequired = false,
  countryRequired = true,
  cityRequired = true,
}: LocationFormFieldsProps) {
  const { t, language } = useLanguage();
  const country = getCountryByCode(values.countryCode) ?? COUNTRIES[0];
  const cities = country.cities;

  function update(partial: Partial<LocationFieldValues>) {
    onChange({ ...values, ...partial });
  }

  function handleCountryChange(code: string) {
    update({
      countryCode: code,
      city: "",
    });
  }

  const selectCls = inputCls + " appearance-none bg-white";

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-0.5 block text-[11px] font-medium text-surface-700">
            {t("country")} {countryRequired && "*"}
          </label>
          <div className="relative">
            <Globe className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
            <select
              value={values.countryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={selectCls + " ps-8 pe-2"}
              required={countryRequired}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {getCountryLabel(c, language)} ({c.dialCode})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-0.5 block text-[11px] font-medium text-surface-700">
            {t("cityOrEmirate")} {cityRequired && "*"}
          </label>
          <div className="relative">
            <MapPin className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
            <select
              value={values.city}
              onChange={(e) => update({ city: e.target.value })}
              className={selectCls + " ps-8 pe-2"}
              required={cityRequired}
            >
              <option value="">{t("selectCity")}</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCityLabel(c, language)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showAddress && (
        <div>
          <label className="mb-0.5 block text-[11px] font-medium text-surface-700">{t("address")}</label>
          <input
            type="text"
            value={values.address}
            onChange={(e) => update({ address: e.target.value })}
            className={inputCls}
            placeholder={t("addressPlaceholder")}
          />
        </div>
      )}

      <div>
        <label className="mb-0.5 block text-[11px] font-medium text-surface-700">
          {t("phone")} {phoneRequired && "*"}
        </label>
        <div className="flex gap-1">
          <span className="inline-flex items-center px-2.5 py-2 text-xs font-semibold border border-surface-300 bg-surface-50 shrink-0 dir-ltr">
            {country.dialCode}
          </span>
          <div className="relative flex-1">
            <Phone className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              value={values.phoneLocal}
              onChange={(e) => update({ phoneLocal: e.target.value })}
              dir="ltr"
              className={inputCls + " ps-8 pe-2 text-start w-full"}
              placeholder="5XXXXXXXX"
              required={phoneRequired}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function locationValuesToPhone(values: LocationFieldValues): string {
  const country = getCountryByCode(values.countryCode) ?? COUNTRIES[0];
  return formatPhoneWithDialCode(country.dialCode, values.phoneLocal);
}

export function phoneToLocationValues(
  countryCode: string,
  phone: string | null | undefined,
): Pick<LocationFieldValues, "phoneLocal"> {
  const country = getCountryByCode(countryCode) ?? COUNTRIES[0];
  return { phoneLocal: stripDialCode(phone ?? "", country.dialCode) };
}

export function storageToLocationValues(
  country: string | null | undefined,
  city: string | null | undefined,
  address: string | null | undefined,
  phone: string | null | undefined,
): LocationFieldValues {
  const countryCode = resolveCountryCode(country);
  const { phoneLocal } = phoneToLocationValues(countryCode, phone);
  return {
    countryCode,
    city: city ?? "",
    address: address ?? "",
    phoneLocal,
  };
}
