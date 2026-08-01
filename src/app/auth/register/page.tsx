"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
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
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    companyName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("تم إنشاء الحساب. الرجاء تسجيل الدخول");
        setLoading(false);
        return;
      }

      router.push("/");
    } catch {
      setError("حدث خطأ أثناء إنشاء الحساب");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image src="/logo/abc-logo-mark.svg" alt={t("appName")} width={40} height={40} priority className="w-10 h-10" />
              <span className="text-xl font-bold text-surface-900">{t("appName")}</span>
            </Link>
            <h1 className="text-2xl font-bold text-surface-900">{t("registerTitle")}</h1>
            <p className="text-surface-600 mt-1">{t("registerSubtitle")}</p>
          </div>

          {/* Google Sign-Up */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-surface-300 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t("googleSignIn")}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-50 px-3 text-surface-500">{t("orContinueWith")}</span>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-amber-500" : "bg-surface-200"}`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? "bg-amber-500" : "bg-surface-200"}`} />
          </div>

          {error && (
            <div className="bg-danger-50 text-danger-600 text-sm px-4 py-2.5 rounded-xl mb-4">{error}</div>
          )}

          {step === 1 ? (
            <div className="space-y-5">
              <h3 className="font-medium text-surface-900">{t("registerTitle")}</h3>
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
                          : "border-surface-200 bg-white hover:border-surface-300"
                      }`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${val.color}`}>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("fullName")}</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="محمد أحمد" className="w-full pr-9 pl-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">{t("phone")}</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="05XXXXXXXX" className="w-full pr-9 pl-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{t("email")}</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="example@email.com" className="w-full pr-9 pl-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{t("password")}</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="••••••••" className="w-full pr-9 pl-9 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{t("companyName")}</label>
                <input type="text" value={form.companyName} onChange={(e) => setForm({...form, companyName: e.target.value})} placeholder="اسم شركتك" className="w-full px-3 py-2.5 border border-surface-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" className="w-4 h-4 mt-0.5 text-amber-500 border-surface-300 rounded focus:ring-amber-500" />
                <span className="text-sm text-surface-600">
                  {t("agreeTerms")} <Link href="/terms" className="text-amber-600 hover:underline">{t("terms")}</Link> و <Link href="/privacy" className="text-amber-600 hover:underline">{t("privacy")}</Link>
                </span>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 border border-surface-300 text-surface-700 rounded-xl font-medium hover:bg-surface-50 transition-colors">
                  {t("back")}
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50">
                  {loading ? t("loading") : t("createAccount")}
                </button>
              </div>
            </form>
          )}

          <p className="text-center mt-6 text-sm text-surface-600">
            {t("hasAccount")}{" "}
            <Link href="/auth/login" className="text-amber-600 font-medium hover:text-amber-700">{t("login")}</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="text-center text-white">
          <Image src="/logo/abc-logo-mark.svg" alt={t("appName")} width={80} height={80} priority className="w-20 h-20 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">{t("appName")}</h2>
          <p className="text-lg text-white/80 mb-6">{t("appFullName")}</p>
        </div>
      </div>
    </div>
  );
}
