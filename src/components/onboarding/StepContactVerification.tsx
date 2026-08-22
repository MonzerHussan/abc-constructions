"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Mail, Phone, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import {
  AUTH_PANEL_HEADER_SUBTITLE,
  AUTH_PANEL_HEADER_TITLE,
  AUTH_PANEL_INPUT_CLS,
  AUTH_PANEL_LABEL_CLS,
} from "@/components/homepage/auth-panel-styles";
import {
  confirmEmailCode,
  confirmPhoneCode,
  fetchContactVerificationStatus,
  sendEmailCode,
  sendPhoneCode,
  type ContactVerificationStatus,
} from "@/lib/contact-verification-client";

interface StepContactVerificationProps {
  onStatusChange: (status: { emailVerified: boolean; phoneVerified: boolean }) => void;
}

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      dir="ltr"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      className={AUTH_PANEL_INPUT_CLS + " text-center tracking-[0.35em] font-semibold"}
      placeholder="000000"
    />
  );
}

export function StepContactVerification({ onStatusChange }: StepContactVerificationProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<ContactVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);
  const [emailConfirming, setEmailConfirming] = useState(false);
  const [phoneConfirming, setPhoneConfirming] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [phoneMsg, setPhoneMsg] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [devEmailCode, setDevEmailCode] = useState<string | null>(null);
  const [devPhoneCode, setDevPhoneCode] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    const next = await fetchContactVerificationStatus();
    setStatus(next);
    onStatusChange({
      emailVerified: next.emailVerified,
      phoneVerified: next.phoneVerified,
    });
  }, [onStatusChange]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchContactVerificationStatus();
        if (cancelled) return;
        setStatus(next);
        onStatusChange({
          emailVerified: next.emailVerified,
          phoneVerified: next.phoneVerified,
        });
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onStatusChange]);

  async function handleSendEmail() {
    setEmailSending(true);
    setEmailErr("");
    setEmailMsg("");
    setDevEmailCode(null);
    try {
      const res = await sendEmailCode();
      setEmailMsg(t("obCodeSentEmail"));
      if (res.devCode) setDevEmailCode(res.devCode);
    } catch (e) {
      setEmailErr(e instanceof Error ? e.message : t("obSendCodeFailed"));
    } finally {
      setEmailSending(false);
    }
  }

  async function handleConfirmEmail() {
    setEmailConfirming(true);
    setEmailErr("");
    try {
      await confirmEmailCode(emailCode);
      setEmailCode("");
      setEmailMsg(t("obEmailVerified"));
      await refreshStatus();
    } catch (e) {
      setEmailErr(e instanceof Error ? e.message : t("obInvalidCode"));
    } finally {
      setEmailConfirming(false);
    }
  }

  async function handleSendPhone() {
    setPhoneSending(true);
    setPhoneErr("");
    setPhoneMsg("");
    setDevPhoneCode(null);
    try {
      const res = await sendPhoneCode();
      setPhoneMsg(t("obCodeSentPhone"));
      if (res.devCode) setDevPhoneCode(res.devCode);
    } catch (e) {
      setPhoneErr(e instanceof Error ? e.message : t("obSendCodeFailed"));
    } finally {
      setPhoneSending(false);
    }
  }

  async function handleConfirmPhone() {
    setPhoneConfirming(true);
    setPhoneErr("");
    try {
      await confirmPhoneCode(phoneCode);
      setPhoneCode("");
      setPhoneMsg(t("obPhoneVerified"));
      await refreshStatus();
    } catch (e) {
      setPhoneErr(e instanceof Error ? e.message : t("obInvalidCode"));
    } finally {
      setPhoneConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-secondary-500" />
      </div>
    );
  }

  const emailDone = status?.emailVerified ?? false;
  const phoneDone = status?.phoneVerified ?? false;

  return (
    <div className="space-y-3">
      <div>
        <p className={AUTH_PANEL_HEADER_TITLE}>{t("obContactVerifyTitle")}</p>
        <p className={AUTH_PANEL_HEADER_SUBTITLE}>{t("obContactVerifySubtitle")}</p>
      </div>

      {/* Email */}
      <div className="rounded-none border border-surface-200 bg-surface-50/40 p-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 text-surface-500 shrink-0" />
            <div className="min-w-0">
              <p className={AUTH_PANEL_LABEL_CLS}>{t("obVerifyEmail")}</p>
              <p className="text-[10px] text-surface-500 truncate" dir="ltr">
                {status?.emailMasked}
              </p>
            </div>
          </div>
          {emailDone && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success-600 shrink-0">
              <Check className="w-3.5 h-3.5" />
              {t("obEmailVerified")}
            </span>
          )}
        </div>

        {!emailDone && (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={emailSending}
                className="px-2.5 py-1.5 text-[11px] font-semibold border border-secondary-500 text-secondary-600 hover:bg-secondary-50 disabled:opacity-50"
              >
                {emailSending ? t("loading") : t("obSendCode")}
              </button>
            </div>
            <div>
              <label className={AUTH_PANEL_LABEL_CLS}>{t("obEnterCode")}</label>
              <div className="flex gap-2 mt-1">
                <div className="flex-1 max-w-[140px]">
                  <OtpInput value={emailCode} onChange={setEmailCode} />
                </div>
                <button
                  type="button"
                  onClick={handleConfirmEmail}
                  disabled={emailConfirming || emailCode.length !== 6}
                  className="px-3 py-1.5 text-[11px] font-bold text-white bg-secondary-500 hover:bg-secondary-600 disabled:opacity-50"
                >
                  {emailConfirming ? t("loading") : t("obVerify")}
                </button>
              </div>
            </div>
            {emailMsg && <p className="text-[10px] text-success-600">{emailMsg}</p>}
            {devEmailCode && (
              <p className="text-[10px] text-surface-500" dir="ltr">
                Dev: {devEmailCode}
              </p>
            )}
            {emailErr && <p className="text-[10px] text-danger-600">{emailErr}</p>}
          </>
        )}
      </div>

      {/* Phone */}
      <div className="rounded-none border border-surface-200 bg-surface-50/40 p-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Phone className="w-3.5 h-3.5 text-surface-500 shrink-0" />
            <div className="min-w-0">
              <p className={AUTH_PANEL_LABEL_CLS}>{t("obVerifyPhone")}</p>
              <p className="text-[10px] text-surface-500 truncate" dir="ltr">
                {status?.phoneMasked ?? t("obNoPhoneOnFile")}
              </p>
            </div>
          </div>
          {phoneDone && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success-600 shrink-0">
              <Check className="w-3.5 h-3.5" />
              {t("obPhoneVerified")}
            </span>
          )}
        </div>

        {!phoneDone && (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSendPhone}
                disabled={phoneSending || !status?.phone}
                className="px-2.5 py-1.5 text-[11px] font-semibold border border-secondary-500 text-secondary-600 hover:bg-secondary-50 disabled:opacity-50"
              >
                {phoneSending ? t("loading") : t("obSendCode")}
              </button>
            </div>
            <div>
              <label className={AUTH_PANEL_LABEL_CLS}>{t("obEnterCode")}</label>
              <div className="flex gap-2 mt-1">
                <div className="flex-1 max-w-[140px]">
                  <OtpInput value={phoneCode} onChange={setPhoneCode} disabled={!status?.phone} />
                </div>
                <button
                  type="button"
                  onClick={handleConfirmPhone}
                  disabled={phoneConfirming || phoneCode.length !== 6 || !status?.phone}
                  className="px-3 py-1.5 text-[11px] font-bold text-white bg-secondary-500 hover:bg-secondary-600 disabled:opacity-50"
                >
                  {phoneConfirming ? t("loading") : t("obVerify")}
                </button>
              </div>
            </div>
            {phoneMsg && <p className="text-[10px] text-success-600">{phoneMsg}</p>}
            {devPhoneCode && (
              <p className="text-[10px] text-surface-500" dir="ltr">
                Dev: {devPhoneCode}
              </p>
            )}
            {phoneErr && <p className="text-[10px] text-danger-600">{phoneErr}</p>}
          </>
        )}
      </div>

      {!emailDone || !phoneDone ? (
        <p className="text-[10px] text-surface-500 border border-surface-200 bg-surface-50 px-2.5 py-2">
          {t("obVerifyBothRequired")}
        </p>
      ) : null}
    </div>
  );
}

export default StepContactVerification;
