"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { PLATFORM_ACCOUNT_TYPES } from "@/lib/account-types";
import { useLanguage } from "@/lib/LanguageContext";
import AdminSurveyShell from "@/components/admin/AdminSurveyShell";

interface SideContentRow {
  accountType: string;
  type: string;
  title: string;
  titleEn: string;
  titleUr: string;
  subtitle: string;
  subtitleEn: string;
  subtitleUr: string;
  body: string;
  bodyEn: string;
  bodyUr: string;
  imageUrl: string;
  videoUrl: string;
  posterUrl: string;
  linkUrl: string;
  isActive: boolean;
}

function emptyRow(accountType: string): SideContentRow {
  return {
    accountType,
    type: "mixed",
    title: "",
    titleEn: "",
    titleUr: "",
    subtitle: "",
    subtitleEn: "",
    subtitleUr: "",
    body: "",
    bodyEn: "",
    bodyUr: "",
    imageUrl: "",
    videoUrl: "",
    posterUrl: "",
    linkUrl: "",
    isActive: true,
  };
}

export default function AdminOnboardingContentPage() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(PLATFORM_ACCOUNT_TYPES[0]?.id ?? "OWNER");
  const [form, setForm] = useState<SideContentRow>(emptyRow(selected));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/onboarding/side-content")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: SideContentRow[]) => {
        const found = rows.find((r) => r.accountType === selected);
        setForm(found ? { ...emptyRow(selected), ...found } : emptyRow(selected));
      })
      .catch(() => setForm(emptyRow(selected)))
      .finally(() => setLoading(false));
  }, [selected]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/onboarding/side-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, accountType: selected }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage({ kind: "ok", text: t("obSideSaved") });
    } catch {
      setMessage({ kind: "err", text: t("obSideSaveFailed") });
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-none border border-surface-300 px-3 py-2 text-sm focus:border-secondary-500 outline-none";
  const labelCls = "block text-xs font-medium text-surface-600 mb-1";

  return (
    <AdminSurveyShell title={t("obSideContentAdmin")} subtitle={t("obSideSubtitle")} loading={loading}>
      <div className="flex flex-wrap gap-2 mb-6">
        {PLATFORM_ACCOUNT_TYPES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item.id)}
            className={`px-3 py-1.5 text-xs font-semibold border rounded-none ${
              selected === item.id
                ? "bg-secondary-500 text-white border-secondary-500"
                : "bg-white text-surface-700 border-surface-300"
            }`}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-white border border-surface-200 rounded-none p-5 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("obSideTitleAr")}</label>
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t("obSideTitleEn")}</label>
            <input className={inputCls} value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t("obSideTitleUr")}</label>
            <input className={inputCls} value={form.titleUr} onChange={(e) => setForm({ ...form, titleUr: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t("obSideSubAr")}</label>
            <input className={inputCls} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t("obSideSubEn")}</label>
            <input className={inputCls} value={form.subtitleEn} onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t("obSideSubUr")}</label>
            <input className={inputCls} value={form.subtitleUr} onChange={(e) => setForm({ ...form, subtitleUr: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelCls}>{t("obSideBodyAr")}</label>
          <textarea className={inputCls + " min-h-[100px]"} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("obSideBodyEn")}</label>
            <textarea className={inputCls + " min-h-[100px]"} value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t("obSideBodyUr")}</label>
            <textarea className={inputCls + " min-h-[100px]"} value={form.bodyUr} onChange={(e) => setForm({ ...form, bodyUr: e.target.value })} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t("obSideImageUrl")}</label>
            <input className={inputCls} dir="ltr" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t("obSideVideoUrl")}</label>
            <input className={inputCls} dir="ltr" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t("obSidePosterUrl")}</label>
            <input className={inputCls} dir="ltr" value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{t("obSideCtaUrl")}</label>
            <input className={inputCls} dir="ltr" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          {t("obSideEnabled")}
        </label>
        {message && (
          <p className={`text-sm ${message.kind === "ok" ? "text-success-600" : "text-danger-600"}`}>{message.text}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 bg-secondary-500 text-white text-sm font-bold rounded-none disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("save")}
        </button>
      </form>
    </AdminSurveyShell>
  );
}
