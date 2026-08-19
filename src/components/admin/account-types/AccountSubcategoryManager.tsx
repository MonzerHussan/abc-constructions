"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { PLATFORM_ACCOUNT_TYPES } from "@/lib/account-types";
import { PlatformAccountType } from "@/lib/account-types";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface SubcategoryRow {
  id: string;
  accountType: PlatformAccountType;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
  isActive: boolean;
}

export function AccountSubcategoryManager() {
  const [selectedType, setSelectedType] = useState<PlatformAccountType>(PlatformAccountType.OWNER);
  const [items, setItems] = useState<SubcategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ labelAr: "", labelEn: "" });
  const [editId, setEditId] = useState<string | null>(null);

  const load = useCallback(async (accountType: PlatformAccountType) => {
    setLoading(true);
    const res = await fetch(`/api/v1/account-types/subcategories?accountType=${accountType}`);
    const data = await res.json();
    setItems(data?.data?.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(selectedType);
  }, [selectedType, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.labelAr.trim() || !draft.labelEn.trim()) return;
    setSaving(true);
    await fetch("/api/v1/account-types/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountType: selectedType, ...draft }),
    });
    setDraft({ labelAr: "", labelEn: "" });
    await load(selectedType);
    setSaving(false);
  }

  async function handleUpdate(row: SubcategoryRow) {
    setSaving(true);
    await fetch(`/api/v1/account-types/subcategories/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labelAr: row.labelAr, labelEn: row.labelEn, isActive: row.isActive }),
    });
    setEditId(null);
    await load(selectedType);
    setSaving(false);
  }

  async function handleToggleActive(row: SubcategoryRow) {
    setSaving(true);
    await fetch(`/api/v1/account-types/subcategories/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    await load(selectedType);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذه الفئة الفرعية؟")) return;
    setSaving(true);
    await fetch(`/api/v1/account-types/subcategories/${id}`, { method: "DELETE" });
    await load(selectedType);
    setSaving(false);
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">فئات فرعية حسب نوع الحساب</h1>
        <p className="text-surface-500 text-sm mt-1">
          الأنواع الرئيسية التسعة ثابتة. أضف/عدّل/احذف الفئات الفرعية لكل نوع — تظهر في الاستبيان حسب اختيار المستخدم.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLATFORM_ACCOUNT_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedType(type.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              selectedType === type.id
                ? "bg-amber-50 border-amber-400 text-amber-800"
                : "bg-white border-surface-200 text-surface-600 hover:bg-surface-50"
            }`}
          >
            {type.id}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إضافة فئة فرعية — {selectedType}</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="الاسم بالعربية"
              value={draft.labelAr}
              onChange={(e) => setDraft((d) => ({ ...d, labelAr: e.target.value }))}
            />
            <Input
              placeholder="Label in English"
              value={draft.labelEn}
              onChange={(e) => setDraft((d) => ({ ...d, labelEn: e.target.value }))}
            />
            <Button type="submit" disabled={saving}>
              <Plus className="w-4 h-4 me-2" />
              إضافة
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الفئات الفرعية ({selectedType})</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-surface-400" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-surface-500 text-sm">لا توجد فئات فرعية بعد.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-3 border border-surface-200 rounded-xl px-4 py-3"
                >
                  {editId === row.id ? (
                    <>
                      <Input
                        className="flex-1 min-w-[140px]"
                        value={row.labelAr}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, labelAr: e.target.value } : r)),
                          )
                        }
                      />
                      <Input
                        className="flex-1 min-w-[140px]"
                        value={row.labelEn}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, labelEn: e.target.value } : r)),
                          )
                        }
                      />
                      <Button size="sm" onClick={() => handleUpdate(row)} disabled={saving}>
                        حفظ
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditId(null)}>
                        إلغاء
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-[200px]">
                        <p className="font-medium">{row.labelAr}</p>
                        <p className="text-xs text-surface-500">{row.labelEn}</p>
                      </div>
                      <Switch
                        checked={row.isActive}
                        onChange={() => handleToggleActive(row)}
                      />
                      <Button size="sm" variant="outline" onClick={() => setEditId(row.id)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleToggleActive(row)}>
                        {row.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(row.id)}>
                        <Trash2 className="w-4 h-4 text-danger-600" />
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
