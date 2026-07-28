"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { ROLES } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";

const ROLE_TRANSLATION_KEYS: Record<string, string> = {
  OWNER: "roleOwner",
  CONSULTANT: "roleConsultant",
  CONTRACTOR: "roleContractor",
  SUBCONTRACTOR: "roleSubcontractor",
  WORKSHOP: "roleWorkshop",
  FREELANCER: "roleFreelancer",
  SUPPLIER: "roleSupplier",
  TRADER: "roleTrader",
};

export default function RegisterPage() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{t("appName")}</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t("registerTitle")}</h1>
            <p className="text-gray-600 mt-1">
              {t("registerSubtitle")}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div
              className={`flex-1 h-1.5 rounded-full ${
                step >= 1 ? "bg-amber-500" : "bg-gray-200"
              }`}
            />
            <div
              className={`flex-1 h-1.5 rounded-full ${
                step >= 2 ? "bg-amber-500" : "bg-gray-200"
              }`}
            />
          </div>

          {step === 1 ? (
            <div className="space-y-5">
              <h3 className="font-medium text-gray-900">{t("registerTitle")}</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ROLES)
                  .filter(([key]) => key !== "ADMIN")
                  .map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedRole(key)}
                      className={`p-4 rounded-xl border-2 text-right transition-all ${
                        selectedRole === key
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${val.color}`}
                      >
                        {t(ROLE_TRANSLATION_KEYS[key] as any)}
                      </span>
                    </button>
                  ))}
              </div>
              <button
                onClick={() => selectedRole && setStep(2)}
                disabled={!selectedRole}
                className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("next")}
              </button>
            </div>
          ) : (
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("fullName")}
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="محمد أحمد"
                      className="w-full pr-9 pl-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("phone")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="05XXXXXXXX"
                      className="w-full pr-9 pl-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("email")}
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full pr-9 pl-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("password")}
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pr-9 pl-9 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("companyName")}
                </label>
                <input
                  type="text"
                  placeholder="اسم شركتك"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-600">
                  {t("agreeTerms")}{" "}
                  <Link href="/terms" className="text-amber-600 hover:underline">
                    {t("terms")}
                  </Link>{" "}
                  و{" "}
                  <Link href="/privacy" className="text-amber-600 hover:underline">
                    {t("privacy")}
                  </Link>
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t("back")}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  {t("createAccount")}
                </button>
              </div>
            </form>
          )}

          <p className="text-center mt-6 text-sm text-gray-600">
            {t("hasAccount")}{" "}
            <Link
              href="/auth/login"
              className="text-amber-600 font-medium hover:text-amber-700"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t("appName")}</h2>
          <p className="text-lg text-white/80 mb-6">{t("appFullName")}</p>
          <div className="space-y-4 text-right max-w-sm mx-auto">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-sm">أكثر من 2,500 مشروع</p>
                <p className="text-xs text-white/60">{t("completedProjects")} - {t("completedTenders")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">أكثر من 1,800 مقاول</p>
                <p className="text-xs text-white/60">{t("verifiedContractors")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("settings")}</p>
                <p className="text-xs text-white/60">{t("appDescription")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
