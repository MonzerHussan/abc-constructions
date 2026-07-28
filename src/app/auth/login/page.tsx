"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            <h1 className="text-2xl font-bold text-gray-900">{t("loginTitle")}</h1>
            <p className="text-gray-600 mt-1">
              {t("loginSubtitle")}
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-600">{t("rememberMe")}</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
            >
              {t("login")}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            {t("noAccount")}{" "}
            <Link
              href="/auth/register"
              className="text-amber-600 font-medium hover:text-amber-700"
            >
              {t("createAccount")}
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t("appName")}</h2>
          <p className="text-lg text-white/80 mb-2">{t("appFullName")}</p>
          <p className="text-white/60 max-w-sm">
            {t("appDescription")}
          </p>
        </div>
      </div>
    </div>
  );
}
