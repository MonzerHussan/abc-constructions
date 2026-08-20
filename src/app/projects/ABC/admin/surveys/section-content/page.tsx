"use client";

import { useEffect, useState } from "react";
import { PLATFORM_ACCOUNT_TYPES } from "@/lib/account-types";
import type { PlatformAccountType } from "@/lib/account-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminSection {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  content: {
    id: string;
    titleEn: string | null;
    titleAr: string | null;
    bodyEn: string | null;
    bodyAr: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    isActive: boolean;
  } | null;
}

interface AdminTemplate {
  accountType: PlatformAccountType;
  nameEn: string;
  sections: AdminSection[];
}

export default function SurveySectionContentAdminPage() {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [selectedType, setSelectedType] = useState<PlatformAccountType>("INDIVIDUAL");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    bodyEn: "",
    bodyAr: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/onboarding/survey/templates")
      .then((r) => r.json())
      .then((rows: AdminTemplate[]) => {
        setTemplates(rows);
        const t = rows.find((x) => x.accountType === selectedType) ?? rows[0];
        if (t?.sections[0]) {
          setSelectedSectionId(t.sections[0].id);
        }
      })
      .catch(() => setTemplates([]));
  }, [selectedType]);

  const template = templates.find((t) => t.accountType === selectedType);
  const section = template?.sections.find((s) => s.id === selectedSectionId);

  useEffect(() => {
    if (!section) return;
    const c = section.content;
    setForm({
      titleEn: c?.titleEn ?? "",
      titleAr: c?.titleAr ?? "",
      bodyEn: c?.bodyEn ?? "",
      bodyAr: c?.bodyAr ?? "",
      imageUrl: c?.imageUrl ?? "",
      linkUrl: c?.linkUrl ?? "",
      isActive: c?.isActive ?? true,
    });
  }, [section]);

  async function handleSave() {
    if (!selectedSectionId) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/onboarding/survey/section-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: selectedSectionId, ...form }),
    });
    setSaving(false);
    setMessage(res.ok ? "Saved" : "Failed to save");
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Survey Section Content</h1>
      <p className="text-sm text-surface-600 mb-6">
        Admin-managed text and images shown beside each survey section screen.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium">Account type</label>
          <select
            className="mt-1 w-full border px-2 py-2 text-sm"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as PlatformAccountType)}
          >
            {PLATFORM_ACCOUNT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.labelKey}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium">Section</label>
          <select
            className="mt-1 w-full border px-2 py-2 text-sm"
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
          >
            {(template?.sections ?? []).map((s) => (
              <option key={s.id} value={s.id}>{s.code} — {s.titleEn}</option>
            ))}
          </select>
        </div>

        <Input placeholder="Title (EN)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
        <Input placeholder="Title (AR)" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
        <textarea
          className="w-full border px-2 py-2 text-sm min-h-[80px]"
          placeholder="Body (EN)"
          value={form.bodyEn}
          onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
        />
        <textarea
          className="w-full border px-2 py-2 text-sm min-h-[80px]"
          placeholder="Body (AR)"
          value={form.bodyAr}
          onChange={(e) => setForm({ ...form, bodyAr: e.target.value })}
        />
        <Input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <Input placeholder="Link URL" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />

        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save section content"}</Button>
        <Button
          variant="outline"
          onClick={async () => {
            setMessage("");
            const res = await fetch("/api/admin/onboarding/survey/reseed", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accountType: selectedType }),
            });
            setMessage(res.ok ? `Reseeded ${selectedType}` : "Reseed failed");
            if (res.ok) {
              const rows = await fetch("/api/admin/onboarding/survey/templates").then((r) => r.json());
              setTemplates(rows);
            }
          }}
        >
          Reseed template
        </Button>
        {message && <p className="text-sm text-secondary-600">{message}</p>}
      </div>
    </div>
  );
}
