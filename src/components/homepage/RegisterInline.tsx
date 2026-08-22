"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { X, Mail, Lock, User, Building2, Briefcase } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import AuthPanelLogo from "@/components/homepage/AuthPanelLogo"
import GoogleSignInButton from "@/components/homepage/GoogleSignInButton"
import {
  AUTH_PANEL_HEADER_SUBTITLE,
  AUTH_PANEL_HEADER_TITLE,
} from "@/components/homepage/auth-panel-styles"
import type { TranslationKey } from "@/lib/translations"
import {
  LocationFormFields,
  locationValuesToPhone,
  type LocationFieldValues,
} from "@/components/shared/LocationFormFields"
import { isValidLocalPhoneForCountry } from "@/lib/data/countries"
import { saveRegistrationPrefill } from "@/lib/onboarding/prefill-from-registration"
import { userRoleToPlatformAccountType } from "@/lib/account-types"
import {
  fetchAccountSubcategories,
  type AccountSubcategoryOption,
} from "@/lib/onboarding/account-subcategories-client"
import {
  ORG_TYPE_OTHER,
  isOrgTypeOther,
  resolveCompanyTypeForApi,
} from "@/lib/registration/org-type-select"

type RegisterInlineProps = {
  dir: "rtl" | "ltr"
  role: string
  roleLabel: string
  categoryKey: TranslationKey
  onClose: () => void
  onOpenLogin?: () => void
}

const EMPTY_REGISTER_FORM = {
  companyName: "",
  companyTypeSelect: "",
  name: "",
  jobTitle: "",
  email: "",
  password: "",
  confirmPassword: "",
}

