"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { PLATFORM_ACCOUNT_TYPES } from "@/lib/account-types";
import { useLanguage } from "@/lib/LanguageContext";

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
  const [message, setMessage] = useState("");

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
    setMessage("");
    try {
      const res = await fetch("/api/admin/onboarding/side-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, accountType: selected }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("تم الحفظ");
    } catch {
      setMessage("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-secondary-500 outline-none";

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-surface-900 mb-1">{t("obSideContentAdmin")}</h1>
      <p className="text-surface-500 mb-6 text-sm">
        محتوى الجانب الترويجي في شاشة Onboarding — حسب فئة الحساب (9 أنواع)
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {PLATFORM_ACCOUNT_TYPES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item.id)}
            className={`px-3 py-1.5 text-xs font-semibold border rounded-lg ${
              selected === item.id
                ? "bg-secondary-500 text-white border-secondary-500"
                : "bg-white text-surface-700 border-surface-300"
            }`}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-surface-500">
          <Loader2 className="w-4 h-4 animate-spin" /> {t("loading")}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 bg-white border rounded-xl p-5">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-surface-600">العنوان (AR)</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600">Title (EN)</label>
              <input className={inputCls} value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600">Subtitle (AR)</label>
              <input className={inputCls} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600">Subtitle (EN)</label>
              <input className={inputCls} value={form.subtitleEn} onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-600">النص (AR)</label>
            <textarea className={inputCls + " min-h-[100px]"} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-surface-600">Body (EN)</label>
            <textarea className={inputCls + " min-h-[100px]"} value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-surface-600">رابط الصورة</label>
              <input className={inputCls} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600">رابط الفيديو</label>
              <input className={inputCls} value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600">Poster URL</label>
              <input className={inputCls} value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-600">رابط CTA</label>
              <input className={inputCls} value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            نشط
          </label>
          {message && <p className="text-sm text-secondary-600">{message}</p>}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white text-sm font-bold rounded-lg disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("save")}
          </button>
        </form>
      )}
    </div>
  );
}
