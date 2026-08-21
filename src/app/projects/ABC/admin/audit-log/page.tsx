"use client";

import { useState, useEffect } from "react";
import { Search, User, Building2, ChevronLeft, ChevronRight, Globe, Smartphone } from "lucide-react";
import AdminSurveyShell from "@/components/admin/AdminSurveyShell";
import { useLanguage } from "@/lib/LanguageContext";
import { AUDIT_ACTION_KEYS, AUDIT_ENTITY_KEYS } from "@/lib/admin/admin-labels";
import type { TranslationKey } from "@/lib/translations";

const ACTION_OPTIONS = Object.keys(AUDIT_ACTION_KEYS);

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "text-info-600 bg-info-50",
  LOGOUT: "text-surface-600 bg-surface-50",
  CREATE: "text-success-600 bg-success-50",
  UPDATE: "text-amber-600 bg-amber-50",
  DELETE: "text-danger-600 bg-danger-50",
  APPROVE: "text-emerald-600 bg-emerald-50",
  REJECT: "text-danger-600 bg-danger-50",
  VERIFY: "text-flagship-600 bg-flagship-50",
  SUSPEND: "text-amber-600 bg-amber-50",
  ACTIVATE: "text-teal-600 bg-teal-50",
  DEACTIVATE: "text-surface-600 bg-surface-50",
  ASSIGN_ROLE: "text-flagship-600 bg-flagship-50",
  REVOKE_ROLE: "text-danger-600 bg-danger-50",
  SUBMIT_BID: "text-info-600 bg-info-50",
  AWARD_TENDER: "text-warning-600 bg-warning-50",
  MAKE_PAYMENT: "text-warning-600 bg-warning-50",
  APPROVE_PAYMENT: "text-emerald-600 bg-emerald-50",
  UPLOAD_DOCUMENT: "text-info-600 bg-info-50",
  CREATE_CAMPAIGN: "text-flagship-600 bg-flagship-50",
  PUBLISH_CAMPAIGN: "text-flagship-600 bg-flagship-50",
  SEND_INVITATION: "text-info-600 bg-info-50",
  EXPORT_DATA: "text-surface-600 bg-surface-100",
  GENERATE_INSIGHT: "text-flagship-600 bg-flagship-50",
};

function replaceParams(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{{${key}}}`, String(value)),
    template,
  );
}

export default function AuditLogPage() {
  const { t, language } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const limit = 25;

  const locale = language === "ar" ? "ar-SA" : language === "ur" ? "ur-PK" : "en-US";

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(limit), offset: String((page - 1) * limit) });
    if (action) params.set("action", action);
    if (search) params.set("userId", search);

    fetch(`/api/admin/audit-log?${params}`)
      .then((r) => (r.ok ? r.json() : { logs: [], total: 0 }))
      .then((d) => {
        setLogs(d.logs || []);
        setTotal(d.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [action, search, page]);

  const totalPages = Math.ceil(total / limit);

  const actionLabel = (code: string) => {
    const key = AUDIT_ACTION_KEYS[code];
    return key ? t(key) : code;
  };

  const entityLabel = (entity: string) => {
    const key = AUDIT_ENTITY_KEYS[entity];
    return key ? t(key) : entity;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return t("auditLogTimeNow");
    if (diff < 3600000) {
      return replaceParams(t("auditLogTimeMinutesAgo"), { n: Math.floor(diff / 60000) });
    }
    if (diff < 86400000) {
      return replaceParams(t("auditLogTimeHoursAgo"), { n: Math.floor(diff / 3600000) });
    }
    return d.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminSurveyShell
      title={t("auditLogTitle")}
      subtitle={replaceParams(t("auditLogSubtitle"), { count: total })}
      loading={loading}
    >
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute end-3 top-2.5 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full border border-surface-200 rounded-none px-3 py-2 pe-9 text-sm"
            placeholder={t("auditLogSearchPlaceholder")}
          />
        </div>
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="border border-surface-200 rounded-none px-3 py-2 text-sm"
        >
          <option value="">{t("auditLogAllActions")}</option>
          {ACTION_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {actionLabel(key)}
            </option>
          ))}
        </select>
        <span className="text-xs text-surface-400 bg-surface-50 px-2 py-1 rounded-none">
          {replaceParams(t("auditLogResultsCount"), { count: total })}
        </span>
      </div>

      {!loading && logs.length === 0 ? (
        <div className="border border-surface-200 p-8 text-center text-surface-500 text-sm">
          {t("auditLogEmpty")}
        </div>
      ) : (
        <>
          <div className="border border-surface-200 overflow-hidden">
            <div className="divide-y divide-surface-100">
              {logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelected(selected?.id === log.id ? null : log)}
                  className={`p-4 cursor-pointer hover:bg-surface-50 transition-colors ${selected?.id === log.id ? "bg-surface-50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-none ${ACTION_COLORS[log.action] || "text-surface-600 bg-surface-100"}`}
                      >
                        {actionLabel(log.action)}
                      </span>
                      <span className="text-xs text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded-none">
                        {entityLabel(log.entity)}
                      </span>
                      {log.organization && (
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {log.organization.name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-surface-400 shrink-0">{formatDate(log.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-surface-600 flex-wrap">
                    {log.user ? (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-surface-400" />
                        {log.user.name || log.user.email}
                      </span>
                    ) : (
                      <span className="text-surface-400">—</span>
                    )}
                    {log.entityId && (
                      <span className="text-xs text-surface-400 font-mono">#{log.entityId.slice(0, 8)}</span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-surface-400">
                      <Globe className="w-3 h-3" />
                      {log.ip || "—"}
                    </span>
                  </div>

                  {selected?.id === log.id && (
                    <div className="mt-3 pt-3 border-t border-surface-100 text-sm space-y-2">
                      {log.details && (
                        <div>
                          <p className="text-xs font-medium text-surface-500 mb-1">{t("auditLogDetails")}</p>
                          <pre className="text-xs bg-surface-50 p-2 rounded-none overflow-x-auto text-surface-700">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.userAgent && (
                        <div className="flex items-center gap-1 text-xs text-surface-400">
                          <Smartphone className="w-3 h-3" />
                          {log.userAgent}
                        </div>
                      )}
                      <p className="text-xs text-surface-400 font-mono">ID: {log.id}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-surface-200 hover:bg-surface-50 disabled:opacity-30 rounded-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm rounded-none ${page === p ? "bg-secondary-100 text-secondary-700 font-medium" : "hover:bg-surface-50"}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-surface-200 hover:bg-surface-50 disabled:opacity-30 rounded-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </AdminSurveyShell>
  );
}