const EMPTY_LOCATION: LocationFieldValues = {
  countryCode: "AE",
  city: "",
  address: "",
  phoneLocal: "",
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isRegisterGoogleReady(input: {
  form: typeof EMPTY_REGISTER_FORM
  location: LocationFieldValues
  isIndividual: boolean
}): boolean {
  const { form, location, isIndividual } = input
  if (!form.name.trim()) return false
  if (!form.companyTypeSelect) return false
  if (!isIndividual && !form.companyName.trim()) return false
  if (!location.countryCode || !location.city) return false
  if (!isValidLocalPhoneForCountry(location.countryCode, location.phoneLocal)) return false
  return true
}

export default function RegisterInline({
  dir,
  role,
  roleLabel,
  categoryKey,
  onClose,
  onOpenLogin,
}: RegisterInlineProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [typeOptions, setTypeOptions] = useState<AccountSubcategoryOption[]>([])
  const [typesLoading, setTypesLoading] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_REGISTER_FORM })
  const [location, setLocation] = useState<LocationFieldValues>({ ...EMPTY_LOCATION })

  const isEntity = categoryKey === "accountCategoryEntity"
  const isIndividual = categoryKey === "accountCategoryIndividual"
  const orgNameLabel = isEntity ? t("entityName") : t("companyName")
  const orgTypeLabel = isEntity ? t("entityType") : isIndividual ? t("category") : t("companyType")

  useEffect(() => {
    setForm({ ...EMPTY_REGISTER_FORM })
    setLocation({ ...EMPTY_LOCATION })
    setError("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setLoading(false)
  }, [role, categoryKey])

  useEffect(() => {
    const accountType = userRoleToPlatformAccountType(role)
    if (!accountType) {
      setTypeOptions([])
      return
    }
    setTypesLoading(true)
    fetchAccountSubcategories(accountType)
      .then(setTypeOptions)
      .finally(() => setTypesLoading(false))
  }, [role])

  function typeOptionLabel(option: AccountSubcategoryOption): string {
    if (language === "en") return option.labelEn
    if (language === "ur") return option.labelEn
    return option.labelAr
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.password.length < 8) {
      setError(t("passwordMinLength") || "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError(t("passwordMismatch"))
      return
    }
    if (!form.companyTypeSelect) {
      setError(t("regTypeRequired"))
      return
    }
    if (!isIndividual && !form.companyName.trim()) {
      setError(isEntity ? t("entityNameRequired") : t("companyNameRequired"))
      return
    }
    if (!isValidEmail(form.email)) {
      setError(t("obInvalidEmail"))
      return
    }
    if (!isValidLocalPhoneForCountry(location.countryCode, location.phoneLocal)) {
      setError(t("obInvalidPhone"))
      return
    }

    const companyType = resolveCompanyTypeForApi(form.companyTypeSelect, typeOptions, language)

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          jobTitle: form.jobTitle.trim() || undefined,
          phone: locationValuesToPhone(location),
          email: form.email,
          password: form.password,
          companyName: form.companyName,
          companyType: companyType || undefined,
          country: location.countryCode,
          city: location.city,
          role,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t("registerFailed"))
        setLoading(false)
        return
      }
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (signInResult?.error) {
        setError(t("registerSuccessLogin"))
        setLoading(false)
        return
      }
      saveRegistrationPrefill({
        name: form.name,
        jobTitle: form.jobTitle,
        email: form.email,
        phone: locationValuesToPhone(location),
        companyName: form.companyName,
        companyType: companyType,
        countryCode: location.countryCode,
        city: location.city,
        role,
      })
      onClose()
      router.push("/projects/ABC/onboarding")
    } catch {
      setError(t("registerFailed"))
      setLoading(false)
    }
  }

  const inputCls =
    "w-full rounded-none border border-surface-300 px-2.5 py-2 text-xs focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 outline-none transition"

  const googleRegisterReady = isRegisterGoogleReady({ form, location, isIndividual })

  function handleGoogleRegisterPrefill() {
    const companyType = resolveCompanyTypeForApi(form.companyTypeSelect, typeOptions, language)
    saveRegistrationPrefill({
      name: form.name,
      jobTitle: form.jobTitle,
      email: form.email,
      phone: locationValuesToPhone(location),
      companyName: form.companyName,
      companyType: companyType,
      countryCode: location.countryCode,
      city: location.city,
      role,
    })
  }

  return (
    <div
      dir={dir}
      className="w-full overflow-hidden bg-white border border-surface-200 shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2 border-b border-surface-100 px-3 py-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <AuthPanelLogo alt={t("appName")} />
          <div className="min-w-0">
            <p className={AUTH_PANEL_HEADER_TITLE}>{t("register")}</p>
            <p className={`${AUTH_PANEL_HEADER_SUBTITLE} truncate`}>{roleLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-none p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors shrink-0"
          aria-label={t("close")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-2.5 space-y-2.5">
        <form onSubmit={handleSubmit} className="space-y-2" autoComplete="off">
          {error && (
            <div className="bg-danger-50 text-danger-600 text-xs rounded-none px-3 py-2">{error}</div>
          )}

          {!isIndividual && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-[11px] font-medium text-surface-700">{orgNameLabel} *</label>
                <div className="relative">
                  <Building2 className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                  <input
                    type="text"
                    name="organization"
                    autoComplete="organization"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className={inputCls + " ps-8 pe-2"}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-0.5 block text-[11px] font-medium text-surface-700">{orgTypeLabel} *</label>
                <select
                  value={form.companyTypeSelect}
                  onChange={(e) => setForm({ ...form, companyTypeSelect: e.target.value })}
                  className={inputCls}
                  required
                  disabled={typesLoading}
                >
                  <option value="">
                    {typesLoading ? t("loading") : t("regTypeSelectPlaceholder")}
                  </option>
                  {typeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {typeOptionLabel(option)}
                    </option>
                  ))}
                  <option value={ORG_TYPE_OTHER}>{t("regTypeOther")}</option>
                </select>
                {isOrgTypeOther(form.companyTypeSelect) && (
                  <p className="mt-0.5 text-[10px] text-surface-500">{t("regTypeOtherHint")}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-surface-700">{t("fullName")} *</label>
              <div className="relative">
                <User className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls + " ps-8 pe-2"}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-surface-700">{t("jobTitleLabel")}</label>
              <div className="relative">
                <Briefcase className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                <input
                  type="text"
                  name="organization-title"
                  autoComplete="organization-title"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className={inputCls + " ps-8 pe-2"}
                  placeholder={t("jobTitlePlaceholder")}
                />
              </div>
            </div>
          </div>

          {isIndividual && (
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-surface-700">{orgTypeLabel} *</label>
              <select
                value={form.companyTypeSelect}
                onChange={(e) => setForm({ ...form, companyTypeSelect: e.target.value })}
                className={inputCls}
                required
                disabled={typesLoading}
              >
                <option value="">
                  {typesLoading ? t("loading") : t("regTypeSelectPlaceholder")}
                </option>
                {typeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {typeOptionLabel(option)}
                  </option>
                ))}
                <option value={ORG_TYPE_OTHER}>{t("regTypeOther")}</option>
              </select>
              {isOrgTypeOther(form.companyTypeSelect) && (
                <p className="mt-0.5 text-[10px] text-surface-500">{t("regTypeOtherHint")}</p>
              )}
            </div>
          )}

          <LocationFormFields
            values={location}
            onChange={setLocation}
            inputCls={inputCls}
            phoneRequired
            countryRequired
            cityRequired
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-surface-700">{t("email")} *</label>
              <div className="relative">
                <Mail className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  dir="ltr"
                  className={inputCls + " ps-8 pe-2 text-start"}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-surface-700 invisible" aria-hidden>
                Google
              </label>
              <GoogleSignInButton
                matchField
                disabled={!googleRegisterReady}
                className={inputCls}
                onBeforeSignIn={handleGoogleRegisterPrefill}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-surface-700">{t("password")} *</label>
              <div className="relative">
                <Lock className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="new-password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputCls + " ps-8 pe-10"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-secondary-600 hover:text-secondary-700"
                >
                  {showPassword ? t("hide") : t("show")}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-surface-700">{t("confirmPassword")} *</label>
              <div className="relative">
                <Lock className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm-new-password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={inputCls + " ps-8 pe-10"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-secondary-600 hover:text-secondary-700"
                >
                  {showConfirmPassword ? t("hide") : t("show")}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-2.5 min-w-0">
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-[9px] font-semibold text-surface-600 hover:text-secondary-600 whitespace-nowrap"
                >
                  {t("hasAccount")} {t("login")}
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-[11px] font-bold text-white bg-secondary-500 hover:bg-secondary-600 disabled:opacity-50 shrink-0"
            >
              {loading ? t("loading") : t("createAccount")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
