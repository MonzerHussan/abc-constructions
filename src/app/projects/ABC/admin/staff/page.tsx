"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, ShieldCheck, UserPlus } from "lucide-react";
import AdminSurveyShell from "@/components/admin/AdminSurveyShell";
import { useLanguage } from "@/lib/LanguageContext";
import { isSuperAdminRole } from "@/lib/auth/platform-admin";
import type { TranslationKey } from "@/lib/translations";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_TKEYS: Record<string, TranslationKey> = {
  SUPER_ADMIN: "roleSuperAdmin",
  ADMIN: "staffRoleAdmin",
  CONTENT_ADMIN: "staffRoleContent",
  FINANCE_ADMIN: "staffRoleFinance",
};

const CREATABLE_ROLES = ["ADMIN", "CONTENT_ADMIN", "FINANCE_ADMIN"] as const;

export default function AdminStaffPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CONTENT_ADMIN" as (typeof CREATABLE_ROLES)[number],
  });

  useEffect(() => {
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session) return;
    if (!isSuperAdminRole(role)) {
      router.push("/projects/ABC?login=1");
      return;
    }
    fetch("/api/admin/staff")
      .then((r) => (r.ok ? r.json() : { staff: [] }))
      .then((d) => {
        setStaff(d.staff ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    setForm((f) => ({ ...f, name: f.name.trim(), email: f.email.trim() }));
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("create failed");
      const d = await res.json();
      setStaff((prev) => [...prev, d.staff]);
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "CONTENT_ADMIN" });
      setMessage({ kind: "ok", text: t("staffCreated") });
    } catch {
      setMessage({ kind: "err", text: t("staffCreateError") });
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(id);
  }, [message]);

  const roleTk = (role: string): TranslationKey => ROLE_TKEYS[role] ?? "roleAdmin";

  return (
    <AdminSurveyShell
      title={t("adminStaff")}
      subtitle={t("adminStaffSubtitle")}
      loading={loading}
      actions={
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-secondary-500 text-white px-4 py-2 text-sm font-semibold hover:bg-secondary-600 rounded-none"
        >
          <Plus size={18} />
          {t("staffCreateTitle")}
        </button>
      }
    >
      {message && (
        <div
          className={`mb-4 border px-4 py-3 text-sm rounded-none ${
            message.kind === "ok"
              ? "border-success-200 bg-success-50 text-success-700"
              : "border-danger-200 bg-danger-50 text-danger-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-white border border-surface-200 rounded-none p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                {t("staffName")} *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-surface-300 rounded-none px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                {t("staffEmail")} *
              </label>
              <input
                type="email"
                required
                dir="ltr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-surface-300 rounded-none px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                {t("staffPassword")} *
              </label>
              <input
                type="password"
                required
                minLength={8}
                dir="ltr"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-surface-300 rounded-none px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-500"
              />
              <p className="text-xs text-surface-400 mt-1">{t("staffPasswordMin")}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                {t("staffRoleLabel")} *
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as typeof form.role })
                }
                className="w-full border border-surface-300 rounded-none px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary-500"
              >
                {CREATABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t(roleTk(r))}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 bg-secondary-500 text-white px-5 py-2 text-sm font-semibold hover:bg-secondary-600 disabled:opacity-50 rounded-none"
            >
              <UserPlus size={16} />
              {creating ? t("loading") : t("staffCreateButton")}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-surface-300 text-surface-700 hover:bg-surface-50 rounded-none text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <h2 className="font-bold text-surface-900 mb-2">{t("staffListTitle")}</h2>
        {staff.length === 0 ? (
          <div className="border border-surface-200 bg-surface-50/80 px-4 py-8 text-center text-surface-500 rounded-none text-sm">
            {t("staffListEmpty")}
          </div>
        ) : (
          <div className="bg-white border border-surface-200 rounded-none overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b">
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">
                    {t("staffName")}
                  </th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">
                    {t("staffEmail")}
                  </th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">
                    {t("staffRoleLabel")}
                  </th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-surface-600">
                    {t("crmColDate")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {staff.map((m) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-600" dir="ltr">
                      {m.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 border border-amber-200 bg-amber-50 text-amber-700">
                        <ShieldCheck className="w-3 h-3" />
                        {t(roleTk(m.role))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-500">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminSurveyShell>
  );
}
